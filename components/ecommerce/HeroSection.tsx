'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import NeoButton from './ui/NeoButton';
import NeoCard from './ui/NeoCard';
import NeoBadge from './ui/NeoBadge';
import Image from 'next/image';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?q=80&w=2070&auto=format&fit=crop';


const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-sd-ivory overflow-hidden px-4 sm:px-6 lg:px-12">
      {/* Background Text Texture */}
      <div className="absolute top-[20%] left-[-5%] opacity-[0.03] select-none pointer-events-none">
        <span className="text-[30vw] font-neo font-black uppercase leading-none">Registry</span>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="flex items-center gap-4 mb-6"
            >
              <NeoBadge variant="gold" isRotated className="text-xs sm:text-sm px-4 py-2">
                Curated Collection 2026
              </NeoBadge>
              <span className="font-neo font-black text-[10px] sm:text-xs uppercase tracking-widest text-black/40">
                Registry ID: SDK-AR-09
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="font-neo font-black text-6xl sm:text-8xl lg:text-[140px] leading-[0.8] uppercase tracking-tighter text-black mb-8 lg:-ml-2"
            >
              Archive <br />
              <span className="text-sd-gold">Digital</span> <br />
              <span className="relative">
                Objects
                <Star className="absolute -top-6 -right-16 text-black w-20 h-20 animate-spin-slow hidden sm:block" />
              </span>
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mb-12"
            >
              <NeoCard variant="white" className="p-6 sm:p-8 -rotate-1">
                <p className="font-neo font-bold text-xl sm:text-2xl uppercase leading-tight text-black">
                  High-stakes character artifacts for the modern desktop registry. Precision acoustic engineering meets playful geometric form.
                </p>
              </NeoCard>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
            >
              <Link href="/e-commerce/products" className="w-full sm:w-auto">
                <NeoButton variant="primary" size="xl" isFullWidth className="group">
                  Explore Archive <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </NeoButton>
              </Link>
              <Link href="/e-commerce/about" className="w-full sm:w-auto">
                <NeoButton variant="secondary" size="xl" isFullWidth>
                  Our Story
                </NeoButton>
              </Link>
            </motion.div>
          </div>

          {/* Image Showcase */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0">
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="relative z-20"
            >
              <NeoCard variant="white" className="p-4 sm:p-6 neo-shadow-xl rotate-3 h-[400px] sm:h-[600px] overflow-hidden group">
                <div className="relative w-full h-full">
                  <Image
                    src={HERO_IMAGE}
                    alt="Artifact"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                </div>


                {/* Sticker Badges Overlay */}
                <NeoBadge variant="violet" className="absolute top-10 -left-6 z-30 -rotate-12 text-sm px-6 py-2">
                  Certified Authentic
                </NeoBadge>
                <NeoBadge variant="black" className="absolute bottom-20 -right-6 z-30 rotate-12 text-sm px-6 py-2">
                  Unit #409
                </NeoBadge>
              </NeoCard>
            </motion.div>

            {/* Decorative Background Shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sd-gold/10 -rotate-6 neo-border-8 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
