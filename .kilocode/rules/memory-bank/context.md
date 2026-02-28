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
- [x] Updated schedule controls: animated arrow nav buttons + date picker jump-to-week + date column format `DD.MM`
- [x] Reworked week picker into custom month calendar (hover highlight by week + selected week row) and updated arrow button visual style
- [x] Timeline precision improved: minute-level helper grid lines appear on row hover without extra labels
- [x] Time axis refined with ruler-like ticks: short minute marks and longer hour marks on hover
- [x] Reverted ruler ticks in time header; simplified to hover highlight for time cells
- [x] Added hover highlight on schedule rows for better focus while scanning timeline
- [x] Updated week nav arrow buttons animation: button lifts on hover and presses on click, icon itself stays static
- [x] Fixed Twitch iframe embed for custom domains by building dynamic `parent` params from current hostname + fallback domains
- [x] Navbar logo switched to animated head MP4 (`sasych_head.mp4`) with blend-mode background suppression
- [x] Navbar logo video now prefers transparent `webm` source with MP4 fallback
- [x] Added canvas chroma-key processing for navbar logo video to remove green background in-browser
- [x] Navbar logo enlarged and animation changed to ping-pong playback (forward then reverse)
- [x] Reverted ping-pong behavior for navbar logo; restored normal loop playback (kept larger size)
- [x] Switched navbar logo asset to `sasavot_logo.webm` and removed canvas chroma-key pipeline
- [x] Navbar logo updated to `sasavot_logo_v2.webm` with fallback to previous logo file
- [x] Added 5-second delay before navbar logo animation restarts after each playback end
- [x] Logo playback changed to click-triggered mode only (no autoplay/loop)
- [x] Live Twitch player moved to Hero (replaces avatar while live); removed live player block from VODs section
- [x] Added floating picture-in-picture style live player that stays visible while scrolling below Hero
- [x] Reworked live PiP behavior to reuse the same Hero player (no duplicate iframe), with smooth transition to edge on scroll
- [x] Added PiP controls in floating mode: resize (+/-) and close button for the live player
- [x] Upgraded PiP controls: free drag-and-drop positioning + edge resize by pointer drag + close action
- [x] PiP UX refined: removed Move button, close now fully unmounts stream while floating, added all-side/corner resize handles, preserved custom PiP size across scroll cycles
- [x] Enhanced live state in schedule timeline with animated glow/sweep inside active stream block
- [x] Redesigned live schedule animation to smooth seamless flow (no visible hard reset)
- [x] Tuned live schedule animation speed/performance for smoother continuous motion
- [x] Reverted live animation tuning to previous seamless baseline after speed/seam regressions
- [x] Simplified live block motion to smooth shimmer (perelivanie) effect
- [x] Navbar restyled as floating island; logo moved outside navbar and enlarged
- [x] Navbar top offset tightened upward to add more gap from Hero live player
- [x] "Смотреть" button moved outside navbar; nav island now hugs only nav controls
- [x] Contacts section redesigned to circular items with avatar badges; links updated (YouTube clips, TG, Discord, @uran_mod)
- [x] Removed "Открыт для коллабораций" block in contacts and added TG link `PRAVILATIKTOKPREDLOSHKA`
- [x] Removed TG contact `PRAVILATIKTOKPREDLOSHKA` from contacts section
- [x] Contacts renamed to "Полезные ссылки" and new "Смотреть также" subsection added with Twitch/Kick channels
- [x] "Смотреть также" updated to show channel avatars (Twitch avatars + Kick fallback avatar)
- [x] Updated Roma's Twitch link in "Смотреть также" to `twitch.tv/r4dom1r`
- [x] Replaced proxy Twitch avatar links with direct `static-cdn.jtvnw.net` avatar URLs for stable rendering
- [x] Added dynamic Twitch avatar API (`/api/twitch/avatar/[login]`) and switched "Смотреть также" Twitch avatars to dynamic sources
- [x] Added dynamic Kick avatar API (`/api/kick/avatar/[slug]`) based on Kick public API endpoints with graceful fallback
- [x] Added live-status aggregator API (`/api/watch-also`) and creator tiles now show nicknames + LIVE/OFF states
- [x] Kick API auth upgraded: client credentials (`KICK_CLIENT_ID` + `KICK_CLIENT_SECRET`) now used for dynamic avatar/live fetches
- [x] Fixed Kick data mapping to use documented query endpoints (`channels?slug`, `users?id`) so live state and avatar resolve correctly
- [x] Next Image config updated to allow Kick CDN hosts (`files.kick.com`, `images.kick.com`)
- [x] Added real names beside creator nicknames in "Смотреть также" tiles
- [x] Contact avatars switched to platform/source avatars (YouTube, Telegram, Discord invite icon) and suggestion card now uses `alert_orig` logo video
- [x] Suggestion avatar video playback changed to hover-triggered mode only
- [x] Discord contact avatar switched to local logo asset `ds_logo.jpg`
- [x] Hero live layout adjusted: removed extra side text, centered enlarged player as primary above-the-fold element during live
- [x] Hero background height fixed to full viewport in live mode (`min-h-screen`)
- [x] All main homepage sections updated to viewport-height layout (`min-h-screen`)
- [x] Twitch chat embed integrated next to live player (desktop side-by-side, mobile stacked)
- [x] Added Twitch-like chat collapse toggle on live player block (show/hide chat)
- [x] Fixed schedule live mapping to use stream start date row (including cross-midnight live sessions)
- [x] Schedule time grid switched to hourly columns for cleaner vertical alignment
- [x] Schedule timeline header aligned to same hourly divisions as body grid (single shared column split)
- [x] Schedule timeline range made dynamic: auto-extends right boundary when streams run later into night
- [x] VOD cards enlarged by widening section container and shifting to 2-column layout until very wide screens
- [x] VOD section redesigned into viewport-height horizontal rows with arrow scrolling; added second row for Twitch featured clips
- [x] Full visual redesign of VOD/Clips shelves with cinematic overlay titles directly on thumbnails and upgraded glass-gradient styling
- [x] Tuned VOD/Clips shelf density: smaller banners, hidden scrollbars, and added compact "Все видео" Twitch button
- [x] Increased VOD fetch size and moved row arrows to Twitch-style side overlays; "Все видео" moved to row action area
- [x] Added tactile press animation to VOD controls (arrow buttons + "Все видео" button)
- [x] Reworked VOD/Clips into vertically aligned paged shelves with fixed visible card count and explicit prev/next pagination buttons
- [x] Hero content refreshed and live-player presentation enhanced (larger in-hero size during live)
- [x] Added PostgreSQL media cache for Twitch VODs/clips (`twitch_vods`, `twitch_clips`, `app_cache_state`) and switched `/api/twitch` to DB-first media reads with TTL-based sync
- [x] Added Supabase migration support: DB URL fallbacks for Supabase and script `db:migrate-to-supabase` for full table copy
- [x] Migrated core PostgreSQL data to Supabase via MCP (`streams`, `twitch_vods`, `twitch_clips`, `app_cache_state`)
- [x] Added project-level OpenCode MCP config for Supabase remote server (`opencode.json`)
- [x] Cleaned local env keys: removed legacy Neon/Vercel-only variables and kept active Supabase + API credentials only
- [x] Hardened DB connection parsing: auto-enforces `sslmode=require` for Supabase/Neon URLs when missing
- [x] Fixed false-positive Kick live status in `/api/watch-also` by removing object-truthy live detection and relying on nested `is_live`/status values

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
| `src/app/api/twitch/route.ts` | Twitch API with DB-cached VOD/clip sync | ✅ Ready |
| `src/lib/db.ts` | PostgreSQL connection pool helper | ✅ Ready |
| `scripts/setup-db.mjs` | Initializes DB tables (`streams`, `twitch_vods`, `twitch_clips`, `app_cache_state`) | ✅ Ready |
| `scripts/migrate-to-supabase.mjs` | Migrates streams/media/cache data to Supabase Postgres | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Website Sections

1. **Navbar** — Floating island nav with separate enlarged logo and mobile hamburger menu
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
| 2026-02-27 | Schedule nav updated with arrow buttons hover animation, week date picker, and date display as `23.02` |
| 2026-02-27 | Custom week calendar styled like compact datepicker: row hover/select for weeks, refreshed arrows, removed native date clear affordance |
| 2026-02-27 | Added minute-scale vertical helper lines in schedule rows that fade in on hover (labels unchanged) |
| 2026-02-27 | Time header now shows watch-like ticks on hover: short minute marks plus longer hour marks |
| 2026-02-27 | Removed watch-like ticks from time header and kept only clean hover highlight on hour cells |
| 2026-02-27 | Added hover background highlight for each schedule day row |
| 2026-02-27 | Week navigation arrows now animate as button lift/press only (no icon side movement) |
| 2026-02-27 | Twitch live embed now appends runtime hostname to `parent` list to avoid browser/Twitch frame blocking on non-vercel domains |
| 2026-02-27 | Replaced top-left text logo with animated head MP4 logo and blend-mode based background cleanup |
| 2026-02-27 | Updated navbar logo video sources to use `sasych_head.webm` first (alpha-capable) with MP4 fallback |
| 2026-02-27 | Implemented runtime chroma key on navbar logo video via hidden video + canvas to cut green screen |
| 2026-02-27 | Increased navbar logo size and implemented forward/reverse loop behavior for logo animation |
| 2026-02-27 | Removed ping-pong logo playback and switched back to standard looping animation |
| 2026-02-27 | Replaced logo source with `sasavot_logo.webm` and simplified navbar logo rendering to direct video |
| 2026-02-27 | Switched navbar logo source to `sasavot_logo_v2.webm` and kept old logo as fallback source |
| 2026-02-27 | Navbar logo video now waits 5 seconds after ending before replaying |
| 2026-02-27 | Navbar logo now starts animation only when user clicks on the head/logo |
| 2026-02-27 | Hero now shows embedded live stream instead of avatar during live; VODs section no longer embeds live player |
| 2026-02-27 | While live, a fixed mini-player appears on scroll (PiP style) and stays visible across page sections |
| 2026-02-27 | Live player now transitions from Hero position into PiP mode as the same element instead of spawning a second player |
| 2026-02-27 | Floating PiP player now supports manual resize and close actions from inline controls |
| 2026-02-27 | Floating PiP player can now be dragged anywhere and resized by dragging its right edge |
| 2026-02-27 | PiP player now resizes from any side/corner, shows only close button, unmounts stream when closed, and keeps user-defined size when returning to PiP |
| 2026-02-27 | Added animated visual activity for live schedule blocks (pulse glow + moving light sweep) to make "В эфире" state more dynamic |
| 2026-02-27 | Replaced harsh sweep loop with seamless striped flow + soft breathing overlay for cleaner live block motion |
| 2026-02-27 | Increased flow animation speed and optimized background-position animation path for smoother rendering |
| 2026-02-27 | Rolled back live flow speed/offset tweaks to the earlier stable seamless configuration |
| 2026-02-27 | Replaced striped live motion with a clean gradient shimmer animation for smoother visual flow |
| 2026-02-28 | Redesigned navbar into floating island style and moved/enlarged logo outside the nav container |
| 2026-02-28 | Increased vertical spacing between floating navbar and Hero player by moving navbar island higher |
| 2026-02-28 | Moved desktop "Смотреть" button out of nav island and made nav width fit only its own controls |
| 2026-02-28 | Reworked contacts into circular icon+avatar layout and replaced links with YouTube clips, Telegram channel, Discord invite, and TG @uran_mod |
| 2026-02-28 | Deleted collaboration availability card from contacts and added Telegram suggestion link `t.me/PRAVILATIKTOKPREDLOSHKA` |
| 2026-02-28 | Removed Telegram suggestion link `t.me/PRAVILATIKTOKPREDLOSHKA` from contacts |
| 2026-02-28 | Reframed contacts section into "Полезные ссылки" and added "Смотреть также" list with external Twitch and Kick creators |
| 2026-02-28 | Added avatar-based tiles in "Смотреть также" using Twitch avatar endpoints and Kick platform fallback image |
| 2026-02-28 | Switched Roma channel URL/avatar source to `https://www.twitch.tv/r4dom1r` |
| 2026-02-28 | Fixed missing avatars for several Twitch channels by switching from proxy avatar URLs to direct Twitch CDN image URLs |
| 2026-02-28 | Implemented dynamic Twitch avatar endpoint with redirect + caching and connected creator tiles to `/api/twitch/avatar/<login>` |
| 2026-02-28 | Implemented dynamic Kick avatar endpoint and connected `helin139ban` tile to `/api/kick/avatar/helin139ban` |
| 2026-02-28 | Added `/api/watch-also` to fetch Twitch/Kick live states and display LIVE/OFF badges with dynamic nickname metadata in creator list |
| 2026-02-28 | Added Kick OAuth client-credentials token flow in API routes so Kick avatar/status resolve with authenticated requests |
| 2026-02-28 | Corrected Kick API integration: switched from non-working path endpoints to working query endpoints and wired avatar/live extraction via `broadcaster_user_id` |
| 2026-02-28 | Added Kick image host allowlist in `next.config.ts` to fix `next/image` runtime error for Kick avatars |
| 2026-02-28 | Updated creator tiles to show provided real names next to nicknames (Ростик, Вероника, Танк, Витя, Нарек, Рома, Юра, Кирилл/Альфредо) |
| 2026-02-28 | Replaced static initials in top useful links with dynamic/source avatars; added Discord invite avatar API and enabled `alert_orig.mp4` as proposal logo avatar |
| 2026-02-28 | Updated suggestion logo behavior: `alert_orig.mp4` now plays only on hover and resets on mouse leave |
| 2026-02-28 | Replaced Discord avatar source with local `public/assets/logo/ds_logo.jpg` per design request |
| 2026-02-28 | Refined live Hero composition so stream player is the primary first-screen content (not fullscreen), removed side live message, and hid non-essential intro blocks while live |
| 2026-02-28 | Updated Hero live section height from `min-h-[86vh]` to `min-h-screen` to keep background filling full viewport |
| 2026-02-28 | Applied `min-h-screen` to About, Schedule, VODs, and Contact sections so each homepage block occupies at least one full viewport height |
| 2026-02-28 | Added Twitch chat embed in Hero live block using Twitch Embed Chat URL with `parent` params; chat appears beside stream on desktop and below on mobile |
| 2026-02-28 | Implemented chat visibility toggle in Hero live embed so users can collapse/expand Twitch chat similar to native Twitch layout |
| 2026-03-01 | Corrected schedule live-row logic: active stream now binds to its actual start date key instead of only "today" key, fixing missing live block for streams that started before midnight |
| 2026-03-01 | Changed schedule axis slot step from 30 to 60 minutes so grid columns align by full hours |
| 2026-03-01 | Fixed schedule header/body misalignment by rendering header on `axisTicks.length - 1` columns to match timeline lane segmentation |
| 2026-03-01 | Implemented dynamic schedule end time based on latest stream block in selected week (hour-rounded with buffer, capped) so late-night streams are fully visible |
| 2026-03-01 | Increased VOD tile visual size by setting section wrapper to full width (`w-full`, wider max width) and using `md/2xl` breakpoints (`2 cols` on most desktops, `3 cols` only on very wide screens) |
| 2026-03-01 | Rebuilt Twitch VOD area as fixed-height two-row media shelf (horizontal scroll + left/right controls) and extended `/api/twitch` with clips feed to power a new "Избранные клипы" row |
| 2026-03-01 | Restyled media shelves with stronger art direction: card titles moved onto video frames, larger type, cinematic gradient overlays, custom shelf accents, and refreshed control styling |
| 2026-03-01 | Reduced media card footprint to improve fit, removed visible horizontal scrollbars, and added quick-link chip to `https://www.twitch.tv/sasavot/videos?filter=all&sort=time` |
| 2026-03-01 | Expanded Twitch VOD API `first` limit from 6 to 20, repositioned media shelf arrows to overlay side controls (Twitch-like), and moved the "Все видео" action into the recordings shelf header |
| 2026-03-01 | Implemented physical button press feel for media shelf controls using active-state Y-offset and compressed shadow |
| 2026-03-01 | Replaced free horizontal-scroll shelves with page-based layout: cards are aligned in equal vertical grid columns, number of visible cards is capped per breakpoint, and rows navigate via dedicated prev/next buttons |
| 2026-03-01 | Added DB-backed Twitch media caching layer: new tables for VODs/clips + cache state, setup script updated, and `/api/twitch` now serves media from PostgreSQL with periodic Twitch sync |
| 2026-03-01 | Added Supabase migration path: DB helpers now accept `SUPABASE_DB_URL`/`SUPABASE_DATABASE_URL`; created `db:migrate-to-supabase` script for `streams`, `twitch_vods`, `twitch_clips`, `app_cache_state` |
| 2026-03-01 | Completed Supabase MCP data migration and verified counts: streams=52, twitch_vods=20, twitch_clips=20, app_cache_state=1 |
| 2026-02-28 | Reworked Hero text blocks and made live player significantly larger in Hero with stronger visual emphasis while stream is active |
| 2026-03-01 | Added `opencode.json` with Supabase MCP remote server configuration; attempted `opencode mcp auth supabase`, but local OpenCode binary crashed in this environment (Bun/JSC assertion) |
| 2026-03-01 | Removed unused keys from `.env.local`; dropped legacy Neon and Vercel-only tokens, leaving Supabase DB URL + active Twitch/Kick credentials |
| 2026-03-01 | Updated `src/lib/db.ts` to normalize env connection strings and append `sslmode=require` for Supabase/Neon hosts when absent |
| 2026-03-01 | Corrected Kick online/offline detection in `/api/watch-also`: nested stream objects no longer auto-mark channels as live without explicit live flag |
