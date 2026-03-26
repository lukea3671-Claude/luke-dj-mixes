interface Props {
  trackCount: number;
  bpm: number;
  energyMean: number;
  mixNumber: number;
  size?: number;
}

// Deterministic pseudo-random from seed
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function VinylGroove({ trackCount, bpm, energyMean, mixNumber, size = 240 }: Props) {
  const rand = seeded(mixNumber * 7919);
  const cx = size / 2;
  const cy = size / 2;

  // Vinyl parameters driven by mix data
  const innerRadius = size * 0.12; // label area
  const outerRadius = size * 0.46; // edge of grooves
  const grooveRange = outerRadius - innerRadius;

  // Track count drives number of grooves (more tracks = denser)
  const grooveCount = Math.min(Math.max(trackCount, 15), 90);

  // Energy drives groove brightness (0.14-0.25 range mapped to opacity)
  const baseOpacity = 0.15 + (energyMean - 0.1) * 2.5;
  const clampedOpacity = Math.min(Math.max(baseOpacity, 0.12), 0.55);

  // BPM affects groove wobble (higher BPM = tighter, more uniform grooves)
  const wobbleAmount = Math.max(0.3, 1.5 - (bpm - 100) * 0.03);

  // Generate grooves
  const grooves: JSX.Element[] = [];

  for (let i = 0; i < grooveCount; i++) {
    const t = i / grooveCount;
    const radius = innerRadius + t * grooveRange;
    const r = rand();

    // Each groove is a near-complete circle with slight wobble
    const startAngle = rand() * 10 - 5; // slight offset
    const endAngle = 340 + rand() * 18; // nearly full circle

    // Wobble the radius slightly for organic feel
    const wobble = (rand() - 0.5) * wobbleAmount;
    const actualRadius = radius + wobble;

    // Vary thickness — outer grooves slightly thicker
    const thickness = 0.4 + t * 0.5 + rand() * 0.3;

    // Vary opacity — creates light/dark bands like real vinyl
    const grooveOpacity = clampedOpacity + (rand() - 0.5) * 0.08;

    // Create arc path
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + actualRadius * Math.cos(startRad);
    const y1 = cy + actualRadius * Math.sin(startRad);
    const x2 = cx + actualRadius * Math.cos(endRad);
    const y2 = cy + actualRadius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    grooves.push(
      <path
        key={i}
        d={`M ${x1} ${y1} A ${actualRadius} ${actualRadius} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke={`rgba(212, 165, 116, ${grooveOpacity})`}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    );
  }

  // Add "lead-in groove" — a spiral from outer edge
  const spiralPoints: string[] = [];
  const spiralTurns = 2 + rand() * 2;
  for (let j = 0; j <= 60; j++) {
    const st = j / 60;
    const angle = st * spiralTurns * Math.PI * 2;
    const sr = outerRadius + 2 - st * 8;
    const sx = cx + sr * Math.cos(angle);
    const sy = cy + sr * Math.sin(angle);
    spiralPoints.push(`${j === 0 ? 'M' : 'L'} ${sx} ${sy}`);
  }

  // Center label dot
  const labelRadius = innerRadius * 0.7;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Subtle radial glow from center */}
      <defs>
        <radialGradient id={`glow-${mixNumber}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212, 165, 116, 0.06)" />
          <stop offset="60%" stopColor="rgba(212, 165, 116, 0.02)" />
          <stop offset="100%" stopColor="rgba(212, 165, 116, 0)" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r={outerRadius + 4} fill={`url(#glow-${mixNumber})`} />

      {/* Grooves */}
      {grooves}

      {/* Lead-in spiral */}
      <path
        d={spiralPoints.join(' ')}
        fill="none"
        stroke={`rgba(212, 165, 116, ${clampedOpacity * 0.6})`}
        strokeWidth={0.5}
      />

      {/* Center label */}
      <circle
        cx={cx}
        cy={cy}
        r={labelRadius}
        fill="rgba(212, 165, 116, 0.08)"
        stroke="rgba(212, 165, 116, 0.15)"
        strokeWidth={0.5}
      />
      {/* Spindle hole */}
      <circle
        cx={cx}
        cy={cy}
        r={2}
        fill="rgba(212, 165, 116, 0.25)"
      />
    </svg>
  );
}
