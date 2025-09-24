<template>
  <div class="w-full h-12 flex items-center justify-start"></div>
  <div class="relative w-full">
    <div class="relative pt-6 max-w-[420px] mx-auto px-4 flex flex-col">
      <h1 class="text-[#222] text-3xl font-semibold text-center mb-8">Welcome to Keyp</h1>
      <form @submit.prevent class="w-full flex flex-col gap-4">
        <div class="w-full grid grid-cols-2 gap-4">
          <kyInput
            v-model="user.data.first_name"
            type="text"
            label="First name"
            forLabel="first_name"
            :error="user.error.first_name"
            :disabled="user.loading"
          />
          <kyInput
            v-model="user.data.last_name"
            type="text"
            label="Last name"
            forLabel="last_name"
            :error="user.error.last_name"
            :disabled="user.loading"
          />
        </div>
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
        <kyButton @click="actionSignup" type="submit" label="Continue" :loading="user.loading" />
      </form>
      <div class="w-full mt-4 text-sm text-center flex flex-col gap-4 items-center justify-center">
        <p>Have account? <RouterLink to="/identity/signin" class="text-blue-500 hover:underline">Sign in</RouterLink></p>
      </div>
    </div>
  </div>

  <div v-if="showSecretKey" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4 text-red-600">⚠️ IMPORTANTE: Salva la tua Secret Key</h3>
      <p class="mb-4 text-sm text-gray-600">
        Questa è la tua Secret Key. <strong>Salvala in un posto sicuro!</strong> Ti servirà per accedere al tuo vault.
      </p>
      <kyInput v-model="generatedSecretKey" type="text" forLabel="secret_key" :readOnly="true" class="mb-4" />
      <div class="flex items-center mb-4">
        <input v-model="secretKeyConfirmed" type="checkbox" id="confirm" class="mr-2" />
        <label for="confirm" class="text-sm">Ho salvato la mia Secret Key in un posto sicuro</label>
      </div>
      <kyButton @click="completeRegistration" type="button" label="Continue" :disabled="!secretKeyConfirmed" class="w-full" />
    </div>
  </div>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { generateVaultSalt, generateSecretKey, generateSecretKeySalt, hashSecretKey } from '../../lib/crypto';
import { validateSignupForm, handleSignupErrors } from '../../lib/validation';

// COMPONENTS
import kyInput from '../../components/input/ky-input.vue';
import kyButton from '../../components/button/ky-button.vue';

export default {
  name: 'Signup',
  components: {
    kyInput,
    kyButton,
  },
  data() {
    return {
      auth,
      showSecretKey: false,
      generatedSecretKey: 'MC-5KV0QZ-OY4Y07-A52O1-UOU4B-OC39H-7HI3F',
      secretKeyConfirmed: false,
      tempUser: null,

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
    validateForm() {
      const validation = validateSignupForm(this.user.data);
      this.user.error = validation.errors;
      return validation.isValid;
    },

    handleFormErrors(error) {
      this.user.error = handleSignupErrors(error);
    },

    async actionSignup() {
      this.user.error = {
        first_name: null,
        last_name: null,
        email: null,
        password: null,
      };

      if (!this.validateForm()) {
        this.user.loading = false;
        return;
      }

      this.user.loading = true;

      try {
        const { data, error } = await supabase.auth.signUp({
          email: this.user.data.email,
          password: this.user.data.password,
        });

        if (!error) {
          this.tempUser = data.user;

          // Genera la Secret Key
          this.generatedSecretKey = generateSecretKey();
          this.showSecretKey = true;
        }
      } catch (e) {
        console.error(e);
        this.handleFormErrors(e);
      } finally {
        this.user.loading = false;
      }
    },
    async completeRegistration() {
      if (!this.secretKeyConfirmed || !this.tempUser) return;

      try {
        this.auth.user = this.tempUser;
        await this.createProfile(this.tempUser);

        // Nascondi il modal
        this.showSecretKey = false;

        this.$router.push({ name: 'signin' });
      } catch (e) {
        console.error(e);
      }
    },
    async createProfile(user) {
      if (!user.id) {
        return;
      }

      try {
        const vaultSalt = generateVaultSalt();
        const secretKeySalt = generateSecretKeySalt();
        const secretKeyHash = hashSecretKey(this.generatedSecretKey, secretKeySalt);

        const { error } = await supabase.from('profiles').insert({
          user_id: user.id,
          first_name: this.user.data.first_name,
          last_name: this.user.data.last_name,
          vault_salt: vaultSalt,
          secret_key_hash: secretKeyHash,
          secret_key_salt: secretKeySalt,
        });

        if (!error) {
          console.log('✅ Profilo creato con Secret Key');
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style scoped></style>
