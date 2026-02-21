import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Menu.css';

const Menu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState('All');
  const [subscribing, setSubscribing] = useState(null);
  const [showSuccess, setShowSuccess] = useState('');

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        let query = {};
        if (filter !== 'all') query.mealType = filter;
        if (selectedDay !== 'All') query.day = selectedDay;

        const res = await api.get('/menu', { params: query });
        setMenuItems(res.data.data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [filter, selectedDay]);

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

  const handleSubscribe = async (item) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSubscribing(item._id);
    try {
      await api.post('/subscriptions', {
        planType: 'monthly',
        mealType: item.mealType,
        pricePerTiffin: item.price,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        deliveryTime: 'lunch'
      });
      setShowSuccess(`Subscribed to ${item.name}!`);
      setTimeout(() => setShowSuccess(''), 3000);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="menu-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Our Menu</h1>
          <p className="page-subtitle">
            Fresh homemade meals prepared daily with love and care
          </p>
        </div>

        {/* Filters */}
        <div className="menu-filters">
          <div className="filter-group">
            <label>Meal Type:</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'veg' ? 'active' : ''}`}
                onClick={() => setFilter('veg')}
              >
                🥬 Veg
              </button>
              <button
                className={`filter-btn ${filter === 'non-veg' ? 'active' : ''}`}
                onClick={() => setFilter('non-veg')}
              >
                🍗 Non-Veg
              </button>
              <button
                className={`filter-btn ${filter === 'jain' ? 'active' : ''}`}
                onClick={() => setFilter('jain')}
              >
                🧅 Jain
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Day:</label>
            <select 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="day-select"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="success-banner">
            ✅ {showSuccess}
          </div>
        )}

        {/* Menu Grid */}
        {loading ? (
          <div className="loader"></div>
        ) : (
          <div className="menu-grid">
            {menuItems.length > 0 ? (
              menuItems.map(item => (
                <div key={item._id} className="menu-card">
                  <div className="menu-card-header">
                    {getMealTypeTag(item.mealType)}
                    <span className="menu-day">{item.dayOfWeek}</span>
                  </div>
                  <h3 className="menu-name">{item.name}</h3>
                  <p className="menu-description">{item.description}</p>
                  <div className="menu-items">
                    <strong>Includes:</strong>
                    <ul>
                      {item.items.map((menuItem, idx) => (
                        <li key={idx}>{menuItem}</li>
                      ))}
                    </ul>
                  </div>
                  {item.nutritionalInfo && (
                    <div className="nutritional-info">
                      <span>🔥 {item.nutritionalInfo.calories} cal</span>
                    </div>
                  )}
                  <div className="menu-footer">
                    <div className="price-info">
                      <span className="menu-price">₹{item.price}</span>
                      <span className="per-tiffin">per tiffin</span>
                    </div>
                    <button
                      className="btn btn-primary subscribe-btn"
                      onClick={() => handleSubscribe(item)}
                      disabled={subscribing === item._id}
                    >
                      {subscribing === item._id ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-menu">
                <p>No menu items available for the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;