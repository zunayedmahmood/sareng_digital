'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'black';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isFullWidth?: boolean;
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = 'primary', size = 'md', isFullWidth = false, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-sd-gold text-black neo-shadow-sm hover:bg-sd-gold-soft',
      secondary: 'bg-white text-black neo-shadow-sm hover:bg-sd-ivory-dark',
      outline: 'bg-transparent border-black neo-shadow-sm hover:bg-sd-gold/10',
      black: 'bg-black text-white neo-shadow-sm shadow-white hover:bg-sd-onyx',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-xl',
      xl: 'px-10 py-5 text-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'neo-border font-neo font-black uppercase tracking-widest transition-all neo-click active:translate-x-[2px] active:translate-y-[2px] active:shadow-none inline-flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          isFullWidth ? 'w-full' : 'w-auto',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeoButton.displayName = 'NeoButton';

export default NeoButton;
