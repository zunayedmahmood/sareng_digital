'use client';

import React from 'react';
import Navigation from '@/components/ecommerce/Navigation';
import { Phone, MapPin, MessageCircle, Clock, ChevronRight, Send, HelpCircle, Mail } from 'lucide-react';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';

const locations = [
  { title: "NODE 01: MIRPUR", address: "Level 3, Hazi Kujrat Ali Mollah Market, Mirpur 12", phone: "01942565664" },
  { title: "NODE 02: JAMUNA", address: "3C-17A, Level 3, Jamuna Future Park", phone: "01307130535" },
  { title: "NODE 03: BASHUNDHARA", address: "38, 39, 40, Block D, Level 5, Bashundhara City", phone: "01336041064" },
];

export default function ContactPage() {
  const inputClass = "w-full bg-sd-ivory border-4 border-black px-6 py-4 font-neo font-black text-xs uppercase tracking-widest focus:outline-none focus:bg-white transition-all placeholder:text-black/10 shadow-[6px_6px_0_0_rgba(0,0,0,1)] focus:translate-y-[-2px] focus:translate-x-[-2px] focus:shadow-[8px_8px_0_0_rgba(0,0,0,1)]";
  const labelClass = "font-neo font-black text-[9px] uppercase tracking-[0.4em] text-black/40 mb-3 block italic";

  return (
    <div className="min-h-screen bg-sd-ivory text-black selection:bg-sd-gold selection:text-black">
      <Navigation />

      {/* ── Header ── */}
      <section className="relative pt-40 pb-32 border-b-8 border-black">
        <div className="container mx-auto px-6 relative z-10">
          <div className="inline-block bg-sd-gold text-black px-6 py-2 font-neo font-black text-xs uppercase tracking-[0.5em] italic mb-10 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
             Comms Protocol
          </div>
          <h1 className="text-[clamp(60px,10vw,140px)] font-neo font-black leading-[0.8] uppercase tracking-tighter italic mb-12">
            Transmission<br />
            <span className="text-sd-gold">Pool.</span>
          </h1>
          <p className="max-w-2xl font-neo font-bold text-lg md:text-2xl uppercase italic leading-tight text-black/80">
            Establish direct comms with archive specialists via synchronized channels or physical node visitation.
          </p>
        </div>
      </section>

      {/* ── Main Contact Grid ── */}
      <section className="py-24 border-b-8 border-black bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* ── Comms Form ── */}
            <div className="lg:col-span-2">
               <NeoCard variant="white" className="p-12 border-4 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative overflow-hidden bg-sd-ivory/30">
                  <div className="mb-12 pb-6 border-b-4 border-black flex items-center gap-6">
                     <div className="w-12 h-12 bg-black text-sd-gold flex items-center justify-center">
                        <Send size={20} strokeWidth={3} />
                     </div>
                     <h2 className="text-3xl font-neo font-black uppercase italic tracking-tighter">Initialize Transmission</h2>
                  </div>

                  <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                           <label className={labelClass}>Operator Identifier</label>
                           <input className={inputClass} placeholder="NAME / CALLSIGN" />
                        </div>
                        <div>
                           <label className={labelClass}>Security Hook / Email</label>
                           <input className={inputClass} placeholder="EMAIL@PROTOCOL.COM" />
                        </div>
                     </div>
                     <div>
                        <label className={labelClass}>Inquiry Sector</label>
                        <select className={inputClass}>
                           <option>PROCUREMENT INQUIRY</option>
                           <option>DISPLACEMENT ERROR</option>
                           <option>HARDENED SUPPORT</option>
                           <option>REGISTRY ACCESS ISSUE</option>
                        </select>
                     </div>
                     <div>
                        <label className={labelClass}>Transmission Payload</label>
                        <textarea className={`${inputClass} min-h-[200px] resize-none`} placeholder="ENTER DETAILED LOG DATA..." />
                     </div>
                     <NeoButton variant="primary" className="w-full py-6 text-xl uppercase italic shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                        Execute Transmission
                     </NeoButton>
                  </form>
               </NeoCard>
            </div>

            {/* ── Sidebar Comms ── */}
            <div className="lg:col-span-1 space-y-12">
               <NeoCard variant="black" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] text-sd-gold">
                  <div className="mb-8 pb-4 border-b-2 border-sd-gold/20 flex items-center gap-4">
                     <HelpCircle size={24} />
                     <h3 className="text-xl font-neo font-black uppercase italic">Direct Sync</h3>
                  </div>
                  <div className="space-y-10">
                     <a href="https://wa.me/8801942565664" target="_blank" className="block group">
                        <span className={labelClass + " text-sd-gold/40"}>WhatsApp Secure</span>
                        <div className="flex items-center justify-between">
                           <span className="font-neo font-black text-2xl uppercase italic group-hover:translate-x-2 transition-transform tracking-tight">ENGAGE CHAT</span>
                           <MessageCircle size={24} className="group-hover:scale-125 transition-transform" />
                        </div>
                     </a>
                     <a href="tel:01942565664" className="block group">
                        <span className={labelClass + " text-sd-gold/40"}>Comm Line</span>
                        <div className="flex items-center justify-between">
                           <span className="font-neo font-black text-2xl uppercase italic group-hover:translate-x-2 transition-transform tracking-tight">+880 1942 565664</span>
                           <Phone size={24} className="group-hover:scale-125 transition-transform" />
                        </div>
                     </a>
                     <div className="block">
                        <span className={labelClass + " text-sd-gold/40"}>Operational Window</span>
                        <div className="flex items-start gap-4">
                           <Clock size={20} className="mt-1 flex-shrink-0" />
                           <p className="font-neo font-bold text-xs uppercase tracking-widest leading-relaxed">
                              SAT – THU: 10AM – 9PM<br/>
                              FRI: 2PM – 9PM (Sector Delay)
                           </p>
                        </div>
                     </div>
                  </div>
               </NeoCard>

               <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-sd-gold">
                  <div className="mb-6 flex items-center gap-4">
                     <Mail size={24} />
                     <h3 className="text-xl font-neo font-black uppercase italic">Hardware Desk</h3>
                  </div>
                  <p className="font-neo font-bold text-xs uppercase tracking-widest leading-relaxed mb-6">
                     For complex architectural inquiries or fleet procurement protocols:
                  </p>
                  <span className="font-neo font-black text-lg block border-b-4 border-black pb-2 italic uppercase">support@errum.com</span>
               </NeoCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── Procurement Nodes ── */}
      <section className="py-24 bg-sd-ivory">
         <div className="container mx-auto px-6">
            <div className="mb-16 flex items-center gap-6">
               <div className="h-4 w-24 bg-black" />
               <h2 className="text-4xl font-neo font-black uppercase italic tracking-tighter">Physical Nodes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {locations.map((loc, i) => (
                  <NeoCard key={i} variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden group hover:translate-y-[-4px] transition-all">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-8 -translate-y-8">
                        <MapPin size={40} />
                     </div>
                     <h3 className="text-2xl font-neo font-black uppercase italic tracking-tight mb-8 pb-4 border-b-4 border-black/5">{loc.title}</h3>
                     <div className="space-y-6">
                        <div className="flex items-start gap-4">
                           <MapPin size={18} className="text-sd-gold mt-1 flex-shrink-0" />
                           <span className="font-neo font-bold text-[10px] uppercase tracking-widest leading-loose text-black/60">{loc.address}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <Phone size={18} className="text-sd-gold flex-shrink-0" />
                           <span className="font-neo font-bold text-[10px] uppercase tracking-widest text-black/60">{loc.phone}</span>
                        </div>
                     </div>
                     <a href={`tel:${loc.phone}`} className="mt-10 w-full flex items-center justify-between border-4 border-black px-6 py-3 font-neo font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        Initialize Contact <ChevronRight size={16} />
                     </a>
                  </NeoCard>
               ))}
            </div>
         </div>
      </section>
      
      <div className="py-20 border-t-8 border-black text-center bg-white">
          <p className="font-neo font-black text-[10px] uppercase tracking-[1em] text-black/30 italic">Errum Digital Record Systems • Transmission Protocol • MMXXVI</p>
      </div>
    </div>
  );
}
