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
    <div class="mb-1">
      <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Your password</label>
      <input
        v-model="user.data.password"
        type="password"
        id="password"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required
      />
    </div>
    <RouterLink to="/identity/signup" class="w-full mb-4 flex items-center justify-end text-blue-600 hover:underline"
      >Non hai ancora un account? Registrati</RouterLink
    >
    <button
      @click="actionSignin"
      type="submit"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      Accedi
    </button>
  </form>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';

export default {
  name: 'Signin',
  data() {
    return {
      auth,

      user: {
        data: {
          email: 'carlo@gmail.com',
          password: 'carlo',
        },
        error: {
          email: null,
          password: null,
        },
        loading: false,
      },
    };
  },
  methods: {
    async actionSignin() {
      this.user.loading = true;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.user.data.email,
          password: this.user.data.password,
        });

        if (!error) {
          this.auth.user = data.user;
          this.auth.session = data.session;
          this.auth.isAuthenticated = true;

          localStorage.setItem('isAuthenticated', true);

          this.$router.push({ name: 'vault' });
        }
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
