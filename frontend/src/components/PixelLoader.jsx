import React from 'react';

const PixelLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="w-3 h-3 bg-ink animate-[bounce-pixel_0.6s_steps(4)_infinite]"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <p className="font-pixel text-[10px] text-ink tracking-widest uppercase">LOADING...</p>
    </div>
  );
};

export default PixelLoader;
