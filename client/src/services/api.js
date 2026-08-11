import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (mirrors client/src/api/client/index.js so all axios
// instances in the app behave consistently — bug fix: a stale/expired token
// on the OLD instance used to force-reload /login and yank state out from
// under any in-progress login form).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      // Failed credentials on /auth/login must surface the error to the
      // form, NOT reload the page (which would swallow "Invalid credentials").
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // Refresh-token endpoint itself failed -> session is dead, force re-login.
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Any other 401 (e.g. /auth/me with an expired token) -> drop tokens
      // and bounce to /login so the user can re-authenticate. We do NOT
      // attempt refresh here because the centralised client owns that
      // concern; this old instance is only used by Menu/Subscriptions/etc.
      // which do not need silent refresh.
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
