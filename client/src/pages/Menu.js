import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Menu.css';

const Menu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);
  const [showSuccess, setShowSuccess] = useState('');

  useEffect(() => {
    fetchTodayMenu();
  }, []);

  const fetchTodayMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu/today');
      setTodayMenu(res.data.data);
    } catch (error) {
      console.error('Error fetching today menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderExtra = async (mealType, menuItem) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setOrdering(mealType);
    try {
      await api.post('/extra-tiffins/order', {
        menuId: menuItem?._id,
        mealType: mealType,
        price: menuItem?.price || 120
      });
      setShowSuccess(`Extra ${mealType} tiffin ordered successfully! It will be added to your monthly bill.`);
      setTimeout(() => setShowSuccess(''), 4000);
    } catch (error) {
      console.error('Order error:', error);
      alert(error.response?.data?.message || 'Failed to order. Please try again.');
    } finally {
      setOrdering(null);
    }
  };

  const getMealTypeTag = (type) => {
    const classes = {
      'veg': 'tag-veg',
      'non-veg': 'tag-nonveg',
      'jain': 'tag-jain'
    };
    const labels = {
      'veg': '🥬 Veg',
      'non-veg': '🍗 Non-Veg',
      'jain': '🧅 Jain'
    };
    return <span className={`tag ${classes[type]}`}>{labels[type]}</span>;
  };

  const mealTypes = ['veg', 'non-veg', 'jain'];

  return (
    <div className="menu-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Today's Menu</h1>
          <p className="page-subtitle">
            {todayMenu?.date || 'Loading...'}
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="success-banner">
            ✅ {showSuccess}
          </div>
        )}

        {/* Today's Menu */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <div className="today-menu-section">
            <div className="menu-intro">
              <h2>🍽️ Order Extra Tiffin</h2>
              <p>
                Don't have a subscription? Or want an extra tiffin today? 
                Order from today's menu and it will be added to your monthly bill.
              </p>
            </div>

            <div className="today-menu-grid">
              {mealTypes.map(mealType => {
                const menuItem = todayMenu?.[mealType];
                return (
                  <div key={mealType} className="today-menu-card">
                    <div className="menu-card-header">
                      {getMealTypeTag(mealType)}
                    </div>
                    
                    {menuItem ? (
                      <>
                        <h3 className="menu-name">{menuItem.name}</h3>
                        <p className="menu-description">{menuItem.description}</p>
                        
                        {menuItem.items && menuItem.items.length > 0 && (
                          <div className="menu-items">
                            <strong>Today's Items:</strong>
                            <ul>
                              {menuItem.items.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {menuItem.nutritionalInfo && (
                          <div className="nutritional-info">
                            <span>🔥 {menuItem.nutritionalInfo.calories} cal</span>
                          </div>
                        )}

                        <div className="menu-footer">
                          <div className="price-info">
                            <span className="menu-price">₹{menuItem.price}</span>
                            <span className="per-tiffin">per tiffin</span>
                          </div>
                          <button
                            className="btn btn-primary order-btn"
                            onClick={() => handleOrderExtra(mealType, menuItem)}
                            disabled={ordering === mealType}
                          >
                            {ordering === mealType ? 'Ordering...' : 'Order Extra'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="no-menu-item">
                        <p>No {mealType} menu available for today</p>
                        <button
                          className="btn btn-secondary order-btn"
                          onClick={() => handleOrderExtra(mealType, null)}
                          disabled={ordering === mealType}
                        >
                          {ordering === mealType ? 'Ordering...' : 'Order Default'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="menu-info-section">
          <div className="info-card">
            <h3>📦 How Extra Orders Work</h3>
            <p>
              When you order an extra tiffin, it gets added to your monthly bill. 
              You'll see the total at the end of the month including your subscription + extra orders.
            </p>
          </div>
          <div className="info-card">
            <h3>⏰ Order Timing</h3>
            <p>
              Orders placed before 10 AM will be delivered the same day. 
              Orders after 10 AM will be delivered the next day.
            </p>
          </div>
          <div className="info-card">
            <h3>💡 Tip</h3>
            <p>
              Have a subscription? Your daily tiffin is already included. 
              Order extra only when you need an additional tiffin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;