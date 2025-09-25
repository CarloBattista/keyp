<template>
  <button
    :type="type"
    :disabled="disabled"
    class="ky-btn min-h-9 max-h-14 px-4 rounded-lg relative flex gap-2 items-center justify-center"
    :class="['size-' + size, 'variant-' + variant, { loading: loading }]"
  >
    <div v-if="!loading && leftIcon" class="h-full flex items-center justify-center">
      <component :is="leftIcon" size="20" />
      <slot name="leftIconCustom" />
    </div>
    <span v-if="loading" class="loader"></span>
    <span v-if="!loading && label" class="label-btn font-medium">{{ label }}</span>
    <div v-if="!loading && rightIcon" class="h-full flex items-center justify-center">
      <component :is="rightIcon" size="20" />
    </div>
  </button>
</template>

<script>
// ICONS
import { Download } from 'lucide-vue-next';

export default {
  name: 'ky-button',
  components: {
    // ICONS
    Download,
  },
  props: {
    type: {
      type: String,
      default: 'button',
    },
    size: {
      type: String,
      default: 'default',
    },
    variant: {
      type: String,
      default: 'primary',
    },
    actions: {
      type: Boolean,
      default: false,
    },
    leftIcon: String,
    rightIcon: String,
    label: String,
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.ky-btn {
  border: 2px solid transparent;
  transition-property: background-color, color, border-color, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.ky-btn:not(:disabled) {
  cursor: pointer;
}

.ky-btn:disabled,
.ky-btn.loading {
  opacity: 0.5;
  cursor: not-allowed;
}

.ky-btn:not(:disabled, .loading):active {
  transform: scale(0.98);
  opacity: 0.75;
}

/* Sizes */
.ky-btn.size-default {
  height: 48px;
}

.ky-btn.size-default .label-btn {
  font-size: 1.125rem;
}

.ky-btn.size-large {
  height: 56px;
}

.ky-btn.size-large .label-btn {
  font-size: 1rem;
}

.ky-btn.size-small {
  height: 36px;
}

.ky-btn.size-small .label-btn {
  font-size: 0.875rem;
}

/* Variants */
.ky-btn.variant-primary {
  background-color: black;
  color: white;
}

.ky-btn.variant-primary:hover {
  background-color: rgba(0, 0, 0, 0.85);
}

.ky-btn.variant-secondary {
  background-color: transparent;
  border-color: black;
  color: black;
}

.ky-btn.variant-secondary:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* LOADER */
.loader {
  height: 10px;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: #fff;
  box-shadow:
    16px 0 #fff,
    -16px 0 #fff;
  position: relative;
  animation: flash 0.5s ease-out infinite alternate;
}

@keyframes flash {
  0% {
    background-color: #fff2;
    box-shadow:
      16px 0 #fff2,
      -16px 0 #fff;
  }
  50% {
    background-color: #fff;
    box-shadow:
      16px 0 #fff2,
      -16px 0 #fff2;
  }
  100% {
    background-color: #fff2;
    box-shadow:
      16px 0 #fff,
      -16px 0 #fff2;
  }
}
</style>
