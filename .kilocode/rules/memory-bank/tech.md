# Technical Context: Next.js Starter Template

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| PostgreSQL   | 14+     | Persistent storage for streams, anonymous stream ratings, and cached Twitch media |
| npm          | 11.6.2  | Package manager                 |

## Development Environment

### Prerequisites

- Node.js 20+ (for compatibility)

### Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:setup
npm run db:import-2026
npm run db:migrate-to-supabase
```

## Project Configuration

### Next.js Config (`next.config.ts`)

- App Router enabled
- `turbopack.root` pinned to the repository root to avoid false workspace detection from lockfiles outside the repo
- Development server uses Webpack (`next dev --webpack`) because Turbopack produced unstable module resolution for `tailwindcss` in this Windows environment

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Target: ESNext

### Tailwind CSS 4 (`postcss.config.mjs`)

- Uses `@tailwindcss/postcss` plugin
- CSS-first configuration (v4 style)

### ESLint (`eslint.config.mjs`)

- Uses `eslint-config-next`
- Flat config format

## Key Dependencies

### Production Dependencies

```json
{
  "next": "^16.1.3", // Framework
  "pg": "^8.x", // PostgreSQL client
  "react": "^19.2.3", // UI library
  "react-dom": "^19.2.3" // React DOM
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.9.3",
  "@types/pg": "^8.x",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@tailwindcss/postcss": "^4.1.17",
  "tailwindcss": "^4.1.17",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0"
}
```

## File Structure

```text
/
├── package.json
├── package-lock.json
├── next.config.ts
├── src/
│   ├── app/                # App Router pages + API routes
│   ├── components/         # Legacy-compatible entry components
│   ├── features/           # Feature UI modules (schedule, ratings, twitch)
│   ├── server/             # Server-side services/repositories
│   ├── shared/             # Shared client utilities
│   └── db/                 # SQL and migrations
└── scripts/
```

## Technical Constraints

### Starting Point

- Minimal structure - expand as needed
- Database already integrated (PostgreSQL) for stream sessions, anonymous ratings, and Twitch media caching
- No authentication by default (add when needed)

### Anonymous Ratings

- Route handlers use Next.js 16 App Router APIs with `NextResponse.cookies.set(...)` to manage a long-lived `HttpOnly` viewer token cookie
- The raw cookie token is never stored in the database; `src/server/streams/rating-cookie.ts` hashes it with SHA-256 before repository writes
- Rating policy is intentionally `single-vote-no-update`: one browser/device can rate one stream once, but clearing cookies or switching browsers/devices creates a new anonymous voter identity

### Browser Support

- Modern browsers (ES2020+)
- No IE11 support

## Performance Considerations

### Image Optimization

- Use Next.js `Image` component for optimization
- Place images in `public/` directory

### Bundle Size

- Tree-shaking enabled by default
- Tailwind CSS purges unused styles

### Core Web Vitals

- Server Components reduce client JavaScript
- Streaming and Suspense for better UX

## Deployment

### Build Output

- Server-rendered pages by default
- Can be configured for static export

### Environment Variables

- None required for base template
- Add as needed for features
- Use `.env.local` for local development
- For PostgreSQL: `DATABASE_URL` (or `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`)
- For Supabase Postgres target: `SUPABASE_DB_URL` (or `SUPABASE_DATABASE_URL`)
