# DJ Mix Archive Redesign — "Music Tool" Design

**Date:** 2026-03-05
**Approach:** B — Music Tool (restructure into a premium listening platform)
**Stack:** Astro 5 + Cloudflare Pages + R2 + wavesurfer.js

## Design Philosophy

The archive should feel like opening a crate of vinyl — tactile, curated, personal. Not a streaming service clone. Every mix gets a unique visual identity generated from its data (BPM, key, genres), eliminating the need for cover art while creating something more interesting than stock imagery.

## Homepage

### The Crate (Featured Section)
- Top 4–6 mixes displayed as large interactive cards
- Each card has a generative gradient background seeded from mix data (BPM → hue rotation, key → gradient angle, primary genre → palette)
- Hover: subtle parallax shift, genre tags fade in, play button appears
- Click anywhere to navigate; play button loads audio without navigation
- Scroll snap horizontal carousel on mobile

### The Wall (Archive Grid)
- Remaining mixes in a responsive grid of smaller cards
- Each card: generative mini-gradient, title, date, duration, primary genre tag
- Grouped by year with sticky year headers
- Container queries: cards adapt from compact (mobile) to expanded (desktop) without media query breakpoints
- Hover: card lifts with box-shadow, waveform preview fades in (CSS-only simplified version)
- Filter/sort controls: by year, genre, BPM range, duration

### Empty State Strategy
- 36 of 46 mixes currently show "0 BPM / 0 tracks / Mixed" (analysis pending)
- Unanalyzed mixes: show "Processing..." badge, use neutral gradient (no data to seed from)
- Still playable — just missing metadata enrichment
- Once analysis completes, cards auto-populate with generated gradients

## Mix Detail Page

### Energy Map (Hero Section)
- Full-width wavesurfer.js waveform with color gradient mapped to energy levels
- Low energy sections: cool blues/purples; high energy: warm oranges/reds
- Track markers overlaid on waveform as vertical lines with labels
- Click any track marker to seek to that point
- Current position indicator synced with global player

### Stats Bar
- BPM, key, duration, track count, file size displayed as a clean horizontal bar
- Genre tags as pill badges with color coding
- Date and mix number

### Clickable Tracklist
- Each track row shows: position marker, track name, timestamp
- Click any track → seeks audio to that timestamp
- Currently playing track highlighted with accent color pulse
- Scroll-driven: tracklist auto-scrolls to keep current track visible during playback

### Content Section
- AI-generated liner notes rendered from markdown
- Energy flow analysis (existing bar visualization, refined styling)
- Collapsible sections for long content

### Empty State (Unanalyzed Mixes)
- Waveform still renders (peaks data exists independently of analysis)
- Stats bar shows available data only (duration, file size)
- "Full analysis coming soon" notice where tracklist would be
- Liner notes section hidden entirely if no content

## Player Bar

### Design
- Glassmorphism: `backdrop-filter: blur(16px)` with semi-transparent background
- Fixed bottom, full width
- Persistent across page navigation via `transition:persist`

### Layout
- Left: mini generative gradient thumbnail + mix title + current track name
- Center: transport controls (prev track, play/pause, next track) + progress bar
- Right: volume slider + duration display + expand/collapse toggle

### Current Track Display
- When tracklist data exists: shows current track name based on playback position
- Updates in real-time as playback crosses track boundaries
- Click track name to scroll detail page tracklist to that track

### Keyboard Shortcuts
- Space: play/pause
- Left/Right arrows: seek ±10s
- Up/Down arrows: volume ±10%
- M: mute/unmute
- N: next track marker
- P: previous track marker
- Displayed in a tooltip on hover over player

### Mobile Player
- Collapses to minimal bar: play/pause + title + progress
- Swipe up to expand to full controls
- Lock screen controls via Media Session API (existing)

## Visual System

### Generative Art
- Each mix gets a unique CSS gradient generated from frontmatter data
- Algorithm: `BPM → hue base`, `musicalKey → gradient angle`, `primaryGenre → saturation/lightness`
- Consistent: same data always produces same gradient (deterministic seed)
- Used everywhere: cards, detail page hero, player thumbnail, OG images

### Color Palette
- Background: `#1c1917` (existing stone-900)
- Surface: `#292524` (stone-800)
- Accent: `#f97316` (existing orange-500)
- Text: `#fafaf9` primary, `#a8a29e` secondary
- Glassmorphism: `rgba(28, 25, 23, 0.7)` with blur

### Typography
- Headings: Bitter (existing, variable weight)
- Body: Inter (existing)
- Monospace for timestamps, BPM, technical data

### Grain & Texture
- Film grain overlay (existing, keep)
- Subtle noise texture on surfaces for depth
- No glassmorphism on cards — reserve for player bar only

## Responsive / Mobile Strategy

### Breakpoints (via container queries where possible)
- `< 480px`: Single column, compact cards, collapsed player
- `480–768px`: 2-column grid, medium cards
- `768–1200px`: 3-column grid, full cards
- `> 1200px`: 4-column grid, expanded layout

### Touch Interactions
- Swipe on player to expand/collapse
- Tap-and-hold on card for quick preview (stretch goal)
- Large touch targets for all controls (44px minimum)

### PWA (Phase 2)
- Service worker for offline playback of cached mixes
- Add to home screen with app manifest
- Background audio playback
- Push notifications for new mix uploads (stretch)

## Modern CSS Techniques

| Technique | Usage | Browser Support 2025+ |
|-----------|-------|----------------------|
| Container queries | Card layouts adapting to grid context | Safe |
| `:has()` | Player state styling (`.player:has(audio[data-playing])`) | Safe |
| `color-mix()` | Dynamic opacity/shade on accent color | Safe |
| `@property` | Animatable gradient custom properties | Safe |
| Scroll-driven animations | Tracklist auto-scroll, parallax effects | Progressive enhancement |
| View Transitions | Page transitions with persistent player | Safe (Astro built-in) |
| Subgrid | Tracklist column alignment | Safe |

## Accessibility

- All custom audio controls keyboard-accessible
- ARIA labels on transport controls
- Live region for "now playing" announcements
- Focus management on page navigation
- Visible focus indicators on all interactive elements
- Reduced motion: disable parallax, simplify animations
- Color contrast: all text meets WCAG AA minimum

## Performance

- Pre-computed waveform peaks (existing audiowaveform binary → JSON)
- Lazy load waveform/visualization only on detail pages
- `preload="metadata"` for audio (existing)
- Critical CSS inlined by Astro
- Generative gradients are pure CSS — zero image weight
- Service worker caching for audio files (Phase 2)
