'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'ivory' | 'gold' | 'black' | 'white';
  hasHover?: boolean;
}

const NeoCard = React.forwardRef<HTMLDivElement, NeoCardProps>(
  ({ className, variant = 'white', hasHover = true, children, ...props }, ref) => {
    const variants = {
      white: 'bg-white text-black',
      ivory: 'bg-sd-ivory text-black',
      gold: 'bg-sd-gold text-black',
      black: 'bg-black text-white neo-shadow-sm shadow-white',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'neo-border neo-shadow-md',
          variants[variant],
          hasHover && 'neo-lift',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeoCard.displayName = 'NeoCard';

export default NeoCard;
