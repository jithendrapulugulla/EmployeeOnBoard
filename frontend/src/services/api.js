import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
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
  sendOffer: (id) => api.post(`/admin/candidates/${id}/send-offer`),
  sendJoiningDetails: (id) => api.post(`/admin/candidates/${id}/send-joining-details`),
  
  // Joining Requests
  getJoiningRequests: () => api.get('/admin/joining-requests'),
  getJoiningRequest: (id) => api.get(`/admin/joining-requests/${id}`),
  reviewJoiningRequest: (id, data) => api.post(`/admin/joining-requests/${id}/review`, data),
  
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
