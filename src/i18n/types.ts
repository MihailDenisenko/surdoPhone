// src/i18n/types.ts
import ru from "./locales/ru.json";

export type TranslationKey = keyof typeof ru;
export type CommonKey = keyof typeof ru.common;
export type HomeKey = keyof typeof ru.home;
