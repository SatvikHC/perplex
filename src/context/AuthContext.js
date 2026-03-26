import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://cheerful-wilma-hcmedia-liva-cf966d17.koyeb.app';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('osg_token'));
  const [activeBan, setActiveBan] = useState(null);
  const [showBanPopup, setShowBanPopup] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('osg_token');
    setToken(null);
    setUser(null);
    setActiveBan(null);
    setShowBanPopup(false);
  }, []);

  // fetchUser MUST be defined BEFORE useEffect
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Only show ban popup for players, not admins, not MATCH_TERMINATION
        if (
          data.activeBan &&
          data.activeBan.banType !== 'MATCH_TERMINATION' &&
          data.role !== 'ADMIN'
        ) {
          setActiveBan(data.activeBan);
          setShowBanPopup(true);
        } else {
          setActiveBan(null);
          setShowBanPopup(false);
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (identifier, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    if (!res.ok) {
      let errMsg = 'Login failed';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    localStorage.setItem('osg_token', data.token);
    setToken(data.token);
    setUser(data.user);
    // Show ban popup immediately if banned (non-admin only)
    if (data.isBanned && data.activeBan && data.user?.role !== 'ADMIN') {
      setActiveBan(data.activeBan);
      setShowBanPopup(true);
    }
    return data;
  };

  const adminLogin = async (identifier, password) => {
    const res = await fetch(`${API_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    if (!res.ok) {
      let errMsg = 'Login failed';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    localStorage.setItem('osg_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      let errMsg = 'Registration failed';
      try { const e = await res.json(); errMsg = e.detail || errMsg; } catch {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    localStorage.setItem('osg_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const refreshUser = useCallback(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      adminLogin,
      register,
      logout,
      refreshUser,
      activeBan,
      showBanPopup,
      setShowBanPopup
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}