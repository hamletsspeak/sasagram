# System Patterns: SASAGRAM

## Architecture Overview

```text
src/
├── app/                    # Next.js App Router pages and route handlers
│   └── api/                # Thin HTTP adapters
├── components/             # Backward-compatible entry components and page sections
├── features/
│   ├── schedule/           # Schedule UI, date utils, client sync/fetch logic
│   ├── ratings/            # Dedicated stream rating page UI and client API helpers
│   └── twitch/             # VOD/clip UI, formatting, client fetch logic
├── server/
│   ├── db/                 # DB pool/config helpers
│   ├── streams/            # Stream repository + validation/service layer + anonymous rating services
│   ├── twitch/             # Twitch auth, media cache repository, orchestration
│   ├── kick/               # Kick auth/fetch helpers
│   └── watch-also/         # Twitch/Kick aggregation service
├── shared/
│   └── lib/                # Shared client utilities safe for browser bundle
└── db/                     # SQL init/migrations
```

## Key Design Patterns

### 1. App Router Pattern

Uses Next.js App Router with file-based routing:
```
src/app/
├── page.tsx           # Route: /
├── about/page.tsx     # Route: /about
├── blog/
│   ├── page.tsx       # Route: /blog
│   └── [slug]/page.tsx # Route: /blog/:slug
└── api/
    └── route.ts       # API Route: /api
```

### 2. Feature-First UI Pattern

- Large interactive sections are split into `features/<feature>/components`, `features/<feature>/lib`, and `features/<feature>/types`.
- `src/components/*` may stay as compatibility wrappers while imports are migrated safely.
- Shared browser utilities live under `src/shared/lib`.

### 3. Thin Route Handler Pattern

- `src/app/api/**/route.ts` keeps request/response shaping and cache headers only.
- Business logic, validation, and orchestration move to `src/server/**`.
- DB access is isolated in repository modules where possible.
- Anonymous stream voting is handled in dedicated route handlers (`/api/streams/ratings`, `/api/streams/[id]/rating`) that delegate cookie hashing and one-vote enforcement to `src/server/streams/*`.

### 4. Server Components by Default

All components are Server Components unless marked with `"use client"`:
```tsx
// Server Component (default) - can fetch data, access DB
export default function Page() {
  return <div>Server rendered</div>;
}

// Client Component - for interactivity
"use client";
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 5. Layout Pattern

Layouts wrap pages and can be nested:
```tsx
// src/app/layout.tsx - Root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// src/app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

## Styling Conventions

### Tailwind CSS Usage
- Utility classes directly on elements
- Component composition for repeated patterns
- Responsive: `sm:`, `md:`, `lg:`, `xl:`

### Common Patterns
```tsx
// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flexbox centering
<div className="flex items-center justify-center">
```

## File Naming Conventions

- Components: PascalCase (`Button.tsx`, `Header.tsx`)
- Utilities: camelCase (`utils.ts`, `helpers.ts`)
- Pages/Routes: lowercase (`page.tsx`, `layout.tsx`)
- Directories: kebab-case (`api-routes/`) or lowercase (`components/`)

## State Management

For simple needs:
- `useState` for local component state
- `useContext` for shared state
- Server Components for data fetching

For complex needs (add when necessary):
- Zustand for client state
- React Query for server state
