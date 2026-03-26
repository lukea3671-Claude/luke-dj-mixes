# Liner Notes Design Spec

**Date:** 2026-03-26
**Status:** Approved

## Summary

Generate deep, narrative liner notes for all 46 mixes in the DJ Mix Archive. Written in warm vinyl gatefold sleeve tone, with full awareness of the 7-year arc (2018-2025). Each mix gets 8+ paragraphs covering tracklist story, energy arc, recurring artists, genre evolution, standout DJ moments, and connection to the broader journey.

## Approach: Master Arc + Chronological Deep Writes

### Phase 1: Master Arc Analysis
- Read all 46 analysis reports (JSON)
- Extract cross-mix patterns: artist recurrence, genre evolution, BPM/key trends, energy patterns, mix length progression
- Write comprehensive "7-Year Arc" reference document
- This becomes shared context for every liner note

### Phase 2: Chronological Liner Notes (01 → 46)
- Write notes in strict chronological order
- Each note gets: master arc + that mix's report + awareness of all prior notes
- 8+ paragraphs per mix, vinyl gatefold tone
- Inject into each mix's markdown file under `## Liner Notes`

### Phase 3: Build & Deploy
- Rebuild site, verify rendering
- Deploy to Cloudflare Pages

## Per-Mix Note Structure
1. Opening hook — scene-setting for this specific mix
2. Timeline position — what came before, what's shifting
3. Tracklist story — notable selections, what they reveal
4. Recurring artists — who's back, who's gone, what it means
5. Energy arc narrative — how the mix breathes
6. Genre observations — this mix vs the broader journey
7. Standout DJ moments — long rides, bold transitions
8. The mix's character — what mood it serves
9. Connection to the arc — where this chapter fits

## Tone
Vinyl liner notes — warm, intimate, written as if printed inside a gatefold sleeve. Not a review, not criticism. A companion to the listening experience.

## Technical Integration
- Notes added as `## Liner Notes` in `src/content/mixes/mix-NN-*.md`
- Page template already parses this section (line 52: regex for `## Liner Notes`)
- `LinerNotesIntro` component animates first paragraph via `TextGenerateEffect`
- No "Luke's Notes" section until Luke builds that out separately

## Data Sources
- 46 analysis reports in `E:\Music Mixes\Lukes_Mixes\analysis\`
- Each report contains: tracklist, BPM, key, energy arc, genres, transitions, brightness, percussiveness
- Existing observations from Mixes 04-06 and 10-12 in project memory
