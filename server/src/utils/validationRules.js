const { body } = require('express-validator');
const { PHONE_COUNTRY_CODES } = require('../constants');

/**
 * Shared Validation Rules
 *
 * Single source of truth for the email / phone rules used by every endpoint
 * that accepts user input (auth register + login + profile, admin create user).
 * The API is the trust boundary; the client mirrors these rules for instant
 * feedback only (see client/src/utils/validation.js).
 */

const MAX_EMAIL_LENGTH = 254;

// validator.isEmail options used here: TLD required, no unicode local parts.
// IP-literal domains and over-long (>254 char) addresses are rejected by
// validator's defaults, and .isLength below pins the length explicitly.
const EMAIL_OPTIONS = {
  allow_utf8_local_part: false,
  require_tld: true,
};

// E.164: a "+", a non-zero leading digit, 7-15 digits in total.
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

// validator.isEmail still allows RFC-5321 quoted local parts ("user"@gmail.com)
// and unicode local parts. Neither the client form nor the User model accept
// those, so restrict the local part to the printable ASCII set everyone agrees
// on - this keeps API, client and model in lockstep.
const LOCAL_PART_REGEX = /^[A-Za-z0-9._%+-]+$/;

// Dial codes sorted longest-first so "+971" is matched before a shorter code
// that happens to be a prefix of it.
const DIAL_CODES = Object.keys(PHONE_COUNTRY_CODES).sort((a, b) => b.length - a.length);

const MESSAGES = {
  emailRequired: 'Email is required',
  emailTooLong: `Email cannot exceed ${MAX_EMAIL_LENGTH} characters`,
  emailInvalid: 'Please provide a valid email address',
  phoneRequired: 'Phone number is required',
  phoneInvalid: 'Please provide a valid phone number with country code (e.g. +919876543210)',
  phoneCodeUnsupported: `Country code is not supported. Allowed codes: ${DIAL_CODES.slice()
    .sort()
    .join(', ')}`,
  phoneLength: (code, length) => `Phone number must be ${length} digits for ${code}`,
  phoneIndianMobile: 'Indian mobile numbers must start with 6, 7, 8 or 9',
};

/**
 * Strip the separators users naturally type so the stored value is one
 * canonical E.164 string ("+91 98765 43210" -> "+919876543210").
 */
const stripPhoneSeparators = (value) => String(value ?? '').replace(/[\s().-]/g, '');

/**
 * Email rule - required on every endpoint that accepts one (register, login,
 * admin create user).
 * @param {string} field - request body field name
 */
const emailRule = (field = 'email') => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.emailRequired)
    .bail()
    .isLength({ max: MAX_EMAIL_LENGTH })
    .withMessage(MESSAGES.emailTooLong)
    .bail()
    .isEmail(EMAIL_OPTIONS)
    .withMessage(MESSAGES.emailInvalid)
    .bail()
    .custom((value) => {
      const [localPart] = value.split('@');
      if (!LOCAL_PART_REGEX.test(localPart)) {
        throw new Error(MESSAGES.emailInvalid);
      }
      return true;
    })
    .normalizeEmail();
};

/**
 * Phone rule - validates country code + national number and normalizes the
 * value in req.body to E.164. Required unless { optional: true }.
 * @param {string} field - request body field name
 * @param {{ optional?: boolean }} options
 */
const phoneRule = (field = 'phone', { optional = false } = {}) => {
  let chain = body(field);
  if (optional) {
    chain = chain.optional({ values: 'falsy' });
  }

  return chain
    .trim()
    .customSanitizer(stripPhoneSeparators)
    .notEmpty()
    .withMessage(MESSAGES.phoneRequired)
    .bail()
    .matches(E164_REGEX)
    .withMessage(MESSAGES.phoneInvalid)
    .bail()
    .custom((value) => {
      const code = DIAL_CODES.find((dialCode) => value.startsWith(dialCode));
      if (!code) {
        throw new Error(MESSAGES.phoneCodeUnsupported);
      }

      const nationalNumber = value.slice(code.length);
      const expectedLength = PHONE_COUNTRY_CODES[code];
      if (nationalNumber.length !== expectedLength) {
        throw new Error(MESSAGES.phoneLength(code, expectedLength));
      }

      // Indian mobiles always start with 6-9; landline ranges can't be reached
      // by a delivery rider, so reject them early.
      if (code === '+91' && !/^[6-9]/.test(nationalNumber)) {
        throw new Error(MESSAGES.phoneIndianMobile);
      }

      return true;
    });
};

module.exports = {
  MESSAGES,
  emailRule,
  phoneRule,
};
