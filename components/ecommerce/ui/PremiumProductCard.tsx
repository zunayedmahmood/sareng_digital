'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { getApplicablePromotion } = usePromotion();

  // New arrival check (within 14 days)
  const isNew = useMemo(() => {
    const createdAt = (product as any).created_at;
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  }, [product]);

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

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product, e);
    else if (onOpen) onOpen(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: animDelay / 1000, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen?.(product)}
      className="group relative bg-sd-onyx border border-white/5 rounded-2xl overflow-hidden hover:border-sd-gold/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 cursor-pointer flex flex-col h-full"
    >
      {/* Upper Glow Effect on Hover */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sd-gold/40 to-transparent transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#0A0A0A]">
        <SdImage 
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-1000 ease-out ${isHovered ? 'scale-110 opacity-70' : 'scale-100 opacity-100'}`}
          context="card"
        />

        {/* Badges - Floating Style */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {isNew && (
            <span className="bg-sd-gold/10 backdrop-blur-md text-sd-gold text-[9px] font-bold px-2 py-1 rounded-sm border border-sd-gold/20 tracking-[0.2em] uppercase">New</span>
          )}
          {salePromo && (
            <span className="bg-sd-danger/10 backdrop-blur-md text-sd-danger text-[9px] font-bold px-2 py-1 rounded-sm border border-sd-danger/20 tracking-[0.2em] uppercase">Sale</span>
          )}
        </div>

        {/* Heart Icon - Refined Glassmorphism */}
        <button 
          onClick={handleWishlist}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-sd-black/20 backdrop-blur-md border border-white/5 flex items-center justify-center text-sd-ivory hover:text-sd-gold hover:border-sd-gold/30 transition-all transform active:scale-125"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-sd-gold text-sd-gold' : 'text-sd-ivory/60'}`} />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-sd-black/80 flex flex-col items-center justify-center z-20">
            <span className="text-sd-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-1">Unavailable</span>
            <div className="w-12 h-[1px] bg-sd-gold/30" />
          </div>
        )}

        {/* Quick Add Overlay (Desktop) */}
        {!isSoldOut && (
          <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-center justify-center">
            <button 
              onClick={handleQuickAdd}
              className="pointer-auto bg-sd-ivory text-sd-black px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 hover:bg-sd-gold transition-colors shadow-2xl active:scale-95 pointer-events-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex flex-col gap-1.5">
          {product.category && (
            <span className="text-sd-gold/50 text-[9px] uppercase tracking-[0.3em] font-bold">
              {typeof product.category === 'object' ? product.category.name : ''}
            </span>
          )}
          <h3 className={`text-sd-ivory text-base leading-snug line-clamp-2 min-h-[3rem] transition-all duration-500 ${isHovered ? 'font-display italic text-sd-gold tracking-wide' : 'font-semibold tracking-normal'}`}>
            {product.display_name || product.name}
          </h3>
        </div>

        <div className="mt-auto flex items-end justify-between">
           <div className="flex flex-col">
              {salePromo ? (
                <div className="flex flex-col">
                  <Price amount={originalPrice} className="text-sd-text-muted text-[10px] line-through mb-0.5" />
                  <Price amount={discountedPrice!} className="text-sd-gold font-bold text-lg leading-none" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Price amount={minPrice} className="text-sd-gold font-bold text-lg leading-none" />
                  {hasPriceRange && (
                    <span className="text-sd-gold font-bold text-lg leading-none">
                      – <Price amount={maxPrice} showSymbol={false} />
                    </span>
                  )}
                </div>
              )}
           </div>
           
           {/* Mobile Quick Add Icon */}
           {!isSoldOut && (
             <button 
               onClick={handleQuickAdd}
               className="lg:hidden w-10 h-10 rounded-xl bg-sd-graphite border border-white/5 flex items-center justify-center text-sd-gold active:scale-90 transition-transform shadow-lg"
             >
               <ShoppingBag className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>
    </motion.article>
  );
};

export default PremiumProductCard;
