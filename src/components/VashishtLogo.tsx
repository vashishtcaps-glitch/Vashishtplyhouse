import React, { useState } from 'react';

export const OFFICIAL_LOGO_URL = 'https://i.postimg.cc/fW3bXPDp/Vashisht-Ply-House-Logo.png';

interface VashishtLogoProps {
  className?: string;
  size?: number;
  variant?: 'color' | 'mono';
  showText?: boolean;
}

export const VashishtLogo: React.FC<VashishtLogoProps> = ({
  className = '',
  size = 48,
  variant = 'color',
  showText = false,
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const isMono = variant === 'mono';

  // Fallback timber colors
  const plyBrown = isMono ? '#000000' : '#b45309';
  const plyWarm = isMono ? '#333333' : '#d97706';
  const plyGold = isMono ? '#555555' : '#f59e0b';
  const plyNavy = isMono ? '#000000' : '#0f172a';

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      {!useFallback ? (
        <img
          src={OFFICIAL_LOGO_URL}
          alt="M/s Vashisht Ply House Official Logo"
          width={size}
          height={size}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: 'contain',
          }}
          className={`shrink-0 transition-opacity duration-200 ${
            isMono ? 'grayscale contrast-125' : ''
          }`}
          onError={() => setUseFallback(true)}
          loading="eager"
          decoding="sync"
        />
      ) : (
        /* Geometric Emblem Fallback if network image is blocked */
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-label="Vashisht Ply House Logo"
        >
          <polygon
            points="50,4 92,26 92,74 50,96 8,74 8,26"
            stroke={plyNavy}
            strokeWidth="3.5"
            fill={isMono ? '#ffffff' : '#fef3c7'}
            fillOpacity={isMono ? '1' : '0.35'}
          />
          <path d="M24 68 L50 82 L76 68 L50 54 Z" fill={plyBrown} />
          <path d="M24 57 L50 71 L76 57 L50 43 Z" fill={plyWarm} />
          <path d="M24 46 L50 60 L76 46 L50 32 Z" fill={plyGold} />
          <path
            d="M50 14 L36 32 H44 L32 46 H42 L50 37 L58 46 H68 L56 32 H64 Z"
            fill={isMono ? '#000000' : '#047857'}
          />
          <path
            d="M44 48 L50 58 L56 48"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
            VASHISHT PLY HOUSE
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mt-0.5">
            Timber · Plywood · Doors · Hardware
          </span>
        </div>
      )}
    </div>
  );
};
