/**
 * Utility per la formattazione delle date
 */

/**
 * Formatta una data in formato leggibile
 * @param {string|Date} dateString - La data da formattare
 * @param {Object} options - Opzioni di formattazione
 * @returns {string} Data formattata
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';

  const date = new Date(dateString);
  
  // Verifica che la data sia valida
  if (isNaN(date.getTime())) return '';

  const defaultOptions = {
    showTime: true,
    showSeconds: false,
    relative: false,
    locale: 'it-IT',
    ...options
  };

  // Se richiesto formato relativo (es. "2 giorni fa")
  if (defaultOptions.relative) {
    return formatRelativeDate(date, defaultOptions.locale);
  }

  // Formato standard
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: undefined
  };

  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(defaultOptions.showSeconds && { second: '2-digit' })
  };

  let formattedDate = date.toLocaleDateString(defaultOptions.locale, dateOptions);
  
  if (defaultOptions.showTime) {
    const formattedTime = date.toLocaleTimeString(defaultOptions.locale, timeOptions);
    formattedDate += ` alle ${formattedTime}`;
  }

  return formattedDate;
}

/**
 * Formatta una data in formato relativo (es. "2 giorni fa", "ieri", "oggi")
 * @param {Date} date - La data da formattare
 * @param {string} locale - Locale per la formattazione
 * @returns {string} Data in formato relativo
 */
export function formatRelativeDate(date, locale = 'it-IT') {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Configurazione per diverse lingue
  const translations = {
    'it-IT': {
      now: 'Proprio ora',
      minute: 'minuto',
      minutes: 'minuti',
      hour: 'ora',
      hours: 'ore',
      yesterday: 'Ieri',
      days: 'giorni',
      week: 'settimana',
      weeks: 'settimane',
      month: 'mese',
      months: 'mesi',
      year: 'anno',
      years: 'anni',
      ago: 'fa'
    },
    'en-US': {
      now: 'Just now',
      minute: 'minute',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      yesterday: 'Yesterday',
      days: 'days',
      week: 'week',
      weeks: 'weeks',
      month: 'month',
      months: 'months',
      year: 'year',
      years: 'years',
      ago: 'ago'
    }
  };

  const t = translations[locale] || translations['it-IT'];

  // Meno di un minuto fa
  if (diffInMinutes < 1) {
    return t.now;
  }

  // Meno di un'ora fa
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? t.minute : t.minutes} ${t.ago}`;
  }

  // Meno di un giorno fa
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? t.hour : t.hours} ${t.ago}`;
  }

  // Ieri
  if (diffInDays === 1) {
    return t.yesterday;
  }

  // Meno di una settimana fa
  if (diffInDays < 7) {
    return `${diffInDays} ${t.days} ${t.ago}`;
  }

  // Meno di un mese fa
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? t.week : t.weeks} ${t.ago}`;
  }

  // Meno di un anno fa
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? t.month : t.months} ${t.ago}`;
  }

  // Più di un anno fa
  const years = Math.floor(diffInDays / 365);
  return `${years} ${years === 1 ? t.year : t.years} ${t.ago}`;
}

/**
 * Formatta una data per la creazione
 * @param {string|Date} dateString - La data di creazione
 * @param {Object} options - Opzioni di formattazione
 * @returns {string} Data formattata
 */
export function formatCreatedDate(dateString, options = {}) {
  return formatDate(dateString, { showTime: false, ...options });
}

/**
 * Formatta una data per l'ultima modifica
 * @param {string|Date} dateString - La data di ultima modifica
 * @param {Object} options - Opzioni di formattazione
 * @returns {string} Data formattata
 */
export function formatUpdatedDate(dateString, options = {}) {
  return formatDate(dateString, { relative: true, ...options });
}

/**
 * Formatta una data in formato compatto (es. "15 gen 2024")
 * @param {string|Date} dateString - La data da formattare
 * @param {string} locale - Locale per la formattazione
 * @returns {string} Data in formato compatto
 */
export function formatDateCompact(dateString, locale = 'it-IT') {
  if (!dateString) return '';

  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formatta una data con solo giorno e mese
 * @param {string|Date} dateString - La data da formattare
 * @param {string} locale - Locale per la formattazione
 * @returns {string} Data formattata
 */
export function formatDateShort(dateString, locale = 'it-IT') {
  if (!dateString) return '';

  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric'
  });
}
