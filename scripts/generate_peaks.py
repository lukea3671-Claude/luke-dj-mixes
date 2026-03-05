#!/usr/bin/env python3
"""
Generate waveform peaks.json files for WaveSurfer.js.

Uses audiowaveform CLI to pre-generate peaks data server-side,
preventing mobile browsers from crashing on large file client-side decode.

Usage:
    python generate_peaks.py <mp3_file> [--output-dir <dir>]
    python generate_peaks.py --all <mp3_dir> [--output-dir <dir>]

Requires: audiowaveform (winget install BBC.audiowaveform)
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

AUDIOWAVEFORM = (
    r"C:\Users\luke.PREMIER\AppData\Local\Microsoft\WinGet\Packages"
    r"\BBC.audiowaveform_Microsoft.Winget.Source_8wekyb3d8bbwe\audiowaveform.exe"
)

PIXELS_PER_SECOND = 20  # 20 samples/sec = good resolution for 3h mixes
BITS = 8  # 8-bit = small file size, sufficient for visualization


def generate_peaks(mp3_path: Path, output_dir: Path) -> Path:
    """Generate peaks.json for a single MP3 file."""
    out_name = mp3_path.stem + "_peaks.json"
    out_path = output_dir / out_name

    cmd = [
        AUDIOWAVEFORM,
        "-i", str(mp3_path),
        "-o", str(out_path),
        "--pixels-per-second", str(PIXELS_PER_SECOND),
        "--bits", str(BITS),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR generating peaks for {mp3_path.name}: {result.stderr}", file=sys.stderr)
        return None

    # Verify the output is valid JSON and report size
    size_kb = out_path.stat().st_size / 1024
    with open(out_path, encoding="utf-8") as f:
        data = json.load(f)
    sample_count = len(data.get("data", []))
    print(f"Generated: {out_path.name} ({size_kb:.0f} KB, {sample_count} samples)")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Generate waveform peaks for WaveSurfer.js")
    parser.add_argument("input", help="MP3 file or directory (with --all)")
    parser.add_argument("--output-dir", "-o", help="Output directory (default: same as input)")
    parser.add_argument("--all", action="store_true", help="Process all *.mp3 in directory")
    args = parser.parse_args()

    input_path = Path(args.input)

    # Verify audiowaveform exists
    if not Path(AUDIOWAVEFORM).exists():
        print(f"Error: audiowaveform not found at {AUDIOWAVEFORM}", file=sys.stderr)
        print("Install: winget install BBC.audiowaveform", file=sys.stderr)
        sys.exit(1)

    if args.all:
        if not input_path.is_dir():
            print(f"Error: {input_path} is not a directory", file=sys.stderr)
            sys.exit(1)
        mp3s = sorted(input_path.glob("*.mp3"))
        if not mp3s:
            print(f"No *.mp3 files found in {input_path}", file=sys.stderr)
            sys.exit(1)

        output_dir = Path(args.output_dir) if args.output_dir else input_path / "peaks"
        output_dir.mkdir(parents=True, exist_ok=True)

        generated = 0
        skipped = 0
        for mp3 in mp3s:
            peaks_path = output_dir / (mp3.stem + "_peaks.json")
            if peaks_path.exists():
                print(f"Skipping (exists): {peaks_path.name}")
                skipped += 1
                continue
            if generate_peaks(mp3, output_dir):
                generated += 1

        print(f"\nDone: {generated} generated, {skipped} skipped (already exist)")
    else:
        if not input_path.is_file():
            print(f"Error: {input_path} does not exist", file=sys.stderr)
            sys.exit(1)

        output_dir = Path(args.output_dir) if args.output_dir else input_path.parent
        output_dir.mkdir(parents=True, exist_ok=True)
        generate_peaks(input_path, output_dir)


if __name__ == "__main__":
    main()
