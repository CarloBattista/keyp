<template>
  <div class="grouped-account-data">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ky-grouped',
};
</script>

<style scoped>
.grouped-account-data {
  background-color: rgba(16, 71, 55, 0.1);
  border-radius: 8px;
}
</style>
