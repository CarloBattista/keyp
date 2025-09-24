<template>
  <div class="w-full h-12 flex items-center justify-start"></div>
  <div class="relative w-full">
    <div class="relative pt-6 max-w-[420px] mx-auto px-4 flex flex-col">
      <h1 class="text-[#222] text-3xl font-semibold text-center mb-2">Check your inbox</h1>
      <p class="text-[#222] text-base font-normal text-center">Click on the link we sent to <b>mail@gmail.com</b> to finish your account setup.</p>
      <a href="https://mail.google.com/mail/u/0/" target="_blank" class="mt-8 mb-4">
        <kyButton type="submit" variant="secondary" :leftIcon="true" label="Open Gmail" class="w-full">
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
      </a>
      <div class="w-full mt-4 text-sm text-center flex flex-col gap-4 items-center justify-center">
        <p>No email in your inbox or spam folder? <span class="text-blue-500 hover:underline cursor-pointer">Let’s resend it</span></p>
        <p>Wrong address? <span class="text-blue-500 hover:underline cursor-pointer">Log out</span> to sign in with a different email.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '../../data/auth';
import { store } from '../../data/store';

// COMPONENTS
import kyButton from '../../components/button/ky-button.vue';

export default {
  name: 'Verify',
  components: {
    kyButton,
  },
  data() {
    return {
      auth,
      store,
    };
  },
};
</script>

<style scoped></style>
