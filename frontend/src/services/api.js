import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tradeAPI = {
  // Get current exchange rates
  getExchangeRates: () => api.get('/rates'),
  
  // Execute a trade
  executeTrade: (tradeData) => api.post('/trades', tradeData),
  
  // Get trade history
  getTradeHistory: (filters) => api.get('/trades/history', { params: filters }),
  
  // Get user portfolio
  getPortfolio: () => api.get('/portfolio'),
  
  // Get dashboard statistics
  getDashboardStats: () => api.get('/dashboard/stats')
};

export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Get user balance
  getBalance: () => api.get('/users/balance')
};

export default api;
