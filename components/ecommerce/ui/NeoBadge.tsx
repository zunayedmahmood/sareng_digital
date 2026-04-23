'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NeoBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'gold' | 'black' | 'white' | 'red' | 'violet';
  isRotated?: boolean;
}

const NeoBadge = ({ className, variant = 'gold', isRotated = true, children, ...props }: NeoBadgeProps) => {
  const variants = {
    gold: 'bg-sd-gold text-black',
    black: 'bg-black text-white',
    white: 'bg-white text-black',
    red: 'bg-[#FF6B6B] text-black',
    violet: 'bg-[#C4B5FD] text-black',
  };

  return (
    <div
      className={cn(
        'neo-border-2 inline-flex items-center px-3 py-1 font-neo font-black text-xs uppercase tracking-widest neo-shadow-sm',
        variants[variant],
        isRotated && '-rotate-2 neo-sticker',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default NeoBadge;
