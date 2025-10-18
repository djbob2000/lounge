# Development Guidelines

If you need best practice code, use context7
Don't wait for me to launch the page, use the chrome-devtools browser.

## Project Overview

This project is a monorepo managed with pnpm and TurboRepo. It consists of applications (`apps/`) and shared packages (`packages/`). The main goal is to develop a lounge photo gallery application with a separate NestJS API backend and Next.js web frontend.

### Tech Stack

- **Monorepo Management:** pnpm workspaces + TurboRepo
- **Backend:** NestJS, Prisma ORM, PostgreSQL
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Authentication:** Clerk (with Ukrainian localization)
- **UI Framework:** Shadcn UI, Radix UI, Tailwind CSS v4
- **Storage:** Backblaze B2
- **Image Processing:** Sharp
- **Form Management:** React Hook Form + Zod validation
- **Code Quality:** Biome (linting + formatting)
- **Testing:** Jest (API), React Testing Library (web)

## Project Architecture

### Applications (`apps/`)

#### `apps/api/` - NestJS Backend
- **Framework:** NestJS with Express
- **Database:** Prisma ORM + PostgreSQL (Supabase)
- **Authentication:** Clerk Express middleware
- **File Upload:** Multer + Sharp for image processing
- **Storage:** Backblaze B2 integration
- **Structure:**
  - `src/albums/` - Album management module
  - `src/auth/` - Authentication guards and strategies
  - `src/categories/` - Category management module
  - `src/photos/` - Photo upload and management module
  - `src/prisma/` - Database service and connection
  - `src/stats/` - Statistics module
  - `src/storage/` - B2 storage service
  - `prisma/schema.prisma` - Database schema (Category, Album, Photo models)
- **Port:** 3001 (default)
- **Key Features:**
  - RESTful API endpoints
  - Image optimization and thumbnail generation
  - Slug-based routing
  - Display order management
  - Cascade deletion support

#### `apps/web/` - Next.js Frontend
- **Framework:** Next.js 15 with App Router (Turbopack enabled)
- **React Version:** 19.2.0
- **Authentication:** Clerk Next.js SDK with Ukrainian localization
- **UI Components:** Shadcn UI + Radix UI primitives
- **Styling:** Tailwind CSS v4
- **Structure:**
  - `app/` - Next.js App Router pages
    - `[categorySlug]/` - Dynamic category pages
    - `admin/` - Protected admin panel
    - `api/` - API routes
    - `sign-in/`, `sign-up/` - Auth pages
  - `components/` - React components
    - `admin/` - Admin-specific components
    - `layout/` - Layout components (Header, Footer, ClientLayout)
    - `ui/` - Shadcn UI components
  - `lib/` - Utility functions
  - `middleware.ts` - Clerk authentication middleware
- **Key Features:**
  - Server-side rendering (SSR)
  - Dynamic routing with slugs
  - Protected admin routes
  - Image carousel/slider
  - Drag-and-drop functionality (@dnd-kit)
  - Form validation with Zod
  - Toast notifications (Sonner)

### Shared Packages (`packages/`)

#### `packages/types/`
- Shared TypeScript type definitions
- API response types
- Domain models (Category, Album, Photo)
- User role constants
- Exported to both API and web apps

#### `packages/ui/`
- Reusable React components
- Shadcn UI components (Button, Card, Form, Label)
- Custom components (PhotoGallery, ImageSlider)
- Shared across web app and potentially other frontends

#### `packages/typescript-config/`
- Shared TypeScript configurations
- `base.json` - Base config
- `nextjs.json` - Next.js specific config
- `react-library.json` - React library config

### Root Configuration

- `package.json` - Monorepo scripts and dependencies
- `pnpm-workspace.yaml` - Workspace package definitions
- `turbo.json` - TurboRepo task pipeline and caching
- `biome.jsonc` - Biome linting and formatting rules
- `.env`, `.env.local`, `.env.example` - Environment variables

## Code Standards

### General TypeScript Standards

- **Language:** Write all code in TypeScript with strict type checking enabled
- **Code Style:** Concise, technical, functional, and declarative programming patterns
- **Naming Conventions:**
  - Use PascalCase for components, classes, types, and interfaces
  - Use camelCase for variables, functions, and methods
  - Use SCREAMING_SNAKE_CASE for constants
  - Use descriptive names with auxiliary verbs (e.g., `isLoading`, `hasError`, `canEdit`)
  - Prefix boolean variables with `is`, `has`, `can`, `should`
- **Exports:** Favor named exports over default exports for better refactoring and tree-shaking
- **Functions:** Prioritize pure functions; be consistent with `function` declarations or arrow functions
- **Conditionals:** Avoid unnecessary curly braces; use concise syntax for simple statements
- **Iteration:** Prefer iteration and modularization over code duplication

### Type System Standards

- **Type vs Interface:**
  - Use `interface` for object shapes that can be extended or implemented
  - Use `type` for unions, intersections, utility types, or primitive aliases
  - Maintain consistency within specific contexts
- **Enums:** Avoid native TypeScript `enum`s. Use const objects with string literal types:
  ```typescript
  export const UserRole = {
    ADMIN: 'admin',
    USER: 'user',
  } as const;
  export type UserRole = typeof UserRole[keyof typeof UserRole];
  ```
- **Type Safety:** Avoid `any`; use `unknown` when type is truly unknown
- **Null Safety:** Use optional chaining (`?.`) and nullish coalescing (`??`)
- **Type Imports:** Use `import type` for type-only imports to improve build performance

### Biome Configuration

The project uses Biome for linting and formatting (not ESLint/Prettier):
- **Formatter:** 2-space indentation, 100 character line width, single quotes, trailing commas
- **Linter Rules:**
  - Complexity: Warn on excessive cognitive complexity
  - Correctness: Error on unused variables, warn on exhaustive dependencies
  - Style: Warn on non-null assertions
  - Suspicious: Warn on explicit `any`, array index keys
  - A11y: Warn on accessibility issues
  - Security: Warn on dangerous HTML
- **Commands:**
  - `pnpm lint` - Check for issues
  - `pnpm lint:fix` - Auto-fix issues
  - `pnpm format` - Format code

### Comments and Documentation

- **Language:** Use English for all comments and documentation
- **Purpose:** Explain complex logic, non-obvious decisions, and "why" not "what"
- **JSDoc:** Use for public APIs, exported functions, components, and type definitions
- **Avoid:** Redundant comments that simply restate the code
- **Example:**
  ```typescript
  /**
   * Generates optimized thumbnails for uploaded photos
   * @param file - Original image file
   * @param options - Thumbnail generation options
   * @returns Promise with thumbnail URL and dimensions
   */
  async function generateThumbnail(file: File, options: ThumbnailOptions): Promise<ThumbnailResult>
  ```

## Functionality Implementation Standards

### Backend (`apps/api/`) - NestJS Standards

#### Module Structure
- Follow NestJS modular architecture
- Each feature should have its own module (e.g., `albums.module.ts`)
- Structure: `controller` → `service` → `repository/Prisma`
- Use dependency injection for all services
- Example structure:
  ```
  albums/
  ├── dto/
  │   ├── create-album.dto.ts
  │   └── update-album.dto.ts
  ├── albums.controller.ts
  ├── albums.service.ts
  └── albums.module.ts
  ```

#### Controllers
- Use decorators: `@Controller()`, `@Get()`, `@Post()`, `@Put()`, `@Delete()`
- Implement proper HTTP status codes
- Use DTOs for request validation
- Apply guards for authentication: `@UseGuards(AuthGuard)`
- Keep controllers thin - delegate logic to services
- Example:
  ```typescript
  @Controller('albums')
  export class AlbumsController {
    constructor(private readonly albumsService: AlbumsService) {}

    @Get(':slug')
    async findBySlug(@Param('slug') slug: string) {
      return this.albumsService.findBySlug(slug);
    }
  }
  ```

#### Services
- Contain business logic
- Use Prisma service for database operations
- Handle errors with NestJS exceptions (`NotFoundException`, `BadRequestException`)
- Keep methods focused and single-purpose
- Use transactions for multi-step operations

#### DTOs (Data Transfer Objects)
- Use `class-validator` decorators for validation
- Use `class-transformer` for transformation
- Define separate DTOs for create, update, and response
- Example:
  ```typescript
  export class CreateAlbumDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    categoryId: string;
  }
  ```

#### Database (Prisma)
- Define models in `prisma/schema.prisma`
- Use UUIDs for primary keys
- Include `createdAt` and `updatedAt` timestamps
- Use proper relations and cascade rules
- Add indexes for frequently queried fields
- Run migrations: `pnpm prisma:migrate`
- Generate client: `pnpm prisma:generate`

#### Authentication
- Use Clerk Express middleware (configured in `main.ts`)
- Apply `AuthGuard` to protected routes
- Access user info via `@Req()` decorator
- Conditionally bypass auth for specific routes (e.g., file uploads)

#### File Upload
- Use Multer for multipart/form-data
- Process images with Sharp (resize, optimize, generate thumbnails)
- Upload to Backblaze B2 via storage service
- Store URLs in database
- Clean up temporary files

### Frontend (`apps/web/`) - Next.js Standards

#### App Router Structure
- Use Next.js 15 App Router (not Pages Router)
- Server Components by default
- Client Components only when necessary (`'use client'`)
- File-based routing in `app/` directory
- Dynamic routes: `[categorySlug]/page.tsx`
- Layouts: `layout.tsx` for shared UI
- Loading states: `loading.tsx`
- Error boundaries: `error.tsx`
- Not found: `not-found.tsx`

#### Server Components (Default)
- Use for data fetching, static content, SEO-critical pages
- Fetch data directly in components (no `useEffect`)
- Use `async/await` for data fetching
- Cache control with `fetch` options: `cache: 'no-store'` or `next: { revalidate: 60 }`
- Example:
  ```typescript
  async function getCategories(): Promise<Category[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      cache: 'no-store',
    });
    return response.json();
  }

  export default async function Page() {
    const categories = await getCategories();
    return <CategoryList categories={categories} />;
  }
  ```

#### Client Components
- Use `'use client'` directive at top of file
- Required for:
  - Interactive elements (onClick, onChange)
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, window)
  - Third-party libraries requiring client-side
- Keep client components small and focused
- Wrap in `<Suspense>` with fallback when possible
- Example:
  ```typescript
  'use client';

  import { useState } from 'react';

  export function InteractiveButton() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
  }
  ```

#### Data Fetching Patterns
- **Server Components:** Direct `fetch` or API calls
- **Client Components:** Use SWR or React Query (if needed)
- **API Routes:** Use for server-side logic, webhooks, or proxying
- Avoid `useEffect` for data fetching - use Server Components instead
- Handle loading and error states gracefully

#### Authentication (Clerk)
- Middleware in `middleware.ts` protects routes
- Public routes defined with `createRouteMatcher`
- Admin routes require authentication check
- Use `auth()` helper in Server Components
- Use `useAuth()` hook in Client Components
- Ukrainian localization: `ukUA` from `@clerk/localizations`

#### Forms and Validation
- Use React Hook Form for form management
- Use Zod for schema validation
- Use `@hookform/resolvers/zod` for integration
- Use Shadcn Form components for consistent UI
- Example:
  ```typescript
  const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  ```

#### State Management
- Minimize client-side state
- Use React Server Components for server state
- Use URL search params for shareable state
- Use Context API sparingly for truly global state
- Avoid Redux unless absolutely necessary

### Shared Packages Standards

#### `packages/types/`
- Export all shared types from `index.ts`
- Organize by domain: `models/`, `api/`
- Use consistent naming across API and web
- Document complex types with JSDoc
- Version types carefully (breaking changes affect all apps)

#### `packages/ui/`
- Build reusable, composable components
- Use Shadcn UI patterns and conventions
- Support Tailwind CSS styling via `className` prop
- Use `React.forwardRef` for components that need refs
- Export from `index.ts` for clean imports
- Document props with TypeScript interfaces and JSDoc

## Framework/Plugin/Third-party Library Usage Standards

### Dependency Management

- **Package Manager:** Use `pnpm` exclusively (not npm or yarn)
- **Adding Dependencies:**
  - Root level: `pnpm add <package> -w` (for shared dev tools)
  - App level: `pnpm add <package> --filter api` or `--filter web`
  - Package level: `pnpm add <package> --filter @lounge/types`
- **Workspace Dependencies:** Use `workspace:*` protocol for internal packages
- **Version Pinning:** Pin major versions, allow minor/patch updates
- **Audit:** Regularly run `pnpm audit` for security vulnerabilities

### Key Libraries and Usage Patterns

#### NestJS (Backend)
- **Version:** 11.x
- **Modules:** Use `@Module()` decorator with imports, controllers, providers
- **Dependency Injection:** Constructor injection for services
- **Pipes:** Use `ValidationPipe` for DTO validation
- **Guards:** Use for authentication and authorization
- **Interceptors:** Use for logging, transformation, caching
- **Exception Filters:** Use for custom error handling
- **Documentation:** Consider adding Swagger/OpenAPI

#### Prisma ORM
- **Version:** 6.x
- **Schema:** Define in `prisma/schema.prisma`
- **Migrations:** Use `prisma migrate dev` for development
- **Client:** Auto-generated, import from `@prisma/client`
- **Best Practices:**
  - Use transactions for multi-step operations
  - Use `select` to limit returned fields
  - Use `include` for relations
  - Add indexes for performance
  - Use soft deletes when appropriate

#### Next.js (Frontend)
- **Version:** 15.x with Turbopack
- **App Router:** Use exclusively (not Pages Router)
- **Image Optimization:** Use `next/image` component
- **Font Optimization:** Use `next/font` (e.g., `Inter`)
- **Metadata:** Export `metadata` object for SEO
- **Dynamic Imports:** Use `next/dynamic` for code splitting
- **Environment Variables:**
  - `NEXT_PUBLIC_*` for client-side
  - No prefix for server-side only

#### React
- **Version:** 19.x
- **Components:** Functional components only
- **Hooks:** Use built-in hooks appropriately
- **Patterns:**
  - Composition over inheritance
  - Controlled components for forms
  - Lift state up when needed
  - Use `React.memo()` for expensive renders
  - Use `useMemo()` and `useCallback()` judiciously

#### Clerk (Authentication)
- **Backend:** `@clerk/express` middleware
- **Frontend:** `@clerk/nextjs` SDK
- **Localization:** Use `ukUA` from `@clerk/localizations`
- **Components:** Use built-in `<SignIn>`, `<SignUp>`, `<UserButton>`
- **Helpers:**
  - Server: `auth()`, `currentUser()`
  - Client: `useAuth()`, `useUser()`
- **Middleware:** Configure in `middleware.ts`

#### Shadcn UI + Radix UI
- **Installation:** Use `npx shadcn@latest add <component>`
- **Customization:** Modify components in `components/ui/`
- **Theming:** Configure in `tailwind.config.js` and CSS variables
- **Accessibility:** Radix provides ARIA attributes automatically
- **Components Used:**
  - Dialog, Dropdown Menu, Select, Checkbox
  - Alert Dialog, Popover, Navigation Menu
  - Form components with React Hook Form integration

#### Tailwind CSS
- **Version:** 4.x
- **Configuration:** `tailwind.config.js` in web app
- **Utilities:** Use utility-first approach
- **Custom Classes:** Use `@apply` sparingly
- **Responsive Design:** Mobile-first with breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- **Dark Mode:** Configure if needed with `class` strategy
- **Performance:** Purge unused styles automatically

#### React Hook Form + Zod
- **Form Management:** React Hook Form for state and validation
- **Schema Validation:** Zod for type-safe schemas
- **Integration:** Use `@hookform/resolvers/zod`
- **Pattern:**
  ```typescript
  const schema = z.object({ name: z.string().min(1) });
  const form = useForm({ resolver: zodResolver(schema) });
  ```

#### Image Processing (Sharp)
- **Use Cases:** Resize, optimize, generate thumbnails
- **Formats:** Convert to WebP for better compression
- **Quality:** Balance quality vs file size (80-85% typically)
- **Metadata:** Preserve or strip EXIF data as needed

#### Backblaze B2 (Storage)
- **SDK:** `backblaze-b2` npm package
- **Authentication:** Use application key ID and key
- **Upload:** Use `uploadFile` method
- **URLs:** Store download URLs in database
- **Security:** Use signed URLs for private content

#### DnD Kit (Drag and Drop)
- **Core:** `@dnd-kit/core` for drag and drop logic
- **Sortable:** `@dnd-kit/sortable` for sortable lists
- **Utilities:** `@dnd-kit/utilities` for helpers
- **Modifiers:** `@dnd-kit/modifiers` for constraints
- **Use Case:** Reordering albums, photos, categories

#### Sonner (Toast Notifications)
- **Usage:** Import `toast` from `sonner`
- **Types:** `toast.success()`, `toast.error()`, `toast.info()`
- **Placement:** Add `<Toaster />` in root layout
- **Customization:** Configure position, duration, styling

### Adding New Libraries

Before adding a new library, consider:
1. **Necessity:** Is it truly needed or can existing tools suffice?
2. **Bundle Size:** Check impact on bundle size (use bundlephobia.com)
3. **Maintenance:** Is it actively maintained?
4. **TypeScript Support:** Does it have good TypeScript definitions?
5. **Compatibility:** Does it work with Next.js 15 and React 19?
6. **Alternatives:** Are there better alternatives already in use?
7. **Documentation:** Is it well-documented?

## Workflow Standards

### Development Workflow

#### Starting Development
```bash
# Install dependencies (run once or after package.json changes)
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter web dev
pnpm --filter api dev-all

# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
```

#### Code Quality Checks
```bash
# Lint all code
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format all code
pnpm format

# Type check all TypeScript
pnpm check-types

# Run all checks
pnpm check
```

#### Database Workflow (Prisma)
```bash
# Navigate to API directory
cd apps/api

# Create a new migration
pnpm prisma:migrate

# Generate Prisma Client (after schema changes)
pnpm prisma:generate

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

#### Testing Workflow
```bash
# Run API tests
pnpm --filter api test

# Run tests in watch mode
pnpm --filter api test:watch

# Run tests with coverage
pnpm --filter api test:cov

# Run E2E tests
pnpm --filter api test:e2e
```

### Git Workflow

#### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

#### Commit Messages
Follow conventional commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

Examples:
```
feat(api): add album reordering endpoint
fix(web): resolve image loading issue on mobile
docs(readme): update setup instructions
refactor(types): consolidate photo types
```

#### Pre-commit Checklist
1. Run `pnpm lint:fix` to fix linting issues
2. Run `pnpm check-types` to verify TypeScript
3. Run `pnpm build` to ensure builds succeed
4. Test affected functionality manually
5. Write clear commit message
6. Push to feature branch
7. Create pull request with description

### Shared Package Updates

When updating shared packages (`packages/*`):

1. **Make Changes:** Edit files in the package
2. **Build Package:** Run `pnpm --filter @lounge/types build` (if applicable)
3. **Verify Consumers:** Check that dependent apps still work
4. **Update Version:** Consider semantic versioning for breaking changes
5. **Document Changes:** Update package README if needed

Example workflow for updating types:
```bash
# Edit types
vim packages/types/src/models.ts

# Build types package
pnpm --filter @lounge/types build

# Verify API still works
pnpm --filter api check-types

# Verify web still works
pnpm --filter web check-types

# Test both apps
pnpm dev
```

### Environment Variables

#### Setup
1. Copy `.env.example` to `.env` in root and each app
2. Fill in required values
3. Never commit `.env` files (in `.gitignore`)
4. Document new variables in `.env.example`

#### Required Variables

**Root `.env`:**
```
CLERK_SECRET_KEY=
CLERK_JWT_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

**`apps/api/.env`:**
```
DATABASE_URL=
DIRECT_URL=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
B2_APPLICATION_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=
B2_BUCKET_NAME=
B2_DOWNLOAD_URL=
PORT=3001
```

**`apps/web/.env`:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### TurboRepo Caching

TurboRepo caches task outputs for faster builds:
- **Cache Location:** `.turbo/cache/`
- **Clear Cache:** `rm -rf .turbo/cache`
- **Remote Caching:** Configure for team collaboration
- **Task Dependencies:** Defined in `turbo.json`

Tasks are cached based on:
- Input files (source code)
- Environment variables (listed in `globalEnv`)
- Dependencies

### Troubleshooting

#### Common Issues

**"Module not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

**Prisma Client out of sync:**
```bash
cd apps/api
pnpm prisma:generate
```

**Type errors after updating shared package:**
```bash
# Rebuild the package
pnpm --filter @lounge/types build

# Restart TypeScript server in your IDE
```

**Port already in use:**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Build failures:**
```bash
# Clear TurboRepo cache
rm -rf .turbo

# Clear Next.js cache
rm -rf apps/web/.next

# Rebuild
pnpm build
```

## Deployment and Environment Management

### Environment Configuration

#### Environment Variables Structure

**Root `.env` (Shared):**
```bash
# Clerk Authentication (shared across apps)
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**`apps/api/.env` (Backend):**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DIRECT_URL=postgresql://user:password@host:5432/database

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Backblaze B2
B2_APPLICATION_KEY_ID=...
B2_APPLICATION_KEY=...
B2_BUCKET_ID=...
B2_BUCKET_NAME=...
B2_DOWNLOAD_URL=https://...

# Server
PORT=3001
NODE_ENV=development
```

**`apps/web/.env` (Frontend):**
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Next.js
NODE_ENV=development
```

#### Environment Variable Best Practices

**Naming Conventions:**
- `NEXT_PUBLIC_*` - Exposed to browser (use sparingly)
- `*_URL` - Endpoint URLs
- `*_KEY` - API keys and secrets
- `*_ID` - Resource identifiers

**Security:**
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets regularly
- Use different keys for dev/staging/production
- Store production secrets in secure vault

**Validation:**
```typescript
// apps/api/src/config/env.validation.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  B2_APPLICATION_KEY_ID: z.string().min(1),
  B2_APPLICATION_KEY: z.string().min(1),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

### Deployment Strategies

#### Vercel (Recommended for Web)

**Setup:**
1. Connect GitHub repository
2. Configure build settings:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm build --filter=web`
   - Output Directory: `.next`
3. Add environment variables in Vercel dashboard
4. Deploy

**Configuration:**
```json
// vercel.json (in apps/web/)
{
  "buildCommand": "cd ../.. && pnpm build --filter=web",
  "devCommand": "cd ../.. && pnpm dev --filter=web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

#### Railway/Render (Recommended for API)

**Setup:**
1. Connect GitHub repository
2. Configure build settings:
   - Root Directory: `apps/api`
   - Build Command: `cd ../.. && pnpm install && pnpm build --filter=api`
   - Start Command: `cd apps/api && pnpm start:prod`
3. Add environment variables
4. Provision PostgreSQL database
5. Deploy

**Dockerfile (Alternative):**
```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm build --filter=api

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built files
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/node_modules ./node_modules
COPY --from=base /app/apps/api/package.json ./

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/main.js"]
```

#### Database Migrations

**Development:**
```bash
cd apps/api
pnpm prisma:migrate
```

**Production:**
```bash
# Run migrations before deploying
cd apps/api
pnpm prisma migrate deploy

# Or in CI/CD pipeline
- name: Run migrations
  run: cd apps/api && pnpm prisma migrate deploy
```

### CI/CD Pipeline

#### GitHub Actions Example

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm check-types

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter api test

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
```

### Monitoring and Logging

#### Application Monitoring

**Sentry (Error Tracking):**
```typescript
// apps/web/app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// apps/api/src/main.ts
import * as Sentry from '@nestjs/sentry';

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Logging:**
```typescript
// Use NestJS Logger
import { Logger } from '@nestjs/common';

export class AlbumsService {
  private readonly logger = new Logger(AlbumsService.name);

  async findAll() {
    this.logger.log('Fetching all albums');
    try {
      return await this.prisma.album.findMany();
    } catch (error) {
      this.logger.error('Failed to fetch albums', error.stack);
      throw error;
    }
  }
}
```

#### Performance Monitoring

**Vercel Analytics:**
```tsx
// apps/web/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Database Query Monitoring:**
```typescript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Backup and Recovery

#### Database Backups

**Automated Backups:**
- Enable automated backups on database provider
- Retention: 7 days minimum
- Test restore procedure regularly

**Manual Backup:**
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

#### File Storage Backups

**Backblaze B2:**
- Enable versioning on bucket
- Set lifecycle rules for old versions
- Consider cross-region replication

### Scaling Considerations

#### Horizontal Scaling

**API:**
- Stateless design (no in-memory sessions)
- Use Redis for shared cache
- Load balancer for multiple instances
- Database connection pooling

**Web:**
- Next.js automatically scales on Vercel
- Use CDN for static assets
- Implement edge caching

#### Vertical Scaling

**Database:**
- Monitor query performance
- Add indexes for slow queries
- Consider read replicas
- Upgrade instance size if needed

**Storage:**
- Use CDN for image delivery
- Implement lazy loading
- Optimize image sizes

### Security Checklist

**Pre-deployment:**
- [ ] All secrets in environment variables
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection enabled
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies audited (`pnpm audit`)

**Post-deployment:**
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups working
- [ ] Test critical user flows
- [ ] Monitor resource usage

## Key File Interaction Standards

### Configuration Files

#### `package.json` (Root)
- Defines monorepo-level scripts
- Manages shared dev dependencies (Biome, Turbo, TypeScript)
- Specifies package manager (`pnpm@9.0.0`)
- Sets Node.js version requirement (`>=18`)

**When to Update:**
- Adding monorepo-wide tools
- Updating shared dependencies
- Adding new workspace scripts

#### `pnpm-workspace.yaml`
- Defines workspace packages (`apps/*`, `packages/*`)
- Enables workspace protocol for internal dependencies

**When to Update:**
- Adding new app or package directory
- Changing workspace structure

#### `turbo.json`
- Configures task pipeline and dependencies
- Defines caching strategy
- Lists environment variables for cache invalidation

**When to Update:**
- Adding new build tasks
- Changing task dependencies
- Adding environment variables that affect builds

#### `biome.jsonc`
- Configures linting and formatting rules
- Defines file patterns to check
- Sets code style preferences

**When to Update:**
- Changing code style rules
- Adding new file types to check
- Adjusting linting severity

#### `prisma/schema.prisma`
- Defines database schema
- Configures Prisma client generation
- Sets up relations and indexes

**When to Update:**
- Adding/modifying database tables
- Changing relations
- Adding indexes for performance
- **Always run migration after changes**

### Shared Package Updates

#### Updating `packages/types/`

**Impact:** Affects both API and web apps

**Workflow:**
1. Edit types in `packages/types/src/`
2. Build: `pnpm --filter @lounge/types build`
3. Verify API: `pnpm --filter api check-types`
4. Verify web: `pnpm --filter web check-types`
5. Test both apps

**Breaking Changes:**
- Update API DTOs and services
- Update web components
- Consider versioning strategy

#### Updating `packages/ui/`

**Impact:** Affects web app (and potentially other frontends)

**Workflow:**
1. Edit components in `packages/ui/src/`
2. Export from `index.ts`
3. Test in web app
4. Update documentation

**Breaking Changes:**
- Update all usages in web app
- Consider deprecation warnings
- Document migration path

### Cross-App Changes

#### Type Changes
```
packages/types/ → apps/api/ + apps/web/
```
1. Update type definition
2. Build types package
3. Update API (DTOs, services, controllers)
4. Update web (components, pages)
5. Run type checks on both
6. Test end-to-end

#### Database Schema Changes
```
prisma/schema.prisma → packages/types/ → apps/api/ + apps/web/
```
1. Update Prisma schema
2. Create migration
3. Update types package
4. Update API services
5. Update web components
6. Test data flow

#### API Endpoint Changes
```
apps/api/ → apps/web/
```
1. Update API endpoint
2. Update API types
3. Update web API calls
4. Update web components
5. Test integration

### Documentation Updates

**When to Update README.md:**
- Project structure changes
- New major features added
- Setup process changes
- Deployment process changes

**When to Update SETUP.md:**
- Prerequisites change
- Installation steps change
- Environment variables added
- Database setup changes

**When to Update AGENTS.md (this file):**
- Project architecture changes
- New patterns established
- New tools/libraries added
- Workflow changes
- Best practices evolve

## Testing Standards

### Backend Testing (NestJS + Jest)

#### Unit Tests
```typescript
// albums.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsService } from './albums.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AlbumsService', () => {
  let service: AlbumsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumsService,
        {
          provide: PrismaService,
          useValue: {
            album: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AlbumsService>(AlbumsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBySlug', () => {
    it('should return an album when found', async () => {
      const mockAlbum = { id: '1', slug: 'test', name: 'Test Album' };
      jest.spyOn(prisma.album, 'findUnique').mockResolvedValue(mockAlbum);

      const result = await service.findBySlug('test');

      expect(result).toEqual(mockAlbum);
      expect(prisma.album.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test' },
      });
    });

    it('should throw NotFoundException when album not found', async () => {
      jest.spyOn(prisma.album, 'findUnique').mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
```

#### Integration Tests
```typescript
// albums.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AlbumsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/albums (GET)', () => {
    return request(app.getHttpServer())
      .get('/albums')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/albums/:slug (GET)', () => {
    return request(app.getHttpServer())
      .get('/albums/test-album')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('slug', 'test-album');
      });
  });
});
```

#### Test Commands
```bash
# Run all tests
pnpm --filter api test

# Run tests in watch mode
pnpm --filter api test:watch

# Run tests with coverage
pnpm --filter api test:cov

# Run E2E tests
pnpm --filter api test:e2e
```

### Frontend Testing (React Testing Library)

#### Component Tests
```typescript
// PhotoGallery.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoGallery } from './PhotoGallery';

describe('PhotoGallery', () => {
  const mockPhotos = [
    { id: '1', url: '/photo1.jpg', alt: 'Photo 1' },
    { id: '2', url: '/photo2.jpg', alt: 'Photo 2' },
  ];

  it('renders all photos', () => {
    render(<PhotoGallery photos={mockPhotos} />);

    expect(screen.getByAltText('Photo 1')).toBeInTheDocument();
    expect(screen.getByAltText('Photo 2')).toBeInTheDocument();
  });

  it('calls onPhotoClick when photo is clicked', () => {
    const handleClick = jest.fn();
    render(<PhotoGallery photos={mockPhotos} onPhotoClick={handleClick} />);

    fireEvent.click(screen.getByAltText('Photo 1'));

    expect(handleClick).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('displays correct number of columns', () => {
    const { container } = render(<PhotoGallery photos={mockPhotos} columns={4} />);

    expect(container.firstChild).toHaveClass('grid-cols-4');
  });
});
```

#### Hook Tests
```typescript
// useAlbums.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAlbums } from './useAlbums';

describe('useAlbums', () => {
  it('fetches albums on mount', async () => {
    const { result } = renderHook(() => useAlbums());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.albums).toHaveLength(2);
    });
  });

  it('handles errors', async () => {
    // Mock fetch to throw error
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAlbums());

    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
    });
  });
});
```

### Test Best Practices

**What to Test:**
- Business logic and algorithms
- Edge cases and error handling
- User interactions
- API endpoints
- Data transformations
- Validation logic

**What Not to Test:**
- Third-party libraries
- Framework internals
- Trivial getters/setters
- UI styling (use visual regression testing instead)

**Test Structure (AAA Pattern):**
```typescript
it('should do something', () => {
  // Arrange: Set up test data and mocks
  const input = { name: 'Test' };
  const expected = { id: '1', name: 'Test' };

  // Act: Execute the code under test
  const result = processInput(input);

  // Assert: Verify the result
  expect(result).toEqual(expected);
});
```

**Mocking:**
```typescript
// Mock Prisma
const mockPrisma = {
  album: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' }),
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));
```

## AI Decision-making Standards

### When to Use What

#### Backend: NestJS Module Structure
- **Controllers:** HTTP request handling, routing, validation
- **Services:** Business logic, database operations
- **Modules:** Feature organization, dependency injection
- **Guards:** Authentication, authorization
- **Pipes:** Validation, transformation
- **Interceptors:** Logging, caching, response transformation
- **Filters:** Exception handling

#### Frontend: Component Patterns
- **Server Components:** Data fetching, static content, SEO
- **Client Components:** Interactivity, hooks, browser APIs
- **Layouts:** Shared UI across routes
- **Pages:** Route-specific content
- **API Routes:** Server-side logic, webhooks
- **Middleware:** Authentication, redirects

### Decision Trees

#### Where to Add New Functionality?

**New API Endpoint:**
1. Create/update module in `apps/api/src/`
2. Add controller method with decorators
3. Implement service method with business logic
4. Add DTO for validation
5. Update Prisma schema if needed
6. Add tests

**New UI Feature:**
1. Determine if Server or Client Component
2. Create component in `apps/web/components/`
3. Add to appropriate page in `apps/web/app/`
4. Use shared UI components from `packages/ui/`
5. Add types to `packages/types/` if shared

**New Shared Type:**
1. Add to `packages/types/src/`
2. Export from `index.ts`
3. Build package: `pnpm --filter @lounge/types build`
4. Use in API and web apps

**New UI Component:**
1. If reusable across apps → `packages/ui/`
2. If app-specific → `apps/web/components/`
3. If admin-only → `apps/web/components/admin/`
4. If layout-related → `apps/web/components/layout/`

### Cross-cutting Changes

When a change affects multiple parts:

**Type Change:**
1. Update type in `packages/types/`
2. Build types package
3. Update API DTOs and services
4. Update web components
5. Update database schema if needed
6. Run migrations
7. Test both apps

**Database Schema Change:**
1. Update `prisma/schema.prisma`
2. Create migration: `pnpm prisma:migrate`
3. Update types in `packages/types/`
4. Update API services
5. Update web components
6. Test data flow end-to-end

**Authentication Change:**
1. Update API guards/middleware
2. Update web middleware
3. Update protected routes
4. Test auth flows
5. Update environment variables

### Code Organization Principles

**Separation of Concerns:**
- API: Business logic, data access, validation
- Web: Presentation, user interaction, routing
- Types: Shared contracts between API and web
- UI: Reusable components, design system

**DRY (Don't Repeat Yourself):**
- Extract common logic to shared functions
- Create reusable components
- Use shared types
- Centralize configuration

**SOLID Principles:**
- Single Responsibility: One purpose per module/component
- Open/Closed: Extend via composition, not modification
- Liskov Substitution: Subtypes should be substitutable
- Interface Segregation: Small, focused interfaces
- Dependency Inversion: Depend on abstractions

### When to Refactor

**Refactor When:**
- Code is duplicated in 3+ places
- Function/component exceeds 100 lines
- Cognitive complexity is high
- Tests are difficult to write
- Adding features requires changing many files
- Performance issues are identified

**Don't Refactor When:**
- Code works and is clear
- No tests exist (write tests first)
- Under tight deadline (plan for later)
- Unclear requirements

### Project Structure Updates

**IMPORTANT:** When project structure changes significantly:
- New apps added to `apps/`
- New packages added to `packages/`
- Major directory reorganization
- New shared modules or services
- New authentication/authorization patterns

**Then:**
1. Update this `AGENTS.md` file
2. Update root `README.md`
3. Update `SETUP.md` if setup changes
4. Update relevant package READMEs
5. Update architecture diagrams (if any)
6. Communicate changes to team

### AI Agent Guidelines

**When Implementing Features:**
1. Analyze requirements thoroughly
2. Check existing patterns in codebase
3. Use shared components and types
4. Follow established conventions
5. Write tests for new functionality
6. Update documentation
7. Verify changes don't break existing features

**When Fixing Bugs:**
1. Reproduce the issue
2. Identify root cause
3. Write failing test
4. Implement fix
5. Verify test passes
6. Check for similar issues elsewhere
7. Update documentation if needed

**When Refactoring:**
1. Ensure tests exist and pass
2. Make small, incremental changes
3. Run tests after each change
4. Verify functionality unchanged
5. Update documentation
6. Consider performance impact

**When Unsure:**
1. Review similar code in the project
2. Check framework documentation
3. Consider security implications
4. Think about scalability
5. Ask for clarification if needed
6. Document assumptions and decisions

## UI and Styling Standards

### Design System

#### Color Palette
- Define CSS variables in `globals.css`
- Use semantic color names (primary, secondary, accent, muted, destructive)
- Support light and dark modes (if applicable)
- Example:
  ```css
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
  }
  ```

#### Typography
- **Font:** Inter with Latin and Cyrillic subsets
- **Scale:** Use Tailwind's default scale (text-sm, text-base, text-lg, etc.)
- **Weight:** Regular (400), Medium (500), Semibold (600), Bold (700)
- **Line Height:** Use Tailwind defaults for readability
- **Headings:** Consistent hierarchy (h1, h2, h3, etc.)

#### Spacing
- Use Tailwind's spacing scale (4px base unit)
- Consistent padding and margins
- Use gap utilities for flex/grid layouts
- Common values: `p-4`, `m-6`, `gap-2`, `space-y-4`

#### Layout
- **Container:** Use `max-w-7xl mx-auto px-4` for content width
- **Grid:** Use CSS Grid for complex layouts
- **Flexbox:** Use for simpler layouts and alignment
- **Responsive:** Mobile-first breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

### Responsive Design

#### Mobile-First Approach
- Design for mobile screens first (320px+)
- Progressively enhance for larger screens
- Test on multiple device sizes
- Use Chrome DevTools device emulation

#### Breakpoints
```typescript
// Tailwind breakpoints
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops
```

#### Responsive Patterns
```tsx
// Stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Different sizes
<img className="w-full md:w-1/2 lg:w-1/3" />

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">
```

### Component Styling

#### Shadcn UI Components
- Use Shadcn components as base
- Customize via `className` prop
- Modify component files in `components/ui/` for global changes
- Use `cn()` utility for conditional classes:
  ```tsx
  import { cn } from '@/lib/utils';

  <div className={cn(
    'base-classes',
    isActive && 'active-classes',
    className
  )} />
  ```

#### Tailwind Best Practices
- **Utility-First:** Use utility classes directly in JSX
- **Avoid @apply:** Use sparingly, prefer utilities
- **Custom Classes:** Only for truly reusable patterns
- **Arbitrary Values:** Use `[value]` syntax when needed: `w-[347px]`
- **Group Modifiers:** Use `group` for parent-child interactions
- **Peer Modifiers:** Use `peer` for sibling interactions

#### Component Variants
Use `class-variance-authority` (cva) for component variants:
```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### Accessibility (A11y)

#### Semantic HTML
- Use proper HTML elements (`<button>`, `<nav>`, `<main>`, `<article>`)
- Avoid `<div>` for interactive elements
- Use headings in logical order (h1 → h2 → h3)

#### ARIA Attributes
- Radix UI provides ARIA automatically
- Add `aria-label` for icon-only buttons
- Use `aria-describedby` for form hints
- Use `aria-live` for dynamic content

#### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Use `tabIndex` appropriately
- Test with Tab, Enter, Space, Arrow keys
- Provide visible focus indicators

#### Screen Readers
- Use descriptive alt text for images
- Use `sr-only` class for screen-reader-only text
- Test with VoiceOver (macOS) or NVDA (Windows)

#### Color Contrast
- Ensure WCAG AA compliance (4.5:1 for normal text)
- Test with browser DevTools or online tools
- Don't rely on color alone to convey information

### Image Optimization

#### Next.js Image Component
```tsx
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Descriptive alt text"
  width={800}
  height={600}
  priority={false} // true for above-the-fold images
  placeholder="blur" // optional blur placeholder
  quality={85} // 1-100, default 75
/>
```

#### Image Formats
- **WebP:** Primary format (smaller, good quality)
- **JPEG:** Fallback for compatibility
- **PNG:** For images requiring transparency
- **SVG:** For icons and logos

#### Responsive Images
```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

#### Lazy Loading
- Next.js Image lazy loads by default
- Use `priority` prop for above-the-fold images
- Use `loading="eager"` for critical images

### Animation and Transitions

#### Tailwind Transitions
```tsx
// Hover transitions
<button className="transition-colors hover:bg-primary/90">

// Transform transitions
<div className="transition-transform hover:scale-105">

// Multiple properties
<div className="transition-all duration-300 ease-in-out">
```

#### Framer Motion (if needed)
- Use for complex animations
- Keep animations subtle and purposeful
- Respect `prefers-reduced-motion`

### Loading States

#### Skeletons
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

#### Spinners
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
```

#### Suspense Boundaries
```tsx
<Suspense fallback={<LoadingSkeleton />}>
  <AsyncComponent />
</Suspense>
```

### Form Styling

#### Input Fields
- Consistent height and padding
- Clear focus states
- Error states with red border and message
- Disabled states with reduced opacity
- Labels above or beside inputs

#### Validation Feedback
- Show errors below fields
- Use red color for errors
- Use green for success
- Show validation on blur or submit
- Clear, actionable error messages

#### Form Layout
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" {...register('name')} />
    {errors.name && (
      <p className="text-sm text-destructive">{errors.name.message}</p>
    )}
  </div>
</form>
```

## Performance Optimization Standards

### Frontend Performance

#### React Server Components (RSC)
- **Default Choice:** Use Server Components by default
- **Benefits:** Reduced JavaScript bundle, faster initial load, better SEO
- **Data Fetching:** Fetch data directly in Server Components
- **When to Use Client:** Only for interactivity, hooks, browser APIs
- **Pattern:**
  ```tsx
  // Server Component (default)
  async function Page() {
    const data = await fetchData();
    return <ClientComponent data={data} />;
  }

  // Client Component (when needed)
  'use client';
  function ClientComponent({ data }) {
    const [state, setState] = useState(data);
    return <div onClick={() => setState(...)}>...</div>;
  }
  ```

#### Code Splitting

**Dynamic Imports:**
```tsx
import dynamic from 'next/dynamic';

// Lazy load component
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // disable SSR if needed
});

// Lazy load with named export
const Chart = dynamic(() => import('./Chart').then(mod => mod.Chart));
```

**Route-based Splitting:**
- Next.js automatically splits by route
- Each page is a separate bundle
- Shared code is in common chunks

**Component-based Splitting:**
- Split large components
- Split rarely-used features (admin panels, modals)
- Split third-party libraries

#### Bundle Optimization

**Analyze Bundle:**
```bash
# Add to package.json
"analyze": "ANALYZE=true next build"

# Install analyzer
pnpm add -D @next/bundle-analyzer
```

**Tree Shaking:**
- Use named imports: `import { Button } from 'ui'`
- Avoid barrel exports for large libraries
- Use `"sideEffects": false` in package.json

**Minimize Dependencies:**
- Audit bundle size before adding libraries
- Use lighter alternatives when possible
- Remove unused dependencies

#### Image Optimization

**Next.js Image Component:**
- Automatic format optimization (WebP, AVIF)
- Automatic size optimization
- Lazy loading by default
- Responsive images with `sizes` prop

**Best Practices:**
```tsx
// Prioritize above-the-fold images
<Image src="/hero.jpg" priority />

// Responsive images
<Image
  src="/photo.jpg"
  sizes="(max-width: 768px) 100vw, 50vw"
  fill
/>

// Optimize quality
<Image src="/photo.jpg" quality={85} />
```

**Backend Image Processing:**
- Generate thumbnails with Sharp
- Compress images before upload
- Store multiple sizes (original, large, medium, thumbnail)
- Use WebP format for storage

#### Caching Strategies

**Next.js Caching:**
```tsx
// No caching (always fresh)
fetch(url, { cache: 'no-store' });

// Cache with revalidation
fetch(url, { next: { revalidate: 60 } });

// Cache indefinitely
fetch(url, { cache: 'force-cache' });
```

**API Response Caching:**
- Use HTTP cache headers
- Implement Redis for frequently accessed data
- Cache database queries in NestJS

**Static Generation:**
- Use `generateStaticParams` for dynamic routes
- Pre-render pages at build time when possible
- Use ISR (Incremental Static Regeneration) for semi-static content

#### Database Performance

**Prisma Optimization:**
```typescript
// Select only needed fields
prisma.album.findMany({
  select: { id: true, name: true, slug: true },
});

// Use indexes
@@index([categoryId, displayOrder])

// Batch queries
const [categories, albums] = await Promise.all([
  prisma.category.findMany(),
  prisma.album.findMany(),
]);

// Pagination
prisma.photo.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

// Use transactions for consistency
await prisma.$transaction([
  prisma.album.create(...),
  prisma.photo.createMany(...),
]);
```

**Query Optimization:**
- Add indexes for frequently queried fields
- Use `include` instead of multiple queries
- Avoid N+1 queries
- Use database-level sorting and filtering

#### Web Vitals Optimization

**Largest Contentful Paint (LCP):**
- Target: < 2.5s
- Optimize hero images with `priority` prop
- Use Server Components for faster rendering
- Minimize render-blocking resources
- Use CDN for static assets

**First Input Delay (FID) / Interaction to Next Paint (INP):**
- Target: < 100ms (FID), < 200ms (INP)
- Minimize JavaScript execution
- Use Server Components to reduce client JS
- Defer non-critical scripts
- Optimize event handlers

**Cumulative Layout Shift (CLS):**
- Target: < 0.1
- Always specify image dimensions
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use `aspect-ratio` CSS property

**Monitoring:**
```tsx
// Add to app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### API Performance

**Response Time:**
- Target: < 200ms for most endpoints
- Use database indexes
- Implement caching
- Optimize queries
- Use connection pooling

**Payload Size:**
- Return only necessary data
- Use pagination for lists
- Compress responses (gzip/brotli)
- Use DTOs to shape responses

**Concurrent Requests:**
- Use Promise.all for parallel operations
- Implement rate limiting
- Use queue for heavy operations
- Scale horizontally if needed

### Backend Performance

#### NestJS Optimization

**Caching:**
```typescript
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
})
export class AppModule {}

// Use in service
@Injectable()
export class AlbumsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findAll() {
    const cached = await this.cacheManager.get('albums');
    if (cached) return cached;

    const albums = await this.prisma.album.findMany();
    await this.cacheManager.set('albums', albums, 60);
    return albums;
  }
}
```

**Compression:**
```typescript
// In main.ts
import compression from 'compression';
app.use(compression());
```

**Async Operations:**
- Use async/await consistently
- Avoid blocking operations
- Use queues for heavy tasks (Bull, BullMQ)
- Process images asynchronously

#### File Upload Optimization

**Streaming:**
- Stream large files instead of buffering
- Process images in chunks
- Use multipart upload for large files

**Validation:**
- Validate file type and size before processing
- Reject invalid files early
- Set reasonable size limits

**Processing:**
- Generate thumbnails asynchronously
- Use worker threads for CPU-intensive tasks
- Queue multiple uploads

### Monitoring and Profiling

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse CI
- Next.js Analytics
- Vercel Speed Insights
- Sentry for error tracking

**Metrics to Track:**
- Page load time
- Time to Interactive (TTI)
- API response times
- Database query times
- Error rates
- User engagement

**Continuous Monitoring:**
- Set up performance budgets
- Monitor Core Web Vitals
- Track bundle size over time
- Alert on performance regressions

## Error Handling and Validation Standards

### Backend Error Handling (NestJS)

#### Exception Hierarchy
```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

// Use appropriate exception types
throw new NotFoundException(`Album with slug '${slug}' not found`);
throw new BadRequestException('Invalid file format');
throw new UnauthorizedException('Authentication required');
throw new ForbiddenException('Insufficient permissions');
throw new ConflictException('Album with this slug already exists');
```

#### Custom Exceptions
```typescript
// Create custom exception
export class AlbumNotFoundException extends NotFoundException {
  constructor(slug: string) {
    super(`Album with slug '${slug}' not found`);
  }
}

// Use in service
async findBySlug(slug: string) {
  const album = await this.prisma.album.findUnique({ where: { slug } });
  if (!album) throw new AlbumNotFoundException(slug);
  return album;
}
```

#### Exception Filters
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exceptionResponse['message'] || exception.message,
    });
  }
}

// Apply globally in main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

#### Error Response Format
```typescript
// Consistent error response structure
{
  statusCode: 404,
  message: 'Album not found',
  error: 'Not Found',
  timestamp: '2024-01-01T00:00:00.000Z',
  path: '/albums/invalid-slug'
}
```

#### Try-Catch Patterns
```typescript
// Service method with error handling
async uploadPhoto(file: Express.Multer.File, albumId: string) {
  try {
    // Validate album exists
    const album = await this.prisma.album.findUnique({ where: { id: albumId } });
    if (!album) throw new NotFoundException('Album not found');

    // Process image
    const thumbnail = await this.processImage(file);

    // Upload to storage
    const urls = await this.storageService.upload(file, thumbnail);

    // Save to database
    return await this.prisma.photo.create({
      data: { albumId, ...urls },
    });
  } catch (error) {
    // Log error
    this.logger.error(`Failed to upload photo: ${error.message}`, error.stack);

    // Cleanup temporary files
    await this.cleanupTempFiles(file);

    // Re-throw if it's a known exception
    if (error instanceof HttpException) throw error;

    // Wrap unknown errors
    throw new InternalServerErrorException('Failed to upload photo');
  }
}
```

#### Guard Clauses
```typescript
// Use early returns for validation
async updateAlbum(id: string, dto: UpdateAlbumDto) {
  // Guard: Check if album exists
  const album = await this.prisma.album.findUnique({ where: { id } });
  if (!album) throw new NotFoundException('Album not found');

  // Guard: Check if slug is taken (if changing)
  if (dto.slug && dto.slug !== album.slug) {
    const existing = await this.prisma.album.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug already in use');
  }

  // Guard: Validate category exists (if changing)
  if (dto.categoryId && dto.categoryId !== album.categoryId) {
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
  }

  // Proceed with update
  return this.prisma.album.update({ where: { id }, data: dto });
}
```

### Frontend Error Handling (Next.js)

#### Error Boundaries
```tsx
// app/error.tsx - Route-level error boundary
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}

// app/global-error.tsx - Global error boundary
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

#### API Error Handling
```typescript
// Utility for API calls
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage in Server Component
async function Page() {
  try {
    const data = await fetchAPI<Album[]>('/api/albums');
    return <AlbumList albums={data} />;
  } catch (error) {
    return <ErrorMessage message="Failed to load albums" />;
  }
}
```

#### Client-Side Error Handling
```tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function UploadForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('Upload successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      {/* form fields */}
    </form>
  );
}
```

#### Not Found Handling
```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-xl mb-8">Page not found</p>
      <Link href="/" className="btn-primary">
        Go home
      </Link>
    </div>
  );
}

// Trigger in page
import { notFound } from 'next/navigation';

async function Page({ params }: { params: { slug: string } }) {
  const album = await getAlbum(params.slug);
  if (!album) notFound();
  return <AlbumView album={album} />;
}
```

### Validation Standards

#### Backend Validation (NestJS + class-validator)

**DTOs with Validation:**
```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min, Max, IsUrl } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  categoryId: string;

  @IsInt()
  @Min(0)
  displayOrder: number;

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;
}

// Enable validation globally in main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, // Strip non-whitelisted properties
  forbidNonWhitelisted: true, // Throw error on non-whitelisted properties
  transform: true, // Auto-transform payloads to DTO instances
  transformOptions: {
    enableImplicitConversion: true, // Convert types automatically
  },
}));
```

**Custom Validators:**
```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        },
      },
    });
  };
}

// Usage
export class CreateAlbumDto {
  @IsSlug()
  slug: string;
}
```

#### Frontend Validation (Zod + React Hook Form)

**Schema Definition:**
```typescript
import { z } from 'zod';

const albumSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  categoryId: z.string().uuid('Invalid category'),
  displayOrder: z.number().int().min(0),
  coverImageUrl: z.string().url('Invalid URL').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
});

type AlbumFormData = z.infer<typeof albumSchema>;
```

**Form Integration:**
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function AlbumForm() {
  const form = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      name: '',
      description: '',
      displayOrder: 0,
    },
  });

  async function onSubmit(data: AlbumFormData) {
    try {
      await createAlbum(data);
      toast.success('Album created');
    } catch (error) {
      toast.error('Failed to create album');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* other fields */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Album'}
        </Button>
      </form>
    </Form>
  );
}
```

**Custom Validation:**
```typescript
const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

### Security Best Practices

#### Input Sanitization
- Validate all user input on both client and server
- Sanitize HTML content to prevent XSS
- Use parameterized queries (Prisma does this automatically)
- Validate file uploads (type, size, content)

#### Authentication & Authorization
- Use Clerk for authentication
- Verify JWT tokens on API requests
- Implement role-based access control (RBAC)
- Protect admin routes with guards

#### File Upload Security
```typescript
// Validate file type
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new BadRequestException('Invalid file type');
}

// Validate file size (10MB max)
const MAX_SIZE = 10 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  throw new BadRequestException('File too large');
}

// Generate safe filename
import { v4 as uuidv4 } from 'uuid';
const safeFilename = `${uuidv4()}.${file.mimetype.split('/')[1]}`;
```

#### Environment Variables
- Never commit `.env` files
- Validate required env vars at startup
- Use type-safe env validation:
  ```typescript
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string().min(1),
    PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  });

  const env = envSchema.parse(process.env);
  ```

#### Rate Limiting
```typescript
// Install: pnpm add @nestjs/throttler
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
export class AppModule {}

// Apply to routes
@UseGuards(ThrottlerGuard)
@Post('upload')
async upload() { ... }
```

## Documentation Standards

### Code Documentation

#### JSDoc Comments

**Functions:**
```typescript
/**
 * Generates optimized thumbnails for uploaded photos
 *
 * @param file - The original image file from multer
 * @param options - Configuration options for thumbnail generation
 * @param options.width - Target width in pixels (default: 300)
 * @param options.height - Target height in pixels (default: 300)
 * @param options.quality - JPEG quality 1-100 (default: 85)
 * @returns Promise resolving to thumbnail buffer and metadata
 * @throws {BadRequestException} If file format is not supported
 * @throws {InternalServerErrorException} If image processing fails
 *
 * @example
 * const thumbnail = await generateThumbnail(file, { width: 200, height: 200 });
 */
async function generateThumbnail(
  file: Express.Multer.File,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  // Implementation
}
```

**Components:**
```typescript
/**
 * PhotoGallery displays a grid of photos with lightbox functionality
 *
 * @component
 * @param props - Component props
 * @param props.photos - Array of photo objects to display
 * @param props.columns - Number of columns in grid (default: 3)
 * @param props.onPhotoClick - Callback when photo is clicked
 *
 * @example
 * <PhotoGallery
 *   photos={albumPhotos}
 *   columns={4}
 *   onPhotoClick={(photo) => console.log(photo)}
 * />
 */
export function PhotoGallery({ photos, columns = 3, onPhotoClick }: PhotoGalleryProps) {
  // Implementation
}
```

**Types and Interfaces:**
```typescript
/**
 * Represents a photo album in the system
 */
export interface Album {
  /** Unique identifier (UUID) */
  id: string;

  /** Display name of the album */
  name: string;

  /** URL-friendly slug for routing */
  slug: string;

  /** Optional description (supports markdown) */
  description?: string;

  /** Parent category ID */
  categoryId: string;

  /** Sort order within category (lower = first) */
  displayOrder: number;

  /** URL of cover image (optional) */
  coverImageUrl?: string;

  /** Whether album is hidden from public view */
  isHidden: boolean;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}
```

**Complex Logic:**
```typescript
async function reorderPhotos(albumId: string, photoIds: string[]) {
  // Update display order for multiple photos atomically
  // This ensures consistency even if the operation is interrupted
  return await this.prisma.$transaction(
    photoIds.map((photoId, index) =>
      this.prisma.photo.update({
        where: { id: photoId },
        data: { displayOrder: index },
      })
    )
  );
}
```

#### Inline Comments

**When to Use:**
- Explain "why" not "what"
- Document non-obvious decisions
- Explain workarounds or hacks
- Warn about gotchas or edge cases

**Examples:**
```typescript
// HACK: Clerk middleware breaks file uploads, so we bypass it for upload endpoint
if (req.path === '/api/photos/upload') {
  return next();
}

// NOTE: We use slug instead of ID for SEO-friendly URLs
const album = await this.prisma.album.findUnique({ where: { slug } });

// TODO: Implement pagination when album has >100 photos
const photos = await this.prisma.photo.findMany({ where: { albumId } });

// FIXME: This causes memory leak with large files, needs streaming
const buffer = await file.buffer();
```

**Avoid:**
```typescript
// BAD: Obvious comment
// Get album by ID
const album = await this.prisma.album.findUnique({ where: { id } });

// BAD: Redundant comment
// Loop through photos
for (const photo of photos) { ... }

// GOOD: Explains why
// Process photos sequentially to avoid overwhelming B2 API rate limits
for (const photo of photos) { ... }
```

### Project Documentation

#### README Files

**Root README.md:**
- Project overview and purpose
- Tech stack summary
- Quick start guide
- Links to detailed documentation
- Contributing guidelines
- License information

**App-specific READMEs:**
- `apps/api/README.md` - API documentation, endpoints, setup
- `apps/web/README.md` - Frontend documentation, routing, components

**Package READMEs:**
- `packages/types/README.md` - Type definitions and usage
- `packages/ui/README.md` - Component library documentation

#### API Documentation

**Endpoint Documentation:**
```typescript
/**
 * GET /albums/:slug
 *
 * Retrieves a single album by its slug
 *
 * @route GET /albums/:slug
 * @param slug - URL-friendly album identifier
 * @returns Album object with photos
 * @throws 404 if album not found
 *
 * @example
 * GET /albums/summer-2024
 * Response: { id: '...', name: 'Summer 2024', photos: [...] }
 */
@Get(':slug')
async findBySlug(@Param('slug') slug: string) {
  return this.albumsService.findBySlug(slug);
}
```

**Consider Swagger/OpenAPI:**
```typescript
// Install: pnpm add @nestjs/swagger

// In main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Lounge API')
  .setDescription('Photo gallery API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

// In DTOs
export class CreateAlbumDto {
  @ApiProperty({ description: 'Album name', example: 'Summer 2024' })
  @IsString()
  name: string;
}
```

#### Change Documentation

**CHANGELOG.md:**
```markdown
# Changelog

## [Unreleased]

### Added
- Photo reordering with drag-and-drop
- Album cover image selection

### Changed
- Improved thumbnail generation performance
- Updated to Next.js 15

### Fixed
- Fixed image loading on Safari
- Fixed category menu overflow on mobile

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Album and category management
- Photo upload and display
- Admin panel
```

**Migration Guides:**
```markdown
# Migration Guide: v1 to v2

## Breaking Changes

### Database Schema
Run migration: `pnpm prisma:migrate`

### Environment Variables
Add new required variables:
- `B2_BUCKET_NAME`
- `B2_DOWNLOAD_URL`

### API Changes
- `/albums` endpoint now returns paginated results
- `displayOrder` is now required when creating albums
```

### Type Documentation

**Exported Types:**
```typescript
/**
 * API response for album list endpoint
 */
export interface AlbumListResponse {
  /** Array of albums */
  albums: Album[];

  /** Pagination metadata */
  pagination: {
    /** Current page number (1-indexed) */
    page: number;

    /** Number of items per page */
    pageSize: number;

    /** Total number of albums */
    total: number;

    /** Total number of pages */
    totalPages: number;
  };
}
```

### Component Documentation

**Storybook (Optional):**
If using Storybook for component documentation:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'default',
  },
};
```

### Architecture Documentation

**Architecture Decision Records (ADRs):**
Create `docs/adr/` directory for important decisions:

```markdown
# ADR 001: Use Backblaze B2 for Image Storage

## Status
Accepted

## Context
Need cloud storage for user-uploaded photos. Options: AWS S3, Cloudflare R2, Backblaze B2.

## Decision
Use Backblaze B2 for image storage.

## Consequences
- Lower cost than S3 ($5/TB vs $23/TB)
- S3-compatible API
- Good performance for our use case
- Less ecosystem support than AWS
```

### Maintenance Documentation

**Setup Guide (SETUP.md):**
- Prerequisites (Node.js, pnpm, PostgreSQL)
- Installation steps
- Environment variable configuration
- Database setup
- Running the application
- Common issues and solutions

**Deployment Guide:**
- Build process
- Environment configuration
- Database migrations
- Deployment platforms (Vercel, Railway, etc.)
- Monitoring and logging
- Backup procedures

### Code Examples

**Include Examples:**
```typescript
// Good: Include usage example
/**
 * Formats a date for display in the UI
 *
 * @example
 * formatDate(new Date('2024-01-15')) // '15 січня 2024'
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
```

### Documentation Maintenance

**Keep Documentation Updated:**
- Update docs when changing APIs
- Update examples when changing patterns
- Review docs during code review
- Archive outdated documentation
- Version documentation with releases

**Documentation Checklist:**
- [ ] Public APIs have JSDoc comments
- [ ] Complex logic has explanatory comments
- [ ] README files are up to date
- [ ] Breaking changes are documented
- [ ] Examples are tested and working
- [ ] Type definitions are documented
