export interface Product {
    id: string;
    name: string;
    barcode: string;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CartItem extends Product {
    cartQuantity: number;
  }
  
  export interface Sale {
    id: string;
    items: CartItem[];
    total: number;
    paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
    createdAt: Date;
    userId: string;
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'cashier';
  }
  
  export interface DashboardData {
    totalProducts: number;
    todaySales: number;
    averageTicket: number;
    monthlyRevenue: number;
    topProducts: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    paymentMethods: Array<{
      method: string;
      value: number;
      percentage: string;
    }>;
  }