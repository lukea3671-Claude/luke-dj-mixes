import { useEffect, useRef, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  angle: number;
  duration: number;
  length: number;
  color: string;
}

const WARM_COLORS = ['#D4A574', '#E2B878', '#F0CC80', '#C89860', '#DAB070'];

export default function ShootingStars() {
  const [stars, setStars] = useState<Star[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    function spawn() {
      const id = nextId.current++;
      // Start from upper portion of viewport
      const x = 10 + Math.random() * 70;
      const y = Math.random() * 50;
      // Angle: 20-60° (diagonal streaks, like real meteors)
      const angle = 20 + Math.random() * 40;
      // Duration: 0.5-1.2s
      const duration = 0.5 + Math.random() * 0.7;
      // Trail length: 80-160px
      const length = 80 + Math.random() * 80;
      const color = WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)];

      setStars(prev => [...prev, { id, x, y, angle, duration, length, color }]);

      setTimeout(() => {
        setStars(prev => prev.filter(s => s.id !== id));
      }, (duration + 0.3) * 1000);
    }

    function scheduleNext(): ReturnType<typeof setTimeout> {
      // Random interval: 6-18 seconds between shooting stars
      const delay = 6000 + Math.random() * 12000;
      return setTimeout(() => {
        spawn();
        timerId = scheduleNext();
      }, delay);
    }

    // First one after 4-10 seconds
    let timerId = setTimeout(() => {
      spawn();
      timerId = scheduleNext();
    }, 4000 + Math.random() * 6000);

    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: `rotate(${star.angle}deg)`,
          }}
        >
          {/* Trail: gradient line that moves along rotated axis */}
          <div
            style={{
              width: `${star.length}px`,
              height: '1.5px',
              background: `linear-gradient(to right, transparent 0%, ${star.color}40 30%, ${star.color} 100%)`,
              borderRadius: '1px',
              boxShadow: `0 0 4px ${star.color}50, 0 0 8px ${star.color}25`,
              animation: `shoot ${star.duration}s ease-out forwards`,
            }}
          />
          {/* Bright head dot */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: '#FFF8E8',
              boxShadow: `0 0 6px ${star.color}, 0 0 12px ${star.color}80`,
              animation: `shoot ${star.duration}s ease-out forwards`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
