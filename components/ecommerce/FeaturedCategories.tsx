'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mouse, Headset, Keyboard, HardDrive, Triangle } from 'lucide-react';
import SdImage from './SdImage';

const CATEGORIES = [
  { name: 'Earbuds', slug: 'earbuds', image: '/images/cat-earbuds.jpg', icon: Headset },
  { name: 'Mice', slug: 'mice', image: '/images/cat-mice.jpg', icon: Mouse },
  { name: 'Keyboards', slug: 'keyboards', image: '/images/cat-keyboards.jpg', icon: Keyboard },
  { name: 'Pendrives', slug: 'pendrives', image: '/images/cat-pendrives.jpg', icon: HardDrive },
  { name: 'Accessories', slug: 'accessories', image: '/images/cat-accessories.jpg', icon: Triangle },
];

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-sd-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-sd-gold text-[10px] tracking-[0.5em] uppercase mb-4 block"
            >
              Curated Collections
            </motion.span>
            <h2 className="text-3xl lg:text-5xl font-bold text-sd-ivory leading-tight">
              Mastery is a <span className="font-display italic font-normal">never-ending exploration</span>
            </h2>
          </div>
          <Link href="/e-commerce/categories" className="group flex items-center gap-3 text-sd-gold text-xs font-bold tracking-[0.2em] uppercase hover:text-sd-gold-soft transition-colors">
            Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-6 lg:grid lg:grid-cols-5 lg:overflow-visible pb-8 snap-x scrollbar-none">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 w-[260px] lg:w-full snap-center group"
            >
              <Link href={`/e-commerce/${cat.slug}`} className="block relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 group-hover:border-sd-gold/30 transition-all duration-700">
                {/* Background Image */}
                <SdImage 
                  src={cat.image} 
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                
                {/* Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-sd-black via-sd-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex flex-col gap-2">
                     <div className="w-0 group-hover:w-12 h-[1px] bg-sd-gold transition-all duration-700 ease-in-out mb-2" />
                     <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-sd-ivory tracking-wide group-hover:text-sd-gold transition-colors duration-500">
                          {cat.name}
                        </span>
                        <div className="w-10 h-10 rounded-full border border-sd-gold/0 group-hover:border-sd-gold/40 flex items-center justify-center bg-white/5 backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                          <cat.icon className="w-4 h-4 text-sd-gold" />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Glassy detail box top right */}
                <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-sd-black/30 backdrop-blur-md border border-white/10 text-[9px] font-bold tracking-widest text-sd-ivory/60 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  Browse
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Internal utility to match the design (ArrowRight)
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default FeaturedCategories;
