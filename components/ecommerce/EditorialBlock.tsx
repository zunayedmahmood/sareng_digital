'use client';

import React from 'react';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SdImage from './SdImage';

interface EditorialBlockProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaHref?: string;
  reverse?: boolean;
}

const EditorialBlock: React.FC<EditorialBlockProps> = ({
  title = 'Engineered for Performance, Styled for You',
  subtitle = 'Discover our collection of precision-engineered peripherals that don\'t just perform—they make a statement.',
  imageUrl = '/images/editorial-1.jpg',
  ctaText = 'Explore Collection',
  ctaHref = '/e-commerce/products',
  reverse = false,
}) => {
  return (
    <section className="py-24 lg:py-48 bg-sd-black overflow-hidden relative">
      {/* Decorative Elements */}
      <div className={`absolute top-0 ${reverse ? 'right-0' : 'left-0'} w-1/2 h-full bg-gradient-to-b from-sd-gold/5 via-transparent to-transparent pointer-events-none`} />

      <div className="container mx-auto px-6 lg:px-12">
        <div className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
          {/* Image Part */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-1/2 relative group"
          >
            {/* Subtle floating gold frame */}
            <div className={`absolute -inset-4 border border-sd-gold/10 rounded-[40px] pointer-events-none transition-all duration-1000 group-hover:inset-0`} />
            
            <div className="relative aspect-[3/4] lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
              <SdImage 
                src={imageUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sd-black/60 to-transparent" />
            </div>
            
            {/* Corner Accent */}
            <div className={`absolute ${reverse ? 'left-8 bottom-8' : 'right-8 bottom-8'} z-20`}>
               <div className="w-16 h-16 rounded-full border border-sd-gold/30 backdrop-blur-md flex items-center justify-center text-sd-gold font-display italic text-2xl">S</div>
            </div>
          </motion.div>

          {/* Text Part */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-1/2 space-y-10"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-[1px] bg-sd-gold/40" />
                 <span className="text-sd-gold text-[10px] font-bold tracking-[0.5em] uppercase">The Editorial Standard</span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-bold text-sd-ivory leading-[1] tracking-tighter">
                {title.split(' ').map((word, i) => (
                   <span key={i} className={`${i % 4 === 1 ? 'font-display italic font-normal text-sd-gold' : ''} block lg:inline-block md:mr-3`}>
                     {word}{' '}
                   </span>
                ))}
              </h2>
            </div>

            <p className="text-sd-text-secondary text-lg lg:text-xl leading-relaxed max-w-xl font-light">
              {subtitle}
            </p>

            <div className="pt-6">
               <Link 
                 href={ctaHref}
                 className="group relative inline-flex items-center gap-4 bg-sd-gold text-sd-black px-10 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:bg-sd-ivory transition-all duration-500 shadow-xl overflow-hidden active:scale-95"
               >
                 <span className="relative z-10">{ctaText}</span>
                 <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EditorialBlock;
