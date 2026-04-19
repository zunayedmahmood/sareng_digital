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
        <div className="text-center mb-16 lg:mb-24">
           <motion.div 
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ type: "spring", damping: 12, stiffness: 100 }}
             className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sd-gold/10 border border-sd-gold/20 mb-8"
           >
             <CheckCircle className="w-12 h-12 text-sd-gold" />
           </motion.div>
           
           <motion.h1 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-4xl lg:text-6xl font-bold text-sd-ivory font-display italic mb-6"
           >
             Your Order is <span className="text-sd-gold">Confirmed</span>
           </motion.h1>
           
           <motion.p 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="text-sd-text-secondary text-lg max-w-xl mx-auto leading-relaxed"
           >
             Thank you for choosing Sareng Digital. Your order <span className="text-sd-gold font-bold">#{order.order_number}</span> has been received and is being prepared with care.
           </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left: Order Info */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Order Items */}
              <div className="bg-sd-onyx border border-sd-border-default rounded-3xl overflow-hidden">
                 <div className="px-8 py-6 border-b border-sd-border-default flex items-center justify-between">
                    <h3 className="text-sd-ivory font-bold uppercase tracking-widest text-xs">Ordered Items</h3>
                    <span className="text-sd-gold text-[10px] font-bold tracking-[0.2em]">{order.items.length} Products</span>
                 </div>
                 <div className="p-8 space-y-8">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-6 pb-8 border-b border-sd-border-light last:border-0 last:pb-0">
                         <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-sd-black border border-sd-border-light">
                            <SdImage 
                              src={item.product_image || ''} 
                              alt={item.product_name} 
                              fill 
                              className="object-cover"
                            />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-sd-ivory font-bold text-lg mb-2 truncate">{item.product_name}</h4>
                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-sd-text-muted">
                               <span>Qty: {item.quantity}</span>
                               <span>৳{(item.unit_price ?? item.price ?? 0).toLocaleString()} /ea</span>
                            </div>
                            <div className="mt-4 text-sd-gold font-bold">
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
                 <div className="bg-sd-onyx border border-sd-border-default rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-4 text-sd-gold">
                       <MapPin className="w-5 h-5" />
                       <h3 className="text-sd-ivory font-bold uppercase tracking-widest text-xs">Delivery Address</h3>
                    </div>
                    <div className="space-y-2">
                       <p className="text-sd-ivory font-bold">{order.shipping_address.name}</p>
                       <p className="text-sd-text-secondary text-sm leading-relaxed">
                          {order.shipping_address.address_line_1}<br />
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                       </p>
                       <p className="text-sd-text-muted text-xs pt-2 font-bold tracking-widest uppercase">{order.shipping_address.phone}</p>
                    </div>
                 </div>

                 {/* Payment */}
                 <div className="bg-sd-onyx border border-sd-border-default rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-4 text-sd-gold">
                       <CreditCard className="w-5 h-5" />
                       <h3 className="text-sd-ivory font-bold uppercase tracking-widest text-xs">Payment Method</h3>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <p className="text-sd-text-muted text-[10px] font-bold tracking-widest uppercase mb-1">Method</p>
                          <p className="text-sd-ivory font-bold capitalize">{order.payment_method.replace(/_/g, ' ')}</p>
                       </div>
                       <div>
                          <p className="text-sd-text-muted text-[10px] font-bold tracking-widest uppercase mb-1">Status</p>
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-sd-gold/10 text-sd-gold rounded-full text-[10px] font-bold tracking-widest uppercase border border-sd-gold/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-sd-gold animate-pulse" />
                             {order.payment_status}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Actions & Breakdown */}
           <div className="space-y-8">
              <div className="bg-sd-onyx border border-sd-border-default rounded-3xl p-8 space-y-8 sticky top-32">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sd-text-secondary text-sm">
                       <span>Subtotal</span>
                       <span className="font-bold text-sd-ivory"><Price amount={order.subtotal} showCurrency /></span>
                    </div>
                    <div className="flex justify-between items-center text-sd-text-secondary text-sm">
                       <span>Shipping</span>
                       <span className="font-bold text-sd-ivory"><Price amount={order.shipping_amount} showCurrency /></span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between items-center text-sd-gold text-sm font-bold">
                         <span>Savings</span>
                         <span>- <Price amount={order.discount_amount} showCurrency /></span>
                      </div>
                    )}
                    <div className="pt-6 border-t border-sd-border-default flex justify-between items-baseline">
                       <span className="text-sd-ivory font-bold uppercase tracking-widest text-xs">Total</span>
                       <span className="text-3xl font-bold text-sd-gold"><Price amount={order.total_amount} showCurrency /></span>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <button 
                      onClick={() => router.push('/e-commerce')}
                      className="w-full bg-sd-ivory text-sd-black py-4 rounded-xl font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-sd-gold transition-all"
                    >
                       Continue Shopping
                       <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="w-full border border-sd-border-default text-sd-text-secondary py-4 rounded-xl font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:text-white hover:border-white transition-all print:hidden"
                    >
                       <Printer className="w-4 h-4" />
                       Print Receipt
                    </button>
                 </div>

                 <div className="flex items-center justify-center gap-2 pt-4">
                    <ShieldCheck className="w-3.5 h-3.5 text-sd-gold" />
                    <span className="text-[10px] font-bold text-sd-text-muted uppercase tracking-widest">Digital Verified Receipt</span>
                 </div>
              </div>
           </div>

        </div>

        {/* Footer Link */}
        <div className="mt-24 text-center border-t border-sd-border-default pt-24">
           <p className="text-sd-text-muted text-[10px] font-bold tracking-[0.4em] uppercase mb-8">Follow Your Package</p>
           <button 
             onClick={() => router.push(`/e-commerce/order-tracking/${order.order_number}`)}
             className="inline-flex items-center gap-3 text-sd-gold hover:text-white transition-all group"
           >
              <span className="text-xs font-bold tracking-widest uppercase">Track Shipment Real-time</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  );
}
