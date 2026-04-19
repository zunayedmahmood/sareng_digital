'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Package, 
  MapPin, 
  CreditCard, 
  Printer, 
  ArrowRight, 
  Loader2, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

import checkoutService, { Order } from '@/services/checkoutService';
import SdImage from '@/components/ecommerce/SdImage';
import Price from '@/components/ecommerce/Price';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;
      try {
        setLoading(true);
        const orderData = await checkoutService.getOrderByNumber(orderNumber);
        setOrder(orderData);
      } catch (err: any) {
        // Fallback to local storage preview
        const lastOrder = localStorage.getItem('ec_last_order');
        if (lastOrder) {
          const parsed = JSON.parse(lastOrder);
          if (parsed.order_number === orderNumber) {
            setOrder(parsed);
            setLoading(false);
            return;
          }
        }
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sd-black flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sd-gold mb-4" />
        <p className="text-sd-text-muted text-[10px] font-bold tracking-[0.2em] uppercase">Confirming your luxury order...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="bg-sd-black min-h-screen pb-32 pt-20">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Animated Success Header */}
        <div className="text-center mb-24 lg:mb-32">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
             animate={{ scale: 1, opacity: 1, rotate: 0 }}
             transition={{ type: "spring", damping: 15, stiffness: 100 }}
             className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-sd-gold/5 border border-sd-gold/10 mb-12 relative"
           >
             <div className="absolute inset-0 rounded-full bg-sd-gold/20 animate-ping opacity-20" />
             <CheckCircle className="w-16 h-16 text-sd-gold relative z-10" />
           </motion.div>
           
           <motion.div
             initial={{ y: 30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="space-y-4"
           >
             <span className="text-sd-gold text-[10px] font-bold tracking-[0.6em] uppercase block">Acquisition Successful</span>
             <h1 className="text-5xl lg:text-8xl font-display font-medium italic text-sd-ivory leading-tight">
               Welcome to the <span className="text-sd-gold">Circle</span>
             </h1>
             <p className="text-sd-text-muted text-sm tracking-[0.2em] uppercase font-bold pt-4">
               Order Dossier <span className="text-sd-gold font-display italic lowercase ml-2">#{order.order_number}</span>
             </p>
           </motion.div>
           
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             className="text-sd-text-secondary text-lg max-w-2xl mx-auto leading-relaxed mt-12 italic opacity-80"
           >
             Your selection is being curated with exceptional precision. We are honored to be part of your digital journey.
           </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left: Order Info */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Order Items */}
              <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                 <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex flex-col gap-1">
                      <span className="text-sd-gold text-[8px] font-bold tracking-[0.4em] uppercase">Inventory</span>
                      <h3 className="text-xl font-display font-medium italic text-sd-ivory">Your Selection</h3>
                    </div>
                    <span className="text-sd-gold text-[9px] font-bold tracking-[0.2em] px-4 py-2 bg-sd-gold/5 rounded-full border border-sd-gold/10 uppercase">
                      {order.items.length} Artifacts
                    </span>
                 </div>
                 <div className="p-10 space-y-10">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-8 group pb-10 border-b border-white/5 last:border-0 last:pb-0">
                         <div className="relative w-32 h-36 rounded-2xl overflow-hidden bg-[#0D0D0D] border border-white/5 flex-shrink-0">
                            <SdImage 
                              src={item.product_image || ''} 
                              alt={item.product_name} 
                              fill 
                              className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                         </div>
                         <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-sd-ivory font-bold text-xl mb-3 tracking-tight">{item.product_name}</h4>
                            <div className="flex items-center gap-6 text-[9px] font-bold tracking-[0.2em] uppercase text-sd-text-muted">
                               <span className="flex items-center gap-2">
                                 <span className="text-sd-gold/40">qty</span> {item.quantity}
                               </span>
                               <span className="flex items-center gap-2">
                                 <span className="text-sd-gold/40">unit</span> ৳{(item.unit_price ?? item.price ?? 0).toLocaleString()}
                               </span>
                            </div>
                            <div className="mt-6 text-sd-gold font-bold text-lg tracking-tighter">
                               <Price amount={item.total_amount ?? item.total ?? 0} showCurrency />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Logistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Shipping */}
                 <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
                    <div className="flex items-center gap-4 text-sd-gold">
                       <div className="w-10 h-10 rounded-full bg-sd-gold/5 border border-sd-gold/20 flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <h3 className="text-sd-ivory font-bold uppercase tracking-[0.4em] text-[10px]">Destination</h3>
                    </div>
                    <div className="space-y-4">
                       <p className="text-sd-ivory font-bold text-lg tracking-tight">{order.shipping_address.name}</p>
                       <p className="text-sd-text-secondary text-base leading-relaxed font-light">
                          {order.shipping_address.address_line_1}<br />
                          <span className="text-sd-gold/60">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</span>
                       </p>
                       <div className="pt-4 border-t border-white/5">
                          <p className="text-sd-text-muted text-[10px] font-bold tracking-[0.4em] uppercase">{order.shipping_address.phone}</p>
                       </div>
                    </div>
                 </div>

                 {/* Payment */}
                 <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
                    <div className="flex items-center gap-4 text-sd-gold">
                       <div className="w-10 h-10 rounded-full bg-sd-gold/5 border border-sd-gold/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                       </div>
                       <h3 className="text-sd-ivory font-bold uppercase tracking-[0.4em] text-[10px]">Settlement</h3>
                    </div>
                    <div className="space-y-6">
                       <div>
                          <p className="text-sd-text-muted text-[8px] font-bold tracking-[0.4em] uppercase mb-2">Protocol</p>
                          <p className="text-sd-ivory font-bold text-lg capitalize tracking-tight">{order.payment_method.replace(/_/g, ' ')}</p>
                       </div>
                       <div>
                          <p className="text-sd-text-muted text-[8px] font-bold tracking-[0.4em] uppercase mb-2">Authorization</p>
                          <span className="inline-flex items-center gap-3 px-6 py-2 bg-sd-gold/5 text-sd-gold rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-sd-gold/20">
                             <div className="w-2 h-2 rounded-full bg-sd-gold shadow-[0_0_12px_rgba(201,168,76,0.5)] animate-pulse" />
                             {order.payment_status}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

            {/* Right: Actions & Breakdown */}
            <div className="space-y-8">
               <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 space-y-10 sticky top-32 shadow-2xl">
                  <div className="space-y-5">
                     <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.2em] uppercase text-sd-text-muted">
                        <span>Market Subtotal</span>
                        <span className="text-sd-ivory/80"><Price amount={order.subtotal} showCurrency /></span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.2em] uppercase text-sd-text-muted">
                        <span>Logistics</span>
                        <span className="text-sd-ivory/80"><Price amount={order.shipping_amount} showCurrency /></span>
                     </div>
                     {order.discount_amount > 0 && (
                       <div className="flex justify-between items-center text-sd-gold text-[10px] font-bold tracking-[0.2em] uppercase">
                          <span>Acquisition Savings</span>
                          <span>- <Price amount={order.discount_amount} showCurrency /></span>
                       </div>
                     )}
                     <div className="pt-8 border-t border-white/5 flex justify-between items-end">
                        <div className="flex flex-col">
                           <span className="text-sd-gold text-[8px] font-bold tracking-[0.4em] uppercase mb-2">Final Dossier</span>
                           <span className="text-xl font-display font-medium italic text-sd-ivory">Amount</span>
                        </div>
                        <span className="text-4xl font-bold text-sd-ivory tracking-tighter"><Price amount={order.total_amount} showCurrency /></span>
                     </div>
                  </div>

                  <div className="space-y-4 pt-6">
                     <button 
                       onClick={() => router.push('/e-commerce')}
                       className="w-full bg-sd-gold text-sd-black py-5 rounded-full font-bold text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-4 hover:bg-sd-ivory transition-all duration-500 shadow-xl shadow-sd-gold/10"
                     >
                        Continue Discovery
                        <ArrowRight className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => window.print()}
                       className="w-full border border-white/10 text-sd-text-muted py-5 rounded-full font-bold text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-4 hover:text-sd-ivory hover:border-white/30 transition-all duration-500 print:hidden"
                     >
                        <Printer className="w-4 h-4" />
                        Print Dossier
                     </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/5">
                     <ShieldCheck className="w-4 h-4 text-sd-gold/60" />
                     <span className="text-[9px] font-bold text-sd-gold/40 uppercase tracking-[0.4em]">Sareng Authenticated Receipt</span>
                  </div>
               </div>
            </div>

        </div>

        {/* Footer Link */}
        <div className="mt-32 text-center border-t border-white/5 pt-32">
           <p className="text-sd-gold/40 text-[9px] font-bold tracking-[0.6em] uppercase mb-12">Logistics Pipeline</p>
           <button 
             onClick={() => router.push(`/e-commerce/order-tracking/${order.order_number}`)}
             className="inline-flex flex-col items-center gap-6 group"
           >
              <div className="w-20 h-20 rounded-full border border-sd-gold/20 flex items-center justify-center group-hover:border-sd-gold/50 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-sd-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <Package className="w-8 h-8 text-sd-gold relative z-10" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold tracking-[0.4em] uppercase text-sd-ivory group-hover:text-sd-gold transition-colors">Track Shipment Real-time</span>
                <ExternalLink className="w-4 h-4 text-sd-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
           </button>
        </div>

      </div>
    </div>
  );
}
