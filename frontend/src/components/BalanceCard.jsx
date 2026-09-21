import React from 'react';
import PixelIcon from './PixelIcon';
import PixelDoodle from './PixelDoodle';

const BalanceCard = ({ balance = 0 }) => {
  return (
    <div className="relative mx-4 mt-6">
      {/* Sparkles around card */}
      <div className="absolute -top-4 -left-2 opacity-80"><PixelDoodle type="star" size={24} /></div>
      <div className="absolute -bottom-3 -right-2 opacity-80"><PixelDoodle type="sparkle" size={20} /></div>

      <div className="relative bg-cyan-light border-[3px] border-ink shadow-pixel p-4 rounded-none flex items-center justify-between z-10">
        {/* Washi tape */}
        <div className="absolute -top-2 -left-4 w-12 h-4 bg-pink-pp border-2 border-ink -rotate-12 z-20 shadow-pixel-sm"></div>

        <div className="flex flex-col gap-2 relative z-10">
          <h2 className="font-pixel text-[10px] text-ink/80 tracking-wider">CURRENT BALANCE</h2>
          <p className="font-pixel text-2xl text-ink whitespace-nowrap overflow-hidden text-ellipsis">
            {`₹${Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
          </p>
          <p className="font-retro text-sm text-ink mt-1">Keep going! ♥</p>
        </div>
        <PixelIcon name="money-stack" size={56} accent="#A5D6A7" className="mr-2" />
      </div>
    </div>
  );
};

export default BalanceCard;
