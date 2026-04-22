'use client';

import React from 'react';

interface EcommerceCardProps {
  title?: string;
  label?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function EcommerceCard({
  title,
  label,
  icon,
  children,
  rightElement,
  className = "",
  bodyClassName = "p-10"
}: EcommerceCardProps) {
  return (
    <div className={`bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl ${className}`}>
      {(title || label || icon || rightElement) && (
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-10 h-10 rounded-full bg-sd-gold/5 border border-sd-gold/20 flex items-center justify-center text-sd-gold">
                {icon}
              </div>
            )}
            <div className="flex flex-col gap-1">
              {label && <span className="text-sd-gold text-[8px] font-bold tracking-[0.4em] uppercase">{label}</span>}
              {title && <h3 className="text-xl font-display font-medium italic text-sd-ivory">{title}</h3>}
            </div>
          </div>
          {rightElement && (
            <div className="flex-shrink-0">
              {rightElement}
            </div>
          )}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}
