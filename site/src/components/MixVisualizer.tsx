import { useMemo } from 'react';

interface MixData {
  mixNumber: number;
  bpm: number;
  trackCount: number;
  energyMean: number;
  energyArc?: { q1: number; q2: number; q3: number; q4: number };
  genres: Array<{ name: string; percent: number }>;
  musicalKey: string;
  duration: string; // e.g. "1h 23m" or "58m"
}

interface Props {
  data: MixData;
  viewMode: 'card' | 'thumbnail';
}

// Musical key → warm amber palette (HCL-derived, perceptually uniform)
const KEY_COLORS: Record<string, string> = {
  'G':  '#FFCF73', // luminous pale gold
  'F#': '#F0C38E', // soft golden amber
  'G#': '#D8893C', // vibrant orange-amber
  'A':  '#C58B4E', // base amber
  'D':  '#A36537', // earthy terracotta
  'E':  '#7F4A28', // deep caramel
  'F':  '#6B3A22', // dark cocoa (lightened from #4B2A1A for visibility)
};
const DEFAULT_COLOR = '#D4A574';

// Parse duration string to minutes
function parseDuration(dur: string): number {
  const hm = dur.match(/(\d+)h\s*(\d+)m/);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  const mOnly = dur.match(/(\d+)m/);
  if (mOnly) return Number(mOnly[1]);
  return 60;
}

// Deterministic seeded random
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Phyllotactic (sunflower) distribution
function phyllotacticNodes(
  count: number,
  maxRadius: number,
  genres: Array<{ name: string; percent: number }>,
  seed: number
) {
  const goldenAngle = 137.508 * (Math.PI / 180);
  const rand = seeded(seed);
  const nodes: Array<{ x: number; y: number; r: number }> = [];

  // Assign genre tiers to tracks
  const sorted = [...genres].sort((a, b) => b.percent - a.percent);
  const tier1Pct = sorted[0]?.percent || 50;
  const tier2Pct = sorted[1]?.percent || 25;

  for (let i = 0; i < count; i++) {
    const angle = i * goldenAngle + rand() * 0.3;
    const r = Math.sqrt((i + 0.5) / count) * maxRadius * 0.85;
    const x = 500 + r * Math.cos(angle);
    const y = 500 + r * Math.sin(angle);

    // Node size based on genre tier
    const pct = (i / count) * 100;
    let nodeR: number;
    if (pct < tier1Pct) nodeR = 6 + rand() * 3; // dominant genre: large
    else if (pct < tier1Pct + tier2Pct) nodeR = 3.5 + rand() * 2; // secondary: medium
    else nodeR = 1.5 + rand() * 1.5; // micro genres: small

    nodes.push({ x, y, r: nodeR });
  }
  return nodes;
}

// Generate eccentric energy arc paths
function energyArcPaths(
  arc: { q1: number; q2: number; q3: number; q4: number },
  maxRadius: number,
  bpm: number
) {
  const quarters = [arc.q1, arc.q2, arc.q3, arc.q4];
  const baseRadii = [0.45, 0.6, 0.75, 0.9]; // inner to outer

  // BPM → dash pattern
  const dashLen = Math.max(4, 40 - (bpm - 100) * 0.8);
  const gapLen = Math.max(2, dashLen * 0.4);
  const dashArray = `${dashLen} ${gapLen}`;

  return quarters.map((energy, i) => {
    const baseR = baseRadii[i] * maxRadius;

    // Energy drives eccentricity: higher = more elliptical
    const eccentricity = 1 + (energy - 0.15) * 3;
    const rx = baseR * eccentricity;
    const ry = baseR / eccentricity;

    // Rotation based on quarter index
    const rotation = i * 22.5;

    // Opacity from energy
    const opacity = 0.2 + energy * 2.5;

    return { rx, ry, rotation, opacity: Math.min(0.9, opacity), dashArray };
  });
}

export default function MixVisualizer({ data, viewMode }: Props) {
  const isThumbnail = viewMode === 'thumbnail';
  const baseColor = KEY_COLORS[data.musicalKey] || DEFAULT_COLOR;

  // Duration → bounding radius (51min=250, 225min=450 on 1000px viewBox)
  const durationMin = parseDuration(data.duration);
  const maxRadius = useMemo(() => {
    const norm = Math.min(1, Math.max(0, (durationMin - 51) / (225 - 51)));
    return 250 + norm * 200;
  }, [durationMin]);

  // Energy arc (use provided or synthesize from energyMean)
  const arc = data.energyArc || {
    q1: data.energyMean * (0.85 + (data.mixNumber % 3) * 0.1),
    q2: data.energyMean * (1.0 + (data.mixNumber % 5) * 0.05),
    q3: data.energyMean * (1.1 - (data.mixNumber % 4) * 0.05),
    q4: data.energyMean * (0.9 + (data.mixNumber % 2) * 0.1),
  };

  // Core glow radius from energy mean
  const coreR = 20 + data.energyMean * 200;
  const glowStd = 5 + data.energyMean * 60;

  // Generate track nodes (card only)
  const trackNodes = useMemo(() => {
    if (isThumbnail) return null;
    return phyllotacticNodes(
      Math.min(data.trackCount, 120), // cap for performance
      maxRadius,
      data.genres,
      data.mixNumber * 7919
    );
  }, [isThumbnail, data.trackCount, maxRadius, data.genres, data.mixNumber]);

  // Generate energy arc paths
  const paths = useMemo(() => {
    return energyArcPaths(arc, maxRadius, data.bpm);
  }, [arc, maxRadius, data.bpm]);

  const filterId = `grain-${data.mixNumber}`;
  const glowId = `glow-${data.mixNumber}`;

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Mix ${data.mixNumber} visualization`}
    >
      <defs>
        {/* Vinyl grain texture — unique per mix */}
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            seed={data.mixNumber}
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.08 0"
          />
        </filter>
        {/* Core glow */}
        <filter id={glowId}>
          <feGaussianBlur stdDeviation={glowStd} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grain overlay */}
      {!isThumbnail && (
        <rect width="1000" height="1000" filter={`url(#${filterId})`} />
      )}

      {/* Core sun/spindle — energy mean drives glow */}
      <circle
        cx={500}
        cy={500}
        r={isThumbnail ? coreR * 1.3 : coreR}
        fill={baseColor}
        opacity={0.6 + data.energyMean * 2}
        filter={!isThumbnail ? `url(#${glowId})` : undefined}
      />

      {/* Energy arc orbits — eccentric ellipses */}
      <g fill="none" stroke={baseColor}>
        {isThumbnail ? (
          // Simplified: single circle for thumbnail
          <circle
            cx={500}
            cy={500}
            r={maxRadius * 0.65}
            strokeWidth={3}
            opacity={0.3 + data.energyMean * 2}
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          // Full eccentric arcs for card view
          paths.map((p, i) => (
            <ellipse
              key={i}
              cx={500}
              cy={500}
              rx={p.rx}
              ry={p.ry}
              transform={`rotate(${p.rotation} 500 500)`}
              strokeWidth={1.5}
              strokeDasharray={p.dashArray}
              opacity={p.opacity}
              vectorEffect="non-scaling-stroke"
            />
          ))
        )}
      </g>

      {/* Track nodes — phyllotactic distribution (card only) */}
      {!isThumbnail && trackNodes && (
        <g fill={baseColor}>
          {trackNodes.map((node, i) => (
            <circle
              key={i}
              cx={node.x}
              cy={node.y}
              r={node.r}
              opacity={0.6}
            />
          ))}
        </g>
      )}

      {/* Mix number label (card only) */}
      {!isThumbnail && (
        <text
          x={500}
          y={515}
          fill="rgba(10, 10, 10, 0.7)"
          fontSize={48}
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="'Inter', system-ui, sans-serif"
        >
          {data.mixNumber}
        </text>
      )}
    </svg>
  );
}
