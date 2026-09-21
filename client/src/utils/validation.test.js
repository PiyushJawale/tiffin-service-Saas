import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  VALIDATION_MESSAGES,
  buildE164Phone,
  getConfirmPasswordError,
  getEmailError,
  getPasswordError,
  getPhoneError,
  parseApiValidationErrors,
  parsePhoneInput,
  getMessageError,
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
} from './validation';

const VALID_EMAILS = [
  'user@gmail.com',
  'user+tag@gmail.com',
  'admin@tiffin.com',
  'first.last@sub.domain.co.in',
  'USER@GMAIL.COM',
];

const INVALID_EMAILS = [
  'a@b',
  'user@gmail',
  'user@.com',
  'user name@gmail.com',
  'user..dot@gmail.com',
  '.lead@gmail.com',
  'lead.@gmail.com',
  'user@-bad.com',
  'user@gmail..com',
  '@gmail.com',
  'user@localhost',
];

describe('getEmailError', () => {
  it('accepts real addresses from any domain, not just gmail', () => {
    VALID_EMAILS.forEach((email) => expect(getEmailError(email)).toBe(''));
  });

  it('requires an address', () => {
    expect(getEmailError('')).toBe(VALIDATION_MESSAGES.emailRequired);
    expect(getEmailError('   ')).toBe(VALIDATION_MESSAGES.emailRequired);
    expect(getEmailError(undefined)).toBe(VALIDATION_MESSAGES.emailRequired);
  });

  it('rejects malformed addresses', () => {
    INVALID_EMAILS.forEach((email) =>
      expect(getEmailError(email)).toBe(VALIDATION_MESSAGES.emailInvalid)
    );
  });
});

describe('getPhoneError', () => {
  it('accepts a valid country code + national number', () => {
    expect(getPhoneError('+91', '9876543210')).toBe('');
    expect(getPhoneError('+91', '98765 43210')).toBe('');
    expect(getPhoneError('+1', '4155552671')).toBe('');
    expect(getPhoneError('+971', '501234567')).toBe('');
  });

  it('rejects a missing number, wrong length, bad prefix and unknown code', () => {
    expect(getPhoneError('+91', '')).toBe(VALIDATION_MESSAGES.phoneRequired);
    expect(getPhoneError('+91', '987654321')).toBe(VALIDATION_MESSAGES.phoneLength('+91', 10));
    expect(getPhoneError('+91', '98765432101')).toBe(VALIDATION_MESSAGES.phoneLength('+91', 10));
    expect(getPhoneError('+91', '1234567890')).toBe(VALIDATION_MESSAGES.phoneIndianMobile);
    expect(getPhoneError('+999', '9876543210')).toBe(VALIDATION_MESSAGES.phoneCodeUnsupported);
  });
});

describe('password checks', () => {
  it('requires a minimum length and a matching confirmation', () => {
    expect(getPasswordError('')).toBe(VALIDATION_MESSAGES.passwordRequired);
    expect(getPasswordError('12345')).toBe(VALIDATION_MESSAGES.passwordTooShort);
    expect(getPasswordError('123456')).toBe('');
    expect(getConfirmPasswordError('123456', '')).toBe(VALIDATION_MESSAGES.passwordRequired);
    expect(getConfirmPasswordError('123456', '123457')).toBe(
      VALIDATION_MESSAGES.passwordsDoNotMatch
    );
    expect(getConfirmPasswordError('123456', '123456')).toBe('');
  });
});

describe('phone helpers', () => {
  it('builds the single E.164 value the API stores', () => {
    expect(COUNTRY_CODES.some((country) => country.code === DEFAULT_COUNTRY_CODE)).toBe(true);
    expect(buildE164Phone(DEFAULT_COUNTRY_CODE, '98765 43210')).toBe('+919876543210');
    expect(buildE164Phone('+91', '(987) 654-3210')).toBe('+919876543210');
  });

  it('parses the free-form values the admin form receives', () => {
    ['+919876543210', '+91 98765 43210', '9876543210', '09876543210'].forEach((input) => {
      const { countryCode, phone } = parsePhoneInput(input);
      expect(getPhoneError(countryCode, phone)).toBe('');
      expect(buildE164Phone(countryCode, phone)).toBe('+919876543210');
    });

    expect(parsePhoneInput('+1 415 555 2671')).toEqual({ countryCode: '+1', phone: '4155552671' });
    expect(parsePhoneInput('+44 20 7946 0958')).toEqual({
      countryCode: '+44',
      phone: '2079460958',
    });
    expect(parsePhoneInput('+999 9876543210').countryCode).toBe('');
  });
});

describe('parseApiValidationErrors', () => {
  it('maps express-validator field errors and keeps the banner message', () => {
    const { fieldErrors, message } = parseApiValidationErrors({
      message: 'Validation Error',
      errors: [
        { field: 'email', message: 'Please provide a valid email address' },
        { field: 'phone', message: 'Phone number must be 10 digits for +91' },
      ],
    });

    expect(fieldErrors).toEqual({
      email: 'Please provide a valid email address',
      phone: 'Phone number must be 10 digits for +91',
    });
    expect(message).toBe('Validation Error');
  });

  it('handles mongoose string errors and missing payloads', () => {
    const { fieldErrors, message } = parseApiValidationErrors({ errors: ['Name is required'] });
    expect(fieldErrors).toEqual({});
    expect(message).toBe('Name is required');

    expect(parseApiValidationErrors(undefined)).toEqual({ fieldErrors: {}, message: '' });
  });
});

describe('getMessageError', () => {
  it('accepts a message in range', () => {
    const valid = 'a'.repeat(MESSAGE_MIN_LENGTH);
    expect(getMessageError(valid)).toBe('');
    const max = 'b'.repeat(MESSAGE_MAX_LENGTH);
    expect(getMessageError(max)).toBe('');
  });

  it('rejects too short messages', () => {
    const short = 'x'.repeat(MESSAGE_MIN_LENGTH - 1);
    expect(getMessageError(short)).toBe(
      `Message must be between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters`
    );
  });

  it('rejects too long messages', () => {
    const long = 'y'.repeat(MESSAGE_MAX_LENGTH + 1);
    expect(getMessageError(long)).toBe(
      `Message must be between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters`
    );
  });
});
