// src/store/appStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gesture, Category } from "../types";

interface AppState {
  // Избранное
  favorites: Gesture[];
  addFavorite: (gesture: Gesture) => void;
  removeFavorite: (gestureId: string | number) => void;
  isFavorite: (gestureId: string | number) => boolean;

  // Недавно просмотренные
  recent: Gesture[];
  addRecent: (gesture: Gesture) => void;
  clearRecent: () => void;

  // История поиска
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Избранное
      favorites: [],
      addFavorite: (gesture) => {
        const current = get().favorites;
        if (!current.find((g) => g.id === gesture.id)) {
          set({ favorites: [...current, gesture] });
        }
      },
      removeFavorite: (gestureId) => {
        set({ favorites: get().favorites.filter((g) => g.id !== gestureId) });
      },
      isFavorite: (gestureId) => {
        return get().favorites.some((g) => g.id === gestureId);
      },

      // Недавно просмотренные (храним последние 10)
      recent: [],
      addRecent: (gesture) => {
        const current = get().recent;
        const filtered = current.filter((g) => g.id !== gesture.id);
        set({ recent: [gesture, ...filtered].slice(0, 10) });
      },
      clearRecent: () => set({ recent: [] }),

      // История поиска (храним последние 20 запросов)
      searchHistory: [],
      addSearchHistory: (query) => {
        if (!query.trim()) return;
        const current = get().searchHistory;
        const filtered = current.filter((q) => q !== query);
        set({ searchHistory: [query, ...filtered].slice(0, 20) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: "surdo-media-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
