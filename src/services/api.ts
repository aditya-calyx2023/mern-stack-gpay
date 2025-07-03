import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

export const paymentAPI = {
  createPaymentIntent: (paymentData: { amount: number; currency?: string; description: string }) =>
    api.post('/payment/create-payment-intent', paymentData),
  
  processPayment: (data: { transactionId: string; paymentData: any }) =>
    api.post('/payment/process-payment', data),
  
  getTransactions: (page?: number, limit?: number) =>
    api.get('/payment/transactions', { params: { page, limit } }),
  
  getTransaction: (transactionId: string) =>
    api.get(`/payment/transactions/${transactionId}`),
};

export default api;