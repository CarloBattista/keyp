<template>
  <div
    @mousedown="onPointerDown"
    @touchstart="onPointerDown"
    class="slider-bar-container w-full h-6 flex items-center"
    :class="{ disabled: disabled }"
  >
    <label v-if="label" class="slider-label block text-sm font-medium mb-2">{{ label }}</label>
    <div class="slider-bar w-full flex items-center gap-3">
      <div ref="track" class="slider-track relative w-full h-2 rounded-lg select-none">
        <div class="slider-fill absolute inset-y-0 left-0 rounded-lg" :style="{ width: fillWidth + '%' }"></div>
        <div
          class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          :style="{ left: thumbLeft + '%' }"
          @mousedown.stop="onPointerDown"
          @touchstart.stop="onPointerDown"
        >
          <div class="slider-handle w-5 h-5 rounded-full shadow-md"></div>
        </div>
      </div>
      <span v-if="internalValueVisible" class="text-xs text-gray-600">{{ internalValue }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SliderBar',
  props: {
    modelValue: { type: Number, required: true },
    label: String,
    internalValueVisible: {
      type: Boolean,
      default: false,
    },
    min: { type: Number, default: 8 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      internalValue: this.clamp(this.modelValue),
      dragging: false,
    };
  },
  computed: {
    percent() {
      const range = this.max - this.min;
      if (range <= 0) return 0;
      return ((this.internalValue - this.min) / range) * 100;
    },
    fillWidth() {
      return this.percent;
    },
    thumbLeft() {
      return this.percent;
    },
  },
  methods: {
    clamp(val) {
      const n = Number(val ?? this.min);
      const min = Number(this.min);
      const max = Number(this.max);
      const step = Number(this.step);
      if (n < min) return min;
      if (n > max) return max;
      const steps = Math.round((n - min) / step);
      return min + steps * step;
    },
    onPointerDown(event) {
      if (this.disabled) return;
      this.dragging = true;
      this.bindEvents();
      this.updateFromEvent(event, true);
    },
    onPointerMove(event) {
      if (!this.dragging || this.disabled) return;
      this.updateFromEvent(event, false);
    },
    onPointerUp() {
      if (!this.dragging) return;
      this.dragging = false;
      this.unbindEvents();
      this.$emit('change', this.internalValue);
    },
    bindEvents() {
      window.addEventListener('mousemove', this.onPointerMove);
      window.addEventListener('mouseup', this.onPointerUp);
      window.addEventListener('touchmove', this.onPointerMove, { passive: false });
      window.addEventListener('touchend', this.onPointerUp);
      window.addEventListener('touchcancel', this.onPointerUp);
    },
    unbindEvents() {
      window.removeEventListener('mousemove', this.onPointerMove);
      window.removeEventListener('mouseup', this.onPointerUp);
      window.removeEventListener('touchmove', this.onPointerMove);
      window.removeEventListener('touchend', this.onPointerUp);
      window.removeEventListener('touchcancel', this.onPointerUp);
    },
    getClientX(e) {
      if (e.touches && e.touches[0]) return e.touches[0].clientX;
      if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
      return e.clientX;
    },
    updateFromEvent(e, emitImmediately) {
      if (e.cancelable) e.preventDefault();
      const track = this.$refs.track;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const clientX = this.getClientX(e);
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const ratio = rect.width > 0 ? x / rect.width : 0;
      const raw = this.min + ratio * (this.max - this.min);
      const next = this.clamp(raw);
      if (next !== this.internalValue) {
        this.internalValue = next;
        this.$emit('update:modelValue', next);
        if (emitImmediately) {
          this.$emit('change', next);
        }
      }
    },
  },
  watch: {
    modelValue(newVal) {
      this.internalValue = this.clamp(newVal);
    },
  },
  beforeUnmount() {
    this.unbindEvents();
  },
};
</script>

<style scoped>
.slider-bar-container.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.slider-bar-container:not(.disabled) {
  pointer-events: auto;
  cursor: pointer;
  opacity: 1;
}

.slider-track {
  background-color: rgba(16, 71, 55, 0.1);
}

.slider-fill {
  background-color: rgba(16, 71, 55, 1);
}

.slider-handle {
  background-color: rgba(16, 71, 55, 1);
}
</style>
