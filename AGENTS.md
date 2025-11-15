# Development Guidelines

## Project Overview

This project is a monorepo managed with pnpm and TurboRepo. It consists of applications (`apps/`) and shared packages (`packages/`). The main goal is to develop a lounge photo gallery application with a separate NestJS API backend and Next.js web frontend.

### Tech Stack

- **Monorepo Management:** pnpm workspaces + TurboRepo
- **Backend:** NestJS, Prisma ORM, PostgreSQL
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Authentication:** Clerk (with Ukrainian localization)
- **UI Framework:** Shadcn UI, Radix UI, Tailwind CSS v4
- **Storage:** Backblaze B2
- **Image Processing:** Sharp
- **Form Management:** React Hook Form + Zod validation
- **Code Quality:** Biome (linting + formatting)

## Project Architecture

### Applications (`apps/`)

#### `apps/api/` - NestJS Backend
- **Framework:** NestJS with Express
- **Database:** Prisma ORM + PostgreSQL (Supabase)
- **Authentication:** Clerk Express middleware
- **File Upload:** Multer + Sharp for image processing
- **Storage:** Backblaze B2 integration
- **Key Modules:** `albums`, `auth`, `categories`, `photos`, `prisma`, `stats`, `storage`
- **Schema:** [`prisma/schema.prisma`](apps/api/prisma/schema.prisma:1)

#### `apps/web/` - Next.js Frontend
- **Framework:** Next.js 16 with App Router (Turbopack enabled)
- **React Version:** 19
- **Authentication:** Clerk Next.js SDK
- **UI Components:** Shadcn UI + Radix UI primitives
- **Styling:** Tailwind CSS v4
- **Structure:**
  - `app/` - Next.js App Router pages (`[categorySlug]`, `admin`, `api`, `sign-in`, `sign-up`)
  - `components/` - React components (`admin`, `layout`, `ui`)
  - `lib/` - Utility functions
  - `proxy.ts` - Clerk authentication middleware

### Shared Packages (`packages/`)

#### `packages/types/`
- Shared TypeScript type definitions (API responses, domain models). Exported to both `api` and `web`.

#### `packages/ui/`
- Reusable React components, including customized Shadcn UI components.

#### `packages/typescript-config/`
- Shared TypeScript configurations (`base.json`, `nextjs.json`, `react-library.json`).

### Root Configuration

- `package.json`: Monorepo scripts and dependencies.
- `pnpm-workspace.yaml`: Workspace package definitions.
- `turbo.json`: TurboRepo task pipeline and caching.
- `biome.jsonc`: Biome linting and formatting rules.
- `.env`, `.env.local`, `.env.example`: Environment variables.

### Next.js Compiler Setting

- `reactCompiler: true` is intentional and should not be removed from `apps/web/next.config.mjs`. Agents are prohibited from changing or removing this flag when editing the configuration.

## Code Standards

### General Principles
- **Language:** TypeScript with strict type checking.
- **Style:** Concise, functional, and declarative. Follow Biome rules.
- **Exports:** Favor named exports over default exports.
- **Enums:** Use `as const` objects instead of native `enum`.
- **Type Safety:** Avoid `any`; use `unknown`. Use `import type` for type-only imports.
- **Comments:** Use English. Explain the "why," not the "what." Use JSDoc for public APIs.

### React 19 usage rules

- **Prefer `use()`** for declarative reading of async resources and context inside render. Do not create promises in render — pass cached or externally created promises. Always wrap suspended trees in `<Suspense>` with a clear fallback.
- **Use Actions for mutations and forms.** Use `useActionState`, `useOptimistic`, and the new `<form action={fn}>` patterns for pending state, errors and optimistic updates instead of manual `useState` loading flows. 
- **Optimistic updates:** prefer `useOptimistic` for instant UI feedback and automatic reversion on error.
- **Form helpers:** use `useFormStatus` (from `react-dom`) in shared UI components to read parent `<form>` pending state without prop drilling.  
- **Refs & Context:** you can pass `ref` as a normal prop to functional components in most cases (no `forwardRef` boilerplate). Use the simplified context read with `use(context)` for conditional reads — it works where `useContext` fails.  
- **Metadata & resource hints:** components may render `<title>`, `<meta>`, `<link>` directly — React handles hoisting/deduplication. For resource preinitialization use `react-dom` static APIs: `preload`, `preinit`, `preconnect`, `prefetchDNS`.
- **View Transitions:** Animate elements that update inside a Transition or navigation.
- **useEffectEvent:** Extract non-reactive logic from Effects into reusable Effect Event functions.
- **Activity:** Render "background activity" by hiding UI with `display: none` while maintaining state and cleaning up Effects. This allows pre-rendering and keeping state for hidden parts of the app without impacting performance.

#### Example 1: Streaming data with use() hook (React 19 + Next.js)

```tsx
// Server Component (app/page.tsx)
import { Suspense } from 'react';
import UserProfile from '@/components/UserProfile';

export default async function Page() {
  // Don't await the data fetching function - pass Promise as prop
  const userPromise = getUser();
  
  return (
    <Suspense fallback={<p>Loading user profile...</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

```tsx
// Client Component (@/components/UserProfile.tsx)
'use client';
import { use } from 'react';

export default function UserProfile({
  userPromise
}: {
  userPromise: Promise<{ id: string; name: string }>;
}) {
  // Use the use() hook to read the promise
  const user = use(userPromise);
  
  return <div>{user.name}</div>;
}
```

**Key Points:**
- Promise is created in Server Component and passed as prop
- Client Component uses `use(promise)` to read data
- `<Suspense>` enables streaming for better UX


#### Example 2

```tsx
import { useActionState, useOptimistic } from 'react';

function UpdateProfile({ currentName, onUpdate }) {
  const [optimisticName, setOptimisticName] = useOptimistic(currentName);

  const [error, submitAction, isPending] = useActionState(
    async (prev, formData) => {
      const newName = formData.get('name');
      const res = await updateName(newName);
      if (res.error) return res.error;
      return null;
    },
    null
  );

  return (
    <form action={submitAction}>
      <p>Your name: {optimisticName}</p>
      <input
        name="name"
        defaultValue={optimisticName}
        onChange={(e) => setOptimisticName(e.target.value)}
      />
      <button type="submit" disabled={isPending}>Save</button>
      {error && <p className="text-destructive">{error}</p>}
    </form>
  );
}
```

#### Example 3: View Transitions

```tsx
import { ViewTransition, useState, startTransition } from 'react';

function Item() {
  return (
    <ViewTransition>
      <div>Some item</div>
    </ViewTransition>
  );
}

export default function Component() {
  const [showItem, setShowItem] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          startTransition(() => {
            setShowItem((prev) => !prev);
          });
        }}
      >{showItem ? 'Hide' : 'Show'}</button>

      <Activity mode={showItem ? 'visible' : 'hidden'}>
        <Item />
      </Activity>
    </>
  );
}
```

#### Example 4: useEffectEvent

```tsx
import { useEffect, useContext, useEffectEvent } from 'react';

function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  const onNavigate = useEffectEvent((visitedUrl) => {
    logVisit(visitedUrl, numberOfItems);
  });

  useEffect(() => {
    onNavigate(url);
  }, [url]);
  
  // ...
}
```

#### Example 5: Activity

```tsx
import { Activity, useState } from 'react';
import Sidebar from './Sidebar.js';

export default function App() {
  const [isShowingSidebar, setIsShowingSidebar] = useState(true);

  return (
    <>
      <Activity mode={isShowingSidebar ? 'visible' : 'hidden'}>
        <Sidebar />
      </Activity>

      <main>
        <button onClick={() => setIsShowingSidebar(!isShowingSidebar)}>
          Toggle sidebar
        </button>
        <h1>Main content</h1>
      </main>
    </>
  );
}
```



## Functionality Implementation Standards

### Backend (`apps/api/`)
- **Architecture:** Follow NestJS modular structure: `controller` → `service` → `repository/Prisma`.
- **Controllers:** Keep them thin. Use DTOs with `class-validator` for request validation. Apply `AuthGuard` for protected routes.
- **Services:** Contain all business logic. Handle errors with NestJS exceptions (e.g., `NotFoundException`).
- **Database:** Define schema in `prisma/schema.prisma`. Use UUIDs for primary keys. Use Prisma Client for all database operations.

### Frontend (`apps/web/`)
- **App Router:** Use Server Components by default. Use `'use client'` only for interactivity, hooks, and browser APIs.
- **Data Fetching:**
  - **Server Components:** Fetch data directly using `async/await`. Use `fetch` options for caching (`cache: 'no-store'` or `next: { revalidate: 60 }`).
  - **Client Components with use() hook:** 
    - **Recommended Pattern:** Pass Promise as prop from Server Component to Client Component, then use `use(promise)` in Client Component.
    - **Suspense Required:** Always wrap components using `use()` in `<Suspense>` with meaningful fallback.
    - **Streaming:** This approach enables streaming UI for better perceived performance.
- **Authentication:** Use Clerk SDK (`auth()` in Server Components, `useAuth()` in Client Components). Configure middleware in `proxy.ts`.
- **Forms:** Use React Hook Form with Zod for schema validation via `@hookform/resolvers/zod`.

## Key Libraries and Workflow

### Dependency Management
- **Package Manager:** Use `pnpm` exclusively.
- **Adding Dependencies:**
  - App-specific: `pnpm add <package> --filter <app_name>`
  - Workspace: `pnpm add <package> -w` (for dev tools like Biome)

### Git Workflow
- **Branching:** `main`, `develop`, `feature/*`, `fix/*`.
- **Commits:** Follow Conventional Commits format (e.g., `feat(api): add new endpoint`).

### Core Commands
- `pnpm install`: Install dependencies.
- `pnpm dev`: Start all apps in development mode.
- `pnpm build`: Build all apps for production.
- `pnpm lint`: Check for linting issues.
- `pnpm lint:fix`: Automatically fix linting issues.
- `pnpm format`: Format all code.
- `pnpm check-types`: Type-check the entire project.

### Database (Prisma)
- `pnpm prisma:migrate`: Create a new migration (run from `apps/api`).
- `pnpm prisma:generate`: Generate Prisma Client after schema changes.
- `pnpm prisma studio`: Open Prisma Studio GUI.

## AI Decision-making Standards

### Where to Add New Functionality?

- **New API Endpoint:**
  1. Create/update a module in `apps/api/`.
  2. Add a controller method, service logic, and a DTO for validation.
  3. Update `prisma/schema.prisma` if the database model changes.
  4. Write tests.

- **New UI Feature:**
  1. Decide between a Server or Client Component.
  2. Create the component in `apps/web/components/`.
  3. If the type is shared, add it to `packages/types/`.
  4. If the component is reusable, add it to `packages/ui/`.
  5. Add the component to the relevant page in `apps/web/app/`.

### Cross-cutting Changes

- **Type Change (`packages/types/`):**
  1. Update the type.
  2. Rebuild the package: `pnpm --filter @lounge/types build`.
  3. Update all usages in `apps/api` and `apps/web`.
  4. Run `pnpm check-types` to verify.

- **Database Schema Change (`prisma/schema.prisma`):**
  1. Update the schema.
  2. Create a migration: `pnpm --filter api prisma:migrate`.
  3. Update corresponding types in `packages/types/`.
  4. Update API services and web components that use the model.
### Task Decomposition and Reasoning Guidelines

To ensure reliability, scalability, and clarity of AI-generated work, all complex tasks must be **explicitly decomposed into smaller, actionable subtasks** before execution or code generation.

#### Rules

- **Always break down** high-level goals into smaller subtasks (3–7 ideally).
- Each subtask must represent a **single logical unit** (e.g., “create type definition”, “implement API call”, “write React component”, “add test”).
- **Solve subtasks sequentially**, verifying correctness at each step before proceeding.
- Prefer explicit reasoning (“Step 1 → Step 2 → Step 3”) rather than performing the entire task in one monolithic block.
- **Document the decomposition** inline when generating code or explanations.
- For unclear requirements, **rephrase the main goal** as a checklist of subtasks before coding.

#### Example

**Instead of:**
> Implement album upload with image processing.

**Do this:**
1. Define `UploadAlbumDto` type.
2. Add API endpoint `/albums/upload`.
3. Integrate Sharp image processing.
4. Save files to Backblaze B2.
5. Return structured response with album data.

#### AI Directive

> Before writing any code or executing a plan, the agent must explicitly list the subtasks and follow them step by step.  
> Each subtask should be small enough to test or reason about independently.

### When to Update This File (`AGENTS.md`)
Update this file when:
- Project architecture changes.
- New core libraries or tools are added.
- Key development patterns or workflows are established or changed.