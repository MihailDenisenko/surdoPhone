```markdown
# 🤟 Surdo.Media Mobile

> 📱 Кроссплатформенное мобильное приложение для изучения Русского жестового языка (РЖЯ)


![React Native](https://raw.githubusercontent.com/MihailDenisenko/surdoPhone/main/assets/React_Native-20232A.svg)


![React Native](./assets/React_Native-20232A.svg)
![TypeScript](./assets/TypeScript-007ACC.svg)
![iOS](./assets/iOS-000000.svg)
![Android](./assets/Android-3DDC84.svg)
![License](./assets/License-MIT-blue.svg)

<p align="center">
  <img src="./assets/React_Native-20232A.svg" width="auto" height="28" alt="React Native" />
  <img src="./assets/TypeScript-007ACC.svg" width="auto" height="28" alt="TypeScript" />
  <img src="./assets/iOS-000000.svg" width="auto" height="28" alt="iOS" />
  <img src="./assets/Android-3DDC84.svg" width="auto" height="28" alt="Android" />
  <img src="./assets/License-MIT-blue.svg" width="auto" height="28" alt="MIT License" />
</p>

---

## 📋 О проекте

**Surdo.Media Mobile** — это нативное мобильное приложение, разработанное на базе веб-платформы [surdo.media](https://surdo.media), посвящённой Русскому жестовому языку. Приложение предоставляет удобный доступ к словарю жестов, тематическим категориям и образовательным материалам для глухих и слабослышащих людей, а также для всех, кто хочет изучать РЖЯ.

> 🎯 **Миссия**: Сделать изучение жестового языка доступным, интерактивным и увлекательным в любом месте и в любое время.

---

## ✨ Ключевые возможности

### 🔹 Уже реализовано / В разработке:
- 📚 **Интерактивный словарь жестов** с поиском по алфавиту и категориям
- 🎬 **Видео-демонстрации** жестов с возможностью замедленного воспроизведения
- 🗂️ **Тематические категории**: Образование, Медицина, Семья, Спорт, Искусство и др.
- 🔍 **Умный поиск** с поддержкой русского языка и подсказками
- ⭐ **Избранное** — сохранение часто используемых жестов
- 📥 **Офлайн-режим** — доступ к базовому словарю без интернета
- 🎨 **Адаптивный дизайн** с поддержкой светлой/тёмной темы
- ♿ **Доступность (a11y)** — полная поддержка VoiceOver/TalkBack

### 🔹 Планируется:
- 🤳 **AR-режим** — визуализация жестов через камеру с наложением 3D-модели
- 🎤 **Распознавание жестов** через ML Kit / MediaPipe для практики
- 👥 **Социальные функции** — обмен заметками, комментарии, сообщества
- 📊 **Прогресс обучения** — статистика, достижения, напоминания
- 🌐 **Мультиязычность** — поддержка других жестовых языков (АСЛ, BSL и др.)
- 🔔 **Пуш-уведомления** — новые слова, челленджи, мотивация

---

## 🛠️ Технологический стек

```yaml
Core:
  - React Native 0.73+
  - TypeScript 5.x
  - React Navigation 6.x

State Management:
  - Zustand / Redux Toolkit
  - React Query (TanStack Query) для кэширования API

UI/UX:
  - React Native Reanimated 3
  - NativeWind / Tamagui для стилизации
  - React Native Gesture Handler

Media:
  - react-native-video
  - react-native-fast-image
  - expo-av (опционально)

Offline & Storage:
  - WatermelonDB / Realm для локальной БД
  - MMKV для быстрого хранения настроек

API & Network:
  - Axios с интерцепторами
  - React Native NetInfo для контроля соединения

Testing:
  - Jest + React Native Testing Library
  - Detox для E2E-тестов

DevOps:
  - Fastlane для автоматизации сборки
  - GitHub Actions CI/CD
  - Sentry для мониторинга ошибок
```

---

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- Yarn 1.22+ / npm 9+
- Ruby 3.0+ (для iOS-сборки)
- CocoaPods (только macOS)
- Android SDK / Xcode 14+

### Установка

```bash
# Клонируйте репозиторий
git clone https://github.com/your-org/surdo-mobile.git
cd surdo-mobile

# Установите зависимости
yarn install

# Для iOS (только macOS)
cd ios && pod install && cd ..

# Запустите метро-сервер
yarn start

# Запустите приложение
yarn android  # или
yarn ios
```

### Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
API_BASE_URL=https://api.surdo.media
ENABLE_OFFLINE_SYNC=true
SENTRY_DSN=your_dsn_here
```

---

## 📁 Структура проекта

```
src/
├── api/                 # API-клиенты и эндпоинты
├── assets/              # Изображения, шрифты, иконки
├── components/          # Переиспользуемые UI-компоненты
├── features/            # Фича-модули (словарь, поиск, профиль)
├── hooks/               # Кастомные хуки
├── navigation/          # Конфигурация навигации
├── store/               # Глобальное состояние
├── theme/               # Дизайн-система: цвета, типографика, отступы
├── utils/               # Хелперы, утилиты, константы
└── i18n/                # Локализация (при необходимости)
```

---

## 🧭 Архитектурные принципы

Как **Senior React Native Developer**, я придерживаюсь следующих практик:

✅ **Feature-Sliced Design** — модульность и изоляция бизнес-логики  
✅ **Type Safety First** — строгая типизация через TypeScript  
✅ **Performance by Default** — мемоизация, FlatList оптимизации, lazy loading  
✅ **Accessibility First** — семантическая вёрстка, поддержка скринридеров  
✅ **Testable Code** — разделение логики и представления, DI для моков  
✅ **Clean Architecture** — слои: presentation → domain → data  

---

## 🤝 Вклад в проект

Мы приветствуем контрибьюторов! Перед отправкой PR:

1. Создайте ветку от `develop`: `git checkout -b feat/your-feature`
2. Следуйте [Conventional Commits](https://www.conventionalcommits.org/)
3. Добавьте тесты для новой функциональности
4. Убедитесь, что линтер и типизация проходят: `yarn lint && yarn typecheck`
5. Обновите документацию при необходимости

> 💡 **Совет**: Используйте `yarn commit` для интерактивного создания коммитов через commitizen.

---

## 📦 Сборка и релиз

### Android

```bash
# Debug APK
yarn android:build:debug

# Release AAB (для Google Play)
yarn android:build:release
```

### iOS

```bash
# Debug build
yarn ios:build:debug

# Release archive (для App Store Connect)
yarn ios:build:release
```

> 🔐 Ключи подписи и сертификаты хранятся в зашифрованном виде через `fastlane match`.

---

## 🧪 Тестирование

```bash
# Юнит-тесты
yarn test

# Тесты с покрытием
yarn test:coverage

# E2E-тесты (требует запущенного приложения)
yarn test:e2e

# Линтинг и типизация
yarn lint
yarn typecheck
```

---

## 📄 Лицензия

Проект распространяется под лицензией **MIT**.  
Подробнее: [LICENSE](./LICENSE)

---

## 💬 Контакты и поддержка

- 🌐 Веб-платформа: [surdo.media](https://surdo.media)
- ✉️ Email: `admin@vidkino.media`
- ▶️ YouTube: [@ARKMEDIA-SPB](https://www.youtube.com/@VidKino_media)
- 💬 VK: [arkspborg](https://vk.com/vidkino_media)

---

> 🙏 **Благодарности**  
> Спасибо сообществу глухих и слабослышащих людей за вдохновение и обратную связь.  
> Этот проект — шаг к более инклюзивному цифровому пространству. 🤟

> 💡 **Pro Tip от Senior Dev**:  
> *"Не оптимизируй преждевременно, но всегда думай о производительности. Пользователь не должен ждать — особенно когда он учится общаться."*

---

*Сделано с ❤️ и уважением к жестовому языку*  
*Surdo.Media Mobile Team © 2026*
