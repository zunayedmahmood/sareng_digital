'use client';

import React from 'react';
import Link from 'next/motion';
import { motion } from 'framer-motion';
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
    <section className="py-20 lg:py-32 bg-sd-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
          {/* Image Part */}
          <motion.div 
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-sd-border-light shadow-2xl">
              <SdImage 
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sd-black/40 to-transparent" />
            </div>
          </motion.div>

          {/* Text Part */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
          >
            <span className="text-sd-gold text-xs font-bold tracking-[0.4em] uppercase">THE SARENG STANDARD</span>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-sd-ivory leading-[1.1]">
              {title.split(' ').map((word, i) => (
                 <span key={i} className={i % 4 === 1 ? 'font-display italic font-normal text-sd-gold' : ''}>
                   {word}{' '}
                 </span>
              ))}
            </h2>

            <p className="text-sd-text-secondary text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            <div className="pt-4">
               <a 
                 href={ctaHref}
                 className="inline-block bg-sd-ivory text-sd-black px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-sd-gold transition-colors transform active:scale-95 shadow-lg"
               >
                 {ctaText}
               </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EditorialBlock;
