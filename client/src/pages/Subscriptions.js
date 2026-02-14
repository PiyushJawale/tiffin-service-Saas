import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Subscriptions.css';

const Subscriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'daily',
      name: 'Daily Tiffin',
      description: 'Fresh tiffin delivered every day',
      vegPrice: 120,
      nonVegPrice: 150,
      jainPrice: 130,
      features: [
        'Lunch & Dinner options',
        'Free delivery',
        'Pause anytime',
        'Monthly billing'
      ],
      popular: false
    },
    {
      id: 'weekly',
      name: 'Weekly Plan',
      description: 'Choose your preferred days',
      vegPrice: 110,
      nonVegPrice: 140,
      jainPrice: 120,
      features: [
        'Select 5-7 days per week',
        '10% discount on daily price',
        'Flexible day selection',
        'Weekly menu variety'
      ],
      popular: true
    },
    {
      id: 'monthly',
      name: 'Monthly Subscription',
      description: 'Best value for regular customers',
      vegPrice: 100,
      nonVegPrice: 130,
      jainPrice: 110,
      features: [
        '20% discount on daily price',
        'Priority delivery',
        'Special Sunday meals',
        'Festival specials included'
      ],
      popular: false
    }
  ];

  const handleSubscribe = async (plan, mealType, price) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.post('/subscriptions', {
        planType: plan.id,
        mealType: mealType,
        pricePerTiffin: price,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscriptions-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Choose Your Plan</h1>
          <p className="page-subtitle">
            Flexible subscription options to suit your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="plans-grid">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              
              <div className="plan-prices">
                <div className="price-option">
                  <span className="tag tag-veg">Veg</span>
                  <span className="price">₹{plan.vegPrice}</span>
                  <span className="price-unit">/tiffin</span>
                </div>
                <div className="price-option">
                  <span className="tag tag-nonveg">Non-Veg</span>
                  <span className="price">₹{plan.nonVegPrice}</span>
                  <span className="price-unit">/tiffin</span>
                </div>
                <div className="price-option">
                  <span className="tag tag-jain">Jain</span>
                  <span className="price">₹{plan.jainPrice}</span>
                  <span className="price-unit">/tiffin</span>
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>

              <div className="plan-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubscribe(plan, 'veg', plan.vegPrice)}
                  disabled={loading}
                >
                  Subscribe Veg
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSubscribe(plan, 'non-veg', plan.nonVegPrice)}
                  disabled={loading}
                >
                  Subscribe Non-Veg
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="subscription-info">
          <div className="info-card">
            <h3>📋 How Billing Works</h3>
            <p>
              At the end of each month, you'll only be charged for the tiffins actually delivered. 
              For example, if you took 28 tiffins in January at ₹120 each, your bill will be ₹3,360.
            </p>
          </div>
          <div className="info-card">
            <h3>🔄 Pause & Resume</h3>
            <p>
              Going on vacation? You can pause your subscription anytime and resume when you're back. 
              No charges during paused period.
            </p>
          </div>
          <div className="info-card">
            <h3>📍 Delivery Areas</h3>
            <p>
              We currently serve: Andheri, Bandra, Dadar, Churchgate, Powai, Juhu, 
              Santacruz, Khar, Matunga, and surrounding areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;