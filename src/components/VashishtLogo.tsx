import React from 'react';

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
  const isMono = variant === 'mono';

  // Timber layers & geometric tree emblem
  const plyBrown = isMono ? '#000000' : '#b45309'; // amber-700
  const plyWarm = isMono ? '#333333' : '#d97706'; // amber-600
  const plyGold = isMono ? '#555555' : '#f59e0b'; // amber-500
  const plyNavy = isMono ? '#000000' : '#0f172a'; // slate-900 / navy

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Vashisht Ply House Logo"
      >
        {/* Outer Hexagonal Shield / Timber Cross Section Frame */}
        <polygon
          points="50,4 92,26 92,74 50,96 8,74 8,26"
          stroke={plyNavy}
          strokeWidth="3.5"
          fill={isMono ? '#ffffff' : '#fef3c7'}
          fillOpacity={isMono ? '1' : '0.35'}
        />

        {/* 3 Isometric Plywood Laminated Sheets (Core Ply Cross-Section) */}
        {/* Layer 1 - Bottom sheet */}
        <path
          d="M24 68 L50 82 L76 68 L50 54 Z"
          fill={plyBrown}
          stroke={isMono ? '#000000' : '#78350f'}
          strokeWidth="1.5"
        />
        {/* Layer 2 - Middle sheet */}
        <path
          d="M24 57 L50 71 L76 57 L50 43 Z"
          fill={plyWarm}
          stroke={isMono ? '#000000' : '#92400e'}
          strokeWidth="1.5"
        />
        {/* Layer 3 - Top sheet with natural wood grain ring arc */}
        <path
          d="M24 46 L50 60 L76 46 L50 32 Z"
          fill={plyGold}
          stroke={isMono ? '#000000' : '#b45309'}
          strokeWidth="1.5"
        />

        {/* Stylized Geometric Pine Tree / Forest Silhouette rising from the core ply */}
        <path
          d="M50 14 L36 32 H44 L32 46 H42 L50 37 L58 46 H68 L56 32 H64 Z"
          fill={isMono ? '#000000' : '#047857'}
          stroke={isMono ? '#000000' : '#064e3b'}
          strokeWidth="1"
        />

        {/* Central Geometric 'V' Monogram Emblem for Vashisht */}
        <path
          d="M44 48 L50 58 L56 48"
          stroke={isMono ? '#ffffff' : '#ffffff'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

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
