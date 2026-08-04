import api from './client/index';

/**
 * Auth API Service
 * All authentication-related API calls
 */
export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};

/**
 * Menu API Service
 */
export const menuApi = {
  getTodayMenu: () => api.get('/menu/today'),
  getAllMenu: (params) => api.get('/menu', { params }),
  getMenuById: (id) => api.get(`/menu/${id}`),
  createMenuItem: (data) => api.post('/menu', data),
  updateMenuItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
};

/**
 * Subscription API Service
 */
export const subscriptionApi = {
  getPricing: () => api.get('/subscriptions/pricing'),
  getMySubscriptions: () => api.get('/subscriptions'),
  createSubscription: (data) => api.post('/subscriptions', data),
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
  pauseSubscription: (id) => api.put(`/subscriptions/${id}/pause`),
  resumeSubscription: (id) => api.put(`/subscriptions/${id}/resume`),
  cancelSubscription: (id) => api.delete(`/subscriptions/${id}`),
};

/**
 * Delivery API Service
 */
export const deliveryApi = {
  getMyDeliveries: (params) => api.get('/deliveries/my-deliveries', { params }),
  getDeliveriesByDate: (date) => api.get(`/deliveries/date/${date}`),
  updateDelivery: (id, data) => api.put(`/deliveries/${id}`, data),
  createDailyDeliveries: (date) => api.post('/deliveries/create-daily', { date }),
};

/**
 * Bill API Service
 */
export const billApi = {
  getAllBills: () => api.get('/bills/all'),
  getMyBills: () => api.get('/bills/my-bills'),
  getCurrentSummary: () => api.get('/bills/current-summary'),
  getBillById: (id) => api.get(`/bills/${id}`),
  generateBill: (data) => api.post('/bills/generate', data),
  generateAllBills: (data) => api.post('/bills/generate-all', data),
  markBillAsPaid: (id) => api.put(`/bills/${id}/pay`),
  toggleBillStatus: (id) => api.put(`/bills/${id}/toggle-status`),
};

/**
 * Admin API Service
 */
export const adminApi = {
  createUser: (userData) => api.post('/admin/users', userData),
  getAllUsers: () => api.get('/admin/users'),
  getUserDetails: (id) => api.get(`/admin/user/${id}`),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getMonthlyReport: (params) => api.get('/admin/monthly-report', { params }),
};

/**
 * Extra Tiffin API Service
 */
export const extraTiffinApi = {
  orderExtraTiffin: (data) => api.post('/extra-tiffins/order', data),
  getMyOrders: (params) => api.get('/extra-tiffins/my-orders', { params }),
  getCurrentMonthOrders: () => api.get('/extra-tiffins/current-month'),
  markAsDelivered: (id) => api.put(`/extra-tiffins/${id}/deliver`),
  getAllOrders: (params) => api.get('/extra-tiffins/all', { params }),
};
