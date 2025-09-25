import { supabase } from './supabase';
import { auth } from '../data/auth';
import { store } from '../data/store';

/**
 * Esegue il logout completo dall'applicazione
 * - Logout da Supabase
 * - Reset dello stato auth
 * - Blocco del vault
 * - Pulizia del localStorage e sessionStorage
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase logout error:', error);
    }

    // 2. Reset dello stato di autenticazione
    auth.user = null;
    auth.session = null;
    auth.profile = null;
    auth.isAuthenticated = false;

    // 3. Blocca il vault e pulisci i dati sensibili
    store.lockVault();

    // 4. Pulizia del localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sb-' + supabase.supabaseUrl.split('//')[1] + '-auth-token');

    // 5. Pulizia del sessionStorage (vault key)
    sessionStorage.removeItem('vaultKey');
    sessionStorage.removeItem('vaultUnlocked');
    sessionStorage.removeItem('encryptedVaultKey');

    // console.log('Logout completed successfully');

    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);

    // Anche in caso di errore, pulisci lo stato locale
    auth.user = null;
    auth.session = null;
    auth.isAuthenticated = false;
    auth.profile = null;
    store.lockVault();
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('vaultKey');
    sessionStorage.removeItem('vaultUnlocked');
    sessionStorage.removeItem('encryptedVaultKey');

    return { success: false, error: error.message };
  }
}

/**
 * Logout rapido senza attendere la risposta di Supabase
 * Utile per situazioni di emergenza o timeout
 */
export function forceLogout() {
  // Reset immediato dello stato
  auth.user = null;
  auth.session = null;
  auth.isAuthenticated = false;
  auth.profile = null;
  store.lockVault();

  // Pulizia storage
  localStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('vaultKey');
  sessionStorage.removeItem('vaultUnlocked');

  // Logout asincrono da Supabase (senza attendere)
  supabase.auth.signOut().catch((error) => {
    console.error('Background Supabase logout failed:', error);
  });
}
