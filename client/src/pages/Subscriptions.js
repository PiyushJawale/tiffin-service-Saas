import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Subscriptions.css';

const Subscriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [existingSubscription, setExistingSubscription] = useState(null);

  useEffect(() => {
    fetchPricing();
    if (user) {
      checkExistingSubscription();
    }
  }, [user]);

  const fetchPricing = async () => {
    try {
      const res = await api.get('/subscriptions/pricing');
      setPricing(res.data.data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const checkExistingSubscription = async () => {
    try {
      const res = await api.get('/subscriptions');
      const activeSub = res.data.data.find((s) => s.status === 'active' || s.status === 'paused');
      setExistingSubscription(activeSub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async (mealType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (existingSubscription) {
      alert(
        'You already have an active subscription. Please cancel it first to subscribe to a new plan.'
      );
      return;
    }

    setLoading(true);
    try {
      await api.post('/subscriptions', {
        mealType: mealType,
        deliveryTime: 'lunch',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mealTypes = pricing
    ? [
        {
          id: 'veg',
          name: 'Veg Tiffin',
          description: 'Delicious vegetarian meals with fresh vegetables and dal',
          monthlyPrice: pricing.veg.monthlyPrice,
          pricePerTiffin: pricing.veg.pricePerTiffin,
          icon: '🥬',
          features: [
            'Fresh seasonal vegetables',
            'Dal & rice included',
            'Roti/Chapati',
            'Salad & pickle',
          ],
        },
        {
          id: 'non-veg',
          name: 'Non-Veg Tiffin',
          description: 'Complete meals with chicken, fish or egg preparations',
          monthlyPrice: pricing['non-veg'].monthlyPrice,
          pricePerTiffin: pricing['non-veg'].pricePerTiffin,
          icon: '🍗',
          features: [
            'Chicken/Fish preparations',
            'Egg dishes included',
            'Dal & rice included',
            'Roti/Chapati',
          ],
        },
        {
          id: 'jain',
          name: 'Jain Tiffin',
          description: 'Pure Jain meals without onion, garlic and root vegetables',
          monthlyPrice: pricing.jain.monthlyPrice,
          pricePerTiffin: pricing.jain.pricePerTiffin,
          icon: '🧅',
          features: [
            'No onion & garlic',
            'No root vegetables',
            'Fresh preparations',
            'Traditional recipes',
          ],
        },
      ]
    : [];

  return (
    <div className="subscriptions-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Choose Your Subscription</h1>
          <p className="page-subtitle">
            Simple monthly subscription plans for delicious homemade meals
          </p>
        </div>

        {existingSubscription && (
          <div className="existing-subscription-notice">
            <p>
              ⚠️ You already have an active <strong>{existingSubscription.mealType}</strong>{' '}
              subscription.
            </p>
            <p>
              Visit your <a href="/dashboard">dashboard</a> to manage it.
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="plans-grid">
          {mealTypes.map((meal) => (
            <div key={meal.id} className={`plan-card ${meal.id === 'non-veg' ? 'popular' : ''}`}>
              {meal.id === 'non-veg' && <div className="popular-badge">Most Popular</div>}
              <div className="plan-icon">{meal.icon}</div>
              <h3 className="plan-name">{meal.name}</h3>
              <p className="plan-description">{meal.description}</p>

              <div className="plan-pricing">
                <div className="monthly-price">
                  <span className="price">₹{meal.monthlyPrice}</span>
                  <span className="price-unit">/month</span>
                </div>
                <div className="per-tiffin">
                  <span>₹{meal.pricePerTiffin} per tiffin</span>
                </div>
              </div>

              <ul className="plan-features">
                {meal.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>

              <button
                className="btn btn-primary subscribe-btn"
                onClick={() => handleSubscribe(meal.id)}
                disabled={loading || existingSubscription}
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="subscription-info">
          <div className="info-card">
            <h3>📋 How It Works</h3>
            <p>
              Subscribe to a monthly plan and get fresh tiffin delivered daily. You can also order
              extra tiffins from today's menu anytime.
            </p>
          </div>
          <div className="info-card">
            <h3>💰 Billing</h3>
            <p>
              Monthly subscription is charged at the beginning of each month. Extra tiffins ordered
              are added to your monthly bill.
            </p>
          </div>
          <div className="info-card">
            <h3>🔄 Pause & Resume</h3>
            <p>
              Going on vacation? You can pause your subscription anytime from your dashboard and
              resume when you're back.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
