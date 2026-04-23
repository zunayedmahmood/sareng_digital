'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Package,
  Search,
  AlertCircle,
  Phone as PhoneIcon,
  ArrowRight
} from 'lucide-react';
import Navigation from '@/components/ecommerce/Navigation';
import guestCheckoutService from '@/services/guestCheckoutService';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';

function cleanPhone(input: string) {
  return input.replace(/[^0-9+]/g, '');
}

function isValidBDPhone(input: string) {
  const cleaned = input.replace(/\D/g, '');
  return /^(?:880|0)?1[3-9]\d{8}$/.test(cleaned);
}


export default function OrderTrackingByPhonePage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<{ phone: string; name?: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !isValidBDPhone(phone)) {
      setError('INVALID INPUT: REQUIRE VALID BD PHONE PROTOCOL');
      return;
    }

    setLoading(true);
    try {
      const res: any = await guestCheckoutService.ordersByPhone(cleanPhone(phone));
      setCustomer(res?.data?.customer || null);
      setOrders(res?.data?.orders || []);
    } catch (err: any) {
      console.error('Failed to fetch guest orders:', err);
      setCustomer(null);
      setOrders([]);
      setError(err?.response?.data?.message || 'REGISTRY ERROR: NO ENTRIES FOUND');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('deliver')) return 'bg-black text-sd-gold border-black';
    if (s.includes('cancel')) return 'bg-red-500 text-white border-black';
    if (s.includes('ship')) return 'bg-sd-gold text-black border-black';
    return 'bg-white text-black border-black';
  };

  return (
    <div className="min-h-screen bg-sd-ivory pb-40 selection:bg-sd-gold selection:text-black">
      <Navigation />

      <div className="container mx-auto px-6 lg:px-12 pt-40">
        <div className="max-w-4xl mx-auto">
          {/* ── Search Module ── */}
          <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-10 -translate-y-10">
              <Search size={80} strokeWidth={1} />
            </div>

            <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12 relative z-10">
              <div>
                <span className="font-neo font-black text-[10px] uppercase tracking-[0.5em] text-sd-gold italic block mb-4">Registry Access Protocol</span>
                <h1 className="text-5xl font-neo font-black text-black uppercase italic leading-none tracking-tighter">Track Displacement</h1>
                <p className="font-neo font-bold text-[11px] text-black/40 uppercase tracking-widest mt-4">Enter authentication node (Phone) to reveal registry entries.</p>
              </div>
              <div className="w-20 h-20 border-4 border-black bg-black text-sd-gold flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <PhoneIcon size={32} />
              </div>
            </div>

            {error && (
              <div className="mb-10 border-4 border-black bg-red-500/10 p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="text-black flex-shrink-0 mt-0.5" size={24} strokeWidth={3} />
                <p className="font-neo font-black text-[11px] uppercase tracking-widest text-black">{error}</p>
              </div>
            )}

            <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-6 items-end relative z-10">
              <div className="flex-1 w-full group">
                <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 mb-3 block italic">Authentication Node (BD Phone)</label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-sd-ivory border-4 border-black px-8 py-5 font-neo font-black text-xl text-black focus:outline-none focus:bg-white focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all placeholder:text-black/10"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 group-focus-within:opacity-100 transition-opacity">
                    <Search size={24} />
                  </div>
                </div>
              </div>
              <NeoButton
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-12 py-6 text-xl group"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <span className="flex items-center gap-4 italic uppercase">Initialize Search <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></span>}
              </NeoButton>
            </form>
          </NeoCard>

          {/* ── Search Results ── */}
          {customer && (
            <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-[4px] bg-black" />
                <h2 className="font-neo font-black text-xs uppercase tracking-[0.5em] text-black italic">Found Entries</h2>
                <div className="flex-1 h-[4px] bg-black" />
              </div>

              <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between gap-4 mb-12 pb-8 border-b-4 border-black/5">
                  <div>
                    <h2 className="text-4xl font-neo font-black text-black uppercase italic leading-none">{customer?.name || 'Anonymous Protocol'}</h2>
                    <p className="font-neo font-bold text-[11px] text-black/40 uppercase tracking-[0.4em] mt-3 italic">Active Node: {customer.phone}</p>
                  </div>
                  <div className="w-16 h-16 border-4 border-black bg-sd-ivory text-black flex items-center justify-center">
                    <Package size={28} />
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="py-20 text-center border-4 border-dashed border-black/10">
                    <p className="font-neo font-black text-[12px] text-black/20 uppercase tracking-[0.5em] italic">NULL REFERENCES: ZERO DISPLACEMENTS LOGGED</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((o) => (
                      <div
                        key={o.order_id}
                        className="group relative border-4 border-black p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all bg-white"
                      >
                        <div className="min-w-0">
                          <p className="font-neo font-black text-2xl text-black uppercase italic leading-none mb-3">Order #{o.order_number}</p>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <span className="font-neo font-bold text-[10px] text-black/40 uppercase tracking-widest">{o.created_at}</span>
                            <span className="w-1 h-1 bg-black/20 rounded-full" />
                            <span className="font-neo font-bold text-[10px] text-black/40 uppercase tracking-widest">{o.items_count} DISPLACEMENT UNITS</span>
                            <span className="w-1 h-1 bg-black/20 rounded-full" />
                            <span className="font-neo font-black text-[13px] text-black uppercase">৳{Number(o.total_amount).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className={`font-neo font-black text-[10px] uppercase tracking-[0.4em] px-6 py-2 border-2 ${getStatusStyle(o.status)} italic`}>
                            {String(o.status || '').replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <Link
                            href={`/e-commerce/order-tracking/${o.order_number}`}
                            className="w-12 h-12 border-4 border-black bg-black text-sd-gold flex items-center justify-center hover:bg-sd-gold hover:text-black transition-colors"
                          >
                            <ArrowRight size={20} strokeWidth={3} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </NeoCard>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="mt-32 pt-20 border-t-4 border-black text-center">
            <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30 italic">Errum Digital Registry Systems • Displacement Monitor • MMXXVI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
