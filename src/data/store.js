import { reactive } from 'vue';

export const store = reactive({
  sidebar: {
    open: true,
  },

  accounts: {
    data: [],
    error: null,
    loading: true,
  },

  security: {
    vaultKey: null, // Derivata dalla master password, mai salvata
    isUnlocked: false, // Indica se il vault è sbloccato
    autoLockTimer: null, // Timer per blocco automatico
    lastActivity: null, // Ultima attività per auto-lock
  },

  modals: {
    newAccount: {
      data: {
        name: 'Test',
        username: '',
        email: 'test@gmail.com',
        password: 'carlone',
        notes: 'This is only for developing',
      },
      error: {
        name: null,
        username: null,
        email: null,
        password: null,
        notes: null,
      },
      open: false,
      loading: false,
    },
  },

  // Funzioni di sicurezza
  lockVault() {
    this.security.vaultKey = null;
    this.security.isUnlocked = false;
    this.accounts.data = [];

    if (this.security.autoLockTimer) {
      clearTimeout(this.security.autoLockTimer);
      this.security.autoLockTimer = null;
    }
  },
  unlockVault(vaultKey) {
    this.security.vaultKey = vaultKey;
    this.security.isUnlocked = true;
    this.security.lastActivity = Date.now();

    this.startAutoLockTimer();
  },
  restoreVaultFromSession() {
    return false;
  },
  startAutoLockTimer() {
    // Timer rimosso - idle-timeout gestisce l'inattività globalmente
    // Manteniamo solo il timer di auto-lock del vault (5 minuti)
    if (this.security.autoLockTimer) {
      clearTimeout(this.security.autoLockTimer);
    }
    this.security.autoLockTimer = setTimeout(
      () => {
        this.lockVault();
      },
      5 * 60 * 1000
    ); // 5 minuti
  },
  init() {
    // Prova a ripristinare automaticamente la vault key al caricamento
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated && !this.security.isUnlocked) {
      // console.log('Auto-restoring vault from sessionStorage on init...');
      this.restoreVaultFromSession();
    }
  },
});

store.init();
