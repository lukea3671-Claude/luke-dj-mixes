/// <reference types="astro/client" />

// Single source of truth for the global player API exposed by
// BaseLayout.astro. Components must NOT re-declare this — duplicate
// ambient declarations with drifting signatures is how the cover
// param almost silently vanished.
declare global {
  interface Window {
    loadMix: (
      url: string,
      title: string,
      gradient?: string,
      tracks?: Array<{ time: string; name: string; seconds: number }>,
      cover?: string
    ) => void;
  }
}

export {};
