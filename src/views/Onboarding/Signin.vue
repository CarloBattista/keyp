<template>
  <form @submit.prevent class="max-w-sm mx-auto pt-24">
    <div class="mb-5">
      <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Your email</label>
      <input
        v-model="user.data.email"
        type="email"
        id="email"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="name@flowbite.com"
        required
      />
    </div>
    <div class="mb-5">
      <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Your password</label>
      <input
        v-model="user.data.password"
        type="password"
        id="password"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required
      />
    </div>
    <div class="mb-1">
      <label for="secretKey" class="block mb-2 text-sm font-medium text-gray-900">Your Secret Key</label>
      <input
        v-model="user.data.secretKey"
        type="password"
        id="secretKey"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Inserisci la tua Secret Key"
        required
      />
    </div>

    <div v-if="user.error?.secretKey" class="mb-4 text-red-600 text-sm">
      {{ user.error.secretKey }}
    </div>

    <RouterLink to="/identity/signup" class="w-full mb-4 flex items-center justify-end text-blue-600 hover:underline"
      >Non hai ancora un account? Registrati</RouterLink
    >
    <button
      @click="actionSignin"
      type="submit"
      :disabled="user.loading"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-400"
    >
      {{ user.loading ? 'Accesso...' : 'Accedi' }}
    </button>
  </form>
</template>

<script>
import { deriveVaultKeyWithSecret, verifySecretKey, encryptAES } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { store } from '../../data/store';

export default {
  name: 'Signin',
  data() {
    return {
      auth,
      store,
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
};
</script>

<style scoped></style>
