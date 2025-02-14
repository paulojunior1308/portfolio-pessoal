import { create } from "zustand";

interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface CartItem {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  };
  quantity: number;
}

interface Store {
  user: User | null;
  cart: CartItem[];
  setUser: (user: User | null) => void;
  updateUser: (updatedData: Partial<User>) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  cart: [],
  setUser: (user) => set({ user }),
  updateUser: (updatedData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedData } : null,
    })),
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find(
        (cartItem) => cartItem.product.id === item.product.id
      );

      if (existingItem) {
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.product.id === item.product.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          ),
        };
      }

      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ cart: [] }),
}));
