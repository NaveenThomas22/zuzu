import React from 'react';

const doodles = {
  lotus: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-pink-pp)" d="M7 3h2v2h-2z M5 5h2v2h-2z M9 5h2v2h-2z M3 7h2v2h-2z M11 7h2v2h-2z M5 7h6v2h-6z M5 9h6v2h-6z M6 11h4v2h-4z"/>
      <path fill="var(--color-ink)" d="M7 2h2v1H7z M5 4h2v1H5z M9 4h2v1H9z M3 6h2v1H3z M11 6h2v1h-2z M13 7h1v4h-1z M2 7h1v4H2z M4 11h1v1H4z M11 11h1v1h-1z M6 12h4v1H6z"/>
      <path fill="var(--color-mint)" d="M7 12h2v4h-2z"/>
    </svg>
  ),
  'cat-sitting': (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M3 4h2v2h-2z M11 4h2v2h-2z M2 6h12v6H2z M4 12h8v2H4z M13 8h2v5h-2z"/>
      <path fill="var(--color-yellow-pp)" d="M4 8h2v2H4z M10 8h2v2h-2z"/>
      <path fill="var(--color-pink-pp)" d="M7 10h2v1H7z"/>
    </svg>
  ),
  'cat-sleeping': (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M2 9h12v5H2z M3 7h3v2H3z M10 7h3v2h-3z"/>
      <path fill="var(--color-pink-pp)" d="M4 8h1v1H4z M11 8h1v1h-1z"/>
      <path fill="var(--color-cream)" d="M11 2h3v1h-3z M13 3h1v1h-1z M11 4h3v1h-3z M11 3h1v1h-1z"/> 
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M5 4h6v1h2v2h2v4h-1v2H2v-2H1V7h2V5h2z"/>
      <path fill="#FFFFFF" d="M5 5h6v1h2v2h1v3H2V8h1V6h2z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M7 2h2v4h4v2H9v4H7V8H3V6h4z"/>
      <path fill="var(--color-yellow-pp)" d="M7 3h2v2h2v2H9v2H7V7H5V5h2z"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M3 3h3v1h4V3h3v3h1v4h-1v2h-2v2h-2v2H7v-2H5v-2H3V9H2V6h1z"/>
      <path fill="var(--color-pink-pp)" d="M3 4h3v2h4V4h3v2h1v3h-1v2h-2v2H7v-2H5V9H3V6h1V4z"/>
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M7 4h2v2h2v2H9v2H7V8H5V6h2z"/>
      <path fill="var(--color-cyan-pp)" d="M7 5h2v1h1v1H9v1H7V7H6V6h1z"/>
    </svg>
  ),
  smiley: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M5 2h6v2h2v2h1v4h-1v2h-2v2H5v-2H3v-2H2V6h1V4h2z"/>
      <path fill="var(--color-yellow-pp)" d="M5 3h6v1h2v2h1v4h-1v2h-2v1H5v-1H3v-2H2V6h1V4h2z"/>
      <path fill="var(--color-ink)" d="M5 6h2v2H5z M9 6h2v2H9z M4 10h1v1h6v-1h1v2H4z"/>
    </svg>
  ),
  rainbow: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-pink-pp)" d="M2 12h2v-4h8v4h2v-6H2z"/>
      <path fill="var(--color-yellow-pp)" d="M4 12h2v-2h4v2h2v-4H4z"/>
      <path fill="var(--color-cyan-pp)" d="M6 12h4v-2H6z"/>
    </svg>
  ),
  'computer-smiley': (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M2 2h12v10H2z M5 12h6v2H5z M3 14h10v2H3z"/>
      <path fill="var(--color-cream)" d="M3 3h10v8H3z"/>
      <path fill="var(--color-yellow-pp)" d="M5 5h6v4H5z"/>
      <path fill="var(--color-ink)" d="M6 6h1v1H6z M9 6h1v1H9z M6 8h4v1H6z"/>
    </svg>
  ),
  plant: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M6 9h4v6H6z M4 7h8v2H4z M7 2h2v7H7z M4 4h3v2H4z M9 4h3v2H9z"/>
      <path fill="var(--color-mint)" d="M7 3h2v6H7z M5 5h2v1H5z M9 5h2v1H9z"/>
      <path fill="var(--color-pink-pp)" d="M6 10h4v4H6z"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M3 3h10v10H3z"/>
      <path fill="var(--color-lavender)" d="M4 4h8v8H4z"/>
      <path fill="var(--color-ink)" d="M5 2h2v12H5z M10 6h1v4h-1z"/>
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
      <path fill="var(--color-ink)" d="M12 2h2v2l-8 8H4v-2l8-8z"/>
      <path fill="var(--color-yellow-pp)" d="M11 4l1-1 1 1-7 7-1-1 7-7z M5 11l-1 1v1h1l1-1-1-1z"/>
      <path fill="var(--color-pink-pp)" d="M12 3l1-1 1 1-1 1-1-1z"/>
    </svg>
  ),
};

const PixelDoodle = ({ type, size = 16, className = '' }) => {
  const doodle = doodles[type];
  if (!doodle) return null;

  return (
    <div 
      className={`inline-block flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {doodle}
    </div>
  );
};

export default PixelDoodle;
