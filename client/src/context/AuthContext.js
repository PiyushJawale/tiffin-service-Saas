import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/index';

// Application constants
const APP_CONSTANTS = {
  STORAGE: {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
  },
  ROLES: {
    ADMIN: 'admin',
  },
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(APP_CONSTANTS.STORAGE.TOKEN);
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.data);
    } catch (error) {
      localStorage.removeItem(APP_CONSTANTS.STORAGE.TOKEN);
      localStorage.removeItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { data } = res.data;

    localStorage.setItem(APP_CONSTANTS.STORAGE.TOKEN, data.token);
    if (data.refreshToken) {
      localStorage.setItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN, data.refreshToken);
    }
    setUser(data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { data } = res.data;

    localStorage.setItem(APP_CONSTANTS.STORAGE.TOKEN, data.token);
    if (data.refreshToken) {
      localStorage.setItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN, data.refreshToken);
    }
    setUser(data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem(APP_CONSTANTS.STORAGE.TOKEN);
      localStorage.removeItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN);
      setUser(null);
    }
  };

  const isAdmin = () => {
    return user?.role === APP_CONSTANTS.ROLES.ADMIN;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin, setUser: updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;