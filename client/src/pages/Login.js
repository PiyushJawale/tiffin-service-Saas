import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmailError, getPasswordError, parseApiValidationErrors } from '../utils/validation';
import './Auth.css';

// Per-field checks, run on blur and again on submit so a malformed email is
// reported inline before we ever hit the API.
const fieldValidators = {
  email: (data) => getEmailError(data.email),
  password: (data) => getPasswordError(data.password),
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (data) =>
    Object.fromEntries(
      Object.entries(fieldValidators).map(([field, check]) => [field, check(data)])
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setErrors((prev) => ({ ...prev, [name]: fieldValidators[name](formData) }));
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
      const result = await login(formData.email.trim(), formData.password);
      // result.data = { user, token, refreshToken }
      if (result.data?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const { fieldErrors, message } = parseApiValidationErrors(err.response?.data);
      setErrors(fieldErrors);
      setError(message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back!</h1>
          <p>Login to your Mumbai Tiffin account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
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

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              required
            />
            {errors.password && (
              <p className="auth-field-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>

        <div className="demo-credentials">
          <p>
            <strong>Demo Admin:</strong> admin@tiffin.com / admin123
          </p>
          <p>
            <strong>Demo User:</strong> user@tiffin.com / user123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
