import React from 'react';
import PixelIcon from './PixelIcon';

const StatCard = ({ label, value = 0, color = 'pink', iconName, smallText = false }) => {
  const colorMap = {
    mint: 'bg-mint',
    pink: 'bg-pink-pp',
    yellow: 'bg-yellow-pp',
    lavender: 'bg-lavender',
    cyan: 'bg-cyan-light'
  };

  const bg = colorMap[color] || 'bg-cream';
  const formattedValue = `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <div className={`border-[3px] border-ink shadow-pixel p-3 ${bg} flex flex-col justify-between min-h-[120px]`}>
      <h3 className="font-pixel text-[10px] text-ink mb-3">{label}</h3>
      <p className={`font-pixel ${smallText ? 'text-xs' : 'text-sm'} text-ink mb-4 whitespace-nowrap overflow-hidden text-ellipsis`}>{formattedValue}</p>
      <div className="self-end mt-auto">
        <PixelIcon name={iconName} size={24} accent="#FDF6E3" />
      </div>
    </div>
  );
};

export default StatCard;
