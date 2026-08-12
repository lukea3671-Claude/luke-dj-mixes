# DJ Mix Archive

Luke's complete DJ mix collection — free streaming with AI-generated liner notes.

## Vision

Replace SoundCloud ($160/year, now paywalled) with a self-owned archive site where anyone can stream all 47 mixes for free. Each mix page features AI-generated "liner notes" — track listings with timestamps, genre breakdowns, energy flow descriptions, and Luke's personal commentary. Optional Patreon for supporters.

## Architecture

```
Cloudflare Pages (free)          Cloudflare R2 (~$1.50/month)
  ├── Static site (Hugo/Astro)     └── Audio files (MP3s, ~100GB)
  ├── Mix pages with liner notes
  ├── Audio player (streaming)
  └── Patreon link
```

**Why this stack:**
- Cloudflare Pages: Free hosting, global CDN, custom domain support
- Cloudflare R2: $0.015/GB/month storage, **zero egress fees** (critical for audio streaming)
- Static site generator: Fast, SEO-friendly, no server to maintain
- Total cost: ~$1.50/month + domain (~$12/year) vs $160/year on SoundCloud

## The Archive

47 mixes spanning September 2018 - May 2026:

| # | Mix | Date | Status |
|---|-----|------|--------|
| 01 | September 2018 | Sep 2018 | Analyzed |
| 02 | January 2019 | Jan 2019 | Pending |
| 03 | May 2019 | May 2019 | Pending |
| 04 | August 2019 | Aug 2019 | Pending |
| 05 | October 2019 | Oct 2019 | Pending |
| 06 | December 2019 | Dec 2019 | Pending |
| 07 | March 2020 | Mar 2020 | Pending |
| 08 | May 2020 | May 2020 | Pending |
| 09 | June 2020 | Jun 2020 | Pending |
| 10 | August 2020 | Aug 2020 | Pending |
| 11 | November 2020 | Nov 2020 | Pending |
| 12 | December 2020 | Dec 2020 | Pending |
| 13 | February 2021 | Feb 2021 | Pending |
| 14 | April 2021 | Apr 2021 | Pending |
| 15 | September 2021 | Sep 2021 | Pending |
| 16 | December 2021 | Dec 2021 | Pending |
| 17 | January 2022 | Jan 2022 | Pending |
| 18 | February 2022 | Feb 2022 | Pending |
| 19 | March 2022 | Mar 2022 | Pending |
| 20 | April 2022 | Apr 2022 | Pending |
| 21 | July 2022 | Jul 2022 | Pending |
| 22 | September 2022 | Sep 2022 | Pending |
| 23 | October 2022 | Oct 2022 | Pending |
| 24 | January 2023 | Jan 2023 | Pending |
| 25 | February 2023 | Feb 2023 | Pending |
| 26 | February 2023 (2) | Feb 2023 | Pending |
| 27 | March 2023 | Mar 2023 | Pending |
| 28 | June 2023 | Jun 2023 | Pending |
| 29 | July 2023 | Jul 2023 | Pending |
| 30 | August 2023 | Aug 2023 | Pending |
| 31 | September 2023 | Sep 2023 | Pending |
| 32 | October 2023 | Oct 2023 | Pending |
| 33 | November 2023 | Nov 2023 | Pending |
| 34 | December 2023 | Dec 2023 | Pending |
| 35 | January 2024 | Jan 2024 | Pending |
| 36 | March 2024 | Mar 2024 | Analyzed |
| 37 | June 2024 | Jun 2024 | Pending |
| 38 | July 2024 | Jul 2024 | Pending |
| 39 | August 2024 | Aug 2024 | Pending |
| 40 | September 2024 | Sep 2024 | Pending |
| 41 | October 2024 | Oct 2024 | Pending |
| 42 | November 2024 | Nov 2024 | Pending |
| 43 | February 2025 | Feb 2025 | Pending |
| 44 | March 2025 | Mar 2025 | Pending |
| 45 | April 2025 | Apr 2025 | Pending |
| 46 | July 2025 | Jul 2025 | Analyzed |
| 47 | May 2026 | May 2026 | Live |

## Phases

### Phase 1: Complete All Analyses (IN PROGRESS)

**Goal:** Get all 46 mixes through the ShazamIO + librosa pipeline.

- Analysis pipeline: `C:\AI\Projects\DJ-Mix-Analysis\`
- Python venv: `C:\AI\Tools\music-analysis-env`
- Reports land in: `E:\Music Mixes\Lukes_Mixes\analysis\`
- Progress: 2/46 complete (Mix 02 running)
- Estimated: ~30-40 hours of compute time (can run in background)
- **IMPORTANT**: ffmpeg must be in PATH. The batch runner adds it automatically.

**Run all remaining (background):**
```powershell
powershell -File "C:\AI\Projects\DJ-Mix-Analysis\scripts\run_all_mixes.ps1"
```

### Phase 2: Report-to-Liner-Notes Pipeline (DONE)

**Goal:** Transform JSON reports into human-readable mix pages. **COMPLETE.**

Scripts in `C:\AI\Projects\DJ-Mix-Archive\scripts\`:

| Script | Purpose |
|--------|---------|
| `generate_liner_notes.py` | JSON report → standalone markdown liner notes |
| `generate_site_content.py` | JSON report → Astro content collection files (frontmatter + markdown) |
| `generate_peaks.py` | MP3 → peaks.json for WaveSurfer.js (via audiowaveform CLI) |

**Generate all content from reports:**
```bash
python scripts/generate_site_content.py --all "E:\Music Mixes\Lukes_Mixes\analysis"
```

**Generate all peaks:**
```bash
python scripts/generate_peaks.py --all "E:\Music Mixes\Lukes_Mixes" -o "E:\Music Mixes\Lukes_Mixes\analysis\peaks"
```

**What's included:**
- ✅ Mix overview (duration, BPM, key, energy stats)
- ✅ Deduplicated track listing with timestamps (confidence filtering)
- ✅ Genre breakdown with percentages
- ✅ Energy narrative (detects flat vs dynamic profiles)
- ✅ Waveform peaks (audiowaveform CLI, 20 samples/sec, 8-bit)
- ✅ Placeholder for Luke's personal notes
- ⬜ YouTube links (future enhancement)

**Dependency:** `audiowaveform` CLI (`winget install BBC.audiowaveform`)

### Phase 3: Site Infrastructure (IN PROGRESS)

**Goal:** Set up hosting and the site framework.

**Astro site scaffolded at `site/`** — builds clean, content collection working.

- [x] Choose static site generator — **Astro** with View Transitions
- [x] Content collection for mixes (YAML frontmatter + markdown body)
- [x] Base layout with persistent `<audio>` player (transition:persist)
- [x] Media Session API for lock screen controls
- [x] Mix page template (stats, genres, tracklist, energy flow, Luke's notes)
- [x] Homepage archive listing (sorted mix grid with inline play buttons)
- [x] Dark theme, responsive design
- [x] Auto-generate content from reports (`generate_site_content.py`)
- [x] WaveSurfer.js waveform visualization (peaks.json pre-generated, click-to-seek, synced with player)
- [x] Podcast RSS feed (`/feed.xml` — iTunes/Spotify compatible, auto-generated at build)
- [x] SEO: Schema.org JSON-LD (MusicRecording + PodcastEpisode), Open Graph audio tags, Twitter Cards, canonical URLs
- [x] RSS auto-discovery link in `<head>`
- [ ] Register domain (or use existing?)
- [ ] Set up Cloudflare account (Pages + R2)
- [ ] Upload MP3s to R2 (custom domain, not r2.dev)
- [ ] R2 config: CORS policy, range requests (206), cache rules for *.mp3
- [ ] Set up Patreon account and link

**Design considerations:**
- SEO: Schema.org MusicRecording + PodcastEpisode markup, Open Graph audio tags (**DONE**)
- Social sharing: Open Graph tags with mix artwork/description (**DONE**)
- Mobile: Responsive audio player, background playback via Media Session API
- Discovery: Genre tags, search, timeline view, podcast app distribution
- **iOS**: Background audio works in Safari (iOS 15+) with user-initiated play + Media Session API. PWA home-screen apps had a ~30s limit historically — recommend running in Safari, not PWA. Podcast RSS is bonus distribution, not a workaround.

### Phase 4: Content & Launch

**Goal:** Populate site, add Luke's commentary, go live.

- [ ] Generate liner notes for all 46 mixes (Phase 2 pipeline)
- [ ] Luke reviews and adds personal commentary to each mix
- [ ] Upload all audio to R2
- [ ] Deploy site to Cloudflare Pages
- [ ] Set up Patreon page
- [ ] Announce/share
- [ ] Cancel SoundCloud subscription

### Phase 5: Ongoing

**Goal:** Monthly updates when new mixes are created.

- Analyze new mix with existing pipeline
- Generate liner notes
- Luke adds commentary
- Push to site (git commit triggers Cloudflare deploy)
- New mix = new blog post essentially

## Related Projects

| Project | Path | Relationship |
|---------|------|-------------|
| DJ Mix Analysis | `C:\AI\Projects\DJ-Mix-Analysis\` | Analysis pipeline (Phase 1) |
| DJ Songs | `E:\Music Mixes\DJ Songs\` | Downloaded individual tracks |

## Revenue Model

**Patreon (optional donations)**
- Not paywalled — all content free
- Tiers: e.g., $3/month supporter, $10/month with early access to new mixes
- Goal: Cover hosting costs + motivate monthly consistency
- Link prominently on every page but never block content

## Cost Comparison

| | SoundCloud | Self-Hosted (Cloudflare) |
|---|---|---|
| Annual cost | ~$160 | ~$30 ($18 R2 + $12 domain) |
| Listener access | Requires SoundCloud account (paid) | Free, no account needed |
| SEO/Discovery | SoundCloud algorithm | Full control, Google-indexable |
| Track listings | Manual | AI-generated with timestamps |
| Branding | SoundCloud's | Your own |
| Data ownership | SoundCloud's platform | You own everything |

## Technical Research (2026-02-07)

### Background Audio on Mobile (Critical)

| Platform | Status | Notes |
|----------|--------|-------|
| Android Chrome | Good | Native `<audio>` + Media Session API = lock screen controls, background play |
| iOS Safari | Unreliable | User-initiated play required. Background playback can stop. PWA doesn't help. |
| iOS workaround | Podcast RSS | Users subscribe in Apple Podcasts — native background playback |

**Stack:** Native `<audio>` element (NOT Web Audio API) + Media Session API for metadata/controls.

### Audio Player Stack

**Primary candidate: [WaveformPlayer](https://waveformplayer.com/)** (discovered via ChatGPT deep research)
- Media Session API built-in (lock screen controls out of the box)
- Chapter markers for timestamps (track transitions in a 3h mix)
- Multiple waveform styles (bars, line, mirror)
- Zero-config, auto light/dark theming
- Playlist addon: `@arraypress/waveform-playlist`
- No dependencies, lightweight

**Fallback/alternative stack:**

| Component | Library | Purpose |
|-----------|---------|---------|
| Playback | Native `<audio>` | Most reliable for background playback |
| Lock screen | Media Session API | Metadata, play/pause/seek controls |
| UI | Plyr or MediaElement.js | Player controls/skin |
| Waveform | WaveSurfer.js | Visual progress/waveform display |

### Static Site Generator

**Leading candidate: Astro**
- Islands architecture: static pages with hydrated audio player components
- View Transitions / SPA mode for persistent player across page navigations
- Good SEO (structured data, sitemaps, meta tags)
- Hugo as runner-up for build speed

### Podcast RSS Feed

Generating an iTunes/Spotify-compatible RSS feed is a major unlock:
- Free distribution on Apple Podcasts, Spotify, Overcast, etc.
- Solves iOS background playback (native podcast apps handle it)
- Apple requires byte-range requests (R2 supports this) and RSS 2.0 compliance
- Can auto-generate from mix metadata during build

### Deep Research Results

**ChatGPT Deep Research** (2026-02-07): `research/chatgpt-deep-research-2026-02-07.pdf`

Key findings that changed the plan:
1. **iOS background audio works** — Safari (iOS 15+) with user-initiated play is reliable. PWA home-screen apps had a ~30s limit, but running in Safari is fine. This is better than our initial pessimistic assessment.
2. **WaveformPlayer** — new library with Media Session + chapter markers + waveform built-in. May replace the Plyr+WaveSurfer combo.
3. **R2 range request gotcha** — R2 public bucket can return 200 instead of 206. Need custom domain or Worker to fix. Safari/WebKit will refuse to play without proper 206.
4. **PodcastSeries/PodcastEpisode schema** — Google can show play buttons directly in search results. DJ mixes are functionally podcasts.
5. **Persistent player architecture** — need SPA-style navigation (Turbo/Swup) or Astro View Transitions to prevent audio interruption on page navigation.
6. **Design inspiration**: Mixcloud (persistent bottom player), 1001Tracklists (tracklist SEO), MixesDB (genre/era tagging)

**Gemini Deep Research** (2026-02-07): `research/gemini-deep-research-2026-02-07.docx`

Key findings that add to/change the plan:
1. **R2 512MB cache limit** — Cloudflare CDN can strip Range headers for large objects via custom domains. Add Cache Rule to bypass cache for `/audio/` path. Our MP3s are <300MB so probably fine, but set the rule anyway.
2. **WaveSurfer.js crashes mobile on large files** — Default mode loads entire file into Web Audio context (RAM). MUST use `backend: 'MediaElement'` + pre-generated `peaks.json` via `audiowaveform` CLI. Add peak generation to build pipeline.
3. **Standalone PWA worse than browser tab on iOS** — WebKit Bug 198277. Don't push PWA install for audio. Browser tab is more reliable for background playback.
4. **Astro `transition:persist` directive** — specific mechanism to keep audio player alive during page navigation. Use Nano Stores (`@nanostores/persistent`) for cross-island state + localStorage sync.
5. **Patreon OAuth2 via Workers** — full auth gateway with signed R2 URLs. Future premium tier option (gated downloads), not needed for MVP.
6. **RSS duration trick** — HEAD request for Content-Length + Range request for first 32kb (ID3 header) → parse with `music-metadata` for duration. Generate full podcast feed without downloading files.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-07 | Cloudflare R2 for audio hosting | Zero egress fees — critical for streaming. $0.015/GB/month storage. |
| 2026-02-07 | Patreon (not paywall) | Creative art should be free. Donations for those who want to support. |
| 2026-02-07 | Finish all analyses first | Gives time to build infrastructure in parallel. Launch with complete archive. |
| 2026-02-07 | Static site generator (leaning Astro) | Islands architecture + View Transitions for persistent audio player. |
| 2026-02-07 | Podcast RSS feed | Solves iOS background playback. Free distribution on podcast platforms. |
| 2026-02-07 | Native `<audio>` + Media Session API | More reliable for background playback than any audio library abstraction. |
| 2026-02-07 | WaveformPlayer as primary player candidate | Built-in Media Session, chapter markers, waveform — replaces multi-library combo. |
| 2026-02-07 | R2 must use custom domain (not r2.dev) | Public bucket may return 200 instead of 206 for range requests — breaks Safari seeking. |
| 2026-02-07 | iOS Safari background audio confirmed working | iOS 15+ with user-initiated play. Don't need PWA install. Podcast RSS is bonus, not workaround. |
| 2026-02-07 | Pre-generate waveform peaks server-side | WaveSurfer.js crashes mobile on large files. Use `audiowaveform` CLI → peaks.json. |
| 2026-02-07 | Don't push standalone PWA | WebKit Bug 198277 — standalone mode gets killed faster than browser tab on iOS. |
| 2026-02-07 | Astro `transition:persist` for audio player | Specific directive that keeps player alive during page navigation. Nano Stores for state. |
| 2026-02-07 | R2 cache bypass rule for /audio/ path | Prevent CDN from stripping Range headers on large files. |
