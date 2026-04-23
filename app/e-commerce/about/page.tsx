'use client';

import React from 'react';
import Navigation from '@/components/ecommerce/Navigation';
import Link from 'next/link';
import { Shield, Target, Zap, Users, MapPin, Phone, ArrowRight, History } from 'lucide-react';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';

const STORES = [
  { name: 'Node 01: MIRPUR', address: 'Level 3, Hazi Kujrat Ali Mollah Market, Mirpur 12', phone: '01942565664' },
  { name: 'Node 02: JAMUNA', address: '3C-17A, Level 3, Jamuna Future Park', phone: '01307130535' },
  { name: 'Node 03: BASHUNDHARA', address: '38, 39, 40, Block D, Level 5, Bashundhara City', phone: '01336041064' },
];

const CORE_PROTOCOLS = [
  { icon: Shield, title: 'HARDENED QUALITY', desc: 'Every artifact is stress-tested for mechanical integrity and material excellence. Zero failure tolerance.' },
  { icon: Target, title: 'AUTHENTIC SOURCE', desc: 'Direct procurement from verified origin nodes. No proxies. No counterfeits. Pure hardware.' },
  { icon: Zap, title: 'RAPID DEPLOYMENT', desc: 'Nationwide logistics network optimized for zero-latency hardware delivery across the territory.' },
  { icon: Users, title: 'OPERATOR SUPPORT', desc: 'Direct comms with archive specialists for hardware inquiries and displacement resolutions.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-sd-ivory text-black selection:bg-sd-gold selection:text-black">
      <Navigation />

      {/* ── Cinematic Hero ── */}
      <section className="relative pt-40 pb-32 border-b-8 border-black overflow-hidden">
        <div className="absolute inset-0 bg-sd-gold/5 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-black/[0.02] -skew-x-12 translate-x-32" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="inline-block bg-black text-sd-gold px-6 py-2 font-neo font-black text-xs uppercase tracking-[0.5em] italic mb-10 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
             System Manifest
          </div>
          <h1 className="text-[clamp(60px,12vw,160px)] font-neo font-black leading-[0.8] uppercase tracking-tighter italic mb-12">
            The<br />
            <span className="text-sd-gold">Archive.</span>
          </h1>
          <p className="max-w-2xl font-neo font-bold text-lg md:text-2xl uppercase italic leading-tight text-black/80">
            Sareng Digital is the primary procurement node for high-spec hardware, apparel, and tactical lifestyle artifacts within the territory.
          </p>
          
          <div className="mt-16 flex flex-wrap gap-8">
             <Link href="/e-commerce/products">
                <NeoButton variant="primary" className="px-16 py-6 text-xl uppercase italic shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                   Access Catalog
                </NeoButton>
             </Link>
             <div className="flex items-center gap-6 border-4 border-black bg-white px-8 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <History className="text-sd-gold" size={32} />
                <span className="font-neo font-black text-xs uppercase tracking-widest leading-none">Established<br/>MMXXVI</span>
             </div>
          </div>
        </div>
      </section>

      {/* ── Operational Protocols ── */}
      <section className="py-32 border-b-8 border-black bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24 pb-12 border-b-4 border-black">
             <div className="max-w-xl">
                <span className="font-neo font-black text-sd-gold text-sm uppercase tracking-widest italic block mb-4">Core Procedures</span>
                <h2 className="text-5xl md:text-7xl font-neo font-black uppercase italic tracking-tighter leading-none">Operational Standards.</h2>
             </div>
             <p className="max-w-xs font-neo font-bold text-xs uppercase tracking-widest text-black/40 italic leading-relaxed">
                Adhering to strict hardware acquisition and displacement protocols to ensure total registry integrity.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
             {CORE_PROTOCOLS.map((p, i) => (
                <NeoCard key={i} variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] group hover:translate-y-[-8px] transition-all">
                   <div className="w-16 h-16 border-4 border-black bg-sd-ivory flex items-center justify-center mb-8 group-hover:bg-sd-gold transition-colors">
                      <p.icon size={32} strokeWidth={3} />
                   </div>
                   <h3 className="text-xl font-neo font-black uppercase italic tracking-tight mb-4">{p.title}</h3>
                   <p className="font-neo font-bold text-[11px] uppercase tracking-widest text-black/60 leading-relaxed italic">{p.desc}</p>
                </NeoCard>
             ))}
          </div>
        </div>
      </section>

      {/* ── Historical Log ── */}
      <section className="py-32 border-b-8 border-black overflow-hidden relative">
        <div className="absolute top-1/2 left-0 w-full h-[600px] bg-black/[0.03] -rotate-6 translate-y-[-50%]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
             <div>
                <span className="font-neo font-black text-sd-gold text-sm uppercase tracking-widest italic block mb-6">Archive Origin</span>
                <h2 className="text-6xl md:text-8xl font-neo font-black uppercase italic tracking-tighter leading-[0.85] mb-12">
                  Built In Dhaka,<br />
                  <span className="text-sd-gold">Engineered Better.</span>
                </h2>
                <div className="space-y-8">
                   <p className="font-neo font-bold text-lg uppercase italic leading-relaxed text-black/80">
                      Errum was initialized in MMXX based on a single directive: disrupt the proxy-market by providing direct, high-spec hardware to the territory.
                   </p>
                   <p className="font-neo font-black text-xs uppercase tracking-widest leading-relaxed text-black/40 border-l-4 border-sd-gold pl-6">
                      What began as a singular procurement node in Mirpur has evolved into a multi-sector operation trusted by over 10,000 specialists across the region.
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                {[
                  { val: 'MMXX', lbl: 'Foundation' },
                  { val: '03', lbl: 'Active Nodes' },
                  { val: '500+', lbl: 'Artifact Types' },
                  { val: '10K+', lbl: 'Registered Ops' },
                ].map((stat, i) => (
                  <NeoCard key={i} variant="white" className="p-10 border-4 border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] text-center group bg-sd-ivory/50">
                     <div className="text-5xl font-neo font-black text-black uppercase italic group-hover:scale-110 transition-transform mb-2">
                        {stat.val}
                     </div>
                     <div className="font-neo font-black text-[9px] uppercase tracking-[0.4em] text-sd-gold italic">
                        {stat.lbl}
                     </div>
                  </NeoCard>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* ── Active Nodes ── */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto mb-20">
             <span className="font-neo font-black text-sd-gold text-sm uppercase tracking-[0.5em] italic block mb-6">Physical Infrastructure</span>
             <h2 className="text-6xl md:text-8xl font-neo font-black uppercase italic tracking-tighter leading-none mb-8">Base Locations.</h2>
             <p className="font-neo font-bold text-xs uppercase tracking-[0.3em] text-sd-gold/60 italic">Access hardware directly at these secure procurement sites.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {STORES.map((node, i) => (
                <NeoCard key={i} variant="white" className="bg-transparent border-4 border-sd-gold/30 hover:border-sd-gold p-12 group transition-all text-left relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-sd-gold/[0.05] flex items-center justify-center -rotate-12 translate-x-8 -translate-y-8">
                      <MapPin size={40} className="text-sd-gold" />
                   </div>
                   <h3 className="text-2xl font-neo font-black text-sd-gold uppercase italic tracking-tight mb-8 pb-4 border-b-2 border-sd-gold/20">{node.name}</h3>
                   <div className="space-y-6">
                      <div className="flex items-start gap-4">
                         <MapPin size={20} className="text-sd-gold mt-1 flex-shrink-0" />
                         <span className="font-neo font-black text-[10px] uppercase tracking-widest leading-loose text-sd-ivory/70">{node.address}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <Phone size={20} className="text-sd-gold flex-shrink-0" />
                         <span className="font-neo font-black text-[10px] uppercase tracking-widest text-sd-ivory/70">{node.phone}</span>
                      </div>
                   </div>
                </NeoCard>
             ))}
          </div>
          
          <div className="mt-32 pt-20 border-t-4 border-sd-gold/10 inline-block">
             <p className="font-neo font-black text-[10px] uppercase tracking-[1em] text-sd-gold italic">Errum Digital Record Systems • The Archive • MMXXVI</p>
          </div>
        </div>
      </section>
      
      {/* ── Footer Link ── */}
      <section className="bg-sd-gold py-20 border-t-8 border-black">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
            <h2 className="text-4xl font-neo font-black uppercase italic tracking-tighter">Initialize Transmission Pool</h2>
            <Link href="/e-commerce/contact">
               <NeoButton variant="primary" className="bg-black text-sd-gold px-12 py-5 text-lg shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  Engage Comms <ArrowRight className="ml-4" />
               </NeoButton>
            </Link>
         </div>
      </section>
    </div>
  );
}
