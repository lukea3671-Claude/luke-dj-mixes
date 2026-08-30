import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function TopScrollProgress() {
  return (
    // [transform:scaleX(0)] keeps the SSR-rendered bar collapsed until motion
    // hydrates and takes over with the live scroll value — without it the bar
    // flashes as a full-width amber line on every cold load (client:idle).
    <ScrollProgress className="top-0 z-[95] h-0.5 from-amber/80 via-amber to-amber/80 [transform:scaleX(0)]" />
  );
}
