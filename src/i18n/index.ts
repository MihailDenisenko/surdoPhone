// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import ru from "./locales/ru.json";

// Типизируем ресурсы для i18next v25
export const resources = {
  ru: {
    translation: ru,
  },
} as const;

// Получаем язык устройства с безопасным fallback
const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  // В expo-localization v55 locales[0] может быть undefined
  const languageTag =
    locales[0]?.languageTag ?? locales[0]?.languageCode ?? "ru";
  return languageTag?.startsWith("ru") ? "ru" : "ru"; // Форсируем RU пока
};

i18n.use(initReactI18next).init({
  resources: resources as unknown as typeof resources, // Обход строгой типизации ресурсов
  lng: getDeviceLanguage(),
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
  // В i18next v25 compatibilityJSON не нужен (по умолчанию v4)
});

export default i18n;
