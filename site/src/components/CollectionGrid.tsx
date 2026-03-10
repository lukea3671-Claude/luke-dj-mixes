import { useState, useMemo } from "react";
import { MagicCard } from "@/components/ui/magic-card";
import { TextAnimate } from "@/components/ui/text-animate";

interface MixItem {
  slug: string;
  title: string;
  mixNumber: number;
  gradient: string;
  duration: string;
  bpm: number;
  isAnalyzed: boolean;
  genres: string[];
  date: string;
}

interface Props {
  mixes: MixItem[];
  allGenres: string[];
}

export default function CollectionGrid({ mixes, allGenres }: Props) {
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");

  const tabs = ["All", ...allGenres];

  const filtered = useMemo(() => {
    return mixes.filter((mix) => {
      const matchesGenre = activeGenre === "All" || mix.genres.includes(activeGenre);
      const matchesSearch = search === "" || mix.title.toLowerCase().includes(search.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [mixes, activeGenre, search]);

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search mixes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-surface border border-border-warm text-warm-cream font-body text-sm placeholder:text-muted-stone/50 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/30 transition-colors"
        />
      </div>

      {/* Genre tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveGenre(tab)}
            className="px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 cursor-pointer border"
            style={{
              background: activeGenre === tab ? 'rgba(212, 165, 116, 0.15)' : 'var(--surface)',
              color: activeGenre === tab ? '#D4A574' : '#8A7E72',
              borderColor: activeGenre === tab ? 'rgba(212, 165, 116, 0.3)' : 'var(--border)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((mix) => (
            <a key={mix.slug} href={`/mix/${mix.slug}/`} className="block no-underline group">
              <MagicCard
                className="rounded-lg overflow-hidden border border-border-warm h-full"
                gradientColor="rgba(212, 165, 116, 0.06)"
              >
                {/* Gradient square */}
                <div
                  className="aspect-square relative"
                  style={{ background: mix.gradient }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[3rem] sm:text-[4rem] font-heading font-bold text-white/[0.06] select-none pointer-events-none">
                    #{String(mix.mixNumber).padStart(2, '0')}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3 bg-surface">
                  <h3 className="font-heading text-[0.85rem] font-semibold text-warm-cream truncate leading-tight">
                    {mix.title}
                  </h3>
                  <p className="font-mono text-[0.7rem] text-muted-stone mt-1">
                    {mix.duration}
                    {mix.isAnalyzed && ` · ${mix.bpm} BPM`}
                  </p>
                  {mix.genres.length > 0 && mix.genres[0] !== 'Mixed' && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {mix.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="text-[0.6rem] px-1.5 py-0.5 rounded-md"
                          style={{
                            background: 'rgba(74, 123, 124, 0.12)',
                            color: '#4A7B7C',
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </MagicCard>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <TextAnimate animation="blurIn" className="text-muted-stone text-lg">
            No mixes found
          </TextAnimate>
        </div>
      )}
    </div>
  );
}
