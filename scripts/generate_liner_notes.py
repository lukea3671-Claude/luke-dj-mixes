#!/usr/bin/env python3
"""
Generate liner notes from DJ mix analysis reports.

Converts *_report.json files into human-readable markdown files
suitable for the DJ Mix Archive website.

Usage:
    python generate_liner_notes.py <report.json> [--output-dir <dir>]
    python generate_liner_notes.py --all <reports_dir> [--output-dir <dir>]
"""

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path


def load_report(path: Path) -> dict:
    """Load a JSON report with UTF-8 encoding."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def format_duration(seconds: float) -> str:
    """Convert seconds to human-readable duration."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m {secs}s"


def parse_time_to_seconds(time_str: str) -> int:
    """Parse 'M:SS' or 'H:MM:SS' to total seconds."""
    parts = time_str.split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    elif len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    return 0


def format_timestamp(seconds: int) -> str:
    """Format seconds as H:MM:SS or M:SS."""
    if seconds >= 3600:
        h = seconds // 3600
        m = (seconds % 3600) // 60
        s = seconds % 60
        return f"{h}:{m:02d}:{s:02d}"
    m = seconds // 60
    s = seconds % 60
    return f"{m}:{s:02d}"


def deduplicate_tracklist(tracklist: list, min_confidence: int = 2) -> list:
    """
    Deduplicate tracks and filter by confidence.

    The analysis scans every 15 seconds, so the same track appears multiple
    times across consecutive slices. We merge consecutive appearances of the
    same artist+title into a single entry with the earliest start time and
    highest confidence.
    """
    if not tracklist:
        return []

    # Sort by start time
    sorted_tracks = sorted(tracklist, key=lambda t: parse_time_to_seconds(t["start_time"]))

    merged = []
    current = None

    for track in sorted_tracks:
        key = f"{track['artist']}|||{track['title']}".lower()

        if current is None:
            current = {
                "artist": track["artist"],
                "title": track["title"],
                "genre": track.get("genre", ""),
                "start_seconds": parse_time_to_seconds(track["start_time"]),
                "end_seconds": parse_time_to_seconds(track["end_time"]),
                "confidence_hits": track.get("confidence_hits", 1),
                "key": key,
            }
            continue

        current_end = current["end_seconds"]
        track_start = parse_time_to_seconds(track["start_time"])

        # If same track and within 90 seconds of the last appearance, merge
        if key == current["key"] and (track_start - current_end) <= 90:
            current["end_seconds"] = max(
                current["end_seconds"], parse_time_to_seconds(track["end_time"])
            )
            current["confidence_hits"] = max(
                current["confidence_hits"], track.get("confidence_hits", 1)
            )
        else:
            merged.append(current)
            current = {
                "artist": track["artist"],
                "title": track["title"],
                "genre": track.get("genre", ""),
                "start_seconds": track_start,
                "end_seconds": parse_time_to_seconds(track["end_time"]),
                "confidence_hits": track.get("confidence_hits", 1),
                "key": key,
            }

    if current:
        merged.append(current)

    # Filter by confidence and remove exact duplicates (same track appearing
    # at different points in the mix is valid — that's the DJ replaying it)
    seen = {}
    filtered = []
    for track in merged:
        if track["confidence_hits"] < min_confidence:
            continue
        dedup_key = track["key"]
        if dedup_key in seen:
            # Keep the one with higher confidence, or the earlier one
            existing = seen[dedup_key]
            if track["confidence_hits"] > existing["confidence_hits"]:
                filtered.remove(existing)
                filtered.append(track)
                seen[dedup_key] = track
        else:
            filtered.append(track)
            seen[dedup_key] = track

    return sorted(filtered, key=lambda t: t["start_seconds"])


def genre_breakdown(tracks: list) -> list[tuple[str, int, float]]:
    """Return genre counts and percentages from deduplicated tracks."""
    genres = Counter()
    for t in tracks:
        g = t.get("genre", "").strip()
        if g:
            genres[g] += 1

    total = sum(genres.values())
    if total == 0:
        return []

    return [
        (genre, count, count / total * 100)
        for genre, count in genres.most_common()
    ]


def describe_energy_arc(energy_arc: dict, windows: list, duration_s: float) -> str:
    """Generate a human-readable energy narrative from the arc and windows."""
    if not energy_arc or not windows:
        return "Energy data not available."

    q1 = energy_arc.get("q1_intro", 0)
    q2 = energy_arc.get("q2_buildup", 0)
    q3 = energy_arc.get("q3_peak", 0)
    q4 = energy_arc.get("q4_outro", 0)
    quarters = [q1, q2, q3, q4]
    quarter_names = ["opening quarter", "second quarter", "third quarter", "final quarter"]

    # Find peak window
    peak_window = max(windows, key=lambda w: w.get("energy", 0))
    peak_time = peak_window.get("time", "?")
    peak_energy = peak_window.get("energy", 0)

    # Find quietest window
    quiet_window = min(windows, key=lambda w: w.get("energy", 0))
    quiet_time = quiet_window.get("time", "?")

    # Determine the overall shape
    peak_quarter = quarters.index(max(quarters))
    energy_range = max(quarters) - min(quarters)

    if energy_range < 0.02:
        shape = "remarkably consistent throughout, maintaining a steady groove"
    elif energy_range < 0.05:
        shape = "relatively even, with subtle shifts across sections"
    else:
        shape_descriptions = {
            0: "front-loaded, opening strong and easing off",
            1: "building through the first half before settling",
            2: "a slow burn that peaks in the second half",
            3: "a patient build to a powerful finish",
        }
        shape = shape_descriptions.get(peak_quarter, "evenly distributed")

    # Energy level descriptions
    def level(e):
        if e < 0.1:
            return "ambient"
        elif e < 0.2:
            return "moderate"
        elif e < 0.3:
            return "energetic"
        elif e < 0.4:
            return "high-energy"
        else:
            return "intense"

    # Build the narrative
    lines = []
    lines.append(
        f"The energy arc is {shape}. "
        f"Peak energy hits at {peak_time} ({level(peak_energy)}), "
        f"while the quietest moment is at {quiet_time}."
    )

    # Quarter-by-quarter
    quarter_duration = duration_s / 4
    for i, (name, energy) in enumerate(zip(quarter_names, quarters)):
        start = format_timestamp(int(i * quarter_duration))
        end = format_timestamp(int((i + 1) * quarter_duration))
        lines.append(f"- **{name.title()}** ({start}–{end}): {level(energy)} energy ({energy:.3f})")

    return "\n".join(lines)


def extract_mix_name(filename: str) -> str:
    """Extract a readable mix name from the filename."""
    # "01. Mix_September_2018.mp3" -> "Mix 01: September 2018"
    match = re.match(r"(\d+)\.\s*Mix_(.+?)(?:\.mp3)?$", filename, re.IGNORECASE)
    if match:
        num = match.group(1)
        name = match.group(2).replace("_", " ")
        return f"Mix {num}: {name}"
    return filename.replace(".mp3", "").replace("_", " ")


def extract_mix_date(filename: str) -> str:
    """Extract the date from the mix filename for metadata."""
    match = re.match(r"\d+\.\s*Mix_(\w+)_(\d{4})", filename)
    if match:
        return f"{match.group(1)} {match.group(2)}"
    return ""


def generate_liner_notes(report: dict) -> str:
    """Generate markdown liner notes from a report dict."""
    filename = report["filename"]
    mix_name = extract_mix_name(filename)
    mix_date = extract_mix_date(filename)
    af = report["audio_features"]
    ti = report["track_identification"]

    duration_s = af["duration_s"]
    duration_fmt = format_duration(duration_s)
    bpm = af["overall_bpm"]
    key = af["overall_key"]
    energy = af["energy"]

    # Deduplicate tracklist
    tracks = deduplicate_tracklist(ti["tracklist"])
    genres = genre_breakdown(tracks)

    # Build markdown
    lines = []

    # --- Header ---
    lines.append(f"# {mix_name}")
    lines.append("")
    if mix_date:
        lines.append(f"*Recorded {mix_date}*")
        lines.append("")

    # --- Mix Overview ---
    lines.append("## Overview")
    lines.append("")
    lines.append(f"| | |")
    lines.append(f"|---|---|")
    lines.append(f"| **Duration** | {duration_fmt} |")
    lines.append(f"| **BPM** | {bpm:.0f} |")
    lines.append(f"| **Key** | {key} |")
    lines.append(f"| **Avg Energy** | {energy['mean']:.2f} |")
    lines.append(f"| **Peak Energy** | {energy['max']:.2f} |")
    lines.append(f"| **Tracks Identified** | {len(tracks)} |")
    lines.append(f"| **File Size** | {report['file_size_mb']:.1f} MB |")
    lines.append("")

    # --- Genre Breakdown ---
    if genres:
        lines.append("## Genre Breakdown")
        lines.append("")
        for genre, count, pct in genres:
            bar = "█" * max(1, int(pct / 5))
            lines.append(f"- **{genre}** — {count} tracks ({pct:.0f}%) {bar}")
        lines.append("")

    # --- Energy Narrative ---
    lines.append("## Energy Flow")
    lines.append("")
    narrative = describe_energy_arc(
        af.get("energy_arc", {}), af.get("windows", []), duration_s
    )
    lines.append(narrative)
    lines.append("")

    # --- Track Listing ---
    lines.append("## Track Listing")
    lines.append("")
    if tracks:
        lines.append("| # | Time | Artist | Title | Genre |")
        lines.append("|---|------|--------|-------|-------|")
        for i, track in enumerate(tracks, 1):
            ts = format_timestamp(track["start_seconds"])
            artist = track["artist"]
            title = track["title"]
            genre = track.get("genre", "").strip() or "—"
            lines.append(f"| {i} | {ts} | {artist} | {title} | {genre} |")
    else:
        lines.append("*No tracks identified with sufficient confidence.*")
    lines.append("")
    lines.append(
        f"*{ti['total_tracks_found']} raw Shazam matches deduplicated "
        f"and filtered to {len(tracks)} unique tracks (min 2 confidence hits).*"
    )
    lines.append("")

    # --- Luke's Commentary ---
    lines.append("## Luke's Notes")
    lines.append("")
    lines.append("<!-- PLACEHOLDER: Add your personal commentary about this mix here. -->")
    lines.append("<!-- What was going on in your life? What was the vibe? Any stories behind track selections? -->")
    lines.append("")
    lines.append("*Coming soon...*")
    lines.append("")

    # --- Metadata footer ---
    lines.append("---")
    lines.append("")
    lines.append(
        f"*Analysis generated on {report.get('analyzed_at', 'unknown')} "
        f"using ShazamIO + librosa. "
        f"Scan time: {ti.get('scan_time_s', 0):.0f}s, "
        f"Analysis time: {af.get('analysis_time_s', 0):.0f}s.*"
    )
    lines.append("")

    return "\n".join(lines)


def process_report(report_path: Path, output_dir: Path) -> Path:
    """Process a single report and write the markdown file."""
    report = load_report(report_path)
    markdown = generate_liner_notes(report)

    # Output filename: same stem but .md
    out_name = report_path.stem.replace("_report", "_liner_notes") + ".md"
    out_path = output_dir / out_name

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(markdown)

    return out_path


def main():
    parser = argparse.ArgumentParser(description="Generate liner notes from analysis reports")
    parser.add_argument("input", help="Report JSON file, or directory if --all is used")
    parser.add_argument("--output-dir", "-o", help="Output directory (default: same as input)")
    parser.add_argument("--all", action="store_true", help="Process all *_report.json in directory")
    args = parser.parse_args()

    input_path = Path(args.input)

    if args.all:
        if not input_path.is_dir():
            print(f"Error: {input_path} is not a directory", file=sys.stderr)
            sys.exit(1)
        reports = sorted(input_path.glob("*_report.json"))
        if not reports:
            print(f"No *_report.json files found in {input_path}", file=sys.stderr)
            sys.exit(1)
        output_dir = Path(args.output_dir) if args.output_dir else input_path
        output_dir.mkdir(parents=True, exist_ok=True)

        for rp in reports:
            out = process_report(rp, output_dir)
            print(f"Generated: {out}")
    else:
        if not input_path.is_file():
            print(f"Error: {input_path} does not exist", file=sys.stderr)
            sys.exit(1)
        output_dir = Path(args.output_dir) if args.output_dir else input_path.parent
        output_dir.mkdir(parents=True, exist_ok=True)

        out = process_report(input_path, output_dir)
        print(f"Generated: {out}")


if __name__ == "__main__":
    main()
