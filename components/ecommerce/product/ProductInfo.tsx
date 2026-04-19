'use client';

import React from 'react';
import { ShoppingBag, Heart, Share2, Plus, Minus, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Price from '../Price';

interface ProductInfoProps {
  product: any;
  selectedVariant: any;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  isAdding: boolean;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAdding,
  isInWishlist,
  onToggleWishlist
}) => {
  const price = selectedVariant?.selling_price || product.selling_price;
  const originalPrice = selectedVariant?.cost_price || product.cost_price;
  const hasDiscount = originalPrice > price;
  const inStock = selectedVariant?.in_stock ?? product.in_stock;

  return (
    <div className="space-y-12">
      {/* Title & Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <div className="h-[1px] w-8 bg-sd-gold/40" />
           <span className="text-sd-gold text-[10px] font-bold tracking-[0.4em] uppercase">
             {typeof product.category === 'string' ? product.category : product.category?.name}
           </span>
        </div>
        <h1 className="text-4xl lg:text-5xl 2xl:text-6xl font-bold text-sd-ivory leading-[1.1] tracking-tight">
          {product.name.split(' ').map((word: string, i: number) => (
            <span key={i} className={i % 4 === 1 ? 'font-display italic font-normal text-sd-gold' : ''}>
              {word}{' '}
            </span>
          ))}
        </h1>
        <div className="flex items-center gap-6 pt-2">
          {product.sku && (
            <span className="text-[9px] font-bold text-sd-text-muted tracking-[0.2em] uppercase">
              Ref: {selectedVariant?.sku || product.sku}
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-sd-gold' : 'bg-sd-danger'}`} />
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-sd-ivory/60">
              {inStock ? 'In Stock — Ready to ship' : 'Limited availability'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Offer */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-4">
          <div className="text-4xl lg:text-5xl font-bold text-sd-ivory tracking-tighter">
            <Price amount={price} showCurrency />
          </div>
          {hasDiscount && (
            <div className="text-xl text-sd-text-muted line-through mb-1 opacity-40">
              <Price amount={originalPrice} showCurrency />
            </div>
          )}
        </div>
        {hasDiscount && (
          <span className="text-[10px] font-bold text-sd-gold tracking-widest uppercase">
            Exclusive Selection — Save {Math.round((1 - price / originalPrice) * 100)}%
          </span>
        )}
      </div>

      <p className="text-sd-text-secondary text-lg leading-relaxed max-w-xl font-light">
        {product.short_description || product.description?.substring(0, 160) + '...'}
      </p>

      {/* Purchase Actions */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Quantity Selector - Boutique Style */}
          <div className="flex items-center justify-between border border-white/5 rounded-full p-1.5 bg-sd-onyx/50 backdrop-blur-md w-full sm:w-36">
            <button 
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sd-ivory hover:bg-white/5 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-sd-ivory font-mono">{quantity}</span>
            <button 
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sd-ivory hover:bg-white/5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Add to Cart Button - Immersive */}
          <div className="flex-1">
             <button
               disabled={!inStock || isAdding}
               onClick={onAddToCart}
               className={`group relative overflow-hidden w-full py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-2xl ${
                 inStock 
                 ? 'bg-sd-gold text-sd-black' 
                 : 'bg-sd-onyx text-sd-text-muted cursor-not-allowed border border-white/5'
               }`}
             >
               <div className="absolute inset-0 bg-sd-ivory translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
               <div className="relative z-10 flex items-center gap-3">
                 {isAdding ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>
                     <ShoppingBag className="w-4 h-4" />
                     {inStock ? 'Add to Shopping Bag' : 'Join Waiting List'}
                   </>
                 )}
               </div>
             </button>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-4">
           <button 
             onClick={onToggleWishlist}
             className={`flex-1 py-4 px-6 rounded-full border flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ${
               isInWishlist 
               ? 'bg-sd-gold/5 border-sd-gold/30 text-sd-gold shadow-[0_0_20px_rgba(201,168,76,0.1)]' 
               : 'border-white/5 text-sd-text-muted hover:text-sd-ivory hover:border-white/20'
             }`}
           >
             <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist ? 'fill-sd-gold' : ''}`} />
             {isInWishlist ? 'In Boutique Bag' : 'Save to Favorites'}
           </button>
           <button className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-sd-text-muted hover:text-sd-gold hover:border-sd-gold/30 transition-all duration-500">
             <Share2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Premium Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
         <div className="flex flex-col gap-3">
            <Truck className="w-5 h-5 text-sd-gold/60" />
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-sd-ivory">Complimentary Delivery</h4>
            <p className="text-[10px] text-sd-text-muted leading-relaxed">Enjoy free express shipping on all orders nationwide.</p>
         </div>
         <div className="flex flex-col gap-3">
            <RefreshCw className="w-5 h-5 text-sd-gold/60" />
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-sd-ivory">Returns & Exchanges</h4>
            <p className="text-[10px] text-sd-text-muted leading-relaxed">Effortless 7-day returns in original packaging.</p>
         </div>
         <div className="flex flex-col gap-3">
            <ShieldCheck className="w-5 h-5 text-sd-gold/60" />
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-sd-ivory">Authenticity Guaranteed</h4>
            <p className="text-[10px] text-sd-text-muted leading-relaxed">Shop with confidence with our official warranty.</p>
         </div>
      </div>
    </div>
  );
};

// Simple loader helper
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default ProductInfo;
