import { create } from 'zustand';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  hideRegister: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  hideRegister: false,

  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      set({ 
        user: response, 
        isAuthenticated: true, 
        isLoading: false, 
        hideRegister: true 
      });
      // Fetch cart data after successful login
      const { useCartStore } = await import('./cartStore');
      useCartStore.getState().fetchCart();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      set({ 
        user: response, 
        isAuthenticated: true, 
        isLoading: false, 
        hideRegister: true 
      });
      // Fetch cart data after successful registration
      const { useCartStore } = await import('./cartStore');
      useCartStore.getState().fetchCart();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      user: null, 
      isAuthenticated: false, 
      hideRegister: false 
    });
    // Clear cart data when user logs out
    const { useCartStore } = await import('./cartStore');
    useCartStore.getState().clearCartData();
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ 
          user, 
          isAuthenticated: true, 
          isInitialized: true,
          hideRegister: true 
        });
        // Fetch cart data when initializing auth
        const { useCartStore } = await import('./cartStore');
        useCartStore.getState().fetchCart();
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },
}));
