import { useState } from "react";
import MixVisualizer from '@/components/MixVisualizer';

interface MixItem {
  slug: string;
  title: string;
  mixNumber: number;
  gradient: string;
  coverImage?: string;
  duration: string;
  bpm: number;
  isAnalyzed: boolean;
  genre: string;
  year: string;
  trackCount: number;
  energyMean: number;
  musicalKey: string;
  genres: Array<{ name: string; count: number; percent: number }>;
}

interface Props {
  mixes: MixItem[];
  years: string[];
}

export default function ArchiveFocusCards({ mixes, years }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="mb-8 mt-4" id="archive">
      <h2 className="text-[0.8rem] uppercase tracking-[0.12em] text-muted-stone pb-3 border-b border-border-warm mb-6 font-body">
        Archive
      </h2>
      {years.map((year) => {
        const yearMixes = mixes.filter((m) => m.year === year);
        if (yearMixes.length === 0) return null;
        return (
          <div key={year} className="mb-8">
            <h3 className="font-mono text-[0.7rem] text-muted-stone uppercase tracking-[0.15em] mb-2 sticky top-[var(--header-h)] bg-base py-1.5 z-10">
              {year}
            </h3>
            <div className="flex flex-col gap-px bg-border-warm rounded-md overflow-hidden">
              {yearMixes.map((mix) => (
                <a
                  key={mix.slug}
                  href={`/mix/${mix.slug}/`}
                  className="flex items-center gap-3 px-3.5 py-2.5 bg-surface no-underline text-warm-cream transition-all duration-200 border-l-2 border-transparent hover:bg-surface-hover hover:border-l-amber hover:pl-4"
                  style={{
                    opacity: hovered === null || hovered === mix.slug ? 1 : 0.4,
                    filter: hovered !== null && hovered !== mix.slug ? 'blur(1px)' : 'none',
                    transition: 'opacity 0.2s, filter 0.2s, background 0.15s, padding-left 0.15s',
                  }}
                  onMouseEnter={() => setHovered(mix.slug)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="w-8 h-8 rounded flex-shrink-0 sm:w-8 sm:h-8 max-sm:w-6 max-sm:h-6 overflow-hidden" style={{ background: '#0A0A0A' }}>
                    <MixVisualizer
                      data={{
                        mixNumber: mix.mixNumber,
                        bpm: mix.bpm,
                        trackCount: mix.trackCount,
                        energyMean: mix.energyMean,
                        genres: mix.genres,
                        musicalKey: mix.musicalKey,
                        duration: mix.duration,
                      }}
                      viewMode="thumbnail"
                    />
                  </div>
                  <span className="font-mono text-[0.75rem] text-muted-stone w-10 flex-shrink-0 max-sm:hidden">
                    #{String(mix.mixNumber).padStart(2, '0')}
                  </span>
                  <span className="font-heading text-[0.85rem] font-semibold flex-1 truncate min-w-0">
                    {mix.title}
                  </span>
                  <span className="font-mono text-[0.7rem] text-muted-stone flex-shrink-0">
                    {mix.duration}
                  </span>
                  {mix.isAnalyzed && (
                    <span className="font-mono text-[0.7rem] text-muted-stone flex-shrink-0 max-sm:hidden">
                      {mix.bpm} BPM
                    </span>
                  )}
                  {mix.genre && mix.genre !== 'Mixed' && (
                    <span className="text-[0.65rem] px-2 py-0.5 rounded-lg flex-shrink-0 hidden sm:inline-block"
                      style={{
                        background: 'rgba(74, 123, 124, 0.12)',
                        color: '#4A7B7C',
                        border: '1px solid rgba(74, 123, 124, 0.25)',
                      }}
                    >
                      {mix.genre}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
