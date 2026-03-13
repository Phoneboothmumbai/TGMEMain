import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkspaceAuthContext = createContext(null);

export const useWorkspaceAuth = () => {
  const context = useContext(WorkspaceAuthContext);
  if (!context) {
    return { employee: null, token: null, section: null, loading: false, login: async () => ({}), logout: async () => {}, isAuthenticated: false };
  }
  return context;
};

export const WorkspaceAuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('workspace_token'));
  const [section, setSection] = useState(localStorage.getItem('workspace_section'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workspace/auth/verify?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data.employee);
        setSection(data.section);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (employeeId, password, selectedSection) => {
    try {
      const response = await fetch(`${API_URL}/api/workspace/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          password: password,
          section: selectedSection
        })
      });

      if (!response.ok) {
        let errorMsg = 'Login failed';
        try {
          const error = await response.json();
          errorMsg = error.detail || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setToken(data.token);
      setEmployee(data.employee);
      setSection(data.section);
      localStorage.setItem('workspace_token', data.token);
      localStorage.setItem('workspace_section', data.section);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/api/workspace/auth/logout?token=${token}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setToken(null);
    setEmployee(null);
    setSection(null);
    localStorage.removeItem('workspace_token');
    localStorage.removeItem('workspace_section');
  };

  return (
    <WorkspaceAuthContext.Provider value={{
      employee,
      token,
      section,
      loading,
      login,
      logout,
      isAuthenticated: !!token && !!employee
    }}>
      {children}
    </WorkspaceAuthContext.Provider>
  );
};

// API helper functions
export const workspaceApi = {
  baseUrl: `${API_URL}/api/workspace`,

  async fetch(endpoint, options = {}) {
    const token = localStorage.getItem('workspace_token');
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },

  // Employees
  getEmployees: () => workspaceApi.fetch('/employees'),
  createEmployee: (data) => workspaceApi.fetch('/employees', { method: 'POST', body: JSON.stringify(data) }),
  
  // Clients
  getClients: () => workspaceApi.fetch('/clients'),
  getClient: (id) => workspaceApi.fetch(`/clients/${id}`),
  createClient: (data) => workspaceApi.fetch('/clients', { method: 'POST', body: JSON.stringify(data) }),
  getClientByQR: (qrData) => workspaceApi.fetch(`/clients/qr/${encodeURIComponent(qrData)}`),
  
  // Locations
  getLocations: (clientId) => workspaceApi.fetch(`/clients/${clientId}/locations`),
  createLocation: (data) => workspaceApi.fetch('/locations', { method: 'POST', body: JSON.stringify(data) }),
  
  // Contacts
  getContacts: (clientId) => workspaceApi.fetch(`/clients/${clientId}/contacts`),
  createContact: (data) => workspaceApi.fetch('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  
  // Parts
  getParts: () => workspaceApi.fetch('/parts'),
  createPart: (data) => workspaceApi.fetch('/parts', { method: 'POST', body: JSON.stringify(data) }),
  
  // Tasks
  getTasks: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return workspaceApi.fetch(`/tasks${params ? '?' + params : ''}`);
  },
  getMyTasks: (employeeId) => workspaceApi.fetch(`/tasks/my/${employeeId}`),
  createTask: (data) => workspaceApi.fetch('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => workspaceApi.fetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  startTask: (id, employeeId, lat, lng) => 
    workspaceApi.fetch(`/tasks/${id}/start?employee_id=${employeeId}&gps_lat=${lat || ''}&gps_lng=${lng || ''}`, { method: 'POST' }),
  
  // Service Entries
  getServiceEntries: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return workspaceApi.fetch(`/service-entries${params ? '?' + params : ''}`);
  },
  getPendingBilling: () => workspaceApi.fetch('/service-entries/pending-billing'),
  createServiceEntry: (data) => workspaceApi.fetch('/service-entries', { method: 'POST', body: JSON.stringify(data) }),
  getServiceEntry: (id) => workspaceApi.fetch(`/service-entries/${id}`),
  markAsBilled: (id, billNumber) => 
    workspaceApi.fetch(`/service-entries/${id}/mark-billed`, { 
      method: 'POST', 
      body: JSON.stringify({ service_entry_id: id, bill_number: billNumber }) 
    }),
  
  // Parts Requests
  getPartsRequests: (status) => workspaceApi.fetch(`/parts-requests${status ? '?status=' + status : ''}`),
  createPartsRequest: (data) => workspaceApi.fetch('/parts-requests', { method: 'POST', body: JSON.stringify(data) }),
  approvePartsRequest: (id, approvedBy) => 
    workspaceApi.fetch(`/parts-requests/${id}/approve?approved_by=${approvedBy}`, { method: 'POST' }),
  rejectPartsRequest: (id, rejectedBy, reason) => 
    workspaceApi.fetch(`/parts-requests/${id}/reject?rejected_by=${rejectedBy}&reason=${encodeURIComponent(reason || '')}`, { method: 'POST' }),
  
  // Expenses
  getExpenses: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return workspaceApi.fetch(`/expenses${params ? '?' + params : ''}`);
  },
  createExpense: (data) => workspaceApi.fetch('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  approveExpense: (id, approvedBy) => 
    workspaceApi.fetch(`/expenses/${id}/approve?approved_by=${approvedBy}`, { method: 'POST' }),
  
  // Dashboard
  getDashboardStats: () => workspaceApi.fetch('/dashboard/stats'),
  
  // Setup
  setup: () => workspaceApi.fetch('/setup', { method: 'POST' }),

  // Bulk Upload
  bulkUploadClients: (rows) => workspaceApi.fetch('/bulk/clients', { method: 'POST', body: JSON.stringify({ rows }) }),
  bulkUploadEmployees: (rows) => workspaceApi.fetch('/bulk/employees', { method: 'POST', body: JSON.stringify({ rows }) }),
  bulkUploadParts: (rows) => workspaceApi.fetch('/bulk/parts', { method: 'POST', body: JSON.stringify({ rows }) }),
};

export default WorkspaceAuthContext;
