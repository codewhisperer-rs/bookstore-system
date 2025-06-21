import axios from 'axios';
import { message } from 'antd';
import { AuthResponse, LoginRequest, RegisterRequest, BookRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
  getBooks: (page: number, size: number, sortBy: string, sortDir: string) => 
    api.get(`/books?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`).then(res => res.data),
  searchBooks: (keyword: string, page: number, size: number) => 
    api.get(`/books/search?keyword=${keyword}&page=${page}&size=${size}`).then(res => res.data),
  createBook: (data: BookRequest) => 
    api.post('/books', data).then(res => res.data),
  updateBook: (id: number, data: BookRequest) => 
    api.put(`/books/${id}`, data).then(res => res.data),
  deleteBook: (id: number) => 
    api.delete(`/books/${id}`).then(res => res.data),
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

  // 用户取消订单
  cancelOrder: (id: number) =>
    api.put(`/orders/${id}/cancel`).then(res => res.data),

  // 申请取消已发货订单
  requestCancelOrder: (id: number, reason: string) =>
    api.post(`/orders/${id}/cancel-request`, { reason }).then(res => res.data),

  // 管理员处理取消申请
  handleCancelRequest: (id: number, approved: boolean, adminNote?: string) =>
    api.put(`/orders/admin/${id}/cancel-request`, { approved, adminNote }).then(res => res.data),

  // 获取待处理的取消申请
  getPendingCancelRequests: (page = 0, size = 10) =>
    api.get(`/orders/admin/cancel-requests?page=${page}&size=${size}`).then(res => res.data),
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

  deleteUser: (id: number) =>
    api.delete(`/admin/users/${id}`).then(res => res.data),
};

export default api;
