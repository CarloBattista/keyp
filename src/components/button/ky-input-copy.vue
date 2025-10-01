<template>
  <div class="input-copy-container group" :class="['size-' + size, { grouped: grouped, 'type-notes': type === 'notes' }]">
    <div>
      <p v-if="label" class="input-label">{{ label }}</p>
      <input v-if="type !== 'notes'" :type="type" :value="value" readonly />
      <textarea v-else-if="type === 'notes'" :value="value" readonly></textarea>
    </div>
    <div v-if="copiable" class="action-container absolute top-0 right-0 h-full p-1 flex gap-1 opacity-0 group-hover:opacity-100">
      <kyButton @click="copyToClipboard" type="button" variant="tertiary" label="Copia" class="btn-xtr" />
      <dropdown>
        <template #trigger>
          <kyButton type="button" variant="tertiary" leftIcon="ChevronDown" class="btn-xtr" />
        </template>
        <template #options>
          <dropdownItem @click="showPassword" :label="type === 'password' ? 'Rivela' : 'Nascondi'" />
        </template>
      </dropdown>
    </div>
  </div>
</template>

<script>
import kyButton from './ky-button.vue';
import dropdown from '../dropdown/dropdown.vue';
import dropdownItem from '../dropdown/dropdown-item.vue';

export default {
  name: 'ky-input-copy',
  components: {
    kyButton,
    dropdown,
    dropdownItem,
  },
  props: {
    type: {
      type: String,
      default: 'text',
    },
    size: {
      type: String,
      default: 'default',
    },
    label: String,
    value: String,
    grouped: {
      type: Boolean,
      default: false,
    },
    copiable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    copyToClipboard() {
      if (!this.copiable && this.disabled) {
        return;
      }

      if (this.type === 'password') {
        this.$emit('copy-password-to-clipboard');
      } else {
        navigator.clipboard.writeText(this.value);
      }
    },
    showPassword() {
      if (this.disabled) {
        return;
      }

      this.$emit('show-password');
    },
  },
};
</script>

<style scoped>
.input-copy-container {
  position: relative;
  background-color: transparent;
  color: black;
  border-color: rgba(0, 0, 0, 0.2);
  min-height: 42px;
  max-height: 52px;
  padding: 0 1rem;
  padding-top: 1.5rem;
  border-radius: 8px;
  outline-color: transparent;
  cursor: default;
}

.input-copy-container.type-notes {
  height: unset !important;
  max-height: unset !important;
  padding: 1rem;
  padding-top: 1.5rem;
}

.input-copy-container:not(.grouped) {
  background-color: rgba(16, 71, 55, 0.1);
}

.input-copy-container.size-default {
  height: 52px;
}

.input-copy-container.size-small {
  height: 42px;
}

.input-copy-container input,
.input-copy-container textarea {
  width: 100%;
  outline: 0;
  resize: none;
  cursor: default;
}

.input-copy-container textarea {
  min-height: 100px;
  cursor: text;
}

.input-label {
  position: absolute;
  z-index: 10;
  top: 50%;
  left: 1rem;
  transform: translateY(-100%);
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(45, 45, 45);
}

.input-copy-container.type-notes .input-label {
  top: 25px;
}

.input-copy-container:not(.type-notes) .action-container {
  align-items: center;
}

.input-copy-container.type-notes .action-container {
  align-items: flex-start;
}

.btn-xtr {
  height: 100% !important;
}
</style>
