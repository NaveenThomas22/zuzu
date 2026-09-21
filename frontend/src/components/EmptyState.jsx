import React from 'react';
import { Link } from 'react-router-dom';
import PixelButton from './PixelButton';

import PixelCard from './PixelCard';
import PixelDoodle from './PixelDoodle';

const EmptyState = ({ title, message, ctaLabel, ctaTo }) => {
  return (
    <PixelCard tilt="left" className="flex flex-col items-center justify-center py-10 px-4 text-center mt-4">
      <div className="relative mb-6">
        <div className="absolute -top-6 -right-2 font-pixel text-xs text-pink-pp animate-bounce-pixel">Z z z</div>
        <PixelDoodle type="cat-sleeping" size={64} />
      </div>
      <h3 className="font-pixel text-xs text-ink mb-2 uppercase tracking-wide">{title}</h3>
      <p className="font-retro text-base text-ink mb-6">{message}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo}>
          <PixelButton variant="pink">{ctaLabel}</PixelButton>
        </Link>
      )}
    </PixelCard>
  );
};

export default EmptyState;
