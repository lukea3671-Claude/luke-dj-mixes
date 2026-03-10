import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { NumberTicker } from "@/components/ui/number-ticker";
import { TextAnimate } from "@/components/ui/text-animate";

interface Props {
  totalMixes: number;
  totalTracks: number;
  totalHours: number;
  yearsActive: number;
  genreCount: number;
}

export default function AboutContent({ totalMixes, totalTracks, totalHours, yearsActive, genreCount }: Props) {
  return (
    <div className="max-w-3xl">
      {/* Intro */}
      <TextGenerateEffect
        words="A personal archive of DJ mixes recorded between 2018 and 2025. Each mix is a snapshot of a moment — the music I was obsessed with, the transitions I was practicing, the energy I was chasing."
        className="text-muted-stone text-lg leading-relaxed mb-12"
      />

      {/* Stats Bento Grid */}
      <TextAnimate animation="slideUp" as="h2" className="font-heading text-xl text-warm-cream mb-6">
        By the Numbers
      </TextAnimate>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
        {[
          { value: totalMixes, label: "Mixes" },
          { value: totalHours, label: "Hours of Music", suffix: "h" },
          { value: totalTracks, label: "Tracks Identified" },
          { value: yearsActive, label: "Years Active" },
          { value: genreCount, label: "Genres" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl border border-border-warm bg-surface text-center"
          >
            <div className="font-mono text-3xl font-bold text-amber">
              <NumberTicker value={stat.value} />
              {stat.suffix && <span className="text-xl">{stat.suffix}</span>}
            </div>
            <div className="text-[0.7rem] text-muted-stone uppercase tracking-[0.08em] mt-2">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <TextAnimate animation="slideUp" as="h2" className="font-heading text-xl text-warm-cream mb-6">
        The Journey
      </TextAnimate>
      <div className="relative pl-8 border-l border-border-warm space-y-8 mb-12">
        {[
          { year: "2018", title: "First Mix", desc: "Mix 01 — a 3 hour 45 minute marathon that set the template. Heavy on dance and electronic." },
          { year: "2019", title: "Finding the Format", desc: "4 mixes. Settled into shorter formats and started exploring broader genres." },
          { year: "2020", title: "Lockdown Sessions", desc: "6 mixes during COVID lockdowns. The most prolific period — music as therapy." },
          { year: "2021", title: "Quality Over Quantity", desc: "4 mixes, more focused. Started adding tracklists and liner notes." },
          { year: "2022", title: "Peak Output", desc: "7 mixes across the year. The most diverse period — house, techno, trance, hip-hop." },
          { year: "2023", title: "The Archive", desc: "8 mixes. Built this site to preserve and share the collection. AI-assisted analysis began." },
          { year: "2024", title: "Refinement", desc: "7 mixes. Focused on tighter curation and higher production standards." },
          { year: "2025", title: "Continuing", desc: "The crate keeps growing. Every mix is a timestamp of a moment that mattered." },
        ].map((entry) => (
          <div key={entry.year} className="relative">
            <div className="absolute -left-[2.85rem] top-0.5 w-5 h-5 rounded-full bg-base border-2 border-amber flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber" />
            </div>
            <span className="font-mono text-[0.7rem] text-amber uppercase tracking-wider">
              {entry.year}
            </span>
            <h3 className="font-heading text-lg font-semibold text-warm-cream mt-1">
              {entry.title}
            </h3>
            <p className="text-muted-stone text-sm mt-1 leading-relaxed">
              {entry.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Closing */}
      <div className="border-t border-border-warm pt-8 text-center">
        <p className="text-muted-stone text-sm">
          Free streaming. No account needed.{" "}
          <a href="https://www.patreon.com/c/lukesmixes" target="_blank" rel="noopener" className="text-amber hover:text-warm-cream transition-colors">
            Support on Patreon
          </a>
        </p>
      </div>
    </div>
  );
}
