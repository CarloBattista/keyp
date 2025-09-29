/**
 * Genera un avatar fallback con iniziali e colore di background casuale
 * @param {string} accountName - Nome dell'account
 * @param {number} size - Dimensione dell'avatar in pixel (default: 64)
 * @returns {string} Data URL dell'SVG generato
 */
export function generateAvatarFallback(accountName, size = 64) {
  if (!accountName) {
    return generateDefaultAvatar(size);
  }

  // Estrae le prime due lettere del nome dell'account
  const initials = getAccountInitials(accountName);

  // Seleziona un colore basato sul nome dell'account per consistenza
  const backgroundColor = getAccountColor(accountName);

  // Genera un SVG con le iniziali
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.1875}" fill="${backgroundColor}"/>
      <text x="${size / 2}" y="${size * 0.625}" 
            font-family="Arial, sans-serif" 
            font-size="${size * 0.375}" 
            font-weight="600" 
            text-anchor="middle" 
            fill="white">${initials}</text>
    </svg>
  `;

  // Converte l'SVG in data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Estrae le iniziali dal nome dell'account
 * @param {string} accountName - Nome dell'account
 * @returns {string} Prime due lettere (prima maiuscola, seconda minuscola)
 */
export function getAccountInitials(accountName) {
  if (!accountName) return '?';

  // Rimuove spazi e caratteri speciali, prende solo lettere
  const cleanName = accountName.trim().replace(/[^a-zA-Z]/g, '');

  if (cleanName.length === 0) return '?';

  if (cleanName.length === 1) {
    // Se c'è solo una lettera, la restituisce maiuscola
    return cleanName.charAt(0).toUpperCase();
  }

  // Prende le prime due lettere: prima maiuscola, seconda minuscola
  const firstLetter = cleanName.charAt(0).toUpperCase();
  const secondLetter = cleanName.charAt(1).toLowerCase();

  return firstLetter + secondLetter;
}

/**
 * Genera un colore consistente basato sul nome dell'account
 * @param {string} accountName - Nome dell'account
 * @returns {string} Colore esadecimale
 */
export function getAccountColor(accountName) {
  if (!accountName) return '#999999';

  const colors = [
    '#ff4081',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
    '#9e9e9e',
    '#607d8b',
    '#f44336',
  ];

  // Genera un hash basato sul nome per consistenza
  const hash = accountName
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = hash % colors.length;
  return colors[colorIndex];
}

/**
 * Genera un avatar di default quando non c'è un nome
 * @param {number} size - Dimensione dell'avatar
 * @returns {string} Data URL dell'SVG
 */
function generateDefaultAvatar(size = 64) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.1875}" fill="#999999"/>
      <text x="${size / 2}" y="${size * 0.625}" 
            font-family="Arial, sans-serif" 
            font-size="${size * 0.375}" 
            font-weight="600" 
            text-anchor="middle" 
            fill="white">?</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Verifica se un URL è un avatar generato automaticamente
 * @param {string} url - URL da verificare
 * @returns {boolean} True se è un avatar generato
 */
export function isGeneratedAvatar(url) {
  return url && url.startsWith('data:image/svg+xml;base64,');
}

/**
 * Genera un avatar con dimensioni specifiche per diversi contesti
 */
export const AvatarSizes = {
  SMALL: 32, // Per liste compatte
  MEDIUM: 48, // Per card normali
  LARGE: 64, // Per modal e dettagli
  XLARGE: 96, // Per profili e header
};
