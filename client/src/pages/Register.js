import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  MIN_PASSWORD_LENGTH,
  buildE164Phone,
  getConfirmPasswordError,
  getCountryByCode,
  getEmailError,
  getPasswordError,
  getPhoneError,
  normalizePhoneDigits,
  parseApiValidationErrors,
} from '../utils/validation';
import './Auth.css';

const NAME_ERROR = 'Name is required';

// Per-field checks, run on blur and again on submit so malformed input is
// reported inline before we ever hit the API.
const fieldValidators = {
  name: (data) => (String(data.name).trim() ? '' : NAME_ERROR),
  email: (data) => getEmailError(data.email),
  phone: (data) => getPhoneError(data.countryCode, data.phone),
  password: (data) => getPasswordError(data.password),
  confirmPassword: (data) => getConfirmPasswordError(data.password, data.confirmPassword),
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: DEFAULT_COUNTRY_CODE,
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      area: '',
      pincode: '',
    },
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const selectedCountry = getCountryByCode(formData.countryCode) || COUNTRY_CODES[0];

  const validate = (data) =>
    Object.fromEntries(
      Object.entries(fieldValidators).map(([field, check]) => [field, check(data)])
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    // The country code comes from the select, so this input holds digits only.
    const nextValue = name === 'phone' ? normalizePhoneDigits(value) : value;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: nextValue,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: nextValue,
      });
    }

    setErrors((prev) => ({
      ...prev,
      [name]: '',
      // A different country code changes the expected phone length.
      ...(name === 'countryCode' ? { phone: '' } : {}),
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const check = fieldValidators[name];
    if (check) setErrors((prev) => ({ ...prev, [name]: check(formData) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate(formData);
    if (Object.values(validationErrors).some(Boolean)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        // Stored as one canonical E.164 string, e.g. "+919876543210".
        phone: buildE164Phone(formData.countryCode, formData.phone),
        password: formData.password,
        address: formData.address,
      });
      // After successful registration, user is automatically logged in
      // Navigate based on user role
      if (result.data && result.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const { fieldErrors, message } = parseApiValidationErrors(err.response?.data);
      setErrors(fieldErrors);
      setError(message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join Mumbai Tiffin for delicious homemade meals</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              placeholder="Enter your name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              required
            />
            {errors.name && (
              <p className="auth-field-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Own line: the country code select and the number sit side by side. */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-phone">
              Phone Number
            </label>
            <div className="phone-group">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="form-input form-select"
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.label}
                  </option>
                ))}
              </select>
              <input
                id="register-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                placeholder={`${selectedCountry.nationalLength}-digit number`}
                inputMode="numeric"
                autoComplete="tel-national"
                aria-invalid={Boolean(errors.phone)}
                required
              />
            </div>
            {errors.phone && (
              <p className="auth-field-error" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email && (
              <p className="auth-field-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder={`Min ${MIN_PASSWORD_LENGTH} characters`}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                required
              />
              {errors.password && (
                <p className="auth-field-error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                placeholder="Re-enter password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                required
              />
              {errors.confirmPassword && (
                <p className="auth-field-error" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-street">
              Delivery Address
            </label>
            <input
              id="register-street"
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="form-input"
              placeholder="Street/Building/Flat No."
              autoComplete="address-line1"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="address.area"
                value={formData.address.area}
                onChange={handleChange}
                className="form-input"
                placeholder="Area/Locality"
                autoComplete="address-line2"
                aria-label="Area / Locality"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="form-input"
                placeholder="Pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                aria-label="Pincode"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
