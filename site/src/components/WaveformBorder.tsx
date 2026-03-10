import { BorderBeam } from "@/components/ui/border-beam";

export default function WaveformBorder() {
  return (
    <BorderBeam
      duration={12}
      size={80}
      className="from-transparent via-amber to-transparent"
    />
  );
}
