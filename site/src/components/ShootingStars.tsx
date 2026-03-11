import { useEffect, useRef } from 'react';

// --- Physics-based shooting star renderer ---
// Real meteor behavior:
// 1. Head moves along trajectory at near-constant velocity
// 2. Trail is ionized wake that persists and fades independently
// 3. Brightness curve: rapid entry brightening → sustained burn with flicker → fade or terminal flash
// 4. Trail thins and dims from head to tail

interface Meteor {
  x: number;
  y: number;
  vx: number;        // px/s
  vy: number;        // px/s
  age: number;       // seconds
  lifetime: number;  // total seconds
  peak: number;      // peak brightness 0-1
  headRadius: number;
  trailDuration: number; // how long trail points persist (seconds)
  color: [number, number, number];
  flickerRate: number;
  hasTerminalFlash: boolean;
  trail: Array<{ x: number; y: number; time: number; brightness: number }>;
  dead: boolean;
}

// Warm star colors (RGB)
const COLORS: [number, number, number][] = [
  [212, 165, 116], // amber
  [226, 184, 120], // light amber
  [240, 204, 128], // gold
  [200, 152, 96],  // deep amber
  [218, 176, 112], // warm gold
  [240, 216, 160], // pale gold
  [232, 196, 144], // soft amber
];

function brightnessAt(progress: number, hasFlash: boolean, flickerRate: number, time: number): number {
  let b: number;

  if (progress < 0.08) {
    // Entry: rapid exponential brighten
    b = (progress / 0.08) ** 0.5;
  } else if (progress < 0.65) {
    // Sustained burn with subtle flicker
    const flicker = 1 - Math.abs(Math.sin(time * flickerRate)) * 0.12;
    b = flicker;
  } else if (hasFlash && progress > 0.72 && progress < 0.82) {
    // Terminal flash — brief brightening before extinction
    const flashProgress = (progress - 0.72) / 0.1;
    b = 1 + Math.sin(flashProgress * Math.PI) * 0.3;
  } else {
    // Fade out
    const fadeStart = hasFlash ? 0.82 : 0.65;
    const fadeProgress = Math.min(1, (progress - fadeStart) / (1 - fadeStart));
    b = Math.max(0, 1 - fadeProgress ** 1.5);
  }

  return Math.max(0, Math.min(1.3, b));
}

function spawnMeteor(canvasW: number, canvasH: number): Meteor {
  // Entry from upper portion, random angle
  const goLeft = Math.random() < 0.35;
  const angle = (25 + Math.random() * 40) * (Math.PI / 180);

  // Speed: 300-700 px/s (appears fast but trackable)
  const speed = 300 + Math.random() * 400;
  const vx = Math.cos(angle) * speed * (goLeft ? -1 : 1);
  const vy = Math.sin(angle) * speed;

  // Start position: upper 40% of screen
  const x = goLeft
    ? canvasW * (0.3 + Math.random() * 0.6)
    : canvasW * (Math.random() * 0.5);
  const y = canvasH * Math.random() * 0.4;

  // Lifetime: 0.6-2.5s
  const lifetime = 0.6 + Math.random() * 1.9;

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    x, y, vx, vy,
    age: 0,
    lifetime,
    peak: 0.5 + Math.random() * 0.5,
    headRadius: 1 + Math.random() * 1.5,
    trailDuration: 0.3 + Math.random() * 0.5,
    color,
    flickerRate: 8 + Math.random() * 20,
    hasTerminalFlash: Math.random() < 0.3,
    trail: [],
    dead: false,
  };
}

export default function ShootingStars() {
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
    let meteors: Meteor[] = [];
    let lastTime = performance.now() / 1000;
    let rafId: number;

    function resize() {
      w = container!.offsetWidth;
      h = container!.offsetHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    // Spawn timer: one meteor every ~15 minutes (900s), with some variance (12-18 min)
    function scheduleSpawn() {
      const delay = (720 + Math.random() * 360) * 1000; // 12-18 minutes
      return setTimeout(() => {
        if (w > 0 && h > 0) {
          meteors.push(spawnMeteor(w, h));
        }
        spawnTimer = scheduleSpawn();
      }, delay);
    }

    // First meteor after 20-90 seconds (so you see one relatively soon on page load)
    let spawnTimer = setTimeout(() => {
      if (w > 0 && h > 0) {
        meteors.push(spawnMeteor(w, h));
      }
      spawnTimer = scheduleSpawn();
    }, (20 + Math.random() * 70) * 1000);

    function render() {
      const now = performance.now() / 1000;
      const dt = Math.min(now - lastTime, 0.05); // cap delta to avoid jumps
      lastTime = now;

      ctx!.clearRect(0, 0, w, h);

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.age += dt;

        if (m.age > m.lifetime + m.trailDuration + 0.2) {
          meteors.splice(i, 1);
          continue;
        }

        const progress = Math.min(1, m.age / m.lifetime);
        const headAlive = m.age < m.lifetime;

        if (headAlive) {
          // Update head position
          m.x += m.vx * dt;
          m.y += m.vy * dt;

          // Current brightness
          const b = brightnessAt(progress, m.hasTerminalFlash, m.flickerRate, m.age) * m.peak;

          // Record trail point
          m.trail.push({ x: m.x, y: m.y, time: now, brightness: b });
        }

        // Prune old trail points
        m.trail = m.trail.filter(p => (now - p.time) < m.trailDuration);

        if (m.trail.length < 2) continue;

        // --- Draw trail ---
        // Draw as series of segments with decreasing opacity/width from head to tail
        for (let j = 1; j < m.trail.length; j++) {
          const p0 = m.trail[j - 1];
          const p1 = m.trail[j];

          // Age of this point (0 = just created, trailDuration = about to expire)
          const pointAge = now - p1.time;
          const fade = Math.max(0, 1 - (pointAge / m.trailDuration));

          // Width tapers: thicker near head, thinner at tail
          const positionInTrail = j / m.trail.length; // 0=tail, 1=head
          const lineWidth = (0.3 + positionInTrail * 1.5) * (m.headRadius * 0.8);

          const alpha = fade * positionInTrail * p1.brightness * 0.7;
          if (alpha < 0.005) continue;

          ctx!.beginPath();
          ctx!.moveTo(p0.x, p0.y);
          ctx!.lineTo(p1.x, p1.y);
          ctx!.strokeStyle = `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${alpha})`;
          ctx!.lineWidth = lineWidth;
          ctx!.lineCap = 'round';
          ctx!.stroke();
        }

        // --- Draw head glow (only while alive) ---
        if (headAlive) {
          const b = brightnessAt(progress, m.hasTerminalFlash, m.flickerRate, m.age) * m.peak;

          // Outer glow
          const glowRadius = m.headRadius * (3 + b * 4);
          const glow = ctx!.createRadialGradient(m.x, m.y, 0, m.x, m.y, glowRadius);
          glow.addColorStop(0, `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${b * 0.5})`);
          glow.addColorStop(0.4, `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, ${b * 0.15})`);
          glow.addColorStop(1, `rgba(${m.color[0]}, ${m.color[1]}, ${m.color[2]}, 0)`);
          ctx!.beginPath();
          ctx!.arc(m.x, m.y, glowRadius, 0, Math.PI * 2);
          ctx!.fillStyle = glow;
          ctx!.fill();

          // Bright core (white-hot)
          const coreRadius = m.headRadius * (0.5 + b * 0.5);
          ctx!.beginPath();
          ctx!.arc(m.x, m.y, coreRadius, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 248, 232, ${b * 0.9})`;
          ctx!.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(spawnTimer);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
