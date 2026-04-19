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
    <section className="py-12 lg:py-20 bg-sd-black">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-sd-ivory tracking-tight">
            Shop by <span className="font-display italic font-normal">Category</span>
          </h2>
          <Link href="/e-commerce/categories" className="text-sd-gold text-xs font-bold tracking-widest uppercase hover:text-sd-gold-soft transition-colors">
            See All →
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-4 lg:grid lg:grid-cols-5 lg:overflow-visible pb-4 scrollbar-none">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[160px] lg:w-full group"
            >
              <Link href={`/e-commerce/${cat.slug}`} className="block relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden border border-sd-border-default hover:border-sd-gold transition-colors">
                {/* Background Image */}
                <SdImage 
                  src={cat.image} 
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-sd-black/90 via-sd-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="self-end w-8 h-8 rounded-full border border-sd-gold/30 flex items-center justify-center bg-sd-black/20 backdrop-blur-sm">
                    <cat.icon className="w-4 h-4 text-sd-gold" />
                  </div>
                  <span className="text-sm font-bold text-sd-ivory group-hover:text-sd-gold transition-colors uppercase tracking-wide">
                    {cat.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Mobile "See All" Card */}
          <div className="flex-shrink-0 w-[140px] lg:hidden flex items-center justify-center">
             <Link href="/e-commerce/categories" className="flex flex-col items-center gap-3 text-sd-text-muted hover:text-sd-gold transition-colors">
                <div className="w-12 h-12 rounded-full border border-sd-border-default flex items-center justify-center">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase">All Categories</span>
             </Link>
          </div>
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
