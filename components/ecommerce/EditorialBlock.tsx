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
    <section className="py-24 lg:py-48 bg-sd-ivory overflow-hidden relative">
      {/* Decorative Elements */}
      <div className={`absolute top-0 ${reverse ? 'right-0' : 'left-0'} w-1/2 h-full bg-gradient-to-b from-sd-black/5 via-transparent to-transparent pointer-events-none`} />

      <div className="container mx-auto px-6 lg:px-12">
        <div className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
          {/* Image Part */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-1/2 relative group"
          >
            {/* Subtle floating black frame */}
            <div className={`absolute -inset-6 border border-sd-black/5 rounded-[50px] pointer-events-none transition-all duration-1000 group-hover:inset-0`} />
            
            <div className="relative aspect-[3/4] lg:aspect-[4/5] rounded-[3rem] overflow-hidden border border-sd-border-default shadow-sd-card group-hover:shadow-sd-hover transition-all duration-700">
              <SdImage 
                src={imageUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sd-ivory/60 via-transparent to-transparent opacity-40" />
            </div>
            
            {/* Corner Accent */}
            <div className={`absolute ${reverse ? 'left-10 bottom-10' : 'right-10 bottom-10'} z-20`}>
               <div className="w-20 h-20 rounded-full border border-sd-black/10 bg-sd-white/60 backdrop-blur-md flex items-center justify-center text-sd-black font-display italic text-3xl shadow-sm">S</div>
            </div>
          </motion.div>

          {/* Text Part */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-1/2 space-y-10"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-[1px] bg-sd-black/20" />
                 <span className="text-sd-black text-[10px] font-bold tracking-[0.5em] uppercase">The Editorial Standard</span>
              </div>
              
              <h2 className="text-5xl lg:text-8xl font-bold text-sd-black leading-[0.9] tracking-tighter">
                {title.split(' ').map((word, i) => (
                   <span key={i} className={`${i % 4 === 1 ? 'font-display italic font-normal text-sd-gold' : ''} block lg:inline-block md:mr-4`}>
                     {word}{' '}
                   </span>
                ))}
              </h2>
            </div>

            <p className="text-sd-text-secondary text-xl lg:text-2xl leading-relaxed max-w-xl font-medium">
              {subtitle}
            </p>

            <div className="pt-8">
               <Link 
                 href={ctaHref}
                 className="group relative inline-flex items-center gap-4 bg-sd-black text-sd-white px-12 py-6 rounded-full font-bold text-xs tracking-[0.2em] uppercase hover:bg-sd-gold hover:text-sd-black transition-all duration-500 shadow-sd-card overflow-hidden active:scale-95"
               >
                 <span className="relative z-10">{ctaText}</span>
                 <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EditorialBlock;
