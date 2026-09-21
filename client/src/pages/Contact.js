import React, { useState } from 'react';
import api from '../services/api';
import {
  buildE164Phone,
  getEmailError,
  getMessageError,
  getPhoneError,
  parsePhoneInput,
  parseApiValidationErrors,
} from '../utils/validation';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setErrors((previous) => ({ ...previous, [e.target.name]: '' }));
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    const { countryCode, phone } = parsePhoneInput(formData.phone);
    const fieldErrors = {
      name: !formData.name.trim()
        ? 'Name is required'
        : formData.name.trim().length > 100
          ? 'Name cannot exceed 100 characters'
          : '',
      email: getEmailError(formData.email),
      phone: !/^[+\d\s().-]*$/.test(formData.phone)
        ? 'Please provide a valid phone number'
        : getPhoneError(countryCode, phone),
      message: getMessageError(formData.message),
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;
    setLoading(true);
    try {
      await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: buildE164Phone(countryCode, phone),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      const result = parseApiValidationErrors(err.response?.data);
      setErrors(result.fieldErrors);
      setError(result.message || 'Unable to send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Contact Us</h1>
          <p className="page-subtitle">We'd love to hear from you. Get in touch with us!</p>
        </div>

        <div className="contact-grid">
          {/* Contact Info */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Our Location</h3>
              <p>Andheri West, Mumbai</p>
              <p>Maharashtra, India - 400058</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
              <p>+91 98765 43211</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📧</div>
              <h3>Email</h3>
              <p>info@mumbaitiffin.com</p>
              <p>support@mumbaitiffin.com</p>
            </div>

            <div className="info-card">
              <div className="info-icon">⏰</div>
              <h3>Delivery Hours</h3>
              <p>Lunch: 11:00 AM - 3:00 PM</p>
              <p>Dinner: 6:00 PM - 9:00 PM</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container">
            {submitted ? (
              <div className="success-message" role="status">
                <span>✓</span>
                <h3>Thank you for your message!</h3>
                <p>We'll get back to you soon.</p>
                <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                {error && (
                  <p className="contact-field-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    autoComplete="name"
                    disabled={loading}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your name"
                    required
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="contact-field-error" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    autoComplete="email"
                    disabled={loading}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="contact-field-error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-phone">
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    autoComplete="tel"
                    disabled={loading}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                  {errors.phone && (
                    <p id="contact-phone-error" className="contact-field-error" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">
                    Message (10–1000 characters)
                  </label>
                  <textarea
                    id="contact-message"
                    disabled={loading}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-input form-textarea"
                    placeholder="How can we help you?"
                    rows="5"
                    required
                  ></textarea>
                  {errors.message && (
                    <p id="contact-message-error" className="contact-field-error" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message 📩'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I subscribe?</h4>
              <p>Create an account, choose your plan and meal type, and you're all set!</p>
            </div>
            <div className="faq-item">
              <h4>Can I pause my subscription?</h4>
              <p>Yes! You can pause anytime and resume when you're back.</p>
            </div>
            <div className="faq-item">
              <h4>How is billing calculated?</h4>
              <p>Monthly bills are based on actual deliveries, not the plan days.</p>
            </div>
            <div className="faq-item">
              <h4>Which areas do you serve?</h4>
              <p>We serve most areas in Mumbai including Andheri, Bandra, Dadar, and more.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
