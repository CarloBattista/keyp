<template>
  <div class="w-full">
    <div class="flex items-center justify-end mb-1">
      <span class="text-[#666] text-sm font-medium">{{ strength.label }}</span>
    </div>
    <div class="bar-track h-2 rounded-lg overflow-hidden">
      <div class="h-full transition-all" :style="{ width: strength.percent + '%', backgroundColor: strength.color }"></div>
    </div>
  </div>
</template>

<script>
import zxcvbn from 'zxcvbn';
import { store } from '../../data/store';

export default {
  name: 'strength-bar',
  props: {
    password: {
      type: String,
      default: '',
    },
    label: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      store,
    };
  },
  computed: {
    currentPassword() {
      // Usa la prop se presente, altrimenti fallback al modal Dettagli account
      return this.password || this.store?.modals?.account?.data?.tempDecryptedPassword || '';
    },
    strength() {
      return this.getStrength(this.currentPassword);
    },
  },
  methods: {
    // ... existing code ...
    getStrength(pwd) {
      if (!pwd) {
        return { percent: 0, label: 'Terribile', color: '#f4512a' };
      }
      const { score } = zxcvbn(pwd); // 0-4
      const len = pwd.length;

      if (score <= 0) return { percent: 10, label: 'Terribile', color: '#f4512a' };
      if (score === 1) return { percent: 25, label: 'Debole', color: '#fa0' };
      if (score === 2) return { percent: 50, label: 'Sufficiente', color: '#fcdb03' };
      if (score === 3) return { percent: 75, label: 'Buona', color: '#bae84c' };
      if (score === 4) {
        // Raffiniamo il livello massimo con la lunghezza
        if (len >= 16) return { percent: 100, label: 'Fantastica', color: '#1ba300' };
        return { percent: 90, label: 'Molto buona', color: '#81e022' };
      }

      return { percent: 0, label: 'Terribile', color: '#f4512a' };
    },
    // ... existing code ...
  },
};
</script>

<style scoped>
.bar-track {
  background-color: rgba(16, 71, 55, 0.1);
}
</style>
