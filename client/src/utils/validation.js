/**
 * Client-side validation for the auth forms.
 *
 * Mirrors the server rules in `server/src/utils/validationRules.js`. The server
 * stays authoritative - these checks only give the user instant inline feedback
 * so a malformed email / phone never has to round-trip to the API.
 */

// Dial code -> required national digits.
// Keep in sync with `PHONE_COUNTRY_CODES` in server/src/constants/index.js.
export const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)', nationalLength: 10 },
  { code: '+1', label: 'USA / Canada (+1)', nationalLength: 10 },
  { code: '+44', label: 'United Kingdom (+44)', nationalLength: 10 },
  { code: '+971', label: 'UAE (+971)', nationalLength: 9 },
  { code: '+61', label: 'Australia (+61)', nationalLength: 9 },
  { code: '+65', label: 'Singapore (+65)', nationalLength: 8 },
];

export const DEFAULT_COUNTRY_CODE = '+91';
export const MIN_PASSWORD_LENGTH = 6;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 1000;

export const getMessageError = (message) => {
  const value = String(message ?? '').trim();
  if (!value) return 'Message is required';
  const length = Array.from(value).length;
  return length < MESSAGE_MIN_LENGTH || length > MESSAGE_MAX_LENGTH
    ? `Message must be between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters`
    : '';
};

const MAX_EMAIL_LENGTH = 254;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export const VALIDATION_MESSAGES = {
  emailRequired: 'Email is required',
  emailTooLong: `Email cannot exceed ${MAX_EMAIL_LENGTH} characters`,
  emailInvalid: 'Please provide a valid email address',
  passwordRequired: 'Password is required',
  passwordTooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  passwordsDoNotMatch: 'Passwords do not match',
  phoneRequired: 'Phone number is required',
  phoneCodeUnsupported: 'Please select a valid country code',
  phoneLength: (code, length) => `Phone number must be ${length} digits for ${code}`,
  phoneIndianMobile: 'Indian mobile numbers must start with 6, 7, 8 or 9',
};

export const getCountryByCode = (code) => COUNTRY_CODES.find((country) => country.code === code);

/** Digits only - the country code select supplies the "+NN" prefix. */
export const normalizePhoneDigits = (phone) => String(phone ?? '').replace(/\D/g, '');

/** The single value the API expects and stores (E.164). */
export const buildE164Phone = (countryCode, phone) =>
  `${countryCode}${normalizePhoneDigits(phone)}`;

/**
 * Split a free-form phone string ("+91 98765 43210", "(987) 654-3210", "09876543210")
 * into a dial code + national digits, so a plain text input can be validated
 * against the same rules as the country-code select. Unknown dial codes fall
 * back to '' so getPhoneError() reports them as unsupported.
 */
export const parsePhoneInput = (value, defaultCode = DEFAULT_COUNTRY_CODE) => {
  const raw = String(value ?? '').trim();
  const digits = normalizePhoneDigits(raw);

  if (!raw.startsWith('+')) {
    // Local format: assume the default code and drop any domestic trunk "0".
    return { countryCode: defaultCode, phone: digits.replace(/^0+/, '') };
  }

  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((country) => digits.startsWith(country.code.slice(1)));

  if (!match) return { countryCode: '', phone: digits };
  return { countryCode: match.code, phone: digits.slice(match.code.length - 1) };
};

/**
 * Turn the API's error payload into inline field errors.
 * Handles both shapes the backend can send:
 *   - [{ field, message }] from express-validator (see server/src/middleware/validate.js)
 *   - [string] from Mongoose validation errors (see server/src/middleware/errorHandler.js)
 * @returns {{ fieldErrors: Object, message: string }}
 */
export const parseApiValidationErrors = (payload) => {
  const fieldErrors = {};
  const messages = [];
  const list = Array.isArray(payload?.errors) ? payload.errors : [];

  list.forEach((item) => {
    if (typeof item === 'string') {
      messages.push(item);
      return;
    }
    const { field, message } = item || {};
    if (field && message) {
      if (!fieldErrors[field]) fieldErrors[field] = message;
    } else if (message) {
      messages.push(message);
    }
  });

  return {
    fieldErrors,
    message: messages.length ? messages.join(', ') : payload?.message || '',
  };
};

/**
 * @returns {string} '' when valid, otherwise the message to show inline.
 */
export const getEmailError = (email) => {
  const value = String(email ?? '').trim();
  if (!value) return VALIDATION_MESSAGES.emailRequired;
  if (value.length > MAX_EMAIL_LENGTH) return VALIDATION_MESSAGES.emailTooLong;
  if (!EMAIL_REGEX.test(value)) return VALIDATION_MESSAGES.emailInvalid;

  // The regex above allows a couple of shapes validator.js rejects - block them
  // too so client and server agree: no leading/trailing/double dots in the local
  // part and no empty, leading-hyphen or trailing-hyphen domain labels.
  const [localPart, domain] = value.split('@');
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return VALIDATION_MESSAGES.emailInvalid;
  }
  if (
    domain.includes('..') ||
    domain.split('.').some((label) => label.startsWith('-') || label.endsWith('-'))
  ) {
    return VALIDATION_MESSAGES.emailInvalid;
  }

  return '';
};

export const getPasswordError = (password) => {
  const value = String(password ?? '');
  if (!value) return VALIDATION_MESSAGES.passwordRequired;
  if (value.length < MIN_PASSWORD_LENGTH) return VALIDATION_MESSAGES.passwordTooShort;
  return '';
};

export const getConfirmPasswordError = (password, confirmPassword) => {
  if (!String(confirmPassword ?? '')) return VALIDATION_MESSAGES.passwordRequired;
  if (password !== confirmPassword) return VALIDATION_MESSAGES.passwordsDoNotMatch;
  return '';
};

/**
 * @returns {string} '' when valid, otherwise the message to show inline.
 */
export const getPhoneError = (countryCode, phone) => {
  const country = getCountryByCode(countryCode);
  if (!country) return VALIDATION_MESSAGES.phoneCodeUnsupported;

  const digits = normalizePhoneDigits(phone);
  if (!digits) return VALIDATION_MESSAGES.phoneRequired;
  if (digits.length !== country.nationalLength) {
    return VALIDATION_MESSAGES.phoneLength(country.code, country.nationalLength);
  }
  if (country.code === '+91' && !/^[6-9]/.test(digits)) {
    return VALIDATION_MESSAGES.phoneIndianMobile;
  }

  return '';
};
