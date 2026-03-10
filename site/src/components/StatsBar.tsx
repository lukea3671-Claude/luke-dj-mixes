import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  totalMixes: number;
  totalTracks: number;
  totalHours: number;
  yearsActive: number;
}

export default function StatsBar({ totalMixes, totalTracks, totalHours, yearsActive }: Props) {
  return (
    <div className="flex justify-center gap-8 sm:gap-16 py-6 my-4 border-y border-border-warm">
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={totalMixes} />
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Mixes</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={totalHours} />
          <span className="text-lg">h</span>
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Hours</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={totalTracks} />
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Tracks</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-2xl sm:text-3xl font-bold text-amber">
          <NumberTicker value={yearsActive} />
        </div>
        <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-1">Years</div>
      </div>
    </div>
  );
}
