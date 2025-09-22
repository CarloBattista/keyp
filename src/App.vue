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
import { deriveVaultKeyWithSecret } from './lib/crypto';

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
    async getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error) {
          // console.log(data);

          this.auth.user = data.user;
          this.auth.isAuthenticated = true;

          localStorage.setItem('isAuthenticated', true);

          this.getSession();
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
          
          // Auto-ripristina vault se utente loggato ma vault bloccata
          await this.autoRestoreVault();
        }
      } catch (e) {
        console.error(e);
      }
    },
    async autoRestoreVault() {
      // Se utente autenticato ma vault bloccata, prova a ripristinare
      if (this.auth.isAuthenticated && !this.store.security.isVaultUnlocked && this.auth.profile) {
        const tempPassword = sessionStorage.getItem('tempPassword');
        const tempSecretKey = sessionStorage.getItem('tempSecretKey');
        
        if (tempPassword && tempSecretKey && this.auth.profile.vault_salt) {
          try {
            // Rigenera la vaultKey
            const vaultKey = deriveVaultKeyWithSecret(
              tempPassword, 
              this.auth.profile.vault_salt, 
              tempSecretKey
            );
            
            // Sblocca il vault
            this.store.security.vaultKey = vaultKey;
            this.store.security.isVaultUnlocked = true;
            this.store.security.lastActivity = Date.now();
            this.store.startAutoLockTimer();
            
            // Pulisce le credenziali temporanee
            sessionStorage.removeItem('tempPassword');
            sessionStorage.removeItem('tempSecretKey');
            
            console.log('✅ VaultKey rigenerata automaticamente');
          } catch (error) {
            console.error('❌ Errore rigenerazione:', error);
            sessionStorage.clear();
            this.store.security.vaultKey = null;
            this.store.security.isVaultUnlocked = false;
          }
        }
      }
    },
  },
  watch: {
    'auth.user': {
      handler(value) {
        if (value) {
          this.getSession();
          this.getProfile();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.getUser();

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
