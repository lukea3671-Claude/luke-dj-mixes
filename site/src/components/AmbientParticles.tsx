import { Particles } from "@/components/ui/particles";
import { useMotionPrefs } from "@/lib/motion";

// Orange-to-yellow star spectrum — how we actually see stars
// HSL hue 25-55, high saturation, varied lightness
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate 30 unique star colors across the warm spectrum
const STAR_COLORS = Array.from({ length: 30 }, (_, i) => {
  const hue = 25 + (i / 29) * 30;         // 25-55 (orange to yellow)
  const sat = 65 + (i % 7) * 5;            // 65-95%
  const lit = 55 + ((i * 7) % 11) * 3.5;   // 55-93% varied
  return hslToHex(hue, sat, lit);
});

export default function AmbientParticles() {
  const { reducedMotion, coarse } = useMotionPrefs();

  return (
    <Particles
      // Remount when prefs resolve so frozen/quantity take effect cleanly
      key={`${reducedMotion}-${coarse}`}
      className="fixed inset-0 z-0 pointer-events-none"
      quantity={coarse ? 24 : 40}
      colors={STAR_COLORS}
      size={0.3}
      staticity={60}
      ease={80}
      // Reduced motion: the sky keeps its stars — they just hold still.
      frozen={reducedMotion}
      coarse={coarse}
    />
  );
}
