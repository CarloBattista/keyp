<template>
  <div class="w-full h-12 flex items-center justify-start"></div>
  <div class="relative w-full">
    <div class="relative pt-6 max-w-[420px] mx-auto px-4 flex flex-col">
      <h1 class="text-[#222] text-3xl font-semibold text-center mb-8">Sign in to Keyp</h1>
      <kyButton
        v-if="options.authentication.access_with_google_auth"
        @click="actionSigninWithGoogle"
        type="submit"
        variant="secondary"
        :leftIcon="true"
        label="Continue with Google"
      >
        <template #leftIconCustom>
          <svg class="svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285f4"
              fill-opacity="1"
              fill-rule="evenodd"
              stroke="none"
              d="M17.64 9.2q-.002-.956-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            ></path>
            <path
              fill="#34a853"
              fill-opacity="1"
              fill-rule="evenodd"
              stroke="none"
              d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18"
            ></path>
            <path
              fill="#fbbc05"
              fill-opacity="1"
              fill-rule="evenodd"
              stroke="none"
              d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042z"
            ></path>
            <path
              fill="#ea4335"
              fill-opacity="1"
              fill-rule="evenodd"
              stroke="none"
              d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71"
            ></path>
          </svg>
        </template>
      </kyButton>
      <p v-if="options.authentication.access_with_google_auth" class="w-full h-14 text-sm font-normal text-center flex items-center justify-center">
        or
      </p>
      <notification v-if="showIdleLogoutMessage" type="info" message="La sessione è scaduta dopo 15 minuti di inattività" class="mb-2" />
      <form @submit.prevent class="w-full flex flex-col gap-4">
        <kyInput
          v-model="user.data.email"
          type="email"
          label="Email address"
          forLabel="email_address"
          :error="user.error.email"
          :disabled="user.loading"
        />
        <kyInput
          v-model="user.data.password"
          type="password"
          label="Password"
          forLabel="password"
          :error="user.error.password"
          :disabled="user.loading"
        />
        <kyInput
          v-model="user.data.secretKey"
          type="text"
          label="Secret key"
          forLabel="secret_key"
          :error="user.error.secretKey"
          :disabled="user.loading"
          class="mb-2"
        />
        <kyButton @click="actionSignin" type="submit" variant="primary-core" label="Log in" :loading="user.loading" />
      </form>
      <div class="w-full mt-4 text-sm text-center flex flex-col gap-4 items-center justify-center">
        <RouterLink v-if="options.authentication.reset_password" to="/identity/forgot-password" class="text-blue-500 hover:underline"
          >Reset Password</RouterLink
        >
        <p>No account? <RouterLink to="/identity/signup" class="text-blue-500 hover:underline">Create one</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<script>
import { deriveVaultKeyWithSecret, verifySecretKey, encryptAES } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { store } from '../../data/store';
import options from '../../json/options.json';
import { validateSigninForm, handleAuthErrors } from '../../lib/validation';

// COMPONENTS
import kyInput from '../../components/input/ky-input.vue';
import kyButton from '../../components/button/ky-button.vue';
import notification from '../../components/notification/notification.vue';

export default {
  name: 'Signin',
  components: {
    kyInput,
    kyButton,
    notification,
  },
  data() {
    return {
      auth,
      store,
      options,
      showIdleLogoutMessage: false,
      user: {
        data: {
          id: null,
          email: 'carlobattista25@gmail.com',
          password: 'carlobattista',
          secretKey: 'GV-00CO37-7J93HG-Y6R6H-Y2XRC-IGU8G-4F3EK',
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
    validateForm() {
      const validation = validateSigninForm(this.user.data);
      this.user.error = validation.errors;
      return validation.isValid;
    },

    async handleFormErrors(error) {
      this.user.error = handleAuthErrors(error);

      if (error?.code === 'email_not_confirmed') {
        try {
          const { data, error } = await supabase.from('profiles').select('email').eq('email', this.user.data.email).single();

          if (!error) {
            console.log(data);
            // this.$router.push({ name: 'verify' });
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    async actionSignin() {
      this.showIdleLogoutMessage = false;

      if (!this.validateForm()) {
        this.user.loading = false;
        return;
      }

      this.user.loading = true;

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
        localStorage.setItem('isAuthenticated', true);

        // 8. Sblocca il vault
        this.store.security.vaultKey = vaultKey;
        this.store.security.isUnlocked = true;
        this.store.security.lastActivity = Date.now();
        this.store.startAutoLockTimer();

        // 9. Pulisce i campi del form
        this.user.data.email = '';
        this.user.data.password = '';
        this.user.data.secretKey = '';

        // 10. Redirect al vault
        this.$router.push({ name: 'vault' });
      } catch (e) {
        console.error(e);
        this.handleFormErrors(e);
      } finally {
        this.user.loading = false;
      }
    },
    async actionSigninWithGoogle() {
      if (!this.options.authentication.access_with_google_auth) {
        return;
      }

      this.user.loading = true;

      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/vault`,
          },
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
        localStorage.setItem('isAuthenticated', true);

        // 8. Sblocca il vault
        this.store.security.vaultKey = vaultKey;
        this.store.security.isUnlocked = true;
        this.store.security.lastActivity = Date.now();
        this.store.startAutoLockTimer();

        // 9. Pulisce i campi del form
        this.user.data.email = '';
        this.user.data.password = '';
        this.user.data.secretKey = '';

        // 10. Redirect al vault
        this.$router.push({ name: 'vault' });
      } catch (e) {
        console.error(e);
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
