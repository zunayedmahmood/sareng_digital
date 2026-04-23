'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Printer, 
  Loader2, 
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  Archive,
  AlertCircle
} from 'lucide-react';
import Navigation from '@/components/ecommerce/Navigation';
import checkoutService, { Order } from '@/services/checkoutService';
import Link from 'next/link';
import { toAbsoluteAssetUrl } from '@/lib/urlUtils';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';

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
        setError('INVALID PROTOCOL: NULL REFERENCE');
        setLoading(false);
        return;
      }

      try {
        const orderData = await checkoutService.getOrderByNumber(orderNumber);
        setOrder(orderData);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
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
        setError('REGISTRY ACCESS DENIED: TRANSACTION DATA UNRECOVERABLE');
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
      <div className="min-h-screen bg-sd-ivory pb-40">
        <Navigation />
        <div className="container mx-auto px-6 lg:px-12 pt-40">
          <div className="text-center py-40">
             <div className="w-16 h-16 border-4 border-black border-t-sd-gold animate-spin mx-auto mb-8" />
             <h2 className="font-neo font-black text-xs uppercase tracking-[0.5em] italic">Synchronizing Registry...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-sd-ivory pb-40">
        <Navigation />
        <div className="container mx-auto px-6 lg:px-12 pt-40">
          <div className="max-w-xl mx-auto border-4 border-black bg-white p-12 shadow-[12px_12px_0_0_rgba(0,0,0,1)] text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
             <div className="w-20 h-20 border-2 border-black bg-red-500/10 flex items-center justify-center mx-auto mb-8">
               <AlertCircle className="text-black" size={40} />
             </div>
             <h1 className="font-neo font-black text-3xl uppercase italic mb-6">Access Anomaly</h1>
             <p className="font-neo font-bold text-[11px] uppercase tracking-widest text-black/40 mb-12 leading-loose">{error}</p>
             <NeoButton 
               variant="primary" 
               className="w-full py-5"
               onClick={() => router.push('/e-commerce')}
             >
               Return to General Store
             </NeoButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sd-ivory pb-40 relative selection:bg-sd-gold selection:text-black">
      <Navigation />
      
      <div className="container mx-auto px-6 lg:px-12 pt-40">
        
        {/* ── Transaction Monument ── */}
        <div className="text-center mb-32 relative">
          <div className="relative mb-12 inline-block">
             <div className="w-40 h-40 border-4 border-black bg-white flex items-center justify-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative z-10 rotate-3">
                <CheckCircle size={80} strokeWidth={3} className="text-black" />
             </div>
             <div className="absolute -top-6 -right-6 w-16 h-16 border-4 border-black bg-sd-gold text-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] -rotate-6 z-20">
                <Archive size={28} />
             </div>
          </div>
          
          <div className="flex flex-col gap-4 items-center mb-10">
             <span className="font-neo font-black text-[10px] uppercase tracking-[0.6em] text-sd-gold italic">Protocol Success • Authorized</span>
             <h1 className="text-6xl md:text-8xl font-neo font-black text-black italic leading-[0.8] uppercase tracking-tighter">
                Registry <br/> Entry Finalized
             </h1>
          </div>
          
          <div className="max-w-2xl mx-auto py-8 border-y-4 border-black flex flex-col md:flex-row gap-8 justify-between items-center px-8 bg-white/50">
             <div className="text-left">
                <span className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40">Reference Index</span>
                <p className="font-neo font-black text-2xl uppercase italic text-black">#{order?.order_number}</p>
             </div>
             <div className="text-right">
                <span className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40 italic">Sync Date</span>
                <p className="font-neo font-black text-lg uppercase text-black">{new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
             </div>
          </div>
          
          <p className="max-w-lg mx-auto font-neo font-bold text-[10px] leading-relaxed uppercase tracking-[0.2em] text-black/40 mt-12 italic">
            Asset allocation successful. Your hardware acquisition has been registered under Protocol {order?.order_number?.slice(0,4)}. Physical displacement pending logistical clearance.
          </p>
        </div>

        {/* ── Operational Deck ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
           <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 group">
              <div className="w-20 h-20 border-4 border-black bg-black text-sd-gold flex items-center justify-center">
                 <Package size={32} />
              </div>
              <div className="flex-1">
                 <h3 className="font-neo font-black text-3xl uppercase italic text-black">Trace Displacement</h3>
                 <p className="font-neo font-black text-[10px] text-black/40 uppercase tracking-widest mt-2 italic">Real-time asset positioning logs</p>
              </div>
              <NeoButton 
                variant="primary" 
                className="w-full py-6 group"
                onClick={() => router.push(`/e-commerce/order-tracking/${order?.order_number}`)}
              >
                Launch Tracker <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
              </NeoButton>
           </NeoCard>

           <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex flex-col gap-8 justify-between opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start">
                 <div className="w-20 h-20 border-4 border-black bg-sd-ivory text-black flex items-center justify-center">
                    <Printer size={32} />
                 </div>
                 <div className="text-right">
                    <span className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40 italic">Artifact Type</span>
                    <span className="block font-neo font-black text-xl uppercase italic">Protocol Receipt</span>
                 </div>
              </div>
              <div>
                 <h3 className="font-neo font-black text-3xl uppercase italic text-black">Archive Artifact</h3>
                 <p className="font-neo font-black text-[10px] text-black/40 uppercase tracking-widest mt-2 italic">Physical record for redundant storage</p>
              </div>
              <NeoButton 
                variant="outline" 
                className="w-full py-6"
                onClick={handlePrint}
              >
                Print Hardcopy Artifact
              </NeoButton>
           </NeoCard>
        </div>

        {/* ── Inventory Manifest ── */}
        <div className="mb-32">
           <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-[4px] bg-black" />
              <h4 className="font-neo font-black text-xs uppercase tracking-[0.5em] text-black italic">Inventory Manifest</h4>
              <div className="flex-1 h-[4px] bg-black" />
           </div>

           <div className="grid grid-cols-1 gap-8">
             {order?.items.map((item, index) => (
               <div key={index} className="flex flex-col md:flex-row gap-10 items-start group border-b-4 border-black/10 pb-8 last:border-0">
                 <div className="w-full md:w-48 h-60 border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden flex-shrink-0 relative">
                    {(() => {
                       const imgUrl = toAbsoluteAssetUrl(
                                    item.product_image || item.image_url || 
                                    (item.product?.images?.find((img: any) => img.is_primary)?.image_url || 
                                     item.product?.images?.find((img: any) => img.is_primary)?.url || 
                                     item.product?.images?.[0]?.image_url || 
                                     item.product?.images?.[0]?.url)
                       );
                       return imgUrl ? (
                         <img src={imgUrl} alt={item.product_name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-sd-ivory text-black/20"><Package size={48} /></div>
                       );
                     })()}
                     <div className="absolute top-0 right-0 w-12 h-12 border-b-4 border-l-4 border-black bg-black text-sd-gold flex items-center justify-center font-neo font-black text-lg">
                        {item.quantity}
                     </div>
                 </div>
                 
                 <div className="flex-1 py-4 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                       <div>
                          <h4 className="font-neo font-black text-4xl uppercase italic text-black leading-[0.9] tracking-tight">{item.product_name}</h4>
                          <span className="font-neo font-black text-[10px] text-sd-gold uppercase tracking-[0.3em] mt-4 block italic">Unit Ref: {item.sku || 'UNSPECIFIED'}</span>
                       </div>
                       <div className="text-right">
                          <span className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40 italic">Unit Value</span>
                          <p className="font-neo font-black text-2xl text-black">৳{Math.floor(item.unit_price ?? item.price ?? 0).toLocaleString()}</p>
                       </div>
                    </div>
                    
                    <div className="p-6 border-2 border-black/5 bg-black/5 flex justify-between items-center">
                       <span className="font-neo font-black text-[10px] text-black uppercase tracking-[0.4em] italic">Sub-Total for Entry</span>
                       <span className="font-neo font-black text-xl text-black">৳{Math.floor((item.unit_price ?? item.price ?? 0) * item.quantity).toLocaleString()}</span>
                    </div>
                 </div>
               </div>
             ))}
           </div>

           <div className="mt-20 ml-auto max-w-md border-4 border-black bg-white p-10 shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-2 bg-black" />
              <div className="space-y-6 mb-12">
                 <div className="flex justify-between font-neo font-black text-[10px] uppercase tracking-widest text-black/40">
                    <span>Manifest Valuation</span>
                    <span className="text-black">৳{order?.subtotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">
                    <span>Dispatch Provision</span>
                    <span className="text-black">+ ৳{order?.shipping_amount.toLocaleString()}</span>
                 </div>
                 {order && order.discount_amount > 0 && (
                   <div className="flex justify-between font-neo font-black text-[10px] uppercase tracking-widest text-green-600">
                      <span>Protocol Save</span>
                      <span className="font-bold">- ৳{order.discount_amount.toLocaleString()}</span>
                   </div>
                 )}
              </div>
              <div className="pt-8 border-t-4 border-black flex justify-between items-end">
                 <span className="font-neo font-black text-xs uppercase tracking-[0.4em] text-black italic">Net Total</span>
                 <span className="text-5xl font-neo font-black italic text-black leading-none">৳{order?.total_amount.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* ── Registry Parameters ── */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
           <div className="border-4 border-black p-10 bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <h4 className="font-neo font-black text-xs uppercase tracking-[0.4em] text-sd-gold italic mb-10 flex items-center gap-3">
                 <MapPin size={16} /> Retrieval Pointer
              </h4>
              <div className="space-y-6">
                 <p className="font-neo font-black text-3xl uppercase italic text-black leading-tight border-b-2 border-black pb-4">{order?.shipping_address.name}</p>
                 <p className="font-neo font-bold text-[11px] text-black/60 uppercase tracking-tighter leading-loose italic">
                    {order?.shipping_address.address_line_1}<br/>
                    {order?.shipping_address.city.toUpperCase()} NODE • BANGLADESH
                 </p>
                 <div className="pt-4 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-black" />
                    <p className="font-neo font-black text-[11px] text-black tracking-[0.2em]">{order?.shipping_address.phone}</p>
                 </div>
              </div>
           </div>

           <div className="border-4 border-black p-10 bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
              <h4 className="font-neo font-black text-xs uppercase tracking-[0.4em] text-sd-gold italic mb-10 flex items-center gap-3">
                 <CreditCard size={16} /> Audit Status
              </h4>
              <div className="space-y-10">
                 <div>
                    <span className="block font-neo font-black text-[9px] text-black/40 uppercase tracking-widest mb-3 italic">Settlement Mode</span>
                    <span className="text-3xl font-neo font-black italic text-black uppercase tracking-tight">{order?.payment_method.replace(/_/g, ' ')}</span>
                 </div>
                 <div className="flex flex-col gap-4">
                    <span className="block font-neo font-black text-[9px] text-black/40 uppercase tracking-widest italic">Protocol Status</span>
                    <div className={`border-4 border-black px-8 py-4 w-fit flex items-center gap-4 ${order?.payment_status === 'paid' ? 'bg-black text-sd-gold' : 'bg-sd-gold text-black'}`}>
                       <div className={`w-3 h-3 rounded-full ${order?.payment_status === 'paid' ? 'bg-sd-gold bg-opacity-70 animate-pulse' : 'bg-black animate-pulse'}`} />
                       <span className="font-neo font-black text-xs uppercase tracking-[0.4em]">{order?.payment_status.toUpperCase()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── Final Navigation ── */}
        <div className="text-center">
           <NeoButton 
              variant="primary"
              className="px-24 py-10 text-lg group"
              onClick={() => router.push('/e-commerce')}
           >
              Return to Gallery <ArrowRight size={20} className="ml-4 group-hover:translate-x-3 transition-transform" />
           </NeoButton>
           
           <div className="mt-40 pt-20 border-t-4 border-black flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30">Registry ID: {order?.id}</p>
              <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30">Errum Digital • MMXXVI</p>
           </div>
        </div>
      </div>
    </div>
  );
}