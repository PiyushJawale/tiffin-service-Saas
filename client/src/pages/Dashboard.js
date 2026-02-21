import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [subRes, billsRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/bills/my-bills')
      ]);
      
      setSubscription(subRes.data.data[0] || null);
      setBills(billsRes.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = async () => {
    if (!subscription) return;
    setActionLoading(true);
    try {
      await api.put(`/subscriptions/${subscription._id}/pause`);
      await fetchUserData();
    } catch (error) {
      console.error('Error pausing subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;
    setActionLoading(true);
    try {
      await api.put(`/subscriptions/${subscription._id}/resume`);
      await fetchUserData();
    } catch (error) {
      console.error('Error resuming subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'badge-success',
      paused: 'badge-warning',
      cancelled: 'badge-danger',
      pending: 'badge-warning',
      paid: 'badge-success'
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  // Calculate payable amount
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthBill = bills.find(b => b.month === currentMonth && b.year === currentYear);

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Here's your tiffin service overview</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🍱</span>
            <div className="stat-info">
              <h3>Subscription</h3>
              <p>{subscription ? subscription.mealType.toUpperCase() : 'No active subscription'}</p>
              {subscription && (
                <small className={`status-text ${subscription.status}`}>{subscription.status}</small>
              )}
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <h3>Payable Amount</h3>
              <p className="payable-amount">₹{pendingAmount}</p>
              {currentMonthBill && (
                <small>{currentMonthBill.totalTiffins} tiffins this month</small>
              )}
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <h3>Price per Tiffin</h3>
              <p>{subscription ? `₹${subscription.pricePerTiffin}` : '-'}</p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="dashboard-section">
          <h2>My Subscription</h2>
          {subscription ? (
            <div className="subscription-card">
              <div className="subscription-info">
                <div className="info-item">
                  <label>Plan Type</label>
                  <span>{subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)}</span>
                </div>
                <div className="info-item">
                  <label>Meal Type</label>
                  <span className={`tag tag-${subscription.mealType}`}>{subscription.mealType}</span>
                </div>
                <div className="info-item">
                  <label>Price per Tiffin</label>
                  <span className="price">₹{subscription.pricePerTiffin}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  {getStatusBadge(subscription.status)}
                </div>
                <div className="info-item">
                  <label>Started On</label>
                  <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="subscription-actions">
                {subscription.status === 'active' && (
                  <button 
                    className="btn btn-warning" 
                    onClick={handlePauseSubscription}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Pausing...' : 'Pause Subscription'}
                  </button>
                )}
                {subscription.status === 'paused' && (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleResumeSubscription}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Resuming...' : 'Resume Subscription'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="no-subscription">
              <p>You don't have an active subscription</p>
              <a href="/menu" className="btn btn-primary">Browse Menu & Subscribe</a>
            </div>
          )}
        </div>

        {/* Bills */}
        <div className="dashboard-section">
          <h2>My Bills</h2>
          <div className="bills-grid">
            {bills.length > 0 ? (
              bills.map(bill => (
                <div key={bill._id} className="bill-card">
                  <div className="bill-header">
                    <h4>{getMonthName(bill.month)} {bill.year}</h4>
                    {getStatusBadge(bill.status)}
                  </div>
                  <div className="bill-details">
                    <div className="bill-row">
                      <span>Total Tiffins</span>
                      <strong>{bill.totalTiffins}</strong>
                    </div>
                    <div className="bill-row">
                      <span>Price/Tiffin</span>
                      <strong>₹{bill.pricePerTiffin}</strong>
                    </div>
                    <div className="bill-row total">
                      <span>Total Amount</span>
                      <strong>₹{bill.totalAmount}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bills">
                <p>No bills generated yet. Bills are generated at the end of each month based on your tiffin deliveries.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};

export default Dashboard;