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
    imageUrl: '/images/hero-earbuds.jpg', // Ensure this exists or use placeholder
    heading: 'Redefining the Art of Digital Lifestyle',
    subline: 'Premium tech accessories curated for those who value both performance and personality.',
    ctaText: 'Shop Now',
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

  if (!data) return <div className="h-[90vh] bg-sd-onyx sd-skeleton" />;

  return (
    <section className="relative h-screen lg:h-[95vh] w-full overflow-hidden flex items-center bg-sd-black">
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
        
        {/* Premium Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-sd-black via-sd-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-sd-black via-transparent to-sd-black/20 z-10" />
        
        {/* Grain/Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] z-10 pointer-events-none mix-blend-overlay bg-[url('/noise.png')]" />
        
        {/* Subtle Gold Glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-sd-gold/10 blur-[120px] rounded-full z-10 pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-sd-gold" />
            <span className="text-sd-gold text-[11px] font-bold tracking-[0.5em] uppercase">
              Exclusive Boutique 2026
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-[100px] font-bold text-sd-ivory leading-[0.9] tracking-tight mb-10"
          >
            {data.heading.split(' ').map((word, i) => (
               <span key={i} className={`${i % 3 === 2 ? 'font-display italic font-normal text-sd-gold block lg:inline-block' : 'block lg:inline-block md:mr-4'}`}>
                 {word}{' '}
               </span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sd-text-secondary text-lg md:text-xl mb-12 max-w-xl leading-relaxed"
          >
            {data.subline}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link 
              href={data.ctaHref}
              className="group relative overflow-hidden bg-sd-gold text-sd-black px-10 py-5 rounded-full font-bold text-sm tracking-[0.1em] uppercase flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">{data.ctaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-sd-ivory translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </Link>
            
            <Link 
              href="/e-commerce/categories"
              className="group flex items-center gap-3 text-sd-ivory hover:text-sd-gold transition-colors duration-300"
            >
              <span className="text-sm font-bold tracking-[0.1em] uppercase">The Collection</span>
              <div className="w-8 h-[1px] bg-sd-ivory/30 group-hover:bg-sd-gold group-hover:w-12 transition-all duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Side Decorative Text (Editorial Style) */}
      <div className="absolute right-10 bottom-24 hidden xl:block z-20 pointer-events-none">
        <motion.div
           initial={{ opacity: 0, rotate: 90, x: 20 }}
           animate={{ opacity: 0.1, rotate: 90, x: 0 }}
           transition={{ duration: 1.5, delay: 1 }}
           className="text-sd-ivory font-display text-[120px] origin-right italic leading-none whitespace-nowrap"
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
            className="absolute bottom-10 left-10 z-20 flex items-center gap-4"
          >
            <div className="h-10 w-[1px] bg-sd-gold animate-bounce" />
            <span className="text-sd-text-muted text-[10px] tracking-[0.4em] uppercase vertical-text">Scroll To Discover</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
