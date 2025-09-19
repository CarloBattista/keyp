import CryptoJS from 'crypto-js';

/**
 * Genera una chiave vault casuale per l'utente
 * @returns {string} - Chiave vault casuale di 64 caratteri
 */
export function generateVaultKey() {
  // Genera una chiave casuale di 256 bit (32 byte = 64 caratteri hex)
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Genera un salt casuale
 * @returns {string} - Salt casuale di 32 caratteri hex
 */
export function generateSalt() {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Cripta una password usando AES con salt per maggiore sicurezza
 * @param {string} password - La password da crittografare
 * @param {string} vaultKey - La chiave vault dell'utente
 * @param {string} salt - Salt opzionale (se non fornito, ne viene generato uno nuovo)
 * @returns {object} - Oggetto contenente password crittografata e salt
 */
export function encryptPassword(password, vaultKey, salt = null) {
  try {
    // Genera un salt casuale se non fornito
    const usedSalt = salt || generateSalt();

    // Combina la chiave vault con il salt per una sicurezza maggiore
    const derivedKey = CryptoJS.PBKDF2(vaultKey, usedSalt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    const encrypted = CryptoJS.AES.encrypt(password, derivedKey.toString()).toString();

    return {
      encryptedPassword: encrypted,
      salt: usedSalt,
    };
  } catch (error) {
    console.error('Errore durante la crittografia:', error);
    throw new Error('Impossibile crittografare la password');
  }
}

/**
 * Decripta una password usando AES con il salt corrispondente
 * @param {string} encryptedPassword - La password crittografata
 * @param {string} vaultKey - La chiave vault dell'utente
 * @param {string} salt - Il salt utilizzato per la crittografia
 * @returns {string} - La password in chiaro
 */
export function decryptPassword(encryptedPassword, vaultKey, salt) {
  try {
    // Ricostruisce la stessa chiave derivata usata per la crittografia
    const derivedKey = CryptoJS.PBKDF2(vaultKey, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, derivedKey.toString());
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      throw new Error('Decrittografia fallita - chiave o salt non validi');
    }

    return plaintext;
  } catch (error) {
    console.error('Errore durante la decrittografia:', error);
    throw new Error('Impossibile decrittografare la password');
  }
}

/**
 * Funzioni di compatibilità per il codice esistente (senza salt)
 * Queste funzioni mantengono la compatibilità con i dati già esistenti
 */
export function encryptPasswordLegacy(password, vaultKey) {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, vaultKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Errore durante la crittografia legacy:', error);
    throw new Error('Impossibile crittografare la password');
  }
}

export function decryptPasswordLegacy(encryptedPassword, vaultKey) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, vaultKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Errore durante la decrittografia legacy:', error);
    throw new Error('Impossibile decrittografare la password');
  }
}

/**
 * Pulisce i dati sensibili dalla memoria
 * @param {object} obj - Oggetto contenente dati sensibili
 * @param {array} sensitiveFields - Array dei campi da pulire
 */
export function clearSensitiveData(obj, sensitiveFields = ['password', 'decryptedPassword', 'plaintext']) {
  sensitiveFields.forEach((field) => {
    if (obj && obj[field]) {
      // Sovrascrive il valore con caratteri casuali prima di eliminarlo
      obj[field] = CryptoJS.lib.WordArray.random(obj[field].length).toString().substring(0, obj[field].length);
      delete obj[field];
    }
  });
}

/**
 * Cripta una password usando AES con una chiave specifica (funzione alternativa)
 * @param {string} password - La password da crittografare
 * @param {string} vaultKey - La chiave vault dell'utente
 * @returns {string} - La password crittografata
 */
export function encryptPasswordWithVaultKey(password, vaultKey) {
  return encryptPasswordLegacy(password, vaultKey);
}

/**
 * Decripta una password usando AES con una chiave specifica (funzione alternativa)
 * @param {string} encryptedPassword - La password crittografata
 * @param {string} vaultKey - La chiave vault dell'utente
 * @returns {string} - La password in chiaro
 */
export function decryptPasswordWithVaultKey(encryptedPassword, vaultKey) {
  return decryptPasswordLegacy(encryptedPassword, vaultKey);
}

/**
 * Deriva una chiave da una master password e un salt
 * @param {string} masterPassword - La master password
 * @param {string} salt - Il salt
 * @returns {string} - La chiave derivata
 */
export function deriveKey(masterPassword, salt) {
  return CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
}
