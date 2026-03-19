import { useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════
// Solar System — Canvas orbital simulation with real physics
// Sun at bottom-left, 8 planets on Keplerian orbits
// ═══════════════════════════════════════════════════════════

interface PlanetDef {
  name: string;
  orbitRadius: number;     // px from sun center
  period: number;          // real orbital period in days
  eccentricity: number;    // 0 = circle, higher = more elliptical
  radius: number;          // planet radius in px
  color: [number, number, number];
  colorDark: [number, number, number];
  startAngle: number;      // radians, initial position
  tilt: number;            // orbital tilt in radians (visual only)
  features?: 'bands' | 'rings' | 'ice-caps' | 'clouds';
  ringInner?: number;      // multiplier of radius
  ringOuter?: number;
  moons?: { radius: number; orbitRadius: number; period: number; color: [number, number, number] }[];
}

// Time compression: Neptune completes 1 orbit in 24 real hours
// 60190 days / 86400 seconds ≈ 0.697 simulated days per real second
// Preserves all real orbital period ratios
const DAYS_PER_SECOND = 60190 / 86400;
const TWO_PI = Math.PI * 2;

const PLANETS: PlanetDef[] = [
  {
    name: 'Mercury',
    orbitRadius: 280,
    period: 88,
    eccentricity: 0.205,
    radius: 5,
    color: [160, 144, 138],
    colorDark: [80, 70, 65],
    startAngle: 0.8,
    tilt: 0.01,
  },
  {
    name: 'Venus',
    orbitRadius: 420,
    period: 225,
    eccentricity: 0.007,
    radius: 10,
    color: [212, 168, 96],
    colorDark: [120, 90, 40],
    startAngle: 2.4,
    tilt: 0.02,
  },
  {
    name: 'Earth',
    orbitRadius: 560,
    period: 365,
    eccentricity: 0.017,
    radius: 12,
    color: [74, 128, 176],
    colorDark: [20, 50, 80],
    startAngle: 4.1,
    tilt: 0.03,
    features: 'clouds',
    moons: [
      { radius: 3, orbitRadius: 24, period: 27.3, color: [180, 176, 170] },
    ],
  },
  {
    name: 'Mars',
    orbitRadius: 720,
    period: 687,
    eccentricity: 0.093,
    radius: 8,
    color: [196, 92, 60],
    colorDark: [90, 35, 20],
    startAngle: 1.2,
    tilt: 0.015,
    features: 'ice-caps',
  },
  {
    name: 'Jupiter',
    orbitRadius: 1050,
    period: 4333,
    eccentricity: 0.049,
    radius: 44,
    color: [196, 149, 106],
    colorDark: [80, 55, 35],
    startAngle: 3.5,
    tilt: 0.02,
    features: 'bands',
    moons: [
      { radius: 2.5, orbitRadius: 62, period: 1.77, color: [200, 180, 140] },
      { radius: 3, orbitRadius: 78, period: 3.55, color: [180, 160, 140] },
      { radius: 3.5, orbitRadius: 98, period: 7.15, color: [170, 155, 145] },
    ],
  },
  {
    name: 'Saturn',
    orbitRadius: 1350,
    period: 10759,
    eccentricity: 0.057,
    radius: 36,
    color: [196, 168, 130],
    colorDark: [90, 72, 50],
    startAngle: 5.2,
    tilt: 0.04,
    features: 'rings',
    ringInner: 1.4,
    ringOuter: 2.3,
    moons: [
      { radius: 3, orbitRadius: 60, period: 15.95, color: [200, 190, 170] },
    ],
  },
  {
    name: 'Uranus',
    orbitRadius: 1700,
    period: 30687,
    eccentricity: 0.046,
    radius: 20,
    color: [107, 168, 176],
    colorDark: [40, 75, 80],
    startAngle: 0.3,
    tilt: 0.05,
  },
  {
    name: 'Neptune',
    orbitRadius: 2050,
    period: 60190,
    eccentricity: 0.010,
    radius: 19,
    color: [74, 107, 154],
    colorDark: [25, 40, 70],
    startAngle: 4.8,
    tilt: 0.01,
  },
];

// Kepler's equation solver — mean anomaly to true anomaly
function solveKepler(M: number, e: number): number {
  // Newton-Raphson iteration for eccentric anomaly
  let E = M;
  for (let i = 0; i < 6; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  // True anomaly from eccentric anomaly
  const v = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  return v;
}

function getPlanetPosition(
  planet: PlanetDef,
  time: number, // in simulated days
  sunX: number,
  sunY: number
): { x: number; y: number } {
  const meanAnomaly = (TWO_PI * time / planet.period) + planet.startAngle;
  const trueAnomaly = solveKepler(meanAnomaly % TWO_PI, planet.eccentricity);

  // Distance from focus (sun) accounting for eccentricity
  const r = planet.orbitRadius * (1 - planet.eccentricity * planet.eccentricity) /
    (1 + planet.eccentricity * Math.cos(trueAnomaly));

  // Add slight tilt for visual depth
  const x = sunX + r * Math.cos(trueAnomaly);
  const y = sunY + r * Math.sin(trueAnomaly) * Math.cos(planet.tilt);

  return { x, y };
}

function drawSun(ctx: CanvasRenderingContext2D, sunX: number, sunY: number) {
  // The Sun gives all human beings life. Make it unmistakable.

  // Far corona — warm light that reaches deep into space
  const corona = ctx.createRadialGradient(sunX, sunY, 120, sunX, sunY, 800);
  corona.addColorStop(0, 'rgba(255, 200, 100, 0.07)');
  corona.addColorStop(0.25, 'rgba(255, 180, 80, 0.035)');
  corona.addColorStop(0.5, 'rgba(212, 165, 116, 0.015)');
  corona.addColorStop(1, 'transparent');
  ctx.fillStyle = corona;
  ctx.fillRect(sunX - 800, sunY - 800, 1600, 1600);

  // Mid corona — visible warm halo
  const mid = ctx.createRadialGradient(sunX, sunY, 100, sunX, sunY, 350);
  mid.addColorStop(0, 'rgba(255, 230, 160, 0.25)');
  mid.addColorStop(0.3, 'rgba(255, 210, 130, 0.12)');
  mid.addColorStop(0.6, 'rgba(255, 190, 100, 0.05)');
  mid.addColorStop(1, 'transparent');
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 350, 0, TWO_PI);
  ctx.fill();

  // Outer limb — the orange edge of the sun's disc
  const limb = ctx.createRadialGradient(sunX, sunY, 100, sunX, sunY, 180);
  limb.addColorStop(0, 'rgba(255, 200, 100, 0.5)');
  limb.addColorStop(0.6, 'rgba(255, 170, 60, 0.35)');
  limb.addColorStop(0.85, 'rgba(255, 140, 40, 0.15)');
  limb.addColorStop(1, 'transparent');
  ctx.fillStyle = limb;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 180, 0, TWO_PI);
  ctx.fill();

  // Sun body — hot, bright, solid disc
  const body = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 130);
  body.addColorStop(0, 'rgba(255, 255, 248, 1)');
  body.addColorStop(0.2, 'rgba(255, 252, 235, 0.95)');
  body.addColorStop(0.5, 'rgba(255, 240, 200, 0.85)');
  body.addColorStop(0.75, 'rgba(255, 215, 150, 0.7)');
  body.addColorStop(0.9, 'rgba(255, 190, 110, 0.45)');
  body.addColorStop(1, 'rgba(255, 170, 80, 0.15)');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 130, 0, TWO_PI);
  ctx.fill();
}

function drawOrbitPath(
  ctx: CanvasRenderingContext2D,
  planet: PlanetDef,
  sunX: number,
  sunY: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 8]);

  const a = planet.orbitRadius;
  const b = a * Math.cos(planet.tilt); // visual compression from tilt

  ctx.beginPath();
  for (let i = 0; i <= 360; i += 2) {
    const angle = (i * Math.PI) / 180;
    const r = a * (1 - planet.eccentricity * planet.eccentricity) /
      (1 + planet.eccentricity * Math.cos(angle));
    const px = sunX + r * Math.cos(angle);
    const py = sunY + r * Math.sin(angle) * Math.cos(planet.tilt);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawPlanetBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  planet: PlanetDef,
  sunX: number,
  sunY: number
) {
  const r = planet.radius;

  // Direction to sun for lighting
  const dx = sunX - x;
  const dy = sunY - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lightX = dx / dist;
  const lightY = dy / dist;

  // Atmospheric glow
  const glowSize = r * 2.5;
  const glow = ctx.createRadialGradient(x, y, r * 0.8, x, y, glowSize);
  glow.addColorStop(0, `rgba(${planet.color[0]}, ${planet.color[1]}, ${planet.color[2]}, 0.08)`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowSize, 0, TWO_PI);
  ctx.fill();

  // Planet body with crescent lighting
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.clip();

  // Base color gradient (lit side to dark side)
  const lightOffsetX = lightX * r * 0.4;
  const lightOffsetY = lightY * r * 0.4;
  const bodyGrad = ctx.createRadialGradient(
    x + lightOffsetX, y + lightOffsetY, 0,
    x - lightOffsetX * 0.5, y - lightOffsetY * 0.5, r * 1.2
  );
  bodyGrad.addColorStop(0, `rgb(${planet.color[0]}, ${planet.color[1]}, ${planet.color[2]})`);
  bodyGrad.addColorStop(0.6, `rgb(${planet.colorDark[0]}, ${planet.colorDark[1]}, ${planet.colorDark[2]})`);
  bodyGrad.addColorStop(1, `rgb(${Math.floor(planet.colorDark[0] * 0.3)}, ${Math.floor(planet.colorDark[1] * 0.3)}, ${Math.floor(planet.colorDark[2] * 0.3)})`);
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  // Surface features
  if (planet.features === 'bands' && r > 15) {
    drawJupiterBands(ctx, x, y, r, planet);
  }
  if (planet.features === 'clouds' && r > 5) {
    drawEarthClouds(ctx, x, y, r);
  }
  if (planet.features === 'ice-caps' && r > 4) {
    drawMarsIceCaps(ctx, x, y, r);
  }

  // Terminator shadow (crescent)
  const shadowGrad = ctx.createRadialGradient(
    x + lightOffsetX * 1.2, y + lightOffsetY * 1.2, r * 0.2,
    x - lightOffsetX * 1.5, y - lightOffsetY * 1.5, r * 1.1
  );
  shadowGrad.addColorStop(0, 'transparent');
  shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.15)');
  shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  // Rim light on the sun-facing edge
  const rimGrad = ctx.createRadialGradient(x, y, r * 0.85, x, y, r);
  rimGrad.addColorStop(0, 'transparent');
  rimGrad.addColorStop(0.7, 'transparent');
  rimGrad.addColorStop(1, `rgba(${planet.color[0]}, ${planet.color[1]}, ${planet.color[2]}, 0.15)`);
  ctx.fillStyle = rimGrad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  ctx.restore();
}

function drawJupiterBands(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, planet: PlanetDef) {
  const bands = [
    { offset: -0.6, width: 0.12, alpha: 0.2 },
    { offset: -0.3, width: 0.08, alpha: 0.15 },
    { offset: -0.1, width: 0.14, alpha: 0.18 },
    { offset: 0.15, width: 0.10, alpha: 0.2 },
    { offset: 0.35, width: 0.12, alpha: 0.15 },
    { offset: 0.55, width: 0.08, alpha: 0.12 },
  ];

  bands.forEach(band => {
    const by = y + r * band.offset;
    const bh = r * band.width;
    ctx.fillStyle = `rgba(${planet.colorDark[0]}, ${planet.colorDark[1]}, ${planet.colorDark[2]}, ${band.alpha})`;
    ctx.fillRect(x - r, by, r * 2, bh);
  });

  // Great Red Spot
  ctx.beginPath();
  ctx.ellipse(x + r * 0.25, y + r * 0.2, r * 0.12, r * 0.08, 0, 0, TWO_PI);
  ctx.fillStyle = 'rgba(180, 80, 40, 0.25)';
  ctx.fill();
}

function drawEarthClouds(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // Subtle green landmasses
  ctx.fillStyle = 'rgba(60, 120, 60, 0.15)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y - r * 0.1, r * 0.3, r * 0.25, 0.3, 0, TWO_PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.3, y + r * 0.2, r * 0.2, r * 0.15, -0.2, 0, TWO_PI);
  ctx.fill();

  // White cloud wisps
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.1, y - r * 0.3, r * 0.4, r * 0.08, -0.2, 0, TWO_PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.15, y + r * 0.35, r * 0.35, r * 0.06, 0.3, 0, TWO_PI);
  ctx.fill();
}

function drawMarsIceCaps(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(220, 210, 200, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.85, r * 0.35, r * 0.15, 0, 0, TWO_PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.88, r * 0.25, r * 0.1, 0, 0, TWO_PI);
  ctx.fill();
}

function drawSaturnRings(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  planet: PlanetDef,
  sunX: number,
  sunY: number,
  phase: 'back' | 'front'
) {
  if (!planet.ringInner || !planet.ringOuter) return;
  const r = planet.radius;
  const innerR = r * planet.ringInner;
  const outerR = r * planet.ringOuter;
  const ringTilt = 0.38; // Tilt angle — how much we see the rings from above

  ctx.save();

  // Clip to only draw front or back half
  if (phase === 'back') {
    ctx.beginPath();
    ctx.rect(x - outerR - 10, y - outerR - 10, (outerR + 10) * 2, outerR + 10);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x - outerR - 10, y, (outerR + 10) * 2, outerR + 10);
    ctx.clip();
  }

  // Draw multiple ring bands
  const ringBands = [
    { inner: innerR, outer: innerR + (outerR - innerR) * 0.35, alpha: 0.35 },
    { inner: innerR + (outerR - innerR) * 0.4, outer: innerR + (outerR - innerR) * 0.45, alpha: 0.08 }, // Cassini division
    { inner: innerR + (outerR - innerR) * 0.48, outer: outerR * 0.9, alpha: 0.25 },
    { inner: outerR * 0.92, outer: outerR, alpha: 0.12 },
  ];

  ringBands.forEach(band => {
    ctx.beginPath();
    ctx.ellipse(x, y, band.outer, band.outer * ringTilt, 0, 0, TWO_PI);
    ctx.ellipse(x, y, band.inner, band.inner * ringTilt, 0, TWO_PI, 0);
    ctx.fillStyle = `rgba(${planet.color[0]}, ${planet.color[1]}, ${planet.color[2]}, ${band.alpha})`;
    ctx.fill('evenodd');
  });

  ctx.restore();
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  planetX: number,
  planetY: number,
  moon: NonNullable<PlanetDef['moons']>[0],
  time: number,
  sunX: number,
  sunY: number
) {
  const angle = (TWO_PI * time / moon.period);
  const mx = planetX + moon.orbitRadius * Math.cos(angle);
  const my = planetY + moon.orbitRadius * Math.sin(angle) * 0.3; // Viewed at angle

  // Moon body with lighting
  const dx = sunX - mx;
  const dy = sunY - my;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lightX = (dx / dist) * moon.radius * 0.3;
  const lightY = (dy / dist) * moon.radius * 0.3;

  const grad = ctx.createRadialGradient(
    mx + lightX, my + lightY, 0,
    mx, my, moon.radius
  );
  grad.addColorStop(0, `rgb(${moon.color[0]}, ${moon.color[1]}, ${moon.color[2]})`);
  grad.addColorStop(1, `rgba(${moon.color[0] * 0.3}, ${moon.color[1] * 0.3}, ${moon.color[2] * 0.3}, 0.8)`);

  ctx.beginPath();
  ctx.arc(mx, my, moon.radius, 0, TWO_PI);
  ctx.fillStyle = grad;
  ctx.fill();
}

export default function SolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;
    let rafId: number;
    const startTime = performance.now();

    let sunX = -40;
    let sunY = 0;

    function resize() {
      w = container!.offsetWidth;
      h = container!.offsetHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sun in bottom-left corner — visible, present, unmistakable
      sunX = -40;
      sunY = h + 40;
    }

    resize();
    window.addEventListener('resize', resize);

    function render() {
      ctx!.clearRect(0, 0, w, h);

      const elapsed = (performance.now() - startTime) / 1000; // seconds
      const simDays = elapsed * DAYS_PER_SECOND;

      // Draw sun glow
      drawSun(ctx!, sunX, sunY);

      // Draw orbital paths
      PLANETS.forEach(planet => {
        drawOrbitPath(ctx!, planet, sunX, sunY);
      });

      // Draw planets (outer to inner so inner planets render on top)
      for (let i = PLANETS.length - 1; i >= 0; i--) {
        const planet = PLANETS[i];
        const pos = getPlanetPosition(planet, simDays, sunX, sunY);

        // Skip if way off screen
        if (pos.x < -100 || pos.x > w + 100 || pos.y < -100 || pos.y > h + 100) {
          // Still draw moons if planet is just off edge
          if (pos.x > -200 && pos.x < w + 200 && pos.y > -200 && pos.y < h + 200) {
            planet.moons?.forEach(moon => {
              drawMoon(ctx!, pos.x, pos.y, moon, simDays, sunX, sunY);
            });
          }
          continue;
        }

        // Saturn: back rings → body → front rings
        if (planet.features === 'rings') {
          drawSaturnRings(ctx!, pos.x, pos.y, planet, sunX, sunY, 'back');
          drawPlanetBody(ctx!, pos.x, pos.y, planet, sunX, sunY);
          drawSaturnRings(ctx!, pos.x, pos.y, planet, sunX, sunY, 'front');
        } else {
          drawPlanetBody(ctx!, pos.x, pos.y, planet, sunX, sunY);
        }

        // Draw moons
        planet.moons?.forEach(moon => {
          drawMoon(ctx!, pos.x, pos.y, moon, simDays, sunX, sunY);
        });
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
