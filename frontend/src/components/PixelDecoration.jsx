import React from 'react';
import PixelDoodle from './PixelDoodle';

const PixelDecoration = () => {
  return (
    <div className="fixed bottom-24 right-4 w-16 h-16 opacity-70 pointer-events-none z-0">
      <PixelDoodle type="lotus" size={64} />
    </div>
  );
};

export default PixelDecoration;
