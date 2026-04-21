'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import SdImage from './SdImage';

const PendrivesFeature: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-sd-ivory">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="bg-sd-white rounded-[3rem] overflow-hidden border border-sd-border-default relative group shadow-sd-card hover:shadow-sd-hover transition-all duration-700">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sd-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-sd-gold/10 transition-colors duration-700" />
          
          <div className="flex flex-col lg:flex-row items-center">
            {/* Content */}
            <div className="w-full lg:w-1/2 p-10 lg:p-20 space-y-10 relative z-10">
              <div className="flex items-center gap-3 text-sd-black">
                <Sparkles className="w-4 h-4 fill-sd-gold text-sd-gold" />
                <span className="text-[10px] font-bold tracking-[0.5em] uppercase">Limited Imports</span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-bold text-sd-black leading-[0.9] tracking-tighter">
                Character <br />
                <span className="font-display italic font-normal text-sd-gold">Storage</span>
              </h2>
              
              <p className="text-sd-text-secondary text-lg lg:text-xl leading-relaxed max-w-md font-medium">
                Carry your favorite icons wherever you go. Iconic designs, boutique reliability, hyper-speed performance.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-6">
                <a 
                  href="/e-commerce/pendrives"
                  className="bg-sd-black text-sd-white px-12 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-3 hover:bg-sd-gold hover:text-sd-black transition-all shadow-sm active:scale-95"
                >
                  Acquire yours
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Visuals */}
            <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto self-stretch relative overflow-hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 1.05 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1.2 }}
                 className="w-full h-full"
               >
                 <SdImage 
                   src="/images/themed_earbuds.png" 
                   alt="Character Storage"
                   fill
                   className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                 />
               </motion.div>
               
               <div className="absolute inset-0 bg-gradient-to-r from-sd-white via-transparent to-transparent hidden lg:block" />
               <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sd-white to-transparent lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PendrivesFeature;
