'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mouse, Headset, Keyboard, HardDrive, Triangle } from 'lucide-react';
import SdImage from './SdImage';

const CATEGORIES = [
  { name: 'Earbuds', slug: 'earbuds', image: '/images/pokemon_themed_earbuds.png', icon: Headset },
  { name: 'Mice', slug: 'mice', image: '/images/cat_mouse.png', icon: Mouse },
  { name: 'Keyboards', slug: 'keyboards', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000', icon: Keyboard },
  { name: 'Pendrives', slug: 'pendrives', image: 'https://images.unsplash.com/photo-1590422996025-a7b0bed58d7d?q=80&w=1000', icon: HardDrive },
  { name: 'Accessories', slug: 'accessories', image: '/images/duck_themed_earbuds.png', icon: Triangle },
];

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-sd-ivory overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-sd-black text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block"
            >
              Curated Collections
            </motion.span>
            <h2 className="text-4xl lg:text-6xl font-bold text-sd-black leading-[1.1] tracking-tight">
              Mastery is a <span className="font-display italic font-normal text-sd-gold">never-ending</span> exploration
            </h2>
          </div>
          <Link href="/e-commerce/categories" className="group flex items-center gap-4 text-sd-black text-xs font-bold tracking-[0.2em] uppercase transition-all hover:translate-x-1">
            Explore All <div className="p-3 rounded-full border border-sd-black/10 group-hover:bg-sd-black group-hover:text-sd-white transition-all"><ArrowRight className="w-4 h-4" /></div>
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-8 lg:grid lg:grid-cols-5 lg:overflow-visible pb-12 snap-x scrollbar-none">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 w-[280px] lg:w-full snap-center group"
            >
              <Link href={`/e-commerce/${cat.slug}`} className="block relative aspect-[3/4] rounded-[40px] overflow-hidden bg-sd-white border border-sd-border-default transition-all duration-700 shadow-sd-card hover:shadow-sd-hover group-hover:-translate-y-2">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <SdImage 
                    src={cat.image} 
                    alt={cat.name}
                    fill
                    useProxy={false} // Direct load to bypass proxy issues
                    className="object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sd-ivory/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="flex flex-col gap-2">
                     <div className="w-12 h-[2px] bg-sd-gold mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500" />
                     <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-sd-black tracking-tight leading-none group-hover:text-sd-gold transition-colors duration-500">
                          {cat.name}
                        </span>
                        <div className="w-12 h-12 rounded-full border border-sd-black/5 bg-sd-white/60 backdrop-blur-md flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-sm">
                          <cat.icon className="w-5 h-5 text-sd-black" />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute top-8 left-8 px-4 py-1.5 rounded-full bg-sd-black/90 backdrop-blur-md text-[8px] font-bold tracking-[0.2em] text-sd-white uppercase">
                  Discover
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
