// Deterministic gradient from mix data
// BPM → hue base, musicalKey → angle, primaryGenre → saturation/lightness

const KEY_ANGLES: Record<string, number> = {
  'C': 0, 'C#': 30, 'Db': 30, 'D': 60, 'D#': 90, 'Eb': 90,
  'E': 120, 'F': 150, 'F#': 180, 'Gb': 180, 'G': 210,
  'G#': 240, 'Ab': 240, 'A': 270, 'A#': 300, 'Bb': 300, 'B': 330,
  '?': 135,
};

const GENRE_PALETTES: Record<string, { sat: number; lit: number }> = {
  'Dance': { sat: 80, lit: 55 },
  'Electronic': { sat: 70, lit: 45 },
  'House': { sat: 75, lit: 50 },
  'Techno': { sat: 60, lit: 40 },
  'Trance': { sat: 85, lit: 50 },
  'Pop': { sat: 90, lit: 60 },
  'Hip-Hop/Rap': { sat: 65, lit: 45 },
  'R&B/Soul': { sat: 75, lit: 50 },
  'Alternative': { sat: 55, lit: 50 },
  'Electronica': { sat: 65, lit: 48 },
  'Soundtrack': { sat: 40, lit: 40 },
};

const DEFAULT_PALETTE = { sat: 60, lit: 50 };

interface MixData {
  bpm: number;
  musicalKey: string;
  genres: Array<{ name: string; count: number; percent: number }>;
  mixNumber: number;
}

export function getMixGradient(data: MixData): string {
  if (data.bpm <= 0) {
    const hue = (data.mixNumber * 37) % 360;
    return `linear-gradient(135deg, hsl(${hue} 15% 18%), hsl(${hue} 10% 12%))`;
  }

  const hue = ((data.bpm - 100) * 6) % 360;
  const hue2 = (hue + 40) % 360;
  const keyBase = data.musicalKey.replace(/\s*(major|minor|m)$/i, '').trim();
  const angle = KEY_ANGLES[keyBase] ?? 135;
  const primaryGenre = data.genres[0]?.name ?? 'Mixed';
  const palette = GENRE_PALETTES[primaryGenre] ?? DEFAULT_PALETTE;

  return `linear-gradient(${angle}deg, hsl(${hue} ${palette.sat}% ${palette.lit}%), hsl(${hue2} ${palette.sat - 15}% ${palette.lit - 10}%))`;
}

export function getMixGradientMini(data: MixData): string {
  if (data.bpm <= 0) {
    const hue = (data.mixNumber * 37) % 360;
    return `linear-gradient(135deg, hsl(${hue} 12% 14%), hsl(${hue} 8% 10%))`;
  }

  const hue = ((data.bpm - 100) * 6) % 360;
  const hue2 = (hue + 40) % 360;
  const keyBase = data.musicalKey.replace(/\s*(major|minor|m)$/i, '').trim();
  const angle = KEY_ANGLES[keyBase] ?? 135;
  const primaryGenre = data.genres[0]?.name ?? 'Mixed';
  const palette = GENRE_PALETTES[primaryGenre] ?? DEFAULT_PALETTE;

  return `linear-gradient(${angle}deg, hsl(${hue} ${palette.sat - 10}% ${palette.lit - 15}%), hsl(${hue2} ${palette.sat - 25}% ${palette.lit - 25}%))`;
}

export function isAnalyzed(data: MixData): boolean {
  return data.bpm > 0 && data.trackCount > 0;
}
