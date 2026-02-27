# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ SASAVOT streamer business card website implemented

The template is now a fully functional personal business card website for the streamer SASAVOT, built with Next.js 16, TypeScript, and Tailwind CSS 4. All sections are implemented with a dark theme (gray-950 base) and purple/violet streamer accent colors.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Business card website template with 6 sections + Navbar + Footer
- [x] Twitch API integration: `/api/twitch` route fetches live status, VODs, followers
- [x] TwitchVods component: replaces Portfolio with real Twitch VODs grid
- [x] Hero: dynamic LIVE/OFFLINE badge from Twitch API
- [x] Contact: removed form, kept contact cards (Telegram, Email, Twitch, YouTube)
- [x] Navbar: "Клипы" → "Записи" (links to #vods)
- [x] next.config.ts: added `static-cdn.jtvnw.net` to image remotePatterns
- [x] Added rule: respond in Russian by default
- [x] Added MCP remote server: Context7 (configured in repo settings)
- [x] Removed "Контент" section from homepage and navbar navigation
- [x] Redesigned stream schedule in `About`: horizontal timeline with future scroll
- [x] Added schedule behavior: today auto-positioned at end of visible list
- [x] Added persistence of real stream start time (e.g. 18:18) via localStorage
- [x] Updated Twitch schedule API usage to request from UTC midnight (`start_time`) per docs
- [x] Timeline adjusted to past-only mode: today is always last card, no future days
- [x] Added PostgreSQL persistence for stream sessions (`started_at`, `duration_hours`)
- [x] Added setup script `npm run db:setup` for DB/table initialization
- [x] Added API route `/api/streams` (GET list, POST create)
- [x] About timeline switched from localStorage to PostgreSQL-backed persistence
- [x] Added automatic sync: live stream duration updates + VOD duration backfill into DB
- [x] Timeline cards now show `start - end`, total duration, stream title, and open stream URL on click
- [x] Schedule card switched to current-day mode only (no historical ribbon)
- [x] Added Twitch import script for all archived streams since 2026-01-01
- [x] Stream schedule moved to standalone section (`#schedule`) and restored 28-day timeline
- [x] Schedule list auto-scrolls so current day is always visible at the end
- [x] Schedule redesigned to weekly groups (scrollable week blocks for scaling)
- [x] Weekly schedule switched to single-week calendar view with Prev/Next navigation
- [x] Reworked weekly schedule into timeline calendar layout (time axis + day rows)
- [x] Fixed week calendar edge cases: 7-day week always visible, future days empty, half-hour axis, auto-refresh when stream starts
- [x] Switched project DB config to Neon (Vercel integration env vars)
- [x] Updated DB helpers/scripts to prefer `DATABASE_URL`/`POSTGRES_URL` with Neon SSL-ready connection strings

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page — assembles all sections | ✅ Ready |
| `src/app/layout.tsx` | Root layout with SEO metadata | ✅ Ready |
| `src/app/globals.css` | Global styles (Tailwind import) | ✅ Ready |
| `src/components/Navbar.tsx` | Fixed navbar with mobile menu | ✅ Ready |
| `src/components/Hero.tsx` | Hero section with avatar, CTA, social links | ✅ Ready |
| `src/components/About.tsx` | About section with stats and resume download | ✅ Ready |
| `src/components/Skills.tsx` | Legacy content block (not rendered on homepage) | 💤 Unused |
| `src/components/Portfolio.tsx` | Portfolio grid with 6 project cards | ✅ Ready |
| `src/components/Contact.tsx` | Contact form with info cards | ✅ Ready |
| `src/components/Footer.tsx` | Footer with copyright and social links | ✅ Ready |
| `src/app/api/streams/route.ts` | Stream sessions API (read/write PostgreSQL) | ✅ Ready |
| `src/lib/db.ts` | PostgreSQL connection pool helper | ✅ Ready |
| `scripts/setup-db.mjs` | Initializes `streams` table (skips CREATE DATABASE on managed DB URLs) | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Website Sections

1. **Navbar** — Fixed top bar with logo, nav links, mobile hamburger menu
2. **Hero** — Full-screen section with avatar, name, title, CTA buttons, social icons, scroll indicator
3. **About** — Two-column layout with photo placeholder, bio text, stats grid, resume download
4. **Twitch VODs** — Latest archived broadcasts with live/offline states
5. **Contact** — Contact info cards
6. **Footer** — Simple footer with copyright and social links

## Design System

- **Color scheme**: Dark (gray-950 / gray-900 backgrounds), Indigo/Purple accents
- **Typography**: Geist Sans (headings), Geist Mono (code)
- **Smooth scroll**: Enabled via `scroll-smooth` on `<html>`
- **Responsive**: Mobile-first, breakpoints at `sm:`, `md:`, `lg:`

## Customization Points

To personalize the template, update:
- Name: `Alex Johnson` → your name (in `Hero.tsx`, `Footer.tsx`, `layout.tsx`)
- Title: `Full-Stack Developer & UI/UX Designer` → your title (`Hero.tsx`)
- Avatar: Replace the letter placeholder with `<Image>` in `Hero.tsx` and `About.tsx`
- Stats: Update numbers in `About.tsx`
- Skills: Update skill names and percentages in `Skills.tsx`
- Projects: Replace project data array in `Portfolio.tsx`
- Contact info: Update email, location, phone in `Contact.tsx`
- Social links: Update `href` values in `Hero.tsx`, `Footer.tsx`

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-26 | Business card website template implemented with 7 components |
| 2026-02-27 | Set default response language to Russian; added Context7 MCP server config |
| 2026-02-27 | Removed "Контент" section; rebuilt schedule timeline with future horizontal scroll and persisted factual start time |
| 2026-02-27 | Schedule timeline switched to history mode: scroll only to past broadcasts, today fixed as last |
| 2026-02-27 | Added PostgreSQL DB setup and `/api/streams` for storing stream start time and duration |
| 2026-02-27 | Replaced browser localStorage persistence with PostgreSQL sync from live stream + VOD data |
| 2026-02-27 | Current-day schedule card + imported Twitch archives from start of 2026 into PostgreSQL |
| 2026-02-27 | Switched environment and DB scripts to Neon on Vercel (`DATABASE_URL`/`POSTGRES_URL`, pooled + non-pooled) |
