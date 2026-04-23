'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Circle } from 'lucide-react';

interface HeroData {
  imageUrl: string;
  heading: string;
  subline: string;
  ctaText: string;
  ctaHref: string;
  catalogId: string;
}

const getHeroContent = (): HeroData => {
  return {
    imageUrl: '/images/mouse_themed_mouse.png',
    heading: 'The Anthology of Character Driven Audio',
    subline: 'Precision acoustic engineering meets playful geometric form. Curated artifacts for the modern aesthetic.',
    ctaText: 'Explore Archive',
    ctaHref: '/e-commerce/products',
    catalogId: 'SDK-2026-ARCHIVE',
  };
};

const FloatingArtifact = ({ size, color, delay, x, y }: { size: number, color: string, delay: number, x: string, y: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.2, 0.5, 0.2], 
      scale: 1,
      x: [0, 10, -10, 0],
      y: [0, -15, 5, 0]
    }}
    transition={{ 
      duration: 5 + delay, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
    style={{ 
      position: 'absolute', 
      width: size, 
      height: size, 
      backgroundColor: color,
      borderRadius: '50%',
      top: y,
      left: x,
      zIndex: 5,
      filter: 'blur(1px)'
    }}
  />
);

const HeroSection: React.FC = () => {
  const [data, setData] = useState<HeroData | null>(null);

  useEffect(() => {
    setData(getHeroContent());
  }, []);

  if (!data) return <div className="h-screen bg-sd-ivory animate-pulse" />;

  return (
    <section className="relative min-h-screen pt-24 pb-20 lg:pt-0 flex flex-col items-center justify-center bg-sd-ivory overflow-hidden px-6 lg:px-12">
      {/* ── Background Detail ── */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] border border-sd-gold/10 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] border border-sd-gold/5 rounded-full" />
      </div>

      {/* ── 3D Floating Artifacts ── */}
      <FloatingArtifact size={120} color="#E8CC80" delay={0} x="10%" y="15%" />
      <FloatingArtifact size={40} color="#0A0A0A" delay={1.5} x="85%" y="20%" />
      <FloatingArtifact size={20} color="#C9A84C" delay={3} x="70%" y="80%" />
      <FloatingArtifact size={15} color="#DE3B3B" delay={4.5} x="20%" y="70%" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center relative z-10">
        
        {/* ── Text Content Layer (The Lifted Paper) ── */}
        <div className="lg:col-span-6 relative z-30">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="sd-depth-lift p-8 lg:p-16 rounded-3xl lg:-mr-24 relative"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-sd-gold font-bold">Registry Code: {data.catalogId}</span>
              <div className="h-[1px] flex-1 bg-sd-border-default/20" />
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[100px] font-display font-light leading-[0.9] text-sd-black mb-8">
              The <span className="italic font-medium text-sd-gold">Anthology</span> <br />
              of Character <br />
              <span className="relative">
                Driven Audio
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="absolute -bottom-2 left-0 h-1 bg-sd-gold/20" 
                />
              </span>
            </h1>

            <p className="text-sd-text-secondary text-lg lg:text-xl font-sans max-w-md leading-relaxed mb-12">
              {data.subline}
            </p>

            <div className="flex flex-wrap items-center gap-8">
              <Link
                href={data.ctaHref}
                className="group relative h-16 px-12 flex items-center bg-sd-black text-sd-white rounded-2xl overflow-hidden shadow-sd-lift transition-all hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-sd-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
                <span className="relative z-10 font-mono text-[11px] font-bold uppercase tracking-[0.2em] group-hover:text-sd-black transition-colors">
                  {data.ctaText}
                </span>
                <ArrowRight className="w-4 h-4 ml-3 relative z-10 group-hover:text-sd-black transition-colors" />
              </Link>

              <Link 
                href="/e-commerce/about" 
                className="group flex flex-col"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sd-text-muted group-hover:text-sd-gold transition-colors">The Design Story</span>
                <div className="h-[1px] w-0 bg-sd-gold group-hover:w-full transition-all duration-300" />
              </Link>
            </div>

            {/* Technical Detail Floater */}
            <div className="absolute -top-12 -right-8 hidden lg:block">
              <div className="ec-paper-stack p-6 rounded-2xl border border-sd-border-default/30 shadow-sd-lift">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-sd-gold uppercase tracking-[0.3em]">Status: Curated</span>
                  <span className="text-xs font-mono text-sd-black">ARCHIVE_UNIT_04</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Image Showcase Layer (The Recessed Well) ── */}
        <div className="lg:col-span-7 lg:pl-12 order-first lg:order-last">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="sd-depth-recess rounded-[40px] p-4 lg:p-8 relative group"
          >
            {/* The "Paper Cut" Border */}
            <div className="absolute inset-0 border-[16px] border-sd-ivory rounded-[40px] z-20 pointer-events-none" />
            
            <div className="aspect-square lg:aspect-[4/5] rounded-[32px] overflow-hidden relative">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 10 }}
                src={data.imageUrl}
                alt="Product Artifact"
                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
              />
              
              {/* Overlay Metadata */}
              <div className="absolute bottom-10 right-10 z-30 flex flex-col items-end gap-2">
                <div className="bg-sd-black/80 backdrop-blur-md px-4 py-2 rounded-lg">
                  <span className="text-[9px] font-mono text-sd-white tracking-widest">CAPTURE_04C</span>
                </div>
                <div className="bg-sd-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-sd-card">
                  <span className="text-[9px] font-mono text-sd-black tracking-widest font-bold">2026_COLLECTION</span>
                </div>
              </div>

              {/* Scanline Effect */}
              <motion.div 
                animate={{ y: ['0%', '1000%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 right-0 h-[2px] bg-sd-gold/20 z-20 pointer-events-none"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Hint */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
      >
        <span className="text-[8px] font-mono uppercase tracking-[0.4em]">Scroll Archive</span>
        <div className="w-[1px] h-8 bg-sd-black" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
