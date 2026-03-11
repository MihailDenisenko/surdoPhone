// src/services/DataService.ts
import { Category, Gesture, RawCategory } from "../types";
import surdoData from "../datas/surdo_data.json";

// 🔹 Адаптер: RawCategory → Category
const adaptCategory = (raw: RawCategory): Category => ({
  id: raw.id,
  title: raw.title || raw.name,
  image: raw.image,
  dataLink: raw.url,
  about: raw.about,
  itemsCount: raw.items_count,
});

// 🔹 Адаптер: RawGesture → Gesture
const adaptGesture = (
  raw: any,
  index: number,
  categoryName?: string,
): Gesture => ({
  id: `${categoryName || "unknown"}-${index}`,
  nameLink: raw.name || raw.nameLink || "",
  videoURL: raw.video_url || raw.videoURL || raw.page_url || "",
  sourcePage: raw.page_url || raw.sourcePage || "",
  categoryName,
});

// ✅ Кэш категорий для доступа к жестам
let cachedCategories: RawCategory[] = [];

export const DataService = {
  /**
   * Загрузка категорий из локального JSON
   */
  async getCategories(): Promise<Category[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Читаем данные из JSON (поддерживаем оба формата)
        const rawData: any = surdoData;
        const categories: RawCategory[] = rawData.categories || rawData || [];

        // ✅ Сохраняем в кэш для доступа к жестам
        cachedCategories = categories;

        // ✅ Логи для отладки
        console.log("📊 Категорий загружено:", categories.length);
        console.log("📊 Первая категория:", categories[0]?.title);
        console.log(
          "📊 Жестов в первой категории:",
          categories[0]?.items?.length || 0,
        );

        resolve(categories.map(adaptCategory));
      }, 100);
    });
  },

  /**
   * Загрузка жестов по categoryId
   */
  async getGesturesByCategory(categoryId: string | number): Promise<Gesture[]> {
    console.log("🔍 Поиск категории по ID:", categoryId);
    console.log("🔍 Кэш категорий:", cachedCategories.length);

    return new Promise((resolve) => {
      setTimeout(() => {
        // ✅ Ищем категорию по ID в кэше
        const category = cachedCategories.find(
          (c) => String(c.id) === String(categoryId),
        );

        if (!category) {
          console.warn("⚠️ Категория не найдена:", categoryId);
          resolve([]);
          return;
        }

        console.log("✅ Категория найдена:", category.title);
        console.log("✅ Жестов в категории:", category.items?.length || 0);

        // ✅ Проверяем, есть ли items
        if (!category.items || category.items.length === 0) {
          console.warn("⚠️ В категории нет items:", category.title);
          resolve([]);
          return;
        }

        // ✅ Адаптируем и возвращаем жесты
        const gestures = category.items.map((item, index) =>
          adaptGesture(item, index, category.title),
        );

        console.log("✅ Жесты загружены:", gestures.length);
        console.log("✅ Первый жест:", gestures[0]?.nameLink);

        resolve(gestures);
      }, 200);
    });
  },

  /**
   * Утилита: извлечение прямой ссылки на видео
   */
  extractVideoUrl(htmlOrUrl: string): string {
    if (htmlOrUrl.includes(".mp4")) {
      return htmlOrUrl;
    }
    return htmlOrUrl;
  },
};
