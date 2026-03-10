# The Crate — Design Document

**Date:** 2026-03-11
**Status:** Draft — first pass using all 5 design tools

## Vision

Browsing through a collector's record crate. Warm, tactile, premium. Record store, not nightclub. Every interaction should feel like pulling a sleeve from a crate, holding it up to the light, and deciding whether to drop the needle.

## Tech Stack

- Astro 5 SSG + React islands (existing)
- Tailwind CSS 4 via `@tailwindcss/vite` (existing)
- Framer Motion via `motion` package (existing)
- WaveSurfer.js for waveforms (existing)
- **NEW:** shadcn/ui — foundation components
- **NEW:** Magic UI — spotlight effects, animated borders, marquee, particles
- **NEW:** Aceternity UI — focus cards, bento grid, timeline, tabs, text effects
- **Stitch** — AI prototyping for homepage layout
- **Nano Banana** — Generated hero background + fallback album art

## Pages (4)

### 1. Home

| Section | Components | Library |
|---------|-----------|---------|
| **Ambient background** | Particles (qty: 30, warm amber color, subtle) | Magic UI |
| **Scroll indicator** | ScrollProgress (amber bar at page top) | Magic UI |
| **Hero — Featured Mix** | NeonGradientCard (amber/teal neon border) wrapping featured sleeve. TextAnimate (blurInUp) for title. BorderBeam (amber, slow orbit) on card edge | Magic UI + Magic UI + Magic UI |
| **The Crate — Carousel** | MagicCard (spotlight hover) on each sleeve card. Keep existing scroll-snap + drag behavior | Magic UI |
| **Genre Strip** | Marquee (infinite horizontal scroll, pauseOnHover) with genre pills | Magic UI |
| **Stats Bar** | NumberTicker for: total mixes, total hours, total tracks | Magic UI |
| **Archive List** | Focus Cards (hover one, blur rest). Replace plain rows with card-style items with gradient swatches | Aceternity |

### 2. Collection (NEW)

| Section | Components | Library |
|---------|-----------|---------|
| **Genre Filtering** | Animated Tabs (animated background pill) for genre categories | Aceternity |
| **Mix Grid** | Bento Grid layout with MagicCard hover on each cell. Gradient background per mix, ghost mix number | Aceternity + Magic UI |
| **Search** | shadcn Input component with warm styling | shadcn/ui |
| **Empty state** | TextAnimate ("No mixes found") | Magic UI |

### 3. Mix Detail (existing, upgraded)

| Section | Components | Library |
|---------|-----------|---------|
| **Header** | Keep gradient header. Add BorderBeam (amber, slow) around the play button | Magic UI |
| **Stats row** | NumberTicker for BPM, track count, duration (animate on scroll into view) | Magic UI |
| **Stats card** | NeonGradientCard or MagicCard wrapping the stats section | Magic UI |
| **Genre pills** | Keep existing, no change needed | — |
| **Tracklist** | Timeline with scroll beam — the beam follows audio playback position. Each track is a timeline entry | Aceternity |
| **Liner notes intro** | TextGenerateEffect (fade in word by word) for the first paragraph | Aceternity |
| **Waveform** | Keep WaveSurfer. Add BorderBeam around container | Magic UI |

### 4. About (NEW)

| Section | Components | Library |
|---------|-----------|---------|
| **Page intro** | TextGenerateEffect for opening paragraph | Aceternity |
| **DJ Journey** | Timeline with dates/milestones (when started, notable mixes, genres explored) | Aceternity |
| **Stats highlights** | Bento Grid with NumberTicker stats (total mixes, hours of music, genres, years active) | Aceternity + Magic UI |
| **Heading** | TextAnimate (slideUp) for section headings | Magic UI |

### Global / Layout

| Element | Components | Library |
|---------|-----------|---------|
| **Navigation** | Keep header nav (floating-dock conflicts with player bar at bottom). Add TextAnimate on site title hover | Existing + Magic UI |
| **Film grain** | Keep existing FilmGrain.astro | Existing |
| **Particles** | Low-quantity warm ambient particles behind all pages | Magic UI |
| **ScrollProgress** | Amber progress bar at page top, all pages | Magic UI |
| **Player bar** | Keep existing. No changes. PROTECTED. | Existing |

## Component Library Usage Verification

| Library | Components Used | Count |
|---------|---------------|-------|
| **Magic UI** | MagicCard, BorderBeam, Marquee, NeonGradientCard, NumberTicker, TextAnimate, Particles, ScrollProgress | 8 |
| **Aceternity** | Focus Cards, Bento Grid, Timeline, Animated Tabs, TextGenerateEffect | 5 |
| **shadcn/ui** | Input (search), Button, Card (foundation wrappers) | 3 |
| **Stitch** | Homepage layout prototype | 1 |
| **Nano Banana** | Hero background, fallback album art | 2 |

Every page uses components from at least 2 of the 3 UI libraries. ✓

## Design Tokens (existing, no changes)

- Base: `#0A0A0A`, Surface: `#161412`, Warm Cream: `#F5E6C8`
- Amber: `#D4A574`, Teal: `#4A7B7C`, Muted Stone: `#8A7E72`
- Fonts: Playfair Display / Inter / JetBrains Mono
- Glass effects, easing curves — all defined in `global.css`

## Key Constraints

1. **Player bar is PROTECTED** — don't touch the audio player, its JS, or its styles
2. **Content collections unchanged** — same markdown structure, same data shape
3. **R2 audio hosting unchanged** — same URLs, same peaks files
4. **Animations tasteful** — particles low-quantity, text effects on load only (not continuous), hover effects subtle
5. **Mobile responsive** — all components must work at 375px
6. **prefers-reduced-motion** — respect existing media query, disable all Framer Motion + component animations

## Nano Banana Assets

1. **Hero background**: Warm, abstract, vinyl-texture-inspired background. Dark with amber/sepia tones. Used behind the hero NeonGradientCard as an alternative to the generative gradient for the featured mix.
2. **Fallback album art**: Generic "no cover" image in the Crate style — warm, minimal, maybe a vinyl groove pattern. Used for mixes that don't have analysis data.

## Stitch Usage

Prototype the home page layout before coding:
- Hero section with NeonGradientCard placement
- Crate carousel below
- Genre marquee strip
- Stats bar
- Archive with focus cards

This validates the spatial relationships before implementation.
