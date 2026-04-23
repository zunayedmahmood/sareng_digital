'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Filter, ArrowRight, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import MyAccountShell from '@/components/ecommerce/my-account/MyAccountShell';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import checkoutService, { Order } from '@/services/checkoutService';

export default function MyAccountOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await checkoutService.getOrders({
        per_page: 15,
        status: status || undefined,
        search: search || undefined,
      } as any);
      setOrders((data as any).orders || []);
    } catch (e: any) {
      setError('DECODING ERROR: FAILED TO RETRIEVE ASSET LOGS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusStyle = (s: string) => {
    const status = (s || 'pending').toLowerCase();
    switch(status) {
      case 'delivered':
        return 'bg-green-500 text-white border-black';
      case 'shipped':
        return 'bg-sd-gold text-black border-black';
      case 'processing':
        return 'bg-sd-gold text-black border-black';
      case 'cancelled':
        return 'bg-red-500 text-white border-black';
      default:
        return 'bg-white text-black border-black';
    }
  };

  const getStatusIcon = (s: string) => {
    const status = (s || 'pending').toLowerCase();
    switch(status) {
      case 'delivered': return <CheckCircle size={18} strokeWidth={3} />;
      case 'shipped': return <Truck size={18} strokeWidth={3} />;
      case 'processing': return <Package size={18} strokeWidth={3} />;
      case 'cancelled': return <XCircle size={18} strokeWidth={3} />;
      default: return <Clock size={18} strokeWidth={3} />;
    }
  };

  return (
    <MyAccountShell
      title="Asset Registry"
      subtitle="Comprehensive history of all hardware procurement protocols and displacement statuses."
    >
      {/* ── Deck Control ── */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12 items-stretch">
        <div className="flex-1 relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-sd-gold transition-colors">
             <Search size={24} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="PROTOCOL ID SEARCH..."
            className="w-full bg-white border-4 border-black px-16 py-5 font-neo font-black text-lg focus:outline-none focus:bg-white transition-all placeholder:text-black/10 shadow-[6px_6px_0_0_rgba(0,0,0,1)] focus:translate-y-[-2px] focus:translate-x-[-2px] focus:shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
          />
        </div>

        <div className="lg:w-72 relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 pointer-events-none">
             <Filter size={20} />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border-4 border-black px-16 py-5 font-neo font-black text-xs uppercase tracking-widest appearance-none focus:outline-none shadow-[6px_6px_0_0_rgba(0,0,0,1)] cursor-pointer"
          >
            <option value="">Status: ALL</option>
            <option value="pending">PENDING</option>
            <option value="processing">PROCESSING</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
        </div>

        <NeoButton 
          variant="primary" 
          className="px-12 h-[72px] uppercase italic text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
          onClick={load}
        >
          Execute
        </NeoButton>
      </div>

      {error && (
        <div className="mb-12 border-4 border-black bg-red-500 p-6 flex items-start gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
           <XCircle className="text-white flex-shrink-0 mt-0.5" size={20} strokeWidth={3} />
           <p className="font-neo font-black text-[11px] uppercase tracking-widest text-white leading-relaxed">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 w-full border-4 border-black bg-black/5 animate-pulse shadow-[12px_12px_0_0_rgba(0,0,0,1)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {orders.map((o) => {
            const statusLabel = (o.status || 'pending').toUpperCase();
            return (
              <NeoCard 
                key={o.order_number} 
                variant="white" 
                className="border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all group"
              >
                <div className="p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-8 border-b-4 border-black/5">
                    <div>
                      <span className="font-neo font-black text-[9px] uppercase tracking-[0.4em] text-black/30 italic block mb-2">Protocol ID</span>
                      <h3 className="text-3xl font-neo font-black text-black uppercase italic tracking-tighter">ORD-{o.order_number}</h3>
                      <p className="font-neo font-bold text-[10px] text-sd-gold uppercase tracking-widest mt-2 italic">
                        {new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: 'full' }).toUpperCase()}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div className={`px-6 py-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-neo font-black text-[11px] uppercase tracking-widest italic flex items-center gap-3 ${getStatusStyle(o.status)}`}>
                        {getStatusIcon(o.status)}
                        {statusLabel}
                      </div>
                      <Link
                        href={`/e-commerce/my-account/orders/${o.order_number}`}
                        className="w-14 h-14 border-4 border-black bg-black text-sd-gold flex items-center justify-center hover:bg-sd-gold hover:text-black transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                      >
                        <ArrowRight size={24} />
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
                    <div className="md:col-span-2 flex flex-wrap gap-12">
                       <div className="space-y-2">
                          <span className="font-neo font-black text-[8px] uppercase tracking-widest text-black/40 italic block">Valuation</span>
                          <span className="text-4xl font-neo font-black text-black italic leading-none">৳{Number(o.total_amount).toLocaleString()}</span>
                       </div>
                       <div className="space-y-2 border-l-4 border-black/5 pl-8">
                          <span className="font-neo font-black text-[8px] uppercase tracking-widest text-black/40 italic block">Units</span>
                          <span className="text-2xl font-neo font-black text-black italic">{o.items_count || 0} OBJECTS</span>
                       </div>
                       <div className="space-y-2 border-l-4 border-black/5 pl-8">
                          <span className="font-neo font-black text-[8px] uppercase tracking-widest text-black/40 italic block">Settlement</span>
                          <span className="font-neo font-black text-[10px] uppercase tracking-widest text-sd-gold italic">{o.payment_status?.toUpperCase()} via {o.payment_method?.toUpperCase()}</span>
                       </div>
                    </div>
                    
                    <div className="text-right">
                       <Link
                         href={`/e-commerce/order-tracking/${o.order_number}`}
                         className="font-neo font-black text-[9px] uppercase tracking-[0.3em] text-black/40 hover:text-black border-b-2 border-black/10 hover:border-black py-1 transition-all"
                       >
                         Initialize Tracking Protocol
                       </Link>
                    </div>
                  </div>
                </div>
              </NeoCard>
            );
          })}

          {!orders.length && (
            <div className="text-center py-40 border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-12 -translate-y-12">
                 <ShoppingBag size={100} />
              </div>
              <ShoppingBag className="mx-auto mb-10 text-black/10" size={64} />
              <h3 className="font-neo font-black text-3xl uppercase italic mb-6">Ledger Empty</h3>
              <p className="font-neo font-bold text-[11px] uppercase tracking-widest text-black/40 mb-12">No historical displacement logs found in current registry.</p>
              <NeoButton 
                variant="primary" 
                className="px-20 py-5 text-lg uppercase italic"
                onClick={() => router.push('/e-commerce')}
              >
                Start Procurement
              </NeoButton>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-40 pt-20 border-t-4 border-black text-center">
          <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30 italic">Errum Digital Record Systems • Archive Deck 01 • MMXXVI</p>
      </div>
    </MyAccountShell>
  );
}
