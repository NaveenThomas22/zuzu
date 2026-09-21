import React from 'react';

const PixelCard = ({ children, tilt, tape, className = "" }) => {
  let tiltClass = "";
  if (tilt) {
    tiltClass = tilt === "left" ? "-rotate-2" : "rotate-1";
  }

  return (
    <div className={`relative border-[3px] border-ink shadow-pixel bg-cream p-4 ${tiltClass} ${className}`}>
      {tape && (
        <div className="absolute -top-2 -left-2 w-14 h-4 bg-pink-pp/80 rotate-[-20deg] border-2 border-ink"></div>
      )}
      {children}
    </div>
  );
};

export default PixelCard;
