// src/types/index.ts
import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

// 🔹 RAW: Точная структура из JSON
export interface RawCategory {
  id: number;
  name: string;
  title: string;
  url: string;
  about: string;
  image: string;
  items: RawGesture[];
  items_count: number;
  videos_found: number;
}

export interface RawGesture {
  nameLink: any;
  name: string;
  page_url: string;
  video_url: string;
}

// 🔹 APP: Адаптированная структура для приложения
export interface Gesture {
  id: string | number;
  nameLink: string;
  videoURL: string;
  sourcePage?: string;
  categoryName?: string;
  isCategory?: boolean;
  categoryData?: RawCategory;
}

export interface Category {
  id: string | number;
  title: string;
  image: string;
  dataLink: string;
  about?: string;
  itemsCount?: number;
}

// 🔹 Навигация — параметры экранов
export type AppStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CategoryDetail: { categoryId: string | number; title: string };
  VideoPlayer: { videoUrl: string; title: string };
  Favorites: undefined;
  History: undefined;
};

// ✅ Типизированные пропсы для экранов
export type AppScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

// ✅ Навигация — экспортируем явно!
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
