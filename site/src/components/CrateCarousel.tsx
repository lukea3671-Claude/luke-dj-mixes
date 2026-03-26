import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';
import VinylGroove from '@/components/VinylGroove';

interface MixItem {
  slug: string;
  title: string;
  mixNumber: number;
  gradient: string;
  coverImage?: string;
  duration: string;
  audioFile: string;
  isAnalyzed: boolean;
  bpm: number;
  trackCount: number;
  energyMean: number;
}

interface Props {
  mixes: MixItem[];
}

declare global {
  interface Window {
    loadMix: (url: string, title: string, gradient?: string) => void;
  }
}

export default function CrateCarousel({ mixes }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollButtons);
  }, [updateScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -280 : 280;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    el.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  const handlePlay = (e: React.MouseEvent, mix: MixItem) => {
    e.preventDefault();
    e.stopPropagation();
    window.loadMix(mix.audioFile, mix.title, mix.gradient);
  };

  return (
    <section className="relative py-6" role="region" aria-label="Mix collection carousel">
      <h2
        className="font-mono text-xs uppercase tracking-[0.15em] mb-4"
        style={{ color: 'var(--muted-stone)' }}
      >
        The Crate
      </h2>

      {/* Scroll arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(10, 10, 10, 0.85)',
            border: '1px solid var(--border)',
            color: 'var(--warm-cream)',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Scroll left"
        >
          &#8249;
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(10, 10, 10, 0.85)',
            border: '1px solid var(--border)',
            color: 'var(--warm-cream)',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Scroll right"
        >
          &#8250;
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 cursor-grab select-none"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {mixes.map((mix) => (
          <motion.a
            key={mix.slug}
            href={`/mix/${mix.slug}/`}
            className="flex-shrink-0 group block"
            style={{ scrollSnapAlign: 'start' }}
            onClick={(e) => isDragging && e.preventDefault()}
            whileHover="hover"
          >
            {/* Square sleeve with MagicCard spotlight */}
            <motion.div
              className="relative"
              variants={{
                hover: {
                  y: -6,
                  transition: { duration: 0.25, ease: [0.2, 0, 0.2, 1] },
                },
              }}
            >
              <div
                className="relative w-[220px] h-[220px] rounded-lg overflow-hidden sm:w-[240px] sm:h-[240px] border border-border-warm flex items-center justify-center"
                style={{ background: mix.gradient }}
              >
                {/* Vinyl groove visualization */}
                <VinylGroove
                  trackCount={mix.trackCount}
                  bpm={mix.bpm}
                  energyMean={mix.energyMean}
                  mixNumber={mix.mixNumber}
                  size={240}
                />
                {/* Mix number overlay */}
                <span
                  className="absolute top-3 left-3 font-heading text-lg font-bold select-none pointer-events-none"
                  style={{ color: 'rgba(212, 165, 116, 0.5)' }}
                >
                  #{String(mix.mixNumber).padStart(2, '0')}
                </span>
                {/* Date subtitle */}
                <span
                  className="absolute top-8 left-3 font-mono text-[0.55rem] uppercase tracking-wider select-none pointer-events-none"
                  style={{ color: 'rgba(212, 165, 116, 0.3)' }}
                >
                  {mix.duration}
                </span>
              </div>
              {/* Play button on hover — outside MagicCard to avoid its border glow */}
              <button
                className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 z-20 hover:scale-110"
                style={{
                  background: 'var(--amber)',
                  color: '#0A0A0A',
                  border: 'none',
                  boxShadow: '0 0 16px rgba(212, 165, 116, 0.5), 0 0 40px rgba(212, 165, 116, 0.2)',
                }}
                onClick={(e) => handlePlay(e, mix)}
                aria-label={`Play ${mix.title}`}
                tabIndex={0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </motion.div>

            {/* Title + metadata below card */}
            <div className="mt-2 w-[220px] sm:w-[240px]">
              <h3
                className="font-heading text-[1rem] font-semibold truncate leading-tight"
                style={{ color: 'var(--warm-cream)' }}
              >
                {mix.title}
              </h3>
              <p
                className="font-mono text-[0.72rem] mt-0.5"
                style={{ color: 'var(--muted-stone)' }}
              >
                {mix.duration}
                {mix.isAnalyzed && ` \u00B7 ${mix.bpm} BPM`}
              </p>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .crate-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
