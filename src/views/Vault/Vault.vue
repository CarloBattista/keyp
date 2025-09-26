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
          <cardAccount @click="handleAccount(account)" v-for="account in store.accounts.data" :key="account.id" :data="account" />
        </div>
      </template>
    </mainView>
    <mainView v-if="false" :innerContainer="640">
      <template #view>
        <div class="flex mb-6">
          <h1 class="text-xl font-semibold">Ciao, {{ auth.profile?.first_name }} (FOR TESTING)</h1>
        </div>
        <!-- Lista degli account -->
        <div class="flex flex-col gap-4">
          <div
            @click="handleAccount(account)"
            v-for="(account, accountIndex) in store.accounts.data"
            :key="account.id"
            class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">{{ account?.name || 'Account senza nome' }}</h3>
                <p class="text-gray-600 text-sm mb-2">{{ account?.email }}</p>
                <div class="flex items-center gap-2">
                  <input
                    :type="account?.showPassword ? 'text' : 'password'"
                    :value="account?.tempDecryptedPassword || '••••••••'"
                    readonly
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-2 py-1 w-48"
                  />
                  <button @click.stop="togglePasswordVisibility(account, accountIndex)" class="text-gray-500 hover:text-gray-700 cursor-pointer">
                    <svg v-if="!account.showPassword" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path
                        fill-rule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clip-rule="evenodd"
                      ></path>
                      <path
                        d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                      ></path>
                    </svg>
                  </button>
                  <button
                    @click.stop="copyPasswordToClipboard(account, accountIndex)"
                    class="text-gray-500 hover:text-gray-700 cursor-pointer"
                    title="Copia password"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                    </svg>
                  </button>
                  <button
                    @click.stop="deleteAccount(account, accountIndex)"
                    class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 cursor-pointer"
                    title="Elimina account"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </div>
                <p v-if="account?.notes" class="text-gray-500 text-xs mt-2">{{ account?.notes }}</p>
              </div>
              <div class="text-xs text-gray-400">
                {{ account?.created_at }}
              </div>
            </div>
          </div>
        </div>
        <!-- Messaggio quando non ci sono account -->
        <div v-if="!store.accounts.data || store.accounts.data.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Nessun account salvato</h3>
          <p class="text-gray-500 mb-4">Inizia aggiungendo il tuo primo account al vault.</p>
          <button @click="openNewAccountModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Aggiungi il primo account
          </button>
        </div>
      </template>
    </mainView>
  </div>

  <modal v-if="store.modals.newAccount.open" :header="true" :footer="true" :closable="true" modalKey="newAccount" head="Aggiungi un nuovo account">
    <template #body>
      <form @submit.prevent class="p-4 md:p-5">
        <div class="w-full flex flex-col gap-4 mb-4">
          <div class="w-full grid grid-cols-2 gap-4">
            <div>
              <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
              <input
                v-model="store.modals.newAccount.data.name"
                type="text"
                name="name"
                id="name"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>
            <div>
              <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
              <input
                v-model="store.modals.newAccount.data.username"
                type="text"
                name="username"
                id="username"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>
          </div>
          <div class="col-span-2">
            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
            <input
              v-model="store.modals.newAccount.data.email"
              type="email"
              name="email"
              id="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            />
          </div>
          <div class="col-span-2">
            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <input
              v-model="store.modals.newAccount.data.password"
              type="password"
              name="password"
              id="password"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            />
          </div>
          <div class="col-span-2">
            <label for="notes" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Account Notes</label>
            <textarea
              v-model="store.modals.newAccount.data.notes"
              id="notes"
              rows="4"
              class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Write account notes here"
            ></textarea>
          </div>
        </div>
      </form>
    </template>
    <template #footer>
      <button
        @click="actionAddAccount"
        type="submit"
        class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
        Add new account
      </button>
    </template>
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

export default {
  name: 'Vault',
  components: {
    sidebar,
    mainView,
    cardAccount,
    modal,
  },
  data() {
    return {
      auth,
      store,
      sensitiveDataTimers: new Map(), // Timer per la pulizia automatica
    };
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

      this.$router.push({ name: 'edit-vault', params: { id: ACCOUNT_ID } });
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
