'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeoMarqueeProps {
  items: React.ReactNode[];
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
  variant?: 'gold' | 'black' | 'white';
}

const NeoMarquee = ({
  items,
  speed = 20,
  direction = 'left',
  className,
  variant = 'gold'
}: NeoMarqueeProps) => {
  const variants = {
    gold: 'bg-sd-gold text-black border-y-4 border-black',
    black: 'bg-black text-white border-y-4 border-black',
    white: 'bg-white text-black border-y-4 border-black',
  };

  const marqueeContent = (
    <div className="flex shrink-0 items-center gap-12 py-3 px-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-4 shrink-0 font-neo font-black uppercase tracking-widest text-sm sm:text-base">
          {item}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn('overflow-hidden flex select-none', variants[variant], className)}>
      <motion.div
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
        }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity
        }}
        className="flex shrink-0 min-w-full"
      >
        {marqueeContent}
        {marqueeContent}
      </motion.div>
    </div>
  );
};

export default NeoMarquee;
