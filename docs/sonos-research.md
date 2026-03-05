# DJ Mixes → Sonos: Research Summary
**Date:** 2026-02-28 | **Source:** Perplexity Deep Research (50+ citations)

## Context
- 46 MP3 DJ mixes on Cloudflare R2 (public URLs)
- Web player live at luke-dj-mixes.pages.dev (Chromecast + AirPlay already implemented)
- Mixes also stored locally at E:\Music Mixes\Lukes_Mixes\
- Workstation always-on at 100.116.178.16 (Tailscale)

## Options Evaluated

### 1. AirPlay 2 from Web Player ★ RECOMMENDED (Zero Setup)
- **How:** Open site on iPhone/iPad/Mac → play mix → tap AirPlay icon → select Sonos speaker
- **Setup:** None — already works with your existing site
- **Reliability:** High
- **Audio quality:** Excellent (native MP3 bitrate preserved)
- **UX:** Fair — requires opening website, selecting mix, then AirPlay icon
- **Gotchas:** Apple devices only. Source device stays tied up during playback.

### 2. SMB Share from Workstation ★ RECOMMENDED (Best Native UX)
- **How:** Share E:\Music Mixes\Lukes_Mixes\ via SMB → add to Sonos app as music library
- **Setup:** ~10 minutes (create share, add to Sonos)
- **Reliability:** High
- **Audio quality:** Excellent
- **UX:** Best — browse mixes directly in Sonos app, voice control works
- **Gotchas:** Workstation must be on (it always is). SMBv2/v3 required (default on modern Windows). 65k track limit irrelevant for 46 files.

### 3. Plex / Jellyfin / Emby ✗ NOT RECOMMENDED
- Plex-Sonos integration plagued with connection failures throughout 2025-2026
- Jellyfin DLNA doesn't work with Sonos (UPnP incompatibility)
- Emby plugin unstable, limited docs
- Overkill for 46 files when SMB share works natively

### 4. TuneIn Custom URLs ✗ NOT RECOMMENDED
- URL favoriting broken in new Sonos app (2025+)
- Would need 46 individual entries
- Shows in "Recents" not "Favorites" — unreliable

### 5. Podcast RSS / Pocket Casts ✗ POOR FIT
- Sonos can't import arbitrary RSS feeds
- Pocket Casts works but designed for episodic content, not mix archives
- No playlist/shuffle support for podcasts in Sonos

### 6. Mixcloud / SoundCloud ✗ NOT VIABLE FOR SONOS
- Neither has native Sonos integration
- SoundCloud aggressive on copyright takedowns for DJ mixes
- Mixcloud safe but requires separate app + AirPlay to reach Sonos anyway

### 7. Cast to Sonos Chrome Extension — FALLBACK
- Cross-platform (Windows/Linux/Android)
- Free tier: 128kbps mono (poor). Premium: 320kbps stereo.
- Good backup for non-Apple devices

### 8. node-sonos-http-api — FUTURE OPTION
- Direct URL queuing via HTTP: `http://localhost:5005/[room]/play/[r2-url]`
- Enables "play mix 36" voice commands via Home Assistant
- Requires always-on Node.js service, Home Assistant setup
- Overkill now, but powerful if you want automation later

## Recommendation

**SMB share is the clear winner** — Luke uses Android (Pixel), so AirPlay is out.

## Implementation (Done 2026-02-28)

- SMB share `DJMixes` created pointing to `E:\Music Mixes\Lukes_Mixes\`
- Read access granted to Everyone (share level) + BUILTIN\Users (NTFS level)
- Sonos connection path: `\\100.116.178.16\DJMixes` (Tailscale IP)
- Username: `PREMIER\luke`
