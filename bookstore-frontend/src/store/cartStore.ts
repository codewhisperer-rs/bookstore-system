import { create } from 'zustand';
import { Book, CartItem } from '../types';
import { cartAPI } from '../services/api';

interface CartState {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: number) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  fetchCart: async () => {
    try {
      const items = await cartAPI.getCart();
      set({ items });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  },

  addToCart: async (book: Book, quantity = 1) => {
    try {
      await cartAPI.addToCart(book.id, quantity);
      await get().fetchCart(); // Re-fetch cart to ensure state is up-to-date
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
    }
  },

  removeFromCart: async (bookId: number) => {
    try {
      const updatedCart = await cartAPI.removeFromCart(bookId);
      set({ items: updatedCart.items });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  },

  updateQuantity: async (bookId: number, quantity: number) => {
    if (quantity <= 0) {
      await get().removeFromCart(bookId);
      return;
    }

    try {
      await cartAPI.updateQuantity(bookId, quantity);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clearCart();
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
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
