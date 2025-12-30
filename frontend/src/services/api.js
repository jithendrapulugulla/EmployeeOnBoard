import axios from 'axios';

// When served from backend (single app service), use relative API URL
// When running separately, use environment variable or localhost
const API_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
};

// Admin API
export const adminAPI = {
  // Candidates
  getCandidates: () => api.get('/admin/candidates'),
  createCandidate: (data) => api.post('/admin/candidates', data),
  bulkCreateCandidates: (data) => api.post('/admin/candidates/bulk', data),
  sendOffer: (id, document = null) => {
    const formData = new FormData();
    if (document) {
      formData.append('document', document);
    }
    return api.post(`/admin/candidates/${id}/send-offer`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  sendJoiningDetails: (id, document = null) => {
    const formData = new FormData();
    if (document) {
      formData.append('document', document);
    }
    return api.post(`/admin/candidates/${id}/send-joining-details`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Joining Requests
  getJoiningRequests: () => api.get('/admin/joining-requests'),
  getJoiningRequest: (id) => api.get(`/admin/joining-requests/${id}`),
  reviewJoiningRequest: (id, data) => api.post(`/admin/joining-requests/${id}/review`, data),
  editJoiningDetails: (id, formData) => api.put(`/admin/joining-requests/${id}/edit-details`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Employees
  getEmployees: () => api.get('/admin/employees'),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
};

// Employee API
export const employeeAPI = {
  getJoiningRequest: () => api.get('/employee/joining-request'),
  submitJoiningForm: (formData) => api.post('/employee/submit-joining-form', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Public API
export const publicAPI = {
  verifyOffer: (token) => axios.get(`${API_URL}/public/verify-offer/${token}`),
  acceptOffer: (token) => axios.post(`${API_URL}/public/accept-offer/${token}`),
};

export default api;
