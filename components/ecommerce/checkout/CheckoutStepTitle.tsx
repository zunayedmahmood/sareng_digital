'use client';

import React from 'react';
import { Database } from 'lucide-react';

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
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${className}`}>
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 border-4 border-black bg-sd-gold flex items-center justify-center font-neo font-black text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex-shrink-0">
          {number}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
             <Database size={10} className="text-sd-gold" />
             <span className="font-neo font-black text-[9px] uppercase tracking-[0.4em] text-sd-gold italic leading-none">
               {label}
             </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-neo font-black uppercase tracking-tighter text-black leading-none">
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
