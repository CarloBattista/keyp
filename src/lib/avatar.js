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
    '#FF6B6B', // Rosso corallo
    '#4ECDC4', // Turchese
    '#45B7D1', // Blu cielo
    '#96CEB4', // Verde menta
    '#FFEAA7', // Giallo pastello
    '#DDA0DD', // Viola chiaro
    '#98D8C8', // Verde acqua
    '#F7DC6F', // Giallo oro
    '#BB8FCE', // Lavanda
    '#85C1E9', // Blu pastello
    '#F8C471', // Arancione pastello
    '#82E0AA', // Verde lime
    '#F1948A', // Rosa salmone
    '#AED6F1', // Azzurro
    '#D7BDE2', // Malva
    '#A3E4D7', // Verde acquamarina
    '#F9E79F', // Giallo limone
    '#D5A6BD', // Rosa antico
    '#A9DFBF', // Verde salvia
    '#FAD7A0', // Pesca
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
