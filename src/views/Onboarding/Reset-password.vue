<template>
  <div class="w-full h-12 flex items-center justify-start"></div>
  <div class="relative w-full">
    <div class="relative pt-6 max-w-[420px] mx-auto px-4 flex flex-col">
      <h1 class="text-[#222] text-3xl font-semibold text-center mb-8">Choose a new password</h1>
      <form @submit.prevent class="w-full flex flex-col gap-4">
        <kyInput
          v-model="user.data.password"
          type="password"
          label="Password"
          forLabel="password"
          :error="user.error.password"
          :disabled="user.loading"
        />
        <kyInput
          v-model="user.data.confirm_password"
          type="password"
          label="Confirm password"
          forLabel="confirm_password"
          :error="user.error.confirm_password"
          :disabled="user.loading"
        />
        <kyButton @click="actionChangePassword" type="submit" label="Continue" :loading="user.loading" />
      </form>
      <div class="w-full mt-4 text-sm text-center flex flex-col gap-4 items-center justify-center">
        <RouterLink to="/identity/signin" class="text-blue-500 hover:underline">Back to Log in</RouterLink>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { store } from '../../data/store';
import { validateResetPasswordForm, handleResetPasswordErrors } from '../../lib/validation';

// COMPONENTS
import kyInput from '../../components/input/ky-input.vue';
import kyButton from '../../components/button/ky-button.vue';

export default {
  name: 'Reset-password',
  components: {
    kyInput,
    kyButton,
  },
  data() {
    return {
      auth,
      store,
      user: {
        data: {
          password: '',
          confirm_password: '',
        },
        error: {
          password: null,
          confirm_password: null,
        },
        loading: false,
      },
    };
  },
  methods: {
    validateForm() {
      const validation = validateResetPasswordForm(this.user.data);
      this.user.error = validation.errors;
      return validation.isValid;
    },

    async handleFormErrors(error) {
      this.user.error = handleResetPasswordErrors(error);
    },
    async actionChangePassword() {
      if (!this.validateForm()) {
        this.user.loading = false;
        return;
      }

      this.user.loading = true;

      try {
        const { data, error } = await supabase.auth.updateUser({
          password: this.user.data.password,
        });

        if (!error) {
          console.log(data);
          this.user.data.password = '';
          this.user.data.confirm_password = '';
          this.$router.push({ name: 'vault' });
        }
      } catch (e) {
        console.error(e);
        this.handleFormErrors(e);
      } finally {
        this.user.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
