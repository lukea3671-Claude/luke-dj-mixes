import { useEffect, useRef, useState } from 'react';

// 20 warm colors across the orange-to-yellow-to-white spectrum
const COLORS = [
  '#D4A574', '#E2B878', '#F0CC80', '#C89860', '#DAB070',
  '#E8C490', '#D09050', '#F5D898', '#C88040', '#DDB868',
  '#F0D8A0', '#B87840', '#E0C070', '#FFF0C8', '#D4A050',
  '#ECC878', '#C09048', '#F8E0A8', '#D8B060', '#FFE8B0',
];

// 5 visual types with distinct character
type StarType = 'micro' | 'classic' | 'drifter' | 'bolide' | 'wisp';

interface StarVariant {
  type: StarType;
  duration: number;     // seconds
  length: number;       // trail px
  thickness: number;    // trail height px
  headSize: number;     // bright dot px
  glowSpread: number;   // glow px
  peakOpacity: number;  // 0-1
  distance: number;     // travel px
  color: string;
  angle: number;        // degrees
  reverse: boolean;     // right-to-left
  easing: string;
}

function generateVariant(): StarVariant {
  const roll = Math.random();
  let type: StarType;

  // Weighted distribution — more classics, fewer bolides
  if (roll < 0.25)      type = 'micro';
  else if (roll < 0.55) type = 'classic';
  else if (roll < 0.75) type = 'drifter';
  else if (roll < 0.88) type = 'bolide';
  else                   type = 'wisp';

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const reverse = Math.random() < 0.3; // 30% go right-to-left
  const angle = reverse
    ? -(15 + Math.random() * 50)
    : 15 + Math.random() * 50;

  switch (type) {
    case 'micro':
      return {
        type, color, angle, reverse,
        duration: 0.2 + Math.random() * 0.3,
        length: 15 + Math.random() * 35,
        thickness: 0.5 + Math.random() * 0.5,
        headSize: 1 + Math.random(),
        glowSpread: 2 + Math.random() * 2,
        peakOpacity: 0.4 + Math.random() * 0.4,
        distance: 100 + Math.random() * 150,
        easing: 'ease-out',
      };
    case 'classic':
      return {
        type, color, angle, reverse,
        duration: 0.5 + Math.random() * 0.8,
        length: 60 + Math.random() * 100,
        thickness: 1 + Math.random() * 1.5,
        headSize: 2 + Math.random() * 2,
        glowSpread: 4 + Math.random() * 6,
        peakOpacity: 0.6 + Math.random() * 0.4,
        distance: 300 + Math.random() * 300,
        easing: 'ease-out',
      };
    case 'drifter':
      return {
        type, color, angle, reverse,
        duration: 2 + Math.random() * 3,
        length: 100 + Math.random() * 200,
        thickness: 0.5 + Math.random() * 0.8,
        headSize: 1.5 + Math.random() * 1.5,
        glowSpread: 3 + Math.random() * 4,
        peakOpacity: 0.2 + Math.random() * 0.3,
        distance: 400 + Math.random() * 500,
        easing: 'linear',
      };
    case 'bolide':
      return {
        type, color, angle, reverse,
        duration: 0.4 + Math.random() * 0.6,
        length: 120 + Math.random() * 180,
        thickness: 2.5 + Math.random() * 2,
        headSize: 4 + Math.random() * 3,
        glowSpread: 8 + Math.random() * 12,
        peakOpacity: 0.8 + Math.random() * 0.2,
        distance: 400 + Math.random() * 500,
        easing: 'cubic-bezier(0.1, 0, 0.3, 1)',
      };
    case 'wisp':
      return {
        type, color, angle, reverse,
        duration: 1.5 + Math.random() * 2,
        length: 150 + Math.random() * 200,
        thickness: 0.3 + Math.random() * 0.4,
        headSize: 1 + Math.random() * 0.5,
        glowSpread: 2 + Math.random() * 3,
        peakOpacity: 0.15 + Math.random() * 0.2,
        distance: 500 + Math.random() * 400,
        easing: 'linear',
      };
  }
}

interface ActiveStar extends StarVariant {
  id: number;
  x: number;
  y: number;
}

export default function ShootingStars() {
  const [stars, setStars] = useState<ActiveStar[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    function spawn() {
      const variant = generateVariant();
      const id = nextId.current++;

      // Position: reverse stars start from right side
      const x = variant.reverse
        ? 30 + Math.random() * 60
        : 5 + Math.random() * 65;
      const y = Math.random() * 60;

      const star: ActiveStar = { ...variant, id, x, y };
      setStars(prev => [...prev, star]);

      setTimeout(() => {
        setStars(prev => prev.filter(s => s.id !== id));
      }, (star.duration + 0.5) * 1000);
    }

    function scheduleNext(): ReturnType<typeof setTimeout> {
      const delay = 5000 + Math.random() * 13000;
      return setTimeout(() => {
        spawn();
        timerId = scheduleNext();
      }, delay);
    }

    let timerId = setTimeout(() => {
      spawn();
      timerId = scheduleNext();
    }, 3000 + Math.random() * 5000);

    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map(star => {
        const dir = star.reverse ? -1 : 1;
        const gradDir = star.reverse ? 'to left' : 'to right';
        const headPos = star.reverse ? 'left' : 'right';

        // Gradient varies by type
        let trailGradient: string;
        switch (star.type) {
          case 'micro':
            trailGradient = `linear-gradient(${gradDir}, transparent 0%, ${star.color} 100%)`;
            break;
          case 'bolide':
            trailGradient = `linear-gradient(${gradDir}, transparent 0%, ${star.color}30 20%, ${star.color}90 60%, ${star.color} 85%, #FFF8E8 100%)`;
            break;
          case 'wisp':
            trailGradient = `linear-gradient(${gradDir}, transparent 0%, ${star.color}20 40%, ${star.color}60 80%, ${star.color}90 100%)`;
            break;
          case 'drifter':
            trailGradient = `linear-gradient(${gradDir}, transparent 0%, ${star.color}15 20%, ${star.color}50 60%, ${star.color}80 100%)`;
            break;
          default: // classic
            trailGradient = `linear-gradient(${gradDir}, transparent 0%, ${star.color}40 30%, ${star.color} 100%)`;
        }

        return (
          <div
            key={star.id}
            className="absolute"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: `rotate(${star.angle}deg)`,
              opacity: star.peakOpacity,
            }}
          >
            {/* Trail */}
            <div
              style={{
                width: `${star.length}px`,
                height: `${star.thickness}px`,
                background: trailGradient,
                borderRadius: `${star.thickness}px`,
                boxShadow: star.glowSpread > 4
                  ? `0 0 ${star.glowSpread}px ${star.color}50, 0 0 ${star.glowSpread * 2}px ${star.color}20`
                  : `0 0 ${star.glowSpread}px ${star.color}30`,
                animation: `shoot-x ${star.duration}s ${star.easing} forwards`,
                ['--shoot-dist' as string]: `${star.distance * dir}px`,
              }}
            />
            {/* Head */}
            <div
              style={{
                position: 'absolute',
                [headPos]: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: `${star.headSize}px`,
                height: `${star.headSize}px`,
                borderRadius: '50%',
                background: star.type === 'bolide' ? '#FFFDE8' : '#FFF8E8',
                boxShadow: `0 0 ${star.glowSpread}px ${star.color}, 0 0 ${star.glowSpread * 1.5}px ${star.color}80`,
                animation: `shoot-x ${star.duration}s ${star.easing} forwards`,
                ['--shoot-dist' as string]: `${star.distance * dir}px`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
