'use client';

import React from 'react';
import SdImage from '../SdImage';
import Price from '../Price';
import { Tag, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden sticky top-32 shadow-2xl">
        <div className="p-10">
          <div className="flex flex-col gap-1 mb-8">
              <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">Manifest</span>
              <h3 className="text-2xl font-display font-medium italic text-sd-ivory">The Selection</h3>
            </div>
            <div className="space-y-8 max-h-[440px] overflow-y-auto pr-4 scrollbar-none">
             {items.map((item) => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="relative w-24 h-28 rounded-2xl overflow-hidden bg-[#0D0D0D] border border-white/5 flex-shrink-0">
                    <SdImage 
                      src={item.product_image || ''} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-2 right-2 bg-sd-gold text-sd-black text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-2xl">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sd-ivory text-xs font-bold tracking-wider mb-1 line-clamp-1">{item.name}</h4>
                    {item.variant_options && (
                      <p className="text-[9px] text-sd-text-muted uppercase tracking-[0.2em] mb-2">
                        {Object.values(item.variant_options).filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <div className="text-sd-gold text-xs font-bold tracking-tighter">
                       <Price amount={item.total} showCurrency />
                    </div>
                  </div>
                </div>
             ))}
            </div>
        </div>

       {/* Coupon Section */}
       <div className="p-10 border-b border-white/5 space-y-6">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">Privilege Code</span>
          </div>
          <div className="flex gap-4">
             <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="CODE"
                  value={couponCode}
                  onChange={(e) => onCouponChange(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/5 rounded-full py-4 px-8 text-[10px] tracking-[0.3em] font-bold text-sd-ivory focus:outline-none focus:border-sd-gold/30 transition-all uppercase placeholder:text-sd-text-muted/30"
                />
             </div>
             <button 
               onClick={onApplyCoupon}
               disabled={isApplyingCoupon || !couponCode.trim()}
               className="bg-sd-gold hover:bg-sd-ivory text-sd-black px-8 rounded-full font-bold text-[10px] tracking-[0.2em] uppercase transition-all duration-500 disabled:opacity-20"
             >
               {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-sd-black" /> : 'Redeem'}
             </button>
          </div>
          {couponError && (
              <p className="text-sd-danger text-[9px] font-bold uppercase tracking-widest pl-4">{couponError}</p>
            )}
          {couponSuccess && (
              <div className="flex items-center justify-between bg-sd-gold/5 border border-sd-gold/20 p-4 rounded-2xl">
                 <p className="text-sd-gold text-[9px] font-bold tracking-[0.2em] uppercase">{couponSuccess}</p>
                 {onRemoveCoupon && (
                   <button onClick={onRemoveCoupon} className="text-sd-gold hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                   </button>
                 )}
              </div>
            )}
       </div>

       {/* Financial Summary */}
       <div className="p-10 space-y-5 bg-white/[0.01]">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.2em] uppercase text-sd-text-muted">
             <span>Market Subtotal</span>
             <span className="text-sd-ivory/80"><Price amount={subtotal} showCurrency /></span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.2em] uppercase text-sd-text-muted">
             <span>Logistics</span>
             <span className="text-sd-ivory/80">
               {shipping === 0 ? <span className="text-sd-gold">Complimentary</span> : <Price amount={shipping} showCurrency />}
             </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-sd-gold text-[10px] font-bold tracking-[0.2em] uppercase">
               <span>Acquisition Reward</span>
               <span>— <Price amount={discount} showCurrency /></span>
            </div>
          )}
          <div className="pt-8 border-t border-white/5 flex justify-between items-end">
             <div>
               <span className="text-sd-gold text-[8px] font-bold tracking-[0.4em] uppercase block mb-2">Total Dossier</span>
               <span className="text-sd-ivory font-display italic text-2xl">Final Amount</span>
             </div>
             <div className="text-right">
                <span className="block text-4xl font-bold text-sd-ivory tracking-tighter"><Price amount={total} showCurrency /></span>
                <span className="text-[8px] text-sd-text-muted uppercase tracking-[0.4em] font-bold">Inc. Duty & Tax</span>
             </div>
          </div>
       </div>

       {/* Boutique Seal */}
       <div className="py-6 bg-sd-gold/5 flex justify-center">
          <span className="text-[8px] font-bold tracking-[0.6em] text-sd-gold/40 uppercase">Sareng Digital Official Boutique</span>
       </div>
    </div>
  );
};

export default CheckoutOrderSummary;
