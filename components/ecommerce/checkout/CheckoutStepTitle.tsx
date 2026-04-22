'use client';

import React from 'react';

interface CheckoutStepTitleProps {
  number: number;
  label: string;
  title: string;
  className?: string;
  rightElement?: React.ReactNode;
}

export default function CheckoutStepTitle({
  number,
  label,
  title,
  className = "mb-12",
  rightElement
}: CheckoutStepTitleProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-full border border-sd-gold/30 flex items-center justify-center text-sd-gold font-display italic text-xl">
          {number}
        </div>
        <div>
          <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase block mb-1">
            {label}
          </span>
          <h2 className="text-3xl font-bold text-sd-ivory font-display italic">
            {title}
          </h2>
        </div>
      </div>
      {rightElement && (
        <div className="flex-shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  );
}
