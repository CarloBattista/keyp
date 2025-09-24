<template>
  <div>
    <RouterView />
    <div
      v-if="ENV === 'debug'"
      class="fixed z-[99999] top-3 right-3 p-2 px-4 font-semibold uppercase border border-dashed border-red-500 bg-red-500/30"
    >
      {{ ENV === 'debug' ? 'In testing environment' : 'in production environment' }}
    </div>
  </div>
</template>

<script>
import { supabase } from './lib/supabase';
import { auth } from './data/auth';
import { store } from './data/store';
import { decryptAES } from './lib/crypto';
import { SessionManager } from './lib/sessionManager';

export default {
  name: 'App',
  data() {
    return {
      auth,
      store,
      ENV: import.meta.env.VITE_ENV,
    };
  },
  methods: {
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
  },
  async mounted() {
    await this.getUser();

    if (this.auth.isAuthenticated) {
      await this.restoreVaultKey();
    }

    window.addEventListener('load', () => {
      this.loading = false;
    });
  },
  beforeMount() {
    window.removeEventListener('load', () => {
      this.loading = false;
    });
  },
};
</script>

<style></style>
