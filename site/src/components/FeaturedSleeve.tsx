import { MagicCard } from '@/components/ui/magic-card';

interface Props {
  title: string;
  mixNumber: number;
  gradient: string;
  duration: string;
  bpm: number;
  isAnalyzed: boolean;
  slug: string;
  audioFile: string;
}

declare global {
  interface Window {
    loadMix: (url: string, title: string, gradient?: string) => void;
  }
}

export default function FeaturedSleeve({
  title, mixNumber, gradient, duration, bpm, isAnalyzed, slug, audioFile,
}: Props) {
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.loadMix(audioFile, title, gradient);
  };

  return (
    <div className="max-lg:hidden">
      <a href={`/mix/${slug}/`} className="block no-underline group">
        <MagicCard
          className="relative w-[260px] h-[260px] rounded-lg overflow-hidden border border-border-warm"
          gradientColor="rgba(212, 165, 116, 0.08)"
        >
          <div className="absolute inset-0" style={{ background: gradient }} />
          <span
            className="absolute inset-0 flex items-center justify-center text-[6rem] font-heading font-bold select-none pointer-events-none"
            style={{ color: 'rgba(255, 255, 255, 0.12)' }}
          >
            #{String(mixNumber).padStart(2, '0')}
          </span>
        </MagicCard>
        <div className="mt-3 w-[260px]">
          <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-amber opacity-70 mb-1">
            Now Featured
          </span>
          <h3 className="font-heading text-[1.1rem] font-semibold text-warm-cream leading-tight group-hover:text-amber transition-colors">
            {title}
          </h3>
          <p className="font-mono text-[0.72rem] text-muted-stone mt-1">
            {duration}
            {isAnalyzed && ` \u00B7 ${bpm} BPM`}
          </p>
        </div>
      </a>
      <button
        className="mt-3 w-full py-2 rounded-lg font-mono text-[0.75rem] uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer hover:scale-[1.02]"
        style={{
          background: 'rgba(212, 165, 116, 0.12)',
          color: 'var(--amber)',
          border: '1px solid rgba(212, 165, 116, 0.25)',
        }}
        onClick={handlePlay}
      >
        Play Latest
      </button>
    </div>
  );
}
