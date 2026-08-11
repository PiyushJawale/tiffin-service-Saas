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

  // Auto-logout on tab/browser close.
  //
  // Requirement: "if the user closes the tab he should automatically be logged
  // out". We achieve this WITHOUT logging the user out on a normal refresh or
  // SPA navigation.
  //
  // The tricky part: the browser fires `pagehide`/`beforeunload` for BOTH a
  // real tab close AND a reload/navigation, so we can't tell them apart at the
  // moment they fire. `sessionStorage` is the key: it survives a reload of the
  // SAME tab but is destroyed per-tab when the tab is closed.
  //
  // Strategy:
  //   - On `pagehide` (close OR reload): snapshot the tokens into
  //     `sessionStorage`, then clear them from `localStorage` and reset the
  //     in-memory user.
  //   - On the NEXT load: if the snapshot marker exists in `sessionStorage`,
  //     it was a same-tab reload/last-passage, so we restore the tokens from
  //     the snapshot (the user is NOT logged out by refreshing). If there is no
  //     marker (a brand-new tab/session), the tokens stay cleared -> logged out.
  //
  // This is WHY the earlier implementation caused a real bug: it cleared tokens
  // on `pagehide` and never restored them, so ANY reload (for example, right
  // after subscribing on the Subscriptions page) forcibly logged the user out.
  const PERSIST_KEY = 'tiffinSessionSnapshot';
  const MARK_KEY = 'tiffinSessionEnded';

  useEffect(() => {
    // Restore a same-tab session if the previous page in this tab unloaded
    // and left a snapshot (i.e. this is a refresh, not a brand-new tab).
    try {
      if (sessionStorage.getItem(MARK_KEY)) {
        const token = sessionStorage.getItem(PERSIST_KEY + '.token');
        if (token) {
          localStorage.setItem(APP_CONSTANTS.STORAGE.TOKEN, token);
          const rt = sessionStorage.getItem(PERSIST_KEY + '.refresh');
          if (rt) {
            localStorage.setItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN, rt);
          }
        }
        sessionStorage.removeItem(MARK_KEY);
        sessionStorage.removeItem(PERSIST_KEY + '.token');
        sessionStorage.removeItem(PERSIST_KEY + '.refresh');
      }
    } catch (err) {
      // sessionStorage unavailable (private mode) — fall back to default flow.
      // eslint-disable-next-line no-console
      console.warn('Session restore failed:', err);
    }

    const token = localStorage.getItem(APP_CONSTANTS.STORAGE.TOKEN);
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }

    // On unload (tab close OR reload): snapshot + clear. Restore happens on the
    // next load only for a same-tab reload (see above).
    const handlePageHide = () => {
      try {
        const token = localStorage.getItem(APP_CONSTANTS.STORAGE.TOKEN);
        if (!token) return;

        sessionStorage.setItem(PERSIST_KEY + '.token', token);
        const rt = localStorage.getItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN);
        if (rt) {
          sessionStorage.setItem(PERSIST_KEY + '.refresh', rt);
        }
        sessionStorage.setItem(MARK_KEY, '1');

        localStorage.removeItem(APP_CONSTANTS.STORAGE.TOKEN);
        localStorage.removeItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN);
        setUser(null);
      } catch (err) {
        // Never throw from a page-hide handler.
        // eslint-disable-next-line no-console
        console.warn('Auto-logout on pagehide failed:', err);
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    // `beforeunload` covers browsers that don't fire `pagehide` reliably.
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, []);

  const loadUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.data);
    } catch (error) {
      // Stale token / expired session: drop both tokens AND the in-memory
      // user so the navbar reflects truth (otherwise Sign Up / Logout would
      // show stale state until a full page reload).
      localStorage.removeItem(APP_CONSTANTS.STORAGE.TOKEN);
      localStorage.removeItem(APP_CONSTANTS.STORAGE.REFRESH_TOKEN);
      setUser(null);
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
