'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

interface InstagramReelViewerProps {
  reels?: string[];
}

// Mock reels for default state
const MOCK_REELS = [
  'https://www.instagram.com/reel/DW6uSbkERA9/',
  'https://www.instagram.com/p/DW6DQUGk-ho/',
  'https://www.instagram.com/reel/DW323H0EboK/',
];

const InstagramReelViewer: React.FC<InstagramReelViewerProps> = ({ reels = MOCK_REELS }) => {
  return (
    <section className="py-24 lg:py-32 bg-sd-ivory overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-4 text-sd-black mb-6">
            <Instagram className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-[0.5em] uppercase">The Culture @SARENGDIGITAL</span>
          </div>
          
          <div className="w-24 h-1 bg-sd-gold/30 mb-8 rounded-full" />
          
          <h2 className="text-4xl lg:text-5xl font-bold text-sd-black text-center tracking-tight leading-tight">
            Our Culture in <span className="font-display italic font-normal text-sd-gold">Motion</span>
          </h2>
        </div>

        {/* Reels Container */}
        <div className="flex overflow-x-auto gap-8 pb-12 scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible">
          {reels.map((url, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 w-[300px] sm:w-[340px] lg:w-full snap-center group"
            >
              <div className="aspect-[9/16] bg-sd-white rounded-[40px] overflow-hidden border border-sd-black/5 relative shadow-sd-card group-hover:shadow-sd-hover group-hover:-translate-y-2 transition-all duration-700">
                 <iframe 
                    src={`${url}embed`}
                    className="w-full h-full border-none grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    title={`Instagram Reel ${index + 1}`}
                 />
                 
                 {/* Shimmer Placeholder behind iframe */}
                 <div className="absolute inset-0 z-[-1] bg-sd-black/5 sd-skeleton" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile indicators */}
        <div className="flex justify-center gap-3 lg:hidden">
           {reels.map((_, i) => (
             <div key={i} className="w-2 h-2 rounded-full bg-sd-black/10" />
           ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramReelViewer;