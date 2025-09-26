<template>
  <div class="notification-container relative px-4 py-3 rounded-lg flex gap-2 items-start" :class="'type-' + type">
    <div class="icon relative h-8 flex items-center justify-center">
      <Info v-if="type === 'info'" />
      <CircleCheck v-else-if="type === 'success'" />
      <TriangleAlert v-else-if="type === 'warning'" />
      <CircleX v-else-if="type === 'error'" />
    </div>
    <div v-if="message" class="w-full">
      <p class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
// ICONS
import { Info, CircleCheck, TriangleAlert, CircleX } from 'lucide-vue-next';

export default {
  name: 'notification',
  components: {
    // ICONS
    Info,
    CircleCheck,
    TriangleAlert,
    CircleX,
  },
  props: {
    type: {
      type: String,
      default: 'info',
    },
    icon: String,
    message: String,
  },
};
</script>

<style scoped>
.notification-container {
  border: 1px solid transparent;
}

.notification-container.type-info {
  background-color: rgba(60, 180, 255, 0.2);
  border-color: rgba(60, 180, 255, 1);
  color: #0e2a3c;
}

.notification-container.type-success {
  background-color: rgba(59, 209, 69, 0.2);
  border-color: rgba(59, 209, 69, 1);
  color: #17531b;
}

.notification-container.type-warning {
  background-color: rgba(255, 206, 60, 0.2);
  border-color: rgba(255, 206, 60, 1);
  color: #564614;
}

.notification-container.type-error {
  background-color: rgba(255, 60, 60, 0.2);
  border-color: rgba(255, 60, 60, 1);
  color: #561414;
}
</style>
