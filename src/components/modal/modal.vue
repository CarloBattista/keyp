<template>
  <div @click="closeModal" class="fixed z-[998] top-0 left-0 w-full h-svh">
    <div class="relative w-full h-full bg-black opacity-70"></div>
  </div>
  <div
    id="crud-modal"
    tabindex="-1"
    aria-hidden="true"
    class="fixed z-[999] top-0 right-0 left-0 overflow-y-auto overflow-x-hidden flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full pointer-events-none"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow-sm pointer-events-auto">
        <!-- Modal header -->
        <div v-if="header" class="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
          <h3 class="text-lg font-semibold text-[#104737]">{{ head }}</h3>
          <kyIconbutton v-if="closable" @click="closeModal" type="button" variant="tertiary" size="small" icon="X" />
        </div>
        <!-- Modal Body -->
        <slot name="body" />
        <!-- Modal Footer -->
        <div v-if="footer" class="flex gap-3 items-center justify-start p-4 md:p-5 border-t rounded-b border-gray-200">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { store } from '../../data/store';

import kyIconbutton from '../button/ky-iconbutton.vue';

export default {
  name: 'modal',
  components: {
    kyIconbutton,
  },
  props: {
    modalKey: String,
    header: {
      type: Boolean,
      default: true,
    },
    footer: {
      type: Boolean,
      default: true,
    },
    head: String,
    closable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      store,
    };
  },
  methods: {
    closeModal() {
      if (this.modalKey) {
        this.store.modals[this.modalKey].open = false;
      }
    },
  },
};
</script>

<style scoped></style>
