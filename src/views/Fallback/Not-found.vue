<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div class="flex flex-col gap-4">
        <h1 class="text-9xl font-bold text-gray-300">404</h1>
        <h2 class="text-3xl font-bold text-gray-900">Oh no!</h2>
      </div>
      <RouterLink to="/vault" class="space-y-4 w-full flex items-center justify-center">
        <kyButton type="button" variant="primary" label="Go back to home" />
      </RouterLink>
    </div>
  </div>
</template>

<script>
// COMPONENTS
import kyButton from '../../components/button/ky-button.vue';

export default {
  name: 'Not-found',
  components: {
    kyButton,
  },
};
</script>

<style scoped></style>
