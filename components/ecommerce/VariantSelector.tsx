'use client';

import React from 'react';
import { ProductVariant } from '@/app/e-commerce/product/[id]/page';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  baseName?: string;
}

const formatVariantLabelForCard = (v: ProductVariant) => {
  let source = v.variation_suffix || v.name || '';
  let clean = source.replace(/^\[|\]$/g, '').trim();
  while (clean.startsWith('-')) clean = clean.substring(1);
  while (clean.endsWith('-')) clean = clean.substring(0, clean.length - 1);

  const parts = clean.split(/[-/]/).map(p => p.trim()).filter(p => {
    const lp = p.toLowerCase();
    return lp !== 'na' && lp !== 'not applicable' && lp !== 'none' && lp !== '';
  });

  let usIndex = -1;
  let usVal = '';
  let euVal = '';

  for (let i = 0; i < parts.length; i++) {
    const low = parts[i].toLowerCase();
    if (low === 'us' && i + 1 < parts.length && !isNaN(Number(parts[i + 1]))) {
      usIndex = i;
      usVal = parts[i + 1];
      break;
    }
  }

  if (usIndex !== -1) {
    for (let i = 0; i < parts.length; i++) {
      if (i !== usIndex && i !== (usIndex + 1) && !isNaN(Number(parts[i]))) {
        euVal = parts[i];
        break;
      }
    }
    if (usVal && euVal) {
      const others = parts.filter((_, i) => i !== usIndex && i !== (usIndex + 1) && parts[i] !== euVal);
      const sizeStr = `US ${usVal} / EU ${euVal}`;
      return others.length > 0 ? `${sizeStr} - ${others.join(' - ')}` : sizeStr;
    }
  }

  return parts.join(' - ') || 'Standard';
};

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
}) => {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 bg-sd-gold rounded-full" />
           <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-sd-black">Registry Options</span>
        </div>
        <span className="font-mono text-[9px] text-sd-text-muted uppercase tracking-[0.2em]">{variants.length} Entries Available</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {variants.map((v) => {
          const isSelected = selectedVariant.id === v.id;
          const isAvailable = v.in_stock && (v.available_inventory ?? 0) > 0;
          const label = formatVariantLabelForCard(v);

          return (
            <button
              key={v.id}
              onClick={() => onVariantChange(v)}
              className={`
                group relative min-h-[56px] px-4 py-3 rounded-2xl transition-all duration-500 border border-sd-border-default/5 overflow-hidden flex flex-col items-center justify-center text-center
                ${isSelected 
                  ? 'bg-sd-white text-sd-black sd-depth-lift border-sd-gold z-10' 
                  : isAvailable 
                    ? 'bg-sd-ivory-dark/10 text-sd-text-muted hover:bg-sd-white hover:text-sd-black hover:border-sd-gold/30'
                    : 'bg-sd-ivory-dark/5 text-sd-text-muted/30 opacity-40 cursor-not-allowed sd-depth-recess'}
              `}
            >
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-300 ${isSelected ? 'text-sd-black' : 'group-hover:text-sd-gold'}`}>
                 {label}
              </span>
              
              {isSelected && (
                 <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-sd-gold rounded-full" />
              )}
              
              {!isAvailable && (
                 <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-full h-[1px] bg-sd-black -rotate-12" />
                 </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSelector;
