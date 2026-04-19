'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: 'QUICK LINKS',
      links: [
        { label: 'About Us', href: '/e-commerce/about' },
        { label: 'Contact Us', href: '/e-commerce/contact' },
        { label: 'Track Order', href: '/e-commerce/track-order' },
        { label: 'Wishlist', href: '/e-commerce/wishlist' },
        { label: 'Privacy Policy', href: '/e-commerce/privacy' },
      ],
    },
    {
      title: 'CATEGORIES',
      links: [
        { label: 'Earbuds', href: '/e-commerce/earbuds' },
        { label: 'Mice', href: '/e-commerce/mice' },
        { label: 'Keyboards', href: '/e-commerce/keyboards' },
        { label: 'Pendrives', href: '/e-commerce/pendrives' },
        { label: 'Accessories', href: '/e-commerce/accessories' },
      ],
    },
    {
      title: 'CONTACT',
      links: [
        { label: 'Email: support@sarengdigital.com', href: 'mailto:support@sarengdigital.com' },
        { label: 'Phone: +880 1942 565664', href: 'tel:+8801942565664' },
        { label: 'WhatsApp', href: 'https://wa.me/8801942565664' },
      ],
    },
  ];

  const socialIcons = [
    { Icon: Facebook, href: '#', label: 'Facebook' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Youtube, href: '#', label: 'Youtube' },
    { Icon: MessageCircle, href: '#', label: 'TikTok/WhatsApp' },
  ];

  return (
    <footer className="bg-sd-onyx border-t border-sd-border-default pt-16 pb-8 lg:pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Logo & Tagline */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/e-commerce" className="flex flex-col">
              <span className="text-sd-gold font-bold tracking-[0.15em] text-2xl leading-none">SARENG</span>
              <span className="text-sd-text-secondary text-xs tracking-[0.08em]">DIGITAL</span>
            </Link>
            <p className="text-sd-text-secondary text-sm max-w-sm leading-relaxed">
              Curated premium tech accessories for those who value both performance and personality. From character-driven earbuds to precision peripherals.
            </p>
          </div>

          {/* Links Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sd-gold text-[11px] font-bold tracking-[0.3em] uppercase mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sd-text-secondary text-sm hover:text-sd-gold transition-all hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-sd-border-default flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Copyright */}
          <div className="text-sd-text-muted text-xs">
            © {year} SARENG DIGITAL. All rights reserved.
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialIcons.map(({ Icon, href, label }) => (
              <a 
                key={label} 
                href={href} 
                className="w-10 h-10 rounded-full border border-sd-border-default flex items-center justify-center text-sd-text-secondary hover:text-sd-gold hover:border-sd-gold transition-all hover:shadow-sd-gold group"
                aria-label={label}
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>

          {/* Payment Badges or Legal bits */}
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 border border-sd-border-light rounded bg-sd-black/30">
               <span className="text-[10px] font-bold text-sd-text-muted tracking-widest uppercase">SSLCOMMERZ</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
