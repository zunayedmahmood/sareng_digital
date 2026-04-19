'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Variant {
  id: number;
  color?: string;
  size?: string;
  in_stock: boolean;
  option_label?: string;
}

interface VariantPickerProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant) => void;
}

const VariantPicker: React.FC<VariantPickerProps> = ({ 
  variants, 
  selectedVariant, 
  onVariantChange 
}) => {
  if (variants.length <= 1) return null;

  // Group by color if applicable, otherwise just show label list
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));

  return (
    <div className="space-y-8">
      {/* Colors Section */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sd-gold text-[10px] font-bold tracking-[0.3em] uppercase">Select Color</h4>
            {selectedVariant?.color && (
              <span className="text-sd-ivory text-xs font-medium">{selectedVariant.color}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
             {colors.map((color) => {
               const isActive = selectedVariant?.color === color;
               return (
                 <button
                   key={color}
                   onClick={() => {
                     const match = variants.find(v => v.color === color);
                     if (match) onVariantChange(match);
                   }}
                   className={`relative h-10 px-4 rounded-full border text-xs font-bold transition-all ${
                     isActive 
                     ? 'border-sd-gold bg-sd-gold-dim text-sd-gold' 
                     : 'border-sd-border-default text-sd-text-secondary hover:border-sd-border-hover'
                   }`}
                 >
                   {color}
                   {isActive && (
                     <motion.div 
                        layoutId="color-active"
                        className="absolute inset-0 border-2 border-sd-gold rounded-full"
                     />
                   )}
                 </button>
               );
             })}
          </div>
        </div>
      )}

      {/* Sizes Section */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sd-gold text-[10px] font-bold tracking-[0.3em] uppercase">Select Size</h4>
            {selectedVariant?.size && (
              <span className="text-sd-ivory text-xs font-medium">{selectedVariant.size}</span>
            )}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
             {sizes.map((size) => {
               const variant = variants.find(v => v.size === size && (selectedVariant?.color ? v.color === selectedVariant.color : true));
               const isAvailable = variant?.in_stock;
               const isActive = selectedVariant?.size === size;

               return (
                 <button
                   key={size}
                   disabled={!isAvailable}
                   onClick={() => variant && onVariantChange(variant)}
                   className={`h-12 flex items-center justify-center rounded-lg border text-xs font-bold transition-all relative ${
                     isActive 
                     ? 'border-sd-gold bg-sd-gold-dim text-sd-gold' 
                     : isAvailable 
                        ? 'border-sd-border-default text-sd-text-secondary hover:border-sd-border-hover'
                        : 'border-sd-border-light text-sd-text-muted opacity-40 cursor-not-allowed'
                   }`}
                 >
                   {size}
                   {!isAvailable && (
                     <div className="absolute inset-0 bg-sd-black/10 origin-center rotate-45 h-px w-full" />
                   )}
                 </button>
               );
             })}
          </div>
        </div>
      )}

      {/* Fallback for simple labels */}
      {colors.length === 0 && sizes.length === 0 && variants.length > 1 && (
        <div className="space-y-4">
           <h4 className="text-sd-gold text-[10px] font-bold tracking-[0.3em] uppercase">Options</h4>
           <div className="flex flex-col gap-2">
             {variants.map((v) => (
               <button
                 key={v.id}
                 onClick={() => onVariantChange(v)}
                 className={`p-4 rounded-xl border text-sm font-bold text-left transition-all ${
                   selectedVariant?.id === v.id 
                   ? 'border-sd-gold bg-sd-gold-dim text-sd-gold' 
                   : 'border-sd-border-default text-sd-text-secondary hover:border-sd-border-hover'
                 }`}
               >
                 {v.option_label || `Option ${v.id}`}
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default VariantPicker;
