<template>
  <div>
    <RouterView @load-accounts="loadAccounts" />
    <div
      v-if="ENV === 'debug' && false"
      class="fixed z-[99999] top-3 right-3 p-2 px-4 font-semibold uppercase border border-dashed border-red-500 bg-red-500/30"
    >
      {{ ENV === 'debug' ? 'In testing environment' : 'in production environment' }}
    </div>

    <modal v-if="store.modals.newAccount.open" :header="true" :footer="true" :closable="true" modalKey="newAccount" head="Aggiungi un nuovo account">
      <template #body>
        <form @submit.prevent>
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
    <modal
      v-if="store.modals.account.open"
      :header="true"
      :footer="false"
      :closable="true"
      modalKey="account"
      :head="store.modals.account.data?.name"
    >
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
                icon="Star"
                class="favorites-button"
                :class="{ favorites: store.modals.account.data?.isFavorite }"
              />
              <kyIconButton v-if="false" type="button" variant="tertiary" size="small" icon="SquareArrowOutUpRight" />
              <dropdown position="bottom-right" class="ml-auto">
                <template #trigger>
                  <kyIconButton type="button" variant="secondary" size="small" icon="Ellipsis" class="ml-auto" />
                </template>
                <template #options>
                  <dropdownItem icon="Pencil" label="Modifica" />
                  <dropdownItem @click="deleteAccount(store.modals.account.data)" type="destructive" icon="Trash2" label="Elimina" />
                </template>
              </dropdown>
            </div>
          </div>
        </div>
        <div class="w-full mt-6 flex flex-col gap-4">
          <kyGrouped>
            <kyInputCopy
              v-if="store.modals.account.data?.email"
              type="email"
              label="Email address"
              :value="store.modals.account.data?.email"
              :grouped="true"
            />
            <kyInputCopy
              v-if="store.modals.account.data?.password"
              :type="store.modals.account.data?.showPassword ? 'text' : 'password'"
              label="Password"
              :value="store.modals.account.data?.showPassword ? store.modals.account.data?.tempDecryptedPassword : '••••••••••'"
              :grouped="true"
              @copy-password-to-clipboard="copyPasswordToClipboard"
              @show-password="togglePasswordVisibility"
            />
          </kyGrouped>
          <kyInputCopy v-if="store.modals.account.data?.username" type="text" label="Username" :value="store.modals.account.data?.username" />
          <kyInputCopy
            v-if="store.modals.account.data?.notes"
            type="notes"
            label="Notes"
            :value="store.modals.account.data?.notes"
            :copiable="false"
          />
          <p v-if="store.modals.account.data?.updated_at">
            Ultima modifica {{ formatUpdatedDate(store.modals.account.data?.updated_at, { showTime: true }) }}
          </p>
          <p v-else-if="!store.modals.account.data?.updated_at">
            Creato il {{ formatCreatedDate(store.modals.account.data?.created_at, { showTime: true }) }}
          </p>
        </div>
      </template>
      <template #footer></template>
    </modal>
  </div>
</template>

<script>
import { supabase } from './lib/supabase';
import { auth } from './data/auth';
import { store } from './data/store';
import { decryptAES } from './lib/crypto';
import { SessionManager } from './lib/sessionManager';
import { encryptPasswordWithVaultKey, decryptPasswordWithVaultKey, decryptPasswordLegacy } from './lib/crypto';
import { generateAvatarFallback, AvatarSizes } from './lib/avatar';
import { deleteAccount, toggleFavorite } from './lib/vaultOperations';
import { formatCreatedDate, formatUpdatedDate } from './lib/dateUtils';

import modal from './components/modal/modal.vue';
import kyInput from './components/input/ky-input.vue';
import kyTextarea from './components/input/ky-textarea.vue';
import kyButton from './components/button/ky-button.vue';
import kyIconButton from './components/button/ky-iconbutton.vue';
import dropdown from './components/dropdown/dropdown.vue';
import dropdownItem from './components/dropdown/dropdown-item.vue';
import kyGrouped from './components/button/ky-grouped.vue';
import kyInputCopy from './components/button/ky-input-copy.vue';

export default {
  name: 'App',
  components: {
    modal,
    kyInput,
    kyTextarea,
    kyButton,
    kyIconButton,
    dropdown,
    dropdownItem,
    kyGrouped,
    kyInputCopy,
  },
  data() {
    return {
      auth,
      store,
      ENV: import.meta.env.VITE_ENV,

      sensitiveDataTimers: new Map(),
    };
  },
  methods: {
    formatCreatedDate,
    formatUpdatedDate,

    // Verifica che la vault key sia disponibile nello store
    ensureVaultKey() {
      if (!this.store.security.vaultKey || !this.store.security.isUnlocked) {
        throw new Error('Vault non sbloccato. Effettua nuovamente il login.');
      }

      return this.store.security.vaultKey;
    },
    handleResize() {
      if (window.innerWidth < 768) {
        this.store.sidebar.open = false;
      }
    },
    clearVaultData() {
      sessionStorage.removeItem('encryptedVaultKey');
      this.store.security.vaultKey = null;
      this.store.security.isVaultUnlocked = false;
      if (this.store.security.autoLockTimer) {
        clearTimeout(this.store.security.autoLockTimer);
        this.store.security.autoLockTimer = null;
      }
    },
    setSensitiveDataTimer(account, index, delay = 5000) {
      if (this.sensitiveDataTimers.has(index)) {
        clearTimeout(this.sensitiveDataTimers.get(index));
      }

      const timer = setTimeout(() => {
        this.clearAccountSensitiveData(account, index);
        account.showPassword = false;
        this.sensitiveDataTimers.delete(index);
      }, delay);

      this.sensitiveDataTimers.set(index, timer);
    },
    clearAccountSensitiveData(account) {
      if (account.tempDecryptedPassword) {
        // Sovrascrivi la password temporanea con caratteri casuali prima di eliminarla
        account.tempDecryptedPassword = Array(account.tempDecryptedPassword.length)
          .fill(0)
          .map(() => Math.random().toString(36))
          .join('');
        account.tempDecryptedPassword = null;
      }
    },

    async getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error) {
          // console.log(data);

          this.auth.user = data.user;
          this.auth.isAuthenticated = true;

          localStorage.setItem('isAuthenticated', true);

          await this.getSession();
          await this.getProfile();
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!error) {
          // console.log(data);
          this.auth.session = data.session;
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getProfile() {
      if (!this.auth.user?.id) return;

      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('user_id', this.auth.user.id).maybeSingle();

        if (!error) {
          this.auth.profile = data;
        }
      } catch (e) {
        console.error(e);
      }
    },
    async restoreVaultKey() {
      // Non fare controlli di autenticazione per le rotte di onboarding
      const onboardingRoutes = ['/identity/signin', '/identity/signup', '/identity/verify', '/identity/forgot-password', '/identity/reset-password'];

      if (onboardingRoutes.includes(this.$route.path)) {
        return;
      }

      if (!this.auth.session?.access_token) {
        this.$router.push({ name: 'signin' });
        return;
      }

      try {
        const encryptedVaultKey = sessionStorage.getItem('encryptedVaultKey');
        if (!encryptedVaultKey) {
          this.$router.push({ name: 'signin' });
          return;
        }

        const vaultKey = await decryptAES(encryptedVaultKey, this.auth.session.access_token);
        this.store.unlockVault(vaultKey);
      } catch (e) {
        console.error(e);
        SessionManager.clearAllData();
        this.$router.push({ name: 'signin' });
      }
    },
    async actionAddAccount() {
      this.store.modals.newAccount.loading = true;

      if (!this.auth.profile.id) {
        this.store.modals.newAccount.loading = false;
        return;
      }

      const CURRENT_ROUTE = this.$route.path;

      try {
        // Usa la vault key già derivata durante il login
        const vaultKey = this.ensureVaultKey();

        // Usa la nuova funzione con vault key derivata
        const encryptionResult = encryptPasswordWithVaultKey(this.store.modals.newAccount.data.password, vaultKey);

        const websiteLogo = generateAvatarFallback(this.store.modals.newAccount.data.name, AvatarSizes.LARGE);

        const { error } = await supabase.from('vault_entries').insert({
          profile_id: this.auth.profile.id,
          name: this.store.modals.newAccount.data.name,
          email: this.store.modals.newAccount.data.email,
          password: encryptionResult.encryptedPassword,
          password_salt: encryptionResult.passwordSalt,
          notes: this.store.modals.newAccount.data.notes,
          website_logo: websiteLogo,
        });

        if (!error) {
          this.store.modals.newAccount.open = false;
          await this.loadAccounts();

          if (CURRENT_ROUTE !== '/vault') {
            this.$router.push({ name: 'vault' });
          }
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
    async loadAccounts() {
      this.store.accounts.loading = true;

      if (!this.auth.profile || !this.auth.profile.id) {
        this.store.accounts.loading = false;
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vault_entries')
          .select('id, name, email, password, password_salt, notes, website_logo, created_at, updated_at')
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
    async actionFavorites(account) {
      const success = await toggleFavorite(account, () => {
        this.store.emitFavoritesUpdate();
      });

      if (!success) {
        console.error('Operazione sui preferiti fallita');
      }
    },
    async deleteAccount(account) {
      const success = await deleteAccount(account, async () => {
        await this.loadAccounts();
        this.store.modals.account.open = false;
      });

      if (!success) {
        console.error('Eliminazione fallita');
      }
    },
    async copyPasswordToClipboard() {
      const account = this.store.modals.account.data;

      try {
        const vaultKey = this.ensureVaultKey();

        let passwordToCopy;

        if (account.password_salt) {
          passwordToCopy = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
        } else {
          passwordToCopy = decryptPasswordLegacy(account.password, vaultKey);
        }

        await navigator.clipboard.writeText(passwordToCopy);
        passwordToCopy = null;
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
    async togglePasswordVisibility(index = 0) {
      if (!this.store.security.isUnlocked && !this.store.security.vaultKey) {
        return;
      }

      const account = this.store.modals.account.data;

      if (account.showPassword) {
        this.clearAccountSensitiveData(account);
        account.showPassword = false;

        // Cancella il timer se esiste
        if (this.sensitiveDataTimers.has(index)) {
          clearTimeout(this.sensitiveDataTimers.get(index));
          this.sensitiveDataTimers.delete(index);
        }
        return; // Esci dalla funzione dopo aver nascosto la password
      }

      // Se la password non è visibile, mostrala
      try {
        const vaultKey = this.ensureVaultKey();

        let decryptedPassword;

        if (account.password_salt) {
          decryptedPassword = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
        } else {
          decryptedPassword = decryptPasswordLegacy(account.password, vaultKey);
        }

        account.tempDecryptedPassword = decryptedPassword;
        account.showPassword = true;

        const timeoutShowPassword = 10000; // 10 secondi
        this.setSensitiveDataTimer(account, index, timeoutShowPassword);
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
        if (value && this.auth.profile) {
          const accountId = value.replace('#', '');
          this.store.modals.account.id = accountId;
          this.getAccount(accountId);
        }
      },
      immediate: true,
      deep: true,
    },
    'store.modals.account.open': {
      handler(value) {
        if (!value && this.$route.hash) {
          // Rimuovi solo l'hash dalla URL corrente invece di fare push della stessa rotta
          this.$router.replace({
            path: this.$route.path,
            query: this.$route.query,
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  async mounted() {
    this.handleResize();
    await this.getUser();

    if (this.auth.isAuthenticated) {
      await this.restoreVaultKey();
    }

    // Carica gli account solo se sbloccato E profilo disponibile
    if (this.store.security.isUnlocked && this.auth.profile) {
      // console.log('✅ Calling loadAccounts from mounted');
      await this.loadAccounts();
    } else {
      // console.log('❌ Not calling loadAccounts:');
    }

    window.addEventListener('load', () => {
      this.loading = false;
    });

    window.addEventListener('resize', this.handleResize);
  },
  beforeMount() {
    window.removeEventListener('load', () => {
      this.loading = false;
    });

    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style></style>
