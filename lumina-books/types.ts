
export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviews: number;
  coverImage: string;
  isbn: string;
  publisher: string;
  format: 'Paperback' | 'Hardcover' | 'Ebook';
  language: string;
  pages: number;
  stock: number;
  description: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
}

export interface CartItem {
  bookId: string;
  quantity: number;
  book: Book;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  address?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  shippingAddress: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  content: string;
}
