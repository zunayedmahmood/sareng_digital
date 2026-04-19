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
    // Simulate API fetch
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
    <section className="relative h-screen lg:h-[90vh] lg:max-h-[700px] w-full overflow-hidden flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <SdImage 
          src={data.imageUrl} 
          alt="Hero Product"
          fill
          priority
          context="hero"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sd-black/30 via-sd-black/85 to-sd-black z-10" />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-2xl text-center lg:text-left">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-sd-gold text-[10px] tracking-[0.4em] uppercase mb-4"
          >
            NEW ARRIVALS — 2026
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-6xl font-bold text-sd-ivory leading-tight mb-6"
          >
            {/* The instructions mention using display font for italic wordmark feel */}
            {data.heading.split(' ').map((word, i) => (
               <span key={i} className={i % 3 === 2 ? 'font-display italic font-normal' : ''}>
                 {word}{' '}
               </span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sd-text-secondary text-base lg:text-lg mb-10 max-w-lg mx-auto lg:mx-0"
          >
            {data.subline}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
          >
            <Link 
              href={data.ctaHref}
              className="group bg-sd-gold text-sd-black px-8 py-4 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-sd-gold-soft transition-all transform active:scale-95"
            >
              {data.ctaText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/e-commerce/categories"
              className="bg-sd-onyx/50 border border-sd-border-default text-sd-ivory px-8 py-4 rounded-full font-bold text-sm tracking-wide hidden sm:block hover:bg-sd-onyx hover:border-sd-border-hover transition-all"
            >
              View Collections
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-sd-text-muted text-[10px] tracking-widest uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5 text-sd-gold" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
