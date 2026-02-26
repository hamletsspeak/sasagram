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

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page — assembles all sections | ✅ Ready |
| `src/app/layout.tsx` | Root layout with SEO metadata | ✅ Ready |
| `src/app/globals.css` | Global styles (Tailwind import) | ✅ Ready |
| `src/components/Navbar.tsx` | Fixed navbar with mobile menu | ✅ Ready |
| `src/components/Hero.tsx` | Hero section with avatar, CTA, social links | ✅ Ready |
| `src/components/About.tsx` | About section with stats and resume download | ✅ Ready |
| `src/components/Skills.tsx` | Skills section with progress bars and tech badges | ✅ Ready |
| `src/components/Portfolio.tsx` | Portfolio grid with 6 project cards | ✅ Ready |
| `src/components/Contact.tsx` | Contact form with info cards | ✅ Ready |
| `src/components/Footer.tsx` | Footer with copyright and social links | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Website Sections

1. **Navbar** — Fixed top bar with logo, nav links, mobile hamburger menu
2. **Hero** — Full-screen section with avatar, name, title, CTA buttons, social icons, scroll indicator
3. **About** — Two-column layout with photo placeholder, bio text, stats grid, resume download
4. **Skills** — Three skill category cards with animated progress bars + tech badge cloud
5. **Portfolio** — 6-card grid with project descriptions, tags, live demo & GitHub links
6. **Contact** — Contact info cards + functional contact form with send animation
7. **Footer** — Simple footer with copyright and social links

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
