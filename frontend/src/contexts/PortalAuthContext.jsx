import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const PortalAuthContext = createContext(null);

export const usePortalAuth = () => {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) return { user: null, token: null, loading: false, login: async () => ({}), logout: async () => {}, isAuthenticated: false };
  return ctx;
};

export const PortalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('portal_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) { verify(); } else { setLoading(false); }
  }, []);

  const verify = async () => {
    try {
      const r = await fetch(`${API_URL}/api/portal/auth/verify?token=${token}`);
      if (r.ok) { const d = await r.json(); setUser(d.user); }
      else { doLogout(); }
    } catch { doLogout(); }
    finally { setLoading(false); }
  };

  const login = async (email, password) => {
    const r = await fetch(`${API_URL}/api/portal/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Login failed'); }
    const d = await r.json();
    setToken(d.token); setUser(d.user);
    localStorage.setItem('portal_token', d.token);
    return d;
  };

  const doLogout = async () => {
    if (token) { try { await fetch(`${API_URL}/api/portal/auth/logout?token=${token}`, { method: 'POST' }); } catch {} }
    setToken(null); setUser(null);
    localStorage.removeItem('portal_token');
  };

  return (
    <PortalAuthContext.Provider value={{ user, token, loading, login, logout: doLogout, isAuthenticated: !!token && !!user }}>
      {children}
    </PortalAuthContext.Provider>
  );
};

// API helper
export const portalApi = {
  async fetch(endpoint, token) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const r = await fetch(`${API_URL}/api/portal${endpoint}${sep}token=${token}`);
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Request failed'); }
    return r.json();
  },
  async post(endpoint, data, token) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const r = await fetch(`${API_URL}/api/portal${endpoint}${sep}token=${token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Request failed'); }
    return r.json();
  },
  getDashboard: (token) => portalApi.fetch('/my/dashboard', token),
  getAssets: (token, filters = '') => portalApi.fetch(`/my/assets${filters ? '?' + filters : ''}`, token),
  getAssetDetail: (id, token) => portalApi.fetch(`/my/assets/${id}`, token),
  getEmployees: (token) => portalApi.fetch('/my/employees', token),
  getAMCs: (token) => portalApi.fetch('/my/amcs', token),
  getTickets: (token) => portalApi.fetch('/my/tickets', token),
  createTicket: (data, token) => portalApi.post('/my/tickets', data, token),
};

export default PortalAuthContext;
