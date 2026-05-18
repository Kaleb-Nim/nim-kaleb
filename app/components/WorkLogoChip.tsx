'use client';

import type React from 'react';

interface WorkLogoChipProps {
  src: string;
  bg?: string;
  alt: string;
}

export default function WorkLogoChip({ src, bg, alt }: WorkLogoChipProps) {
  return (
    <div
      style={{
        flex: '0 0 auto',
        width: 'clamp(56px, 14vw, 76px)',
        height: 'clamp(56px, 14vw, 76px)',
        background: bg || '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        border: '1px solid rgba(0,255,0,0.35)',
        boxShadow:
          '0 0 0 1px rgba(0,255,0,0.15) inset, 0 0 14px rgba(0,255,0,0.18), 0 4px 14px rgba(0,0,0,0.55)',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          // Slight desaturation so the logos feel embedded in the CRT, not pasted on
          filter: 'saturate(0.92) contrast(1.02)',
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
