<template>
  <div
    @click="focusInput"
    class="field-container relative w-full flex flex-col gap-2"
    :class="{ focus: focus, active: modelValue.length > 0, error: error, disabled: disabled }"
  >
    <label v-if="label" :for="forLabel" class="input-label">{{ label }} <span v-if="required">*</span></label>
    <div
      @focus="handleFocus"
      @blur="handleBlur"
      class="input-container relative w-full h-13 max-h-13 px-4 pt-4 rounded-lg flex gap-2 items-center justify-start border border-solid"
    >
      <div v-if="icon" class="input-icon h-full flex items-center justify-center opacity-50 pointer-events-none">
        <component :is="icon" size="18" />
      </div>
      <input
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
        class="w-full h-full outline-0"
      />
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
    <div v-if="error" class="input-error relative w-full flex gap-2 items-center">
      <p class="text-[#e50914] text-xs font-medium">{{ error }}</p>
    </div>
  </div>
</template>

<script>
// ICONS
import { Eye, EyeClosed, Mail, KeyRound } from 'lucide-vue-next';

export default {
  name: 'ky-input',
  components: {
    // ICONS
    Eye,
    EyeClosed,
    Mail,
    KeyRound,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    forLabel: String,
    icon: String,
    label: String,
    placeholder: String,
    helpText: String,
    error: String,
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
      focus: true,
      showPassword: false,
    };
  },
  computed: {
    inputType() {
      if (this.type === 'password') {
        return this.showPassword ? 'text' : 'password';
      }
      return this.type;
    },
  },
  methods: {
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value);
    },
    focusInput() {
      if (!this.disabled && this.$refs.inputElement) {
        this.$refs.inputElement.focus();
      }
    },
    toggleShowPassword() {
      this.showPassword = !this.showPassword;
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

.field-container.focus .input-container {
  border-color: black;
  outline-color: black;
  outline-width: 1px;
  outline-style: solid;
}

.input-label {
  position: absolute;
  z-index: 10;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  font-size: 1rem;
  line-height: 1.5rem;
  color: rgba(0, 0, 0, 1);
  transition-property: transform, font-size, color;
  transition-duration: 200ms;
  transition-timing-function: ease;
}

.field-container.focus .input-label,
.field-container.active .input-label {
  transform: translateY(-100%);
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(45, 45, 45);
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

.eye-fade-enter-active,
.eye-fade-leave-active {
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;
}

.eye-fade-enter-from {
  opacity: 0;
  transform: scale(1.1);
}

.eye-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.eye-fade-enter-to,
.eye-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
