'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import cartService from '@/services/cartService';
import Link from 'next/link';
import Navigation from '@/components/ecommerce/Navigation';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';

export default function LoginRegisterPage() {
  const router = useRouter();
  const { login, register, isAuthenticated } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName,            setRegisterName]            = useState('');
  const [registerEmail,           setRegisterEmail]           = useState('');
  const [registerPhone,           setRegisterPhone]           = useState('');
  const [registerPassword,        setRegisterPassword]        = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const [alert,     setAlert]     = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    if (isAuthenticated) router.replace('/e-commerce/my-account'); 
  }, [isAuthenticated, router]);

  const showAlert = (type: string, message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return showAlert('error', 'PROTOCOL ERROR: CREDENTIALS REQUIRED');
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      try {
        const guestCart = await cartService.getCart();
        if (guestCart?.items?.length) await cartService.mergeGuestCart();
      } catch {}
      showAlert('success', 'ACCESS GRANTED: WELCOME BACK');
      setTimeout(() => router.push('/e-commerce'), 800);
    } catch (err: any) {
      showAlert('error', err?.message || 'AUTHENTICATION FAILED: INVALID CREDENTIALS');
    } finally { setIsLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) return showAlert('error', 'PROTOCOL ERROR: PARAMETERS MISSING');
    if (registerPassword !== registerConfirmPassword) return showAlert('error', 'VALIDATION ERROR: PASSWORD MISMATCH');
    if (registerPassword.length < 8) return showAlert('error', 'VALIDATION ERROR: MINIMUM CHARACTER LIMIT NOT MET');
    setIsLoading(true);
    try {
      await register(registerName, registerEmail, registerPhone, registerPassword, registerConfirmPassword);
      showAlert('success', 'REGISTRY INITIALIZED: ACCOUNT CREATED');
      setTimeout(() => router.push('/e-commerce'), 800);
    } catch (err: any) {
      showAlert('error', err?.message || 'REGISTRATION FAILED: PROTOCOL REJECTED');
    } finally { setIsLoading(false); }
  };

  const inputClass = "w-full bg-sd-ivory border-4 border-black px-6 py-4 font-neo font-black text-lg focus:outline-none focus:bg-white transition-all placeholder:text-black/10 selection:bg-sd-gold selection:text-black";
  const labelClass = "font-neo font-black text-[10px] uppercase tracking-widest text-black/40 mb-2 block italic";

  return (
    <div className="min-h-screen bg-sd-ivory pb-40 selection:bg-sd-gold selection:text-black">
      <Navigation />
      
      <div className="container mx-auto px-6 lg:px-12 pt-40 flex flex-col lg:flex-row gap-20 items-center justify-center min-h-[80vh]">
        
        {/* ── Visual Anchor ── */}
        <div className="hidden lg:block flex-1 max-w-xl">
           <span className="font-neo font-black text-[10px] uppercase tracking-[0.6em] text-sd-gold italic block mb-8">Registry Access Portal</span>
           <h1 className="text-8xl font-neo font-black text-black uppercase italic leading-[0.8] tracking-tighter mb-12">
              Secure <br/> Gateway
           </h1>
           <div className="space-y-6 border-l-4 border-black pl-8">
              <p className="font-neo font-bold text-sm text-black/60 uppercase tracking-widest leading-loose">
                 Authorize displacement and acquisition parameters through the central registry interface.
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-1 border-t-2 border-black" />
                 <span className="font-neo font-black text-[9px] uppercase tracking-[0.3em] text-black">Protocol v2.4.0</span>
              </div>
           </div>
        </div>

        {/* ── Auth Monument ── */}
        <div className="w-full max-w-xl">
          <NeoCard variant="white" className="p-12 border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-black" />
             
             {/* Tab Switcher */}
             <div className="flex border-4 border-black mb-12 overflow-hidden bg-black">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-4 font-neo font-black text-xs uppercase tracking-widest italic transition-all ${
                    activeTab === 'login' ? 'bg-sd-gold text-black' : 'bg-black text-sd-gold/40 hover:text-sd-gold/60'
                  }`}
                >
                  Authorize Access
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-4 font-neo font-black text-xs uppercase tracking-widest italic transition-all ${
                    activeTab === 'register' ? 'bg-sd-gold text-black' : 'bg-black text-sd-gold/40 hover:text-sd-gold/60'
                  }`}
                >
                  Create Identity
                </button>
             </div>

             {/* Alerts */}
             {alert.show && (
                <div className={`mb-8 border-4 border-black p-6 flex items-start gap-4 ${
                  alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}>
                   <AlertCircle className="text-white flex-shrink-0 mt-0.5" size={20} strokeWidth={3} />
                   <p className="font-neo font-black text-[11px] uppercase tracking-widest text-white leading-relaxed">{alert.message}</p>
                </div>
             )}

             {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-8">
                   <div>
                      <label className={labelClass}>Registry Email</label>
                      <input 
                        type="email" 
                        value={loginEmail} 
                        onChange={e => setLoginEmail(e.target.value)} 
                        placeholder="IDENTIFIER@REGISTRY.COM" 
                        className={inputClass} 
                      />
                   </div>
                   <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className={labelClass}>Access Key</label>
                        <button type="button" className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40 hover:text-sd-gold mb-2 italic">Lost Key?</button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          value={loginPassword} 
                          onChange={e => setLoginPassword(e.target.value)} 
                          placeholder="••••••••••••" 
                          className={inputClass} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(v => !v)} 
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} strokeWidth={3} /> : <Eye size={20} strokeWidth={3} />}
                        </button>
                      </div>
                   </div>
                   <NeoButton 
                     type="submit" 
                     variant="primary" 
                     disabled={isLoading} 
                     className="w-full py-6 text-xl italic uppercase group"
                   >
                     {isLoading ? 'Synchronizing...' : 'Finalize Authorization'}
                     <CheckCircle size={24} className="ml-4 group-hover:rotate-12 transition-transform" />
                   </NeoButton>
                </form>
             ) : (
               <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Identity Name</label>
                        <input type="text" value={registerName} onChange={e => setRegisterName(e.target.value)} placeholder="LEGAL NAME" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Comms Line</label>
                        <input type="tel" value={registerPhone} onChange={e => setRegisterPhone(e.target.value)} placeholder="+880..." className={inputClass} />
                    </div>
                  </div>
                  <div>
                      <label className={labelClass}>Primary Email</label>
                      <input type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="IDENTIFIER@REGISTRY.COM" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Key Generation</label>
                        <input type={showPassword ? 'text' : 'password'} value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Confirm Key</label>
                        <input type={showConfirmPassword ? 'text' : 'password'} value={registerConfirmPassword} onChange={e => setRegisterConfirmPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                    </div>
                  </div>
                  <NeoButton 
                    type="submit" 
                    variant="primary" 
                    disabled={isLoading} 
                    className="w-full py-6 text-xl italic uppercase group mt-6"
                  >
                    {isLoading ? 'Creating Registry...' : 'Initialize Identity'}
                    <CheckCircle size={24} className="ml-4 group-hover:rotate-12 transition-transform" />
                  </NeoButton>
               </form>
             )}
          </NeoCard>
          
          <div className="mt-12 text-center">
             <Link href="/e-commerce" className="font-neo font-black text-[11px] uppercase tracking-[0.4em] text-black/40 hover:text-black flex items-center justify-center gap-3 transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Return to Hardware Discovery
             </Link>
          </div>
        </div>

      </div>

      <div className="mt-40 pt-20 border-t-4 border-black text-center">
          <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30 italic">Errum Digital Identity Services • Gateway Alpha • MMXXVI</p>
      </div>
    </div>
  );
}
