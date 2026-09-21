import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { buildE164Phone, getEmailError, getPhoneError, parsePhoneInput } from '../utils/validation';
import './AdminDashboard.css';

function MenuMessages({ errors, success }) {
  const msgs = Object.values(errors || {}).filter(Boolean);
  return (
    <>
      {msgs.map((m, i) => (
        <p key={i} className="field-error">
          {m}
        </p>
      ))}
      {success && <p className="menu-saved">{success}</p>}
    </>
  );
}

function NewMenuForm({ draft, mealType, onChange, onCreate, saving, success, errors }) {
  return (
    <>
      <p className="no-data">No {mealType} menu for today.</p>
      <div className="form-group">
        <label>Dish Name</label>
        <input
          type="text"
          value={draft?.name || ''}
          onChange={(e) => onChange(mealType, 'name', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          rows={2}
          value={draft?.description || ''}
          onChange={(e) => onChange(mealType, 'description', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Items (comma-separated)</label>
        <input
          type="text"
          value={draft?.items || ''}
          onChange={(e) => onChange(mealType, 'items', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Extra Tiffin Price (₹)</label>
        <input
          type="number"
          min="0"
          value={draft?.price ?? ''}
          onChange={(e) => onChange(mealType, 'price', e.target.value)}
        />
      </div>
      <div className="bill-actions">
        <button
          className="btn btn-sm btn-primary"
          disabled={saving}
          onClick={() => onCreate(mealType)}
        >
          {saving ? 'Creating…' : 'Create for Today'}
        </button>
      </div>
      <MenuMessages errors={errors} success={success} />
    </>
  );
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
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
    address: { street: '', area: '', city: 'Mumbai', pincode: '' },
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');
  // Menu editor state
  const [todayMenu, setTodayMenu] = useState(null);
  const [menuEdits, setMenuEdits] = useState({}); // per mealType: {name, description, items, price, isAvailable}
  const [newMenus, setNewMenus] = useState({}); // per mealType: draft for missing slots
  const [menuSaving, setMenuSaving] = useState({}); // per mealType: bool
  const [menuSuccess, setMenuSuccess] = useState({}); // per mealType: flash message
  const [menuFieldErrors, setMenuFieldErrors] = useState({}); // per mealType: {field: msg}

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'tracking') fetchDeliveries();
    if (activeTab === 'billing') fetchAllBills();
    if (activeTab === 'menu') fetchTodayMenuAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate]);

  useEffect(() => {
    if (activeTab !== 'messages') return;
    let cancelled = false;
    setMessagesLoading(true);
    setMessagesError('');
    api
      .get('/contact')
      .then((res) => {
        if (!cancelled) setMessages(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setMessagesError(err.response?.data?.message || 'Unable to load messages.');
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

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
          year: currentYear,
        },
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

  const toggleDelivery = async (delivery) => {
    try {
      // Extra tiffin orders are marked delivered via their own endpoint; the
      // deliver endpoint sets delivered=true (toggle back is not supported).
      if (delivery.kind === 'extra') {
        await api.put(`/extra-tiffins/${delivery._id}/deliver`);
      } else {
        await api.put(`/deliveries/${delivery._id}`, {
          delivered: !delivery.delivered,
        });
      }
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery:', error);
    }
  };

  const generateBills = async () => {
    if (!window.confirm('Generate bills for all users for this month?')) return;

    try {
      setLoading(true);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const res = await api.post('/bills/generate-all', {
        month: currentMonth,
        year: currentYear,
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

  const toggleBillStatus = async (billId, currentStatus) => {
    try {
      await api.put(`/bills/${billId}/toggle-status`);
      fetchAllBills();
      alert('Bill status updated');
    } catch (error) {
      console.error('Error toggling bill status:', error);
      alert('Failed to update bill status');
    }
  };

  const approveBillPayment = async (billId) => {
    try {
      await api.put(`/bills/${billId}/approve-payment`);
      fetchAllBills();
    } catch (error) {
      console.error('Error approving payment:', error);
      alert(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const rejectBillPayment = async (billId) => {
    try {
      await api.put(`/bills/${billId}/reject-payment`);
      fetchAllBills();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  const getBillStatusBadgeClass = (status) => {
    if (status === 'paid') return 'badge-success';
    if (status === 'payment_requested') return 'badge-info';
    return 'badge-warning';
  };

  // ---------- Menu editor ----------
  const MEAL_TYPES = ['veg', 'non-veg', 'jain'];

  const fetchTodayMenuAdmin = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu/today');
      setTodayMenu(res.data.data);
      // Prefill edit drafts from the current items
      const edits = {};
      MEAL_TYPES.forEach((mealType) => {
        const item = res.data.data[mealType];
        if (item) {
          edits[mealType] = {
            name: item.name,
            description: item.description,
            items: (item.items || []).join(', '),
            price: item.price,
            isAvailable: item.isAvailable,
          };
        }
      });
      setMenuEdits(edits);
      setNewMenus({});
    } catch (error) {
      console.error('Error fetching today menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuEditChange = (mealType, field, value) => {
    setMenuEdits((prev) => ({
      ...prev,
      [mealType]: { ...prev[mealType], [field]: value },
    }));
    setMenuFieldErrors((prev) => ({
      ...prev,
      [mealType]: { ...prev[mealType], [field]: undefined },
    }));
  };

  const handleNewMenuChange = (mealType, field, value) => {
    setNewMenus((prev) => ({
      ...prev,
      [mealType]: { mealType, ...prev[mealType], [field]: value },
    }));
    setMenuFieldErrors((prev) => ({
      ...prev,
      [mealType]: { ...prev[mealType], [field]: undefined },
    }));
  };

  const validateMenuDraft = (draft, { requireDescription = true } = {}) => {
    const errors = {};
    if (!draft?.name || !draft.name.trim()) errors.name = 'Dish name is required';
    else if (draft.name.trim().length > 200) errors.name = 'Name cannot exceed 200 characters';
    if (requireDescription) {
      if (!draft?.description || !draft.description.trim())
        errors.description = 'Description is required';
      else if (draft.description.trim().length > 1000)
        errors.description = 'Description cannot exceed 1000 characters';
    }
    const price = Number(draft?.price);
    if (draft?.price === undefined || draft?.price === '' || Number.isNaN(price) || price < 0)
      errors.price = 'Price must be a positive number';
    return errors;
  };

  const flashMenuSuccess = (mealType, msg) => {
    setMenuSuccess((prev) => ({ ...prev, [mealType]: msg }));
    setTimeout(() => setMenuSuccess((prev) => ({ ...prev, [mealType]: '' })), 3000);
  };

  const saveMenuItem = async (mealType) => {
    const item = todayMenu[mealType];
    const edit = menuEdits[mealType];
    const errors = validateMenuDraft(edit);
    if (Object.values(errors).some(Boolean)) {
      setMenuFieldErrors((prev) => ({ ...prev, [mealType]: errors }));
      return;
    }
    setMenuFieldErrors((prev) => ({ ...prev, [mealType]: {} }));
    setMenuSaving((prev) => ({ ...prev, [mealType]: true }));
    try {
      await api.put(`/menu/${item._id}`, {
        name: edit.name,
        description: edit.description,
        price: Number(edit.price),
        items: edit.items
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isAvailable: edit.isAvailable,
      });
      await fetchTodayMenuAdmin();
      flashMenuSuccess(mealType, 'Changes saved successfully');
    } catch (error) {
      setMenuFieldErrors((prev) => ({
        ...prev,
        [mealType]: { api: error.response?.data?.message || 'Failed to update menu item' },
      }));
    } finally {
      setMenuSaving((prev) => ({ ...prev, [mealType]: false }));
    }
  };

  const createMenuItem = async (mealType) => {
    const draft = newMenus[mealType];
    const errors = validateMenuDraft(draft);
    if (Object.values(errors).some(Boolean)) {
      setMenuFieldErrors((prev) => ({ ...prev, [mealType]: errors }));
      return;
    }
    setMenuFieldErrors((prev) => ({ ...prev, [mealType]: {} }));
    setMenuSaving((prev) => ({ ...prev, [mealType]: true }));
    try {
      // dayOfWeek defaults to today so the item shows up in "today's menu" only
      await api.post('/menu', {
        mealType,
        name: draft.name,
        description: draft.description,
        price: Number(draft.price),
        items: (draft.items || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        dayOfWeek: todayMenu.dayName,
      });
      await fetchTodayMenuAdmin();
      flashMenuSuccess(mealType, 'Menu item created for today');
    } catch (error) {
      setMenuFieldErrors((prev) => ({
        ...prev,
        [mealType]: { api: error.response?.data?.message || 'Failed to create menu item' },
      }));
    } finally {
      setMenuSaving((prev) => ({ ...prev, [mealType]: false }));
    }
  };

  const deleteMenuItem = async (mealType) => {
    const item = todayMenu[mealType];
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await api.delete(`/menu/${item._id}`);
      fetchTodayMenuAdmin();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete menu item');
    }
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');

    if (newUser.password.length < 6) {
      setAddUserError('Password must be at least 6 characters');
      return;
    }

    // The API rejects a malformed email or a phone without a country code, so
    // check here and normalize "9876543210" / "+91 98765 43210" to E.164.
    const emailError = getEmailError(newUser.email);
    if (emailError) {
      setAddUserError(emailError);
      return;
    }

    const { countryCode, phone } = parsePhoneInput(newUser.phone);
    const phoneError = getPhoneError(countryCode, phone);
    if (phoneError) {
      setAddUserError(phoneError);
      return;
    }

    try {
      const res = await api.post('/admin/users', {
        ...newUser,
        email: newUser.email.trim(),
        phone: buildE164Phone(countryCode, phone),
      });
      setAddUserSuccess(res.data.message);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        address: { street: '', area: '', city: 'Mumbai', pincode: '' },
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
            className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            🍽️ Menu
          </button>
          <button
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            💰 Billing
          </button>
          <button
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            📨 Messages
          </button>
        </div>

        {activeTab === 'messages' && (
          <section className="contact-inbox" aria-labelledby="contact-inbox-heading">
            <h2 id="contact-inbox-heading">Contact Messages</h2>
            <p>Latest 200 submissions, newest first. Switch tabs and return to refresh.</p>
            {messagesLoading ? (
              <p role="status">Loading messages...</p>
            ) : messagesError ? (
              <p className="error-message" role="alert">
                {messagesError}
              </p>
            ) : messages.length === 0 ? (
              <p className="no-data">No contact messages yet.</p>
            ) : (
              <div className="users-table contact-messages-table">
                <table>
                  <caption>Contact form submissions</caption>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Message</th>
                      <th scope="col">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>
                          <a href={`mailto:${item.email}`}>{item.email}</a>
                        </td>
                        <td>{item.phone}</td>
                        <td className="contact-message-text">{item.message}</td>
                        <td>
                          <time dateTime={item.createdAt}>
                            {new Date(item.createdAt).toLocaleString()}
                          </time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

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
              <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
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
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                          minLength="6"
                        />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            address: { ...newUser.address, street: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Area</label>
                        <input
                          type="text"
                          value={newUser.address.area}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              address: { ...newUser.address, area: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          value={newUser.address.pincode}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              address: { ...newUser.address, pincode: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowAddUserModal(false)}
                      >
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

            {loading ? (
              <div className="loader"></div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Area</th>
                      <th>Meal Type</th>
                      <th>Monthly Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.phone}</td>
                        <td>{user.address?.area || '-'}</td>
                        <td>
                          <span className={`tag tag-${user.subscription?.mealType || 'veg'}`}>
                            {user.subscription?.mealType || 'N/A'}
                          </span>
                        </td>
                        <td>₹{user.subscription?.monthlyPrice || '-'}</td>
                        <td>
                          <span
                            className={`badge badge-${user.subscription?.status === 'active' ? 'success' : 'warning'}`}
                          >
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

            {loading ? (
              <div className="loader"></div>
            ) : (
              <div className="tracking-list">
                {deliveries.map((delivery) => (
                  <div key={delivery._id} className="tracking-item">
                    <div className="user-info">
                      <strong>{delivery.user?.name}</strong>
                      <span>{delivery.user?.phone}</span>
                      <span
                        className={`tag tag-${
                          delivery.kind === 'extra'
                            ? delivery.mealType
                            : delivery.subscription?.mealType
                        }`}
                      >
                        {delivery.kind === 'extra'
                          ? `Extra (${delivery.mealType})`
                          : delivery.subscription?.mealType}
                      </span>
                    </div>
                    <div className="delivery-action">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={delivery.delivered}
                          onChange={() => toggleDelivery(delivery)}
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

        {/* Menu Editor Tab */}
        {activeTab === 'menu' && (
          <div className="menu-editor-content">
            <div className="billing-header">
              <h3>🍽️ Today's Menu &amp; Extra Tiffin Prices</h3>
              {todayMenu && (
                <span className="month-label">
                  {todayMenu.dayName} — {todayMenu.date}
                </span>
              )}
            </div>
            <p className="no-data">
              Changes here update what users see on the Menu page. New extra-tiffin orders use the
              price saved here; orders already placed keep their original price.
            </p>

            {loading && !todayMenu ? (
              <div className="loader"></div>
            ) : (
              <div className="menu-editor-grid">
                {MEAL_TYPES.map((mealType) => {
                  const item = todayMenu?.[mealType];
                  const edit = menuEdits[mealType];
                  return (
                    <div key={mealType} className="menu-editor-card">
                      <div className="billing-user">
                        <span className={`tag tag-${mealType}`}>
                          {mealType === 'non-veg'
                            ? 'Non-Veg'
                            : mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </span>
                        {item && (
                          <span
                            className={`badge badge-${item.isAvailable ? 'success' : 'warning'}`}
                          >
                            {item.isAvailable ? 'available' : 'hidden'}
                          </span>
                        )}
                      </div>

                      {item && edit ? (
                        <>
                          <div className="form-group">
                            <label>Dish Name</label>
                            <input
                              type="text"
                              value={edit.name}
                              onChange={(e) =>
                                handleMenuEditChange(mealType, 'name', e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Description</label>
                            <textarea
                              rows={2}
                              value={edit.description}
                              onChange={(e) =>
                                handleMenuEditChange(mealType, 'description', e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Items (comma-separated)</label>
                            <input
                              type="text"
                              value={edit.items}
                              onChange={(e) =>
                                handleMenuEditChange(mealType, 'items', e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Extra Tiffin Price (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={edit.price}
                              onChange={(e) =>
                                handleMenuEditChange(mealType, 'price', e.target.value)
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={edit.isAvailable}
                                onChange={(e) =>
                                  handleMenuEditChange(mealType, 'isAvailable', e.target.checked)
                                }
                              />{' '}
                              Available (uncheck to hide from users)
                            </label>
                          </div>
                          <div className="bill-actions">
                            <button
                              className="btn btn-sm btn-success"
                              disabled={menuSaving[mealType]}
                              onClick={() => saveMenuItem(mealType)}
                            >
                              {menuSaving[mealType] ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteMenuItem(mealType)}
                            >
                              Delete
                            </button>
                          </div>
                          <MenuMessages
                            errors={menuFieldErrors[mealType]}
                            success={menuSuccess[mealType]}
                          />
                        </>
                      ) : (
                        <NewMenuForm
                          draft={newMenus[mealType]}
                          mealType={mealType}
                          onChange={handleNewMenuChange}
                          onCreate={createMenuItem}
                          saving={menuSaving[mealType]}
                          success={menuSuccess[mealType]}
                          errors={menuFieldErrors[mealType]}
                        />
                      )}
                    </div>
                  );
                })}
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
                <h4>
                  📊 Current Month - Amount Till Date ({getMonthName(new Date().getMonth() + 1)}{' '}
                  {new Date().getFullYear()})
                </h4>
                <div className="billing-list">
                  {currentMonthStats.map((item, index) => (
                    <div key={`current-${index}`} className="billing-item current-month">
                      <div className="billing-user">
                        <strong>{item.user?.name}</strong>
                        <span>{item.user?.address?.area}</span>
                        <span className={`tag tag-${item.subscription?.mealType}`}>
                          {item.subscription?.mealType}
                        </span>
                      </div>
                      <div className="billing-stats">
                        <div className="stat">
                          <label>Subscription</label>
                          <span>₹{item.subscription?.monthlyPrice || '-'}</span>
                        </div>
                        <div className="stat">
                          <label>Delivered Days</label>
                          <span>
                            {item.deliveredDays} / {item.totalDays}
                          </span>
                        </div>
                        {item.extraTiffinsCount > 0 && (
                          <div className="stat">
                            <label>Extra Tiffins ({item.extraTiffinsCount})</label>
                            <span>₹{item.extraTiffinsAmount}</span>
                          </div>
                        )}
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
              {loading ? (
                <div className="loader"></div>
              ) : (
                <div className="billing-list">
                  {bills.map((bill, index) => (
                    <div key={index} className="billing-item">
                      <div className="billing-user">
                        <strong>{bill.user?.name}</strong>
                        <span>{bill.user?.address?.area}</span>
                        <span className={`badge ${getBillStatusBadgeClass(bill.status)}`}>
                          {bill.status === 'payment_requested' ? 'awaiting approval' : bill.status}
                        </span>
                      </div>
                      <div className="billing-stats">
                        <div className="stat">
                          <label>Period</label>
                          <span>
                            {getMonthName(bill.month)} {bill.year}
                          </span>
                        </div>
                        <div className="stat">
                          <label>Subscription Fee</label>
                          <span>
                            ₹{bill.subscriptionAmount || '-'}
                            {bill.subscriptionDays > 0 && (
                              <small> ({bill.subscriptionDays} days)</small>
                            )}
                          </span>
                        </div>
                        {bill.extraTiffinsCount > 0 && (
                          <div className="stat">
                            <label>Extra Tiffins ({bill.extraTiffinsCount})</label>
                            <span>₹{bill.extraTiffinsAmount}</span>
                          </div>
                        )}
                        <div className="stat total-amount">
                          <label>Total Amount</label>
                          <span className="amount">₹{bill.totalAmount}</span>
                        </div>
                      </div>
                      <div className="bill-actions">
                        {bill.status === 'payment_requested' ? (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => approveBillPayment(bill._id)}
                            >
                              Approve Payment
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => rejectBillPayment(bill._id)}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            className={`btn btn-sm ${bill.status === 'paid' ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => toggleBillStatus(bill._id, bill.status)}
                          >
                            {bill.status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {bills.length === 0 && (
                    <p className="no-data">
                      No bills generated yet. Click "Generate Bills" to create bills.
                    </p>
                  )}
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
