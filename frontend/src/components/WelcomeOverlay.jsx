import React, { useEffect, useState } from 'react';
import PixelDoodle from './PixelDoodle';

const WelcomeOverlay = ({ user, onComplete }) => {
  const [phase, setPhase] = useState('hidden'); // hidden -> pop -> speech -> fade

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setPhase('speech');
      const t = setTimeout(() => {
        setPhase('fade');
        setTimeout(onComplete, 300);
      }, 1500);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase('pop'), 100);
    const t2 = setTimeout(() => setPhase('speech'), 500);
    const t3 = setTimeout(() => setPhase('fade'), 1700);
    const t4 = setTimeout(() => onComplete(), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const avatarSrc = user?.gender === 'FEMALE' 
    ? '/assets/pixel-avatar-female.jpg' 
    : '/assets/pixel-avatar-male.jpg';

  const displayName = user?.name || 'Friend';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-pp overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-300 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Background decorations */}
        <div className="absolute top-10 right-10 opacity-70"><PixelDoodle type="sparkle" size={48} /></div>
        <div className="absolute bottom-20 left-10 opacity-70"><PixelDoodle type="star" size={32} /></div>
        <div className="absolute top-1/4 left-1/4 opacity-70"><PixelDoodle type="heart" size={32} /></div>
        <div className="absolute top-1/2 right-1/4 opacity-70"><PixelDoodle type="rainbow" size={64} /></div>

        <div className="relative flex flex-col items-center justify-center w-full h-full max-w-sm mt-20 mx-auto">
          
          {/* Speech Bubble */}
          <div 
            className={`
              absolute -top-[70px] 
              bg-cream border-[4px] border-ink px-6 py-3 shadow-pixel-lg z-20
              transition-all duration-300 origin-bottom flex flex-col items-center gap-1
              ${phase === 'speech' || phase === 'fade' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
            `}
          >
            <p className="font-pixel text-xl sm:text-2xl text-ink uppercase tracking-wide text-center">
              Hi {displayName}! 👋
            </p>
            <p className="font-retro text-sm text-ink/80 text-center uppercase tracking-widest">
              Welcome to Zuzu!
            </p>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-cream border-b-[4px] border-r-[4px] border-ink transform rotate-45"></div>
          </div>

          {/* Character Container */}
          <div 
            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            className={`
              w-48 h-48 bg-cream border-[4px] border-ink p-2 shadow-pixel-lg z-10
              transition-transform duration-[400ms]
              ${phase === 'hidden' ? 'translate-y-[150vh]' : 'translate-y-0'}
              ${phase === 'speech' ? 'animate-bounce-pixel' : ''}
            `}
          >
            <img 
              src={avatarSrc} 
              alt="Welcome character" 
              className="w-full h-full object-cover border-[2px] border-ink"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
