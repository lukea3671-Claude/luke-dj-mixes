#!/usr/bin/env python3
"""
Generate Astro content files for ALL 46 mixes.

- Mixes WITH analysis reports: full content (tracks, energy, genres)
- Mixes WITHOUT analysis reports: stub content (duration, size, no tracks)
- All audioFile URLs point to Cloudflare R2
- All peaksFile URLs point to local /audio/ (served from site)
- Copies all peaks files to site/public/audio/ with slug names
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

# Paths
MIXES_DIR = Path(r"E:\Music Mixes\Lukes_Mixes")
ANALYSIS_DIR = MIXES_DIR / "analysis"
PEAKS_DIR = ANALYSIS_DIR / "peaks"
SITE_ROOT = Path(__file__).parent.parent / "site"
CONTENT_DIR = SITE_ROOT / "src" / "content" / "mixes"
PUBLIC_AUDIO = SITE_ROOT / "public" / "audio"

R2_BASE = "https://pub-62caaf6ac9934395aecdbd0b909cfe24.r2.dev/audio"

# audiowaveform for duration detection
FFPROBE = "ffprobe"

# Import the existing content generator for analyzed mixes
sys.path.insert(0, str(Path(__file__).parent))
try:
    from generate_site_content import generate_content_file, make_slug, extract_mix_number
    from generate_liner_notes import load_report
    HAS_GENERATOR = True
except ImportError:
    HAS_GENERATOR = False


def get_mp3_duration_s(mp3_path: Path) -> float:
    """Get duration in seconds using ffprobe."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(mp3_path)],
            capture_output=True, text=True, timeout=30
        )
        return float(result.stdout.strip())
    except Exception:
        # Fallback: estimate from file size (128kbps MP3)
        size_bytes = mp3_path.stat().st_size
        return size_bytes / (128 * 1000 / 8)


def format_duration(seconds: float) -> str:
    """Format seconds as 'Xh Ym' or 'Ym Zs'."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


def make_slug_from_filename(filename: str) -> str:
    """Generate URL-friendly slug from mix filename."""
    match = re.match(r"(\d+)\.\s*Mix_(.+?)(?:\.mp3)?$", filename, re.IGNORECASE)
    if match:
        num = match.group(1).zfill(2)
        name = match.group(2).lower().replace("_", "-").replace(" ", "-")
        # Remove trailing parens like "(2)"
        name = re.sub(r'-?\(\d+\)$', '', name).strip('-')
        return f"mix-{num}-{name}"
    return re.sub(r"[^a-z0-9]+", "-", filename.lower().replace(".mp3", "")).strip("-")


def extract_date_from_filename(filename: str) -> str:
    """Extract date string like 'September 2018' from filename."""
    match = re.match(r"\d+\.\s*Mix_(.+?)(?:\s*\(\d+\))?\.mp3$", filename, re.IGNORECASE)
    if match:
        raw = match.group(1).replace("_", " ")
        return raw
    return "Unknown"


def extract_number_from_filename(filename: str) -> int:
    """Extract mix number from filename."""
    match = re.match(r"(\d+)\.", filename)
    return int(match.group(1)) if match else 0


def r2_audio_url(filename: str) -> str:
    """Build R2 URL for an MP3 file."""
    from urllib.parse import quote
    return f"{R2_BASE}/{quote(filename)}"


def generate_stub_content(mp3_path: Path) -> str:
    """Generate a stub markdown file for a mix without analysis."""
    filename = mp3_path.name
    slug = make_slug_from_filename(filename)
    mix_num = extract_number_from_filename(filename)
    mix_date = extract_date_from_filename(filename)
    duration_s = get_mp3_duration_s(mp3_path)
    duration_fmt = format_duration(duration_s)
    size_mb = round(mp3_path.stat().st_size / (1024 * 1024), 1)

    title = f"Mix {mix_num:02d}: {mix_date}"

    frontmatter = f"""---
title: '{title}'
mixNumber: {mix_num}
date: {mix_date}
duration: {duration_fmt}
bpm: 0
musicalKey: '?'
trackCount: 0
genres:
- name: Mixed
  count: 1
  percent: 100
audioFile: {r2_audio_url(filename)}
peaksFile: /audio/{slug}-peaks.json
fileSizeMb: {size_mb}
energyMean: 0
energyMax: 0
---

## Track Listing

*Analysis pending — track identification will be added when Shazam analysis completes.*

## Luke's Notes

*Coming soon...*
"""
    return frontmatter


def generate_analyzed_content(report_path: Path) -> str:
    """Generate full content for an analyzed mix, with R2 audio URL."""
    report = load_report(report_path)
    content = generate_content_file(report)

    # Replace the local audioFile path with R2 URL
    filename = report["filename"]
    r2_url = r2_audio_url(filename)
    slug = make_slug_from_filename(filename)

    # Fix audioFile in frontmatter
    content = re.sub(
        r"audioFile: .+",
        f"audioFile: {r2_url}",
        content
    )
    # Fix peaksFile to use slug format
    content = re.sub(
        r"peaksFile: .+",
        f"peaksFile: /audio/{slug}-peaks.json",
        content
    )

    return content


def copy_peaks(mp3_path: Path, slug: str):
    """Copy peaks file to public/audio/ with slug name."""
    peaks_name = mp3_path.stem + "_peaks.json"
    peaks_src = PEAKS_DIR / peaks_name
    if peaks_src.exists():
        dest = PUBLIC_AUDIO / f"{slug}-peaks.json"
        shutil.copy2(peaks_src, dest)
        return True
    return False


def main():
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_AUDIO.mkdir(parents=True, exist_ok=True)

    mp3s = sorted(MIXES_DIR.glob("*.mp3"))
    reports = {r.stem.replace("_report", ""): r for r in ANALYSIS_DIR.glob("*_report.json")}

    print(f"Found {len(mp3s)} MP3 files")
    print(f"Found {len(reports)} analysis reports")
    print()

    generated = 0
    stubs = 0
    peaks_copied = 0

    for mp3 in mp3s:
        slug = make_slug_from_filename(mp3.name)
        mix_num = extract_number_from_filename(mp3.name)
        out_path = CONTENT_DIR / f"{slug}.md"

        # Check if we have an analysis report
        report_key = mp3.stem  # e.g. "01. Mix_September_2018"
        report_path = reports.get(report_key)

        if report_path and HAS_GENERATOR:
            content = generate_analyzed_content(report_path)
            print(f"[FULL] #{mix_num:02d} {mp3.name}")
        else:
            content = generate_stub_content(mp3)
            print(f"[STUB] #{mix_num:02d} {mp3.name}")
            stubs += 1

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(content)
        generated += 1

        # Copy peaks
        if copy_peaks(mp3, slug):
            peaks_copied += 1

    print()
    print(f"Generated: {generated} content files ({generated - stubs} full, {stubs} stubs)")
    print(f"Peaks copied: {peaks_copied}")
    print(f"Output: {CONTENT_DIR}")


if __name__ == "__main__":
    main()
