'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import cartService from '@/services/cartService';
import { useCart } from '../../../app/CartContext';
import { usePromotion } from '@/contexts/PromotionContext';
import NeoCard from '../ui/NeoCard';
import NeoBadge from '../ui/NeoBadge';
import NeoButton from '../ui/NeoButton';
import Price from '../Price';

interface CartItemProps {
  item: {
    id: number;
    productId: number;
    categoryId?: number;
    name: string;
    image?: string;
    price: string | number;
    quantity: number;
    maxQuantity?: number;
    sku?: string;
    color?: string;
    size?: string;
  };
  onQuantityChange?: (itemId: number, newQuantity: number) => Promise<void>;
  onRemove?: (itemId: number) => Promise<void>;
  isUpdating?: boolean;
}

export default function CartItem({ item, onQuantityChange, onRemove, isUpdating: externalIsUpdating }: CartItemProps) {
  const { refreshCart } = useCart();
  const router = useRouter();
  const { getApplicablePromotion } = usePromotion();
  const [internalIsUpdating, setInternalIsUpdating] = useState(false);

  const isUpdating = externalIsUpdating !== undefined ? externalIsUpdating : internalIsUpdating;

  const originalPrice = typeof item?.price === 'string'
    ? parseFloat(item.price)
    : typeof item?.price === 'number'
      ? item.price
      : 0;

  const promo = getApplicablePromotion(item.productId, item.categoryId ?? null);
  const discountPercent = promo?.discount_value ?? 0;
  const activePrice = discountPercent > 0 ? Math.max(0, originalPrice - (originalPrice * discountPercent / 100)) : originalPrice;

  const handleQuantityChange = async (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    if (onQuantityChange) {
      await onQuantityChange(item.id, newQuantity);
      return;
    }

    try {
      setInternalIsUpdating(true);
      await cartService.updateQuantity(item.id, { quantity: newQuantity });
      await refreshCart();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      await refreshCart();
    } finally {
      setInternalIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (onRemove) {
      await onRemove(item.id);
      return;
    }

    try {
      setInternalIsUpdating(true);
      await cartService.removeFromCart(item.id);
      await refreshCart();
    } catch (error: any) {
      console.error('Error removing item:', error);
      await refreshCart();
    } finally {
      setInternalIsUpdating(false);
    }
  };

  const handleNavigateToProduct = () => {
    router.push(`/e-commerce/product/${item.productId}`);
  };

  if (!item) return null;

  return (
    <NeoCard 
      variant="white" 
      hasHover={false} 
      className={`relative p-4 border-2 transition-all duration-100 ${isUpdating ? 'opacity-50' : ''}`}
    >
      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-sd-ivory/40 backdrop-blur-[1px]">
          <Loader2 className="animate-spin text-sd-gold" size={32} />
        </div>
      )}

      <div className="flex gap-4">
        {/* Artifact Visual */}
        <div 
          className="relative w-24 h-24 flex-shrink-0 cursor-pointer overflow-hidden border-2 border-black bg-sd-ivory group"
          onClick={handleNavigateToProduct}
        >
          <img
            src={item.image || '/placeholder-product.png'}
            alt={item.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
          />
          <div className="absolute bottom-0 right-0 bg-black text-sd-gold px-1.5 py-0.5 font-neo font-black text-[8px] uppercase">
            REG: {item.id}
          </div>
        </div>

        {/* Artifact Intel */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h3 
                className="font-neo font-black text-sm uppercase tracking-tighter text-black line-clamp-2 cursor-pointer hover:text-sd-gold transition-colors"
                onClick={handleNavigateToProduct}
              >
                {item.name}
              </h3>
              
              {/* Variant Badge Protocol */}
              <div className="flex flex-wrap gap-2 mt-2">
                {(item.color || item.size) && (
                  <NeoBadge variant="black" className="text-[8px] px-1.5 py-0.5 shadow-none">
                    {item.color && <span>{item.color}</span>}
                    {item.color && item.size && <span className="mx-1 opacity-20">/</span>}
                    {item.size && <span>{item.size}</span>}
                  </NeoBadge>
                )}
                {item.sku && (
                  <span className="font-neo text-[8px] text-black/40 uppercase tracking-widest self-center">
                    SKU: {item.sku}
                  </span>
                )}
              </div>

              {/* Warnings/Alerts */}
              {typeof item.maxQuantity === 'number' && item.quantity > item.maxQuantity ? (
                <div className="mt-2 flex items-center gap-1.5 text-sd-gold">
                  <ShieldAlert size={12} strokeWidth={3} />
                  <span className="font-neo font-black text-[9px] uppercase tracking-widest">Registry Cap Exceeded ({item.maxQuantity})</span>
                </div>
              ) : typeof item.maxQuantity === 'number' && item.maxQuantity > 0 && item.maxQuantity < 5 ? (
                <div className="mt-2 flex items-center gap-1.5 text-black">
                   <div className="w-1.5 h-1.5 rounded-full bg-sd-gold animate-pulse" />
                   <span className="font-neo font-black text-[9px] uppercase tracking-widest">Low Archive Level: {item.maxQuantity} remaining</span>
                </div>
              ) : null}
            </div>

            <NeoButton 
              variant="outline" 
              size="sm" 
              className="w-8 h-8 p-0 border-2 hover:bg-black hover:text-sd-gold transition-all"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              <Trash2 size={14} />
            </NeoButton>
          </div>

          <div className="flex items-end justify-between mt-4">
             {/* Mechanical Controls */}
             <div className="flex items-center border-2 border-black bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center text-black hover:bg-sd-gold disabled:opacity-20 transition-colors"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <div className="w-10 text-center font-neo font-black text-sm text-black border-x-2 border-black py-1">
                  {item.quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={isUpdating || (typeof item.maxQuantity === 'number' && item.quantity >= item.maxQuantity)}
                  className="w-8 h-8 flex items-center justify-center text-black hover:bg-sd-gold disabled:opacity-20 transition-colors"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
             </div>

             {/* Dynamic Value */}
             <div className="text-right flex flex-col items-end">
                <Price 
                  amount={activePrice * item.quantity} 
                  className="font-neo font-black text-lg text-black leading-none" 
                />
                {discountPercent > 0 && (
                  <Price 
                    amount={originalPrice * item.quantity} 
                    className="font-neo font-bold text-xs text-black/30 line-through mt-1" 
                  />
                )}
             </div>
          </div>
        </div>
      </div>
    </NeoCard>
  );
}