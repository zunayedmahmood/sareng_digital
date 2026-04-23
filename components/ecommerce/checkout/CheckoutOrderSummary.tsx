'use client';

import React from 'react';
import SdImage from '../SdImage';
import Price from '@/components/ecommerce/Price';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import NeoBadge from '../ui/NeoBadge';
import { Tag, Loader2, X, ShoppingBag, Layers, ShieldCheck, Database } from 'lucide-react';
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
    <div className="space-y-8 sticky top-32">
      {/* ── Main Summary Card ── */}
      <NeoCard variant="white" className="p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sd-gold/5 -rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />
        
        {/* Header Module */}
        <div className="flex flex-col gap-2 relative">
           <div className="flex items-center gap-2">
              <Database size={12} className="text-sd-gold" />
              <span className="font-neo font-black text-[9px] uppercase tracking-[0.4em] text-sd-gold italic">Transfer Protocol</span>
           </div>
           <h3 className="text-2xl font-neo font-black uppercase italic tracking-tighter text-black leading-none">Order Registry</h3>
        </div>

        {/* Item Retrieval Feed */}
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex gap-4 group relative">
              <div className="relative w-24 h-24 border-2 border-black bg-white flex-shrink-0 overflow-hidden group-hover:shadow-[4px_4px_0px_0px_rgba(212,175,55,0.4)] transition-all">
                <SdImage 
                  src={item.product_image || ''} 
                  alt={item.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-1 right-1">
                   <NeoBadge variant="black" className="text-[8px] px-1.5 py-0.5">X{item.quantity}</NeoBadge>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-1">
                <h4 className="font-neo font-black text-[10px] uppercase tracking-widest text-black/80 line-clamp-2 leading-relaxed">
                  {item.name}
                </h4>
                {item.variant_options && (
                  <span className="font-neo font-bold text-[8px] uppercase tracking-widest text-black/40 italic">
                    {Object.values(item.variant_options).filter(Boolean).join(' / ')}
                  </span>
                )}
                <Price amount={item.total} className="font-neo font-black text-[12px] mt-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Entry Module */}
        <div className="border-t-4 border-black pt-8 space-y-4">
           <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-black" />
              <span className="font-neo font-black text-[10px] uppercase tracking-widest italic">Inventory Reward Code</span>
           </div>
           <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="REGISTRY-CODE"
                value={couponCode}
                onChange={(e) => onCouponChange(e.target.value)}
                className="flex-1 bg-sd-ivory border-2 border-black px-4 py-3 font-neo font-bold text-[10px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors placeholder:text-black/20"
              />
              <NeoButton 
                variant="black" 
                className="px-6 py-3 text-[10px] uppercase italic"
                onClick={onApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
              >
                {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'REDEEM'}
              </NeoButton>
           </div>
           
           <AnimatePresence mode="wait">
              {couponError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sd-gold font-neo font-black text-[8px] uppercase tracking-widest pl-1"
                >
                  ERROR: {couponError}
                </motion.p>
              )}
              {couponSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-sd-gold/5 border-2 border-sd-gold/20 p-3"
                >
                   <span className="text-sd-gold font-neo font-black text-[8px] uppercase tracking-widest leading-none">
                      SUCCESS: {couponSuccess}
                   </span>
                   {onRemoveCoupon && (
                     <button onClick={onRemoveCoupon} className="text-sd-gold hover:text-black transition-colors">
                        <X size={14} />
                     </button>
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Financial Disclosure */}
        <div className="space-y-4 border-t border-black/10 pt-4">
           <div className="flex items-center justify-between">
              <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Artifact Subtotal</span>
              <Price amount={subtotal} className="font-neo font-black text-[12px]" />
           </div>
           <div className="flex items-center justify-between">
              <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Logistics Allocation</span>
              {shipping === 0 ? (
                <span className="font-neo font-black text-[10px] uppercase text-sd-gold italic tracking-widest">Protocol Inclusive</span>
              ) : (
                <Price amount={shipping} className="font-neo font-black text-[12px]" />
              )}
           </div>
           {discount > 0 && (
             <div className="flex items-center justify-between text-sd-gold">
                <span className="font-neo font-black text-[10px] uppercase tracking-widest italic">Acquisition Credit</span>
                <div className="flex items-center font-neo font-black text-[12px]">
                   <span className="mr-1">-</span>
                   <Price amount={discount} />
                </div>
             </div>
           )}

           {/* Grand Total Module */}
           <div className="bg-black text-white p-6 -mx-8 -mb-8 mt-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 rotate-12 translate-x-4 -translate-y-4">
                 <ShoppingBag size={80} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-2">
                    <span className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-white/40 italic">Final Assessment</span>
                    <Price amount={total} className="text-3xl font-neo font-black text-sd-gold" />
                 </div>
                 <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <ShieldCheck size={14} className="text-sd-gold" />
                    <span className="font-neo font-black text-[8px] uppercase tracking-[0.3em] text-white/60">
                       Encrypted Transaction Protocol Active
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </NeoCard>

      {/* Auxiliary Information */}
      <div className="flex flex-col gap-2 px-4 opacity-50">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-black" />
            <span className="font-neo font-black text-[8px] uppercase tracking-widest leading-none">Sareng Digital Official Registry Entry</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-black" />
            <span className="font-neo font-black text-[8px] uppercase tracking-widest leading-none">Authentication Index: VERIFIED</span>
         </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
