import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavorites = create(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (product) =>
        set((state) => ({
          favorites: [...state.favorites, product],
        })),
      removeFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.filter((product) => product.id !== productId),
        })),
      isFavorite: (productId) =>
        set((state) => state.favorites.some((product) => product.id === productId)),
    }),
    {
      name: 'favorites-storage',
    }
  )
);