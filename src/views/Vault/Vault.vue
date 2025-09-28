<template>
  <div class="flex">
    <sidebar />
    <mainView :innerContainer="640">
      <template #view>
        <div class="flex mb-2.5">
          <h1 class="text-black/50 text-3xl font-semibold">
            Welcome back, <span class="text-[#104737]">{{ auth.profile?.first_name }}</span>
          </h1>
        </div>
        <div class="w-full flex flex-col gap-2.5">
          <div v-for="(accounts, letter) in groupedAccounts" :key="letter" class="w-full">
            <div v-if="!store.accounts.loading" class="flex items-center mb-1 first:mt-0">
              <div class="text-[#aaa] text-base font-medium uppercase">{{ letter }}</div>
            </div>
            <div class="w-full">
              <div v-if="store.accounts.loading" class="w-full flex flex-col gap-1">
                <cardAccount v-for="index in 8" :key="index" :loading="store.accounts.loading" />
              </div>
              <div v-else-if="!store.accounts.loading" class="w-full flex flex-col gap-1">
                <cardAccount @click="handleAccount(account)" v-for="account in accounts" :key="account.id" :data="account" />
              </div>
            </div>
          </div>

          <!-- Messaggio quando non ci sono account -->
          <div v-if="Object.keys(groupedAccounts).length === 0 && !store.accounts.loading" class="text-center py-8 text-gray-500">
            <p class="text-lg font-semibold">Nessun account salvato</p>
            <p class="text-sm font-normal">Aggiungi il tuo primo account per iniziare</p>
          </div>
        </div>
      </template>
    </mainView>
  </div>

  <modal v-if="store.modals.newAccount.open" :header="true" :footer="true" :closable="true" modalKey="newAccount" head="Aggiungi un nuovo account">
    <template #body>
      <form @submit.prevent class="p-4 md:p-5">
        <div class="w-full flex flex-col gap-4 mb-4">
          <div class="w-full grid grid-cols-2 gap-4">
            <kyInput v-model="store.modals.newAccount.data.name" type="text" label="Name" forLabel="name" />
            <kyInput v-model="store.modals.newAccount.data.username" type="text" label="Username" forLabel="username" />
          </div>
          <kyInput v-model="store.modals.newAccount.data.email" type="email" label="Email" forLabel="email" />
          <kyInput v-model="store.modals.newAccount.data.password" type="password" label="Password" forLabel="password" />
          <kyTextarea
            v-model="store.modals.newAccount.data.notes"
            label="Account notes"
            placeholder="Write account notes here"
            forLabel="account_notes"
          />
        </div>
      </form>
    </template>
    <template #footer>
      <kyButton @click="store.modals.newAccount.open = false" type="button" variant="tertiary" label="Cancel" />
      <kyButton @click="actionAddAccount" type="submit" variant="primary-core" label="Save" :loading="store.modals.newAccount.loading" />
    </template>
  </modal>
  <modal v-if="store.modals.account.open" :header="true" :footer="false" :closable="true" modalKey="account" :head="store.modals.account.data?.name">
    <template #body>
      <div class="card-info w-full flex gap-3 items-center justify-start">
        <div class="account-image relative h-19 aspect-square rounded-[20px] flex-none bg-[#e8e8e8]">
          <img
            v-if="store.modals.account.data?.website_logo"
            :src="store.modals.account.data?.website_logo"
            alt="Account image"
            loading="lazy"
            class="nrm z-20 w-full h-full rounded-2xl object-cover"
          />
        </div>
        <div class="account-data relative w-full flex flex-col gap-[2px]">
          <h2 class="text-black text-xl font-semibold">{{ store.modals.account.data?.name || 'Account senza nome' }}</h2>
          <div class="flex gap-1 items-center">
            <kyIconButton
              @click="actionFavorites(store.modals.account.data)"
              type="button"
              :variant="store.modals.account.data?.isFavorite ? 'primary-core' : 'tertiary'"
              size="small"
              icon="Heart"
              class="favorites-button"
              :class="{ favorites: store.modals.account.data?.isFavorite }"
            />
            <kyIconButton type="button" variant="tertiary" size="small" icon="SquareArrowOutUpRight" />
            <kyIconButton type="button" variant="secondary" size="small" icon="Ellipsis" class="ml-auto" />
          </div>
        </div>
      </div>
    </template>
    <template #footer></template>
  </modal>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { store } from '../../data/store';
import { encryptPasswordWithVaultKey, decryptPasswordWithVaultKey, decryptPasswordLegacy, clearSensitiveData } from '../../lib/crypto';

import sidebar from '../../components/sidebar/sidebar.vue';
import mainView from '../../components/global/main-view.vue';
import cardAccount from '../../components/card/card-account.vue';
import modal from '../../components/modal/modal.vue';
import kyInput from '../../components/input/ky-input.vue';
import kyTextarea from '../../components/input/ky-textarea.vue';
import kyButton from '../../components/button/ky-button.vue';
import kyIconButton from '../../components/button/ky-iconbutton.vue';

export default {
  name: 'Vault',
  components: {
    sidebar,
    mainView,
    cardAccount,
    modal,
    kyInput,
    kyTextarea,
    kyButton,
    kyIconButton,
  },
  data() {
    return {
      auth,
      store,
      sensitiveDataTimers: new Map(), // Timer per la pulizia automatica
    };
  },
  computed: {
    groupedAccounts() {
      if (!this.store.accounts.data || this.store.accounts.data.length === 0) {
        return {};
      }

      // Raggruppa gli account per lettera iniziale del nome
      const grouped = this.store.accounts.data.reduce((acc, account) => {
        const firstLetter = (account.name || '').charAt(0).toUpperCase();
        const letter = firstLetter.match(/[A-Z]/) ? firstLetter : '#'; // Usa '#' per caratteri non alfabetici

        if (!acc[letter]) {
          acc[letter] = [];
        }
        acc[letter].push(account);
        return acc;
      }, {});

      // Ordina gli account all'interno di ogni gruppo
      Object.keys(grouped).forEach((letter) => {
        grouped[letter].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it', { sensitivity: 'base' }));
      });

      // Ordina le lettere alfabeticamente (# alla fine)
      const sortedGrouped = {};
      const sortedLetters = Object.keys(grouped).sort((a, b) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b, 'it');
      });

      sortedLetters.forEach((letter) => {
        sortedGrouped[letter] = grouped[letter];
      });

      return sortedGrouped;
    },
  },
  methods: {
    // Verifica che la vault key sia disponibile nello store
    ensureVaultKey() {
      if (!this.store.security.vaultKey || !this.store.security.isUnlocked) {
        throw new Error('Vault non sbloccato. Effettua nuovamente il login.');
      }

      return this.store.security.vaultKey;
    },

    clearAccountSensitiveData(account, index) {
      // Pulisce i dati sensibili dall'account
      clearSensitiveData(account, ['tempDecryptedPassword']);

      // Cancella il timer se esistente
      if (this.sensitiveDataTimers.has(index)) {
        clearTimeout(this.sensitiveDataTimers.get(index));
        this.sensitiveDataTimers.delete(index);
      }
    },
    setSensitiveDataTimer(account, index, delay = 5000) {
      // Cancella il timer precedente se esiste
      if (this.sensitiveDataTimers.has(index)) {
        clearTimeout(this.sensitiveDataTimers.get(index));
      }

      // Imposta un nuovo timer
      const timer = setTimeout(() => {
        this.clearAccountSensitiveData(account, index);
        account.showPassword = false;
        this.sensitiveDataTimers.delete(index);
      }, delay);

      this.sensitiveDataTimers.set(index, timer);
    },
    openNewAccountModal() {
      this.store.modals.newAccount.open = true;
    },
    handleAccount(account) {
      const ACCOUNT_ID = account.id;

      if (!ACCOUNT_ID) {
        return;
      }

      this.$router.push(`/vault#${ACCOUNT_ID}`);
      this.store.modals.account.data = account;
      this.store.modals.account.open = true;
    },

    async loadAccounts() {
      this.store.accounts.loading = true;

      if (!this.auth.profile || !this.auth.profile.id) {
        this.store.accounts.loading = false;
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vault_entries')
          .select('id, name, email, password, password_salt, notes')
          .eq('profile_id', this.auth.profile.id);

        if (!error) {
          // console.log(data);
          this.store.accounts.data = data;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.store.accounts.loading = false;
      }
    },
    async getAccount(accountId) {
      this.store.modals.account.loading = true;

      try {
        // Carica i dati dell'account
        const { data: accountData, error: accountError } = await supabase.from('vault_entries').select('*').eq('id', accountId).single();

        if (!accountError && accountData) {
          this.store.modals.account.data = accountData;

          // Controlla se l'account è tra i preferiti
          const { data: favoriteData, error: favoriteError } = await supabase
            .from('favorites')
            .select('id')
            .eq('profile_id', this.auth.profile.id)
            .eq('account_id', accountId)
            .maybeSingle();

          // Imposta lo stato dei preferiti
          this.store.modals.account.data.isFavorite = !favoriteError && favoriteData;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.store.modals.account.loading = false;
      }
    },
    async actionAddAccount() {
      this.store.modals.newAccount.loading = true;

      if (!this.auth.profile.id) {
        this.store.modals.newAccount.loading = false;
        return;
      }

      try {
        // Usa la vault key già derivata durante il login
        const vaultKey = this.ensureVaultKey();

        // Usa la nuova funzione con vault key derivata
        const encryptionResult = encryptPasswordWithVaultKey(this.store.modals.newAccount.data.password, vaultKey);

        const { error } = await supabase.from('vault_entries').insert({
          profile_id: this.auth.profile.id,
          name: this.store.modals.newAccount.data.name,
          email: this.store.modals.newAccount.data.email,
          password: encryptionResult.encryptedPassword,
          password_salt: encryptionResult.passwordSalt,
          notes: this.store.modals.newAccount.data.notes,
        });

        if (!error) {
          await this.loadAccounts();
          this.store.modals.newAccount.open = false;
        }
      } catch (e) {
        console.error(e);
        if (e.message.includes('Vault non sbloccato')) {
          alert('Sessione scaduta. Effettua nuovamente il login.');
          this.$router.push({ name: 'signin' });
        } else {
          // eslint-disable-next-line quotes
          alert("Errore nell'aggiunta dell'account.");
        }
      } finally {
        this.store.modals.newAccount.loading = false;
      }
    },
    async togglePasswordVisibility(account, index) {
      if (!this.store.security.isUnlocked && !this.store.security.vaultKey) {
        return;
      }

      if (account.showPassword) {
        // Nasconde la password e pulisce i dati sensibili
        this.clearAccountSensitiveData(account, index);
        account.showPassword = false;
      } else {
        // Mostra la password decrittografandola temporaneamente
        try {
          // Usa la vault key già derivata durante il login
          const vaultKey = this.ensureVaultKey();

          let decryptedPassword;

          // Prova prima con il nuovo metodo (con password_salt)
          if (account.password_salt) {
            decryptedPassword = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
          } else {
            // Fallback per i dati legacy (senza password_salt)
            decryptedPassword = decryptPasswordLegacy(account.password, vaultKey);
          }

          account.tempDecryptedPassword = decryptedPassword;
          account.showPassword = true;

          const timeoutShowPassword = 15000; // 15 secondi

          // Imposta un timer per nascondere automaticamente la password dopo 30 secondi
          this.setSensitiveDataTimer(account, index, timeoutShowPassword);
        } catch (e) {
          console.error(e);
        }
      }
    },
    async copyPasswordToClipboard(account) {
      try {
        // Usa la vault key già derivata durante il login
        const vaultKey = this.ensureVaultKey();

        let passwordToCopy;

        // Decrittografa temporaneamente per la copia
        if (account.password_salt) {
          passwordToCopy = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
        } else {
          passwordToCopy = decryptPasswordLegacy(account.password, vaultKey);
        }

        await navigator.clipboard.writeText(passwordToCopy);

        // Pulisce immediatamente la password dalla memoria locale
        passwordToCopy = null;

        // Mostra un feedback visivo (opzionale)
        // this.showCopyFeedback();
      } catch (err) {
        console.error('Errore nella copia:', err);
        if (err.message.includes('Vault non sbloccato')) {
          alert('Sessione scaduta. Effettua nuovamente il login.');
          this.$router.push({ name: 'signin' });
        } else {
          alert('Errore nella copia della password.');
        }
      }
    },
    async deleteAccount(account, accountIndex) {
      const confirmMessage = `Sei sicuro di voler eliminare l'account "${account.name}"?\n\nQuesta azione è irreversibile.`;

      if (!confirm(confirmMessage)) {
        return; // L'utente ha annullato
      }

      try {
        const { error } = await supabase.from('vault_entries').delete().eq('id', account.id).eq('profile_id', this.auth.profile.id);

        if (!error) {
          // Pulisci eventuali dati sensibili prima di rimuovere
          this.clearAccountSensitiveData(account, accountIndex);
          await this.loadAccounts();
        }
      } catch (e) {
        console.error(e);
        console.log('Errore durante');
      }
    },
    async actionFavorites(account) {
      const profileId = this.auth.profile.id;
      const accountId = account.id;

      if (!profileId || !accountId) {
        return;
      }

      try {
        if (account.isFavorite) {
          // Rimuovi dai preferiti
          const { error } = await supabase.from('favorites').delete().eq('profile_id', profileId).eq('account_id', accountId);

          if (!error) {
            account.isFavorite = false;
          }
        } else {
          // Aggiungi ai preferiti
          const { error } = await supabase.from('favorites').insert({
            profile_id: profileId,
            account_id: accountId,
          });

          if (!error) {
            account.isFavorite = true;
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  watch: {
    'store.security.isUnlocked': {
      handler(value) {
        if (value && this.auth.profile) {
          this.loadAccounts();
        }
      },
      deep: true,
    },
    '$route.hash': {
      handler(value) {
        if (value) {
          const accountId = value.replace('#', '');
          this.store.modals.account.id = accountId;
          this.getAccount(accountId);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  async mounted() {
    // Prova a ripristinare dal sessionStorage
    if (!this.store.security.isUnlocked && this.auth.isAuthenticated) {
      // console.log('🔄 Trying to restore vault from sessionStorage...');
      this.store.restoreVaultFromSession();
      // console.log('- store.security.isUnlocked after restore:', this.store.security.isUnlocked);
    }

    // Carica gli account solo se sbloccato E profilo disponibile
    if (this.store.security.isUnlocked && this.auth.profile) {
      // console.log('✅ Calling loadAccounts from mounted');
      await this.loadAccounts();
    } else {
      // console.log('❌ Not calling loadAccounts:');
    }
  },
  beforeUnmount() {
    // Pulisce tutti i timer quando il componente viene distrutto
    this.sensitiveDataTimers.forEach((timer) => clearTimeout(timer));
    this.sensitiveDataTimers.clear();

    // Opzionale: pulisce la vault key se l'utente naviga via
    // sessionStorage.removeItem('vaultKey');
  },
};
</script>

<style scoped></style>
