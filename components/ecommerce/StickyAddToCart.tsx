'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import NeoButton from './ui/NeoButton';

interface StickyAddToCartProps {
  isVisible: boolean;
  productName: string;
  priceText: string;
  isAdding: boolean;
  disabled: boolean;
  onAddToCart: () => void;
}

const StickyAddToCart: React.FC<StickyAddToCartProps> = ({
  isVisible,
  productName,
  priceText,
  isAdding,
  disabled,
  onAddToCart,
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[60] bg-white border-t-4 border-black p-4 transition-all duration-500 pb-[calc(1rem+env(safe-area-inset-bottom))] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        } sm:hidden lg:flex lg:justify-center`}
    >
      <div className="container mx-auto flex items-center justify-between gap-6 max-w-4xl">
        <div className="flex-1 min-w-0">
          <h4 className="font-neo font-black text-sm uppercase tracking-tighter text-black line-clamp-1 leading-tight">
            {productName}
          </h4>
          <p className="font-neo font-black text-lg text-sd-gold">
            {priceText}
          </p>
        </div>
        <NeoButton
          variant="primary"
          onClick={onAddToCart}
          disabled={disabled || isAdding}
          className="h-14 px-8 min-w-[160px]"
        >
          {isAdding ? (
            <span className="font-neo font-black text-[10px] uppercase">Processing...</span>
          ) : (
            <span className="flex items-center gap-3 font-neo font-black text-[10px] uppercase">
              <ShoppingBag size={16} /> Acquire Artifact
            </span>
          )}
        </NeoButton>
      </div>
    </div>
  );
};

export default StickyAddToCart;
