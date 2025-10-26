# Photo Gallery - Lounge Project

A modern photo gallery with an admin panel, built on Next.js, NestJS, and Supabase.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL (Supabase)
- **File Storage**: Backblaze B2
- **Authentication**: Clerk
- **ORM**: Prisma
- **Monorepo**: Turborepo

## Project Structure

### Apps and Packages

- `apps/web`: Next.js application (frontend)
- `apps/api`: NestJS API (backend)
- `packages/ui`: Shared React components
- `packages/types`: Shared TypeScript types
- `packages/eslint-config`: ESLint configuration
- `packages/typescript-config`: TypeScript configuration

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Services

Follow the instructions in [SETUP.md](./SETUP.md) to set up the Supabase database and Backblaze B2 storage.

### 3. Set Up Environment Variables

Copy the `.env.example` files and fill in the required values:

```bash
# Root .env
cp .env.example .env

# API .env
cp apps/api/.env.example apps/api/.env

# Web .env
cp apps/web/.env.example apps/web/.env
```

### 4. Database Migration

```bash
cd apps/api
pnpm run prisma:generate
pnpm run prisma:migrate
```

### 5. Run the Project

```bash
# Run all services
pnpm dev

# Or run separately:
# API
cd apps/api && pnpm run start:dev

# Frontend
cd apps/web && pnpm run dev
```

## Key Features

- 📸 **Photo Management**: Upload, edit, delete
- 📁 **Categories and Albums**: Content organization
- 🔐 **Admin Panel**: Full content management
- 🎨 **Responsive Design**: Optimized for all devices
- ⚡ **Fast Loading**: Image optimization and caching
- 🔒 **Security**: Authentication and authorization

### Utilities

This Turborepo has some additional tools already set up for you:

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
