<template>
  <button :type="type" :disabled="disabled" class="ky-iconbtn" :class="['size-' + size, 'variant-' + variant, { loading: loading }]">
    <div class="h-full flex items-center justify-center">
      <component :is="icon" size="20" />
    </div>
  </button>
</template>

<script>
// ICONS
import { Download, Plus, X, Ellipsis, Trash2, Heart, Star, SquareArrowOutUpRight } from 'lucide-vue-next';

export default {
  name: 'ky-iconbutton',
  components: {
    // ICONS
    Download,
    Plus,
    X,
    Ellipsis,
    Trash2,
    Heart,
    Star,
    SquareArrowOutUpRight,
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
    icon: String,
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
.ky-iconbtn {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 50%;
  transition-property: background-color, color, border-color, transform, opacity;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.ky-iconbtn:not(:disabled) {
  cursor: pointer;
}

.ky-iconbtn:disabled,
.ky-iconbtn.loading {
  opacity: 0.3;
  cursor: not-allowed;
}

.ky-iconbtn:not(:disabled, .loading):active {
  transform: scale(0.98);
  opacity: 0.75;
}

/* Sizes */
.ky-iconbtn.size-default {
  height: 48px;
}

.ky-iconbtn.size-default .label-btn {
  font-size: 1rem;
}

.ky-iconbtn.size-large {
  height: 56px;
}

.ky-iconbtn.size-large .label-btn {
  font-size: 1.125rem;
}

.ky-iconbtn.size-small {
  height: 36px;
}

.ky-iconbtn.size-small .label-btn {
  font-size: 0.875rem;
}

/* Variants */
.ky-iconbtn.variant-primary {
  background-color: black;
  color: white;
}

.ky-iconbtn.variant-primary:hover {
  background-color: rgba(0, 0, 0, 0.85);
}

.ky-iconbtn.variant-primary-core {
  background-color: rgba(16, 71, 55, 1);
  color: white;
}

.ky-iconbtn.variant-primary-core:hover {
  background-color: rgba(16, 71, 55, 0.85);
}

.ky-iconbtn.variant-secondary {
  background-color: transparent;
  border-color: black;
  color: black;
}

.ky-iconbtn.variant-secondary:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.ky-iconbtn.variant-tertiary {
  background-color: transparent;
  border-color: transparent;
  color: black;
}

.ky-iconbtn.variant-tertiary:hover {
  background-color: rgba(16, 71, 55, 0.1);
}

.ky-iconbtn.variant-destructive {
  background-color: rgba(243, 31, 31, 1);
  border-color: transparent;
  color: white;
}

.ky-iconbtn.variant-destructive:hover {
  background-color: rgba(243, 31, 31, 0.85);
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

/* EXTRA */
.favorites-button .lucide-heart-icon,
.favorites-button .lucide-star-icon {
  fill: transparent;
}

.favorites-button.favorites .lucide-heart-icon,
.favorites-button.favorites .lucide-star-icon {
  fill: #c6ff72;
  stroke: #c6ff72;
}
</style>
