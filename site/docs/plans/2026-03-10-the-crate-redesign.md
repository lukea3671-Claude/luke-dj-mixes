# The Crate — DJ Mix Archive Redesign

**Date:** 2026-03-10
**Direction:** "The Crate" — Record Store Discovery
**Status:** Design approved, implementation pending

## Concept

Each mix feels like a physical artifact you're flipping through. Warm, tactile, analog warmth over dark. The site feels like browsing vinyl in a dimly-lit record shop.

## Tech Stack

- **Framework:** Astro (SSG shell) + React islands (interactive components)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (via React islands)
- **Component libraries:** shadcn/ui, Magic UI, Aceternity UI (React)
- **Existing infra:** Cloudflare Pages deploy, R2 audio hosting, Astro content collections
- **Keep:** View Transitions API, Media Session API, keyboard shortcuts, Chromecast support

## Pages

### Homepage (`/`)
1. **Nav** — "Luke's Mixes" (Playfair) + Archive link
2. **Featured Sleeve** — Latest mix as full-width album cover with generative art, editorial typography, integrated play button
3. **The Crate** — Horizontal scroll carousel of square sleeve cards, scroll-snap, drag to browse
4. **Archive** — Dense editorial list grouped by year, sticky year headers
5. **Player Bar** — Glass effect, persistent across navigation

### Mix Detail (`/mix/[slug]/`)
1. **Nav** — Back to crate + site title
2. **Cover Art** — Full-width generative art with film grain and warm light leak
3. **Mix Info** — Title, date, duration, BPM, key (if analyzed)
4. **Waveform Timeline** — Interactive seek bar using existing SVG generation, tinted amber/cream
5. **Tracklist** — Timestamped list with now-playing indicator (if analyzed)
6. **Liner Notes** — AI-generated narrative (if analyzed)
7. **Genre Pills** — Teal-accented tags (if analyzed)

### Sparse Data Handling
36/46 mixes are unanalyzed. Design treats this as primary state:
- Show: generative cover art, duration, date
- Omit entirely: BPM, key, tracklist, liner notes, genre pills
- No "pending" badges, no "coming soon" — sections simply don't render

## Design System

### Palette

| Role | Hex | Usage |
|------|-----|-------|
| Base | `#0A0A0A` | Page background |
| Surface | `#161412` | Cards, sleeves, player |
| Surface Hover | `#221E1A` | Hover states |
| Warm Cream | `#F5E6C8` | Primary text |
| Muted Stone | `#8A7E72` | Secondary text, metadata |
| Amber | `#D4A574` | Interactive elements, accents |
| Amber Glow | `rgba(212,165,116,0.25)` | Hover shadows, active states |
| Teal | `#4A7B7C` | Genre pills, secondary accents |
| Border | `#2A2420` | Dividers |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Site title | Playfair Display | 700 | 1.5rem |
| Mix titles (hero) | Playfair Display | 600 | 2.4rem |
| Mix titles (card) | Playfair Display | 600 | 1rem |
| Body/UI | Inter | 300-500 | 0.85-1rem |
| Metadata/mono | JetBrains Mono | 400 | 0.7-0.8rem |

Google Fonts import:
```
Playfair+Display:wght@400;500;600;700
Inter:wght@300;400;500;600
JetBrains+Mono:wght@400;500
```

### Effects

| Effect | Implementation |
|--------|---------------|
| Film grain | SVG noise overlay, 3-4% opacity, fixed, warm tint |
| Light leaks on hover | Radial gradient `rgba(212,165,116,0.08)` following cursor |
| Card lift | `translateY(-6px)` + `box-shadow: 0 12px 32px rgba(212,165,116,0.12)` |
| Crate scroll | `scroll-snap-type: x mandatory`, square sleeves |
| Page transitions | Astro View Transitions (cross-fade) |
| Waveform tint | Amber/cream instead of orange |
| Player glass | `backdrop-filter: blur(16px)` on `rgba(10,10,10,0.85)` |
| Playing glow | Warm amber border-top glow on player bar |
| Reduced motion | All animations disabled via `prefers-reduced-motion` |

### Component Sources

| Component | Source | Notes |
|-----------|--------|-------|
| Base UI (buttons, inputs) | shadcn/ui | Foundation layer |
| Scroll animations | Magic UI | Marquee, scroll-based reveal |
| Hover effects, spotlight | Aceternity UI | Interactive cards, light effects |
| Audio player | Custom React | Existing player logic, restyled |
| Waveform viz | Custom SVG | Existing generation, new palette |
| Generative cover art | Existing utils | `mix-gradient.ts`, warmed palette |

## Key Differences from Current Site

| Current | New |
|---------|-----|
| Orange `#f97316` accent | Amber `#D4A574` |
| Space Grotesk headings | Playfair Display |
| White `#fafaf9` text | Warm cream `#F5E6C8` |
| 5-card grid (recent) | Horizontal scroll crate |
| Stone `#1c1917` background | Near-black `#0A0A0A` |
| Gradient hero | Full-width generative sleeve |
| Featured = 6 newest (broken for unanalyzed) | Featured = latest only, crate = all |
