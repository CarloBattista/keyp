<template>
  <div class="w-full h-12 flex items-center justify-start"></div>
  <div class="relative w-full">
    <div class="relative pt-6 max-w-[420px] mx-auto px-4 flex flex-col">
      <h1 class="text-[#222] text-3xl font-semibold text-center mb-8">Enter your email to reset password</h1>
      <p v-if="user.sended" class="text-[#222] text-base font-normal text-center">
        If an account exists for <b>{{ user.data.email ? user.data.email : 'mail@example.com' }}</b
        >, you will get an email with instructions on resetting your password. If it doesn't arrive, be sure to check your spam folder.
      </p>
      <form v-if="!user.sended" @submit.prevent class="w-full flex flex-col gap-4">
        <kyInput
          v-model="user.data.email"
          type="email"
          label="Email address"
          forLabel="email_address"
          :error="user.error.email"
          :disabled="user.loading"
        />
        <kyButton @click="actionSendResetPassword" type="submit" label="Reset password" :loading="user.loading" />
      </form>
      <div class="w-full mt-4 text-sm text-center flex flex-col gap-4 items-center justify-center">
        <RouterLink v-if="!user.sended" to="/identity/signin" class="text-blue-500 hover:underline">Cancel</RouterLink>
        <RouterLink v-else-if="user.sended" to="/identity/signin" class="text-blue-500 hover:underline">Back to Log in</RouterLink>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { validateForgotPasswordForm, handleForgotPasswordErrors } from '../../lib/validation';

// COMPONENTS
import kyInput from '../../components/input/ky-input.vue';
import kyButton from '../../components/button/ky-button.vue';

export default {
  name: 'Forgot-password',
  components: {
    kyInput,
    kyButton,
  },
  data() {
    return {
      auth,
      user: {
        data: {
          email: 'carlobattista@gmail.com',
        },
        error: {
          email: null,
        },
        sended: false,
        loading: false,
      },
    };
  },
  methods: {
    validateForm() {
      const validation = validateForgotPasswordForm(this.user.data);
      this.user.error = validation.errors;
      return validation.isValid;
    },

    async handleFormErrors(error) {
      this.user.error = handleForgotPasswordErrors(error);
    },
    async actionSendResetPassword() {
      this.showIdleLogoutMessage = false;

      if (!this.validateForm()) {
        this.user.loading = false;
        this.user.sended = false;
        return;
      }

      this.user.loading = true;

      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(this.user.data.email, {
          redirectTo: `${window.location.origin}/identity/reset-password`,
        });

        if (!error) {
          console.log(data);
          this.user.sended = true;
        }
      } catch (e) {
        console.error(e);
        this.user.sended = false;
        this.handleFormErrors(e);
      } finally {
        this.user.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
