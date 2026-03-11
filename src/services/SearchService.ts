// src/services/SearchService.ts
import { Gesture, RawCategory } from "../types";
import surdoData from "../datas/surdo_data.json";

// ✅ Глобальный кэш
let cachedAllGestures: Gesture[] | null = null;

const adaptGesture = (
  raw: any,
  index: number,
  categoryName: string,
  categoryImage: string,
): Gesture => ({
  id: `${categoryName}-${index}`,
  nameLink: raw.name || raw.nameLink || "Без названия",
  videoURL: raw.video_url || raw.videoURL || raw.page_url || "",
  sourcePage: raw.page_url || "",
  categoryName,
});

const getFlatGesturesCache = (): Gesture[] => {
  if (cachedAllGestures) {
    return cachedAllGestures;
  }

  console.log("⚡ Поиск: Создаем кэш жестов впервые...");

  const rawData: any = surdoData;
  const categories: RawCategory[] = rawData.categories || rawData || [];

  const flatList: Gesture[] = [];

  categories.forEach((category) => {
    if (!category.items || !Array.isArray(category.items)) return;

    category.items.forEach((item, index) => {
      if (!item.name && !item.nameLink) return;

      flatList.push(
        adaptGesture(
          item,
          index,
          category.title || "Неизвестно",
          category.image || "",
        ),
      );
    });
  });

  cachedAllGestures = flatList;
  console.log(`✅ Поиск: Кэш создан. Всего жестов: ${flatList.length}`);

  return flatList;
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const SearchService = {
  async search(query: string, limit: number = 50): Promise<Gesture[]> {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return [];
    }

    // ✅ Получаем кэш (мгновенно)
    const allGestures = getFlatGesturesCache();

    // ✅ Фильтрация
    const results = allGestures.filter((gesture) => {
      const normalizedName = normalizeText(gesture.nameLink);
      return normalizedName.includes(normalizedQuery);
    });

    // ✅ Сортировка
    results.sort((a, b) => {
      const nameA = normalizeText(a.nameLink);
      const nameB = normalizeText(b.nameLink);

      const startsWithA = nameA.startsWith(normalizedQuery);
      const startsWithB = nameB.startsWith(normalizedQuery);

      if (startsWithA && !startsWithB) return -1;
      if (!startsWithA && startsWithB) return 1;

      return nameA.localeCompare(nameB, "ru");
    });

    const slicedResults = results.slice(0, limit);

    // ✅ ВОЗВРАЩАЕМ СРАЗУ - БЕЗ setTimeout!
    return Promise.resolve(slicedResults);
  },

  clearCache: () => {
    cachedAllGestures = null;
  },
};
