# Photo Gallery - Lounge Project

Современная фотогалерея с административной панелью, построенная на Next.js, NestJS и Supabase.

## Технологический стек

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **База данных**: PostgreSQL (Supabase)
- **Хранилище файлов**: Backblaze B2
- **Аутентификация**: Clerk
- **ORM**: Prisma
- **Монорепозиторий**: Turborepo

## Структура проекта

### Apps и Packages

- `apps/web`: Next.js приложение (фронтенд)
- `apps/api`: NestJS API (бэкенд)
- `packages/ui`: Общие React компоненты
- `packages/types`: Общие TypeScript типы
- `packages/eslint-config`: Конфигурация ESLint
- `packages/typescript-config`: Конфигурация TypeScript

## Быстрый старт

### 1. Установка зависимостей

```bash
pnpm install
```

### 2. Настройка сервисов

Следуйте инструкциям в [SETUP.md](./SETUP.md) для настройки базы данных Supabase и хранилища Backblaze B2.

### 3. Настройка переменных окружения

Скопируйте файлы `.env.example` и заполните необходимые значения:

```bash
# Корневой .env
cp .env.example .env

# API .env
cp apps/api/.env.example apps/api/.env

# Web .env
cp apps/web/.env.example apps/web/.env
```

### 4. Миграция базы данных

```bash
cd apps/api
pnpm run prisma:generate
pnpm run prisma:migrate
```

### 5. Запуск проекта

```bash
# Запуск всех сервисов
pnpm dev

# Или запуск по отдельности:
# API
cd apps/api && pnpm run start:dev

# Frontend
cd apps/web && pnpm run dev
```

## Основные возможности

- 📸 **Управление фотографиями**: Загрузка, редактирование, удаление
- 📁 **Категории и альбомы**: Организация контента
- 🔐 **Административная панель**: Полное управление контентом
- 🎨 **Адаптивный дизайн**: Оптимизация для всех устройств
- ⚡ **Быстрая загрузка**: Оптимизация изображений и кэширование
- 🔒 **Безопасность**: Аутентификация и авторизация

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
