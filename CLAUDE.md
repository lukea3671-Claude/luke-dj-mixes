# DJ Mix Archive

Self-hosted streaming site to replace SoundCloud — Luke's complete DJ mix collection with AI-generated liner notes.

## Quick Reference

```bash
# Development
cd C:\AI\Projects\Personal\dj-mix-archive\site
npm run dev          # Astro dev server

# Build
npm run build        # Output to site/dist/

# Generate content from analysis reports
python scripts/generate_site_content.py    # All mixes
python scripts/generate_liner_notes.py     # Liner notes only
python scripts/generate_peaks.py           # Waveform peak data
```

## Directory Structure

```
dj-mix-archive/
├── CLAUDE.md               # This file
├── README.md               # Project overview + 46-mix status table
├── research/               # Deep research documents
│   ├── chatgpt-deep-research-2026-02-07.pdf
│   ├── gemini-deep-research-2026-02-07.docx
│   ├── chatgpt-ui-research-2026-02-07.docx
│   ├── gemini-ui-research-2026-02-07.docx
│   └── extracted-text.txt
├── scripts/                # Content generation pipeline
│   ├── generate_all_content.py    # Master generator
│   ├── generate_liner_notes.py    # AI liner notes from analysis reports
│   ├── generate_peaks.py          # Waveform peak data for WaveSurfer.js
│   └── generate_site_content.py   # Astro content collection entries
└── site/                   # Astro static site
    ├── astro.config.mjs    # Site: mixes.lukeanderson.au
    ├── package.json        # Astro 5.17 + wavesurfer.js 7.12
    ├── tsconfig.json
    ├── public/
    │   ├── audio/          # Audio preview files
    │   ├── favicon.ico
    │   └── favicon.svg
    └── src/
        ├── content/
        │   └── mixes/      # 46 markdown files (mix-NN-month-year.md)
        ├── content.config.ts
        ├── components/     # (empty — components inline in layouts)
        ├── layouts/
        │   └── BaseLayout.astro   # Main layout (retro vinyl theme)
        └── pages/
            ├── index.astro        # Homepage — mix grid
            ├── feed.xml.ts        # Podcast RSS feed
            └── mix/
                └── [...slug].astro  # Dynamic mix detail page
```

## Architecture

```
Analysis Reports (JSON)  →  Content Scripts (Python)  →  Astro Content Collection (MD)
  E:\Music Mixes\             scripts/                     site/src/content/mixes/
  Lukes_Mixes\analysis\                                         ↓
                                                          Astro Build → Static HTML
                                                               ↓
                                                     Cloudflare Pages (planned)
                                                     Cloudflare R2 (audio, ~$1.50/mo)
```

## Key Files

| File | Purpose |
|------|---------|
| `site/src/layouts/BaseLayout.astro` | Main layout — warm retro vinyl theme (orange/brown/cream), Bitter serif headings, film grain overlay |
| `site/src/pages/index.astro` | Homepage with mix grid |
| `site/src/pages/mix/[...slug].astro` | Mix detail page — liner notes, tracklist, WaveSurfer.js waveform player |
| `site/src/pages/feed.xml.ts` | Podcast RSS feed for podcast apps |
| `site/src/content.config.ts` | Astro content collection schema |
| `scripts/generate_liner_notes.py` | Creates AI liner notes from analysis JSON — narratives, not just track lists |
| `scripts/generate_site_content.py` | Generates markdown content entries for each mix |

## Theme & Design

- **Colors**: Warm retro vinyl — orange (#D4742C), brown (#5C3D2E), cream (#FAF3E8)
- **Typography**: Bitter (serif) for headings, system fonts for body
- **Effects**: Film grain overlay, vinyl record imagery
- **Player**: WaveSurfer.js waveform visualization
- **SEO**: Structured data (MusicRecording schema), Open Graph tags

## External Data

| Location | Contents |
|----------|----------|
| `E:\Music Mixes\Lukes_Mixes\` | 46 MP3 mixes (source audio) |
| `E:\Music Mixes\Lukes_Mixes\analysis\` | JSON analysis reports |
| `E:\Music Mixes\DJ Songs\` | Individual downloaded tracks |

## Project Status

- Phase 1: Analyses — 2/46 complete (Mix 01, Mix 36)
- Phase 2: Liner notes pipeline — DONE
- Phase 3: Site infrastructure — UI done, needs Cloudflare R2 + domain
- Phase 4: Launch — pending

## Agent Guidance

- Read relevant source files BEFORE implementing changes. Do not rush to solutions.
- Take your time. Think carefully before acting on complex tasks.
- If unsure about architecture or approach, ask questions before writing code.
- After completing work, consider running `/post-build-review` to capture learnings.
- Luke's mixes tell stories — liner notes should analyze the emotional journey, not just list tracks.

## Self-Verification Rule (NON-NEGOTIABLE)

**Every change MUST be self-verified before presenting to Luke.**

1. After any visual/UI change: build, deploy, and check it yourself using browser tools (screenshot, zoom, inspect).
2. NEVER say "refresh and check" or "take a look" unless YOU have already verified the result looks correct.
3. If browser tools are unavailable: explicitly tell Luke "I can't verify this visually right now" — do NOT ask him to check on your behalf.
4. If verification reveals an issue: fix it before presenting. Luke should see finished work, not half-fixes.

This applies to every change, every deploy, every session. No exceptions.

---

*Last updated: 2026-02-15*
