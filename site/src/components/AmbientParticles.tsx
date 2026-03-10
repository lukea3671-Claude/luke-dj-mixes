import { Particles } from "@/components/ui/particles";

export default function AmbientParticles() {
  return (
    <Particles
      className="fixed inset-0 z-0 pointer-events-none"
      quantity={30}
      color="#D4A574"
      size={0.3}
      staticity={60}
      ease={80}
    />
  );
}
