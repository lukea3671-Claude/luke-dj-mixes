import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════
// Shared motion gate — one source of truth for every canvas
// animation on the site.
//
// reducedMotion → render the correct FINAL state, no loops.
//   (The planets still sit at their true Keplerian positions —
//    the physics stays correct, it just doesn't tick.)
// coarse (touch devices) → keep the beauty, cap the cost:
//   lower DPR ceiling + 30fps frame cap.
// ═══════════════════════════════════════════════════════════

const QUERY_REDUCED = '(prefers-reduced-motion: reduce)';
const QUERY_COARSE = '(pointer: coarse)';

export interface MotionPrefs {
  /** User asked for reduced motion — draw static final states. */
  reducedMotion: boolean;
  /** Touch-first device — cap DPR and frame rate on canvas loops. */
  coarse: boolean;
}

export function useMotionPrefs(): MotionPrefs {
  // SSR-safe default: assume full motion, correct on mount.
  const [prefs, setPrefs] = useState<MotionPrefs>({
    reducedMotion: false,
    coarse: false,
  });

  useEffect(() => {
    const mqReduced = window.matchMedia(QUERY_REDUCED);
    const mqCoarse = window.matchMedia(QUERY_COARSE);
    const update = () =>
      setPrefs({
        reducedMotion: mqReduced.matches,
        coarse: mqCoarse.matches,
      });
    update();
    mqReduced.addEventListener('change', update);
    mqCoarse.addEventListener('change', update);
    return () => {
      mqReduced.removeEventListener('change', update);
      mqCoarse.removeEventListener('change', update);
    };
  }, []);

  return prefs;
}

/** DPR ceiling: gradients don't need DPR 3. Coarse devices get 1.5. */
export function capDpr(coarse: boolean): number {
  const raw = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.min(raw, coarse ? 1.5 : 2);
}
