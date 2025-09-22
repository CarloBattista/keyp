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

    <div v-if="user.error.secretKey" class="mb-4 text-red-600 text-sm">
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
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { store } from '../../data/store';
import { deriveVaultKeyWithSecret, verifySecretKey } from '../../lib/crypto';

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
          secretKey: '',
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
      this.user.error.secretKey = null;

      try {
        // 1. Autentica con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.user.data.email,
          password: this.user.data.password,
        });

        if (error) {
          console.error('Errore login:', error);
          return;
        }

        // 2. Ottieni il profilo
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).maybeSingle();

        if (!profile) {
          console.error('Profilo non trovato');
          return;
        }

        // 3. Verifica la Secret Key
        const isSecretKeyValid = verifySecretKey(this.user.data.secretKey, profile.secret_key_salt, profile.secret_key_hash);

        if (!isSecretKeyValid) {
          this.user.error.secretKey = 'Secret Key non valida';
          return;
        }

        // 4. Deriva Vault Key
        const vaultKey = deriveVaultKeyWithSecret(this.user.data.password, profile.vault_salt, this.user.data.secretKey);

        // 6. Imposta auth e profilo
        this.auth.user = data.user;
        this.auth.session = data.session;
        this.auth.profile = profile;
        this.auth.isAuthenticated = true;

        // 7. Sblocca il vault con la vaultKey derivata
        this.store.security.vaultKey = vaultKey;
        this.store.security.isUnlocked = true;
        this.store.security.lastActivity = Date.now();
        this.store.startAutoLockTimer();

        // 8. Pulisce i dati sensibili dalla memoria
        this.user.data.password = '';
        this.user.data.secretKey = '';

        localStorage.setItem('isAuthenticated', true);
        this.$router.push({ name: 'vault' });
      } catch (e) {
        console.error(e);
      } finally {
        this.user.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
