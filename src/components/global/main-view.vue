<template>
  <div class="main-view sm:px-6 px-4" :class="{ 'sidebar-open': store.sidebar.open }">
    <div class="pt-11" :class="`max-w-[${innerContainer}px] mx-auto`">
      <slot name="view" />
    </div>
  </div>
</template>

<script>
import { store } from '../../data/store';

export default {
  name: 'main-view',
  props: {
    innerContainer: {
      type: Number,
      default: 1024,
    },
  },
  data() {
    return {
      store,
    };
  },
};
</script>

<style scoped>
.main-view {
  width: calc(100% - 70px);
  margin-left: 70px;

  transition-property: width, margin-left;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
}

.main-view.sidebar-open {
  width: calc(100% - 280px);
  margin-left: 280px;
}
</style>
