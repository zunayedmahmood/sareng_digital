'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import SdImage from './SdImage';

const PendrivesFeature: React.FC = () => {
  return (
    <section className="py-20 lg:py-24 bg-sd-black">
      <div className="container mx-auto px-6">
        <div className="bg-sd-onyx rounded-[2rem] overflow-hidden border border-sd-border-default relative group">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sd-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-sd-gold/10 transition-colors duration-700" />
          
          <div className="flex flex-col lg:flex-row items-center">
            {/* Content */}
            <div className="w-full lg:w-1/2 p-8 lg:p-16 space-y-8 relative z-10">
              <div className="flex items-center gap-2 text-sd-gold">
                <Sparkles className="w-4 h-4 fill-sd-gold" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase">LIMITED EDITION</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-sd-ivory leading-tight">
                Character-Driven <br />
                <span className="font-display italic font-normal text-sd-gold">Storage Solutions</span>
              </h2>
              
              <p className="text-sd-text-secondary text-base lg:text-lg leading-relaxed max-w-md">
                Carry your favorite icons wherever you go. Our high-speed pendrives combine iconic designs with premium reliability.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <a 
                  href="/e-commerce/pendrives"
                  className="bg-sd-gold text-sd-black px-8 py-3.5 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:bg-sd-gold-soft transition-all transform active:scale-95"
                >
                  View Collection
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Visuals */}
            <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto self-stretch relative overflow-hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 1.1 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1 }}
                 className="w-full h-full"
               >
                 <SdImage 
                   src="/images/pendrive-feature.jpg" 
                   alt="Character Pendrives"
                   fill
                   className="object-cover"
                 />
                 {/* Floating product hints or just the aesthetic image */}
               </motion.div>
               
               <div className="absolute inset-0 bg-gradient-to-r from-sd-onyx via-transparent to-transparent hidden lg:block" />
               <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sd-onyx to-transparent lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PendrivesFeature;
