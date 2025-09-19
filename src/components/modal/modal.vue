<template>
  <div @click="store.modals.newAccount.open = false" class="fixed z-[998] top-0 left-0 w-full h-svh">
    <div class="relative w-full h-full bg-black opacity-70"></div>
  </div>
  <div
    id="crud-modal"
    tabindex="-1"
    aria-hidden="true"
    class="fixed z-[999] overflow-y-auto overflow-x-hidden top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full pointer-events-none"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700 pointer-events-auto">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create New Account</h3>
          <button
            @click="store.modals.newAccount.open = false"
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-toggle="crud-modal"
          >
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <slot name="body" />
      </div>
    </div>
  </div>
</template>

<script>
import { store } from '../../data/store';

export default {
  name: 'modal',
  data() {
    return {
      store,
    };
  },
};
</script>

<style scoped></style>
