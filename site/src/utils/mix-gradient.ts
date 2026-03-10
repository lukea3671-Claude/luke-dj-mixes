// Deterministic gradient from mix data — The Crate warm palette
// Analyzed: BPM → hue (warm-shifted), musicalKey → angle, genre → palette
// Unanalyzed: golden angle distribution with amber/sepia warmth

const KEY_ANGLES: Record<string, number> = {
  'C': 0, 'C#': 30, 'Db': 30, 'D': 60, 'D#': 90, 'Eb': 90,
  'E': 120, 'F': 150, 'F#': 180, 'Gb': 180, 'G': 210,
  'G#': 240, 'Ab': 240, 'A': 270, 'A#': 300, 'Bb': 300, 'B': 330,
  '?': 135,
};

const GENRE_PALETTES: Record<string, { sat: number; lit: number }> = {
  'Dance': { sat: 55, lit: 35 },
  'Electronic': { sat: 50, lit: 30 },
  'House': { sat: 55, lit: 32 },
  'Techno': { sat: 45, lit: 28 },
  'Trance': { sat: 60, lit: 35 },
  'Pop': { sat: 60, lit: 38 },
  'Hip-Hop/Rap': { sat: 45, lit: 30 },
  'R&B/Soul': { sat: 50, lit: 32 },
  'Alternative': { sat: 40, lit: 30 },
  'Electronica': { sat: 48, lit: 30 },
  'Soundtrack': { sat: 30, lit: 28 },
};

const DEFAULT_PALETTE = { sat: 45, lit: 32 };

interface MixData {
  bpm: number;
  musicalKey: string;
  genres: Array<{ name: string; count: number; percent: number }>;
  mixNumber: number;
}

function goldenHue(n: number): number {
  return (n * 137.508) % 360;
}

// Shift hue toward warm range (amber/sepia: ~20-50)
function warmShift(hue: number): number {
  const warmTarget = 30;
  return (hue * 0.6 + warmTarget * 0.4) % 360;
}

export function getMixGradient(data: MixData): string {
  if (data.bpm <= 0) {
    const hue = goldenHue(data.mixNumber);
    const warmHue = warmShift(hue);
    const hue2 = (warmHue + 25) % 360;
    const angle = (data.mixNumber * 47) % 360;
    const sat = 30 + (data.mixNumber % 4) * 5;
    const lit = 18 + (data.mixNumber % 3) * 4;
    return `linear-gradient(${angle}deg, hsl(${warmHue} ${sat}% ${lit}%), hsl(${hue2} ${Math.max(sat - 8, 20)}% ${Math.max(lit - 5, 12)}%))`;
  }

  const rawHue = (((data.bpm - 100) * 6) % 360 + 360) % 360;
  const hue = warmShift(rawHue);
  const hue2 = (hue + 35) % 360;
  const keyBase = data.musicalKey.replace(/\s*(major|minor|m)$/i, '').trim();
  const angle = KEY_ANGLES[keyBase] ?? 135;
  const primaryGenre = data.genres[0]?.name ?? 'Mixed';
  const palette = GENRE_PALETTES[primaryGenre] ?? DEFAULT_PALETTE;

  return `linear-gradient(${angle}deg, hsl(${hue} ${palette.sat}% ${palette.lit}%), hsl(${hue2} ${palette.sat - 12}% ${palette.lit - 8}%))`;
}

export function getMixGradientMini(data: MixData): string {
  if (data.bpm <= 0) {
    const hue = goldenHue(data.mixNumber);
    const warmHue = warmShift(hue);
    const hue2 = (warmHue + 20) % 360;
    const angle = (data.mixNumber * 47) % 360;
    const sat = 25 + (data.mixNumber % 4) * 4;
    const lit = 15 + (data.mixNumber % 3) * 3;
    return `linear-gradient(${angle}deg, hsl(${warmHue} ${sat}% ${lit}%), hsl(${hue2} ${Math.max(sat - 8, 18)}% ${Math.max(lit - 4, 10)}%))`;
  }

  const rawHue = (((data.bpm - 100) * 6) % 360 + 360) % 360;
  const hue = warmShift(rawHue);
  const hue2 = (hue + 35) % 360;
  const keyBase = data.musicalKey.replace(/\s*(major|minor|m)$/i, '').trim();
  const angle = KEY_ANGLES[keyBase] ?? 135;
  const primaryGenre = data.genres[0]?.name ?? 'Mixed';
  const palette = GENRE_PALETTES[primaryGenre] ?? DEFAULT_PALETTE;

  return `linear-gradient(${angle}deg, hsl(${hue} ${palette.sat - 10}% ${palette.lit - 12}%), hsl(${hue2} ${palette.sat - 22}% ${palette.lit - 18}%))`;
}

export function getMixGlowColor(data: MixData): string {
  return `rgba(212, 165, 116, 0.35)`;
}

export function isAnalyzed(data: MixData): boolean {
  return data.bpm > 0 && data.trackCount > 0;
}
