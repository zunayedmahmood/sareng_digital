'use client';

import React, { useEffect, useState } from 'react';
import MyAccountShell from '@/components/ecommerce/my-account/MyAccountShell';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import customerProfileService, { CustomerProfile } from '@/services/customerProfileService';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { User, Lock, Shield, Key, AlertCircle, CheckCircle } from 'lucide-react';

export default function MyAccountDetailsPage() {
  const { changePassword } = useCustomerAuth();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [form, setForm] = useState<Partial<CustomerProfile>>({});

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  const load = async () => {
    setErr('');
    try {
      const p = await customerProfileService.getProfile();
      setProfile(p);
      setForm({
        name: p.name,
        phone: p.phone,
        date_of_birth: p.date_of_birth,
        gender: p.gender,
        address: p.address,
        city: p.city,
        state: p.state,
        postal_code: p.postal_code,
        country: p.country || 'Bangladesh',
      });
    } catch (e: any) {
      setErr('REGISTRY ERROR: FAILED TO RETRIEVE INTEL');
    }
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    setErr('');
    setMsg('');
    setIsLoading(true);
    try {
      const updated = await customerProfileService.updateProfile(form);
      setProfile(updated);
      setMsg('INTEL UPDATED: REGISTRY SYNCHRONIZED');
    } catch (e: any) {
      setErr('PROTOCOL ERROR: FAILED TO UPDATE INTEL');
    } finally { setIsLoading(false); }
  };

  const savePassword = async () => {
    setErr('');
    setMsg('');
    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword, newPasswordConfirmation);
      setMsg('KEY OVERRIDE SUCCESSFUL: PASSWORD ROTATED');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (e: any) {
      setErr('SECURITY ERROR: FAILED TO ROTATE PASSWORD');
    } finally { setIsLoading(false); }
  };

  const inputClass = "w-full bg-sd-ivory border-4 border-black px-4 py-3 font-neo font-black text-xs uppercase tracking-widest focus:outline-none focus:bg-white transition-all placeholder:text-black/10";
  const labelClass = "font-neo font-black text-[9px] uppercase tracking-widest text-black/40 mb-1 block italic";

  return (
    <MyAccountShell title="Operator Intel" subtitle="Update identity parameters and rotation security keys for registry access.">
      {err && (
        <div className="mb-8 border-4 border-black bg-red-500 p-6 flex items-start gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
           <AlertCircle className="text-white flex-shrink-0 mt-0.5" size={20} strokeWidth={3} />
           <p className="font-neo font-black text-[11px] uppercase tracking-widest text-white leading-relaxed">{err}</p>
        </div>
      )}
      {msg && (
        <div className="mb-8 border-4 border-black bg-green-500 p-6 flex items-start gap-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
           <CheckCircle className="text-white flex-shrink-0 mt-0.5" size={20} strokeWidth={3} />
           <p className="font-neo font-black text-[11px] uppercase tracking-widest text-white leading-relaxed">{msg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ── Identity Block ── */}
        <div className="lg:col-span-2">
           <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-12 -translate-y-12">
                 <User size={80} />
              </div>
              <div className="mb-10 pb-6 border-b-4 border-black flex items-center gap-4">
                 <Shield size={24} className="text-sd-gold" strokeWidth={3} />
                 <h2 className="text-2xl font-neo font-black text-black uppercase italic tracking-tighter">Primary Identity</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="md:col-span-2 bg-black/5 p-4 border-l-4 border-black mb-4">
                   <label className={labelClass}>Registry UUID / Email</label>
                   <span className="font-neo font-black text-lg text-black/40 italic">{profile?.email}</span>
                </div>

                <div>
                   <label className={labelClass}>Legal Name</label>
                   <input className={inputClass} value={form.name || ''} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
                </div>

                <div>
                   <label className={labelClass}>Comms Channel</label>
                   <input className={inputClass} value={form.phone || ''} onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))} />
                </div>

                <div className="md:col-span-2">
                   <label className={labelClass}>Primary Node Location</label>
                   <input className={inputClass} value={form.address || ''} onChange={(e) => setForm(s => ({ ...s, address: e.target.value }))} />
                </div>

                <div>
                   <label className={labelClass}>Sector / City</label>
                   <input className={inputClass} value={form.city || ''} onChange={(e) => setForm(s => ({ ...s, city: e.target.value }))} />
                </div>

                <div>
                   <label className={labelClass}>Territory / Country</label>
                   <input className={inputClass} value={form.country || ''} onChange={(e) => setForm(s => ({ ...s, country: e.target.value }))} />
                </div>
              </div>

              <NeoButton 
                variant="primary" 
                onClick={saveProfile}
                disabled={isLoading}
                className="w-full py-5 uppercase italic text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
              >
                {isLoading ? 'Synchronizing...' : 'Finalize Intel Update'}
              </NeoButton>
           </NeoCard>
        </div>

        {/* ── Security Key Block ── */}
        <div className="lg:col-span-1">
           <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden bg-sd-ivory">
              <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-8 -translate-y-8">
                 <Lock size={60} />
              </div>
              <div className="mb-10 pb-6 border-b-4 border-black flex items-center gap-4">
                 <Key size={24} className="text-sd-gold" strokeWidth={3} />
                 <h2 className="text-xl font-neo font-black text-black uppercase italic tracking-tighter">Key Rotation</h2>
              </div>

              <div className="space-y-6 mb-10">
                 <div>
                    <label className={labelClass}>Current Access Key</label>
                    <input type="password" className={inputClass} placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                 </div>
                 <div>
                    <label className={labelClass}>New Registry Key</label>
                    <input type="password" className={inputClass} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                 </div>
                 <div>
                    <label className={labelClass}>Confirm New Key</label>
                    <input type="password" className={inputClass} placeholder="••••••••" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} />
                 </div>
              </div>

              <NeoButton 
                variant="primary" 
                onClick={savePassword}
                disabled={isLoading}
                className="w-full py-5 uppercase italic text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
              >
                {isLoading ? 'Rotating...' : 'Execute Rotation'}
              </NeoButton>
           </NeoCard>

           <div className="mt-12 p-6 border-4 border-black bg-black text-sd-gold font-neo font-bold text-[9px] uppercase tracking-widest italic leading-relaxed">
              WARNING: Key rotation terminates all active sessions. Ensure secondary backup protocols are active.
           </div>
        </div>
      </div>
    </MyAccountShell>
  );
}
