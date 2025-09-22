import { createApp } from 'vue';
import './style/style.css';
import App from './App.vue';

import router from './routing/router';
import idleTimeout from 'idle-timeout';
import { SessionManager } from './lib/sessionManager';

const timerTimeout = 15 * 60 * 1000; // 15 minuti

const idleTimer = idleTimeout(
  () => {
    console.log('Utente inattivo - logout automatico');
    SessionManager.logout(true);
  },
  {
    timeout: timerTimeout,
    loop: false, // Non ripetere automaticamente
  }
);

window.idleTimer = idleTimer;

const app = createApp(App);
app.use(router);
app.mount('#app');
