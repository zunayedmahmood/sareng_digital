"use client";

import { useCart } from '../CartContext';
import Navigation from '@/components/ecommerce/Navigation';
import CartItem from '@/components/ecommerce/cart/CartItem';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoBadge from '@/components/ecommerce/ui/NeoBadge';
import Price from '@/components/ecommerce/Price';
import { 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  History, 
  ChevronLeft,
  Layers,
  Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { cart, getTotalPrice, isLoading } = useCart();
  const router = useRouter();

  const subtotal = getTotalPrice();
  const isAnyOverStock = cart.some(item => typeof item.maxQuantity === 'number' && item.quantity > item.maxQuantity);

  const handleCheckout = () => {
    if (isAnyOverStock) return;
    if (cart.length > 0) {
      localStorage.setItem('checkout-selected-items', JSON.stringify(cart.map(i => i.id)));
    }
    router.push('/e-commerce/checkout');
  };

  return (
    <div className="min-h-screen bg-sd-ivory">
      <Navigation />

      {/* ── Cart Page Header ── */}
      <header className="relative pt-32 pb-16 border-b-4 border-black bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-sd-gold/5 -skew-x-12 translate-x-32" />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3">
                <Database size={16} className="text-sd-gold" />
                <span className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-sd-gold italic">Central Retrieval Registry</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-neo font-black uppercase tracking-tighter text-black leading-[0.85]">
                Archival Bag
             </h1>
             <div className="flex items-center gap-3 mt-4">
                <NeoBadge variant="black" className="text-[10px]">{cart.length} ARTIFACTS DETECTED</NeoBadge>
                <div className="h-[2px] w-12 bg-black/10" />
                <span className="font-neo font-black text-[10px] uppercase text-black/40 italic">Sector: Pending Transfer</span>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-16">
        {cart.length === 0 && !isLoading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 border-4 border-black border-dashed rounded-[60px] bg-white/30"
          >
             <div className="w-24 h-24 border-4 border-black bg-sd-ivory flex items-center justify-center mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <History size={48} className="text-black/10" />
             </div>
             <h2 className="text-4xl font-neo font-black uppercase italic mb-4">Registry Empty</h2>
             <p className="font-neo text-[12px] uppercase tracking-widest text-black/40 mb-12 text-center max-w-sm leading-loose">
                No artifacts have been classified for retrieval in this session.
             </p>
             <NeoButton 
               variant="primary" 
               className="px-12 py-5 text-sm italic"
               onClick={() => router.push('/e-commerce/products')}
             >
                Initialize Search Protocol
             </NeoButton>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16">
            {/* ── Artifact List ── */}
            <div className="flex-1 space-y-8">
               <div className="flex items-center justify-between border-b-2 border-black pb-4">
                  <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Retrieval Feed</span>
                  <button 
                    onClick={() => router.push('/e-commerce/products')}
                    className="flex items-center gap-2 font-neo font-black text-[10px] uppercase hover:text-sd-gold transition-colors"
                  >
                    <ChevronLeft size={14} /> Continue Scanning
                  </button>
               </div>

               <div className="space-y-6">
                  {cart.map((item, idx) => (
                    <motion.div 
                      key={`${item.id}-${item.sku}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <CartItem item={item} />
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* ── Summary Module ── */}
            <aside className="w-full lg:w-96 flex-shrink-0">
               <div className="sticky top-32">
                  <NeoCard variant="white" className="p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                     <div className="flex items-center gap-3 mb-8">
                        <Layers size={18} className="text-sd-gold" />
                        <h3 className="font-neo font-black text-xl uppercase italic">Protocol Summary</h3>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Base Value</span>
                           <Price amount={subtotal} className="font-neo font-black text-xl" />
                        </div>
                        
                        <div className="flex items-center justify-between border-t-2 border-black/5 pt-6">
                           <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Retrieval Fee</span>
                           <span className="font-neo font-black text-[10px] uppercase text-sd-gold italic tracking-[0.2em]">Inclusive Protocol</span>
                        </div>

                        <div className="bg-sd-ivory/50 border-2 border-black p-4 mt-8">
                           <div className="flex items-center justify-between mb-2">
                              <span className="font-neo font-black text-[12px] uppercase tracking-tighter">Total Transfer Value</span>
                              <Price amount={subtotal} className="font-neo font-black text-2xl" />
                           </div>
                           <div className="flex items-center gap-2 text-[8px] font-neo font-bold text-black/30 uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap">
                              AUTHENTICATED • VERIFIED • SECURED • AUTHENTICATED • VERIFIED • SECURED
                           </div>
                        </div>

                        <div className="pt-6 space-y-4">
                           <NeoButton 
                             variant="primary" 
                             className="w-full py-6 text-lg italic tracking-[0.1em]"
                             onClick={handleCheckout}
                             disabled={isAnyOverStock || cart.length === 0}
                           >
                              Execute Transfer <ArrowRight size={22} className="ml-2" />
                           </NeoButton>
                           
                           <div className="flex items-center justify-center gap-3 pt-4 border-t border-black/10">
                              <ShieldCheck size={14} className="text-sd-gold" />
                              <span className="font-neo font-black text-[8px] uppercase tracking-widest text-black/40">Secure Archival Protocol Active</span>
                           </div>
                        </div>

                        {isAnyOverStock && (
                           <div className="mt-6 p-4 bg-sd-gold/10 border-2 border-sd-gold text-sd-gold flex gap-3">
                              <Layers size={18} className="flex-shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-1">
                                 <span className="font-neo font-black text-[10px] uppercase italic leading-none">Resource Conflict</span>
                                 <p className="font-neo font-bold text-[8px] uppercase tracking-widest opacity-80 leading-relaxed">
                                    Inventory levels insufficient for requested classification volume.
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                  </NeoCard>

                  {/* Operational Notes */}
                  <div className="mt-8 px-4">
                     <span className="font-neo font-black text-[9px] uppercase tracking-[0.4em] text-black/40 italic block mb-3">Verification Details</span>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 bg-sd-gold" />
                           <span className="font-neo text-[8px] font-bold text-black/60 uppercase tracking-widest leading-none">Instant Retrieval Protocol</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 bg-sd-gold" />
                           <span className="font-neo text-[8px] font-bold text-black/60 uppercase tracking-widest leading-none">256-bit Encryption Verified</span>
                        </div>
                     </div>
                  </div>
               </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}