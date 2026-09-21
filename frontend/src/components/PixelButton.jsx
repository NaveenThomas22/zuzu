import React from 'react';

const VARIANTS = {
  pink: "bg-pink-pp text-ink",
  mint: "bg-mint text-ink",
  cyan: "bg-cyan-pp text-ink",
  yellow: "bg-yellow-pp text-ink",
  lavender: "bg-lavender text-ink",
  ink: "bg-ink text-cream",
};

const PixelButton = ({ children, variant = "pink", className = "", ...props }) => {
  const bgClass = VARIANTS[variant] || VARIANTS.pink;
  
  return (
    <button
      className={`font-pixel text-xs px-4 py-3 border-[3px] border-ink shadow-pixel ${bgClass} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PixelButton;
