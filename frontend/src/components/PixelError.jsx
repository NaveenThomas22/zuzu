import React from 'react';
import PixelIcon from './PixelIcon';
import PixelButton from './PixelButton';

const PixelError = ({ message = "Unknown error", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-[3px] border-ink shadow-pixel bg-cream m-4">
      <PixelIcon name="computer" size={64} accent="#4DD0E1" className="mb-4" />
      <h3 className="font-pixel text-xs text-ink mb-2 uppercase text-pink-pp drop-shadow-md">Something went wrong.</h3>
      <p className="font-retro text-base text-ink mb-6">{message}</p>
      {onRetry && (
        <PixelButton variant="ink" onClick={onRetry}>TRY AGAIN</PixelButton>
      )}
    </div>
  );
};

export default PixelError;
