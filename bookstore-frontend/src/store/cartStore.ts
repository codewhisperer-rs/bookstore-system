import { create } from 'zustand';
import { Book, CartItem } from '../types';
import { cartAPI } from '../services/api';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: number) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCartData: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  fetchCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      set({ items: [] });
      return;
    }
    
    try {
      const cartData = await cartAPI.getCart();
      set({ items: cartData.items || [] });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      set({ items: [] });
    }
  },

  addToCart: async (book: Book, quantity = 1) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw new Error('请先登录后再添加到购物车');
    }
    
    try {
      await cartAPI.addToCart(book.id, quantity);
      await get().fetchCart(); // Re-fetch cart to ensure state is up-to-date
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  },

  removeFromCart: async (bookId: number) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw new Error('请先登录后再操作购物车');
    }
    
    try {
      const updatedCart = await cartAPI.removeFromCart(bookId);
      set({ items: updatedCart.items });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  },

  updateQuantity: async (bookId: number, quantity: number) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw new Error('请先登录后再操作购物车');
    }
    
    if (quantity <= 0) {
      await get().removeFromCart(bookId);
      return;
    }

    try {
      await cartAPI.updateQuantity(bookId, quantity);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  },

  clearCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw new Error('请先登录后再操作购物车');
    }
    
    try {
      await cartAPI.clearCart();
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  clearCartData: () => {
    set({ items: [] });
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => 
      total + (item.book.price * item.quantity), 0
    );
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));
