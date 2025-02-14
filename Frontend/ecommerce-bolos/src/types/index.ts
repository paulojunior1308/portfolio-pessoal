export interface User {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  }
  
  export interface CartItem {
    product: Product;
    quantity: number;
  }
  
  export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: number;
    address: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    createdAt: Date;
  }