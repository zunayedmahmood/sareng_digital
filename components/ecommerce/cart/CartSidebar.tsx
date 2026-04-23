'use client';

import React from 'react';
import { X, Loader2, ShoppingCart, ShoppingBag, ArrowRight, Layers, History } from 'lucide-react';
import { useCart } from '../../../app/CartContext';
import { useRouter } from 'next/navigation';
import CartItem from './CartItem';
import checkoutService from '../../../services/checkoutService';
import { motion, AnimatePresence } from 'framer-motion';
import NeoButton from '../ui/NeoButton';
import NeoBadge from '../ui/NeoBadge';
import Price from '../Price';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, getTotalPrice, isLoading } = useCart();
  const router = useRouter();

  const subtotal = getTotalPrice();
  // Simplified delivery charge for the sidebar summary
  const deliveryCharge = 0; 
  const total = subtotal + deliveryCharge;

  const isAnyOverStock = cart.some(item => typeof item.maxQuantity === 'number' && item.quantity > item.maxQuantity);

  const handleCheckout = () => {
    if (isAnyOverStock) return;
    
    if (cart.length > 0) {
      localStorage.setItem('checkout-selected-items', JSON.stringify(cart.map(i => i.id)));
    }
    
    router.push('/e-commerce/checkout');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Slide Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-sd-ivory border-l-4 border-black flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.2)]"
          >
            {/* Header Module */}
            <div className="flex items-center justify-between p-6 border-b-4 border-black bg-white relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-sd-gold" />
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 border-2 border-black bg-sd-gold flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                     <ShoppingBag size={20} />
                  </div>
                  <div className="flex flex-col">
                     <h2 className="font-neo font-black text-sm uppercase tracking-widest italic leading-none">Archival Bag</h2>
                     <span className="font-neo font-black text-[10px] text-black/40 uppercase tracking-[0.3em] mt-1 italic">Registry Tracking</span>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <NeoBadge variant="black" className="font-neo font-black text-[10px] px-2 py-0.5">
                     {cart.length} ITEMS
                  </NeoBadge>
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-sd-gold active:translate-y-[2px] transition-all"
                  >
                     <X size={20} />
                  </button>
               </div>
            </div>

            {/* Cart Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative custom-scrollbar">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
                  <span className="text-[150px] font-neo font-black italic absolute -left-20 top-20 rotate-90 text-black">RETRIEVAL</span>
               </div>
               
               {/* Loading Protocol */}
               {isLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                     <div className="w-12 h-12 border-4 border-black border-t-sd-gold animate-spin" />
                     <span className="font-neo font-black text-[10px] uppercase tracking-[0.4em] italic">Syncing Registry...</span>
                  </div>
               )}

               {/* Empty Archive State */}
               {!isLoading && cart.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-32 text-center border-4 border-black border-dashed rounded-[40px] bg-white/30">
                     <div className="w-20 h-20 border-2 border-black bg-sd-ivory flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <History size={32} className="text-black/20" />
                     </div>
                     <h3 className="font-neo font-black text-xl uppercase italic mb-2">No Records Detected</h3>
                     <p className="font-neo text-[10px] uppercase tracking-widest text-black/40 mb-8 max-w-[200px] leading-loose">
                        Your retrieval bag is currently devoid of archival artifacts.
                     </p>
                     <NeoButton 
                       variant="primary" 
                       className="px-8 py-3 text-[10px]"
                       onClick={() => { onClose(); router.push('/e-commerce/products'); }}
                     >
                        Initiate Protocol
                     </NeoButton>
                  </div>
               )}

               {/* Item Feed */}
               {!isLoading && cart.length > 0 && (
                  <div className="space-y-4">
                     {cart.map((item) => (
                        <CartItem key={`${item.id}-${item.sku}`} item={item} />
                     ))}
                  </div>
               )}
            </div>

            {/* Footer Control Panel */}
            {!isLoading && cart.length > 0 && (
               <div className="p-6 border-t-4 border-black bg-white space-y-6">
                  {/* Summary Module */}
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="font-neo font-black text-[10px] uppercase tracking-[0.3em] text-black/40 italic">Accumulated Value</span>
                        <Price amount={subtotal} className="font-neo font-black text-xl text-black" />
                     </div>
                     <div className="flex items-center justify-between border-t border-black/10 pt-3">
                        <span className="font-neo font-black text-[10px] uppercase tracking-[0.3em] text-black/40 italic">Logistics Fee</span>
                        <span className="font-neo font-black text-[10px] uppercase text-sd-gold italic tracking-widest">Protocol Inclusive</span>
                     </div>
                  </div>

                  {/* Operational Controls */}
                  <div className="flex flex-col gap-3">
                     <NeoButton 
                       variant="primary" 
                       className="w-full py-5 text-sm uppercase italic tracking-[0.2em]"
                       onClick={handleCheckout}
                       disabled={isAnyOverStock}
                     >
                        Execute Transfer <ArrowRight size={18} className="ml-2" />
                     </NeoButton>
                     <NeoButton 
                       variant="outline" 
                       className="w-full py-4 text-[10px] uppercase tracking-widest"
                       onClick={() => router.push('/e-commerce/cart')}
                     >
                        View Full Registry
                     </NeoButton>
                  </div>
                  
                  {isAnyOverStock && (
                     <div className="flex items-center gap-2 p-3 bg-sd-gold/10 border-2 border-sd-gold text-sd-gold">
                        <Layers size={14} />
                        <span className="font-neo font-black text-[9px] uppercase tracking-widest leading-none">Resolution required: exceed stock capacity detected</span>
                     </div>
                  )}
               </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}