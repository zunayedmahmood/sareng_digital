'use client';

import React from 'react';
import { ProductVariant } from '@/app/e-commerce/product/[id]/page';
import NeoBadge from './ui/NeoBadge';

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <span className="font-neo font-black text-[10px] uppercase tracking-widest text-sd-gold">Registry Variations</span>
        </div>
        <NeoBadge variant="gold" className="text-[10px] shadow-none">{variants.length} ENTRIES</NeoBadge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {variants.map((v) => {
          const isSelected = selectedVariant.id === v.id;
          const isAvailable = v.in_stock && (v.available_inventory ?? 0) > 0;
          const label = formatVariantLabelForCard(v);

          return (
            <button
              key={v.id}
              onClick={() => isAvailable && onVariantChange(v)}
              className={`
                group relative min-h-[60px] px-4 py-3 neo-border-2 transition-all flex flex-col items-center justify-center text-center
                ${isSelected 
                  ? 'bg-black text-white neo-shadow-sm -translate-y-1' 
                  : isAvailable 
                    ? 'bg-white text-black hover:bg-sd-gold hover:neo-shadow-sm hover:-translate-y-1'
                    : 'bg-black/5 text-black/20 neo-border-4 border-dashed border-black/10 cursor-not-allowed'}
              `}
            >
              <span className={`text-[11px] font-neo font-black uppercase tracking-widest leading-tight`}>
                 {label}
              </span>
              
              {!isAvailable && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                    <div className="w-full h-[2px] bg-black/10 -rotate-12" />
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
