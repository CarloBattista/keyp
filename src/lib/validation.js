// Regex patterns per la validazione
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 6,
  },
};

// Messaggi di errore standardizzati
export const ERROR_MESSAGES = {
  email: {
    required: 'Campo obbligatorio',
    invalid: 'Formato email non valido',
    notConfirmed: 'Email non confermata. Controlla la tua casella di posta',
    notFound: 'Account non trovato o non configurato correttamente',
  },
  password: {
    required: 'Campo obbligatorio',
    minLength: 'La password deve essere di almeno 6 caratteri',
    invalid: 'Email o password non corretti',
  },
  secretKey: {
    required: 'Campo obbligatorio',
    notValid: 'Secret key non corretta',
  },
  network: {
    connection: 'Errore di connessione. Controlla la tua connessione internet',
    tooManyRequests: 'Troppi tentativi di login. Riprova più tardi',
  },
  generic: 'Errore durante il login. Riprova',
};

// Funzioni di validazione individuali
export const validators = {
  email: (email) => {
    if (!email) return ERROR_MESSAGES.email.required;
    if (!VALIDATION_PATTERNS.email.test(email)) return ERROR_MESSAGES.email.invalid;
    return null;
  },

  password: (password) => {
    if (!password) return ERROR_MESSAGES.password.required;
    if (password.length < VALIDATION_PATTERNS.password.minLength) return ERROR_MESSAGES.password.minLength;
    return null;
  },

  secretKey: (secretKey) => {
    if (!secretKey) return ERROR_MESSAGES.secretKey.required;
    // if (!VALIDATION_PATTERNS.secretKey.test(secretKey)) return ERROR_MESSAGES.secretKey.invalid;
    return null;
  },
};

// Funzione principale di validazione del form
export function validateSigninForm(formData) {
  const errors = {
    email: null,
    password: null,
    secretKey: null,
  };

  // Validazione di tutti i campi
  errors.email = validators.email(formData.email);
  errors.password = validators.password(formData.password);
  errors.secretKey = validators.secretKey(formData.secretKey);

  // Controlla se ci sono errori
  const hasErrors = Object.values(errors).some((error) => error !== null);

  return {
    isValid: !hasErrors,
    errors,
  };
}

// Funzione per gestire gli errori specifici di Supabase e altri servizi
export function handleAuthErrors(error) {
  const errors = {
    email: null,
    password: null,
    secretKey: null,
  };

  const errorMessage = error.message || '';

  // Gestione errori specifici di Supabase Auth
  if (errorMessage.includes('Invalid login credentials')) {
    errors.email = ERROR_MESSAGES.password.invalid;
    errors.password = ERROR_MESSAGES.password.invalid;
    return errors;
  }

  if (errorMessage.includes('Email not confirmed')) {
    errors.email = ERROR_MESSAGES.email.notConfirmed;
    return errors;
  }

  if (errorMessage.includes('Too many requests')) {
    errors.email = ERROR_MESSAGES.network.tooManyRequests;
    return errors;
  }

  // Gestione errori di validazione email
  if (errorMessage.includes('Unable to validate email address') || errorMessage.includes('Invalid email')) {
    errors.email = ERROR_MESSAGES.email.invalid;
    return errors;
  }

  // Gestione errori password
  if (errorMessage.includes('Password should be at least')) {
    errors.password = ERROR_MESSAGES.password.minLength;
    return errors;
  }

  // Gestione errori Secret Key
  if (errorMessage.includes('Secret key non valida')) {
    errors.secretKey = ERROR_MESSAGES.secretKey.notValid;
    return errors;
  }

  // Gestione errori di rete
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
    errors.email = ERROR_MESSAGES.network.connection;
    return errors;
  }

  // Gestione errori del profilo
  if (errorMessage.includes('Profile not found')) {
    errors.email = ERROR_MESSAGES.email.notFound;
    return errors;
  }

  // Errore generico se non rientra in nessuna categoria specifica
  errors.email = ERROR_MESSAGES.generic;
  return errors;
}

// Funzione di utilità per validare singoli campi (utile per validazione real-time)
export function validateField(fieldName, value) {
  if (validators[fieldName]) {
    return validators[fieldName](value);
  }
  return null;
}
