'use client';

import React from 'react';
import { Lock, ChevronRight, ShoppingBag, Database, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface CheckoutHeaderProps {
  step: 'shipping' | 'payment' | 'review';
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ step }) => {
  const steps = [
    { id: 'shipping', label: 'Identification' },
    { id: 'payment', label: 'Operational' },
    { id: 'review', label: 'Authentication' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black h-20 lg:h-24 px-6 flex items-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="container mx-auto flex items-center justify-between gap-8">
        {/* Branding Module */}
        <div className="flex items-center gap-6">
          <Link href="/e-commerce" className="flex items-center gap-3 group">
             <div className="w-10 h-10 border-2 border-black bg-sd-gold flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                <ShoppingBag size={20} />
             </div>
             <span className="text-xl font-neo font-black uppercase tracking-tighter italic hidden sm:block">
                Sareng<span className="text-sd-gold">Digital</span>
             </span>
          </Link>
          <div className="h-10 w-1 bg-black/5 hidden lg:block" />
          <div className="hidden lg:flex items-center gap-2">
             <ShieldCheck size={14} className="text-sd-gold" />
             <span className="font-neo font-black text-[9px] uppercase tracking-[0.3em] text-black/40 italic">Registry Locked</span>
          </div>
        </div>

        {/* Step Indicator Module */}
        <nav className="flex items-center gap-2 md:gap-8">
          {steps.map((s, i) => {
            const isPast = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={s.id} className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-3 ${isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 border-2 border-black flex items-center justify-center font-neo font-black text-xs transition-all ${
                    isCurrent ? 'bg-sd-gold shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : isPast ? 'bg-black text-white shadow-none' : 'bg-white'
                  }`}>
                    {isPast ? '✓' : i + 1}
                  </div>
                  <div className="hidden md:flex flex-col">
                     <span className={`font-neo font-black text-[10px] uppercase tracking-widest italic leading-none ${isCurrent ? 'text-black' : 'text-black/40'}`}>
                        {s.label}
                     </span>
                     <span className="font-neo font-bold text-[8px] uppercase text-black/20 tracking-[0.2em] mt-1">Sector 0{i + 1}</span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-4 md:w-8 h-1 bg-black/5 mx-1" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Status Module */}
        <div className="hidden md:flex items-center gap-3 pl-8 border-l-2 border-black/5">
           <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full" />
           <span className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40 italic">Live Encryption Protocol</span>
        </div>
      </div>
    </header>
  );
};

export default CheckoutHeader;
