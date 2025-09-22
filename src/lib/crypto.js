import CryptoJS from 'crypto-js';
import { argon2id } from 'hash-wasm';

/**
 * Genera un salt unico per il vault dell'utente
 * @returns {string} - Salt casuale di 32 caratteri hex
 */
export function generateVaultSalt() {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Deriva la vault_key dalla master password usando Argon2id (hash-wasm)
 * @param {string} masterPassword - La master password dell'utente
 * @param {string} vaultSalt - Il salt unico dell'utente salvato su Supabase
 * @returns {Promise<string>} - La vault_key derivata
 */
export async function deriveVaultKey(masterPassword, vaultSalt) {
  try {
    const hash = await argon2id({
      password: masterPassword,
      salt: vaultSalt,
      parallelism: 1,
      iterations: 3,
      memorySize: 65536, // 64MB
      hashLength: 32,
      outputType: 'hex',
    });

    return hash;
  } catch (error) {
    console.error('Errore durante la derivazione della vault key:', error);
    throw new Error('Impossibile derivare la vault key');
  }
}

/**
 * Genera un salt casuale per le singole password
 * @returns {string} - Salt casuale di 16 caratteri hex
 */
export function generatePasswordSalt() {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Cripta una password usando AES con la vault_key derivata
 * @param {string} password - La password da crittografare
 * @param {string} vaultKey - La vault_key derivata da Argon2
 * @param {string} passwordSalt - Salt opzionale per la password (se non fornito, ne viene generato uno nuovo)
 * @returns {object} - Oggetto contenente password crittografata e salt
 */
export function encryptPasswordWithVaultKey(password, vaultKey, passwordSalt = null) {
  try {
    // Genera un salt casuale se non fornito
    const usedSalt = passwordSalt || generatePasswordSalt();

    // Combina la vault_key con il salt per una sicurezza maggiore
    const derivedKey = CryptoJS.PBKDF2(vaultKey, usedSalt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    const encrypted = CryptoJS.AES.encrypt(password, derivedKey.toString()).toString();

    return {
      encryptedPassword: encrypted,
      passwordSalt: usedSalt,
    };
  } catch (error) {
    console.error('Errore durante la crittografia:', error);
    throw new Error('Impossibile crittografare la password');
  }
}

/**
 * Decripta una password usando AES con la vault_key derivata
 * @param {string} encryptedPassword - La password crittografata
 * @param {string} vaultKey - La vault_key derivata da Argon2
 * @param {string} passwordSalt - Il salt utilizzato per la crittografia
 * @returns {string} - La password in chiaro
 */
export function decryptPasswordWithVaultKey(encryptedPassword, vaultKey, passwordSalt) {
  try {
    // Ricostruisce la stessa chiave derivata usata per la crittografia
    const derivedKey = CryptoJS.PBKDF2(vaultKey, passwordSalt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, derivedKey.toString());
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      throw new Error('Decrittografia fallita - vault_key o salt non validi');
    }

    return plaintext;
  } catch (error) {
    console.error('Errore durante la decrittografia:', error);
    throw new Error('Impossibile decrittografare la password');
  }
}

/**
 * Cancella dati sensibili dalla memoria
 * @param {object} obj - Oggetto contenente dati sensibili
 * @param {array} sensitiveFields - Array di campi da cancellare
 */
export function clearSensitiveData(obj, sensitiveFields = ['masterPassword', 'vaultKey', 'decryptedPassword', 'plaintext']) {
  sensitiveFields.forEach((field) => {
    if (obj && obj[field]) {
      obj[field] = null;
      delete obj[field];
    }
  });
}

/**
 * Valida la forza della master password
 * @param {string} masterPassword - La master password da validare
 * @returns {object} - Oggetto con validità e suggerimenti
 */
export function validateMasterPassword(masterPassword) {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(masterPassword);
  const hasLowerCase = /[a-z]/.test(masterPassword);
  const hasNumbers = /\d/.test(masterPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(masterPassword);

  const issues = [];

  if (masterPassword.length < minLength) {
    issues.push(`Deve essere lunga almeno ${minLength} caratteri`);
  }
  if (!hasUpperCase) {
    issues.push('Deve contenere almeno una lettera maiuscola');
  }
  if (!hasLowerCase) {
    issues.push('Deve contenere almeno una lettera minuscola');
  }
  if (!hasNumbers) {
    issues.push('Deve contenere almeno un numero');
  }
  if (!hasSpecialChar) {
    issues.push('Deve contenere almeno un carattere speciale');
  }

  return {
    isValid: issues.length === 0,
    issues: issues,
    strength: issues.length === 0 ? 'forte' : issues.length <= 2 ? 'media' : 'debole',
  };
}

// Funzioni legacy per compatibilità con dati esistenti
export function generateVaultKey() {
  return CryptoJS.lib.WordArray.random(32).toString();
}

export function generateSalt() {
  return CryptoJS.lib.WordArray.random(16).toString();
}

export function encryptPassword(password, vaultKey, salt = null) {
  try {
    const usedSalt = salt || generateSalt();
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

export function decryptPassword(encryptedPassword, vaultKey, salt) {
  try {
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
 * Genera un hash di verifica per la master password
 * @param {string} masterPassword - La master password dell'utente
 * @param {string} vaultSalt - Il salt unico dell'utente
 * @returns {Promise<string>} - Hash di verifica
 */
export async function generateMasterPasswordHash(masterPassword, vaultSalt) {
  try {
    const hash = await argon2id({
      password: masterPassword + '_verification',
      salt: vaultSalt,
      parallelism: 1,
      iterations: 3,
      memorySize: 65536,
      hashLength: 32,
      outputType: 'hex',
    });

    return hash;
  } catch (error) {
    console.error('Errore durante la generazione hash verifica:', error);
    throw new Error('Impossibile generare hash di verifica');
  }
}

/**
 * Verifica se la master password è corretta
 * @param {string} masterPassword - La master password da verificare
 * @param {string} vaultSalt - Il salt dell'utente
 * @param {string} storedHash - L'hash salvato nel database
 * @returns {Promise<boolean>} - True se la password è corretta
 */
export async function verifyMasterPassword(masterPassword, vaultSalt, storedHash) {
  try {
    const hash = await generateMasterPasswordHash(masterPassword, vaultSalt);
    return hash === storedHash;
  } catch (error) {
    console.error('Errore durante la verifica:', error);
    return false;
  }
}

/**
 * Genera una Secret Key casuale nel formato A3-RQVMY5-5BBPMH-WGYHA-BTBBD-TMHPF-4KG8Z
 * @returns {string} - Secret Key nel formato specificato
 */
export function generateSecretKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Definisce le lunghezze dei segmenti: 2-6-6-5-5-5-5
  const segmentLengths = [2, 6, 6, 5, 5, 5, 5];
  const segments = [];

  // Genera ogni segmento
  for (const length of segmentLengths) {
    let segment = '';
    for (let i = 0; i < length; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }

  // Unisce i segmenti con trattini
  return segments.join('-');
}

/**
 * Genera un salt per la Secret Key
 * @returns {string} - Salt casuale di 16 caratteri hex
 */
export function generateSecretKeySalt() {
  return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Crea un hash della Secret Key con salt
 * @param {string} secretKey - La Secret Key da hashare
 * @param {string} salt - Il salt per l'hash
 * @returns {string} - Hash della Secret Key
 */
export function hashSecretKey(secretKey, salt) {
  return CryptoJS.SHA256(secretKey + salt).toString();
}

/**
 * Verifica una Secret Key contro il suo hash
 * @param {string} secretKey - La Secret Key da verificare
 * @param {string} salt - Il salt usato per l'hash
 * @param {string} hash - L'hash memorizzato
 * @returns {boolean} - True se la Secret Key è corretta
 */
export function verifySecretKey(secretKey, salt, hash) {
  return hashSecretKey(secretKey, salt) === hash;
}

/**
 * Deriva la Vault Key combinando password, vault salt e secret key
 * @param {string} password - La master password
 * @param {string} vaultSalt - Il salt del vault
 * @param {string} secretKey - La Secret Key
 * @returns {string} - La Vault Key derivata
 */
export function deriveVaultKeyWithSecret(password, vaultSalt, secretKey) {
  // Combina password e secret key
  const combined = password + secretKey;

  // Deriva la chiave usando SHA256 con il vault salt
  return CryptoJS.SHA256(combined + vaultSalt).toString();
}

/**
 * Versione asincrona per derivare la Vault Key con Secret Key usando Argon2
 * @param {string} masterPassword - La master password
 * @param {string} secretKey - La Secret Key
 * @param {string} vaultSalt - Il salt del vault
 * @returns {Promise<string>} - La Vault Key derivata
 */
export async function deriveVaultKeyWithSecretKey(masterPassword, secretKey, vaultSalt) {
  try {
    // Combina password e secret key
    const combined = masterPassword + secretKey;

    const hash = await argon2id({
      password: combined,
      salt: vaultSalt,
      parallelism: 1,
      iterations: 3,
      memorySize: 65536, // 64MB
      hashLength: 32,
      outputType: 'hex',
    });

    return hash;
  } catch (error) {
    console.error('Errore durante la derivazione della vault key con secret:', error);
    throw new Error('Impossibile derivare la vault key con secret key');
  }
}

/**
 * Utility per WebCrypto API - Converte stringa in ArrayBuffer
 */
function stringToArrayBuffer(str) {
  return new TextEncoder().encode(str);
}

/**
 * Utility per WebCrypto API - Converte ArrayBuffer in stringa
 */
function arrayBufferToString(buffer) {
  return new TextDecoder().decode(buffer);
}

/**
 * Utility per WebCrypto API - Converte ArrayBuffer in Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Utility per WebCrypto API - Converte Base64 in ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Deriva una chiave AES da una stringa usando WebCrypto API
 * @param {string} keyMaterial - Materiale per la chiave (es. access_token)
 * @returns {Promise<CryptoKey>} - Chiave AES derivata
 */
export async function deriveAESKey(keyMaterial) {
  const keyData = stringToArrayBuffer(keyMaterial);
  
  // Importa il materiale della chiave
  const baseKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Deriva la chiave AES
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: stringToArrayBuffer('keyp-vault-salt'), // Salt fisso per consistenza
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
  
  return aesKey;
}

/**
 * Cifra un testo usando AES-GCM con WebCrypto API
 * @param {string} plaintext - Testo da cifrare
 * @param {string} keyMaterial - Materiale per la chiave
 * @returns {Promise<string>} - Testo cifrato in Base64
 */
export async function encryptAES(plaintext, keyMaterial) {
  try {
    const key = await deriveAESKey(keyMaterial);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV per GCM
    const data = stringToArrayBuffer(plaintext);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );
    
    // Combina IV + dati cifrati
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Errore cifratura AES:', error);
    throw new Error('Impossibile cifrare i dati');
  }
}

/**
 * Decifra un testo usando AES-GCM con WebCrypto API
 * @param {string} ciphertext - Testo cifrato in Base64
 * @param {string} keyMaterial - Materiale per la chiave
 * @returns {Promise<string>} - Testo decifrato
 */
export async function decryptAES(ciphertext, keyMaterial) {
  try {
    const key = await deriveAESKey(keyMaterial);
    const combined = base64ToArrayBuffer(ciphertext);
    
    // Estrae IV (primi 12 bytes) e dati cifrati
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );
    
    return arrayBufferToString(decrypted);
  } catch (error) {
    console.error('Errore decifratura AES:', error);
    throw new Error('Impossibile decifrare i dati');
  }
}
