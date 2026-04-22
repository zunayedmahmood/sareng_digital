'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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
    imageUrl: '/images/product_images/duck_themed_earbuds.png',
    heading: 'The Art of Character Driven Audio',
    subline: 'An anthology of sound. Precision acoustic engineering meets playful geometric form.',
    ctaText: 'View Collection',
    ctaHref: '/e-commerce/products',
    catalogId: 'SDK-2026-04',
  };
};

const HeroSection: React.FC = () => {
  const [data, setData] = useState<HeroData | null>(null);

  useEffect(() => {
    setData(getHeroContent());
  }, []);

  if (!data) return <div className="h-screen bg-sd-ivory sd-skeleton" />;

  return (
    <section className="relative min-h-screen pt-24 lg:pt-0 flex flex-col lg:flex-row bg-sd-ivory overflow-hidden">
      {/* 1. Technical Info Column (Left Desktop) */}
      <div className="hidden lg:flex w-[80px] border-r border-sd-border-default flex-col items-center py-10 justify-between self-stretch">
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] origin-center -rotate-90 whitespace-nowrap text-sd-text-muted">
          Establishing Shot
        </span>
        <div className="flex flex-col items-center gap-4">
          <div className="w-[1px] h-20 bg-sd-border-default" />
          <span className="font-mono text-[10px] text-sd-gold font-bold">{data.catalogId}</span>
        </div>
      </div>

      {/* 2. Main Narrative Column */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Text Content */}
        <div className="w-full lg:w-1/2 p-8 lg:p-20 flex flex-col justify-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.87, 0, 0.13, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-sd-gold">Dept. Audiophiles</span>
              <div className="h-[1px] w-12 bg-sd-border-default" />
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-display font-light leading-[0.9] text-sd-black mb-8">
              The Art of <br />
              <span className="italic font-medium text-sd-gold">Character</span> <br />
              Driven Audio
            </h1>

            <p className="text-sd-text-secondary text-lg font-sans max-w-sm leading-relaxed mb-12">
              {data.subline}
            </p>

            <div className="flex items-center gap-10">
              <Link
                href={data.ctaHref}
                className="group relative h-14 px-10 flex items-center bg-sd-black text-sd-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-sd-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />
                <span className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-sd-black transition-colors">
                  {data.ctaText}
                </span>
                <ArrowRight className="w-4 h-4 ml-3 relative z-10 group-hover:text-sd-black transition-colors" />
              </Link>

              <Link href="/e-commerce/about" className="font-mono text-[10px] uppercase tracking-[0.2em] border-b border-sd-border-default pb-1 hover:border-sd-gold transition-colors">
                The Designer
              </Link>
            </div>
          </motion.div>

          {/* Catalog Label Overlay */}
          <div className="absolute bottom-10 left-10 opacity-5 hidden lg:block">
            <span className="font-display italic text-[140px] text-sd-black select-none pointer-events-none">
              Artifact
            </span>
          </div>
        </div>

        {/* 3. The Artifact Showcase (Image) */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto relative bg-sd-ivory-dark overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: [0.87, 0, 0.13, 1] }}
            className="absolute inset-0"
          >
            <img
              src={data.imageUrl}
              alt="Museum Artifact"
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000"
            />
          </motion.div>

          {/* Overlay Grid */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[linear-gradient(rgba(10,10,10,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="absolute top-6 right-6 z-20">
            <div className="ec-paper-stack p-4 border border-sd-black/10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-sd-black">Scan Entry 04-2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
