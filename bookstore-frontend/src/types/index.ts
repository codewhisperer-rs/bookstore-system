export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  description?: string;
  coverUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  username: string;
  totalPrice: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  orderItems: OrderItem[];
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  userId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface BookRequest {
  title: string;
  author: string;
  price: number;
  stock: number;
  description?: string;
  coverUrl?: string;
}

export interface OrderItemRequest {
  bookId: number;
  quantity: number;
}

export interface OrderRequest {
  orderItems: OrderItemRequest[];
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
