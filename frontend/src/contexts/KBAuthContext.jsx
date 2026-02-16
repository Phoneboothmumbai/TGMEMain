import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/kb`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('kb_admin_token'));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmin(response.data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await axios.post(`${API}/admin/login`, { username, password });
    const { access_token } = response.data;
    localStorage.setItem('kb_admin_token', access_token);
    setToken(access_token);
  };

  const logout = () => {
    localStorage.removeItem('kb_admin_token');
    setToken(null);
    setAdmin(null);
  };

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

// API Service
export const kbApi = {
  // Stats
  getStats: (token) => 
    axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),

  // Categories
  getCategories: (token) => 
    axios.get(`${API}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } }),
  createCategory: (token, data) => 
    axios.post(`${API}/admin/categories`, data, { headers: { Authorization: `Bearer ${token}` } }),
  updateCategory: (token, id, data) => 
    axios.put(`${API}/admin/categories/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  deleteCategory: (token, id) => 
    axios.delete(`${API}/admin/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  // Subcategories
  getSubcategories: (token, mainCategoryId = null) => 
    axios.get(`${API}/admin/subcategories`, { 
      params: mainCategoryId ? { main_category_id: mainCategoryId } : {},
      headers: { Authorization: `Bearer ${token}` } 
    }),
  createSubcategory: (token, data) => 
    axios.post(`${API}/admin/subcategories`, data, { headers: { Authorization: `Bearer ${token}` } }),
  updateSubcategory: (token, id, data) => 
    axios.put(`${API}/admin/subcategories/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  deleteSubcategory: (token, id) => 
    axios.delete(`${API}/admin/subcategories/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  // Articles
  getArticles: (token, filters = {}) => 
    axios.get(`${API}/admin/articles`, { 
      params: filters,
      headers: { Authorization: `Bearer ${token}` } 
    }),
  getArticle: (token, id) => 
    axios.get(`${API}/admin/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  createArticle: (token, data) => 
    axios.post(`${API}/admin/articles`, data, { headers: { Authorization: `Bearer ${token}` } }),
  updateArticle: (token, id, data) => 
    axios.put(`${API}/admin/articles/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  deleteArticle: (token, id) => 
    axios.delete(`${API}/admin/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  // Image upload
  uploadImage: (token, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API}/admin/upload`, formData, { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      } 
    });
  },

  // Setup (first time)
  setup: (username, password) => 
    axios.post(`${API}/admin/setup`, { username, password })
};
