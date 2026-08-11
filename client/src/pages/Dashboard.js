import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [billingSummary, setBillingSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [subRes, summaryRes, billsRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/bills/current-summary'),
        api.get('/bills/my-bills'),
      ]);

      setSubscription(subRes.data.data[0] || null);
      setBillingSummary(summaryRes.data.data);
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

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;

    setActionLoading(true);
    try {
      await api.delete(`/subscriptions/${subscription._id}`);
      await fetchUserData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
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
      paid: 'badge-success',
    };
    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

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

        {/* Billing Summary Card */}
        {billingSummary &&
          (billingSummary.subscription || billingSummary.extraTiffinsCount > 0) && (
            <div className="billing-summary-card">
              <div className="billing-header">
                <h2>💰 Current Month Bill</h2>
                <span className="month-label">
                  {billingSummary.monthName} {billingSummary.year}
                </span>
              </div>

              <div className="billing-breakdown">
                {billingSummary.subscription ? (
                  <div className="billing-row">
                    <div className="billing-item">
                      <span className="label">
                        Monthly Subscription ({billingSummary.subscription.mealType})
                      </span>
                      <span className="amount">₹{billingSummary.subscriptionAmount}</span>
                    </div>
                    <span className={`tag tag-${billingSummary.subscription.mealType}`}>
                      {billingSummary.subscription.mealType}
                    </span>
                  </div>
                ) : null}

                <div className="billing-row">
                  <div className="billing-item">
                    <span className="label">
                      Extra Tiffins ({billingSummary.extraTiffinsCount})
                    </span>
                    <span className="amount">₹{billingSummary.extraTiffinsAmount}</span>
                  </div>
                </div>

                <div className="billing-total">
                  <div className="total-item">
                    <span className="label">Total Payable</span>
                    <span className="amount">₹{billingSummary.totalAmount}</span>
                  </div>
                </div>
              </div>

              {billingSummary.extraTiffinsCount > 0 && (
                <div className="extra-orders-note">
                  <small>
                    💡 {billingSummary.extraTiffinsCount} extra tiffin(s) ordered this month
                  </small>
                </div>
              )}

              {!billingSummary.subscription && billingSummary.extraTiffinsCount > 0 && (
                <div className="extra-orders-note">
                  <small>
                    ⚠️ You don't have an active subscription. Subscribe to get daily tiffins!
                  </small>
                </div>
              )}
            </div>
          )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🍱</span>
            <div className="stat-info">
              <h3>Subscription</h3>
              <p>{subscription ? subscription.mealType.toUpperCase() : 'No active subscription'}</p>
              {subscription && (
                <small className={`status-text ${subscription.status}`}>
                  {subscription.status}
                </small>
              )}
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <h3>Monthly Price</h3>
              <p>
                {subscription && subscription.monthlyPrice ? `₹${subscription.monthlyPrice}` : '-'}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <h3>Price per Tiffin</h3>
              <p>
                {subscription && subscription.pricePerTiffin
                  ? `₹${subscription.pricePerTiffin}`
                  : '-'}
              </p>
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
                  <label>Meal Type</label>
                  <span className={`tag tag-${subscription.mealType}`}>
                    {subscription.mealType}
                  </span>
                </div>
                <div className="info-item">
                  <label>Monthly Price</label>
                  <span className="price">
                    ₹
                    {subscription.monthlyPrice || billingSummary?.subscription?.monthlyPrice || '-'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Price per Tiffin</label>
                  <span>₹{subscription.pricePerTiffin || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  {getStatusBadge(subscription.status)}
                </div>
                <div className="info-item">
                  <label>Started On</label>
                  <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Delivery Time</label>
                  <span>{subscription.deliveryTime || 'Lunch'}</span>
                </div>
              </div>
              <div className="subscription-actions">
                {subscription.status === 'active' && (
                  <>
                    <button
                      className="btn btn-warning"
                      onClick={handlePauseSubscription}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Pausing...' : 'Pause Subscription'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
                {subscription.status === 'paused' && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleResumeSubscription}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Resuming...' : 'Resume Subscription'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="no-subscription">
              <p>You don't have an active subscription</p>
              <a href="/subscriptions" className="btn btn-primary">
                Subscribe Now
              </a>
            </div>
          )}
        </div>

        {/* Extra Orders This Month */}
        {billingSummary?.extraOrders?.length > 0 && (
          <div className="dashboard-section">
            <h2>Extra Orders This Month</h2>
            <div className="extra-orders-list">
              {billingSummary.extraOrders.map((order, idx) => (
                <div key={idx} className="extra-order-item">
                  <div className="order-info">
                    <span className={`tag tag-${order.mealType}`}>{order.mealType}</span>
                    <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                  <span className="order-price">₹{order.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bills History */}
        <div className="dashboard-section">
          <h2>Bills History</h2>
          <div className="bills-grid">
            {bills.length > 0 ? (
              bills.map((bill) => (
                <div key={bill._id} className="bill-card">
                  <div className="bill-header">
                    <h4>
                      {getMonthName(bill.month)} {bill.year}
                    </h4>
                    {getStatusBadge(bill.status)}
                  </div>
                  <div className="bill-details">
                    <div className="bill-row">
                      <span>Subscription</span>
                      <strong>
                        ₹{bill.subscriptionAmount || bill.totalTiffins * bill.pricePerTiffin}
                      </strong>
                    </div>
                    {bill.extraTiffinsCount > 0 && (
                      <div className="bill-row">
                        <span>Extra Tiffins ({bill.extraTiffinsCount})</span>
                        <strong>₹{bill.extraTiffinsAmount}</strong>
                      </div>
                    )}
                    <div className="bill-row total">
                      <span>Total Amount</span>
                      <strong>₹{bill.totalAmount}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bills">
                {/* Improved copy: brand-new users have no subscription yet, so
                    the old "bills generated at the end of each month" message
                    was misleading them into thinking something was broken. */}
                {!subscription ? (
                  <p>
                    You don't have any bills yet. Subscribe to a meal plan and your first bill will
                    appear here once deliveries start.
                  </p>
                ) : (
                  <p>No bills generated yet. Bills are generated at the end of each month.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getMonthName = (month) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month - 1];
};

export default Dashboard;
