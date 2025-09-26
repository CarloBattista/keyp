<template>
  <div>
    <div
      @click="focusInput"
      class="field-container relative w-full flex flex-col gap-2"
      :class="{ focus: focus, active: modelValue.length > 0, error: error, disabled: disabled, 'without-label': !label }"
    >
      <label v-if="label" :for="forLabel" class="input-label">{{ label }} <span v-if="required">*</span></label>
      <div
        @focus="handleFocus"
        @blur="handleBlur"
        class="input-container relative w-full rounded-lg flex gap-2 items-center justify-start border border-solid"
      >
        <div v-if="icon" class="input-icon h-full flex items-center justify-center opacity-50 pointer-events-none">
          <component :is="icon" size="18" />
        </div>
        <textarea
          ref="inputElement"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="updateValue"
          :value="modelValue"
          :id="forLabel"
          :type="inputType"
          :placeholder="placeholder"
          :readonly="readOnly"
          :required="required"
          :disabled="disabled"
          class="w-full h-full min-h-[6rem] px-4 py-2 outline-0"
          :class="{ 'resize-none': !resize }"
        ></textarea>
        <div
          v-if="type === 'password'"
          @click="toggleShowPassword"
          class="absolute top-0 right-4 h-full flex items-center justify-center cursor-pointer"
        >
          <transition name="eye-fade" mode="out-in">
            <Eye v-if="!showPassword" key="eye-closed" size="20" />
            <EyeClosed v-else key="eye-open" size="20" />
          </transition>
        </div>
      </div>
    </div>
    <div v-if="error" class="input-error relative mt-2 w-full flex gap-2 items-center">
      <p class="text-[#e50914] text-xs font-medium">{{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ky-textarea',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    forLabel: String,
    icon: String,
    label: String,
    placeholder: String,
    helpText: String,
    error: String,
    resize: {
      type: Boolean,
      default: false,
    },
    required: Boolean,
    readOnly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      focus: false,
    };
  },
  methods: {
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value);
    },
    focusInput() {
      if (!this.disabled && !this.readOnly && this.$refs.inputElement) {
        this.$refs.inputElement.focus();
      }
    },
    handleFocus() {
      this.focus = true;
    },
    handleBlur() {
      this.focus = false;
    },
  },
};
</script>

<style scoped>
.input-container {
  background-color: white;
  color: black;
  border-color: rgba(0, 0, 0, 0.2);
  outline-color: transparent;
  cursor: text;

  /* transition-property: background-color, color, border-color, border-width, outline-color, outline-width;
  transition-duration: 200ms;
  transition-timing-function: ease; */
}

.input-container input:read-only {
  cursor: default !important;
}

.field-container.focus .input-container {
  border-color: black;
  outline-color: black;
  outline-width: 1px;
  outline-style: solid;
}

.field-container.without-label .input-container {
  padding-top: 0;
}

.input-label {
  position: relative;
  z-index: 10;
  font-size: 1rem;
  line-height: 1.5rem;
  color: rgba(0, 0, 0, 1);
}

.field-container.error .input-container {
  border-color: #e50914;
  outline-color: #e50914;
  outline-width: 1px;
  outline-style: solid;
}

.field-container.disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
