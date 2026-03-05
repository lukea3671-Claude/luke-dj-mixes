#!/usr/bin/env python3
"""
Generate Astro content collection files from analysis reports.

Converts *_report.json files into markdown files with YAML frontmatter
ready for the Astro site's content/mixes collection.

Usage:
    python generate_site_content.py <report.json> [--output-dir <dir>]
    python generate_site_content.py --all <reports_dir> [--output-dir <dir>]
"""

import argparse
import json
import re
import shutil
import sys
import yaml
from pathlib import Path

# Import the liner notes logic
sys.path.insert(0, str(Path(__file__).parent))
from generate_liner_notes import (
    load_report,
    deduplicate_tracklist,
    genre_breakdown,
    format_duration,
    format_timestamp,
    extract_mix_name,
    extract_mix_date,
)


def _energy_label(e: float) -> str:
    """Human-readable energy level."""
    if e < 0.08:
        return "ambient"
    elif e < 0.15:
        return "mellow"
    elif e < 0.22:
        return "moderate"
    elif e < 0.30:
        return "energetic"
    elif e < 0.40:
        return "high-energy"
    else:
        return "intense"


def _energy_bar(e: float, max_e: float, width: int = 10) -> str:
    """Visual energy bar using block characters."""
    if max_e == 0:
        return "░" * width
    ratio = min(e / max_e, 1.0)
    filled = int(ratio * width)
    return "█" * filled + "░" * (width - filled)


def _find_track_at_time(tracks: list, time_s: int) -> str | None:
    """Find which track is playing at a given timestamp."""
    best = None
    for t in tracks:
        if t["start_seconds"] <= time_s:
            best = t
        elif t["start_seconds"] > time_s:
            break
    if best:
        return f'{best["artist"]} — {best["title"]}'
    return None


def build_energy_narrative(
    windows: list,
    energy_arc: dict,
    transitions: list,
    duration_s: float,
    energy_stats: dict,
    tracks: list,
) -> str:
    """Build a rich energy flow narrative from analysis data."""
    if not windows:
        return "## Energy Flow\n\n*Energy data not available.*"

    lines = []
    lines.append("## Energy Flow")
    lines.append("")

    # --- Overall shape description ---
    q_values = [
        energy_arc.get("q1_intro", 0),
        energy_arc.get("q2_buildup", 0),
        energy_arc.get("q3_peak", 0),
        energy_arc.get("q4_outro", 0),
    ]
    energy_range = max(q_values) - min(q_values) if q_values else 0
    peak_quarter = q_values.index(max(q_values)) if q_values else 0

    if energy_range < 0.02:
        shape_desc = "This mix maintains a remarkably consistent energy throughout — a marathon groove that never lets up."
    elif energy_range < 0.05:
        shape_desc = "The energy flows evenly with subtle rises and falls, keeping the momentum alive across the full runtime."
    else:
        shape_map = {
            0: "The mix comes out swinging, front-loading the energy before gradually easing into a cooler groove.",
            1: "A classic build — the energy ramps through the first half before finding its cruising altitude.",
            2: "A slow burn that rewards patience, building steadily into a powerful second half.",
            3: "Patient and deliberate, this mix saves its biggest moments for the final stretch.",
        }
        shape_desc = shape_map.get(peak_quarter, "The energy is distributed evenly across sections.")

    lines.append(shape_desc)
    lines.append("")

    # --- Peak and valley moments with track context ---
    # Find top 3 energy peaks (non-adjacent)
    sorted_windows = sorted(windows, key=lambda w: w.get("energy", 0), reverse=True)
    peaks = []
    for w in sorted_windows:
        t = w.get("time_s", 0)
        if all(abs(t - p["time_s"]) > 120 for p in peaks):
            peaks.append(w)
        if len(peaks) >= 3:
            break

    # Find quietest moment (skip first 60s — mixes always start quiet)
    non_intro = [w for w in windows if w.get("time_s", 0) > 60]
    if non_intro:
        valley = min(non_intro, key=lambda w: w.get("energy", 0))
    else:
        valley = min(windows, key=lambda w: w.get("energy", 0))

    lines.append("### Key Moments")
    lines.append("")

    # Peak moment
    peak = peaks[0]
    peak_time = format_timestamp(peak.get("time_s", 0))
    peak_energy = peak.get("energy", 0)
    peak_track = _find_track_at_time(tracks, peak.get("time_s", 0))
    if peak_track:
        lines.append(f"- **{peak_time}** — Peak energy ({peak_energy:.2f}): {peak_track}")
    else:
        lines.append(f"- **{peak_time}** — Peak energy ({peak_energy:.2f})")

    # Second peak if sufficiently different from first
    if len(peaks) > 1 and peaks[1].get("energy", 0) > 0.8 * peak_energy:
        p2 = peaks[1]
        p2_time = format_timestamp(p2.get("time_s", 0))
        p2_track = _find_track_at_time(tracks, p2.get("time_s", 0))
        if p2_track:
            lines.append(f"- **{p2_time}** — Energy surge ({p2.get('energy', 0):.2f}): {p2_track}")

    # Valley
    valley_time = format_timestamp(valley.get("time_s", 0))
    valley_energy = valley.get("energy", 0)
    valley_track = _find_track_at_time(tracks, valley.get("time_s", 0))
    if valley_track:
        lines.append(f"- **{valley_time}** — Breather ({valley_energy:.2f}): {valley_track}")
    else:
        lines.append(f"- **{valley_time}** — Breather ({valley_energy:.2f})")

    # Only show the single biggest transition if it's truly dramatic (>1.0 change)
    if transitions:
        big = max(transitions, key=lambda t: t.get("energy_change", 0))
        if big.get("energy_change", 0) > 1.0:
            tr_time = format_timestamp(big.get("time_s", 0))
            direction = big.get("direction", "up")
            arrow = "↑" if direction == "up" else "↓"
            tr_track = _find_track_at_time(tracks, big.get("time_s", 0))
            if tr_track:
                lines.append(f"- **{tr_time}** — Biggest shift {arrow}: {tr_track}")

    lines.append("")

    # --- Segment breakdown (8 segments) ---
    num_segments = 8 if duration_s > 3600 else 6 if duration_s > 1800 else 4
    segment_duration = duration_s / num_segments
    max_energy = energy_stats.get("max", 0.5)

    lines.append("### Arc")
    lines.append("")
    lines.append("| Segment | Time | Energy | Level |")
    lines.append("|---------|------|--------|-------|")

    for seg in range(num_segments):
        seg_start = int(seg * segment_duration)
        seg_end = int((seg + 1) * segment_duration)

        # Average energy for windows in this segment
        seg_windows = [w for w in windows if seg_start <= w.get("time_s", 0) < seg_end]
        if seg_windows:
            avg_energy = sum(w.get("energy", 0) for w in seg_windows) / len(seg_windows)
        else:
            avg_energy = 0

        start_fmt = format_timestamp(seg_start)
        end_fmt = format_timestamp(seg_end)
        bar = _energy_bar(avg_energy, max_energy)
        label = _energy_label(avg_energy)

        lines.append(f"| {seg + 1} | {start_fmt}–{end_fmt} | {bar} | {label} |")

    return "\n".join(lines)


def make_slug(filename: str) -> str:
    """Generate a URL-friendly slug from the mix filename."""
    match = re.match(r"(\d+)\.\s*Mix_(.+?)(?:\.mp3)?$", filename, re.IGNORECASE)
    if match:
        num = match.group(1).zfill(2)
        name = match.group(2).lower().replace("_", "-").replace(" ", "-")
        return f"mix-{num}-{name}"
    return re.sub(r"[^a-z0-9]+", "-", filename.lower().replace(".mp3", "")).strip("-")


def extract_mix_number(filename: str) -> int:
    """Extract mix number from filename."""
    match = re.match(r"(\d+)\.", filename)
    return int(match.group(1)) if match else 0


def generate_content_file(report: dict) -> str:
    """Generate a markdown file with YAML frontmatter for Astro content collection."""
    filename = report["filename"]
    af = report["audio_features"]
    ti = report["track_identification"]

    tracks = deduplicate_tracklist(ti["tracklist"])
    genres = genre_breakdown(tracks)

    mix_name = extract_mix_name(filename)
    mix_date = extract_mix_date(filename)
    mix_num = extract_mix_number(filename)
    slug = make_slug(filename)
    duration_fmt = format_duration(af["duration_s"])

    # Build frontmatter
    frontmatter = {
        "title": mix_name,
        "mixNumber": mix_num,
        "date": mix_date,
        "duration": duration_fmt,
        "bpm": int(af["overall_bpm"]),
        "musicalKey": af["overall_key"],
        "trackCount": len(tracks),
        "genres": [
            {"name": g, "count": c, "percent": round(p)}
            for g, c, p in genres
        ],
        "audioFile": f"/audio/{slug}.mp3",
        "peaksFile": f"/audio/{slug}-peaks.json",
        "fileSizeMb": round(report["file_size_mb"], 1),
        "energyMean": round(af["energy"]["mean"], 2),
        "energyMax": round(af["energy"]["max"], 2),
    }

    # Build markdown body
    lines = []

    # Energy Flow
    energy_narrative = build_energy_narrative(
        af.get("windows", []),
        af.get("energy_arc", {}),
        af.get("potential_transitions", []),
        af["duration_s"],
        af["energy"],
        tracks,
    )
    lines.append(energy_narrative)
    lines.append("")

    # Track Listing
    lines.append("## Track Listing")
    lines.append("")
    if tracks:
        lines.append("| # | Time | Artist | Title | Genre |")
        lines.append("|---|------|--------|-------|-------|")
        for i, track in enumerate(tracks, 1):
            ts = format_timestamp(track["start_seconds"])
            artist = track["artist"]
            title = track["title"]
            genre = track.get("genre", "").strip() or "\u2014"
            lines.append(f"| {i} | {ts} | {artist} | {title} | {genre} |")
    lines.append("")
    lines.append(
        f"*{ti['total_tracks_found']} raw Shazam matches deduplicated "
        f"and filtered to {len(tracks)} unique tracks (min 2 confidence hits).*"
    )
    lines.append("")

    # Luke's Notes
    lines.append("## Luke's Notes")
    lines.append("")
    lines.append("*Coming soon...*")

    # Combine frontmatter + body
    fm_yaml = yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True, sort_keys=False)
    body = "\n".join(lines)

    return f"---\n{fm_yaml}---\n\n{body}\n"


def copy_peaks_file(report_path: Path, slug: str, public_audio_dir: Path) -> bool:
    """Copy peaks file for this mix into site/public/audio/ with the slug name."""
    peaks_dir = report_path.parent / "peaks"
    # Peaks filename matches report: e.g. "01. Mix_September_2018_peaks.json"
    stem = report_path.stem.replace("_report", "_peaks")
    peaks_src = peaks_dir / f"{stem}.json"
    if not peaks_src.exists():
        return False
    public_audio_dir.mkdir(parents=True, exist_ok=True)
    dest = public_audio_dir / f"{slug}-peaks.json"
    shutil.copy2(peaks_src, dest)
    return True


def process_report(report_path: Path, output_dir: Path, public_audio_dir: Path | None = None) -> Path:
    """Process a single report and write the Astro content file."""
    report = load_report(report_path)
    content = generate_content_file(report)

    slug = make_slug(report["filename"])
    out_path = output_dir / f"{slug}.md"

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)

    # Auto-copy peaks file if public audio dir is set
    if public_audio_dir:
        if copy_peaks_file(report_path, slug, public_audio_dir):
            print(f"  Copied peaks: {slug}-peaks.json")

    return out_path


def main():
    parser = argparse.ArgumentParser(description="Generate Astro content from analysis reports")
    parser.add_argument("input", help="Report JSON file, or directory if --all is used")
    parser.add_argument("--output-dir", "-o", help="Output directory (default: site content/mixes)")
    parser.add_argument("--all", action="store_true", help="Process all *_report.json in directory")
    args = parser.parse_args()

    input_path = Path(args.input)
    site_root = Path(__file__).parent.parent / "site"
    default_output = site_root / "src" / "content" / "mixes"
    public_audio = site_root / "public" / "audio"

    if args.all:
        if not input_path.is_dir():
            print(f"Error: {input_path} is not a directory", file=sys.stderr)
            sys.exit(1)
        reports = sorted(input_path.glob("*_report.json"))
        if not reports:
            print(f"No *_report.json files found in {input_path}", file=sys.stderr)
            sys.exit(1)
        output_dir = Path(args.output_dir) if args.output_dir else default_output
        output_dir.mkdir(parents=True, exist_ok=True)

        for rp in reports:
            out = process_report(rp, output_dir, public_audio)
            print(f"Generated: {out}")
    else:
        if not input_path.is_file():
            print(f"Error: {input_path} does not exist", file=sys.stderr)
            sys.exit(1)
        output_dir = Path(args.output_dir) if args.output_dir else default_output
        output_dir.mkdir(parents=True, exist_ok=True)

        out = process_report(input_path, output_dir, public_audio)
        print(f"Generated: {out}")


if __name__ == "__main__":
    main()
