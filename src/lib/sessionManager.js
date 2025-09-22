import { supabase } from './supabase';
import { auth } from '../data/auth';
import { store } from '../data/store';

export class SessionManager {
  static async logout(isIdleLogout = false) {
    try {
      // Ferma il timer di idle-timeout
      if (window.idleTimer) {
        window.idleTimer.destroy(); // Usa destroy() invece di stop()
      }

      // Salva il motivo del logout prima di pulire tutto
      if (isIdleLogout) {
        localStorage.setItem('logoutReason', 'idle');
      }

      // Logout da Supabase
      await supabase.auth.signOut();

      // Pulisci tutti i dati locali
      this.clearAllData();

      // Reindirizza alla login
      window.location.href = '/identity/signin';
    } catch (error) {
      console.error('Errore durante il logout:', error);
      // Forza la pulizia anche in caso di errore
      if (isIdleLogout) {
        localStorage.setItem('logoutReason', 'idle');
      }
      this.clearAllData();
      window.location.href = '/identity/signin';
    }
  }

  static clearAllData() {
    // Pulisci auth
    auth.user = null;
    auth.session = null;
    auth.profile = null;
    auth.isAuthenticated = false;

    // Pulisci store
    store.lockVault();

    // Pulisci storage (ma mantieni logoutReason se presente)
    const logoutReason = localStorage.getItem('logoutReason');
    sessionStorage.removeItem('encryptedVaultKey');
    localStorage.removeItem('isAuthenticated');

    // Ripristina logoutReason se era presente
    if (logoutReason) {
      localStorage.setItem('logoutReason', logoutReason);
    }

    // Pulisci solo il timer di auto-lock del vault
    if (store.security.autoLockTimer) {
      clearTimeout(store.security.autoLockTimer);
      store.security.autoLockTimer = null;
    }
  }
}
