import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  duration: string;
  bpm: number;
  musicalKey: string;
  trackCount: number;
  fileSizeMb: number;
  isAnalyzed: boolean;
}

export default function MixStats({ duration, bpm, musicalKey, trackCount, fileSizeMb, isAnalyzed }: Props) {
  return (
    <div
      className="rounded-xl my-8"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex flex-wrap justify-around gap-8 p-6 max-sm:gap-4 max-sm:p-4">
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
            {duration}
          </span>
          <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Duration</span>
        </div>
        {isAnalyzed && (
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
              <NumberTicker value={bpm} />
            </span>
            <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">BPM</span>
          </div>
        )}
        {isAnalyzed && (
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
              {musicalKey}
            </span>
            <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Key</span>
          </div>
        )}
        {isAnalyzed && (
          <div className="flex flex-col items-center min-w-[70px]">
            <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
              <NumberTicker value={trackCount} />
            </span>
            <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Tracks</span>
          </div>
        )}
        <div className="flex flex-col items-center min-w-[70px]">
          <span className="text-2xl font-bold font-mono text-amber max-sm:text-xl">
            <NumberTicker value={Math.round(fileSizeMb)} /> MB
          </span>
          <span className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Size</span>
        </div>
      </div>
    </div>
  );
}
