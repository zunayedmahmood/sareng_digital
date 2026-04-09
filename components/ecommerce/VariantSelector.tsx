'use client';

import React from 'react';

import { ProductVariant } from '@/app/e-commerce/product/[id]/page';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
}) => {
  // Group by colors
  const allColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  const allSizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[];

  // If we have both color and size, show two sections. 
  // If we just have one generic label, show one section.
  
  const handleSizeClick = (size: string) => {
    // Find variant with current color and new size
    const match = variants.find(v => v.color === selectedVariant.color && v.size === size);
    if (match) onVariantChange(match);
  };

  const handleColorClick = (color: string) => {
    // Find variant with new color and current size (if possible)
    let match = variants.find(v => v.color === color && v.size === selectedVariant.size);
    if (!match) {
        // Just find first available in that color
        match = variants.find(v => v.color === color && v.in_stock) || variants.find(v => v.color === color);
    }
    if (match) onVariantChange(match);
  };

  return (
    <div className="space-y-8">
      {/* Colors */}
      {allColors.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-black"
             style={{ fontFamily: "'DM Mono', monospace" }}>
            Color: <span className="text-gray-400 font-medium ml-1">{selectedVariant.color}</span>
          </p>
          <div className="flex flex-wrap gap-4">
            {allColors.map((color) => {
              const isActive = selectedVariant.color === color;
              const hasInStock = variants.some(v => v.color === color && v.in_stock);
              
              return (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  className={`relative group w-11 h-11 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'ring-2 ring-offset-2 ring-[--gold]' 
                      : 'ring-1 ring-gray-200'
                  } ${!hasInStock ? 'opacity-40' : ''}`}
                  title={color}
                >
                  <span 
                    className="absolute inset-1 rounded-full border border-black/5" 
                    style={{ backgroundColor: color.toLowerCase() }} 
                  />
                  {!hasInStock && (
                    <div className="absolute inset-0 flex items-center justify-center rotate-45 pointer-events-none">
                        <div className="w-full h-[1px] bg-red-500/50" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {allSizes.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-black"
             style={{ fontFamily: "'DM Mono', monospace" }}>
            Size: <span className="text-gray-400 font-medium ml-1">{selectedVariant.size}</span>
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {allSizes.map((size) => {
              const variant = variants.find(v => v.color === selectedVariant.color && v.size === size);
              const isSelected = selectedVariant.size === size;
              const isAvailable = variant?.in_stock ?? false;

              return (
                <button
                  key={size}
                  onClick={() => isAvailable && handleSizeClick(size)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center relative overflow-hidden ${
                    isSelected
                      ? 'bg-black border-black text-white shadow-lg z-10'
                      : isAvailable
                        ? 'bg-white border-gray-100 text-gray-500 hover:border-black hover:text-black'
                        : 'bg-gray-50/50 border-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {size}
                  {!isAvailable && (
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-400 -rotate-45" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Simple List (If no explicit color/size grouping) */}
      {allColors.length === 0 && allSizes.length === 0 && (
        <div className="space-y-4">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-black"
             style={{ fontFamily: "'DM Mono', monospace" }}>
            Options
          </p>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((v) => {
                const isSelected = selectedVariant.id === v.id;
                const isAvailable = v.in_stock;
                return (
                    <button
                        key={v.id}
                        onClick={() => onVariantChange(v)}
                        className={`h-11 px-6 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center relative overflow-hidden ${
                            isSelected
                            ? 'bg-black border-black text-white shadow-lg'
                            : isAvailable
                                ? 'bg-white border-gray-100 text-gray-500 hover:border-black hover:text-black'
                                : 'bg-gray-50/50 border-gray-50 text-gray-300 cursor-not-allowed opacity-40'
                        }`}
                        style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                        {v.name}
                        {!isAvailable && (
                            <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-400 -rotate-45" />
                            </div>
                        )}
                    </button>
                )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
