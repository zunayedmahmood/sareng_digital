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
    <footer className="bg-sd-ivory-dark/40 border-t border-sd-border-default pt-24 pb-12 lg:pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          {/* Logo & Tagline */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/e-commerce" className="flex flex-col group">
              <span className="text-sd-black font-display italic text-3xl leading-none transition-transform group-hover:translate-x-1 duration-500">Sareng</span>
              <span className="text-sd-black text-[10px] tracking-[0.4em] uppercase mt-1 opacity-60">Digital Boutique</span>
            </Link>
            <p className="text-sd-text-secondary text-base max-w-sm leading-relaxed font-medium">
              Curated premium tech accessories for those who value both performance and personality. Boutique imports for the modern desk.
            </p>
          </div>

          {/* Links Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sd-black text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
                {section.title}
              </h3>
              <ul className="space-y-5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sd-text-secondary text-sm font-medium hover:text-sd-black transition-all hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-sd-border-default flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Copyright */}
          <div className="text-sd-text-muted text-[10px] font-bold tracking-[0.1em] uppercase">
            © {year} SARENG DIGITAL. BD PREMIUM BOUTIQUE.
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            {socialIcons.map(({ Icon, href, label }) => (
              <a 
                key={label} 
                href={href} 
                className="w-12 h-12 rounded-full border border-sd-black/10 flex items-center justify-center text-sd-black hover:bg-sd-black hover:text-sd-white hover:border-sd-black transition-all group"
                aria-label={label}
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>

          {/* Secure Payment */}
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 border border-sd-black/5 rounded-full bg-sd-white/60 backdrop-blur-sm">
               <span className="text-[10px] font-bold text-sd-black/40 tracking-widest uppercase">Verified Secure Payment</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
