import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', phone: '', message: '' });
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
              <div className="success-message">
                <span>✓</span>
                <h3>Thank you for your message!</h3>
                <p>We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-input form-textarea"
                    placeholder="How can we help you?"
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary submit-btn">
                  Send Message 📩
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
