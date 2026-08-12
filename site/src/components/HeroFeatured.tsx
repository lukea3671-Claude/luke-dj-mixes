import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { TextAnimate } from "@/components/ui/text-animate";


interface Props {
  title: string;
  mixNumber: number;
  date: string;
  duration: string;
  bpm: number;
  isAnalyzed: boolean;
  gradient: string;
  coverImage?: string;
  audioFile: string;
  slug: string;
}

export default function HeroFeatured({
  title, mixNumber, date, duration, bpm, isAnalyzed, gradient, coverImage, audioFile, slug
}: Props) {
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.loadMix(audioFile, title, gradient, undefined, coverImage);
  };

  return (
    <section className="w-full">
      <a href={`/mix/${slug}/`} className="block no-underline">
        <div className="relative rounded-none border-0 min-h-[60vh] max-h-[600px] overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/hero-bg.webp)' }}
          />
          {/* Gradient overlay for depth */}
          <div
            className="absolute inset-0"
            style={{ background: gradient, opacity: 0.4, viewTransitionName: `mix-gradient-${slug}` }}
          />
          {/* Film grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px',
            }}
          />
          {/* Light leak */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 70% 30%, rgba(212, 165, 116, 0.08) 0%, transparent 60%)',
          }} />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10, 10, 10, 0.7) 40%, transparent 100%), linear-gradient(to right, rgba(10, 10, 10, 0.3) 0%, transparent 50%)',
          }} />
          {/* Ghost mix number */}
          <span className="absolute right-8 top-1/2 -translate-y-1/2 font-heading text-[16rem] font-bold text-white/[0.08] select-none pointer-events-none leading-none tracking-[-0.06em] z-[1] max-sm:text-[8rem] max-sm:right-4">
            #{String(mixNumber).padStart(2, '0')}
          </span>
          {/* Content */}
          <div className="relative z-[2] w-full max-w-[1200px] mx-auto px-12 pb-12 pt-32 flex items-end justify-between min-h-[60vh] max-h-[600px] max-sm:px-5 max-sm:pb-8 max-sm:pt-20 max-sm:min-h-[350px]">
            <div className="max-w-[700px]">
              <span className="inline-block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber mb-4 opacity-80">
                Latest Mix
              </span>
              <TextAnimate
                animation="blurInUp"
                by="word"
                as="h1"
                className="font-heading text-[2.4rem] font-semibold tracking-[-0.03em] leading-[1.1] mb-3 text-warm-cream max-sm:text-[1.6rem]"
              >
                {title}
              </TextAnimate>
              <div className="flex items-center gap-2.5 font-mono text-[0.8rem] text-muted-stone">
                <span>{duration}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-muted-stone opacity-50" />
                <span>{date}</span>
                {isAnalyzed && (
                  <>
                    <span className="w-[3px] h-[3px] rounded-full bg-muted-stone opacity-50" />
                    <span>{bpm} BPM</span>
                  </>
                )}
              </div>
            </div>
            {/* Play button with circular orbiting beam */}
            <div className="relative flex-shrink-0">
              <button
                className="relative z-10 w-16 h-16 rounded-full border-2 border-amber/30 bg-amber/90 text-base flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.08] hover:bg-amber hover:border-amber/50 max-sm:w-[52px] max-sm:h-[52px]"
                style={{
                  color: '#0A0A0A',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 60px rgba(212,165,116,0.15)',
                }}
                aria-label={`Play ${title}`}
                onClick={handlePlay}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-[3px] max-sm:w-5 max-sm:h-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              {/* Circular beam — orbits OUTSIDE the button */}
              <div
                className="absolute inset-[-14px] z-20 rounded-full pointer-events-none max-sm:inset-[-11px]"
                style={{
                  animation: 'spin-beam 20s linear infinite',
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(212, 165, 116, 0.7) 78%, rgba(212, 165, 116, 0.9) 82%, rgba(212, 165, 116, 0.7) 86%, transparent 100%)',
                  mask: 'radial-gradient(circle closest-side at center, transparent 78%, black 82%, black 88%, transparent 92%)',
                  WebkitMask: 'radial-gradient(circle closest-side at center, transparent 78%, black 82%, black 88%, transparent 92%)',
                }}
              />
            </div>
          </div>
        </div>
      </a>
    </section>
  );
}
