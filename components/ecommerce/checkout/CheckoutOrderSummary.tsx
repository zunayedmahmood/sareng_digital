'use client';

import React from 'react';
import SdImage from '../SdImage';
import Price from '../Price';
import { Tag, Loader2, X } from 'lucide-react';

interface CheckoutItem {
  id: number;
  name: string;
  quantity: number;
  total: number;
  price: number;
  product_image?: string;
  variant_options?: any;
}

interface CheckoutOrderSummaryProps {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode: string;
  onCouponChange: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon?: () => void;
  isApplyingCoupon: boolean;
  couponError?: string | null;
  couponSuccess?: string | null;
}

const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  discount,
  total,
  couponCode,
  onCouponChange,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon,
  couponError,
  couponSuccess,
}) => {
  return (
    <div className="bg-sd-onyx rounded-2xl border border-sd-border-default overflow-hidden sticky top-32">
       <div className="p-8 border-b border-sd-border-default">
          <h3 className="text-sd-ivory text-lg font-bold mb-6">Order Summary</h3>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sd-border-default">
             {items.map((item) => (
               <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-sd-black border border-sd-border-light flex-shrink-0">
                    <SdImage 
                      src={item.product_image || ''} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-sd-gold text-sd-black text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[1.25rem] text-center shadow-md">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sd-ivory text-sm font-bold truncate mb-1">{item.name}</h4>
                    {item.variant_options && (
                      <p className="text-[10px] text-sd-text-muted uppercase tracking-widest truncate">
                        {Object.values(item.variant_options).filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <div className="mt-2 text-sd-gold text-xs font-bold">
                       <Price amount={item.total} showCurrency />
                    </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {/* Coupon Section */}
       <div className="p-8 border-b border-sd-border-default space-y-4">
          <div className="flex gap-2">
             <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sd-text-muted" />
                <input 
                  type="text" 
                  placeholder="Promo Code"
                  value={couponCode}
                  onChange={(e) => onCouponChange(e.target.value)}
                  className="w-full bg-sd-black border border-sd-border-default rounded-xl py-3 pl-10 pr-4 text-xs text-sd-ivory focus:outline-none focus:border-sd-gold transition-colors"
                />
             </div>
             <button 
               onClick={onApplyCoupon}
               disabled={isApplyingCoupon || !couponCode.trim()}
               className="bg-sd-gold hover:bg-sd-gold-soft text-sd-black px-6 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-colors disabled:opacity-50"
             >
               {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Apply'}
             </button>
          </div>
          {couponError && <p className="text-red-400 text-[10px] font-medium">{couponError}</p>}
          {couponSuccess && (
            <div className="flex items-center justify-between bg-sd-gold/10 border border-sd-gold/20 p-3 rounded-lg">
               <p className="text-sd-gold text-[10px] font-bold">{couponSuccess}</p>
               {onRemoveCoupon && (
                 <button onClick={onRemoveCoupon} className="text-sd-gold hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                 </button>
               )}
            </div>
          )}
       </div>

       {/* Totals Section */}
       <div className="p-8 space-y-4">
          <div className="flex justify-between items-center text-sd-text-secondary text-sm">
             <span>Subtotal</span>
             <span className="font-bold text-sd-ivory"><Price amount={subtotal} showCurrency /></span>
          </div>
          <div className="flex justify-between items-center text-sd-text-secondary text-sm">
             <span>Shipping</span>
             <span className="font-bold text-sd-ivory">
               {shipping === 0 ? <span className="text-sd-gold uppercase text-[10px]">Free</span> : <Price amount={shipping} showCurrency />}
             </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-sd-gold text-sm">
               <span>Discount</span>
               <span className="font-bold">- <Price amount={discount} showCurrency /></span>
            </div>
          )}
          <div className="pt-4 border-t border-sd-border-default flex justify-between items-center">
             <span className="text-sd-ivory font-bold uppercase tracking-widest text-sm">Total</span>
             <div className="text-right">
                <span className="block text-2xl font-bold text-sd-gold"><Price amount={total} showCurrency /></span>
                <span className="text-[10px] text-sd-text-muted uppercase tracking-widest">Incl. VAT & Taxes</span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default CheckoutOrderSummary;
