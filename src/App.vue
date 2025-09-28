<template>
  <div>
    <RouterView @load-accounts="loadAccounts" />
    <div
      v-if="ENV === 'debug' && false"
      class="fixed z-[99999] top-3 right-3 p-2 px-4 font-semibold uppercase border border-dashed border-red-500 bg-red-500/30"
    >
      {{ ENV === 'debug' ? 'In testing environment' : 'in production environment' }}
    </div>

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
  </div>
</template>

<script>
import { supabase } from './lib/supabase';
import { auth } from './data/auth';
import { store } from './data/store';
import { decryptAES } from './lib/crypto';
import { SessionManager } from './lib/sessionManager';

import modal from './components/modal/modal.vue';
import kyIconButton from './components/button/ky-iconbutton.vue';

export default {
  name: 'App',
  components: {
    modal,
    kyIconButton,
  },
  data() {
    return {
      auth,
      store,
      ENV: import.meta.env.VITE_ENV,
    };
  },
  methods: {
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
    async loadAccounts() {
      this.store.accounts.loading = true;

      if (!this.auth.profile || !this.auth.profile.id) {
        this.store.accounts.loading = false;
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vault_entries')
          .select('id, name, email, password, password_salt, notes, website_logo')
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
            this.store.emitFavoritesUpdate();
          }
        } else {
          // Aggiungi ai preferiti
          const { error } = await supabase.from('favorites').insert({
            profile_id: profileId,
            account_id: accountId,
          });

          if (!error) {
            account.isFavorite = true;
            this.store.emitFavoritesUpdate();
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
        if (value && this.auth.profile) {
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
