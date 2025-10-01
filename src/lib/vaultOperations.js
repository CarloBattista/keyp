import { supabase } from './supabase';
import { auth } from '../data/auth';
import { store } from '../data/store';

/**
 * Elimina un account dal vault
 * @param {Object} account - L'account da eliminare
 * @param {Function} onSuccess - Callback da chiamare in caso di successo
 * @returns {Promise<boolean>} - True se l'eliminazione è riuscita
 */
export async function deleteAccount(account, onSuccess = null) {
  const confirmMessage = `Sei sicuro di voler eliminare l'account "${account.name}"?\n\nQuesta azione è irreversibile.`;

  if (!confirm(confirmMessage)) {
    return false; // L'utente ha annullato
  }

  try {
    const { error } = await supabase.from('vault_entries').delete().eq('id', account.id).eq('profile_id', auth.profile.id);

    if (!error) {
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      return true;
    } else {
      console.error("Errore durante l'eliminazione:", error);
      return false;
    }
  } catch (e) {
    console.error("Errore durante l'eliminazione:", e);
    return false;
  }
}

/**
 * Aggiunge o rimuove un account dai preferiti
 * @param {Object} account - L'account da modificare
 * @param {Function} onSuccess - Callback da chiamare in caso di successo
 * @returns {Promise<boolean>} - True se l'operazione è riuscita
 */
export async function toggleFavorite(account, onSuccess = null) {
  const profileId = auth.profile?.id;
  const accountId = account.id;

  if (!profileId || !accountId) {
    return false;
  }

  try {
    if (account.isFavorite) {
      // Rimuovi dai preferiti
      const { error } = await supabase.from('favorites').delete().eq('profile_id', profileId).eq('account_id', accountId);

      if (!error) {
        account.isFavorite = false;
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }

        store.toast.show = true;
        store.toast.message = 'Rimosso dai preferiti';

        return true;
      }
    } else {
      // Aggiungi ai preferiti
      const { error } = await supabase.from('favorites').insert({
        profile_id: profileId,
        account_id: accountId,
      });

      if (!error) {
        account.isFavorite = true;
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }

        store.toast.show = true;
        store.toast.message = 'Aggiunto ai preferiti';

        return true;
      }
    }
  } catch (e) {
    console.error("Errore durante l'operazione sui preferiti:", e);
    return false;
  }

  return false;
}

/**
 * Carica tutti gli account dal vault
 * @param {string} profileId - ID del profilo utente
 * @returns {Promise<Array|null>} - Array degli account o null in caso di errore
 */
export async function loadVaultEntries(profileId) {
  if (!profileId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('vault_entries')
      .select('id, name, email, password, password_salt, notes, website_logo')
      .eq('profile_id', profileId);

    if (!error) {
      return data;
    } else {
      console.error('Errore durante il caricamento degli account:', error);
      return null;
    }
  } catch (e) {
    console.error('Errore durante il caricamento degli account:', e);
    return null;
  }
}

/**
 * Carica un singolo account dal vault
 * @param {string} accountId - ID dell'account
 * @param {string} profileId - ID del profilo utente
 * @returns {Promise<Object|null>} - Dati dell'account o null in caso di errore
 */
export async function getVaultEntry(accountId, profileId) {
  if (!accountId || !profileId) {
    return null;
  }

  try {
    const { data, error } = await supabase.from('vault_entries').select('*').eq('id', accountId).eq('profile_id', profileId).single();

    if (!error) {
      return data;
    } else {
      console.error("Errore durante il caricamento dell'account:", error);
      return null;
    }
  } catch (e) {
    console.error("Errore durante il caricamento dell'account:", e);
    return null;
  }
}
