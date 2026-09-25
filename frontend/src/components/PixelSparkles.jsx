import React, { useMemo } from 'react';
import PixelDoodle from './PixelDoodle';

const PixelSparkles = () => {
  const sparkles = useMemo(() => {
    const types = ['sparkle', 'star', 'star'];
    const items = [];
    for (let i = 0; i < 12; i++) {
      // Restrict left to either < 20% or > 80% to keep them in margins
      const isLeft = Math.random() > 0.5;
      const leftMargin = isLeft ? Math.random() * 20 : 80 + Math.random() * 20;

      items.push({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        top: `${Math.random() * 100}%`,
        left: `${leftMargin}%`,
        delay: `${Math.random() * 2}s`,
        size: Math.random() > 0.5 ? 16 : 24,
      });
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50 z-0">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute animate-bounce-pixel"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: '3s', // slower bounce
          }}
        >
          <PixelDoodle type={s.type} size={s.size} />
        </div>
      ))}
    </div>
  );
};

export default PixelSparkles;
