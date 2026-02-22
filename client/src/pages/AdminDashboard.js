import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveries, setDeliveries] = useState([]);
  const [bills, setBills] = useState([]);
  const [currentMonthStats, setCurrentMonthStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    address: { street: '', area: '', city: 'Mumbai', pincode: '' }
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

    useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'tracking') fetchDeliveries();
    if (activeTab === 'billing') fetchAllBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate]);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setDashboardStats(res.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/deliveries/date/${selectedDate}`);
      setDeliveries(res.data.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBills = async () => {
    try {
      setLoading(true);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // Fetch current month delivery stats (amount till date)
      const statsRes = await api.get('/admin/monthly-report', {
        params: {
          month: currentMonth,
          year: currentYear
        }
      });
      setCurrentMonthStats(statsRes.data.data);
      
      // Fetch all generated bills
      const billsRes = await api.get('/bills/all');
      setBills(billsRes.data.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDelivery = async (deliveryId, currentStatus) => {
    try {
      await api.put(`/deliveries/${deliveryId}`, {
        delivered: !currentStatus
      });
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery:', error);
    }
  };

  const generateBills = async () => {
    try {
      setLoading(true);
      // Generate bills for current month
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const res = await api.post('/bills/generate-all', {
        month: currentMonth,
        year: currentYear
      });
      alert(res.data.message);
      fetchAllBills();
    } catch (error) {
      console.error('Error generating bills:', error);
      alert(error.response?.data?.message || 'Error generating bills');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');

    if (newUser.password.length < 6) {
      setAddUserError('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await api.post('/admin/users', newUser);
      setAddUserSuccess(res.data.message);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        address: { street: '', area: '', city: 'Mumbai', pincode: '' }
      });
      fetchUsers();
      setTimeout(() => {
        setShowAddUserModal(false);
        setAddUserSuccess('');
      }, 2000);
    } catch (error) {
      setAddUserError(error.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your tiffin service operations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            📦 Daily Tracking
          </button>
          <button
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            💰 Billing
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <span className="stat-number">{dashboardStats.totalUsers}</span>
              </div>
              <div className="stat-card">
                <h3>Active Subscriptions</h3>
                <span className="stat-number">{dashboardStats.activeSubscriptions}</span>
              </div>
              <div className="stat-card">
                <h3>Today's Deliveries</h3>
                <span className="stat-number">{dashboardStats.todayTotal}</span>
                <div className="stat-breakdown">
                  <span>Delivered: {dashboardStats.todayDelivered}</span>
                  <span>Pending: {dashboardStats.todayPending}</span>
                </div>
              </div>
              <div className="stat-card">
                <h3>Pending Amount</h3>
                <span className="stat-number">₹{dashboardStats.totalPendingAmount}</span>
                <p>{dashboardStats.pendingBillsCount} bills pending</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="users-header">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddUserModal(true)}
              >
                + Add New User
              </button>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Add New User</h3>
                    <button 
                      className="modal-close"
                      onClick={() => {
                        setShowAddUserModal(false);
                        setAddUserError('');
                        setAddUserSuccess('');
                      }}
                    >
                      &times;
                    </button>
                  </div>
                  <form onSubmit={handleAddUser} className="modal-form">
                    {addUserError && <div className="error-message">{addUserError}</div>}
                    {addUserSuccess && <div className="success-message">{addUserSuccess}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          required
                          minLength="6"
                        />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        value={newUser.address.street}
                        onChange={(e) => setNewUser({
                          ...newUser, 
                          address: {...newUser.address, street: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Area</label>
                        <input
                          type="text"
                          value={newUser.address.area}
                          onChange={(e) => setNewUser({
                            ...newUser, 
                            address: {...newUser.address, area: e.target.value}
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          value={newUser.address.pincode}
                          onChange={(e) => setNewUser({
                            ...newUser, 
                            address: {...newUser.address, pincode: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? <div className="loader"></div> : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Area</th>
                      <th>Meal Type</th>
                      <th>Price/Tiffin</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.phone}</td>
                        <td>{user.address?.area || '-'}</td>
                        <td>
                          <span className={`tag tag-${user.subscription?.mealType || 'veg'}`}>
                            {user.subscription?.mealType || 'N/A'}
                          </span>
                        </td>
                        <td>₹{user.subscription?.pricePerTiffin || '-'}</td>
                        <td>
                          <span className={`badge badge-${user.subscription?.status === 'active' ? 'success' : 'warning'}`}>
                            {user.subscription?.status || 'No subscription'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <p className="no-data">No users found</p>}
              </div>
            )}
          </div>
        )}

        {/* Daily Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="tracking-content">
            <div className="tracking-header">
              <h3>Select Date</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
              <button 
                className="btn btn-secondary"
                onClick={async () => {
                  await api.post('/deliveries/create-daily', { date: selectedDate });
                  fetchDeliveries();
                }}
              >
                Generate Today's Records
              </button>
            </div>

            {loading ? <div className="loader"></div> : (
              <div className="tracking-list">
                {deliveries.map(delivery => (
                  <div key={delivery._id} className="tracking-item">
                    <div className="user-info">
                      <strong>{delivery.user?.name}</strong>
                      <span>{delivery.user?.phone}</span>
                      <span className={`tag tag-${delivery.subscription?.mealType}`}>
                        {delivery.subscription?.mealType}
                      </span>
                    </div>
                    <div className="delivery-action">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={delivery.delivered}
                          onChange={() => toggleDelivery(delivery._id, delivery.delivered)}
                        />
                        <span className="slider"></span>
                      </label>
                      <span className={delivery.delivered ? 'status delivered' : 'status pending'}>
                        {delivery.delivered ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
                {deliveries.length === 0 && <p className="no-data">No deliveries for this date</p>}
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="billing-content">
            <div className="billing-header">
              <h3>Monthly Billing Report</h3>
              <button className="btn btn-primary" onClick={generateBills}>
                Generate Bills
              </button>
            </div>

            {/* Current Month Stats - Amount Till Date */}
            {currentMonthStats && currentMonthStats.length > 0 && (
              <div className="current-month-section">
                <h4>📊 Current Month - Amount Till Date ({getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()})</h4>
                <div className="billing-list">
                  {currentMonthStats.map((item, index) => (
                    <div key={`current-${index}`} className="billing-item current-month">
                      <div className="billing-user">
                        <strong>{item.user?.name}</strong>
                        <span>{item.user?.address?.area}</span>
                      </div>
                      <div className="billing-stats">
                        <div className="stat">
                          <label>Delivered</label>
                          <span>{item.deliveredDays} / {item.totalDays}</span>
                        </div>
                        <div className="stat">
                          <label>Price/Tiffin</label>
                          <span>₹{item.subscription?.pricePerTiffin}</span>
                        </div>
                        <div className="stat total-amount">
                          <label>Amount Till Date</label>
                          <span className="amount">₹{item.billAmount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Bills Section */}
            <div className="generated-bills-section">
              <h4>📄 Generated Bills</h4>
              {loading ? <div className="loader"></div> : (
                <div className="billing-list">
                  {bills.map((bill, index) => (
                    <div key={index} className="billing-item">
                      <div className="billing-user">
                        <strong>{bill.user?.name}</strong>
                        <span>{bill.user?.address?.area}</span>
                        <span className={`badge badge-${bill.status === 'paid' ? 'success' : 'warning'}`}>
                          {bill.status}
                        </span>
                      </div>
                      <div className="billing-stats">
                        <div className="stat">
                          <label>Period</label>
                          <span>{getMonthName(bill.month)} {bill.year}</span>
                        </div>
                        <div className="stat">
                          <label>Tiffins</label>
                          <span>{bill.totalTiffins}</span>
                        </div>
                        <div className="stat">
                          <label>Price/Tiffin</label>
                          <span>₹{bill.pricePerTiffin}</span>
                        </div>
                        <div className="stat total-amount">
                          <label>Total Amount</label>
                          <span className="amount">₹{bill.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {bills.length === 0 && <p className="no-data">No bills generated yet. Click "Generate Bills" to create bills.</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
