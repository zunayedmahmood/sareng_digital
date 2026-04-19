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
      transition={{ duration: 0.5, delay: animDelay / 1000 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen?.(product)}
      className="group bg-sd-onyx border border-sd-border-light rounded-xl overflow-hidden hover:border-sd-border-default transition-all duration-300 hover:shadow-sd-card cursor-pointer flex flex-col h-full"
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-sd-graphite">
        <SdImage 
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
          context="card"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="bg-sd-gold text-sd-black text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">NEW</span>
          )}
          {salePromo && (
            <span className="bg-sd-danger text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">SALE</span>
          )}
        </div>

        {/* Wishlist Icon */}
        <button 
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-sd-black/20 backdrop-blur-sm border border-sd-white/10 flex items-center justify-center text-sd-ivory hover:text-sd-gold transition-colors transform active:scale-125"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-sd-gold text-sd-gold' : ''}`} />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-sd-black/60 flex items-center justify-center z-20">
            <span className="text-sd-ivory text-xs font-bold tracking-widest uppercase border border-sd-white/20 px-4 py-2 bg-sd-black/40 backdrop-blur-xs">Sold Out</span>
          </div>
        )}

        {/* Quick Add (Desktop) */}
        {!isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 hidden lg:block">
            <button 
              onClick={handleQuickAdd}
              className="w-full bg-sd-gold text-sd-black py-2.5 rounded-lg font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-sd-gold-soft active:scale-95 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              QUICK ADD
            </button>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex flex-col gap-1">
          {product.category && (
            <span className="text-sd-text-muted text-[10px] uppercase tracking-widest font-semibold">
              {typeof product.category === 'object' ? product.category.name : ''}
            </span>
          )}
          <h3 className="text-sd-ivory text-sm font-semibold line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-sd-gold transition-colors">
            {product.display_name || product.name}
          </h3>
        </div>

        <div className="mt-auto flex items-center justify-between">
           <div className="flex flex-col">
              {salePromo ? (
                <div className="flex items-center gap-2">
                  <Price amount={discountedPrice!} className="text-sd-gold font-bold text-base" />
                  <Price amount={originalPrice} className="text-sd-text-muted text-xs line-through" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Price amount={minPrice} className="text-sd-gold font-bold text-base" />
                  {hasPriceRange && (
                    <span className="text-sd-gold font-bold text-base">
                      – <Price amount={maxPrice} showSymbol={false} />
                    </span>
                  )}
                </div>
              )}
           </div>
           
           {/* Mobile Quick Add Icon */}
           <button 
             onClick={handleQuickAdd}
             className="lg:hidden w-8 h-8 rounded-full bg-sd-graphite border border-sd-border-default flex items-center justify-center text-sd-gold active:scale-90 transition-transform"
           >
             <ShoppingBag className="w-4 h-4" />
           </button>
        </div>

        {/* Variant hints */}
        {variants.length > 1 && (
          <span className="text-sd-text-muted text-[10px]">
            +{variants.length - 1} more variation{variants.length > 2 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.article>
  );
};

export default PremiumProductCard;
