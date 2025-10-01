<template>
  <div
    @click="handleClick"
    class="dropdown-item min-h-10 px-2 py-1 rounded-2xl flex gap-2 items-center"
    :class="['type-' + type, { disabled: disabled }]"
  >
    <div class="h-full flex flex-none items-center justify-center">
      <component :is="icon" size="16" />
    </div>
    <span class="text-sm font-medium">{{ label }}</span>
  </div>
</template>

<script>
// ICONS
import { Star, Pencil, Trash2 } from 'lucide-vue-next';

export default {
  name: 'dropdown-item',
  components: {
    // ICONS
    Star,
    Pencil,
    Trash2,
  },
  inject: ['closeDropdown'],
  props: {
    type: {
      type: String,
      default: 'default',
    },
    icon: String,
    label: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClick(event) {
      if (this.disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      setTimeout(() => {
        if (this.closeDropdown) {
          this.closeDropdown();
        }
      }, 0);
    },
  },
};
</script>

<style scoped>
.dropdown-item {
  cursor: pointer;
  opacity: 1;

  transition-property: background-color, color, border-color, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.disabled.disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.dropdown-item.type-default {
  background-color: rgba(16, 71, 55, 0);
}

.dropdown-item.type-default:not(.disabled):hover {
  background-color: rgba(16, 71, 55, 0.1);
}

.dropdown-item.type-destructive {
  background-color: rgba(243, 31, 31, 0.1);
  color: rgba(243, 31, 31, 1);
}

.dropdown-item.type-destructive:not(.disabled):hover {
  background-color: rgba(243, 31, 31, 0.2);
}
</style>
