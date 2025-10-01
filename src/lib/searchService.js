import { supabase } from './supabase';

/**
 * Servizio per la ricerca degli account nel vault
 */
export class SearchService {
  /**
   * Cerca account nel vault dell'utente
   * @param {string} profileId - ID del profilo utente
   * @param {string} searchTerm - Termine di ricerca
   * @param {Object} options - Opzioni di ricerca
   * @returns {Promise<Array>} Array degli account trovati
   */
  static async searchAccounts(profileId, searchTerm, options = {}) {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'name',
      sortOrder = 'asc',
      includeFields = ['id', 'name', 'email', 'website_logo', 'notes', 'created_at', 'updated_at'],
    } = options;

    try {
      if (!profileId) {
        throw new Error('Profile ID è richiesto per la ricerca');
      }

      let query = supabase.from('vault_entries').select(includeFields.join(', ')).eq('profile_id', profileId);

      // Se c'è un termine di ricerca, applica i filtri
      if (searchTerm && searchTerm.trim()) {
        const cleanSearchTerm = searchTerm.trim();

        // Ricerca in più campi usando ilike (case-insensitive)
        query = query.or(`name.ilike.%${cleanSearchTerm}%,email.ilike.%${cleanSearchTerm}%,notes.ilike.%${cleanSearchTerm}%`);
      }

      // Applica ordinamento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Applica paginazione
      if (limit > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore nella ricerca degli account:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel servizio di ricerca:', error);
      throw error;
    }
  }

  /**
   * Cerca account con filtri avanzati
   * @param {string} profileId - ID del profilo utente
   * @param {Object} filters - Filtri di ricerca avanzati
   * @returns {Promise<Array>} Array degli account trovati
   */
  static async searchAccountsAdvanced(profileId, filters = {}) {
    const { searchTerm = '', dateFrom = null, dateTo = null, hasNotes = null, sortBy = 'name', sortOrder = 'asc', limit = 50, offset = 0 } = filters;

    try {
      if (!profileId) {
        throw new Error('Profile ID è richiesto per la ricerca');
      }

      let query = supabase.from('vault_entries').select('id, name, email, website_logo, notes, created_at, updated_at').eq('profile_id', profileId);

      // Filtro per termine di ricerca
      if (searchTerm && searchTerm.trim()) {
        const cleanSearchTerm = searchTerm.trim();
        query = query.or(`name.ilike.%${cleanSearchTerm}%,email.ilike.%${cleanSearchTerm}%,notes.ilike.%${cleanSearchTerm}%`);
      }

      // Filtro per data di creazione
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      // Filtro per presenza di note
      if (hasNotes === true) {
        query = query.not('notes', 'is', null).neq('notes', '');
      } else if (hasNotes === false) {
        query = query.or('notes.is.null,notes.eq.');
      }

      // Ordinamento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Paginazione
      if (limit > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore nella ricerca avanzata degli account:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel servizio di ricerca avanzata:', error);
      throw error;
    }
  }

  /**
   * Ottiene suggerimenti di ricerca basati sui termini più comuni
   * @param {string} profileId - ID del profilo utente
   * @param {string} partialTerm - Termine parziale per i suggerimenti
   * @returns {Promise<Array>} Array di suggerimenti
   */
  static async getSearchSuggestions(profileId, partialTerm = '') {
    try {
      if (!profileId) {
        throw new Error('Profile ID è richiesto per i suggerimenti');
      }

      let query = supabase.from('vault_entries').select('name, email').eq('profile_id', profileId);

      if (partialTerm && partialTerm.trim()) {
        const cleanTerm = partialTerm.trim();
        query = query.or(`name.ilike.%${cleanTerm}%,email.ilike.%${cleanTerm}%`);
      }

      query = query.limit(10);

      const { data, error } = await query;

      if (error) {
        console.error('Errore nel recupero dei suggerimenti:', error);
        throw error;
      }

      // Estrae i suggerimenti unici
      const suggestions = new Set();

      data?.forEach((account) => {
        if (account.name) suggestions.add(account.name);
        if (account.email) suggestions.add(account.email);
      });

      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Errore nel servizio suggerimenti:', error);
      throw error;
    }
  }

  /**
   * Conta il numero totale di risultati per una ricerca
   * @param {string} profileId - ID del profilo utente
   * @param {string} searchTerm - Termine di ricerca
   * @returns {Promise<number>} Numero totale di risultati
   */
  static async countSearchResults(profileId, searchTerm = '') {
    try {
      if (!profileId) {
        throw new Error('Profile ID è richiesto per il conteggio');
      }

      let query = supabase.from('vault_entries').select('id', { count: 'exact', head: true }).eq('profile_id', profileId);

      if (searchTerm && searchTerm.trim()) {
        const cleanSearchTerm = searchTerm.trim();
        query = query.or(`name.ilike.%${cleanSearchTerm}%,email.ilike.%${cleanSearchTerm}%,notes.ilike.%${cleanSearchTerm}%`);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Errore nel conteggio dei risultati:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Errore nel servizio di conteggio:', error);
      throw error;
    }
  }
}

/**
 * Funzioni di utilità per la ricerca
 */
export const SearchUtils = {
  /**
   * Raggruppa i risultati di ricerca per lettera iniziale
   * @param {Array} accounts - Array degli account
   * @returns {Object} Oggetto con account raggruppati per lettera
   */
  groupAccountsByLetter(accounts) {
    if (!accounts || accounts.length === 0) {
      return {};
    }

    const grouped = accounts.reduce((acc, account) => {
      const firstLetter = (account.name || '').charAt(0).toUpperCase();
      const letter = firstLetter.match(/[A-Z]/) ? firstLetter : '#';

      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(account);
      return acc;
    }, {});

    // Ordina gli account all'interno di ogni gruppo
    Object.keys(grouped).forEach((letter) => {
      grouped[letter].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it', { sensitivity: 'base' }));
    });

    // Ordina le lettere alfabeticamente (# alla fine)
    const sortedGrouped = {};
    const sortedLetters = Object.keys(grouped).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'it');
    });

    sortedLetters.forEach((letter) => {
      sortedGrouped[letter] = grouped[letter];
    });

    return sortedGrouped;
  },

  /**
   * Evidenzia i termini di ricerca nei risultati
   * @param {string} text - Testo da evidenziare
   * @param {string} searchTerm - Termine da evidenziare
   * @returns {string} Testo con evidenziazione HTML
   */
  highlightSearchTerm(text, searchTerm) {
    if (!text || !searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Debounce per ottimizzare le ricerche in tempo reale
   * @param {Function} func - Funzione da eseguire
   * @param {number} delay - Ritardo in millisecondi
   * @returns {Function} Funzione con debounce
   */
  debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};
