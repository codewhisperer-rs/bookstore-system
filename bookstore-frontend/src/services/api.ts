import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

const API_BASE_URL = '/api';

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

// Response interceptor to handle auth errors
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
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/auth/login', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),
};

export const bookAPI = {
  getBooks: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') =>
    api.get(`/books?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`).then(res => res.data),
  
  searchBooks: (keyword: string, page = 0, size = 10) =>
    api.get(`/books/search?keyword=${keyword}&page=${page}&size=${size}`).then(res => res.data),
  
  getBookById: (id: number) =>
    api.get(`/books/${id}`).then(res => res.data),
  
  createBook: (data: any) =>
    api.post('/books', data).then(res => res.data),
  
  updateBook: (id: number, data: any) =>
    api.put(`/books/${id}`, data).then(res => res.data),
  
  deleteBook: (id: number) =>
    api.delete(`/books/${id}`),
  
  getAvailableBooks: (page = 0, size = 10) =>
    api.get(`/books/available?page=${page}&size=${size}`).then(res => res.data),
  
  getLowStockBooks: (threshold = 10) =>
    api.get(`/books/low-stock?threshold=${threshold}`).then(res => res.data),
};

export const orderAPI = {
  createOrder: (data: any) =>
    api.post('/orders', data).then(res => res.data),

  getOrderById: (id: number) =>
    api.get(`/orders/${id}`).then(res => res.data),

  getUserOrders: (page = 0, size = 10) =>
    api.get(`/orders/my-orders?page=${page}&size=${size}`).then(res => res.data),

  getAllOrders: (page = 0, size = 10) =>
    api.get(`/orders/admin/all?page=${page}&size=${size}`).then(res => res.data),

  getOrdersByStatus: (status: string, page = 0, size = 10) =>
    api.get(`/orders/admin/status/${status}?page=${page}&size=${size}`).then(res => res.data),

  updateOrderStatus: (id: number, status: string) =>
    api.put(`/orders/admin/${id}/status?status=${status}`).then(res => res.data),
};

export const cartAPI = {
  getCart: () => api.get('/cart').then(res => res.data),
  addToCart: (bookId: number, quantity: number) => api.post('/cart/add', { bookId, quantity }).then(res => res.data),
  removeFromCart: (bookId: number) => api.delete(`/cart/remove/${bookId}`).then(res => res.data),
  updateQuantity: (bookId: number, quantity: number) => api.put('/cart/update', { bookId, quantity }).then(res => res.data),
  clearCart: () => api.delete('/cart/clear').then(res => res.data),
};

export const userAPI = {
  getAllUsers: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') =>
    api.get(`/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`).then(res => res.data),

  searchUsers: (keyword: string, page = 0, size = 10) =>
    api.get(`/admin/users/search?keyword=${keyword}&page=${page}&size=${size}`).then(res => res.data),

  toggleUserStatus: (id: number) =>
    api.put(`/admin/users/${id}/toggle-status`).then(res => res.data),

  updateUserRole: (id: number, role: string) =>
    api.put(`/admin/users/${id}/role?role=${role}`).then(res => res.data),
};

export default api;
