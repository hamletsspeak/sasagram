# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ SASAVOT streamer business card website implemented

The template is now a fully functional personal business card website for the streamer SASAVOT, built with Next.js 16, TypeScript, and Tailwind CSS 4. All sections are implemented with a dark theme (gray-950 base) and purple/violet streamer accent colors.

## Recently Completed

- [x] 2026-03-06: Fixed missing current live rating in schedule cards by correcting same-day stream filtering in `buildWeeks` (`startedAt > now` instead of `startedAt > today`) and by reusing DB rating fields (`ratingAvg`, `ratingCount`) in the live-card branch when a persisted stream exists
- [x] 2026-03-05: Extended rating-card video preview to side edges on mobile by adding horizontal negative margins (`-mx-5`) with top flush alignment, while keeping desktop layout unchanged (`lg:mx-0 lg:rounded-2xl`) in `src/features/ratings/components/RatingCard.tsx`
- [x] 2026-03-05: Removed top gap above video preview banner in rating cards on mobile by applying `-mt-5` to preview container (`lg:mt-0` preserved desktop layout) in `src/features/ratings/components/RatingCard.tsx`
- [x] 2026-03-05: Reduced mobile gap under rating header/burger on `/rating` by changing top offset to `pt-[56px]` (desktop unchanged `md:pt-[92px]`) and matching section height to `h-[calc(100vh-56px)]` on mobile
- [x] 2026-03-05: Centered WeekPicker dropdown on mobile by positioning calendar popover at `left-1/2 -translate-x-1/2` and preserving desktop behavior with `md:left-0 md:translate-x-0` in `src/features/schedule/components/WeekPicker.tsx`
- [x] 2026-03-05: Hid visible scrollbar in rating stream list while preserving scroll behavior by adding reusable `.hide-scrollbar` utility in `src/app/globals.css` and applying it to the `overflow-y-auto` container in `StreamRatingsPage.tsx`
- [x] 2026-03-05: Increased transparency of the main rating panel container in `StreamRatingsPage` by changing background from `bg-[#09090b]/90` to `bg-[#09090b]/75` for a lighter, more see-through overlay effect
- [x] 2026-03-05: Positioned mobile `Рейтинг стримов` label as a fixed top-left overlay (`left-4 top-2`, `md:hidden`) on `/rating`, matching burger-menu offsets and removing the in-flow duplicate label
- [x] 2026-03-05: Scoped `/rating` copy/layout changes to mobile only: restored desktop (`md+`) hero block (`Рейтинг стримов` + `Оцените стримы` + explanatory text) while keeping mobile header simplified and top-aligned as requested
- [x] 2026-03-05: Updated `/rating` hero copy/layout: removed `Оцените стримы` title and explanatory paragraph, and anchored `Рейтинг стримов` at the top with burger-matching offsets (`px-4 pt-2` mobile, `md:px-6 md:pt-3`) in `src/app/rating/page.tsx`
- [x] 2026-03-05: Refined `/rating` mobile layout: removed the in-panel heading text (`Выберите неделю и оцените реальные стримы`), centered the week calendar controls in `StreamRatingsPage`, and removed mobile outer section paddings (`px-0 pb-0` with desktop-only `md:px-6 md:pb-6`) so the rating area sits flush with screen edges on phones
- [x] 2026-03-05: Simplified mobile shelf headers: removed all top controls above carousels on phones (prev/next/action buttons), and restored section titles only on mobile via `md:hidden` labels (`Записи стримов`, `Избранные клипы`) in `VodsShelf.tsx` and `ClipsShelf.tsx`
- [x] 2026-03-05: Removed shelf section labels (`Записи стримов`, `Избранные клипы`) and hid top-right `Все видео` / `Все клипы` header buttons on desktop (`lg:hidden`) in `VodsShelf.tsx` and `ClipsShelf.tsx`; mobile header actions remain available
- [x] 2026-03-05: Limited Twitch shelves to 7 media items each at UI layer (`vods.slice(0, 7)` and `clips.slice(0, 7)` in `TwitchVods.tsx`) while preserving current carousel behavior and terminal CTA banners
- [x] 2026-03-05: Removed unintended extra side banners in Twitch shelves by reverting Swiper viewport to default clipping (`overflow-hidden` via removing `!overflow-visible`), and widened shelf containers to `max-w-[1320px]` so side cards remain less clipped without exposing additional off-screen slides
- [x] 2026-03-05: Prevented side-banner clipping in Twitch shelves without resizing cards by setting Swiper viewport to `overflow-visible` (`className="!overflow-visible ..."`) in both `VodsShelf.tsx` and `ClipsShelf.tsx`
- [x] 2026-03-05: Fixed prev-button visibility conflict in Twitch shelves: replaced `disabled={!canPrev}` with `aria-disabled={!canPrev}` for prev buttons so Tailwind `disabled:opacity-35` no longer leaks a visible faded button; visibility now fully controlled by `canPrev` with `opacity-0` + `pointer-events-none`
- [x] 2026-03-05: Added progressive visibility for previous navigation buttons in Twitch shelves: on first slide the "prev" buttons are visually hidden, and they fade in (`transition-opacity`) once the user moves forward (applied to both mobile header and desktop overlay buttons in `VodsShelf.tsx` / `ClipsShelf.tsx`)
- [x] 2026-03-05: Updated Twitch shelves per UX request: removed UI slicing to 3 items (now `TwitchVods` passes full `vods`/`clips` arrays), removed DB read limits (`LIMIT 20`) from `getCachedMediaState`, forced Swiper startup at first slide (`slideTo(0, 0, false)` + `initialSlide={0}`), disabled loop for predictable edge behavior, and added terminal CTA slides `Все видео` / `Все клипы` as the last banners in each shelf
- [x] 2026-03-05: Stabilized animation behavior for 3-card Twitch shelves by disabling loop for `items.length <= 3` (`isLoop = items.length > 3`) and restoring native `slidePrev/slideNext` controls in both `VodsShelf.tsx` and `ClipsShelf.tsx`; this brings back normal slide animation and removes reverse-direction loop artifacts
- [x] 2026-03-05: Fixed reverse navigation animation direction in Twitch shelves: replaced direct `slidePrev/slideNext` loop navigation with `slideToLoop` based on `realIndex` in `VodsShelf.tsx` and `ClipsShelf.tsx`, so clicking back animates backward instead of visually moving forward
- [x] 2026-03-05: Fixed regressions in Twitch coverflow after limiting to 3 items: desktop slide width switched from percent-based to fixed (`xl:!w-[500px]`), slider container widened to `max-w-[1240px]`, and `watchOverflow` removed in both `VodsShelf.tsx` and `ClipsShelf.tsx` to preserve normal swipe/arrow behavior
- [x] 2026-03-05: Limited Twitch media shelves to 3 banners each (VODs + Clips) in `src/features/twitch/components/TwitchVods.tsx` and narrowed both slider containers with `max-w-[1120px]` in `VodsShelf.tsx` / `ClipsShelf.tsx` while preserving existing card/video dimensions (no stretch)
- [x] 2026-03-05: Tuned coverflow shelves sizing: desktop slide widths now target 3 visible cards per row, coverflow stretch/depth reduced for cleaner composition, and VOD section row heights increased to prevent bottom clipping of banner content
- [x] 2026-03-05: Updated VOD/Clips Swiper logic to match coverflow-style carousel behavior (`centeredSlides`, `slidesPerView: auto`, `effect: coverflow`, `watchSlidesProgress`) and added progress-based dynamic side dimming overlays (active slide brighter, side slides darker)
- [x] 2026-03-05: Reworked VOD and Clips shelves to true Swiper-based horizontal carousels (`swiper/react`) with breakpoint-driven `slidesPerView`, keyboard support, smooth slide animation, and existing custom left/right overlay controls wired via Swiper API
- [x] 2026-03-05: Enlarged side overlay pagination controls for both VOD and Clips shelves and added left/right desktop arrows directly on card area edges; header arrows are now mobile-only (`lg:hidden`) in `src/features/twitch/components/VodsShelf.tsx` and `src/features/twitch/components/ClipsShelf.tsx`
- [x] 2026-03-05: Moved the existing VOD pagination `next` control from the header action row into an overlay position at the right-center of the cards area in `src/features/twitch/components/VodsShelf.tsx` (same behavior, new placement)
- [x] 2026-03-05: Removed the extra overlay swipe button from `src/features/twitch/components/VodsShelf.tsx`; recordings pagination now uses only the existing top navigation arrows next to `Все видео`
- [x] 2026-03-05: Added a dedicated right-side swipe button for VOD pagination in `src/features/twitch/components/VodsShelf.tsx`, positioned at the vertical center of the cards area (desktop `lg+`) and bound to the existing `onNext` page action
- [x] 2026-03-05: Reverted SASAVOT avatar source back to the original circle video `Кружок_сасыч.webm` in both `src/components/Hero.tsx` and `src/components/Navbar.tsx` (removed temporary MP4 fallback source)
- [x] 2026-03-05: Improved mobile avatar autoplay reliability: added MP4 fallback source (`sasych_head.mp4`) next to WebM for SASAVOT avatar videos in `src/components/Hero.tsx` and `src/components/Navbar.tsx`, enabled autoplay for the proposal avatar video in `src/components/Contact.tsx`, and limited hover-only play/pause handlers to devices that actually support hover
- [x] 2026-03-05: Removed test scroll page feature: deleted route `src/app/fullpage-test/page.tsx`, deleted unused component `src/components/FullpageTestView.tsx`, and removed `Тест скролла` navigation item from `src/components/Navbar.tsx`
- [x] 2026-03-05: Reverted `src/app/page.tsx` to the previous homepage composition (Navbar, Hero, About, StreamSchedule, TwitchVods, Contact, Footer) so the main `/` screen no longer uses the temporary stacking-scroll test layout
- [x] 2026-03-05: Fully removed `fullpage.js` from project dependencies/integration and replaced `/fullpage-test` with native sticky overlay section scrolling (section layering effect) in `src/components/FullpageTestView.tsx`; also removed fullpage CSS/type declarations and renamed navbar entry to `Тест скролла`
- [x] 2026-03-05: Added isolated fullPage.js playground route `/fullpage-test` with near-doc config (`anchors`, `navigationTooltips`, `slidesNavigation`, `scrollingSpeed: 609`, `fitToSectionDelay: 600`, `controlArrows: false`, `rtl: false`, `effects: "cover"`) and env-driven keys (`NEXT_PUBLIC_FULLPAGE_EFFECTS_KEY`, `NEXT_PUBLIC_FULLPAGE_LICENSE_KEY`)
- [x] 2026-03-05: Switched site-wide default body text font to Ubuntu via `next/font/google` in `src/app/layout.tsx` and applied global base font-family in `src/app/globals.css`; decorative font utility classes (`Audex`, `Them People`, `Type Light Sans`, `Fontick`) remain intact for explicit use-cases
- [x] 2026-03-05: Removed live floating mini-player (PiP) entirely from `src/components/Hero.tsx`, moved Twitch player+chat block to dedicated page `/watch` (`src/app/watch/page.tsx`, `src/features/twitch/components/WatchLivePage.tsx`), and added conditional blinking red `Смотреть` nav item in `src/components/Navbar.tsx` that appears only while stream is active
- [x] 2026-03-05: Restored Hero live rendering in `src/components/Hero.tsx`: when Twitch is live, Hero now shows the visible stream player + optional chat panel again (instead of empty/incorrect state), and floating PiP live player rendering with drag/resize/close controls is active while scrolling below Hero
- [x] 2026-03-05: Reverted `fullPage.js` cover-scroll experiment and restored prior homepage state (regular section flow + existing desktop arrow navigation/wheel lock); removed `fullpage.js` dependency from the project
- [x] 2026-03-05: Added desktop-only section navigation controls on homepage (`src/components/DesktopSectionNavigator.tsx`) with fixed up/down arrows that smoothly move between `#home`, `#about`, `#schedule`, `#vods`, `#contact`; also disabled mouse-wheel page scrolling on desktop to make section transitions arrow-driven and more interactive
- [x] 2026-03-05: Removed all star glow/filter effects in desktop schedule stream cards and kept plain `star_rait.png` icon only in `src/features/schedule/components/ScheduleDesktop.tsx`
- [x] 2026-03-05: Removed the `Рейтинг` label from desktop schedule stream cards and replaced the inline SVG with icon asset `public/assets/icons/free-icon-star-2164323.png` in `src/features/schedule/components/ScheduleDesktop.tsx`
- [x] 2026-03-05: Moved rating in desktop schedule stream cards to the right side and increased its size for stronger emphasis in `src/features/schedule/components/ScheduleDesktop.tsx`
- [x] 2026-03-05: Removed the large top schedule highlight strip (title/time/rating preview banner) from `src/features/schedule/components/StreamSchedule.tsx`; schedule section now shows only the standard weekly calendar/timeline UI
- [x] 2026-03-05: Extended schedule data pipeline to include stream rating aggregates (`ratingAvg`, `ratingCount`) from `/api/streams`, and rendered these ratings directly inside desktop/mobile schedule cards so votes from `/rating` are visible in расписание
- [x] 2026-03-05: Added global pointer UX for clickable buttons in `src/app/globals.css` (`button:not(:disabled) { cursor: pointer; }`) and explicit disabled cursor (`not-allowed`) to keep non-interactive states clear
- [x] 2026-03-04: Added anonymous stream rating flow on dedicated route `/rating`: real streams are fetched from `streams` with aggregate rating stats, voting happens through `/api/streams/ratings` and `/api/streams/[id]/rating`, policy is one vote per stream per browser/device without edits, and the server uses a random `HttpOnly` cookie token hashed with SHA-256 before persistence
- [x] 2026-03-04: Added DB bootstrap for `stream_ratings` with `UNIQUE (stream_id, viewer_token_hash)`, `CHECK rating BETWEEN 1 AND 5`, `ON DELETE CASCADE`, and `stream_id` index; the implementation explicitly avoids storing name, email, raw IP, account identity, or browser fingerprint
- [x] 2026-03-04: Added lightweight rating entrypoints without polluting the homepage schedule UI: Navbar now links to `/rating`, schedule header has a compact `Оценить стримы` CTA, and the dedicated page explains the privacy model and the browser/device-level limitation
- [x] 2026-03-04: Replaced the root `todo.md` refactor checklist with a concrete implementation plan for anonymous stream ratings in the schedule: one vote per stream per browser/device via `HttpOnly` cookie token hash, no auth, no raw IP storage, and explicit acceptance of browser-level rather than person-level uniqueness
- [x] 2026-03-04: Refined empty-day schedule logic: future days are now rendered as visually empty placeholders again, today without a started stream shows `Стрим еще не начался` until the end of the day, and only past days without a stream receive a deterministic random `Глеб Борисович ...` activity
- [x] 2026-03-04: Updated stream schedule copy: completed streams now show raw duration without the `Шел` prefix, and days without a stream render a deterministic random `Глеб Борисович ...` activity sourced from the new client-side activity list used by both desktop and mobile schedule views
- [x] 2026-03-04: Added `dependency-cruiser` project dependency map with `.dependency-cruiser.cjs`, `npm run deps:check`, and Windows-safe `npm run deps:graph` generation of `dependency-graph.svg` using Graphviz; baseline rules now flag UI imports of `src/server` and `src/db`, while current code passes the check
- [x] 2026-03-04: Normalized project root to real package identity `sasagram`, switched documented package manager to `npm`, removed in-repo `bun.lock`, added project README, and expanded `.gitignore` for local IDE/agent artifacts
- [x] 2026-03-04: Refactored `StreamSchedule` into `src/features/schedule/` modules (`components`, `lib`, `types`) while preserving the public component contract and visual behavior; kept `src/components/StreamSchedule.tsx` as a compatibility re-export
- [x] 2026-03-04: Refactored `TwitchVods` into `src/features/twitch/` modules (`components`, `lib`, `types`) while preserving pagination/UI behavior; kept `src/components/TwitchVods.tsx` as a compatibility re-export
- [x] 2026-03-04: Introduced `src/server/` layering for DB pool, stream repository/service, Twitch auth/media cache service, Kick helpers, and watch-also aggregation; `/api/streams`, `/api/twitch`, and `/api/watch-also` are now thin adapters
- [x] 2026-03-04: Moved shared browser fetch cache helper to `src/shared/lib/client-api-cache.ts` and left `src/lib/*` as compatibility re-exports for incremental migration safety
- [x] 2026-03-04: Updated `src/app/page.tsx` to consume feature entrypoints directly and pinned `turbopack.root` in `next.config.ts` to the repo root to avoid false workspace-root detection from lockfiles outside the repository
- [x] 2026-03-04: Verified refactor with `npm run lint`, `npm run typecheck`, and `npm run build`
- [x] 2026-03-04: Reviewed project structure; confirmed clear top-level split (`app` / `components` / `lib` / `db` / `scripts`) and identified main cleanup targets: oversized UI/API files, stale template metadata/docs, and mixed package-manager/tooling artifacts in repo root
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
- [x] Fixed production video decode failures by removing Git LFS tracking for `public/assets/logo` static media
- [x] Excluded oversized local disclaimer sources (`дис2.mp4`, `дисклеймер4к.mp4`) from git via `.gitignore` and removed `дис2.mp4` from tracked files
- [x] Disclaimer video source is now configurable via `NEXT_PUBLIC_DISCLAIMER_VIDEO_URL` with local fallback `alert_orig.mp4`
- [x] Removed broken `<link rel="preload" as="video">` hint from root layout and fixed hydration mismatch in `DisclaimerOverlay`
- [x] Updated startup disclaimer default asset to local `дисклеймер_final.webm` with dynamic MIME type handling (`webm`/`mp4`) in `DisclaimerOverlay`
- [x] Disclaimer now switches by breakpoint: mobile uses `дисклеймен_final_mob.webm`, desktop keeps `дисклеймер_final.webm` (with optional env overrides)
- [x] Disclaimer preloader updated: label changed to `Загрузка`, and playback now starts only after both video readiness and full page `window.load`
- [x] Disclaimer preloader now shows real numeric progress (`%`) from combined page load + video buffering; `autoPlay` disabled to prevent premature start
- [x] Removed Next Image CDN dependency for Twitch previews/avatars: VOD/clip cards now use unoptimized image loading and `watch-also` API returns local avatar proxy routes
- [x] Removed `static-cdn.jtvnw.net` from Next Image remote patterns to avoid CDN optimizer path
- [x] Unified Hero background video source: both live and offline states now use `фон_сайт_онлайн.webm`; legacy `фон_сайт.webm` removed from runtime usage
- [x] Added fixed/sticky video background for all post-Hero sections using `фон_остальные_разделы.webm`; on scroll only section content moves
- [x] Increased fill contrast for VOD/Clips shelf controls (arrows + action buttons) to improve visibility on red patterned backgrounds
- [x] Removed heavy global background glow layers/animations (`site-dark-glow` pseudo-elements with blur/animation) to reduce render/GPU load and improve scroll smoothness
- [x] Reworked VOD section viewport sizing and stacking: `#vods` now uses fixed viewport-aligned container heights, stronger top separator, and raised stacking context to prevent visual overlap with schedule section
- [x] Fixed `#vods` top anchor offset by removing scroll margin (`scroll-mt-0`) so recordings section starts from the very top edge without exposing previous section
- [x] Adjusted Hero vertical layout: replaced center alignment with top alignment and set explicit navbar-to-content spacing of 20px for text/avatar block
- [x] Updated Hero background playback during disclaimer: removed disclaimer-visibility pause gate so Hero background video can render/load while disclaimer is playing; switched Hero background preload to `auto`
- [x] Removed section divider lines: disabled `blood-divider` pseudo-line and removed top/between-section borders from Schedule, VODs, and Footer wrappers
- [x] Unified post-Hero section darkening: About, Schedule, VODs, Contact, and Footer now use consistent overlay `bg-black/45` to eliminate visible tone shifts between sections
- [x] Fixed Kick avatar rendering in "Смотреть также": `next/image` optimization is now bypassed for `/api/*` avatar sources (same as remote URLs) to avoid optimizer issues with redirecting API image endpoints
- [x] Improved "Смотреть также" UX: removed upward hover shift from creator avatars (scale-only hover to prevent top clipping) and added mobile-first 2-column card layout with larger readable labels
- [x] Mobile navbar alignment updated: burger control moved from centered island position to top-right corner; mobile dropdown menu now right-aligned with compact max width
- [x] Stream schedule now has dual UX by breakpoint: mobile (`< md`) uses compact day cards with weekly navigation, while desktop/tablet (`md+`) preserves timeline grid layout
- [x] Mobile schedule cards compacted to fit full week view better: reduced paddings/spacings/font sizes and merged time+duration into a denser single row
- [x] Removed "Смотреть на Twitch" CTA from mobile navbar dropdown menu per UI cleanup request
- [x] Added local `Type Light Sans` font and applied it to schedule calendar date rendering (week range label + date cells) for visual consistency
- [x] Tuned mobile week-range label in schedule header: larger centered `Type Light Sans` text with explicit `3px` top/bottom padding
- [x] Increased mobile week-range number size by an additional 5px (`text-[21px]`) for stronger readability
- [x] Disabled horizontal page drift on mobile by enforcing `overflow-x: hidden` on both `html` and `body`
- [x] Removed mobile schedule separator lines: dropped outer border and internal bottom borders in the mobile week header block for cleaner continuous panel look
- [x] Matched post-Hero fixed background behavior on mobile with desktop: mobile now uses a dedicated `fixed` background layer (`md:hidden`) while desktop keeps sticky parallax layer (`md:block`)
- [x] Restored Hero background visibility after mobile fixed backdrop change by increasing Hero section stacking order (`z-20`)
- [x] Final mobile QA pass applied: tightened Hero headline/avatar scale for narrow screens, made VOD/Clips header controls wrap cleanly, reduced mobile side paddings in VOD section, and enabled footer link/copyright wrapping
- [x] Fixed Hero mobile avatar distortion by enforcing square sizing (`size-*` + `aspect-square` + `shrink-0`) on the avatar frame to prevent oval stretching

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
| 2026-03-02 | Added mandatory fullscreen disclaimer pre-roll (`/assets/logo/дисклеймер.mp4`) on homepage start: blocks page interaction, has no skip action, and closes only after video end; includes autoplay fallback prompt and retry handling on load error |
| 2026-03-02 | Switched startup disclaimer source to 4K asset (`/assets/logo/дисклеймер4к.mp4`) |
| 2026-03-02 | Added dedicated preloader screen for startup disclaimer and `<link rel="preload" as="video">` hint in root layout so disclaimer video is rendered only after readiness |
| 2026-03-02 | Hero background now uses video assets by live state: `фон_сайт_онлайн.webm` plays once when live, `фон_сайт.webm` loops when offline, and background playback pauses when Hero section is out of viewport |
| 2026-03-02 | Replaced startup disclaimer asset with `дис2.mp4` and rotated Hero live/offline background videos by 180 degrees |
| 2026-03-02 | Updated disclaimer behavior to skip playback on browser page reload (`navigation.type === reload`), so disclaimer runs only on normal page entry |
| 2026-03-02 | Replaced Hero avatar with local circular video `Кружок_сасыч.webm` (autoplay loop, muted) |
| 2026-03-02 | Adjusted navbar avatar sizing/cropping to fit circular outline and hid left logo on initial page view (shows only after scroll) |
| 2026-03-02 | Improved avatar transition stability: navbar avatar now fully fills the circle, and Hero-to-navbar avatar flight uses rAF throttling with smoother scroll behavior and no visible jump |
| 2026-03-02 | Navbar transparency made native: added reusable glass classes with `backdrop-filter`/`-webkit-backdrop-filter` and applied them to nav island + mobile menu |
| 2026-03-02 | Aligned navbar vertical offset with left logo: header top and nav top margin now match logo top spacing on mobile and desktop |
| 2026-03-02 | Added centered Hero title "Глеб Борисович Орлов" above avatar with typewriter reveal animation and custom local font (`public/assets/font/Audex`) |
| 2026-03-02 | Reworked Hero title into looping typewriter cycle with accurate inline cursor: text now types and erases per-char, then switches to slow dark-blood `SASAVOT` using `Them People` font |
| 2026-03-02 | Updated Hero typewriter timing: both title slides now stay visible for 10 seconds each before erase phase starts |
| 2026-03-02 | Fixed `SASAVOT` cursor vertical alignment by adding font-specific cursor metrics/offset for `Them People` in typewriter header |
| 2026-03-02 | Prevented Hero avatar shift during `SASAVOT` render by fixing the typewriter title block height across text states |
| 2026-03-02 | Optimized Hero typewriter workload: animation state now pauses during active page scroll and while Hero is outside viewport, then resumes from current progress |
| 2026-03-02 | Added global dark animated glow layer on page background (`body::after`) with blurred red/burgundy gradients and low brightness for non-hero sections |
| 2026-03-02 | Reworked non-hero background glow to a stronger visible `main` layer (`.site-dark-glow::before`) with dark red animated blur so sections no longer look flat black |
| 2026-03-02 | Tuned global section background from heavy dark glow to frosted-window look: layered matte haze + soft condensation highlights with subtle motion, keeping palette muted and non-bright |
| 2026-03-03 | Fixed media loading on production: removed LFS from public logo videos, deleted tracked `дис2.mp4` (kept local), moved disclaimer source to `NEXT_PUBLIC_DISCLAIMER_VIDEO_URL` fallback, removed invalid video preload hint, and resolved disclaimer hydration mismatch (`React #418`) |
| 2026-03-03 | Switched default startup disclaimer to `public/assets/logo/дисклеймер_final.webm` and made `<source type>` dynamic based on file extension to keep env override compatibility |
| 2026-03-03 | Disabled Next Image optimization for Twitch media cards, switched `watch-also` dynamic avatars to local `/api/*/avatar` routes, and removed `static-cdn.jtvnw.net` from `next.config.ts` image allowlist |
| 2026-03-03 | Hero background switched to single asset `фон_сайт_онлайн.webm` for both live/offline branches; `фон_сайт.webm` no longer referenced in app code |
| 2026-03-03 | Wrapped sections after Hero in a sticky video background layer (`фон_остальные_разделы.webm`) so background stays fixed while About/Schedule/VODs/Contact/Footer content scrolls on top |
| 2026-03-03 | Updated TwitchVods control styles: stronger solid fill and brighter border/text for prev/next arrows and `Все видео`/`Все клипы` buttons to improve readability |
| 2026-03-03 | Simplified global background rendering: removed animated glow/noise overlays and related keyframes from `globals.css`, keeping a lightweight static gradient backdrop |
| 2026-03-03 | Fixed recordings section intersection with schedule by resizing `#vods` to viewport-based heights (`calc(100vh - offset)`), increasing section paddings, adding a top border divider, and setting explicit `z-index` layering |
| 2026-03-03 | Removed top anchor offset for recordings (`scroll-mt-0` on `#vods`) to eliminate visible bleed of previous section when navigating to "Записи" |
| 2026-03-03 | Hero section top spacing recalibrated: switched to top-aligned layout and applied a 20px gap between navbar and the title/avatar content block |
| 2026-03-03 | Hero background video now preloads and can play behind the disclaimer overlay (no pause tied to disclaimer visibility), reducing the visual delay when disclaimer ends |
| 2026-03-03 | Removed visible horizontal separators between sections by disabling global divider pseudo-element and dropping section-level top/between borders on Schedule/VODs/Footer |
| 2026-03-03 | Standardized section backdrop opacity across all non-hero sections by aligning wrappers to `bg-black/45`, including replacing the custom radial VOD backdrop and dark Footer tone |
| 2026-03-03 | Resolved missing Kick avatar tile by bypassing Next image optimizer for local `/api/*` avatar URLs in `Contact` (direct browser fetch now handles API redirects consistently) |
| 2026-03-03 | Refined "Смотреть также" responsiveness and hover behavior: switched mobile layout to 2-column cards, increased avatar/text readability, and replaced translate-up hover animation with scale to remove avatar clipping |
| 2026-03-03 | Repositioned mobile burger navigation to the right corner by changing nav alignment (`ml-auto`) and right-aligning the mobile menu panel with a narrower max width |
| 2026-03-03 | Redesigned schedule behavior for phones: replaced horizontal time-axis matrix with vertical per-day cards plus prev/next week controls and "Сегодня" jump; desktop/tablet timeline remains unchanged |
| 2026-03-03 | Tightened mobile schedule card density (smaller rounded blocks, less vertical gap, compact typography) so all 7 days are visible on a typical phone viewport without heavy scrolling |
| 2026-03-03 | Deleted the extra Twitch CTA button from the mobile burger menu in `Navbar` to simplify the mobile header actions |
| 2026-03-03 | Integrated `Type Light Sans` (`TypeLightSans.otf`) via global `@font-face` and used `font-type-light-sans` in StreamSchedule calendar date UI (selected week range + month grid day numbers) |
| 2026-03-03 | Updated mobile week range display (`23.02 - 01.03`) to be more legible: increased font size, enforced center alignment with `flex-1`, and set vertical padding `py-[3px]` |
| 2026-03-03 | Bumped mobile week-range digits by +5px (from `text-base` to `text-[21px]`) while preserving center alignment and 3px vertical padding |
| 2026-03-03 | Applied global horizontal-overflow guard (`html, body { overflow-x: hidden; }`) to prevent sideways swipe/rotation-like layout shift on mobile devices |
| 2026-03-03 | Eliminated the visible "separator stroke" on phone schedule UI by removing mobile-only container/header borders in `StreamSchedule` |
| 2026-03-03 | Updated page background layering: added mobile-only fixed video backdrop for non-hero sections and kept desktop sticky backdrop, with content offset (`md:-mt-[100vh]`) only on desktop |
| 2026-03-03 | Fixed Hero background regression by elevating Hero section above shared fixed/sticky background layers (`z-20`), restoring dedicated Hero video rendering |
| 2026-03-03 | Completed targeted phone-width hardening (320–390px): Hero title lowered to `text-2xl` and avatar to `220px`, VOD/Clips controls now stack/wrap on mobile, container padding reduced to `px-3`, About heading scaled down on mobile, and Footer rows now wrap without overflow |
| 2026-03-03 | Corrected Hero avatar becoming vertically stretched on mobile by switching frame classes to unified `size-[220px] md:size-[276px]` with `aspect-square` and `shrink-0` |
| 2026-03-03 | Updated startup disclaimer source selection by viewport: `дисклеймен_final_mob.webm` is now used on mobile (`max-width: 767px`) while desktop stays on `дисклеймер_final.webm`; source auto-updates on breakpoint changes |
| 2026-03-03 | Updated disclaimer loading gate: preloader text is now `Загрузка`, and disclaimer playback waits for full site load (`window.load`) plus video readiness before starting |
| 2026-03-03 | Improved disclaimer UX: mobile rendering now uses adaptive fit (`object-contain` on phones), loading bar reflects real progress (page + video), and autoplay is disabled so playback begins only after full readiness |
- [x] 2026-03-03: Fixed phone disclaimer mismatch by exporting viewport metadata (`device-width`, `initialScale=1`, `viewportFit=cover`) from `src/app/layout.tsx`, preventing mobile browsers from resolving the startup disclaimer breakpoint in desktop mode
- [x] 2026-03-03: Optimized disclaimer startup loading by moving mobile/desktop source selection into native `<source media>` rules and reducing preload from `auto` to `metadata`, with readiness based on the first loaded frame instead of buffer-depth tracking
 - [x] 2026-03-04: Refined disclaimer preload UX in `DisclaimerOverlay`: waiting text changed to `Пожалуйста, подождите.`, the progress bar now reserves the final 5% for browser-side video preparation so `100%` appears only when playback can actually start, the `Загрузка` label has a soft pulse animation, and a warning now tells users not to refresh the page during loading
- [x] 2026-03-04: Simplified the About section in `src/components/About.tsx` by removing all streamer bio content, stats, and CTA buttons; section now shows a temporary `Раздел в разработке` placeholder
| 2026-03-03 | Fixed phone disclaimer mismatch by exporting Next.js viewport metadata (`device-width`, `initialScale=1`, `viewportFit=cover`) from `src/app/layout.tsx`, preventing mobile browsers from evaluating the disclaimer breakpoint in desktop mode |
| 2026-03-03 | Reduced disclaimer startup cost in `DisclaimerOverlay`: browser now picks the mobile/desktop asset through `<source media>`, video preload is `metadata` instead of `auto`, and readiness is based on `loadeddata` rather than buffered-duration tracking |
| 2026-03-03 | Hardened startup disclaimer stability: replaced `window.load` gating with DOM readiness (`DOMContentLoaded` / `document.readyState`) plus a 1.5s fallback timer, so the overlay cannot freeze waiting for unrelated late resources |
| 2026-03-03 | Reduced startup media contention: Hero background videos now stay paused while the disclaimer is visible and use `preload="metadata"`, preventing desktop/mobile stalls caused by concurrent heavy video loading |
| 2026-03-03 | Reworked startup disclaimer flow into explicit staged UX: device type is detected first, the selected video is downloaded via XHR with exact byte-based percentage progress, and playback starts only after the user presses `Start` |
| 2026-03-04 | Reviewed repository structure: top-level layering is sound for a small Next.js app, but future maintainability is constrained by oversized components/routes, outdated template naming/documentation, and duplicated package-manager/build artifacts at the repo root |

