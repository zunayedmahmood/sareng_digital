'use client';

import React, { useState, useMemo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { SimpleProduct } from '@/services/catalogService';
import { usePromotion } from '@/contexts/PromotionContext';
import { getVariantListForCard } from '@/lib/ecommerceCardUtils';
import SdImage from '../SdImage';
import Price from '../Price';

interface PremiumProductCardProps {
  product: SimpleProduct;
  onOpen?: (product: SimpleProduct) => void;
  onAddToCart?: (product: SimpleProduct, e: React.MouseEvent) => void | Promise<void>;
  animDelay?: number;
}

const PremiumProductCard: React.FC<PremiumProductCardProps> = ({
  product,
  onOpen,
  onAddToCart,
  animDelay = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { getApplicablePromotion } = usePromotion();

  // Imagery
  const primaryImage = product.images?.[0]?.url || '';
  const secondaryImage = product.images?.[1]?.url || '';

  const stock = Number(product.stock_quantity || 0);
  const isSoldOut = stock <= 0;

  // Promotion handling
  const categoryId = typeof product.category === 'object' && product.category ? (product.category as { id?: number }).id ?? null : null;
  const salePromo = getApplicablePromotion(product.id, categoryId);
  const salePercent = salePromo?.discount_value ?? 0;
  const originalPrice = Number(product.selling_price ?? 0);
  const discountedPrice = salePromo ? Math.max(0, originalPrice - (originalPrice * salePercent) / 100) : null;

  // Price Range
  const variants = useMemo(() => getVariantListForCard(product), [product]);
  const prices = variants.map(v => Number(v.selling_price || 0)).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : originalPrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice;
  const hasPriceRange = minPrice !== maxPrice && !salePromo;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product, e);
    else if (onOpen) onOpen(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: animDelay / 1000, ease: [0.87, 0, 0.13, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen?.(product)}
      className="group relative bg-sd-white border border-sd-border-default rounded-none overflow-hidden transition-all duration-700 cursor-pointer flex flex-col h-full"
    >
      {/* 1. Image Plinth */}
      <div className="relative aspect-[1/1] overflow-hidden bg-sd-ivory-dark/10 border-b border-sd-border-default">
        <SdImage 
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-1000 ease-in-out ${isHovered ? 'scale-105 saturate-[1.2]' : 'scale-100 saturate-100'}`}
          context="card"
        />

        {/* Catalog Tag */}
        <div className="absolute top-4 left-0 z-10">
          <div className="bg-sd-black text-sd-white px-3 py-1 flex flex-col">
             <span className="font-mono text-[8px] uppercase tracking-[0.2em]">{salePromo ? `-${salePercent}%` : 'New Entry'}</span>
          </div>
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-sd-ivory/80 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
            <span className="text-sd-black font-mono text-[9px] uppercase tracking-[0.4em] mb-2">Out of Archive</span>
            <div className="w-8 h-[1px] bg-sd-black/30" />
          </div>
        )}

        {/* Quick Add Tray */}
        {!isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
            <button 
              onClick={handleQuickAdd}
              className="w-full bg-sd-black text-sd-white py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-sd-gold hover:text-sd-black transition-all"
            >
              <ShoppingBag className="w-3 h-3" />
              Acquire Item
            </button>
          </div>
        )}
      </div>

      {/* 2. Technical Label Area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-col gap-1 mb-4">
           <span className="text-sd-gold font-mono text-[8px] uppercase tracking-[0.3em]">
             {typeof product.category === 'object' ? product.category.name : 'Unfiltered'}
           </span>
           <h3 className="text-sd-black text-2xl font-display leading-[1.1] transition-colors group-hover:text-sd-gold">
             {product.display_name || product.name}
           </h3>
        </div>

        <div className="mt-auto pt-4 border-t border-sd-border-default/50 flex items-center justify-between">
           <div className="flex flex-col">
              {salePromo ? (
                <div className="flex items-center gap-3">
                  <Price amount={discountedPrice!} className="text-sd-black font-mono text-sm font-bold" />
                  <Price amount={originalPrice} className="text-sd-text-muted font-mono text-[10px] line-through" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Price amount={minPrice} className="text-sd-black font-mono text-sm font-bold" />
                  {hasPriceRange && (
                    <span className="text-sd-black font-mono text-sm font-bold">
                      +
                    </span>
                  )}
                </div>
              )}
           </div>
           
           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700">
             <span className="font-mono text-[8px] text-sd-text-muted uppercase tracking-widest leading-none flex items-center gap-2">
               Details <ArrowRight className="w-2 h-2" />
             </span>
           </div>
        </div>
      </div>
    </motion.article>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14m-7-7 7 7-7 7"/>
  </svg>
);

export default PremiumProductCard;
