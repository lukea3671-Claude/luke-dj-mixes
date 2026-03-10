import { Marquee } from "@/components/ui/marquee";

interface Props {
  genres: string[];
}

export default function GenreMarquee({ genres }: Props) {
  return (
    <div className="relative py-4 overflow-hidden">
      <Marquee pauseOnHover className="[--duration:30s] [--gap:0.75rem]">
        {genres.map((genre, i) => (
          <span
            key={`${genre}-${i}`}
            className="inline-block text-[0.7rem] px-3 py-1 rounded-[10px] font-medium whitespace-nowrap"
            style={{
              background: 'rgba(74, 123, 124, 0.12)',
              color: '#4A7B7C',
              border: '1px solid rgba(74, 123, 124, 0.25)',
            }}
          >
            {genre}
          </span>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-base" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-base" />
    </div>
  );
}
