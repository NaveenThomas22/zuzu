import React from 'react';

const PixelInput = ({ label, className = "", ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="font-pixel text-xs text-ink">{label}</label>}
      <input 
        className="w-full border-[3px] border-ink bg-cream px-3 py-2 font-retro text-lg focus:outline-none focus:bg-cyan-light shadow-pixel-sm" 
        {...props} 
      />
    </div>
  );
};

export default PixelInput;
