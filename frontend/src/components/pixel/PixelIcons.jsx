import React from 'react';

/* ============================================
   POCKET PAL — PIXEL ART ILLUSTRATION SYSTEM
   Rich, detailed pixel-art SVG components
   ============================================ */

// Base pixel SVG wrapper
const P = ({ children, className = '', size = 24, viewBox = '0 0 16 16', ...props }) => (
  <svg
    viewBox={viewBox}
    width={size}
    height={size}
    shapeRendering="crispEdges"
    className={`inline-block ${className}`}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {children}
  </svg>
);

// ============================================
// NAVIGATION ICONS (28-32px)
// ============================================

export const PixelHome = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="7" y="1" width="2" height="1" fill="#171717"/>
    <rect x="5" y="2" width="2" height="1" fill="#171717"/>
    <rect x="9" y="2" width="2" height="1" fill="#171717"/>
    <rect x="3" y="3" width="2" height="1" fill="#171717"/>
    <rect x="11" y="3" width="2" height="1" fill="#171717"/>
    <rect x="1" y="4" width="2" height="1" fill="#171717"/>
    <rect x="13" y="4" width="2" height="1" fill="#171717"/>
    <rect x="2" y="5" width="12" height="1" fill="#171717"/>
    <rect x="3" y="6" width="10" height="1" fill="#FF6FAE"/>
    <rect x="3" y="7" width="10" height="1" fill="#FF6FAE"/>
    <rect x="3" y="8" width="10" height="1" fill="#FFB3D0"/>
    <rect x="3" y="9" width="10" height="1" fill="#FFB3D0"/>
    <rect x="3" y="10" width="3" height="1" fill="#FFB3D0"/>
    <rect x="10" y="10" width="3" height="1" fill="#FFB3D0"/>
    <rect x="3" y="11" width="3" height="1" fill="#FFB3D0"/>
    <rect x="10" y="11" width="3" height="1" fill="#FFB3D0"/>
    <rect x="3" y="12" width="3" height="2" fill="#FFB3D0"/>
    <rect x="10" y="12" width="3" height="2" fill="#FFB3D0"/>
    {/* Door */}
    <rect x="6" y="10" width="4" height="4" fill="#69D9D5"/>
    <rect x="7" y="10" width="2" height="1" fill="#45B3B0"/>
    <rect x="9" y="12" width="1" height="1" fill="#171717"/>
    {/* Roof pixel detail */}
    <rect x="7" y="2" width="2" height="1" fill="#D94D8A"/>
    <rect x="5" y="3" width="6" height="1" fill="#D94D8A"/>
    <rect x="3" y="4" width="10" height="1" fill="#FF6FAE"/>
  </P>
);

export const PixelAdd = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="6" y="2" width="4" height="12" fill="#171717"/>
    <rect x="2" y="6" width="12" height="4" fill="#171717"/>
    <rect x="7" y="3" width="2" height="10" fill="#B8F28B"/>
    <rect x="3" y="7" width="10" height="2" fill="#B8F28B"/>
    <rect x="7" y="7" width="2" height="2" fill="#D4F7B5"/>
  </P>
);

export const PixelChart = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Bars */}
    <rect x="2" y="8" width="3" height="6" fill="#171717"/>
    <rect x="3" y="9" width="1" height="4" fill="#FF6FAE"/>
    <rect x="6" y="5" width="3" height="9" fill="#171717"/>
    <rect x="7" y="6" width="1" height="7" fill="#FFE66D"/>
    <rect x="10" y="3" width="3" height="11" fill="#171717"/>
    <rect x="11" y="4" width="1" height="9" fill="#69D9D5"/>
    {/* Base line */}
    <rect x="1" y="14" width="14" height="1" fill="#171717"/>
    {/* Left axis */}
    <rect x="1" y="3" width="1" height="11" fill="#171717"/>
  </P>
);

export const PixelHandshake = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Left arm */}
    <rect x="1" y="5" width="3" height="2" fill="#FFD08A"/>
    <rect x="3" y="7" width="2" height="1" fill="#FFD08A"/>
    {/* Right arm */}
    <rect x="12" y="5" width="3" height="2" fill="#FFD08A"/>
    <rect x="11" y="7" width="2" height="1" fill="#FFD08A"/>
    {/* Hands clasped */}
    <rect x="5" y="6" width="6" height="3" fill="#171717"/>
    <rect x="6" y="7" width="4" height="1" fill="#FFD08A"/>
    <rect x="5" y="7" width="1" height="1" fill="#FFD08A"/>
    <rect x="10" y="7" width="1" height="1" fill="#FFD08A"/>
    {/* Sleeves */}
    <rect x="1" y="4" width="3" height="1" fill="#69D9D5"/>
    <rect x="12" y="4" width="3" height="1" fill="#FF6FAE"/>
    {/* Heart */}
    <rect x="7" y="3" width="1" height="1" fill="#FF6FAE"/>
    <rect x="8" y="3" width="1" height="1" fill="#FF6FAE"/>
    <rect x="6" y="4" width="4" height="1" fill="#FF6FAE"/>
    <rect x="7" y="5" width="2" height="1" fill="#D94D8A"/>
  </P>
);

export const PixelUser = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Hair */}
    <rect x="5" y="2" width="6" height="2" fill="#4A4A4A"/>
    {/* Face */}
    <rect x="5" y="4" width="6" height="4" fill="#FFD08A"/>
    {/* Eyes */}
    <rect x="6" y="5" width="1" height="1" fill="#171717"/>
    <rect x="9" y="5" width="1" height="1" fill="#171717"/>
    {/* Smile */}
    <rect x="7" y="7" width="2" height="1" fill="#D97330"/>
    {/* Body */}
    <rect x="4" y="9" width="8" height="5" fill="#69D9D5"/>
    <rect x="6" y="9" width="4" height="1" fill="#45B3B0"/>
    {/* Outline */}
    <rect x="4" y="1" width="8" height="1" fill="#171717"/>
    <rect x="4" y="8" width="8" height="1" fill="#171717"/>
    <rect x="3" y="9" width="1" height="5" fill="#171717"/>
    <rect x="12" y="9" width="1" height="5" fill="#171717"/>
    <rect x="3" y="14" width="10" height="1" fill="#171717"/>
  </P>
);

// ============================================
// LARGE PIXEL ART ILLUSTRATIONS (48-96px)
// ============================================

export const PixelAvatarMale = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Hair - brown */}
    <rect x="4" y="1" width="8" height="1" fill="#171717"/>
    <rect x="3" y="2" width="2" height="1" fill="#171717"/>
    <rect x="5" y="2" width="6" height="1" fill="#6B4226"/>
    <rect x="11" y="2" width="2" height="1" fill="#171717"/>
    <rect x="3" y="3" width="1" height="1" fill="#171717"/>
    <rect x="4" y="3" width="8" height="1" fill="#6B4226"/>
    <rect x="12" y="3" width="1" height="1" fill="#171717"/>
    {/* Face */}
    <rect x="3" y="4" width="1" height="4" fill="#171717"/>
    <rect x="12" y="4" width="1" height="4" fill="#171717"/>
    <rect x="4" y="4" width="8" height="4" fill="#FFD08A"/>
    {/* Eyes */}
    <rect x="5" y="5" width="2" height="2" fill="#FFFFFF"/>
    <rect x="9" y="5" width="2" height="2" fill="#FFFFFF"/>
    <rect x="6" y="5" width="1" height="2" fill="#171717"/>
    <rect x="10" y="5" width="1" height="2" fill="#171717"/>
    {/* Smile */}
    <rect x="6" y="7" width="4" height="1" fill="#D97330"/>
    <rect x="7" y="7" width="2" height="1" fill="#FFB3D0"/>
    {/* Chin outline */}
    <rect x="4" y="8" width="8" height="1" fill="#171717"/>
    {/* Neck */}
    <rect x="6" y="9" width="4" height="1" fill="#FFD08A"/>
    {/* Shirt - cyan */}
    <rect x="3" y="10" width="10" height="1" fill="#171717"/>
    <rect x="2" y="11" width="1" height="4" fill="#171717"/>
    <rect x="13" y="11" width="1" height="4" fill="#171717"/>
    <rect x="3" y="11" width="10" height="4" fill="#69D9D5"/>
    <rect x="7" y="11" width="2" height="4" fill="#45B3B0"/>
    <rect x="2" y="15" width="12" height="1" fill="#171717"/>
  </P>
);

export const PixelAvatarFemale = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Hair - long pink */}
    <rect x="4" y="1" width="8" height="1" fill="#171717"/>
    <rect x="3" y="2" width="1" height="1" fill="#171717"/>
    <rect x="4" y="2" width="8" height="1" fill="#D94D8A"/>
    <rect x="12" y="2" width="1" height="1" fill="#171717"/>
    <rect x="3" y="3" width="1" height="5" fill="#171717"/>
    <rect x="4" y="3" width="1" height="1" fill="#D94D8A"/>
    <rect x="11" y="3" width="1" height="1" fill="#D94D8A"/>
    <rect x="12" y="3" width="1" height="5" fill="#171717"/>
    {/* Side hair */}
    <rect x="2" y="4" width="1" height="6" fill="#171717"/>
    <rect x="3" y="4" width="1" height="8" fill="#FF6FAE"/>
    <rect x="13" y="4" width="1" height="6" fill="#171717"/>
    <rect x="12" y="4" width="1" height="8" fill="#FF6FAE"/>
    {/* Face */}
    <rect x="4" y="4" width="8" height="4" fill="#FFD08A"/>
    {/* Eyes */}
    <rect x="5" y="5" width="2" height="2" fill="#FFFFFF"/>
    <rect x="9" y="5" width="2" height="2" fill="#FFFFFF"/>
    <rect x="6" y="5" width="1" height="2" fill="#171717"/>
    <rect x="10" y="5" width="1" height="2" fill="#171717"/>
    {/* Blush */}
    <rect x="5" y="7" width="1" height="1" fill="#FFB3D0"/>
    <rect x="10" y="7" width="1" height="1" fill="#FFB3D0"/>
    {/* Smile */}
    <rect x="7" y="7" width="2" height="1" fill="#D97330"/>
    {/* Chin */}
    <rect x="4" y="8" width="8" height="1" fill="#171717"/>
    {/* Neck */}
    <rect x="6" y="9" width="4" height="1" fill="#FFD08A"/>
    {/* Dress - purple */}
    <rect x="4" y="10" width="8" height="1" fill="#171717"/>
    <rect x="3" y="11" width="1" height="4" fill="#171717"/>
    <rect x="12" y="11" width="1" height="4" fill="#171717"/>
    <rect x="4" y="11" width="8" height="4" fill="#B9A7FF"/>
    <rect x="7" y="11" width="2" height="2" fill="#8F7AE5"/>
    <rect x="3" y="15" width="10" height="1" fill="#171717"/>
  </P>
);

export const PixelComputer = (props) => (
  <P viewBox="0 0 24 24" {...props}>
    {/* Monitor outline */}
    <rect x="3" y="2" width="18" height="1" fill="#171717"/>
    <rect x="2" y="3" width="1" height="13" fill="#171717"/>
    <rect x="21" y="3" width="1" height="13" fill="#171717"/>
    <rect x="3" y="16" width="18" height="1" fill="#171717"/>
    {/* Monitor body */}
    <rect x="3" y="3" width="18" height="2" fill="#4A4A4A"/>
    <rect x="3" y="5" width="18" height="10" fill="#69D9D5"/>
    {/* Screen bezel */}
    <rect x="4" y="6" width="16" height="8" fill="#171717"/>
    {/* Screen */}
    <rect x="5" y="7" width="14" height="6" fill="#45B3B0"/>
    {/* Smiley on screen */}
    <rect x="9" y="8" width="2" height="1" fill="#FFE66D"/>
    <rect x="13" y="8" width="2" height="1" fill="#FFE66D"/>
    <rect x="8" y="10" width="1" height="1" fill="#FFE66D"/>
    <rect x="9" y="11" width="6" height="1" fill="#FFE66D"/>
    <rect x="15" y="10" width="1" height="1" fill="#FFE66D"/>
    {/* Dots on bezel */}
    <rect x="4" y="3" width="1" height="1" fill="#FF6FAE"/>
    <rect x="6" y="3" width="1" height="1" fill="#FFE66D"/>
    <rect x="8" y="3" width="1" height="1" fill="#B8F28B"/>
    {/* Stand */}
    <rect x="9" y="17" width="6" height="2" fill="#171717"/>
    <rect x="10" y="17" width="4" height="1" fill="#8A8A8A"/>
    {/* Base */}
    <rect x="7" y="19" width="10" height="2" fill="#171717"/>
    <rect x="8" y="19" width="8" height="1" fill="#8A8A8A"/>
    {/* Keyboard */}
    <rect x="5" y="21" width="14" height="2" fill="#171717"/>
    <rect x="6" y="21" width="12" height="1" fill="#C4C4C4"/>
  </P>
);

export const PixelMoneyStack = (props) => (
  <P viewBox="0 0 24 20" {...props}>
    {/* Bottom bill */}
    <rect x="2" y="12" width="20" height="6" fill="#171717"/>
    <rect x="3" y="13" width="18" height="4" fill="#8AC75A"/>
    <rect x="4" y="14" width="16" height="2" fill="#B8F28B"/>
    <rect x="10" y="13" width="4" height="4" fill="#D4F7B5"/>
    <rect x="11" y="14" width="2" height="2" fill="#8AC75A"/>
    {/* Middle bill */}
    <rect x="3" y="8" width="18" height="5" fill="#171717"/>
    <rect x="4" y="9" width="16" height="3" fill="#69D9D5"/>
    <rect x="5" y="10" width="14" height="1" fill="#A3EBE8"/>
    <rect x="10" y="9" width="4" height="3" fill="#45B3B0"/>
    {/* Top bill */}
    <rect x="4" y="4" width="16" height="5" fill="#171717"/>
    <rect x="5" y="5" width="14" height="3" fill="#B8F28B"/>
    <rect x="6" y="6" width="12" height="1" fill="#D4F7B5"/>
    <rect x="10" y="5" width="4" height="3" fill="#8AC75A"/>
    <rect x="11" y="6" width="2" height="1" fill="#D4F7B5"/>
    {/* Coins on top */}
    <rect x="15" y="1" width="5" height="4" fill="#171717"/>
    <rect x="16" y="2" width="3" height="2" fill="#FFE66D"/>
    <rect x="17" y="2" width="1" height="1" fill="#D9BE45"/>
    <rect x="13" y="2" width="4" height="3" fill="#171717"/>
    <rect x="14" y="3" width="2" height="1" fill="#FFE66D"/>
  </P>
);

export const PixelCoinStack = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Bottom coin */}
    <rect x="3" y="12" width="10" height="3" fill="#171717"/>
    <rect x="4" y="12" width="8" height="2" fill="#D9BE45"/>
    <rect x="5" y="12" width="6" height="1" fill="#FFE66D"/>
    {/* Middle coin */}
    <rect x="4" y="8" width="8" height="3" fill="#171717"/>
    <rect x="5" y="8" width="6" height="2" fill="#D9BE45"/>
    <rect x="6" y="8" width="4" height="1" fill="#FFE66D"/>
    {/* Top coin */}
    <rect x="5" y="4" width="6" height="3" fill="#171717"/>
    <rect x="6" y="4" width="4" height="2" fill="#FFE66D"/>
    <rect x="7" y="4" width="2" height="1" fill="#FFF0A3"/>
    {/* Sparkle */}
    <rect x="12" y="3" width="1" height="1" fill="#FFE66D"/>
    <rect x="13" y="2" width="1" height="3" fill="#FFE66D"/>
    <rect x="14" y="3" width="1" height="1" fill="#FFE66D"/>
  </P>
);

export const PixelWallet = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="2" y="3" width="12" height="10" fill="#171717"/>
    <rect x="3" y="4" width="10" height="8" fill="#FF6FAE"/>
    <rect x="3" y="4" width="10" height="2" fill="#D94D8A"/>
    <rect x="10" y="6" width="4" height="4" fill="#171717"/>
    <rect x="11" y="7" width="2" height="2" fill="#FFE66D"/>
    <rect x="12" y="7" width="1" height="1" fill="#FFF0A3"/>
    {/* Flap */}
    <rect x="3" y="3" width="10" height="2" fill="#D94D8A"/>
    <rect x="4" y="4" width="8" height="1" fill="#FF6FAE"/>
  </P>
);

export const PixelArrowUp = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="7" y="2" width="2" height="1" fill="#171717"/>
    <rect x="5" y="3" width="2" height="1" fill="#171717"/>
    <rect x="9" y="3" width="2" height="1" fill="#171717"/>
    <rect x="3" y="4" width="2" height="1" fill="#171717"/>
    <rect x="11" y="4" width="2" height="1" fill="#171717"/>
    <rect x="5" y="4" width="6" height="1" fill="#B8F28B"/>
    <rect x="7" y="3" width="2" height="1" fill="#B8F28B"/>
    <rect x="7" y="5" width="2" height="9" fill="#171717"/>
    <rect x="7" y="5" width="1" height="8" fill="#8AC75A"/>
    <rect x="8" y="5" width="1" height="8" fill="#B8F28B"/>
  </P>
);

export const PixelArrowDown = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="7" y="2" width="2" height="9" fill="#171717"/>
    <rect x="7" y="2" width="1" height="8" fill="#FF6FAE"/>
    <rect x="8" y="2" width="1" height="8" fill="#D94D8A"/>
    <rect x="7" y="12" width="2" height="1" fill="#171717"/>
    <rect x="5" y="11" width="2" height="1" fill="#171717"/>
    <rect x="9" y="11" width="2" height="1" fill="#171717"/>
    <rect x="3" y="10" width="2" height="1" fill="#171717"/>
    <rect x="11" y="10" width="2" height="1" fill="#171717"/>
    <rect x="5" y="10" width="6" height="2" fill="#FF6FAE"/>
    <rect x="7" y="11" width="2" height="1" fill="#D94D8A"/>
  </P>
);

export const PixelSun = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Rays */}
    <rect x="7" y="0" width="2" height="2" fill="#FFE66D"/>
    <rect x="7" y="14" width="2" height="2" fill="#FFE66D"/>
    <rect x="0" y="7" width="2" height="2" fill="#FFE66D"/>
    <rect x="14" y="7" width="2" height="2" fill="#FFE66D"/>
    <rect x="2" y="2" width="2" height="2" fill="#FFE66D"/>
    <rect x="12" y="2" width="2" height="2" fill="#FFE66D"/>
    <rect x="2" y="12" width="2" height="2" fill="#FFE66D"/>
    <rect x="12" y="12" width="2" height="2" fill="#FFE66D"/>
    {/* Body */}
    <rect x="5" y="4" width="6" height="1" fill="#171717"/>
    <rect x="4" y="5" width="1" height="6" fill="#171717"/>
    <rect x="11" y="5" width="1" height="6" fill="#171717"/>
    <rect x="5" y="11" width="6" height="1" fill="#171717"/>
    <rect x="5" y="5" width="6" height="6" fill="#FFE66D"/>
    <rect x="6" y="6" width="2" height="2" fill="#FFF0A3"/>
    {/* Face */}
    <rect x="6" y="7" width="1" height="1" fill="#D9BE45"/>
    <rect x="9" y="7" width="1" height="1" fill="#D9BE45"/>
    <rect x="7" y="9" width="2" height="1" fill="#D9BE45"/>
  </P>
);

export const PixelCat = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Ears */}
    <rect x="2" y="2" width="2" height="2" fill="#171717"/>
    <rect x="12" y="2" width="2" height="2" fill="#171717"/>
    <rect x="3" y="3" width="1" height="1" fill="#FFB3D0"/>
    <rect x="12" y="3" width="1" height="1" fill="#FFB3D0"/>
    {/* Head */}
    <rect x="2" y="4" width="12" height="1" fill="#171717"/>
    <rect x="1" y="5" width="1" height="5" fill="#171717"/>
    <rect x="14" y="5" width="1" height="5" fill="#171717"/>
    <rect x="2" y="5" width="12" height="5" fill="#8A8A8A"/>
    <rect x="3" y="5" width="10" height="3" fill="#C4C4C4"/>
    {/* Eyes */}
    <rect x="4" y="6" width="2" height="2" fill="#171717"/>
    <rect x="10" y="6" width="2" height="2" fill="#171717"/>
    <rect x="4" y="6" width="1" height="1" fill="#FFFFFF"/>
    <rect x="10" y="6" width="1" height="1" fill="#FFFFFF"/>
    {/* Nose */}
    <rect x="7" y="8" width="2" height="1" fill="#FFB3D0"/>
    {/* Whiskers */}
    <rect x="2" y="8" width="2" height="1" fill="#171717"/>
    <rect x="12" y="8" width="2" height="1" fill="#171717"/>
    {/* Body */}
    <rect x="2" y="10" width="12" height="1" fill="#171717"/>
    <rect x="3" y="11" width="10" height="3" fill="#C4C4C4"/>
    <rect x="2" y="11" width="1" height="3" fill="#171717"/>
    <rect x="13" y="11" width="1" height="3" fill="#171717"/>
    <rect x="2" y="14" width="12" height="1" fill="#171717"/>
    {/* Paws */}
    <rect x="3" y="14" width="2" height="1" fill="#FFFFFF"/>
    <rect x="11" y="14" width="2" height="1" fill="#FFFFFF"/>
  </P>
);

export const PixelPlant = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Leaves */}
    <rect x="7" y="1" width="2" height="1" fill="#8AC75A"/>
    <rect x="5" y="2" width="6" height="1" fill="#B8F28B"/>
    <rect x="4" y="3" width="3" height="2" fill="#8AC75A"/>
    <rect x="9" y="3" width="3" height="2" fill="#B8F28B"/>
    <rect x="6" y="4" width="4" height="1" fill="#D4F7B5"/>
    <rect x="3" y="5" width="2" height="1" fill="#8AC75A"/>
    <rect x="11" y="5" width="2" height="1" fill="#8AC75A"/>
    {/* Stem */}
    <rect x="7" y="5" width="2" height="5" fill="#8AC75A"/>
    {/* Pot */}
    <rect x="4" y="10" width="8" height="1" fill="#171717"/>
    <rect x="4" y="11" width="8" height="4" fill="#FF9B54"/>
    <rect x="5" y="11" width="6" height="1" fill="#FFC094"/>
    <rect x="5" y="14" width="6" height="1" fill="#D97330"/>
    <rect x="3" y="10" width="1" height="1" fill="#171717"/>
    <rect x="12" y="10" width="1" height="1" fill="#171717"/>
    <rect x="3" y="15" width="10" height="1" fill="#171717"/>
  </P>
);

export const PixelStar = (props) => (
  <P viewBox="0 0 12 12" {...props}>
    <rect x="5" y="0" width="2" height="2" fill="#FFE66D"/>
    <rect x="4" y="2" width="4" height="1" fill="#FFE66D"/>
    <rect x="0" y="3" width="12" height="2" fill="#FFE66D"/>
    <rect x="1" y="5" width="10" height="1" fill="#FFE66D"/>
    <rect x="2" y="6" width="8" height="1" fill="#FFE66D"/>
    <rect x="3" y="7" width="2" height="1" fill="#FFE66D"/>
    <rect x="7" y="7" width="2" height="1" fill="#FFE66D"/>
    <rect x="2" y="8" width="2" height="1" fill="#FFE66D"/>
    <rect x="8" y="8" width="2" height="1" fill="#FFE66D"/>
    <rect x="1" y="9" width="2" height="1" fill="#FFE66D"/>
    <rect x="9" y="9" width="2" height="1" fill="#FFE66D"/>
    {/* Highlight */}
    <rect x="5" y="3" width="2" height="1" fill="#FFF0A3"/>
  </P>
);

export const PixelHeart = (props) => (
  <P viewBox="0 0 12 12" {...props}>
    <rect x="1" y="1" width="3" height="2" fill="#FF6FAE"/>
    <rect x="6" y="1" width="3" height="2" fill="#FF6FAE"/>
    <rect x="0" y="3" width="5" height="2" fill="#FF6FAE"/>
    <rect x="5" y="3" width="5" height="2" fill="#D94D8A"/>
    <rect x="1" y="5" width="8" height="2" fill="#FF6FAE"/>
    <rect x="2" y="7" width="6" height="1" fill="#D94D8A"/>
    <rect x="3" y="8" width="4" height="1" fill="#D94D8A"/>
    <rect x="4" y="9" width="2" height="1" fill="#D94D8A"/>
    {/* Highlight */}
    <rect x="2" y="2" width="1" height="1" fill="#FFB3D0"/>
    <rect x="2" y="3" width="2" height="1" fill="#FFB3D0"/>
  </P>
);

export const PixelSparkle = (props) => (
  <P viewBox="0 0 8 8" {...props}>
    <rect x="3" y="0" width="2" height="1" fill="#FFE66D"/>
    <rect x="3" y="7" width="2" height="1" fill="#FFE66D"/>
    <rect x="0" y="3" width="1" height="2" fill="#FFE66D"/>
    <rect x="7" y="3" width="1" height="2" fill="#FFE66D"/>
    <rect x="3" y="3" width="2" height="2" fill="#FFF0A3"/>
    <rect x="2" y="2" width="1" height="1" fill="#FFE66D"/>
    <rect x="5" y="2" width="1" height="1" fill="#FFE66D"/>
    <rect x="2" y="5" width="1" height="1" fill="#FFE66D"/>
    <rect x="5" y="5" width="1" height="1" fill="#FFE66D"/>
  </P>
);

// Category icons
export const PixelFood = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Burger bun top */}
    <rect x="3" y="3" width="10" height="1" fill="#171717"/>
    <rect x="2" y="4" width="12" height="2" fill="#D97330"/>
    <rect x="4" y="4" width="8" height="1" fill="#FF9B54"/>
    {/* Seeds */}
    <rect x="5" y="4" width="1" height="1" fill="#FFF0A3"/>
    <rect x="9" y="4" width="1" height="1" fill="#FFF0A3"/>
    {/* Lettuce */}
    <rect x="2" y="6" width="12" height="1" fill="#8AC75A"/>
    {/* Patty */}
    <rect x="2" y="7" width="12" height="2" fill="#6B4226"/>
    <rect x="3" y="7" width="10" height="1" fill="#8B5A2B"/>
    {/* Cheese */}
    <rect x="2" y="9" width="12" height="1" fill="#FFE66D"/>
    {/* Bun bottom */}
    <rect x="2" y="10" width="12" height="2" fill="#D97330"/>
    <rect x="3" y="10" width="10" height="1" fill="#FF9B54"/>
    <rect x="3" y="12" width="10" height="1" fill="#171717"/>
  </P>
);

export const PixelTravel = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Suitcase body */}
    <rect x="3" y="5" width="10" height="8" fill="#171717"/>
    <rect x="4" y="6" width="8" height="6" fill="#69D9D5"/>
    <rect x="5" y="7" width="6" height="1" fill="#45B3B0"/>
    <rect x="5" y="10" width="6" height="1" fill="#45B3B0"/>
    {/* Handle */}
    <rect x="6" y="3" width="4" height="2" fill="#171717"/>
    <rect x="7" y="3" width="2" height="1" fill="#8A8A8A"/>
    {/* Clasp */}
    <rect x="7" y="8" width="2" height="2" fill="#FFE66D"/>
    <rect x="7" y="8" width="1" height="1" fill="#FFF0A3"/>
    {/* Wheels */}
    <rect x="4" y="13" width="2" height="1" fill="#171717"/>
    <rect x="10" y="13" width="2" height="1" fill="#171717"/>
    {/* Sticker */}
    <rect x="9" y="6" width="2" height="2" fill="#FF6FAE"/>
  </P>
);

export const PixelHousing = (props) => PixelHome(props);

export const PixelFitness = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Barbell */}
    <rect x="1" y="5" width="3" height="6" fill="#171717"/>
    <rect x="2" y="6" width="1" height="4" fill="#FF6FAE"/>
    <rect x="12" y="5" width="3" height="6" fill="#171717"/>
    <rect x="13" y="6" width="1" height="4" fill="#FF6FAE"/>
    {/* Bar */}
    <rect x="4" y="7" width="8" height="2" fill="#171717"/>
    <rect x="4" y="7" width="8" height="1" fill="#8A8A8A"/>
    {/* Inner plates */}
    <rect x="3" y="6" width="2" height="4" fill="#171717"/>
    <rect x="11" y="6" width="2" height="4" fill="#171717"/>
    <rect x="4" y="6" width="1" height="4" fill="#D94D8A"/>
    <rect x="11" y="6" width="1" height="4" fill="#D94D8A"/>
  </P>
);

export const PixelSelfCare = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Bottle */}
    <rect x="6" y="2" width="4" height="2" fill="#171717"/>
    <rect x="7" y="2" width="2" height="1" fill="#B9A7FF"/>
    <rect x="5" y="4" width="6" height="1" fill="#171717"/>
    <rect x="5" y="5" width="6" height="8" fill="#B9A7FF"/>
    <rect x="4" y="5" width="1" height="8" fill="#171717"/>
    <rect x="11" y="5" width="1" height="8" fill="#171717"/>
    <rect x="4" y="13" width="8" height="1" fill="#171717"/>
    {/* Label */}
    <rect x="6" y="7" width="4" height="3" fill="#FFFFFF"/>
    <rect x="7" y="8" width="2" height="1" fill="#D94D8A"/>
    {/* Highlight */}
    <rect x="6" y="5" width="1" height="3" fill="#D4C9FF"/>
  </P>
);

export const PixelClothing = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* T-shirt */}
    <rect x="5" y="2" width="6" height="1" fill="#171717"/>
    <rect x="3" y="3" width="3" height="1" fill="#171717"/>
    <rect x="10" y="3" width="3" height="1" fill="#171717"/>
    <rect x="1" y="4" width="3" height="3" fill="#171717"/>
    <rect x="12" y="4" width="3" height="3" fill="#171717"/>
    <rect x="2" y="4" width="2" height="2" fill="#69D9D5"/>
    <rect x="12" y="4" width="2" height="2" fill="#69D9D5"/>
    <rect x="4" y="3" width="8" height="10" fill="#69D9D5"/>
    <rect x="5" y="3" width="6" height="1" fill="#45B3B0"/>
    <rect x="3" y="13" width="10" height="1" fill="#171717"/>
    {/* Collar */}
    <rect x="7" y="3" width="2" height="2" fill="#FFFFFF"/>
  </P>
);

export const PixelEntertainment = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    {/* Game controller */}
    <rect x="2" y="5" width="12" height="7" fill="#171717"/>
    <rect x="3" y="6" width="10" height="5" fill="#4A4A4A"/>
    {/* D-pad */}
    <rect x="4" y="7" width="1" height="3" fill="#C4C4C4"/>
    <rect x="3" y="8" width="3" height="1" fill="#C4C4C4"/>
    {/* Buttons */}
    <rect x="10" y="7" width="2" height="1" fill="#FF6FAE"/>
    <rect x="11" y="8" width="2" height="1" fill="#69D9D5"/>
    <rect x="10" y="9" width="2" height="1" fill="#FFE66D"/>
    {/* Grips */}
    <rect x="1" y="8" width="1" height="4" fill="#171717"/>
    <rect x="14" y="8" width="1" height="4" fill="#171717"/>
  </P>
);

export const PixelBill = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="3" y="2" width="10" height="12" fill="#171717"/>
    <rect x="4" y="3" width="8" height="10" fill="#FFFCF5"/>
    <rect x="5" y="4" width="6" height="1" fill="#171717"/>
    <rect x="5" y="6" width="6" height="1" fill="#C4C4C4"/>
    <rect x="5" y="8" width="6" height="1" fill="#C4C4C4"/>
    <rect x="5" y="10" width="4" height="1" fill="#C4C4C4"/>
    <rect x="9" y="10" width="2" height="1" fill="#FF6FAE"/>
  </P>
);

export const PixelCalendar = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="2" y="3" width="12" height="11" fill="#171717"/>
    <rect x="3" y="3" width="10" height="2" fill="#FF6FAE"/>
    <rect x="3" y="5" width="10" height="8" fill="#FFFCF5"/>
    <rect x="5" y="2" width="2" height="2" fill="#171717"/>
    <rect x="9" y="2" width="2" height="2" fill="#171717"/>
    {/* Grid */}
    <rect x="4" y="7" width="2" height="2" fill="#69D9D5"/>
    <rect x="7" y="7" width="2" height="2" fill="#FFE66D"/>
    <rect x="10" y="7" width="2" height="2" fill="#B9A7FF"/>
    <rect x="4" y="10" width="2" height="2" fill="#B8F28B"/>
    <rect x="7" y="10" width="2" height="2" fill="#FF6FAE"/>
  </P>
);

export const PixelSettings = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="6" y="1" width="4" height="2" fill="#171717"/>
    <rect x="6" y="13" width="4" height="2" fill="#171717"/>
    <rect x="1" y="6" width="2" height="4" fill="#171717"/>
    <rect x="13" y="6" width="2" height="4" fill="#171717"/>
    {/* Gear body */}
    <rect x="4" y="3" width="8" height="10" fill="#171717"/>
    <rect x="3" y="4" width="10" height="8" fill="#171717"/>
    <rect x="5" y="4" width="6" height="8" fill="#8A8A8A"/>
    <rect x="4" y="5" width="8" height="6" fill="#8A8A8A"/>
    {/* Center */}
    <rect x="6" y="6" width="4" height="4" fill="#171717"/>
    <rect x="7" y="7" width="2" height="2" fill="#69D9D5"/>
  </P>
);

export const PixelLock = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="5" y="2" width="6" height="1" fill="#171717"/>
    <rect x="4" y="3" width="2" height="4" fill="#171717"/>
    <rect x="10" y="3" width="2" height="4" fill="#171717"/>
    <rect x="5" y="3" width="6" height="1" fill="#FFE66D"/>
    <rect x="3" y="7" width="10" height="7" fill="#171717"/>
    <rect x="4" y="8" width="8" height="5" fill="#FFE66D"/>
    <rect x="7" y="9" width="2" height="2" fill="#171717"/>
    <rect x="7" y="11" width="2" height="1" fill="#D9BE45"/>
  </P>
);

export const PixelMail = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="1" y="3" width="14" height="10" fill="#171717"/>
    <rect x="2" y="4" width="12" height="8" fill="#69D9D5"/>
    {/* Envelope flap */}
    <rect x="2" y="4" width="1" height="1" fill="#45B3B0"/>
    <rect x="13" y="4" width="1" height="1" fill="#45B3B0"/>
    <rect x="3" y="5" width="2" height="1" fill="#45B3B0"/>
    <rect x="11" y="5" width="2" height="1" fill="#45B3B0"/>
    <rect x="5" y="6" width="2" height="1" fill="#45B3B0"/>
    <rect x="9" y="6" width="2" height="1" fill="#45B3B0"/>
    <rect x="7" y="7" width="2" height="1" fill="#45B3B0"/>
    {/* Heart seal */}
    <rect x="7" y="8" width="2" height="1" fill="#FF6FAE"/>
    <rect x="6" y="9" width="4" height="1" fill="#FF6FAE"/>
  </P>
);

export const PixelSearch = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="5" y="2" width="5" height="1" fill="#171717"/>
    <rect x="3" y="3" width="2" height="1" fill="#171717"/>
    <rect x="10" y="3" width="2" height="1" fill="#171717"/>
    <rect x="3" y="4" width="1" height="5" fill="#171717"/>
    <rect x="11" y="4" width="1" height="5" fill="#171717"/>
    <rect x="4" y="4" width="7" height="5" fill="#69D9D5"/>
    <rect x="5" y="9" width="5" height="1" fill="#171717"/>
    <rect x="10" y="9" width="2" height="2" fill="#171717"/>
    <rect x="12" y="11" width="2" height="2" fill="#171717"/>
    <rect x="13" y="11" width="1" height="1" fill="#8A8A8A"/>
    {/* Shine */}
    <rect x="5" y="5" width="2" height="2" fill="#A3EBE8"/>
  </P>
);

export const PixelCross = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="3" y="3" width="2" height="2" fill="#D94D8A"/>
    <rect x="11" y="3" width="2" height="2" fill="#D94D8A"/>
    <rect x="5" y="5" width="2" height="2" fill="#D94D8A"/>
    <rect x="9" y="5" width="2" height="2" fill="#D94D8A"/>
    <rect x="7" y="7" width="2" height="2" fill="#D94D8A"/>
    <rect x="5" y="9" width="2" height="2" fill="#D94D8A"/>
    <rect x="9" y="9" width="2" height="2" fill="#D94D8A"/>
    <rect x="3" y="11" width="2" height="2" fill="#D94D8A"/>
    <rect x="11" y="11" width="2" height="2" fill="#D94D8A"/>
  </P>
);

export const PixelCheck = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="12" y="3" width="2" height="2" fill="#8AC75A"/>
    <rect x="10" y="5" width="2" height="2" fill="#8AC75A"/>
    <rect x="8" y="7" width="2" height="2" fill="#8AC75A"/>
    <rect x="6" y="9" width="2" height="2" fill="#8AC75A"/>
    <rect x="4" y="7" width="2" height="2" fill="#8AC75A"/>
    <rect x="2" y="5" width="2" height="2" fill="#8AC75A"/>
  </P>
);

export const PixelFloppyDisk = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="2" y="2" width="12" height="12" fill="#171717"/>
    <rect x="3" y="3" width="10" height="10" fill="#69D9D5"/>
    {/* Metal slider */}
    <rect x="5" y="3" width="6" height="4" fill="#C4C4C4"/>
    <rect x="8" y="3" width="2" height="4" fill="#8A8A8A"/>
    {/* Label area */}
    <rect x="4" y="8" width="8" height="4" fill="#FFFCF5"/>
    <rect x="5" y="9" width="6" height="1" fill="#FF6FAE"/>
    <rect x="5" y="11" width="4" height="1" fill="#C4C4C4"/>
  </P>
);

export const PixelGameConsole = (props) => (
  <P viewBox="0 0 20 20" {...props}>
    {/* Body */}
    <rect x="3" y="2" width="14" height="16" fill="#171717"/>
    <rect x="4" y="3" width="12" height="14" fill="#FF6FAE"/>
    {/* Screen */}
    <rect x="5" y="4" width="10" height="7" fill="#171717"/>
    <rect x="6" y="5" width="8" height="5" fill="#B8F28B"/>
    {/* Screen content */}
    <rect x="7" y="6" width="2" height="1" fill="#8AC75A"/>
    <rect x="11" y="6" width="2" height="1" fill="#8AC75A"/>
    <rect x="8" y="8" width="4" height="1" fill="#8AC75A"/>
    {/* D-pad */}
    <rect x="6" y="13" width="1" height="3" fill="#171717"/>
    <rect x="5" y="14" width="3" height="1" fill="#171717"/>
    {/* Buttons */}
    <rect x="12" y="12" width="2" height="1" fill="#FFE66D"/>
    <rect x="13" y="13" width="2" height="1" fill="#69D9D5"/>
    {/* Speaker */}
    <rect x="8" y="12" width="4" height="1" fill="#D94D8A"/>
  </P>
);

export const PixelCalculator = (props) => (
  <P viewBox="0 0 16 16" {...props}>
    <rect x="3" y="1" width="10" height="14" fill="#171717"/>
    <rect x="4" y="2" width="8" height="12" fill="#4A4A4A"/>
    {/* Screen */}
    <rect x="5" y="3" width="6" height="3" fill="#B8F28B"/>
    <rect x="6" y="4" width="4" height="1" fill="#D4F7B5"/>
    {/* Buttons */}
    <rect x="5" y="7" width="2" height="1" fill="#FF6FAE"/>
    <rect x="8" y="7" width="2" height="1" fill="#69D9D5"/>
    <rect x="5" y="9" width="2" height="1" fill="#FFE66D"/>
    <rect x="8" y="9" width="2" height="1" fill="#B9A7FF"/>
    <rect x="5" y="11" width="2" height="1" fill="#C4C4C4"/>
    <rect x="8" y="11" width="2" height="1" fill="#FF9B54"/>
  </P>
);
