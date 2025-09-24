<template>
  <div class="w-full h-12 flex items-center justify-start"></div>
  <div class="relative w-full">
    <div class="relative pt-6 max-w-[420px] mx-auto px-4 flex flex-col">
      <h1 class="text-[#222] text-3xl font-semibold text-center mb-8">Sign in to Keyp</h1>
      <!-- <p class="w-full h-14 text-sm font-normal text-center flex items-center justify-center">or</p> -->
      <form @submit.prevent class="w-full flex flex-col gap-4">
        <kyInput v-model="user.data.email" type="email" label="Email address" forLabel="email_address" />
        <kyInput v-model="user.data.password" type="password" label="Password" forLabel="password" />
        <kyInput v-model="user.data.secretKey" type="text" label="Secret key" forLabel="secret_key" />
      </form>
      <div class="w-full mt-4 text-sm text-center flex flex-col gap-4 items-center justify-center">
        <RouterLink to="">Reset Password</RouterLink>
        <p>No account? <RouterLink to="">Create one</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<script>
import { deriveVaultKeyWithSecret, verifySecretKey, encryptAES } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { store } from '../../data/store';

// COMPONENTS
import kyInput from '../../components/input/ky-input.vue';

export default {
  name: 'Signin',
  components: {
    kyInput,
  },
  data() {
    return {
      auth,
      store,
      showIdleLogoutMessage: false,
      user: {
        data: {
          email: 'carlobattista@gmail.com',
          password: 'carlobattista',
          secretKey: 'MC-5KV0QZ-OY4Y07-A52O1-UOU4B-OC39H-7HI3F',
        },
        error: {
          email: null,
          password: null,
          secretKey: null,
        },
        loading: false,
      },
    };
  },
  methods: {
    async actionSignin() {
      // Nascondi il messaggio quando l'utente inizia a fare login
      this.showIdleLogoutMessage = false;

      this.user.loading = true;
      this.user.error = null;

      try {
        // 1. Autenticazione con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.user.data.email,
          password: this.user.data.password,
        });

        if (error) throw error;

        // 2. Recupera il profilo utente
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).single();

        if (profileError) throw profileError;

        // 3. Verifica la secret key
        const isValidSecret = verifySecretKey(this.user.data.secretKey, profile.secret_key_salt, profile.secret_key_hash);

        if (!isValidSecret) {
          throw new Error('Secret key non valida');
        }

        // 4. Deriva la vaultKey
        const vaultKey = deriveVaultKeyWithSecret(this.user.data.password, profile.vault_salt, this.user.data.secretKey);

        // 5. Cifra la vaultKey con l'access_token
        const encryptedVaultKey = await encryptAES(vaultKey, data.session.access_token);

        // 6. Salva la vaultKey cifrata in sessionStorage
        sessionStorage.setItem('encryptedVaultKey', encryptedVaultKey);

        // 7. Imposta auth e profilo
        this.auth.user = data.user;
        this.auth.session = data.session;
        this.auth.isAuthenticated = true;
        this.auth.profile = profile;

        // 8. Sblocca il vault
        this.store.security.vaultKey = vaultKey;
        this.store.security.isVaultUnlocked = true;
        this.store.security.lastActivity = Date.now();
        this.store.startAutoLockTimer();

        // 9. Pulisce i campi del form
        this.user.data.password = '';
        this.user.data.secretKey = '';

        // 10. Redirect al vault
        this.$router.push({ name: 'vault' });
      } catch (error) {
        console.error('Errore login:', error);
        this.user.error = error.message;
      } finally {
        this.user.loading = false;
      }
    },
  },
  mounted() {
    // Controlla se il logout è avvenuto per inattività
    const logoutReason = localStorage.getItem('logoutReason');
    if (logoutReason === 'idle') {
      this.showIdleLogoutMessage = true;
      // Rimuovi il flag dopo averlo mostrato
      localStorage.removeItem('logoutReason');
    }
  },
};
</script>

<style scoped></style>
