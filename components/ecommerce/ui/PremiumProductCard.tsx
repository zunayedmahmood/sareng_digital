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
      className="group relative bg-sd-white border border-sd-border-default rounded-[30px] overflow-hidden transition-all duration-700 cursor-pointer flex flex-col h-full shadow-sd-card hover:shadow-sd-hover hover:-translate-y-2"
    >
      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-sd-ivory-dark/20">
        <SdImage 
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-1000 ease-out ${isHovered ? 'scale-110 opacity-90' : 'scale-100 opacity-100'}`}
          context="card"
        />

        {/* Badges - Refined Floating Style */}
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          {isNew && (
            <span className="bg-sd-black text-sd-white text-[8px] font-bold px-3 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-sm">New</span>
          )}
          {salePromo && (
            <span className="bg-sd-gold text-sd-black text-[8px] font-bold px-3 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-sm">-{salePercent}%</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-sd-white/90 backdrop-blur-md border border-sd-black/5 flex items-center justify-center text-sd-black hover:bg-sd-black hover:text-sd-white transition-all shadow-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-sd-gold text-sd-gold border-none' : 'text-sd-black'}`} />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-sd-ivory/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-20">
            <span className="text-sd-black text-[10px] font-bold tracking-[0.4em] uppercase mb-1">Archived</span>
            <div className="w-10 h-[1px] bg-sd-black/20" />
          </div>
        )}

        {/* Quick Add Overlay (Desktop) */}
        {!isSoldOut && (
          <div className="absolute inset-x-5 bottom-5 z-20 opacity-0 lg:group-hover:opacity-100 translate-y-4 lg:group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center">
            <button 
              onClick={handleQuickAdd}
              className="w-full bg-sd-black text-sd-white py-4 rounded-full font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-sd-gold hover:text-sd-black transition-all shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Quick Acquisition
            </button>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex flex-col gap-2">
          {product.category && (
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-sd-gold" />
               <span className="text-sd-black/40 text-[9px] uppercase tracking-[0.3em] font-bold">
                 {typeof product.category === 'object' ? product.category.name : ''}
               </span>
            </div>
          )}
          <h3 className={`text-sd-black text-lg leading-[1.3] line-clamp-2 min-h-[3.5rem] transition-all duration-500 ${isHovered ? 'text-sd-gold' : 'font-bold'}`}>
            {product.display_name || product.name}
          </h3>
        </div>

        <div className="mt-auto flex items-end justify-between">
           <div className="flex flex-col">
              {salePromo ? (
                <div className="flex flex-col">
                  <Price amount={originalPrice} className="text-sd-black/30 text-[10px] line-through mb-1" />
                  <Price amount={discountedPrice!} className="text-sd-black font-bold text-xl leading-none tracking-tight" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Price amount={minPrice} className="text-sd-black font-bold text-xl leading-none tracking-tight" />
                  {hasPriceRange && (
                    <span className="text-sd-black font-bold text-xl leading-none">
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
               className="lg:hidden w-12 h-12 rounded-2xl bg-sd-ivory border border-sd-black/5 flex items-center justify-center text-sd-black active:scale-90 transition-all shadow-sm"
             >
               <ShoppingBag className="w-5 h-5" />
             </button>
           )}
        </div>
      </div>
    </motion.article>
  );
};

export default PremiumProductCard;
