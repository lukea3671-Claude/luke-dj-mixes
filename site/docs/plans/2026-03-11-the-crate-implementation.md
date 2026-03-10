# The Crate v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the DJ Mix Archive with all 5 design tools (shadcn/ui, Magic UI, Aceternity UI, Stitch, Nano Banana) across 4 pages.

**Architecture:** Astro 5 SSG with React islands. Every interactive component (Magic UI, Aceternity) runs as a React island with `client:visible`. Static layout stays in Astro templates. Design tokens already defined in `global.css`. Player bar is PROTECTED — never modify.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4, motion (Framer Motion v12+), shadcn/ui, Magic UI, Aceternity UI, WaveSurfer.js

**Design doc:** `docs/plans/2026-03-11-the-crate-design.md`

**Data shape:** 46 mixes in `src/content/mixes/`. Schema: title, mixNumber, date, duration, bpm, musicalKey, trackCount, genres[], audioFile (R2 URL), peaksFile, fileSizeMb, energyMean, energyMax. Analyzed mixes: bpm > 0 && trackCount > 0. Unanalyzed: bpm=0, trackCount=0, genres=[{name:"Mixed"}].

---

## Phase 1: Foundation — Install All Component Libraries

### Task 1: Install dependencies and shared utilities

**Files:**
- Modify: `package.json`
- Create: `src/lib/utils.ts`
- Create: `components.json` (shadcn config)

**Step 1: Install base dependencies**

```bash
cd C:/AI/Projects/Personal/dj-mix-archive/site
npm install motion clsx tailwind-merge @tabler/icons-react
```

Note: `motion` is the v12+ package name for Framer Motion. Aceternity components import from `motion`. The existing `framer-motion` dep can coexist but new code should import from `motion`.

**Step 2: Create cn utility**

Create `src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Initialize shadcn for Astro**

```bash
npx shadcn@latest init
```

When prompted:
- Style: New York
- Base color: Neutral
- CSS file: src/styles/global.css
- CSS variables: yes
- Components alias: @/components
- Utils alias: @/lib/utils
- React Server Components: NO (Astro, not Next.js)

If the CLI fails or prompts oddly for Astro + Tailwind v4, manually create `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/global.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}
```

And add path aliases to `tsconfig.json` (if not already present):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 4: Install shadcn foundation components**

```bash
npx shadcn@latest add button input card tabs
```

**Step 5: Install Magic UI components**

```bash
npx shadcn@latest add "https://magicui.design/r/magic-card"
npx shadcn@latest add "https://magicui.design/r/border-beam"
npx shadcn@latest add "https://magicui.design/r/marquee"
npx shadcn@latest add "https://magicui.design/r/neon-gradient-card"
npx shadcn@latest add "https://magicui.design/r/number-ticker"
npx shadcn@latest add "https://magicui.design/r/text-animate"
npx shadcn@latest add "https://magicui.design/r/particles"
npx shadcn@latest add "https://magicui.design/r/scroll-progress"
```

**Step 6: Install Aceternity UI components**

```bash
npx shadcn@latest add "https://ui.aceternity.com/registry/focus-cards.json"
npx shadcn@latest add "https://ui.aceternity.com/registry/bento-grid.json"
npx shadcn@latest add "https://ui.aceternity.com/registry/timeline.json"
npx shadcn@latest add "https://ui.aceternity.com/registry/tabs.json"
npx shadcn@latest add "https://ui.aceternity.com/registry/text-generate-effect.json"
```

**Step 7: Fix component imports for Astro**

After install, audit each component file in `src/components/ui/` or `src/components/magicui/` or `src/components/aceternity/`:
- Remove any `"use client"` directives (Astro handles this via `client:visible`)
- Replace `import { useTheme } from "next-themes"` with hardcoded dark mode values
- Ensure imports use `@/lib/utils` which maps to our `cn` function
- Change any `framer-motion` imports to `motion` (or verify they already use `motion`)

**Step 8: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Components exist in `src/components/`. No import errors.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: install shadcn, Magic UI, and Aceternity component libraries"
```

---

## Phase 2: Home Page — Full Rebuild with Component Libraries

### Task 2: Global effects — Particles + ScrollProgress in BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/components/AmbientParticles.tsx`
- Create: `src/components/TopScrollProgress.tsx`

**Step 1: Create AmbientParticles React island**

`src/components/AmbientParticles.tsx`:
```tsx
import { Particles } from "@/components/magicui/particles";

export default function AmbientParticles() {
  return (
    <Particles
      className="fixed inset-0 z-0 pointer-events-none"
      quantity={30}
      color="#D4A574"
      size={0.3}
      staticity={60}
      ease={80}
    />
  );
}
```

**Step 2: Create TopScrollProgress React island**

`src/components/TopScrollProgress.tsx`:
```tsx
import { ScrollProgress } from "@/components/magicui/scroll-progress";

export default function TopScrollProgress() {
  return <ScrollProgress className="top-0 z-50" />;
}
```

**Step 3: Add to BaseLayout.astro**

In `BaseLayout.astro`, after `<FilmGrain />` and before `<header>`:
```astro
---
import AmbientParticles from '../components/AmbientParticles.tsx';
import TopScrollProgress from '../components/TopScrollProgress.tsx';
---
...
<body>
  <FilmGrain />
  <AmbientParticles client:idle />
  <TopScrollProgress client:idle />
  <header>
  ...
```

**Step 4: Verify**

```bash
npm run dev
```

Check: Subtle warm amber particles floating. Amber scroll progress bar at page top.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add ambient particles and scroll progress"
```

---

### Task 3: Hero — NeonGradientCard + TextAnimate + BorderBeam

**Files:**
- Create: `src/components/HeroFeatured.tsx`
- Modify: `src/pages/index.astro`

**Step 1: Create HeroFeatured React island**

`src/components/HeroFeatured.tsx`:
```tsx
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { TextAnimate } from "@/components/magicui/text-animate";
import { BorderBeam } from "@/components/magicui/border-beam";

interface Props {
  title: string;
  mixNumber: number;
  date: string;
  duration: string;
  bpm: number;
  isAnalyzed: boolean;
  gradient: string;
  audioFile: string;
  slug: string;
}

declare global {
  interface Window {
    loadMix: (url: string, title: string, gradient?: string) => void;
  }
}

export default function HeroFeatured({
  title, mixNumber, date, duration, bpm, isAnalyzed, gradient, audioFile, slug
}: Props) {
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.loadMix(audioFile, title, gradient);
  };

  return (
    <section className="w-[100vw] relative left-1/2 -ml-[50vw] -mt-8">
      <a href={`/mix/${slug}/`} className="block no-underline">
        <NeonGradientCard
          className="rounded-none border-0 min-h-[60vh] max-h-[600px]"
          borderRadius={0}
          borderSize={3}
          neonColors={{ firstColor: "#D4A574", secondColor: "#4A7B7C" }}
        >
          {/* Background gradient */}
          <div
            className="absolute inset-0"
            style={{ background: gradient }}
          />
          {/* Film grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px',
            }}
          />
          {/* Light leak */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 70% 30%, rgba(212, 165, 116, 0.08) 0%, transparent 60%)',
          }} />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10, 10, 10, 0.7) 40%, transparent 100%), linear-gradient(to right, rgba(10, 10, 10, 0.3) 0%, transparent 50%)',
          }} />
          {/* Ghost mix number */}
          <span className="absolute right-8 top-1/2 -translate-y-1/2 font-heading text-[16rem] font-bold text-white/[0.03] select-none pointer-events-none leading-none tracking-[-0.06em] z-[1] max-sm:text-[8rem] max-sm:right-4">
            #{String(mixNumber).padStart(2, '0')}
          </span>
          {/* Content */}
          <div className="relative z-[2] w-full max-w-[1200px] mx-auto px-8 pb-12 pt-32 flex items-end justify-between min-h-[60vh] max-h-[600px] max-sm:px-5 max-sm:pb-8 max-sm:pt-20 max-sm:min-h-[350px]">
            <div className="max-w-[700px]">
              <span className="inline-block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber mb-4 opacity-80">
                Latest Mix
              </span>
              <TextAnimate
                animation="blurInUp"
                by="word"
                as="h1"
                className="font-heading text-[2.4rem] font-semibold tracking-[-0.03em] leading-[1.1] mb-3 text-warm-cream max-sm:text-[1.6rem]"
              >
                {title}
              </TextAnimate>
              <div className="flex items-center gap-2.5 font-mono text-[0.8rem] text-muted-stone">
                <span>{duration}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-muted-stone opacity-50" />
                <span>{date}</span>
                {isAnalyzed && (
                  <>
                    <span className="w-[3px] h-[3px] rounded-full bg-muted-stone opacity-50" />
                    <span>{bpm} BPM</span>
                  </>
                )}
              </div>
            </div>
            {/* Play button with BorderBeam */}
            <div className="relative flex-shrink-0">
              <button
                className="w-16 h-16 rounded-full border-2 border-amber/30 bg-amber/90 text-base flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.08] hover:bg-amber hover:border-amber/50 max-sm:w-[52px] max-sm:h-[52px]"
                style={{
                  color: '#0A0A0A',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 60px rgba(212,165,116,0.15)',
                }}
                aria-label={`Play ${title}`}
                onClick={handlePlay}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-[3px] max-sm:w-5 max-sm:h-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <BorderBeam
                duration={8}
                size={60}
                className="from-transparent via-amber to-transparent rounded-full"
              />
            </div>
          </div>
        </NeonGradientCard>
      </a>
    </section>
  );
}
```

**Step 2: Update index.astro**

Replace the hero `<section class="hero-sleeve">` block with:
```astro
---
import HeroFeatured from '../components/HeroFeatured.tsx';
---
...
<HeroFeatured
  client:load
  title={latest.data.title}
  mixNumber={latest.data.mixNumber}
  date={latest.data.date}
  duration={latest.data.duration}
  bpm={latest.data.bpm}
  isAnalyzed={latestAnalyzed}
  gradient={latestGradient}
  audioFile={latest.data.audioFile}
  slug={latest.id.replace(/\.md$/, '')}
/>
```

Remove all the hero CSS from the `<style>` block (`.hero-sleeve` through `.hero-play svg`).

**Step 3: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: hero with NeonGradientCard, TextAnimate, BorderBeam"
```

---

### Task 4: Crate Carousel — MagicCard hover on sleeves

**Files:**
- Modify: `src/components/CrateCarousel.tsx`

**Step 1: Add MagicCard to each sleeve**

Update `CrateCarousel.tsx` to wrap each sleeve's gradient div with `MagicCard`:

```tsx
import { MagicCard } from "@/components/magicui/magic-card";
```

Replace the inner `<motion.div>` (the square sleeve) with:
```tsx
<MagicCard
  className="relative w-[220px] h-[220px] rounded-lg overflow-hidden sm:w-[240px] sm:h-[240px] border border-border-warm"
  gradientColor="rgba(212, 165, 116, 0.08)"
>
  {/* existing content: ghost number + play button */}
</MagicCard>
```

Keep the outer `<motion.a>` for the hover lift animation. The MagicCard adds the spotlight cursor-follow effect on top.

**Step 2: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: MagicCard spotlight on crate sleeves"
```

---

### Task 5: Genre Marquee strip

**Files:**
- Create: `src/components/GenreMarquee.tsx`
- Modify: `src/pages/index.astro`

**Step 1: Create GenreMarquee component**

`src/components/GenreMarquee.tsx`:
```tsx
import { Marquee } from "@/components/magicui/marquee";

interface Props {
  genres: string[];
}

export default function GenreMarquee({ genres }: Props) {
  return (
    <div className="relative py-4 overflow-hidden">
      <Marquee pauseOnHover className="[--duration:30s] [--gap:0.75rem]">
        {genres.map((genre, i) => (
          <span
            key={`${genre}-${i}`}
            className="inline-block text-[0.7rem] px-3 py-1 rounded-[10px] font-medium whitespace-nowrap"
            style={{
              background: 'rgba(74, 123, 124, 0.12)',
              color: '#4A7B7C',
              border: '1px solid rgba(74, 123, 124, 0.25)',
            }}
          >
            {genre}
          </span>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-base" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-base" />
    </div>
  );
}
```

**Step 2: Add to index.astro**

Between the crate carousel and archive sections:
```astro
---
import GenreMarquee from '../components/GenreMarquee.tsx';

// Collect all unique genres across all mixes
const allGenres = [...new Set(
  mixes.flatMap(m => m.data.genres.filter(g => g.name !== 'Mixed').map(g => g.name))
)];
---
...
<GenreMarquee client:visible genres={allGenres} />
```

**Step 3: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: genre marquee strip"
```

---

### Task 6: Stats bar with NumberTicker

**Files:**
- Create: `src/components/StatsBar.tsx`
- Modify: `src/pages/index.astro`

**Step 1: Create StatsBar component**

`src/components/StatsBar.tsx`:
```tsx
import { NumberTicker } from "@/components/magicui/number-ticker";

interface Props {
  totalMixes: number;
  totalTracks: number;
  totalHours: number;
  yearsActive: number;
}

export default function StatsBar({ totalMixes, totalTracks, totalHours, yearsActive }: Props) {
  return (
    <div className="flex justify-center gap-8 sm:gap-16 py-6 my-4 border-y border-border-warm">
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={totalMixes} />
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Mixes</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={totalHours} />
          <span className="text-lg">h</span>
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Hours</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={totalTracks} />
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Tracks</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={yearsActive} />
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Years</div>
      </div>
    </div>
  );
}
```

**Step 2: Add to index.astro**

Compute stats in frontmatter:
```astro
---
import StatsBar from '../components/StatsBar.tsx';

const totalMixes = mixes.length;
const totalTracks = mixes.reduce((sum, m) => sum + m.data.trackCount, 0);
// Parse durations like "1h 43m" or "3h 45m"
const totalMinutes = mixes.reduce((sum, m) => {
  const match = m.data.duration.match(/(\d+)h\s*(\d+)m/);
  return sum + (match ? Number(match[1]) * 60 + Number(match[2]) : 0);
}, 0);
const totalHours = Math.round(totalMinutes / 60);
const yearsActive = new Date().getFullYear() - 2018;
---
```

Place after genre marquee:
```astro
<StatsBar client:visible totalMixes={totalMixes} totalTracks={totalTracks} totalHours={totalHours} yearsActive={yearsActive} />
```

**Step 3: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: stats bar with NumberTicker"
```

---

### Task 7: Archive — Focus Cards

**Files:**
- Create: `src/components/ArchiveFocusCards.tsx`
- Modify: `src/pages/index.astro`

**Step 1: Create ArchiveFocusCards component**

This replaces the plain archive rows with Aceternity's FocusCards — hover one mix, rest blur.

`src/components/ArchiveFocusCards.tsx`:
```tsx
import { useState } from "react";

interface MixItem {
  slug: string;
  title: string;
  mixNumber: number;
  gradient: string;
  duration: string;
  bpm: number;
  isAnalyzed: boolean;
  genre: string;
  year: string;
}

interface Props {
  mixes: MixItem[];
  years: string[];
}

export default function ArchiveFocusCards({ mixes, years }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="mb-8 mt-4" id="archive">
      <h2 className="text-[0.8rem] uppercase tracking-[0.12em] text-muted-stone pb-3 border-b border-border-warm mb-6 font-body">
        Archive
      </h2>
      {years.map((year) => {
        const yearMixes = mixes.filter((m) => m.year === year);
        if (yearMixes.length === 0) return null;
        return (
          <div key={year} className="mb-8">
            <h3 className="font-mono text-[0.7rem] text-muted-stone uppercase tracking-[0.15em] opacity-50 mb-2 sticky top-0 bg-base py-1.5 z-10">
              {year}
            </h3>
            <div className="flex flex-col gap-px bg-border-warm rounded-md overflow-hidden">
              {yearMixes.map((mix) => (
                <a
                  key={mix.slug}
                  href={`/mix/${mix.slug}/`}
                  className="flex items-center gap-3 px-3.5 py-2.5 bg-surface no-underline text-warm-cream transition-all duration-200 border-l-2 border-transparent hover:bg-surface-hover hover:border-l-amber hover:pl-4"
                  style={{
                    opacity: hovered === null || hovered === mix.slug ? 1 : 0.4,
                    filter: hovered !== null && hovered !== mix.slug ? 'blur(1px)' : 'none',
                    transition: 'opacity 0.2s, filter 0.2s, background 0.15s, padding-left 0.15s',
                  }}
                  onMouseEnter={() => setHovered(mix.slug)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="w-8 h-8 rounded flex-shrink-0 sm:w-8 sm:h-8 max-sm:w-6 max-sm:h-6" style={{ background: mix.gradient }} />
                  <span className="font-mono text-[0.75rem] text-muted-stone w-10 flex-shrink-0 max-sm:hidden">
                    #{String(mix.mixNumber).padStart(2, '0')}
                  </span>
                  <span className="font-heading text-[0.85rem] font-semibold flex-1 truncate min-w-0">
                    {mix.title}
                  </span>
                  <span className="font-mono text-[0.7rem] text-muted-stone flex-shrink-0">
                    {mix.duration}
                  </span>
                  {mix.isAnalyzed && (
                    <span className="font-mono text-[0.7rem] text-muted-stone flex-shrink-0 max-sm:hidden">
                      {mix.bpm} BPM
                    </span>
                  )}
                  {mix.genre && mix.genre !== 'Mixed' && (
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-lg flex-shrink-0 hidden sm:inline-block"
                      style={{
                        background: 'rgba(74, 123, 124, 0.12)',
                        color: '#4A7B7C',
                        border: '1px solid rgba(74, 123, 124, 0.25)',
                      }}
                    >
                      {mix.genre}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
```

**Step 2: Update index.astro**

Replace the archive section with the new component. Pass preprocessed data:
```astro
---
import ArchiveFocusCards from '../components/ArchiveFocusCards.tsx';
import { getMixGradientMini, isAnalyzed } from '../utils/mix-gradient';

const archiveData = sorted.slice(1).map((mix) => ({
  slug: mix.id.replace(/\.md$/, ''),
  title: mix.data.title,
  mixNumber: mix.data.mixNumber,
  gradient: getMixGradientMini(mix.data),
  duration: mix.data.duration,
  bpm: mix.data.bpm,
  isAnalyzed: isAnalyzed(mix.data),
  genre: mix.data.genres[0]?.name || '',
  year: mix.data.date.split(' ').pop() || 'Unknown',
}));

const archiveYears = [...new Set(archiveData.map(m => m.year))].sort((a, b) => Number(b) - Number(a));
---
...
<ArchiveFocusCards client:visible mixes={archiveData} years={archiveYears} />
```

Remove the old archive `<section class="archive">` block and ALL archive CSS from the `<style>` block.

**Step 3: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: archive with focus-card blur effect"
```

---

## Phase 3: Collection Page (NEW)

### Task 8: Create Collection page with AnimatedTabs + BentoGrid + MagicCard

**Files:**
- Create: `src/pages/collection.astro`
- Create: `src/components/CollectionGrid.tsx`
- Modify: `src/layouts/BaseLayout.astro` (add nav link)

**Step 1: Create CollectionGrid React island**

`src/components/CollectionGrid.tsx`:
```tsx
import { useState, useMemo } from "react";
import { MagicCard } from "@/components/magicui/magic-card";
import { TextAnimate } from "@/components/magicui/text-animate";

interface MixItem {
  slug: string;
  title: string;
  mixNumber: number;
  gradient: string;
  duration: string;
  bpm: number;
  isAnalyzed: boolean;
  genres: string[];
  date: string;
}

interface Props {
  mixes: MixItem[];
  allGenres: string[];
}

declare global {
  interface Window {
    loadMix: (url: string, title: string, gradient?: string) => void;
  }
}

export default function CollectionGrid({ mixes, allGenres }: Props) {
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");

  const tabs = ["All", ...allGenres];

  const filtered = useMemo(() => {
    return mixes.filter((mix) => {
      const matchesGenre = activeGenre === "All" || mix.genres.includes(activeGenre);
      const matchesSearch = search === "" || mix.title.toLowerCase().includes(search.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [mixes, activeGenre, search]);

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search mixes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-surface border border-border-warm text-warm-cream font-body text-sm placeholder:text-muted-stone/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/30 transition-colors"
        />
      </div>

      {/* Genre tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveGenre(tab)}
            className="px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 cursor-pointer border"
            style={{
              background: activeGenre === tab ? 'rgba(212, 165, 116, 0.15)' : 'var(--surface)',
              color: activeGenre === tab ? '#D4A574' : '#8A7E72',
              borderColor: activeGenre === tab ? 'rgba(212, 165, 116, 0.3)' : 'var(--border)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((mix) => (
            <a key={mix.slug} href={`/mix/${mix.slug}/`} className="block no-underline group">
              <MagicCard
                className="rounded-lg overflow-hidden border border-border-warm h-full"
                gradientColor="rgba(212, 165, 116, 0.06)"
              >
                {/* Gradient square */}
                <div
                  className="aspect-square relative"
                  style={{ background: mix.gradient }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[3rem] sm:text-[4rem] font-heading font-bold text-white/[0.06] select-none pointer-events-none">
                    #{String(mix.mixNumber).padStart(2, '0')}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3 bg-surface">
                  <h3 className="font-heading text-[0.85rem] font-semibold text-warm-cream truncate leading-tight">
                    {mix.title}
                  </h3>
                  <p className="font-mono text-[0.7rem] text-muted-stone mt-1">
                    {mix.duration}
                    {mix.isAnalyzed && ` · ${mix.bpm} BPM`}
                  </p>
                  {mix.genres.length > 0 && mix.genres[0] !== 'Mixed' && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {mix.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="text-[0.6rem] px-1.5 py-0.5 rounded-md"
                          style={{
                            background: 'rgba(74, 123, 124, 0.12)',
                            color: '#4A7B7C',
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </MagicCard>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <TextAnimate animation="blurIn" className="text-muted-stone text-lg">
            No mixes found
          </TextAnimate>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create collection.astro page**

`src/pages/collection.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import CollectionGrid from '../components/CollectionGrid.tsx';
import { getMixGradient, isAnalyzed } from '../utils/mix-gradient';

const mixes = await getCollection('mixes');
const sorted = mixes.sort((a, b) => b.data.mixNumber - a.data.mixNumber);

const mixData = sorted.map((mix) => ({
  slug: mix.id.replace(/\.md$/, ''),
  title: mix.data.title,
  mixNumber: mix.data.mixNumber,
  gradient: getMixGradient(mix.data),
  duration: mix.data.duration,
  bpm: mix.data.bpm,
  isAnalyzed: isAnalyzed(mix.data),
  genres: mix.data.genres.filter(g => g.name !== 'Mixed').map(g => g.name),
  date: mix.data.date,
}));

const allGenres = [...new Set(
  mixes.flatMap(m => m.data.genres.filter(g => g.name !== 'Mixed').map(g => g.name))
)].sort();
---

<BaseLayout title="Collection — Luke's Mixes">
  <div class="max-w-[1200px] mx-auto">
    <h1 class="font-heading text-3xl font-bold text-warm-cream mb-2">Collection</h1>
    <p class="text-muted-stone text-sm mb-8">All {sorted.length} mixes, filterable by genre.</p>
    <CollectionGrid client:load mixes={mixData} allGenres={allGenres} />
  </div>
</BaseLayout>
```

**Step 3: Add nav link in BaseLayout.astro**

In the `<nav>` `<div class="nav-links">`, add:
```html
<a href="/collection">Collection</a>
```

**Step 4: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: collection page with genre tabs, bento grid, MagicCard"
```

---

## Phase 4: Mix Detail — Component Upgrades

### Task 9: Stats with NumberTicker + BorderBeam on waveform

**Files:**
- Create: `src/components/MixStats.tsx`
- Modify: `src/pages/mix/[...slug].astro`

**Step 1: Create MixStats component**

`src/components/MixStats.tsx`:
```tsx
import { NumberTicker } from "@/components/magicui/number-ticker";
import { MagicCard } from "@/components/magicui/magic-card";

interface Props {
  duration: string;
  bpm: number;
  musicalKey: string;
  trackCount: number;
  fileSizeMb: number;
  isAnalyzed: boolean;
}

export default function MixStats({ duration, bpm, musicalKey, trackCount, fileSizeMb, isAnalyzed }: Props) {
  return (
    <MagicCard
      className="flex flex-wrap gap-8 p-6 rounded-xl border border-border-warm my-8 max-sm:gap-4 max-sm:p-4"
      gradientColor="rgba(212, 165, 116, 0.05)"
    >
      <div className="flex flex-col items-center min-w-[70px]">
        <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
          {duration}
        </span>
        <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Duration</span>
      </div>
      {isAnalyzed && (
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
            <NumberTicker value={bpm} />
          </span>
          <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">BPM</span>
        </div>
      )}
      {isAnalyzed && (
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
            {musicalKey}
          </span>
          <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Key</span>
        </div>
      )}
      {isAnalyzed && (
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
            <NumberTicker value={trackCount} />
          </span>
          <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Tracks</span>
        </div>
      )}
      <div className="flex flex-col items-center min-w-[70px]">
        <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
          <NumberTicker value={Math.round(fileSizeMb)} /> MB
        </span>
        <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Size</span>
      </div>
    </MagicCard>
  );
}
```

**Step 2: Update mix detail page**

In `src/pages/mix/[...slug].astro`:
- Import MixStats: `import MixStats from '../../components/MixStats.tsx';`
- Replace the `<div class="mix-stats">` block with:
```astro
<MixStats
  client:visible
  duration={data.duration}
  bpm={data.bpm}
  musicalKey={data.musicalKey}
  trackCount={data.trackCount}
  fileSizeMb={data.fileSizeMb}
  isAnalyzed={analyzed}
/>
```
- Remove the `.mix-stats`, `.stat`, `.stat-value`, `.stat-label` CSS rules.

**Step 3: Add BorderBeam to waveform container**

In `src/pages/mix/[...slug].astro`, wrap the waveform div. Since BorderBeam is a React component and the waveform is a plain div, create a small wrapper:

Create `src/components/WaveformBorder.tsx`:
```tsx
import { BorderBeam } from "@/components/magicui/border-beam";

export default function WaveformBorder() {
  return (
    <BorderBeam
      duration={12}
      size={80}
      className="from-transparent via-amber to-transparent"
    />
  );
}
```

In the mix detail page, add the WaveformBorder inside the waveform div:
```astro
---
import WaveformBorder from '../../components/WaveformBorder.tsx';
---
...
<div id="waveform" class="relative overflow-hidden" ...>
  <WaveformBorder client:visible />
</div>
```

**Step 4: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: mix detail stats with NumberTicker, MagicCard, BorderBeam"
```

---

### Task 10: Liner notes intro with TextGenerateEffect

**Files:**
- Create: `src/components/LinerNotesIntro.tsx`
- Modify: `src/pages/mix/[...slug].astro`

**Step 1: Create LinerNotesIntro component**

`src/components/LinerNotesIntro.tsx`:
```tsx
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";

interface Props {
  text: string;
}

export default function LinerNotesIntro({ text }: Props) {
  if (!text) return null;
  return (
    <div className="mb-6">
      <TextGenerateEffect
        words={text}
        className="text-muted-stone text-base leading-relaxed font-body"
      />
    </div>
  );
}
```

**Step 2: Extract first paragraph in mix detail**

In `src/pages/mix/[...slug].astro` frontmatter, extract the first meaningful paragraph from the markdown body:
```astro
---
import LinerNotesIntro from '../../components/LinerNotesIntro.tsx';

// Extract first paragraph from liner notes for text-generate effect
const bodyText = mix.body || '';
const linerNotesMatch = bodyText.match(/## (?:Luke's Notes|Liner Notes)\s*\n\n(.+?)(?:\n\n|\n##|$)/s);
const firstParagraph = linerNotesMatch?.[1]?.replace(/\*[^*]+\*/g, '')?.trim() || '';
---
```

Before `<div class="mix-content">`, add:
```astro
{firstParagraph && firstParagraph.length > 20 && (
  <LinerNotesIntro client:visible text={firstParagraph} />
)}
```

**Step 3: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: liner notes intro with TextGenerateEffect"
```

---

## Phase 5: About Page (NEW)

### Task 11: Create About page with Timeline + BentoGrid + TextGenerateEffect

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/components/AboutContent.tsx`
- Modify: `src/layouts/BaseLayout.astro` (add nav link)

**Step 1: Create AboutContent React island**

`src/components/AboutContent.tsx`:
```tsx
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { TextAnimate } from "@/components/magicui/text-animate";

interface Props {
  totalMixes: number;
  totalTracks: number;
  totalHours: number;
  yearsActive: number;
  genreCount: number;
}

export default function AboutContent({ totalMixes, totalTracks, totalHours, yearsActive, genreCount }: Props) {
  return (
    <div className="max-w-3xl">
      {/* Intro */}
      <TextGenerateEffect
        words="A personal archive of DJ mixes recorded between 2018 and 2025. Each mix is a snapshot of a moment — the music I was obsessed with, the transitions I was practicing, the energy I was chasing."
        className="text-muted-stone text-lg leading-relaxed mb-12"
      />

      {/* Stats Bento Grid */}
      <TextAnimate animation="slideUp" as="h2" className="font-heading text-xl text-warm-cream mb-6">
        By the Numbers
      </TextAnimate>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
        {[
          { value: totalMixes, label: "Mixes" },
          { value: totalHours, label: "Hours of Music", suffix: "h" },
          { value: totalTracks, label: "Tracks Identified" },
          { value: yearsActive, label: "Years Active" },
          { value: genreCount, label: "Genres" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl border border-border-warm bg-surface text-center"
          >
            <div className="font-mono text-3xl font-bold text-amber">
              <NumberTicker value={stat.value} />
              {stat.suffix && <span className="text-xl">{stat.suffix}</span>}
            </div>
            <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <TextAnimate animation="slideUp" as="h2" className="font-heading text-xl text-warm-cream mb-6">
        The Journey
      </TextAnimate>
      <div className="relative pl-8 border-l border-border-warm space-y-8 mb-12">
        {[
          { year: "2018", title: "First Mix", desc: "Mix 01 — a 3 hour 45 minute marathon that set the template. Heavy on dance and electronic." },
          { year: "2019", title: "Finding the Format", desc: "4 mixes. Settled into shorter formats and started exploring broader genres." },
          { year: "2020", title: "Lockdown Sessions", desc: "6 mixes during COVID lockdowns. The most prolific period — music as therapy." },
          { year: "2021", title: "Quality Over Quantity", desc: "4 mixes, more focused. Started adding tracklists and liner notes." },
          { year: "2022", title: "Peak Output", desc: "7 mixes across the year. The most diverse period — house, techno, trance, hip-hop." },
          { year: "2023", title: "The Archive", desc: "8 mixes. Built this site to preserve and share the collection. AI-assisted analysis began." },
          { year: "2024", title: "Refinement", desc: "7 mixes. Focused on tighter curation and higher production standards." },
          { year: "2025", title: "Continuing", desc: "The crate keeps growing. Every mix is a timestamp of a moment that mattered." },
        ].map((entry) => (
          <div key={entry.year} className="relative">
            <div className="absolute -left-[2.85rem] top-0.5 w-5 h-5 rounded-full bg-base border-2 border-amber flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber" />
            </div>
            <span className="font-mono text-[0.7rem] text-amber uppercase tracking-wider">
              {entry.year}
            </span>
            <h3 className="font-heading text-lg font-semibold text-warm-cream mt-1">
              {entry.title}
            </h3>
            <p className="text-muted-stone text-sm mt-1 leading-relaxed">
              {entry.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Closing */}
      <div className="border-t border-border-warm pt-8 text-center">
        <p className="text-muted-stone text-sm">
          Free streaming. No account needed.{" "}
          <a href="https://www.patreon.com/c/lukesmixes" target="_blank" rel="noopener" className="text-amber hover:text-warm-cream transition-colors">
            Support on Patreon
          </a>
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create about.astro**

`src/pages/about.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import AboutContent from '../components/AboutContent.tsx';

const mixes = await getCollection('mixes');
const totalMixes = mixes.length;
const totalTracks = mixes.reduce((sum, m) => sum + m.data.trackCount, 0);
const totalMinutes = mixes.reduce((sum, m) => {
  const match = m.data.duration.match(/(\d+)h\s*(\d+)m/);
  return sum + (match ? Number(match[1]) * 60 + Number(match[2]) : 0);
}, 0);
const totalHours = Math.round(totalMinutes / 60);
const yearsActive = new Date().getFullYear() - 2018;
const genreCount = new Set(
  mixes.flatMap(m => m.data.genres.filter(g => g.name !== 'Mixed').map(g => g.name))
).size;
---

<BaseLayout title="About — Luke's Mixes">
  <h1 class="font-heading text-3xl font-bold text-warm-cream mb-8">About</h1>
  <AboutContent
    client:load
    totalMixes={totalMixes}
    totalTracks={totalTracks}
    totalHours={totalHours}
    yearsActive={yearsActive}
    genreCount={genreCount}
  />
</BaseLayout>
```

**Step 3: Add nav link**

In `BaseLayout.astro`, add to nav-links:
```html
<a href="/about">About</a>
```

**Step 4: Verify + Commit**

```bash
npm run build && git add -A && git commit -m "feat: about page with TextGenerateEffect, timeline, NumberTicker stats"
```

---

## Phase 6: Assets + Polish + Deploy

### Task 12: Generate Nano Banana assets

**Step 1: Generate hero background**

Use `mcp__nano-banana__generate_image` with prompt:
> "Abstract warm dark background, vinyl record texture, amber and sepia tones, deep shadows, moody atmospheric, dark base color #0A0A0A with subtle warm gradients, film grain aesthetic, no text, no objects, just texture and warmth"

Save to `public/images/hero-bg.webp`

**Step 2: Generate fallback album art**

Use `mcp__nano-banana__generate_image` with prompt:
> "Minimalist vinyl groove pattern on dark background, warm amber highlight, abstract circular grooves like a record, no text, subtle grain texture, dark moody atmosphere"

Save to `public/images/fallback-cover.webp`

**Step 3: Integrate hero background**

In `HeroFeatured.tsx`, add the hero background as an additional layer behind the gradient (optional, enhancing the existing gradient approach).

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: Nano Banana generated hero and fallback art"
```

---

### Task 13: Responsive polish and build

**Step 1: Test breakpoints**

Run `npm run dev` and verify at 375px, 768px, 1024px, 1440px:
- Home: hero scales, carousel slides resize, marquee works, stats wrap, archive readable
- Collection: grid goes 2→3→4 columns, tabs wrap, search full-width on mobile
- Mix Detail: stats wrap, waveform responsive, tracklist readable
- About: timeline readable, stats grid goes 2→3 columns

**Step 2: Verify player bar untouched**

Ensure player bar works: play a mix from home and from mix detail. Keyboard shortcuts (space, arrows, m) still work. Cast button still appears on supported browsers.

**Step 3: Production build**

```bash
cd C:/AI/Projects/Personal/dj-mix-archive/site
npm run build
```

Expected: Clean build, no errors.

**Step 4: Commit all changes**

```bash
git add -A && git commit -m "chore: responsive polish and production build"
```

---

## Phase Review Gates

- **After Phase 1 (Task 1):** Verify all component files exist and build passes
- **After Phase 2 (Tasks 2-7):** Run `/pr-review-toolkit:review-pr` — verify home page
- **After Phase 3 (Task 8):** Verify collection page renders, filtering works
- **After Phase 4 (Tasks 9-10):** Verify mix detail upgrades, player still works
- **After Phase 5 (Task 11):** Verify about page renders
- **After Phase 6 (Tasks 12-13):** Full review, then deploy
