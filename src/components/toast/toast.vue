<template>
  <Transition name="toast-fade">
    <div v-if="toast.show" class="toast-container fixed z-[9999] bottom-0 left-0 translate-y-[-10px] w-full px-8">
      <div class="toast relative max-w-4xl w-fit mx-auto px-6 py-4 rounded-[28px] flex items-center shadow-lg shadow-black/15">
        <p class="text-base font-medium">{{ toast?.message }}</p>
        <div v-if="toast?.closable" class="absolute top-0 right-0 h-full p-1 flex gap-1 items-center">
          <button
            type="button"
            class="h-full px-3 rounded-[28px] flex items-center justify-center hover:bg-black/10 text-black font-medium cursor-pointer"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { store } from '../../data/store';

export default {
  name: 'toast',
  data() {
    return {
      toast: store.toast,
    };
  },
  methods: {
    closeToast() {
      this.toast.show = false;
    },
    autoCloseToast() {
      if (this.toast.autoCloseTimeout) {
        clearTimeout(this.toast.autoCloseTimeout);
      }
      this.toast.autoCloseTimeout = setTimeout(() => {
        this.closeToast();
      }, this.toast.autoCloseDelay);
    },
  },
  watch: {
    'toast.show': {
      handler(value) {
        if (value) {
          this.autoCloseToast();
        } else {
          this.closeToast();
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.toast {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: black;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition-property: opacity, transform;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
