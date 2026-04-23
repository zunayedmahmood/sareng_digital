'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MyAccountShell from '@/components/ecommerce/my-account/MyAccountShell';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import { MapPin, Phone, User, Edit3, Trash2, CheckCircle, X, Plus } from 'lucide-react';
import checkoutService, { Address } from '@/services/checkoutService';

const emptyAddress: Address = {
  name: '',
  phone: '',
  email: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Bangladesh',
  landmark: '',
  delivery_instructions: '',
  type: 'both',
};

export default function MyAccountAddressesPage() {
  const [data, setData] = useState<{
    addresses: Address[];
    default_shipping: Address | null;
    default_billing: Address | null;
    total: number;
  } | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Address>(emptyAddress);

  const editingAddress = useMemo(() => {
    if (!editingId) return null;
    return data?.addresses?.find(a => a.id === editingId) || null;
  }, [editingId, data]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await checkoutService.getAddresses();
      setData(res);
    } catch (e: any) {
      setError('DECODING ERROR: FAILED TO RETRIEVE NODE REGISTRY');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setFormOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditingId(a.id || null);
    setForm({
      ...emptyAddress,
      ...a,
      country: a.country || 'Bangladesh',
      type: a.type || 'both',
    });
    setFormOpen(true);
  };

  const save = async () => {
    setError('');
    try {
      if (editingId) await checkoutService.updateAddress(editingId, form);
      else await checkoutService.createAddress(form as any);
      setFormOpen(false);
      await load();
    } catch (e: any) {
      setError('PROTOCOL ERROR: FAILED TO SYNCHRONIZE NODE');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('TERMINATE THIS NODE?')) return;
    setError('');
    try {
      await checkoutService.deleteAddress(id);
      await load();
    } catch (e: any) {
      setError('PROTOCOL ERROR: FAILED TO TERMINATE NODE');
    }
  };

  const setDefault = async (id: number, type: 'shipping' | 'billing') => {
    setError('');
    try {
      if (type === 'shipping') await checkoutService.setDefaultShipping(id);
      else await checkoutService.setDefaultBilling(id);
      await load();
    } catch (e: any) {
      setError('PROTOCOL ERROR: FAILED TO ASSIGN PRIMARY STATUS');
    }
  };

  const inputClass = "w-full bg-sd-ivory border-4 border-black px-4 py-3 font-neo font-black text-xs uppercase tracking-widest focus:outline-none focus:bg-white transition-all placeholder:text-black/10";
  const labelClass = "font-neo font-black text-[9px] uppercase tracking-widest text-black/40 mb-1 block italic";

  return (
    <MyAccountShell title="Retrieval Nodes" subtitle="Manage designated physical acquisition points and hardware drop-zones.">
      {error && (
        <div className="mb-12 border-4 border-black bg-red-500 p-6 flex items-start gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
           <X className="text-white flex-shrink-0 mt-0.5" size={20} strokeWidth={3} />
           <p className="font-neo font-black text-[11px] uppercase tracking-widest text-white leading-relaxed">{error}</p>
        </div>
      )}

      <NeoButton
        onClick={openCreate}
        variant="primary"
        className="mb-12 px-10 py-5 uppercase italic text-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)] group"
      >
        Initialize New Node <Plus size={24} className="ml-4 group-hover:rotate-90 transition-transform" />
      </NeoButton>

      {loading ? (
        <div className="space-y-12">
          {[1, 2].map(i => (
            <div key={i} className="h-64 w-full border-4 border-black bg-black/5 animate-pulse shadow-[12px_12px_0_0_rgba(0,0,0,1)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {(data?.addresses || []).map((a) => (
            <NeoCard key={a.id} variant="white" className="border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-8 -translate-y-8">
                  <MapPin size={60} />
               </div>
               
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-neo font-black text-black uppercase italic tracking-tighter">{a.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <Phone size={12} className="text-sd-gold" strokeWidth={3} />
                       <span className="font-neo font-bold text-[10px] text-black/40 tracking-widest">{a.phone}</span>
                    </div>
                  </div>
               </div>

               <div className="font-neo font-black text-[11px] text-black uppercase tracking-widest leading-loose mb-10 pb-8 border-b-4 border-black/5">
                  {a.address_line_1}{a.address_line_2 ? `, ${a.address_line_2}` : ''}<br />
                  {a.city}, {a.state} {a.postal_code}<br />
                  {a.country}
               </div>

               <div className="flex flex-wrap gap-4 mt-auto">
                 <button onClick={() => openEdit(a)} className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center text-black hover:bg-black hover:text-sd-gold transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                   <Edit3 size={18} strokeWidth={3} />
                 </button>
                 {a.id && (
                   <button onClick={() => remove(a.id!)} className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center text-red-500 hover:bg-black hover:text-red-500 transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
                     <Trash2 size={18} strokeWidth={3} />
                   </button>
                 )}
                 <div className="flex-1 flex gap-4">
                    <button onClick={() => setDefault(a.id!, 'shipping')} className={`flex-1 border-4 border-black px-4 py-2 font-neo font-black text-[9px] uppercase tracking-widest italic transition-all ${a.is_default_shipping ? 'bg-black text-sd-gold' : 'bg-white text-black/40 hover:text-black'}`}>
                       {a.is_default_shipping ? 'Primary Ship' : 'Set Ship'}
                    </button>
                    <button onClick={() => setDefault(a.id!, 'billing')} className={`flex-1 border-4 border-black px-4 py-2 font-neo font-black text-[9px] uppercase tracking-widest italic transition-all ${a.is_default_billing ? 'bg-black text-sd-gold' : 'bg-white text-black/40 hover:text-black'}`}>
                       {a.is_default_billing ? 'Primary Bill' : 'Set Bill'}
                    </button>
                 </div>
               </div>
            </NeoCard>
          ))}

          {!data?.addresses?.length && (
            <div className="md:col-span-2 text-center py-40 border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
               <MapPin className="mx-auto mb-10 text-black/10" size={64} />
               <h3 className="font-neo font-black text-3xl uppercase italic mb-6">No Retrieval Nodes</h3>
               <p className="font-neo font-bold text-[11px] uppercase tracking-widest text-black/40 mb-12">Initialize your first node location for hardware procurement.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Node Configuration UI ── */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[100] selection:bg-sd-gold selection:text-black">
          <NeoCard variant="white" className="w-full max-w-2xl border-4 border-black shadow-[24px_24px_0_0_rgba(0,0,0,1)] p-12 relative">
            <button onClick={() => setFormOpen(false)} className="absolute top-8 right-8 text-black/20 hover:text-black transition-colors">
               <X size={32} strokeWidth={3} />
            </button>
            
            <div className="mb-10 pb-6 border-b-4 border-black">
               <span className="font-neo font-black text-[10px] uppercase tracking-[0.5em] text-sd-gold italic block mb-4">Registry Override</span>
               <h2 className="text-4xl font-neo font-black text-black uppercase italic tracking-tighter">
                  {editingAddress ? 'Configure Node' : 'Initialize Node'}
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
               <div className="md:col-span-1">
                  <label className={labelClass}>Identifier Name</label>
                  <input className={inputClass} placeholder="HOME / ARCHIVE / LAB" value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
               </div>
               <div className="md:col-span-1">
                  <label className={labelClass}>Comms Channel</label>
                  <input className={inputClass} placeholder="+880..." value={form.phone} onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))} />
               </div>
               <div className="md:col-span-2">
                  <label className={labelClass}>Node Primary Location</label>
                  <input className={inputClass} placeholder="STREET, BUILDING, FLOOR" value={form.address_line_1} onChange={(e) => setForm(s => ({ ...s, address_line_1: e.target.value }))} />
               </div>
               <div className="md:col-span-2">
                  <label className={labelClass}>Secondary Coordinates (Optional)</label>
                  <input className={inputClass} placeholder="SUITE / APARTMENT" value={form.address_line_2 || ''} onChange={(e) => setForm(s => ({ ...s, address_line_2: e.target.value }))} />
               </div>
               <div>
                  <label className={labelClass}>Zone / City</label>
                  <input className={inputClass} placeholder="CITY" value={form.city} onChange={(e) => setForm(s => ({ ...s, city: e.target.value }))} />
               </div>
               <div>
                  <label className={labelClass}>Sector / State</label>
                  <input className={inputClass} placeholder="STATE" value={form.state} onChange={(e) => setForm(s => ({ ...s, state: e.target.value }))} />
               </div>
               <div>
                  <label className={labelClass}>Registry Pin</label>
                  <input className={inputClass} placeholder="POSTAL CODE" value={form.postal_code} onChange={(e) => setForm(s => ({ ...s, postal_code: e.target.value }))} />
               </div>
               <div>
                  <label className={labelClass}>Territory</label>
                  <input className={inputClass} placeholder="COUNTRY" value={form.country} onChange={(e) => setForm(s => ({ ...s, country: e.target.value }))} />
               </div>
            </div>

            <div className="flex gap-6">
              <NeoButton onClick={save} variant="primary" className="flex-1 py-6 text-xl italic uppercase">
                Finalize Node
              </NeoButton>
              <button 
                onClick={() => setFormOpen(false)} 
                className="px-10 border-4 border-black bg-white font-neo font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
              >
                Abort
              </button>
            </div>
          </NeoCard>
        </div>
      )}
      
      <div className="mt-40 pt-20 border-t-4 border-black text-center">
          <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30 italic">Errum Digital Record Systems • Node Protocol • MMXXVI</p>
      </div>
    </MyAccountShell>
  );
}
