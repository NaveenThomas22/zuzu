import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PixelIcon from './PixelIcon';
import PixelDoodle from './PixelDoodle';
import PixelSparkles from './PixelSparkles';

const HomeHeader = () => {
  const { user } = useAuth();

  // Dynamically select the correct avatar based on the authenticated user's gender
  const avatarSrc = user?.gender === 'FEMALE'
    ? '/assets/pixel-avatar-female.jpg'
    : '/assets/pixel-avatar-male.jpg';

  const displayName = user?.name || 'Friend';

  return (
    <div className="relative bg-cyan-pp border-b-[3px] border-ink p-3 pb-4 flex flex-col justify-between overflow-hidden sm:min-h-[140px] shadow-pixel-sm">

      {/* Decorative Outer Border Effect (approximated via inner boxing) */}
      <div className="absolute inset-[2px] border-[2px] border-cream pointer-events-none z-0"></div>

      {/* Decorative Sparkles & Sun */}
      <div className="absolute top-2 right-1/2 opacity-80"><PixelDoodle type="sparkle" size={24} /></div>
      <div className="absolute top-3 left-[30%] opacity-80"><PixelDoodle type="sparkle" size={16} /></div>
      <div className="absolute bottom-4 left-[10%] opacity-80"><PixelDoodle type="sparkle" size={20} /></div>

      <div className="relative z-10 flex items-start justify-between w-full h-full gap-2 mt-1">

        {/* Left: Avatar */}
        <div className="flex-shrink-0 flex items-start relative mt-1 ml-1">
          <div className="absolute -top-2 -left-2 z-20">
            <PixelDoodle type="sparkle" size={24} />
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-[3px] border-ink bg-cream p-1 shadow-pixel-sm z-10">
            <img 
              src={avatarSrc} 
              alt="Zuzu avatar" 
              className="w-full h-full object-cover" 
              style={{ imageRendering: 'pixelated' }} 
            />
          </div>
          <div className="absolute -bottom-2 -right-2 z-20">
            <PixelDoodle type="sparkle" size={24} />
          </div>
        </div>

        {/* Center: Greeting & Quote */}
        <div className="flex flex-col flex-1 px-1 justify-start">
          <p className="font-retro text-xs text-ink">Good Morning,</p>
          <p className="font-pixel text-xl sm:text-2xl text-ink uppercase tracking-wide truncate max-w-[150px] sm:max-w-[180px] -mt-1 leading-tight mb-2">
            {displayName} !
          </p>

          <div className="bg-pink-pp border-[3px] border-ink px-2 py-1 shadow-pixel-sm self-start inline-block z-10 max-w-full">
            <p className="font-retro text-[8px] sm:text-[9px] text-ink leading-tight truncate">
              "A little control today, a better tomorrow."
            </p>
          </div>
        </div>

        {/* Right: CRT & Decorations */}
        <div className="flex flex-col items-center justify-between h-full relative w-20 flex-shrink-0 mr-1">

          <div className="absolute -top-1 -left-4">
            <PixelIcon name="sun" size={28} accent="#FFE66D" className="animate-spin-slow drop-shadow-[2px_2px_0_#1A1A1A]" />
          </div>
          <div className="absolute top-4 left-6">
            <PixelDoodle type="heart" size={16} />
          </div>

          {/* Sticker: MAKE GOOD MONEY CHOICES */}
          <div className="absolute -top-1 -right-1 bg-cream border-[2px] border-ink p-1 shadow-pixel transform rotate-6 z-20 hidden sm:block">
            <p className="font-pixel text-[6px] text-ink text-center leading-none">
              MAKE<br />GOOD<br />MONEY<br />CHOICES
            </p>
          </div>

          <div className="absolute -top-1 right-1 bg-cream border-[2px] border-ink p-0.5 shadow-pixel transform rotate-6 z-20 sm:hidden">
            <p className="font-pixel text-[5px] text-ink text-center leading-none">
              MAKE<br />GOOD<br />CHOICES
            </p>
          </div>

          {/* CRT Computer */}
          <div className="mt-8 relative z-10 w-full flex justify-end">
            <img
              src="/assets/pixel-crt.jpg"
              alt="Retro Zuzu computer"
              className="w-16 sm:w-20 object-contain drop-shadow-md"
              style={{ mixBlendMode: 'multiply', imageRendering: 'pixelated' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeHeader;
