import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: '🏠',
      title: 'Homemade Food',
      description: 'Fresh, home-cooked meals prepared with love and care daily',
    },
    {
      icon: '📅',
      title: 'Flexible Plans',
      description: 'Choose daily, weekly, or monthly subscription as per your need',
    },
    {
      icon: '🚚',
      title: 'Daily Delivery',
      description: 'Hot and fresh meals delivered to your doorstep every day',
    },
    {
      icon: '💰',
      title: 'Affordable Prices',
      description: 'Quality meals at pocket-friendly prices starting from ₹100/day',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Andheri',
      text: 'The best tiffin service in Mumbai! Food tastes just like home.',
      rating: 5,
    },
    {
      name: 'Rahul Mehta',
      location: 'Bandra',
      text: 'Been using for 6 months. Consistent quality and timely delivery.',
      rating: 5,
    },
    {
      name: 'Anjali Patel',
      location: 'Dadar',
      text: 'Love the variety in menu. Jain food option is a plus!',
      rating: 4,
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Tasty Homemade Meals
            <span className="highlight">Delivered Daily</span>
          </h1>
          <p className="hero-subtitle">
            Experience the taste of home-cooked food, delivered fresh to your doorstep in Mumbai. No
            more worrying about daily cooking!
          </p>
          <div className="hero-search">
            <div className="search-location">
              <span className="search-loc-icon">📍</span>
              <span className="search-loc-text">Mumbai</span>
            </div>
            <div className="search-divider"></div>
            <div className="search-input-wrap">
              <span className="search-mag-icon">🔍</span>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search for tiffins, thalis, cuisines..."
                aria-label="Search menu"
              />
            </div>
          </div>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary btn-large">
              View Menu 🍱
            </Link>
            <Link to="/subscriptions" className="btn btn-outline btn-large">
              Subscribe Now
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">15,000+</span>
              <span className="stat-label">Tiffins Delivered</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.8</span>
              <span className="stat-label">⭐ Rating</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="tiffin-box">
            <div className="tiffin-layers">
              <div className="tiffin-layer">🍛 Dal</div>
              <div className="tiffin-layer">🍚 Rice</div>
              <div className="tiffin-layer">🥘 Sabzi</div>
              <div className="tiffin-layer">🍞 Roti</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Us?</h2>
          <p className="section-subtitle text-center">
            We bring the comfort of homemade food to your daily life
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Choose Your Plan</h3>
              <p>Select from daily, weekly or monthly subscription</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Select Meal Type</h3>
              <p>Veg, Non-Veg, or Jain options available</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Daily Delivery</h3>
              <p>Fresh tiffin delivered to your address</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Pay Monthly</h3>
              <p>Bill generated based on actual deliveries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title text-center">What Our Customers Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  <span className="rating-badge">
                    {testimonial.rating}.0 <span className="rating-star">★</span>
                  </span>
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Ready to Enjoy Homemade Food?</h2>
          <p>Subscribe today and never worry about cooking again!</p>
          <Link to="/subscriptions" className="btn btn-primary btn-large">
            Start Your Subscription 🚀
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
