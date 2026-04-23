'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Navigation from '@/components/ecommerce/Navigation';
import checkoutService, { Order, OrderTracking } from '@/services/checkoutService';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOrderNumber, setSearchOrderNumber] = useState('');

  useEffect(() => {
    if (orderNumber) {
      fetchTracking(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchTracking = async (orderNum: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await checkoutService.trackOrder(orderNum);
      setOrder(data.order);
      setTracking(data.tracking);
    } catch (err: any) {
      console.error('Failed to fetch tracking:', err);
      setError('PROTOCOL ERROR: ENTRY NOT FOUND IN REGISTRY');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderNumber.trim()) {
      router.push(`/e-commerce/order-tracking/${searchOrderNumber.trim()}`);
    }
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (!completed) {
      return <Clock className="text-black/20" size={24} />;
    }

    switch (status) {
      case 'pending':
        return <CheckCircle className="text-black" size={24} strokeWidth={3} />;
      case 'processing':
        return <Package className="text-black" size={24} strokeWidth={3} />;
      case 'shipped':
        return <Truck className="text-black" size={24} strokeWidth={3} />;
      case 'delivered':
        return <CheckCircle className="text-black" size={24} strokeWidth={3} />;
      default:
        return <Clock className="text-black" size={24} strokeWidth={3} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'bg-black text-sd-gold border-black';
      case 'cancelled':
        return 'bg-red-500 text-white border-black';
      case 'shipped':
      case 'pending':
        return 'bg-sd-gold text-black border-black';
      default:
        return 'bg-white text-black border-black';
    }
  };

  if (!orderNumber || (!loading && !order)) {
    return (
      <div className="min-h-screen bg-sd-ivory pb-40">
        <Navigation />
        <div className="container mx-auto px-6 lg:px-12 pt-40">
          <NeoCard variant="white" className="max-w-xl mx-auto p-12 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-sd-gold" />
             <div className="w-20 h-20 border-4 border-black bg-sd-ivory flex items-center justify-center mx-auto mb-8">
               <Package className="text-black" size={32} />
             </div>
             <h1 className="font-neo font-black text-4xl uppercase italic mb-4">Registry Search</h1>
             <p className="font-neo font-bold text-[11px] uppercase tracking-widest text-black/40 mb-12">Search order parameters to initiate displacement tracking.</p>

             {error && (
               <div className="mb-8 border-2 border-black bg-red-500/10 p-4 text-left flex items-start gap-3">
                 <AlertCircle className="text-black flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                 <p className="font-neo font-black text-[10px] uppercase tracking-widest leading-loose">{error}</p>
               </div>
             )}

             <form onSubmit={handleSearch} className="space-y-6">
               <div className="text-left">
                 <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 mb-2 block italic">Protocol ID (Order Number)</label>
                 <input
                   type="text"
                   value={searchOrderNumber}
                   onChange={(e) => setSearchOrderNumber(e.target.value)}
                   placeholder="e.g. ORD-..."
                   className="w-full bg-sd-ivory border-4 border-black px-6 py-4 font-neo font-black text-lg focus:outline-none focus:bg-white transition-all placeholder:text-black/10"
                   required
                 />
               </div>
               <NeoButton variant="primary" className="w-full py-5 text-lg italic uppercase">Initialize Protocol</NeoButton>
             </form>
          </NeoCard>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sd-ivory">
        <Navigation />
        <div className="container mx-auto px-6 lg:px-12 pt-40 text-center py-40">
           <div className="w-16 h-16 border-4 border-black border-t-sd-gold animate-spin mx-auto mb-8" />
           <h2 className="font-neo font-black text-xs uppercase tracking-[0.5em] italic">Accessing Displacement Logs...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sd-ivory pb-40 selection:bg-sd-gold selection:text-black">
      <Navigation />
      
      <div className="container mx-auto px-6 lg:px-12 pt-40">
        
        {/* ── Status Monument ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 border-b-4 border-black pb-12">
           <div className="flex-1">
              <span className="font-neo font-black text-[10px] uppercase tracking-[0.6em] text-sd-gold italic block mb-6">Active Displacement Monitor</span>
              <h1 className="text-7xl font-neo font-black text-black uppercase italic leading-[0.8] tracking-tighter">
                 Asset <br/> Tracking
              </h1>
              <div className="flex items-center gap-6 mt-10">
                 <div className="px-6 py-2 border-2 border-black bg-black text-sd-gold font-neo font-black text-[11px] uppercase tracking-widest italic">
                    REF: {order?.order_number}
                 </div>
                 {tracking?.estimated_delivery && (
                   <span className="font-neo font-black text-[11px] uppercase tracking-widest text-black/40 italic">
                      ETA: {tracking.estimated_delivery}
                   </span>
                 )}
              </div>
           </div>

           <div className="flex flex-col items-start md:items-end gap-6">
              <div className={`px-10 py-5 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-neo font-black text-xl uppercase italic ${getStatusStyle(order!.status)}`}>
                 {order?.status.toUpperCase()}
              </div>
              {tracking?.tracking_number && (
                <div className="text-right">
                   <span className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40 block mb-1">Carrier Reference</span>
                   <p className="font-neo font-black text-lg text-black uppercase">{tracking.tracking_number}</p>
                </div>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24 items-start">
           
           {/* ── Displacement Timeline ── */}
           <div className="lg:col-span-2">
              <NeoCard variant="white" className="p-12 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-full h-2 bg-black" />
                 <h2 className="font-neo font-black text-2xl uppercase italic text-black mb-12 flex items-center gap-4">
                    <Truck size={28} /> Operational Logs
                 </h2>
                 
                 <div className="relative space-y-12">
                    <div className="absolute left-6 top-8 bottom-8 w-[4px] bg-black/10" />
                    
                    {(tracking?.steps || []).map((step: any, index: number) => (
                      <div key={index} className="relative flex gap-10">
                        <div className={`relative z-10 w-12 h-12 border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-colors ${
                          step.completed ? 'bg-black text-sd-gold' : 'bg-white text-black/20'
                        }`}>
                          {getStatusIcon(step.status, step.completed)}
                        </div>
                        
                        <div className="flex-1 pt-1">
                          <h3 className={`font-neo font-black text-xl uppercase italic leading-none mb-3 ${
                            step.completed ? 'text-black' : 'text-black/30'
                          }`}>
                            {step.label}
                          </h3>
                          {step.date && (
                            <p className="font-neo font-bold text-[11px] text-black/40 uppercase tracking-widest italic">
                              {new Date(step.date).toLocaleString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          )}
                          {!step.completed && index === (tracking?.steps || []).findIndex((s: any) => !s.completed) && (
                            <div className="mt-4 flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-sd-gold animate-pulse" />
                               <span className="font-neo font-black text-[9px] uppercase tracking-[0.3em] text-sd-gold italic">Synchronizing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                 </div>
              </NeoCard>
           </div>

           {/* ── Retrieval Pointer & Economic Deck ── */}
           <div className="space-y-12">
              {/* Receiver Info */}
              <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-12 -translate-y-12">
                    <MapPin size={48} />
                 </div>
                 <h4 className="font-neo font-black text-xs uppercase tracking-[0.4em] text-sd-gold italic mb-10 flex items-center gap-3">
                    Retrieval Node
                 </h4>
                 <div className="space-y-6">
                    <p className="font-neo font-black text-3xl uppercase italic text-black leading-tight border-b-2 border-black pb-4">{order?.shipping_address.name}</p>
                    <div className="space-y-1 pt-2">
                       <p className="font-neo font-bold text-[11px] text-black/60 uppercase tracking-tighter italic">
                          {order?.shipping_address.address_line_1}
                       </p>
                       <p className="font-neo font-bold text-[11px] text-black/60 uppercase tracking-tighter italic">
                          {order?.shipping_address.city.toUpperCase()} NODE • BD
                       </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-3 border-t-2 border-black/5 mt-6">
                       <div className="flex items-center gap-3 text-black/40">
                          <Phone size={14} />
                          <span className="font-neo font-black text-[10px] tracking-widest">{order?.shipping_address.phone}</span>
                       </div>
                       {order?.shipping_address.email && (
                         <div className="flex items-center gap-3 text-black/40">
                            <Mail size={14} />
                            <span className="font-neo font-black text-[10px] tracking-widest lowercase">{order?.shipping_address.email}</span>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Economic Deck */}
              <div className="border-4 border-black bg-black p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.05] flex items-center justify-center -rotate-12 translate-x-12 -translate-y-12">
                    <Package size={48} />
                 </div>
                 <h4 className="font-neo font-black text-xs uppercase tracking-[0.4em] text-sd-gold italic mb-10">
                    Net Valuation
                 </h4>
                 <div className="space-y-8">
                    <div className="flex justify-between items-end">
                       <span className="font-neo font-black text-[9px] uppercase tracking-widest text-sd-gold/40 italic">Registry Total</span>
                       <span className="text-5xl font-neo font-black italic text-sd-gold leading-none">
                          ৳{Math.floor(order!.total_amount).toLocaleString()}
                       </span>
                    </div>
                    <div className="flex justify-between font-neo font-black text-[10px] uppercase tracking-widest text-sd-gold/20 italic">
                       <span>Unit Count</span>
                       <span className="text-sd-gold/60">{(order?.items || []).length} OBJECTS</span>
                    </div>
                    <div className="pt-6 border-t border-sd-gold/10">
                       <span className="font-neo font-black text-[8px] uppercase tracking-widest text-sd-gold/40 italic block mb-3">Audit Protocol</span>
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${order?.payment_status === 'paid' ? 'bg-green-500' : 'bg-sd-gold'}`} />
                          <span className="font-neo font-black text-[10px] uppercase tracking-[0.3em] text-sd-gold">{order?.payment_status} via {order?.payment_method.replace('_', ' ')}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── Operational Deck Footer ── */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
           <NeoButton 
              variant="primary"
              className="px-20 py-8 text-lg italic uppercase group bg-black text-sd-gold w-full md:w-auto"
              onClick={() => router.push('/e-commerce')}
           >
              Continue Acquisition <ArrowRight size={24} className="ml-4 group-hover:translate-x-3 transition-transform" />
           </NeoButton>
           
           <NeoButton 
              variant="outline"
              className="px-20 py-8 text-lg italic uppercase w-full md:w-auto"
              onClick={() => router.push(`/e-commerce/order-confirmation/${order?.order_number}`)}
           >
              Legacy Registry Link
           </NeoButton>
        </div>

        <div className="mt-40 pt-20 border-t-4 border-black text-center">
            <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30 italic">Errum Digital Registry Systems • Displacement Monitor • MMXXVI</p>
        </div>
      </div>
    </div>
  );
}