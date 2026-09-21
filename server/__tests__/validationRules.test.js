const { validationResult } = require('express-validator');
const { emailRule, phoneRule, MESSAGES } = require('../src/utils/validationRules');

/**
 * Run an express-validator chain against a fake request - the same way
 * server/src/middleware/validate.js reads the result afterwards.
 */
const runRules = async (rules, body) => {
  const req = { body, query: {}, params: {}, cookies: {}, headers: {} };
  for (const rule of rules) {
    // eslint-disable-next-line no-await-in-loop
    await rule(req, {}, () => {});
  }
  return { errors: validationResult(req).array(), body: req.body };
};

const firstMessage = (errors) => (errors.length ? errors[0].msg : '');

describe('emailRule', () => {
  const valid = [
    'user@gmail.com',
    'user+tag@gmail.com',
    'admin@tiffin.com',
    'a.b@sub.domain.co.in',
    'USER@GMAIL.COM',
  ];

  it('accepts real addresses (any domain, + tags, long TLDs)', async () => {
    for (const email of valid) {
      const { errors } = await runRules([emailRule('email')], { email });
      expect(errors).toEqual([]);
    }
  });

  it('reports a missing email once', async () => {
    for (const email of ['', '   ', undefined]) {
      const { errors } = await runRules([emailRule('email')], { email });
      expect(firstMessage(errors)).toBe(MESSAGES.emailRequired);
      expect(errors).toHaveLength(1);
    }
  });

  it('rejects malformed addresses', async () => {
    const invalid = [
      'a@b',
      'user@gmail',
      'user@.com',
      'user name@gmail.com',
      'user..dot@gmail.com',
      'user@-bad.com',
      '"user"@gmail.com',
      'user@localhost',
    ];

    for (const email of invalid) {
      const { errors } = await runRules([emailRule('email')], { email });
      expect(firstMessage(errors)).toBe(MESSAGES.emailInvalid);
      expect(errors).toHaveLength(1);
    }
  });
});

describe('phoneRule', () => {
  it('accepts a country code + national number, ignoring separators', async () => {
    const valid = [
      ['+919876543210', '+919876543210'],
      ['+91 98765 43210', '+919876543210'],
      ['+91 (987) 654-3210', '+919876543210'],
      ['+14155552671', '+14155552671'],
      ['+971501234567', '+971501234567'],
    ];

    for (const [input, expected] of valid) {
      const result = await runRules([phoneRule('phone')], { phone: input });
      expect(result.errors).toEqual([]);
      // The normalized E.164 value is what gets stored.
      expect(result.body.phone).toBe(expected);
    }
  });

  it('reports a missing phone once', async () => {
    for (const phone of ['', '   ', undefined]) {
      const { errors } = await runRules([phoneRule('phone')], { phone });
      expect(firstMessage(errors)).toBe(MESSAGES.phoneRequired);
      expect(errors).toHaveLength(1);
    }
  });

  it('rejects a number without an explicit country code', async () => {
    const { errors } = await runRules([phoneRule('phone')], { phone: '9876543210' });
    expect(firstMessage(errors)).toBe(MESSAGES.phoneInvalid);
  });

  it('rejects a wrong national length for the dial code', async () => {
    const nineDigits = await runRules([phoneRule('phone')], { phone: '+91987654321' });
    expect(firstMessage(nineDigits.errors)).toBe(MESSAGES.phoneLength('+91', 10));

    const elevenDigits = await runRules([phoneRule('phone')], { phone: '+9198765432101' });
    expect(firstMessage(elevenDigits.errors)).toBe(MESSAGES.phoneLength('+91', 10));
  });

  it('rejects an unsupported dial code', async () => {
    const { errors } = await runRules([phoneRule('phone')], { phone: '+99987654321' });
    expect(firstMessage(errors)).toBe(MESSAGES.phoneCodeUnsupported);
  });

  it('rejects a non-mobile Indian number', async () => {
    const { errors } = await runRules([phoneRule('phone')], { phone: '+911234567890' });
    expect(firstMessage(errors)).toBe(MESSAGES.phoneIndianMobile);
  });

  it('skips optional phone fields but still validates a provided value', async () => {
    const missing = await runRules([phoneRule('phone', { optional: true })], {});
    expect(missing.errors).toEqual([]);

    const blank = await runRules([phoneRule('phone', { optional: true })], { phone: '   ' });
    // Whitespace-only counts as "not provided" for an optional field.
    expect(blank.errors).toEqual([]);

    const bad = await runRules([phoneRule('phone', { optional: true })], { phone: '12345' });
    expect(firstMessage(bad.errors)).toBe(MESSAGES.phoneInvalid);
  });
});

describe('User model guards accept what the API accepts', () => {
  const User = require('../src/models/User');

  const validate = (overrides) =>
    new User({
      name: 'Test User',
      email: 'user@gmail.com',
      phone: '+919876543210',
      password: 'secret123',
      ...overrides,
    }).validateSync();

  it('stores valid addresses the old model regex used to reject', () => {
    expect(validate({ email: 'user+tag@gmail.com' })).toBeUndefined();
    expect(validate({ email: 'admin@tiffin.com' })).toBeUndefined();
    expect(validate({ email: 'user@sub.domain.info' })).toBeUndefined();
  });

  it('still rejects malformed email and phone at the storage layer', () => {
    expect(validate({ email: 'a@b' })).toBeDefined();
    expect(validate({ email: '"user"@gmail.com' })).toBeDefined();
    expect(validate({ phone: '+' })).toBeDefined();
    expect(validate({ phone: '----' })).toBeDefined();
    // Legacy spaced values must stay savable (profile updates run validators).
    expect(validate({ phone: '+91 98765 43210' })).toBeUndefined();
  });
});

describe('auth routes reject invalid input before reaching the database', () => {
  const request = require('supertest');
  const app = require('../src/app');

  const base = {
    name: 'Test User',
    email: 'user@gmail.com',
    phone: '+919876543210',
    password: 'secret123',
  };

  const post = (url, body) => request(app).post(url).send(body);

  it('returns field level email errors for register and login', async () => {
    const register = await post('/api/v1/auth/register', { ...base, email: 'a@b' });
    expect(register.status).toBe(400);
    expect(register.body.errors).toEqual([{ field: 'email', message: MESSAGES.emailInvalid }]);

    const login = await post('/api/v1/auth/login', { email: 'not-an-email', password: 'x' });
    expect(login.status).toBe(400);
    expect(login.body.errors).toEqual([{ field: 'email', message: MESSAGES.emailInvalid }]);
  });

  it('returns field level phone errors for register', async () => {
    const noCode = await post('/api/v1/auth/register', { ...base, phone: '9876543210' });
    expect(noCode.status).toBe(400);
    expect(noCode.body.errors).toEqual([{ field: 'phone', message: MESSAGES.phoneInvalid }]);

    const wrongLength = await post('/api/v1/auth/register', { ...base, phone: '+91987654321' });
    expect(wrongLength.status).toBe(400);
    expect(wrongLength.body.errors).toEqual([
      { field: 'phone', message: MESSAGES.phoneLength('+91', 10) },
    ]);
  });
});
