<template>
  <div
    :aria-checked="localChecked"
    :aria-disabled="disabled"
    tabindex="0"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
    role="checkbox"
    class="checkbox-container relative flex items-center gap-2"
    :class="{ checked: checked, disabled: disabled }"
  >
    <label v-if="label" for="checkbox" class="text-sm font-normal">{{ label }}</label>
    <div class="checkbox-fill relative w-11 h-6 p-[2px] rounded-full">
      <div class="checkbox-handle relative rounded-full h-full aspect-square"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'checkbox',
  props: {
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    label: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      localChecked: this.modelValue ?? this.checked,
    };
  },
  methods: {
    toggle() {
      if (this.disabled) return;
      const next = !this.localChecked;
      this.localChecked = next;
      this.$emit('update:modelValue', next);
      this.$emit('change', next);
    },
  },
  watch: {
    modelValue(val) {
      if (val !== undefined) {
        this.localChecked = !!val;
      }
    },
    checked(val) {
      if (this.modelValue === undefined) {
        this.localChecked = !!val;
      }
    },
  },
};
</script>

<style scoped>
.checkbox-container.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.checkbox-container:not(.disabled) {
  pointer-events: auto;
  cursor: pointer;
  opacity: 1;
}

.checkbox-fill {
  background-color: rgba(16, 71, 55, 0.1);
  transition-property: background-color;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.checkbox-container.checked .checkbox-fill {
  background-color: rgba(16, 71, 55, 1);
}

.checkbox-handle {
  background-color: rgba(255, 255, 255, 1);
  transform: translateX(0);
  transition-property: transform, left;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.checkbox-container.checked .checkbox-handle {
  transform: translateX(100%);
}
</style>
