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
    <section className="py-16 lg:py-24 bg-sd-black">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 text-sd-gold mb-4">
            <Instagram className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">FOLLOW US @SARENGDIGITAL</span>
          </div>
          
          <div className="w-full h-px bg-sd-gold/30 max-w-xs mx-auto mb-8" />
          
          <h2 className="text-2xl lg:text-3xl font-bold text-sd-ivory text-center">
            Culture in <span className="font-display italic font-normal">Motion</span>
          </h2>
        </div>

        {/* Reels Container */}
        <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-none snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible">
          {reels.map((url, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-full snap-center"
            >
              <div className="aspect-[9/16] bg-sd-onyx rounded-2xl overflow-hidden border border-sd-border-default relative group hover:border-sd-gold transition-colors">
                 {/* 
                    Using a simple iframe for now as requested. 
                    In a real app, I'd use the Instagram embed script or a library.
                    Since we want 9:16 ratio consistently.
                 */}
                 <iframe 
                    src={`${url}embed`}
                    className="w-full h-full border-none"
                    loading="lazy"
                    title={`Instagram Reel ${index + 1}`}
                 />
                 
                 {/* Shimmer Placeholder behind iframe */}
                 <div className="absolute inset-0 z-[-1] sd-skeleton" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile indicators */}
        <div className="flex justify-center gap-2 mt-4 lg:hidden">
           {reels.map((_, i) => (
             <div key={i} className="w-1.5 h-1.5 rounded-full bg-sd-border-strong" />
           ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramReelViewer;