'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Package, 
  MapPin, 
  CreditCard, 
  Printer, 
  Home, 
  Loader2, 
  ChevronRight, 
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import Navigation from '@/components/ecommerce/Navigation';
import checkoutService, { Order } from '@/services/checkoutService';
import Link from 'next/link';
import { toAbsoluteAssetUrl } from '@/lib/urlUtils';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setError('Invalid order number');
        setLoading(false);
        return;
      }

      try {
        const orderData = await checkoutService.getOrderByNumber(orderNumber);
        setOrder(orderData);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        // Try to check if we have a last order preview in localStorage (for immediate UX)
        try {
          const lastOrder = localStorage.getItem('ec_last_order');
          if (lastOrder) {
            const parsed = JSON.parse(lastOrder);
            if (parsed.order_number === orderNumber) {
              setOrder(parsed);
              setLoading(false);
              return;
            }
          }
        } catch (storageErr) {
          console.warn('Storage check failed', storageErr);
        }
        setError('Failed to load order details. Please check My Account > Orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="ec-root bg-[var(--bg-root)] min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[var(--gold)] mx-auto mb-6" />
            <h2 className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.25em] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
              Confirming Order
            </h2>
            <p className="text-[var(--text-secondary)] mt-4 font-light">Connecting to our secure server...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="ec-root bg-[var(--bg-root)] min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center max-w-md mx-auto bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-12 shadow-sm">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-red-500" size={32} />
            </div>
            <h1 className="text-3xl font-medium text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Not Found</h1>
            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed font-light">{error}</p>
            <button
              onClick={() => router.push('/e-commerce')}
              className="w-full ec-btn-primary justify-center py-4 text-xs font-bold tracking-widest uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Return to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ec-root bg-sd-ivory min-h-screen pb-24 selection:bg-sd-gold/30">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        
        {/* ── Success Monument (Header) ── */}
        <div className="text-center mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-sd-gold/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative mb-12 inline-block">
             <div className="w-32 h-32 bg-sd-white rounded-full flex items-center justify-center sd-depth-lift border border-sd-gold/20 relative z-10">
                <CheckCircle size={64} strokeWidth={1} className="text-sd-gold" />
             </div>
             {/* 3D Orbitals */}
             <div className="absolute -top-4 -right-4 w-12 h-12 bg-sd-black rounded-full flex items-center justify-center sd-depth-top text-sd-white">
                <ShoppingBag size={18} />
             </div>
          </div>
          
          <span className="block font-mono text-[10px] font-bold text-sd-gold uppercase tracking-[0.6em] mb-4">Transaction Confirmed</span>
          <h1 className="text-7xl md:text-8xl font-display text-sd-black italic leading-none mb-8">Order Secured</h1>
          
          <p className="max-w-lg mx-auto font-mono text-[11px] leading-relaxed uppercase tracking-widest text-sd-text-muted">
            Provisioning successful. Your order reference <span className="text-sd-black font-bold">#{order?.order_number}</span> has been logged into the registry. A digital copy has been dispatched to your contact.
          </p>
        </div>

        {/* ── Action Deck ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
           <div className="p-10 rounded-[48px] bg-sd-white sd-depth-lift flex flex-col gap-8 group hover:scale-[1.02] transition-transform duration-700">
              <div className="w-16 h-16 rounded-[24px] bg-sd-black text-sd-white flex items-center justify-center">
                 <Package size={28} />
              </div>
              <div>
                 <h3 className="text-3xl font-display text-sd-black italic">Track Provenance</h3>
                 <p className="font-mono text-[9px] text-sd-text-muted uppercase tracking-widest mt-2">Real-time logistics monitoring</p>
              </div>
              <button
                onClick={() => router.push(`/e-commerce/order-tracking/${order?.order_number}`)}
                className="mt-4 px-10 h-16 bg-sd-black text-sd-white rounded-[20px] font-mono text-[10px] items-center justify-center flex font-bold uppercase tracking-[0.4em] group-hover:bg-sd-gold group-hover:text-sd-black transition-all"
              >
                Launch Tracker
              </button>
           </div>

           <div className="p-10 rounded-[48px] bg-sd-white border border-sd-border-default/20 flex flex-col gap-8 justify-between">
              <div className="flex justify-between items-start">
                 <div className="w-16 h-16 rounded-[24px] bg-sd-ivory-dark/20 text-sd-black flex items-center justify-center">
                    <Printer size={28} />
                 </div>
                 <div className="text-right">
                    <span className="block font-mono text-[9px] font-bold text-sd-gold uppercase tracking-widest">Dated</span>
                    <span className="block font-display text-xl">{order && new Date(order.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</span>
                 </div>
              </div>
              <div>
                 <h3 className="text-3xl font-display text-sd-black italic">Archive Receipt</h3>
                 <p className="font-mono text-[9px] text-sd-text-muted uppercase tracking-widest mt-2">Hard copy for your permanent records</p>
              </div>
              <button
                onClick={handlePrint}
                className="mt-4 px-10 h-16 bg-sd-ivory-dark/10 text-sd-black rounded-[20px] font-mono text-[10px] items-center justify-center flex font-bold uppercase tracking-[0.4em] border border-sd-border-default/20 hover:bg-sd-ivory-dark transition-all"
              >
                Print Artifact
              </button>
           </div>
        </div>

        {/* ── The Registry (Line Items) ── */}
        <div className="sd-depth-recess bg-sd-ivory-dark/10 rounded-[64px] p-12 mb-20 space-y-12">
            <div className="flex items-center justify-between border-b border-sd-black/5 pb-8">
               <h4 className="font-mono text-[10px] font-bold text-sd-gold uppercase tracking-[0.5em]">Inventory Manifest</h4>
               <span className="font-mono text-[9px] font-bold bg-sd-black text-sd-white px-4 py-1.5 rounded-full uppercase tracking-widest">{order?.items.length} units</span>
            </div>

            <div className="space-y-10">
              {order?.items.map((item, index) => (
                <div key={index} className="flex gap-10 items-start group">
                  <div className="w-32 h-40 rounded-[32px] overflow-hidden bg-sd-white sd-depth-lift flex-shrink-0 relative">
                     {(() => {
                        const imgUrl = toAbsoluteAssetUrl(
                                     item.product_image || item.image_url || 
                                     (item.product?.images?.find((img: any) => img.is_primary)?.image_url || 
                                      item.product?.images?.find((img: any) => img.is_primary)?.url || 
                                      item.product?.images?.[0]?.image_url || 
                                      item.product?.images?.[0]?.url)
                        );
                        return imgUrl ? (
                          <img src={imgUrl} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-sd-ivory-dark/20 text-sd-text-muted"><Package size={32} /></div>
                        );
                      })()}
                  </div>
                  
                  <div className="flex-1 py-2">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <h4 className="text-3xl font-display text-sd-black leading-tight line-clamp-1">{item.product_name}</h4>
                           <span className="font-mono text-[9px] text-sd-gold uppercase tracking-widest mt-2 block">SKU: {item.sku || item.product_sku || 'N/A'}</span>
                        </div>
                        <span className="text-2xl font-display italic text-sd-black">×{item.quantity}</span>
                     </div>
                     <div className="flex justify-between items-center pt-8 border-t border-sd-black/5">
                        <span className="font-mono text-[10px] text-sd-text-muted uppercase tracking-[0.3em]">Unit Valuation</span>
                        <span className="font-mono text-[13px] font-bold text-sd-black">৳{(item.unit_price ?? item.price ?? 0).toLocaleString()}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-12 border-t border-sd-black/5 space-y-6">
               <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.4em] text-sd-text-muted">
                  <span>Gross Valuation</span>
                  <span className="text-sd-black">৳{order?.subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.4em] text-sd-text-muted">
                  <span>Dispatch Provision</span>
                  <span className="text-sd-black">+ ৳{order?.shipping_amount.toLocaleString()}</span>
               </div>
               {order && order.discount_amount > 0 && (
                 <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.4em] text-sd-success">
                    <span>Protocol Save</span>
                    <span className="font-bold">- ৳{order.discount_amount.toLocaleString()}</span>
                 </div>
               )}
               <div className="flex justify-between items-end pt-8 border-t border-sd-black/10">
                  <span className="font-mono text-[11px] font-bold text-sd-black uppercase tracking-[0.6em]">Collective Total</span>
                  <span className="text-5xl font-display italic text-sd-black tracking-tighter">৳{order?.total_amount.toLocaleString()}</span>
               </div>
            </div>
        </div>

        {/* ── Logistic Deck ── */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
           <div className="p-10 rounded-[48px] bg-sd-white sd-depth-lift border border-sd-border-default/10">
              <h4 className="font-mono text-[10px] font-bold text-sd-gold uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                 <MapPin size={14} /> Dispatch Protocol
              </h4>
              <div className="space-y-4">
                 <p className="font-display text-4xl text-sd-black leading-none">{order?.shipping_address.name}</p>
                 <p className="font-mono text-[11px] text-sd-text-muted uppercase tracking-tighter leading-relaxed">
                    {order?.shipping_address.address_line_1}<br/>
                    {order?.shipping_address.city}, Bangladesh
                 </p>
                 <p className="font-mono text-[10px] font-bold text-sd-black tracking-widest pt-4">{order?.shipping_address.phone}</p>
              </div>
           </div>

           <div className="p-10 rounded-[48px] bg-sd-white sd-depth-lift border border-sd-border-default/10">
              <h4 className="font-mono text-[10px] font-bold text-sd-gold uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                 <CreditCard size={14} /> Settlement Status
              </h4>
              <div className="space-y-8">
                 <div>
                    <span className="block font-mono text-[9px] text-sd-text-muted uppercase tracking-widest mb-2">Method</span>
                    <span className="text-2xl font-display italic text-sd-black capitalize">{order?.payment_method.replace(/_/g, ' ')}</span>
                 </div>
                 <div className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-sd-ivory-dark/20 border border-sd-border-default/20 w-fit">
                    <div className={`w-3 h-3 rounded-full ${order?.payment_status === 'paid' ? 'bg-sd-success shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'bg-sd-gold animate-pulse'}`} />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-sd-black">{order?.payment_status}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* ── Footer Deck ── */}
        <div className="text-center space-y-12">
           <Link 
              href="/e-commerce"
              className="inline-flex items-center gap-4 bg-sd-black text-sd-white px-16 h-20 rounded-[28px] font-mono text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-sd-gold hover:text-sd-black transition-all duration-700 sd-depth-lift group"
           >
              Return to Gallery <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
           </Link>
           
           <div className="pt-20 border-t border-sd-border-default/10 opacity-30">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.8em]">Errum Digital Archive • MMXXVI</p>
           </div>
        </div>
      </div>
    </div>
  );
}
  );
}