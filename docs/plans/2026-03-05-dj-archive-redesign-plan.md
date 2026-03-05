# DJ Mix Archive Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the DJ mix archive from a simple listing into a premium "Music Tool" listening platform with generative art, glassmorphism player, energy-mapped waveforms, and clickable tracklists.

**Architecture:** Incremental refactor of 3 existing Astro files (BaseLayout, index, [...slug]) plus one new utility. No new dependencies — pure CSS + vanilla JS enhancements on top of existing Astro 5 + wavesurfer.js stack.

**Tech Stack:** Astro 5.17.1, wavesurfer.js 7.12.1, CSS (container queries, `:has()`, `color-mix()`, `@property`), HTML5 Audio API, Media Session API

**Design Doc:** `docs/plans/2026-03-05-dj-archive-redesign-design.md`

---

## Phase 1: Generative Gradient Utility + CSS Foundation

### Task 1: Create generative gradient utility

**Files:**
- Create: `site/src/utils/mix-gradient.ts`

**Step 1: Write the gradient generation function**

This function takes mix frontmatter data and returns a deterministic CSS gradient string. Unanalyzed mixes (bpm=0) get a neutral fallback.

```typescript
// Deterministic gradient from mix data
// BPM maps to hue base, musicalKey maps to angle, primaryGenre maps to saturation/lightness

const KEY_ANGLES: Record<string, number> = {
  'C': 0, 'C#': 30, 'Db': 30, 'D': 60, 'D#': 90, 'Eb': 90,
  'E': 120, 'F': 150, 'F#': 180, 'Gb': 180, 'G': 210,
  'G#': 240, 'Ab': 240, 'A': 270, 'A#': 300, 'Bb': 300, 'B': 330,
  '?': 135,
};

const GENRE_PALETTES: Record<string, { sat: number; lit: number }> = {
  'Dance': { sat: 80, lit: 55 },
  'Electronic': { sat: 70, lit: 45 },
  'House': { sat: 75, lit: 50 },
  'Techno': { sat: 60, lit: 40 },
  'Trance': { sat: 85, lit: 50 },
  'Pop': { sat: 90, lit: 60 },
  'Hip-Hop/Rap': { sat: 65, lit: 45 },
  'R&B/Soul': { sat: 75, lit: 50 },
  'Alternative': { sat: 55, lit: 50 },
  'Electronica': { sat: 65, lit: 48 },
  'Soundtrack': { sat: 40, lit: 40 },
};

const DEFAULT_PALETTE = { sat: 60, lit: 50 };

interface MixData {
  bpm: number;
  musicalKey: string;
  genres: Array<{ name: string; count: number; percent: number }>;
  mixNumber: number;
}

export function getMixGradient(data: MixData): string {
  const isAnalyzed = data.bpm > 0;

  if (!isAnalyzed) {
    // Neutral gradient for unanalyzed mixes — use mixNumber for slight variation
    const hue = (data.mixNumber * 37) % 360;
    return `linear-gradient(135deg, hsl(${hue} 15% 18%), hsl(${hue} 10% 12%))`;
  }

  // BPM to hue (100-160 BPM maps to 0-360 hue range)
  const hue = ((data.bpm - 100) * 6) % 360;
  const hue2 = (hue + 40) % 360;

  // Key to gradient angle
  const keyBase = data.musicalKey.replace(/\s*(major|minor|m)$/i, '').trim();
  const angle = KEY_ANGLES[keyBase] ?? 135;

  // Primary genre to saturation/lightness
  const primaryGenre = data.genres[0]?.name ?? 'Mixed';
  const palette = GENRE_PALETTES[primaryGenre] ?? DEFAULT_PALETTE;

  return `linear-gradient(${angle}deg, hsl(${hue} ${palette.sat}% ${palette.lit}%), hsl(${hue2} ${palette.sat - 15}% ${palette.lit - 10}%))`;
}

export function getMixGradientMini(data: MixData): string {
  // Same logic but darker for small cards
  const isAnalyzed = data.bpm > 0;

  if (!isAnalyzed) {
    const hue = (data.mixNumber * 37) % 360;
    return `linear-gradient(135deg, hsl(${hue} 12% 14%), hsl(${hue} 8% 10%))`;
  }

  const hue = ((data.bpm - 100) * 6) % 360;
  const hue2 = (hue + 40) % 360;
  const keyBase = data.musicalKey.replace(/\s*(major|minor|m)$/i, '').trim();
  const angle = KEY_ANGLES[keyBase] ?? 135;
  const primaryGenre = data.genres[0]?.name ?? 'Mixed';
  const palette = GENRE_PALETTES[primaryGenre] ?? DEFAULT_PALETTE;

  return `linear-gradient(${angle}deg, hsl(${hue} ${palette.sat - 10}% ${palette.lit - 15}%), hsl(${hue2} ${palette.sat - 25}% ${palette.lit - 25}%))`;
}

export function isAnalyzed(data: MixData): boolean {
  return data.bpm > 0 && data.trackCount > 0;
}
```

**Step 2: Verify it builds**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run build 2>&1 | head -20`
Expected: Build succeeds (utility is importable but not yet used)

**Step 3: Commit**

```bash
git add src/utils/mix-gradient.ts
git commit -m "feat: add deterministic gradient generator from mix data"
```

---

### Task 2: Update CSS design system in BaseLayout

**Files:**
- Modify: `site/src/layouts/BaseLayout.astro` (lines 93-436, the `<style is:global>` block)

**Step 1: Add new CSS custom properties and glassmorphism tokens**

Add these properties inside the existing `:root` block (after line 113):

```css
    /* Glassmorphism */
    --glass-bg: rgba(28, 25, 23, 0.75);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-blur: 16px;

    /* Spacing */
    --player-height: 80px;
    --player-height-mobile: 64px;

    /* Transitions */
    --ease-out: cubic-bezier(0.2, 0, 0.2, 1);
```

**Step 2: Add `@property` registration for animatable gradients**

Add before the `:root` block:

```css
  @property --gradient-hue {
    syntax: '<number>';
    inherits: false;
    initial-value: 0;
  }
```

**Step 3: Add reduced motion and container query setup**

Add after the existing responsive section:

```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
```

**Step 4: Verify build**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add glassmorphism tokens, @property, reduced motion to CSS system"
```

---

## Phase 2: Player Bar Redesign

### Task 3: Redesign player bar HTML + CSS (glassmorphism, enhanced layout)

**Files:**
- Modify: `site/src/layouts/BaseLayout.astro` (lines 63-85 for HTML, lines 239-435 for CSS)

**Step 1: Replace player HTML structure**

Replace lines 63-85 with enhanced player that includes:
- `.player-gradient-thumb` — 24x24 rounded square showing mix gradient
- `.player-text` — mix title + current track name
- Transport controls (unchanged buttons)
- `.progress-bar-container` with range input
- `.volume-control` with mute button + range slider
- Cast button (existing)

```html
    <div id="player-bar" transition:persist>
      <div class="player-inner">
        <div class="player-info">
          <div class="player-gradient-thumb" id="player-thumb"></div>
          <div class="player-text">
            <span id="player-title">No mix loaded</span>
            <span id="player-track" class="player-track-name"></span>
          </div>
        </div>
        <div class="player-controls">
          <button id="player-prev" aria-label="Seek back 30 seconds" disabled>&laquo;</button>
          <button id="player-play" aria-label="Play" disabled>&#9654;</button>
          <button id="player-next" aria-label="Seek forward 30 seconds" disabled>&raquo;</button>
        </div>
        <div class="player-progress">
          <span id="player-current">0:00</span>
          <div class="progress-bar-container">
            <input type="range" id="player-seek" min="0" max="100" value="0" step="0.1" disabled aria-label="Seek position" />
          </div>
          <span id="player-duration">0:00</span>
        </div>
        <div class="player-extras">
          <div class="volume-control">
            <button id="player-mute" aria-label="Mute">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            </button>
            <input type="range" id="player-volume" min="0" max="100" value="100" aria-label="Volume" />
          </div>
          <button id="player-cast" aria-label="Cast to device" title="Cast to device" style="display:none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
      <audio id="audio-element" preload="none"></audio>
    </div>
```

**Step 2: Replace player CSS**

Replace the `#player-bar` CSS section (lines 239-435) with glassmorphism design:
- `backdrop-filter: blur(var(--glass-blur))` on `#player-bar`
- `background: var(--glass-bg)` instead of solid `--player-bg`
- `border-top: 1px solid var(--glass-border)`
- New `.player-gradient-thumb` (24x24 rounded square)
- New `.player-track-name` for current track display
- New `.volume-control` with slider
- Mobile: collapse to mini bar with just play/title/progress

**Step 3: Verify build and visual check**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run build`

**Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: glassmorphism player bar with volume, track display, gradient thumb"
```

---

### Task 4: Add keyboard shortcuts and current track detection to player JS

**Files:**
- Modify: `site/src/layouts/BaseLayout.astro` (lines 438-580, the `<script>` block)

**Step 1: Enhance `loadMix()` to accept track data and gradient**

Update the `window.loadMix` function to store track data for current track detection and set the gradient thumbnail.

**Step 2: Add current track detection in timeupdate**

Inside the `timeupdate` listener, detect which track is currently playing based on timestamp boundaries and update `#player-track`.

**Step 3: Add keyboard shortcut handler**

Handle Space (play/pause), Left/Right (seek 10s), Up/Down (volume 10%), M (mute). Skip when focus is in an input field.

**Step 4: Add volume control wiring**

Wire up `#player-volume` range input and `#player-mute` button to `audio.volume` and `audio.muted`.

**Step 5: Verify build**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run build`

**Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: keyboard shortcuts, volume control, current track display in player"
```

**Step 7: Review**

Run: `/pr-review-toolkit:review-pr code errors` and fix any findings before proceeding to Phase 3.

---

## Phase 3: Homepage Redesign

### Task 5: Rewrite homepage — The Crate + The Wall

**Files:**
- Modify: `site/src/pages/index.astro` (complete rewrite)

**Step 1: Rewrite the frontmatter and imports**

Import `getMixGradient`, `getMixGradientMini`, `isAnalyzed` from the utility. Sort mixes, take top 6 for featured. Group remaining by year using `Map<string, mixes[]>`.

**Step 2: Write The Crate (featured section)**

6 large cards with generative gradient backgrounds. Each card shows:
- Gradient art area with mix number overlay
- "Processing" badge for unanalyzed mixes
- Play button on hover
- Title, duration, BPM (if analyzed), genre pills (if analyzed)

**Step 3: Write The Wall (archive grid grouped by year)**

Remaining mixes in a responsive grid, grouped by year with sticky year headers. Smaller cards with mini gradients. Show primary genre pill only.

**Step 4: Write the scoped CSS**

- `.crate-grid`: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- `.crate-card-art`: `aspect-ratio: 16/10` with gradient background
- `.wall-grid`: `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`
- `.year-header`: sticky, uppercase, small
- `.processing-badge`: orange-outlined pill
- Hero: simplified text-only (remove spinning vinyl)
- Mobile: crate becomes horizontal scroll-snap, wall becomes 2-col then 1-col

**Step 5: Verify build and visual check**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run dev`

**Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: redesign homepage with The Crate + The Wall, generative gradients, year groups"
```

---

## Phase 4: Mix Detail Page Redesign

### Task 6: Energy Map waveform with color gradient

**Files:**
- Modify: `site/src/pages/mix/[...slug].astro` (the `<script>` block)

**Step 1: Update WaveSurfer config for energy-mapped colors**

Create a canvas gradient function that maps peak amplitude to color:
- Low energy peaks: cool blues/purples (hue ~240)
- High energy peaks: warm oranges/reds (hue ~40)

Pass the gradient as `waveColor` to WaveSurfer.create(). Increase height from 64 to 80.

**Step 2: Verify build**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run build`

**Step 3: Commit**

```bash
git add "src/pages/mix/[...slug].astro"
git commit -m "feat: energy-mapped waveform colors (cool to warm gradient)"
```

---

### Task 7: Clickable tracklist with seek + enhanced stats bar

**Files:**
- Modify: `site/src/pages/mix/[...slug].astro` (HTML + CSS)

**Step 1: Parse track data from markdown content**

In the Astro frontmatter, use regex to extract track listings from the markdown body. Parse timestamps to seconds for seek functionality.

**Step 2: Replace the mix page HTML with enhanced layout**

- Gradient header bar behind the title
- Conditional stats bar (only show BPM/Key/Tracks if analyzed)
- Interactive tracklist: each track is a button that seeks audio
- Empty state for unanalyzed mixes: "Full analysis coming soon"
- Pass gradient and tracks to `loadMix()`

**Step 3: Add tracklist seek function and active track highlighting**

- `seekToTrack()` function: seeks audio or starts mix then seeks
- `updateActiveTrack()`: highlights current track row during playback via `timeupdate`

**Step 4: Write the enhanced CSS**

- `.mix-header-gradient`: full-width gradient behind title, fades to bg
- `.track-row`: flex row, hover accent border, `.active` state with glow
- `.track-num`, `.track-time`: mono font, muted
- `.empty-tracklist`: centered message in bordered box

**Step 5: Verify build and visual check**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run dev`

**Step 6: Commit**

```bash
git add "src/pages/mix/[...slug].astro"
git commit -m "feat: clickable tracklist, gradient header, empty states on detail page"
```

**Step 7: Review**

Run: `/pr-review-toolkit:review-pr code errors` and fix any findings before proceeding to Phase 5.

---

## Phase 5: Polish + Accessibility + Responsive

### Task 8: Mobile responsive refinements

**Files:**
- Modify: `site/src/layouts/BaseLayout.astro` (CSS responsive section)
- Modify: `site/src/pages/index.astro` (CSS responsive section)
- Modify: `site/src/pages/mix/[...slug].astro` (CSS responsive section)

**Step 1: Add mobile player styles**

Player height reduces, hide volume control, hide gradient thumb, truncate track name. All touch targets minimum 44px.

**Step 2: Add homepage mobile styles**

The Crate: horizontal scroll with scroll-snap on < 640px. The Wall: 2-col on 480-768px, 1-col below 480px.

**Step 3: Add detail page mobile styles**

Smaller gradient header, wrapped stats bar, hide genre column in tracklist, compact track rows, smaller waveform.

**Step 4: Verify on mobile viewport**

Check in Chrome DevTools at 375px, 768px, 1200px widths.

**Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro "src/pages/mix/[...slug].astro"
git commit -m "feat: mobile-first responsive design across all pages"
```

---

### Task 9: Accessibility pass

**Files:**
- Modify: `site/src/layouts/BaseLayout.astro`
- Modify: `site/src/pages/index.astro`
- Modify: `site/src/pages/mix/[...slug].astro`

**Step 1: Add ARIA live region for now-playing**

Add visually hidden live region. Update `loadMix()` to announce track changes. Add `.sr-only` utility class.

**Step 2: Add focus-visible styles**

Custom `:focus-visible` outline using accent color. Button focus ring with box-shadow.

**Step 3: Ensure all interactive elements have proper ARIA**

Tracklist buttons get descriptive `aria-label`. Play button updates `aria-label` on state change.

**Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro "src/pages/mix/[...slug].astro"
git commit -m "feat: accessibility — ARIA live regions, focus styles, screen reader support"
```

---

### Task 10: Final review + deploy verification

**Step 1: Full build test**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run build 2>&1`
Expected: Clean build, no warnings

**Step 2: Run comprehensive code review**

Run: `/pr-review-toolkit:review-pr all parallel`
Fix any findings.

**Step 3: Visual verification with Chrome**

Use claude-in-chrome to check:
1. Homepage (The Crate + The Wall rendering)
2. Analyzed mix detail page (Mix 01)
3. Unanalyzed mix detail page (Mix 46)
4. Player bar interaction
5. Mobile viewport (375px)

**Step 4: Deploy**

Run: `cd "C:\AI\Projects\Personal\dj-mix-archive\site" && npm run build`
Site deploys automatically to Cloudflare Pages on push.

---

## Reference: Key file paths

| File | Purpose |
|------|---------|
| `site/src/utils/mix-gradient.ts` | NEW — generative gradient utility |
| `site/src/layouts/BaseLayout.astro` | Layout, global CSS, player bar HTML/CSS/JS |
| `site/src/pages/index.astro` | Homepage (The Crate + The Wall) |
| `site/src/pages/mix/[...slug].astro` | Mix detail page (Energy Map + tracklist) |
| `site/src/content.config.ts` | Content schema (no changes needed) |
| `site/astro.config.mjs` | Astro config (no changes needed) |

## Reference: context7 docs to consult

When implementing, use the context7 MCP to look up:
- **Astro 5** — `transition:persist`, View Transitions, Content Collections, scoped styles
- **wavesurfer.js** — `create()` options, gradient waveColor, events API

## Phase 2 (Future — PWA)

Not in this plan. After the UI redesign is live and stable:
- Add `manifest.json` for PWA
- Add service worker for offline audio caching
- Add `theme-color` meta tag
