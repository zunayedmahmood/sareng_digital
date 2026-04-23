'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
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

  const primaryImage = product.images?.[0]?.url || '';
  const secondaryImage = product.images?.[1]?.url || '';

  const stock = Number(product.stock_quantity || 0);
  const isSoldOut = stock <= 0;

  const categoryId = typeof product.category === 'object' && product.category ? (product.category as { id?: number }).id ?? null : null;
  const salePromo = getApplicablePromotion(product.id, categoryId);
  const salePercent = salePromo?.discount_value ?? 0;
  const originalPrice = Number(product.selling_price ?? 0);
  const discountedPrice = salePromo ? Math.max(0, originalPrice - (originalPrice * salePercent) / 100) : null;

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

  const categoryName = typeof product.category === 'object' && product.category 
    ? (product.category as { name?: string }).name 
    : 'Unfiltered';

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: animDelay / 1000, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen?.(product)}
      className="group relative h-full flex flex-col cursor-pointer"
    >
      <motion.div 
        whileHover={{ y: -8 }}
        className="flex flex-col h-full bg-sd-white rounded-[32px] p-2 border border-sd-border-default/10 transition-all duration-500 hover:shadow-sd-lift"
      >
        {/* ── Image Capsule (Recessed Well) ── */}
        <div className="sd-depth-recess rounded-[26px] aspect-square overflow-hidden relative group-hover:bg-sd-white transition-colors duration-700">
          <div className="absolute inset-0 border-[6px] border-sd-white/40 rounded-[26px] z-10 pointer-events-none" />
          
          <SdImage 
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-1000 ease-in-out ${isHovered ? 'scale-110 saturate-[1.1]' : 'scale-100'}`}
            context="card"
          />

          {/* Catalog Tags */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            {salePromo ? (
              <span className="bg-sd-black text-sd-white px-2.5 py-1 text-[8px] font-mono font-bold tracking-tighter uppercase rounded">-{salePercent}%</span>
            ) : (
              <span className="bg-sd-white/90 backdrop-blur-md text-sd-black border border-sd-black/5 px-2.5 py-1 text-[8px] font-mono font-bold tracking-tighter uppercase rounded shadow-sm">New Arch</span>
            )}
          </div>

          {/* Quick Add Shutter */}
          {!isSoldOut && (
            <div className="absolute inset-x-4 bottom-4 z-30 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
              <button 
                onClick={handleQuickAdd}
                className="w-full bg-sd-black/90 backdrop-blur-md text-sd-white h-12 rounded-2xl font-mono text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-sd-gold hover:text-sd-black transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2px]" />
                Acquire
              </button>
            </div>
          )}

          {/* Sold Out Blur */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-sd-ivory/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 p-6 text-center">
              <span className="text-sd-black font-mono text-[10px] font-bold uppercase tracking-[0.4em] mb-2 opacity-60">Out of Stock</span>
              <div className="h-[1px] w-12 bg-sd-black/20" />
            </div>
          )}
        </div>

        {/* ── Content Area ── */}
        <div className="px-5 py-6 flex flex-col flex-1 relative">
          {/* Subtle Vertical Link Line */}
          <div className="absolute top-0 right-8 h-8 w-[1px] bg-sd-gold/20" />

          <div className="flex flex-col gap-1 mb-4">
            <span className="text-sd-gold font-mono text-[9px] font-bold uppercase tracking-[0.3em]">
              {categoryName}
            </span>
            <h3 className="text-sd-black text-[22px] font-display font-light leading-[1.1] transition-all group-hover:italic">
              {product.display_name || product.name}
            </h3>
          </div>

          <div className="mt-auto pt-4 border-t border-sd-border-default/5 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              {salePromo ? (
                <>
                  <Price amount={discountedPrice!} className="text-sd-black font-sans text-lg font-bold" />
                  <Price amount={originalPrice} className="text-sd-text-muted font-mono text-[10px] line-through decoration-sd-gold/40" />
                </>
              ) : (
                <>
                  <Price amount={minPrice} className="text-sd-black font-sans text-lg font-bold" />
                  {hasPriceRange && <span className="text-sd-black font-sans text-lg font-bold opacity-30">+</span>}
                </>
              )}
            </div>
            
            <div className="w-8 h-8 rounded-full border border-sd-border-default/10 flex items-center justify-center bg-sd-ivory-dark/30 transition-all group-hover:bg-sd-gold group-hover:border-sd-gold">
               <ArrowRight className="w-4 h-4 stroke-[1.5px] text-sd-black group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
};

export default PremiumProductCard;
