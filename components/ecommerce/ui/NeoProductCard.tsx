'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { SimpleProduct } from '@/services/catalogService';
import { usePromotion } from '@/contexts/PromotionContext';
import NeoCard from './NeoCard';
import NeoBadge from './NeoBadge';
import NeoButton from './NeoButton';
import Price from '../Price';

interface NeoProductCardProps {
  product: SimpleProduct;
  onOpen?: (product: SimpleProduct) => void;
  onAddToCart?: (product: SimpleProduct, e: React.MouseEvent) => void | Promise<void>;
  animDelay?: number;
}

const NeoProductCard: React.FC<NeoProductCardProps> = memo(({
  product,
  onOpen,
  onAddToCart,
  animDelay = 0,
}) => {
  const { getApplicablePromotion } = usePromotion();
  
  const primaryImage = product.images?.[0]?.url || '';
  const stock = Number(product.stock_quantity || 0);
  const isSoldOut = stock <= 0;

  const categoryId = typeof product.category === 'object' && product.category ? (product.category as { id?: number }).id ?? null : null;
  const salePromo = getApplicablePromotion(product.id, categoryId);
  const salePercent = salePromo?.discount_value ?? 0;
  const originalPrice = Number(product.selling_price ?? 0);
  const discountedPrice = salePromo ? Math.max(0, originalPrice - (originalPrice * salePercent) / 100) : null;

  const categoryName = typeof product.category === 'object' && product.category 
    ? (product.category as { name?: string }).name 
    : 'Unfiltered';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: animDelay / 1000 }}
      onClick={() => onOpen?.(product)}
      className="group cursor-pointer h-full"
    >
      <NeoCard variant="white" className="flex flex-col h-full overflow-hidden neo-lift">
        {/* Image Well */}
        <div className="relative aspect-square neo-border-b-4 border-black overflow-hidden bg-sd-ivory">
           {primaryImage && (
             <div className="relative w-full h-full">
               <Image 
                src={primaryImage} 
                alt={product.name} 
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
               />
             </div>
           )}
           
           {/* Stickers */}
           <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start">
             {salePromo && (
               <NeoBadge variant="violet" isRotated className="text-[10px] sm:text-xs shadow-none">
                 -{salePercent}% OFF
               </NeoBadge>
             )}
             {isSoldOut ? (
               <NeoBadge variant="black" className="text-[10px] shadow-none">Registry Empty</NeoBadge>
             ) : (
               <NeoBadge variant="gold" className="text-[10px] shadow-none">In Registry</NeoBadge>
             )}
           </div>

           {/* Price Sticker */}
           <div className="absolute bottom-4 right-4 z-20">
             <NeoCard variant="black" hasHover={false} className="px-4 py-2 neo-shadow-sm border-2">
                <div className="flex flex-col items-end">
                   {discountedPrice ? (
                     <>
                        <Price amount={discountedPrice} className="text-sd-gold font-neo font-black text-lg" />
                        <Price amount={originalPrice} className="text-white/40 font-neo font-bold text-[10px] line-through" />
                     </>
                   ) : (
                     <Price amount={originalPrice} className="text-white font-neo font-black text-lg" />
                   )}
                </div>
             </NeoCard>
           </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-neo font-black text-[10px] uppercase tracking-widest text-sd-gold">
              {categoryName}
            </span>
            <h3 className="font-neo font-black text-xl uppercase tracking-tighter text-black leading-tight group-hover:text-sd-gold transition-colors">
              {product.display_name || product.name}
            </h3>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between gap-4">
             {!isSoldOut && (
               <NeoButton 
                 variant="primary" 
                 size="sm" 
                 className="flex-1 text-[10px]"
                 onClick={(e) => {
                   e.stopPropagation();
                   onAddToCart?.(product, e);
                 }}
               >
                 <ShoppingBag size={14} /> Acquire
               </NeoButton>
             )}
             <div className="w-10 h-10 neo-border-2 flex items-center justify-center bg-white group-hover:bg-black group-hover:text-white transition-all">
                <ArrowUpRight size={18} />
             </div>
          </div>
        </div>
      </NeoCard>
    </motion.div>
  );
});

NeoProductCard.displayName = 'NeoProductCard';

export default NeoProductCard;

