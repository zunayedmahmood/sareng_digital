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
  const stockQty = selectedVariant?.available_inventory ?? product.available_inventory ?? product.stock_quantity;

  return (
    <div className="space-y-8">
      {/* Title & Category */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sd-gold">
           <span className="text-[10px] font-bold tracking-[0.4em] uppercase">
             {typeof product.category === 'string' ? product.category : product.category?.name}
           </span>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold text-sd-ivory leading-tight">
          {product.name}
        </h1>
        {product.sku && (
          <p className="text-[10px] font-bold text-sd-text-muted tracking-widest uppercase">
            SKU: {selectedVariant?.sku || product.sku}
          </p>
        )}
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-4">
        <div className="text-3xl lg:text-4xl font-bold text-sd-gold">
          <Price amount={price} showCurrency />
        </div>
        {hasDiscount && (
          <div className="text-lg text-sd-text-muted line-through opacity-50">
            <Price amount={originalPrice} showCurrency />
          </div>
        )}
      </div>

      <p className="text-sd-text-secondary text-base leading-relaxed">
        {product.short_description || product.description?.substring(0, 160) + '...'}
      </p>

      {/* Purchase Actions */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center border border-sd-border-default rounded-full p-1 bg-sd-onyx">
            <button 
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-sd-ivory hover:text-sd-gold transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-sd-ivory">{quantity}</span>
            <button 
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-sd-ivory hover:text-sd-gold transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
             <button
               disabled={!inStock || isAdding}
               onClick={onAddToCart}
               className={`w-full py-4 rounded-full font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg ${
                 inStock 
                 ? 'bg-sd-ivory text-sd-black hover:bg-sd-gold' 
                 : 'bg-sd-onyx text-sd-text-muted cursor-not-allowed opacity-50'
               }`}
             >
               {isAdding ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <>
                   <ShoppingBag className="w-4 h-4" />
                   {inStock ? 'Add to Shopping Bag' : 'Out of Stock'}
                 </>
               )}
             </button>
          </div>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={onToggleWishlist}
             className={`flex-1 py-3 px-6 rounded-full border border-sd-border-default flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase transition-all ${
               isInWishlist ? 'bg-sd-gold/10 border-sd-gold text-sd-gold' : 'text-sd-text-secondary hover:text-sd-ivory hover:border-sd-ivory'
             }`}
           >
             <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-sd-gold' : ''}`} />
             {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
           </button>
           <button className="py-3 px-6 rounded-full border border-sd-border-default text-sd-text-secondary hover:text-sd-ivory hover:border-sd-ivory transition-all">
             <Share2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-sd-border-default">
         <div className="flex items-center gap-3 text-sd-text-secondary">
           <div className="w-8 h-8 rounded-full bg-sd-gold/10 flex items-center justify-center text-sd-gold">
              <Truck className="w-4 h-4" />
           </div>
           <span className="text-[10px] font-bold tracking-widest uppercase">Fast Delivery across BD</span>
         </div>
         <div className="flex items-center gap-3 text-sd-text-secondary">
           <div className="w-8 h-8 rounded-full bg-sd-gold/10 flex items-center justify-center text-sd-gold">
              <RefreshCw className="w-4 h-4" />
           </div>
           <span className="text-[10px] font-bold tracking-widest uppercase">7 Days Easy Return</span>
         </div>
         <div className="flex items-center gap-3 text-sd-text-secondary">
           <div className="w-8 h-8 rounded-full bg-sd-gold/10 flex items-center justify-center text-sd-gold">
              <ShieldCheck className="w-4 h-4" />
           </div>
           <span className="text-[10px] font-bold tracking-widest uppercase">Official Warranty</span>
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
