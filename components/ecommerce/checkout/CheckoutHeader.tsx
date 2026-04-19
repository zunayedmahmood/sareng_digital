'use client';

import React from 'react';
import { Lock, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CheckoutHeaderProps {
  step: 'shipping' | 'payment' | 'review';
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ step }) => {
  const steps = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <header className="bg-sd-black border-b border-sd-border-default pt-20 pb-8 lg:pt-24 lg:pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link href="/e-commerce" className="text-2xl font-bold text-sd-ivory font-display italic tracking-tight">
              Sareng <span className="text-sd-gold">Digital</span>
            </Link>
            <div className="h-4 w-px bg-sd-border-default hidden lg:block" />
            <div className="flex items-center gap-2 text-sd-text-muted">
              <Lock className="w-3.5 h-3.5 text-sd-gold" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Secure Checkout</span>
            </div>
          </div>

          <nav className="flex items-center gap-4 lg:gap-8">
            {steps.map((s, i) => {
              const isPast = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={s.id} className="flex items-center gap-4 lg:gap-8">
                  <div className={`flex items-center gap-3 ${isCurrent ? 'text-sd-gold' : isPast ? 'text-sd-ivory' : 'text-sd-text-muted'}`}>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      isCurrent ? 'border-sd-gold bg-sd-gold text-sd-black' : isPast ? 'border-sd-ivory bg-sd-ivory text-sd-black' : 'border-sd-border-default'
                    }`}>
                      {isPast ? '✓' : i + 1}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase hidden sm:block">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-sd-border-default hidden sm:block" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default CheckoutHeader;
