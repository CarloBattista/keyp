<template>
  <div ref="dropdownContainer" class="dropdown-container relative">
    <div @click="isOpen = !isOpen" class="dropdown-trigger relative">
      <slot name="trigger" />
    </div>
    <transition name="slide-fade">
      <div
        v-if="isOpen"
        class="dropdown-options absolute z-[999] w-max min-w-[180px] p-1 flex flex-col gap-1 rounded-[20px] border border-solid border-black/10 bg-white shadow-2xl shadow-black/15"
        :class="position"
      >
        <slot name="options" />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'dropdown',
  props: {
    position: {
      type: String,
      default: 'bottom-right',
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    closeDropdown() {
      this.isOpen = false;
    },
    handleClickOutside(event) {
      // Verifica se il click è avvenuto al di fuori del componente dropdown
      if (this.$refs.dropdownContainer && !this.$refs.dropdownContainer.contains(event.target)) {
        this.closeDropdown();
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<style scoped>
.dropdown-options.bottom-right {
  top: 100%;
  right: 0;
  transform-origin: top right;
}

.dropdown-options.bottom-left {
  top: 100%;
  left: 0;
  transform-origin: top left;
}

.dropdown-options.bottom-right,
.dropdown-options.bottom-left {
  transform: translateY(8px);
}

.dropdown-options.top-right {
  bottom: 100%;
  right: 0;
  transform-origin: bottom right;
}

.dropdown-options.top-left {
  bottom: 100%;
  left: 0;
  transform-origin: bottom left;
}
</style>
