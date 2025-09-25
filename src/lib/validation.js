// Regex patterns per la validazione
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 6,
  },
  name: {
    minLength: 2,
  },
};

// Messaggi di errore standardizzati
export const ERROR_MESSAGES = {
  email: {
    required: 'Campo obbligatorio',
    invalid: 'Formato email non valido',
    notConfirmed: 'Email non confermata. Controlla la tua casella di posta',
    notFound: 'Account non trovato o non configurato correttamente',
    alreadyExists: 'Email già registrata',
  },
  password: {
    required: 'Campo obbligatorio',
    minLength: 'La password deve essere di almeno 6 caratteri',
    invalid: 'Email o password non corretti',
  },
  firstName: {
    required: 'Campo obbligatorio',
    minLength: 'Il nome deve essere di almeno 2 caratteri',
  },
  lastName: {
    required: 'Campo obbligatorio',
    minLength: 'Il cognome deve essere di almeno 2 caratteri',
  },
  secretKey: {
    required: 'Campo obbligatorio',
    notValid: 'Secret key non corretta',
  },
  network: {
    connection: 'Errore di connessione. Controlla la tua connessione internet',
    tooManyRequests: 'Troppi tentativi. Riprova più tardi',
  },
  generic: 'Errore durante la registrazione. Riprova',
  confirmPassword: {
    required: 'Campo obbligatorio',
    mismatch: 'Le password non corrispondono',
  },
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

  firstName: (firstName) => {
    if (!firstName) return ERROR_MESSAGES.firstName.required;
    if (firstName.trim().length < VALIDATION_PATTERNS.name.minLength) return ERROR_MESSAGES.firstName.minLength;
    return null;
  },

  lastName: (lastName) => {
    if (!lastName) return ERROR_MESSAGES.lastName.required;
    if (lastName.trim().length < VALIDATION_PATTERNS.name.minLength) return ERROR_MESSAGES.lastName.minLength;
    return null;
  },

  secretKey: (secretKey) => {
    if (!secretKey) return ERROR_MESSAGES.secretKey.required;
    return null;
  },
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return ERROR_MESSAGES.confirmPassword.required;
    if (password !== confirmPassword) return ERROR_MESSAGES.confirmPassword.mismatch;
    return null;
  },
};

// Funzione principale di validazione del form di login
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

// Funzione principale di validazione del form di registrazione
export function validateSignupForm(formData) {
  const errors = {
    first_name: null,
    last_name: null,
    email: null,
    password: null,
  };

  // Validazione di tutti i campi
  errors.first_name = validators.firstName(formData.first_name);
  errors.last_name = validators.lastName(formData.last_name);
  errors.email = validators.email(formData.email);
  errors.password = validators.password(formData.password);

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

// Funzione per gestire gli errori specifici di registrazione
export function handleSignupErrors(error) {
  const errors = {
    first_name: null,
    last_name: null,
    email: null,
    password: null,
  };

  const errorMessage = error.message || '';

  // Gestione errori specifici di Supabase Auth per registrazione
  if (errorMessage.includes('User already registered')) {
    errors.email = ERROR_MESSAGES.email.alreadyExists;
    return errors;
  }

  if (errorMessage.includes('Email rate limit exceeded')) {
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

  // Gestione errori di rete
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
    errors.email = ERROR_MESSAGES.network.connection;
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

// Funzione di validazione per il form forgot password (solo email)
export function validateForgotPasswordForm(formData) {
  const errors = {
    email: null,
  };

  // Validazione email
  errors.email = validators.email(formData.email);

  // Controllo se ci sono errori
  const isValid = !errors.email;

  return {
    isValid,
    errors,
  };
}

// Funzione per gestire errori specifici del reset password
export function handleForgotPasswordErrors(error) {
  const errors = {
    email: null,
  };

  if (!error) return errors;

  const errorMessage = error.message?.toLowerCase() || '';

  // Gestione errori specifici per reset password
  if (errorMessage.includes('email not confirmed')) {
    errors.email = ERROR_MESSAGES.email.notConfirmed;
  } else if (errorMessage.includes('invalid email')) {
    errors.email = ERROR_MESSAGES.email.invalid;
  } else if (errorMessage.includes('user not found')) {
    errors.email = ERROR_MESSAGES.email.notFound;
  } else if (errorMessage.includes('too many requests')) {
    errors.email = ERROR_MESSAGES.network.tooManyRequests;
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    errors.email = ERROR_MESSAGES.network.connection;
  } else {
    // Errore generico
    errors.email = ERROR_MESSAGES.generic;
  }

  return errors;
}

// Funzione di validazione per il form reset password
export function validateResetPasswordForm(formData) {
  const errors = {
    password: null,
    confirm_password: null,
  };

  // Validazione password
  errors.password = validators.password(formData.password);
  
  // Validazione conferma password
  errors.confirm_password = validators.confirmPassword(formData.password, formData.confirm_password);

  // Controllo se ci sono errori
  const isValid = !errors.password && !errors.confirm_password;

  return {
    isValid,
    errors,
  };
}

// Funzione per gestire errori specifici del reset password
export function handleResetPasswordErrors(error) {
  const errors = {
    password: null,
    confirm_password: null,
  };

  if (!error) return errors;

  const errorMessage = error.message?.toLowerCase() || '';

  // Gestione errori specifici per reset password
  if (errorMessage.includes('password should be at least')) {
    errors.password = ERROR_MESSAGES.password.minLength;
  } else if (errorMessage.includes('invalid password')) {
    errors.password = ERROR_MESSAGES.password.invalid;
  } else if (errorMessage.includes('too many requests')) {
    errors.password = ERROR_MESSAGES.network.tooManyRequests;
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    errors.password = ERROR_MESSAGES.network.connection;
  } else {
    // Errore generico
    errors.password = ERROR_MESSAGES.generic;
  }

  return errors;
}
