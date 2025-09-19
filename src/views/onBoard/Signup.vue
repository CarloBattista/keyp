<template>
  <form @submit.prevent class="max-w-sm mx-auto pt-24">
    <div class="w-full mb-5 grid grid-cols-2 gap-4">
      <div class="w-full">
        <label for="first_name" class="block mb-2 text-sm font-medium text-gray-900">Your first name</label>
        <input
          v-model="user.data.first_name"
          type="text"
          id="first_name"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          required
        />
      </div>
      <div class="w-full">
        <label for="last_name" class="block mb-2 text-sm font-medium text-gray-900">Your last name</label>
        <input
          v-model="user.data.last_name"
          type="text"
          id="last_name"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          required
        />
      </div>
    </div>
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
    <RouterLink to="/identity/signin" class="w-full mb-4 flex items-center justify-end text-blue-600 hover:underline"
      >Hai già un account? Accedi</RouterLink
    >
    <button
      @click="actionSignup"
      type="submit"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      Continua
    </button>
  </form>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { generateVaultSalt } from '../../lib/crypto';

export default {
  name: 'Signup',
  data() {
    return {
      auth,

      user: {
        data: {
          first_name: 'Carlo',
          last_name: 'Battista',
          email: 'carlobattista@gmail.com',
          password: 'carlobattista',
        },
        error: {
          first_name: null,
          last_name: null,
          email: null,
          password: null,
        },
        loading: false,
      },
    };
  },
  methods: {
    async actionSignup() {
      this.user.loading = true;

      try {
        const { data, error } = await supabase.auth.signUp({
          email: this.user.data.email,
          password: this.user.data.password,
        });

        if (!error) {
          // console.log(data);
          this.auth.user = data.user;
          await this.createProfile(data.user);

          this.$router.push({ name: 'signin' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.user.loading = false;
      }
    },
    async createProfile(user) {
      if (!user.id) {
        return;
      }

      try {
        const vaultSalt = generateVaultSalt();

        const { error } = await supabase.from('profiles').insert({
          user_id: user.id,
          first_name: this.user.data.first_name,
          last_name: this.user.data.last_name,
          vault_salt: vaultSalt,
        });

        if (!error) {
          // console.log(data);
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style scoped></style>
