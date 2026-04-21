'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import SdImage from './SdImage';

interface HeroData {
  imageUrl: string;
  heading: string;
  subline: string;
  ctaText: string;
  ctaHref: string;
}

// Mock function representing future CMS fetch
const getHeroContent = (): HeroData => {
  return {
    imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=2070', // Minimalist premium tech setup
    heading: 'The New Standard of Digital Craft',
    subline: 'Precision peripherals curated for the modern minimalist. Imported quality, boutique experience.',
    ctaText: 'Explore Boutique',
    ctaHref: '/e-commerce/products',
  };
};

const HeroSection: React.FC = () => {
  const [data, setData] = useState<HeroData | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    setData(getHeroContent());

    const handleScroll = () => {
      if (window.scrollY > 100) setShowScrollIndicator(false);
      else setShowScrollIndicator(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!data) return <div className="h-[90vh] bg-sd-ivory sd-skeleton" />;

  return (
    <section className="relative h-screen lg:h-[95vh] w-full overflow-hidden flex items-center bg-sd-ivory">
      {/* Background Layer with Depth */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <SdImage 
            src={data.imageUrl} 
            alt="Hero Product"
            fill
            priority
            context="hero"
            className="object-cover"
          />
        </motion.div>
        
        {/* Premium Overlays (Ivory-First) */}
        <div className="absolute inset-0 bg-gradient-to-r from-sd-ivory via-sd-ivory/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-sd-ivory via-transparent to-sd-ivory/10 z-10" />
        
        {/* Grain/Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] z-10 pointer-events-none mix-blend-multiply bg-[url('/noise.png')]" />
        
        {/* Subtle Glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-sd-gold/5 blur-[120px] rounded-full z-10 pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-sd-black" />
            <span className="text-sd-black text-[11px] font-bold tracking-[0.5em] uppercase">
              Limited Imports 2026
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl lg:text-[110px] font-bold text-sd-black leading-[0.85] tracking-tight mb-10"
          >
            {data.heading.split(' ').map((word, i) => (
               <span key={i} className={`${i % 3 === 2 ? 'font-display italic font-normal text-sd-gold block lg:inline-block' : 'block lg:inline-block md:mr-6'}`}>
                 {word}{' '}
               </span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sd-text-secondary text-lg md:text-xl mb-12 max-w-xl leading-relaxed font-medium"
          >
            {data.subline}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-wrap items-center gap-8"
          >
            <Link 
              href={data.ctaHref}
              className="group relative overflow-hidden bg-sd-black text-sd-white px-12 py-5 rounded-full font-bold text-sm tracking-[0.15em] uppercase flex items-center gap-4 transition-all shadow-sd-card hover:shadow-sd-hover"
            >
              <span className="relative z-10">{data.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-sd-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </Link>
            
            <Link 
              href="/e-commerce/categories"
              className="group flex items-center gap-4 text-sd-black py-4"
            >
              <span className="text-sm font-bold tracking-[0.2em] uppercase">The Collection</span>
              <div className="relative h-px w-8 bg-sd-black/20 overflow-hidden">
                <div className="absolute inset-0 bg-sd-black -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Side Decorative Text */}
      <div className="absolute right-10 bottom-24 hidden xl:block z-20 pointer-events-none">
        <motion.div
           initial={{ opacity: 0, rotate: 90, x: 20 }}
           animate={{ opacity: 0.05, rotate: 90, x: 0 }}
           transition={{ duration: 1.5, delay: 1 }}
           className="text-sd-black font-display text-[140px] origin-right italic leading-none whitespace-nowrap"
        >
          Sareng Digital
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 z-20 flex items-center gap-4"
          >
            <div className="h-12 w-[1px] bg-sd-black/20 relative overflow-hidden">
              <motion.div 
                animate={{ y: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-1/2 bg-sd-gold"
              />
            </div>
            <span className="text-sd-text-muted text-[9px] font-bold tracking-[0.5em] uppercase vertical-text">Scroll</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
