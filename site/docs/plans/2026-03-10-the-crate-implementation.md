# The Crate — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the DJ Mix Archive site with "The Crate" aesthetic — warm, tactile, record-store discovery feel.

**Architecture:** Astro SSG shell with React islands for interactive components (crate carousel, player, waveform). Tailwind for styling. Existing content collections and R2 audio hosting unchanged. Component libraries (shadcn/ui, Magic UI, Aceternity UI) used via React islands.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4, Framer Motion, shadcn/ui, wavesurfer.js

**Design doc:** `docs/plans/2026-03-10-the-crate-redesign.md`

---

## Phase 1: Foundation — Tailwind + React + New Design Tokens

### Task 1: Add React and Tailwind to Astro

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/styles/global.css`

**Step 1: Install dependencies**

```bash
cd C:/AI/Projects/Personal/dj-mix-archive/site
npm install @astrojs/react @astrojs/tailwind react react-dom tailwindcss @tailwindcss/vite framer-motion
npm install -D @types/react @types/react-dom
```

**Step 2: Configure Astro for React + Tailwind**

Update `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://luke-dj-mixes.pages.dev',
  prefetch: true,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Step 3: Create global CSS with design tokens**

Create `src/styles/global.css` with The Crate palette, typography imports (Playfair Display, Inter, JetBrains Mono), CSS custom properties, and Tailwind directives. All color/font/spacing tokens defined here.

Palette:
- `--base: #0A0A0A` `--surface: #161412` `--surface-hover: #221E1A`
- `--warm-cream: #F5E6C8` `--muted-stone: #8A7E72` `--amber: #D4A574`
- `--amber-glow: rgba(212,165,116,0.25)` `--teal: #4A7B7C` `--border: #2A2420`

Typography:
- `--font-heading: 'Playfair Display', Georgia, serif`
- `--font-body: 'Inter', system-ui, sans-serif`
- `--font-mono: 'JetBrains Mono', monospace`

**Step 4: Create Tailwind config**

Create `tailwind.config.ts` extending the palette colors and font families. Include `src/**/*.{astro,tsx,ts}` in content paths.

**Step 5: Update BaseLayout to import global CSS**

Add `import '../styles/global.css'` to BaseLayout.astro frontmatter. Remove the inline `<style is:global>` block — it's replaced by global.css + Tailwind.

**Step 6: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Site renders with new palette (will look broken until templates are updated — that's fine).

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add React, Tailwind, new Crate design tokens"
```

---

### Task 2: Film Grain + Warm Noise Texture

**Files:**
- Create: `src/components/FilmGrain.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Step 1: Create FilmGrain component**

An Astro component that renders a fixed full-viewport SVG noise overlay at 3-4% opacity with a warm sepia tint. Uses the existing SVG feTurbulence approach but with warm color matrix filter.

**Step 2: Add to BaseLayout**

Replace the `body::before` noise overlay with the `<FilmGrain />` component.

**Step 3: Verify visually**

```bash
npm run dev
```

Check: Subtle warm grain visible over the dark background. Not distracting. Disappears at `prefers-reduced-motion`.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: warm film grain overlay"
```

---

## Phase 2: Homepage — Featured Sleeve + Crate Carousel

### Task 3: Featured Sleeve (Hero)

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/utils/mix-gradient.ts` (warm palette shift)

**Step 1: Update mix-gradient.ts**

Shift the gradient generation to use warmer hues. For unanalyzed mixes: amber/sepia range instead of arbitrary hues. For analyzed: keep BPM-driven hue but shift saturation/lightness toward warmth. Update `getMixGlowColor` to return amber-range glows.

**Step 2: Rewrite hero section**

Replace the current hero with a full-width Featured Sleeve:
- Large generative gradient as album cover art (full width, 60vh height)
- Film grain + warm light leak gradient overlaid
- Mix number as massive ghost text (existing pattern, keep)
- Playfair Display for title, Inter for metadata
- Amber play button with warm glow shadow
- Tailwind classes throughout (no inline `<style>`)

**Step 3: Verify**

```bash
npm run dev
```

Check: Hero looks like a featured album sleeve — warm, editorial, dominant.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: featured sleeve hero with warm palette"
```

---

### Task 4: The Crate — Horizontal Scroll Carousel

**Files:**
- Create: `src/components/CrateCarousel.tsx` (React island)
- Modify: `src/pages/index.astro`

**Step 1: Build CrateCarousel React component**

Props: array of mix data (title, mixNumber, gradient, duration, slug, audioFile, isAnalyzed, bpm).

Renders a horizontal scrolling container with scroll-snap:
- Each sleeve is a square card (~240px) with generative gradient background
- Mix number as overlay text
- Title below the card (Playfair Display, 1rem)
- Duration + BPM (if analyzed) as mono metadata
- Hover: card lifts (`translateY(-6px)`) with warm amber box-shadow
- Click navigates to mix detail page
- Play button appears on hover (bottom-right of sleeve)
- Uses `scroll-snap-type: x mandatory` and `scroll-snap-align: start`
- Drag-to-scroll with mouse (not just touch)
- Left/right arrow buttons at edges for keyboard/desktop users

Framer Motion for hover animations (lift + shadow).

**Step 2: Integrate into index.astro**

Import as `<CrateCarousel client:visible />` between hero and archive sections. Pass mix data from content collection.

**Step 3: Verify**

Check: Horizontal scroll works on desktop (drag + arrows) and mobile (swipe). Scroll snaps to sleeve edges. Hover lifts card with warm glow.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: horizontal crate carousel with scroll-snap"
```

---

### Task 5: Archive List (Dense Editorial)

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Restyle archive section with Tailwind**

Keep the existing structure (grouped by year, sticky year labels) but restyle:
- Warm border color `border-[#2A2420]`
- Year labels in JetBrains Mono, muted stone color
- Row hover: warm left border + subtle background shift
- Small gradient swatch per mix (existing, keep)
- Playfair Display for mix titles in the list
- Genre pills in teal (`#4A7B7C`) instead of orange

**Step 2: Verify responsiveness**

Check at 375px, 768px, 1024px, 1440px. Archive rows should be comfortable at all sizes.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: warm editorial archive list"
```

---

### Task 6: Player Bar Reskin

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (player section + script)

**Step 1: Restyle player bar**

Replace inline styles with Tailwind classes using new tokens:
- Glass background: `bg-[#0A0A0A]/85 backdrop-blur-[16px]`
- Warm amber border-top glow when active
- Amber accent for seek bar, play button hover
- Warm cream text for track title
- Muted stone for timestamps
- Keep all existing JS player logic (keyboard shortcuts, Media Session, Chromecast)

**Step 2: Verify player works**

Play a mix, check visual styling, test keyboard shortcuts (space, arrows, m).

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: warm glass player bar"
```

---

## Phase 3: Mix Detail Page

### Task 7: Mix Detail Redesign

**Files:**
- Modify: `src/pages/mix/[...slug].astro`

**Step 1: Rewrite mix detail layout**

Apply The Crate design system:
- Full-width generative cover art header with film grain overlay
- Back link: "← Back to crate" in muted stone
- Title in Playfair Display 2.4rem
- Stats in JetBrains Mono with amber values
- Genre pills in teal
- Waveform: update `progressColor` to amber `#D4A574`, `cursorColor` to cream
- Tracklist: warm left-border active state in amber
- Liner notes: Inter body text in warm cream, section headings in Playfair
- All styled with Tailwind, no inline `<style>` block

**Step 2: Handle sparse data**

For unanalyzed mixes (bpm=0, trackCount=0):
- Show: cover art, title, date, duration, file size
- Completely omit: BPM stat, Key stat, Track count stat, genre pills, tracklist section
- No "coming soon" text, no dashed borders, no empty states — sections just don't exist

**Step 3: Verify with analyzed mix (mix-01) and unanalyzed mix**

```bash
npm run dev
```

Navigate to both types. Analyzed should show full detail. Unanalyzed should show clean minimal page with cover + title + duration.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: mix detail page with warm editorial design"
```

---

## Phase 4: Navigation + Footer + Polish

### Task 8: Nav and Footer

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Step 1: Restyle nav**

- "Luke's Mixes" in Playfair Display 700, amber color
- "Archive" link in muted stone, hover → warm cream
- Warm border-bottom
- Clean, minimal — no extra links

**Step 2: Restyle footer**

- Muted stone text
- Patreon link in amber
- Warm border-top

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: warm nav and footer"
```

---

### Task 9: Responsive Polish + Accessibility

**Files:**
- All modified files from previous tasks

**Step 1: Test at all breakpoints**

375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop).

Fix issues:
- Crate carousel: ensure touch scroll works, sleeves resize appropriately
- Player bar: compact mode on mobile (existing responsive logic, verify with new styles)
- Archive: readable on mobile, no horizontal overflow

**Step 2: Accessibility audit**

- All interactive elements have `cursor-pointer`
- Focus states visible (amber outline)
- `aria-label` on all icon buttons
- `prefers-reduced-motion`: disable all Framer Motion animations, instant transitions
- Color contrast: warm cream on near-black passes 4.5:1 (verify)
- Tab order follows visual order

**Step 3: Commit**

```bash
git add -A && git commit -m "fix: responsive polish and accessibility"
```

---

### Task 10: Build + Deploy

**Step 1: Production build**

```bash
cd C:/AI/Projects/Personal/dj-mix-archive/site
npm run build
```

Expected: Clean build, no errors.

**Step 2: Preview locally**

```bash
npm run preview
```

Smoke test: homepage loads, crate scrolls, play a mix, navigate to detail page, check mobile.

**Step 3: Deploy**

```bash
npx wrangler pages deploy dist/ --project-name luke-dj-mixes
```

**Step 4: Verify live site**

Check https://luke-dj-mixes.pages.dev/

**Step 5: Commit any final fixes**

```bash
git add -A && git commit -m "chore: production build and deploy"
git push
```

---

## Phase Review Gates

- **After Phase 1 (Tasks 1-2):** Run `/pr-review-toolkit:review-pr` — verify Tailwind + React integration is clean
- **After Phase 2 (Tasks 3-6):** Run `/pr-review-toolkit:review-pr` — verify homepage components, player, carousel
- **After Phase 3 (Task 7):** Run `/pr-review-toolkit:review-pr` — verify mix detail page, sparse data handling
- **After Phase 4 (Tasks 8-10):** Run `/pr-review-toolkit:review-pr all parallel` — full review before deploy
