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

  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));

  return (
    <div className="space-y-12 pt-4">
      {/* Colors Section */}
      {colors.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">The Palette</h4>
            {selectedVariant?.color && (
              <span className="text-sd-ivory/60 text-[10px] font-bold tracking-widest uppercase">{selectedVariant.color}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
             {colors.map((color: any) => {
               const isActive = selectedVariant?.color === color;
               return (
                 <button
                   key={color}
                   onClick={() => {
                     const match = variants.find(v => v.color === color);
                     if (match) onVariantChange(match);
                   }}
                   className={`relative h-12 px-6 rounded-full border text-[10px] font-bold tracking-widest uppercase transition-all duration-500 overflow-hidden ${
                     isActive 
                     ? 'border-sd-gold text-sd-black' 
                     : 'border-white/5 text-sd-text-muted hover:border-white/20 hover:text-sd-ivory'
                   }`}
                 >
                   {isActive && (
                     <motion.div 
                        layoutId="color-active"
                        className="absolute inset-0 bg-sd-gold"
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                     />
                   )}
                   <span className="relative z-10">{color}</span>
                 </button>
               );
             })}
          </div>
        </div>
      )}

      {/* Sizes Section */}
      {sizes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">The Dimensions</h4>
            {selectedVariant?.size && (
              <span className="text-sd-ivory/60 text-[10px] font-bold tracking-widest uppercase">{selectedVariant.size}</span>
            )}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
             {sizes.map((size: any) => {
               const variant = variants.find(v => v.size === size && (selectedVariant?.color ? v.color === selectedVariant.color : true));
               const isAvailable = variant?.in_stock;
               const isActive = selectedVariant?.size === size;

               return (
                 <button
                   key={size}
                   disabled={!isAvailable}
                   onClick={() => variant && onVariantChange(variant)}
                   className={`h-14 flex items-center justify-center rounded-2xl border text-[11px] font-bold tracking-widest transition-all duration-500 relative overflow-hidden ${
                     isActive 
                     ? 'border-sd-gold text-sd-black' 
                     : isAvailable 
                        ? 'border-white/5 text-sd-text-muted hover:border-sd-gold/30 hover:text-sd-ivory'
                        : 'border-white/5 text-sd-text-muted/20 cursor-not-allowed'
                   }`}
                 >
                   {isActive && (
                     <motion.div 
                        layoutId="size-active"
                        className="absolute inset-0 bg-sd-gold"
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                     />
                   )}
                   <span className="relative z-10">{size}</span>
                   {!isAvailable && (
                     <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                        <div className="w-full h-[1px] bg-sd-gold rotate-45" />
                     </div>
                   )}
                 </button>
               );
             })}
          </div>
        </div>
      )}

      {/* Fallback for simple labels */}
      {colors.length === 0 && sizes.length === 0 && variants.length > 1 && (
        <div className="space-y-6">
           <h4 className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">Selection Options</h4>
           <div className="flex flex-col gap-3">
             {variants.map((v) => (
               <button
                 key={v.id}
                 onClick={() => onVariantChange(v)}
                 className={`relative p-5 rounded-[1.5rem] border text-xs font-bold text-left tracking-widest transition-all duration-500 overflow-hidden uppercase ${
                   selectedVariant?.id === v.id 
                   ? 'border-sd-gold text-sd-black' 
                   : 'border-white/5 text-sd-text-muted hover:border-sd-gold/30 hover:text-sd-ivory'
                 }`}
               >
                 {selectedVariant?.id === v.id && (
                   <motion.div 
                      layoutId="option-active"
                      className="absolute inset-0 bg-sd-gold"
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                   />
                 )}
                 <span className="relative z-10">{v.option_label || `Option ${v.id}`}</span>
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default VariantPicker;
