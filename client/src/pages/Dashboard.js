import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [subRes, deliveriesRes, billsRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/deliveries/my-deliveries'),
        api.get('/bills/my-bills')
      ]);
      
      setSubscription(subRes.data.data[0] || null);
      setDeliveries(deliveriesRes.data.data);
      setBills(billsRes.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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
              <h3>Active Subscription</h3>
              <p>{subscription ? subscription.mealType.toUpperCase() : 'No active subscription'}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <h3>This Month's Tiffins</h3>
              <p>{deliveries.filter(d => {
                const date = new Date(d.date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <h3>Pending Bills</h3>
              <p>₹{bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0)}</p>
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
                <button className="btn btn-outline">Pause Subscription</button>
              </div>
            </div>
          ) : (
            <div className="no-subscription">
              <p>You don't have an active subscription</p>
              <a href="/subscriptions" className="btn btn-primary">Subscribe Now</a>
            </div>
          )}
        </div>

        {/* Recent Deliveries */}
        <div className="dashboard-section">
          <h2>Recent Deliveries</h2>
          <div className="deliveries-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.slice(0, 10).map(delivery => (
                  <tr key={delivery._id}>
                    <td>{new Date(delivery.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`delivery-status ${delivery.delivered ? 'delivered' : 'pending'}`}>
                        {delivery.delivered ? '✓ Delivered' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>{delivery.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveries.length === 0 && <p className="no-data">No delivery records found</p>}
          </div>
        </div>

        {/* Bills */}
        <div className="dashboard-section">
          <h2>My Bills</h2>
          <div className="bills-grid">
            {bills.map(bill => (
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
            ))}
            {bills.length === 0 && <p className="no-data">No bills generated yet</p>}
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