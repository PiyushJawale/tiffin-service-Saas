import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">
            <span>🍱</span> Mumbai Tiffin
          </h3>
          <p className="footer-description">
            Fresh homemade meals delivered daily to your doorstep in Mumbai. 
            Experience the taste of home, away from home.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/subscriptions">Subscriptions</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <ul className="footer-contact">
            <li>📍 Mumbai, Maharashtra, India</li>
            <li>📞 +91 98765 43210</li>
            <li>📧 info@mumbaitiffin.com</li>
            <li>⏰ Delivery: 11 AM - 3 PM</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>We Serve</h4>
          <ul className="footer-areas">
            <li>Andheri</li>
            <li>Bandra</li>
            <li>Dadar</li>
            <li>Churchgate</li>
            <li>Powai</li>
            <li>Juhu</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Mumbai Tiffin Service. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;