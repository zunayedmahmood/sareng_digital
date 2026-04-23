'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter, MessageCircle, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoButton from './ui/NeoButton';
import NeoBadge from './ui/NeoBadge';
import NeoMarquee from './ui/NeoMarquee';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: 'Navigation',
      links: [
        { label: 'The Archive', href: '/e-commerce/products' },
        { label: 'Our Story', href: '/e-commerce/about' },
        { label: 'Contact', href: '/e-commerce/contact' },
        { label: 'Search', href: '/e-commerce/search' },
      ],
    },
    {
      title: 'Registry',
      links: [
        { label: 'Track Order', href: '/e-commerce/track-order' },
        { label: 'Wishlist', href: '/e-commerce/wishlist' },
        { label: 'Privacy', href: '/e-commerce/privacy' },
        { label: 'Terms', href: '/e-commerce/terms' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: 'support@sarengdigital.com', href: 'mailto:support@sarengdigital.com' },
        { label: '+880 1942 565664', href: 'tel:+8801942565664' },
        { label: 'WhatsApp Registry', href: 'https://wa.me/8801942565664' },
      ],
    },
  ];

  const trustItems = [
    <><ShieldCheck size={18} /> Verified Artifacts</>,
    <><Truck size={18} /> Priority Dispatch</>,
    <><RotateCcw size={18} /> 48h Registry Return</>,
    <><ShieldCheck size={18} /> Authentic Character</>,
  ];

  return (
    <footer className="bg-sd-ivory mt-20 border-t-8 border-black">
      {/* Trust Marquee */}
      <NeoMarquee items={trustItems} speed={30} variant="gold" className="neo-border-b-4 border-black" />

      <div className="container mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Brand Identity */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/e-commerce" className="inline-block">
              <NeoCard variant="white" className="p-4 sm:p-6 neo-shadow-md">
                <span className="font-neo font-black text-3xl sm:text-5xl text-black uppercase leading-none block">
                  Sareng <span className="text-sd-gold italic">Digital</span>
                </span>
                <span className="font-neo font-bold text-[10px] tracking-[0.4em] uppercase mt-2 block opacity-40">Archival Boutique</span>
              </NeoCard>
            </Link>
            
            <NeoCard variant="gold" className="p-6">
              <p className="font-neo font-bold text-lg leading-tight uppercase">
                Curating high-stakes character artifacts for the modern desktop registry.
              </p>
              <NeoButton variant="black" size="sm" className="mt-6">
                Join the Archive <ArrowRight size={16} />
              </NeoButton>
            </NeoCard>
          </div>

          {/* Links Grid */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="font-neo font-black text-xl uppercase tracking-tighter text-black">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="font-neo font-bold text-sm uppercase text-black/60 hover:text-black hover:translate-x-2 transition-all flex items-center gap-2 group"
                    >
                      <span className="w-2 h-2 bg-black scale-0 group-hover:scale-100 transition-transform" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="mt-20 pt-10 border-t-4 border-black flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-2 text-center md:text-left">
            <p className="font-neo font-black text-xs uppercase tracking-widest text-black">
              © {year} SARENG DIGITAL ARCHIVE.
            </p>
            <p className="font-neo font-bold text-[10px] uppercase text-black/30">
              All specimens subject to registry inspection.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {[Facebook, Instagram, Youtube, Twitter].map((Icon, idx) => (
              <a 
                key={idx} 
                href="#" 
                className="neo-border-2 p-3 bg-white neo-shadow-sm hover:translate-y-[-4px] hover:shadow-neo-md transition-all active:translate-y-0 active:shadow-none"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          <NeoBadge variant="black" className="px-6 py-3 text-xs">
            Registry Verified Secure
          </NeoBadge>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
