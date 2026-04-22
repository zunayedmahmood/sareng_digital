'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Play, Eye, Share2, Layers } from 'lucide-react';

interface InstagramReelViewerProps {
  reels?: string[];
}

const NEW_REELS = [
  'https://www.instagram.com/reel/DKYedg-yJ2t/',
  'https://www.instagram.com/reel/DVX1v91DIC8/',
  'https://www.instagram.com/reel/DDhd8oZqY8U/',
  'https://www.instagram.com/reel/DWT7toUjK0F/',
  'https://www.instagram.com/reel/DV3Rg4cEhWs/',
];

const InstagramReelViewer: React.FC<InstagramReelViewerProps> = ({ reels = NEW_REELS }) => {
  return (
    <section className="py-24 lg:py-48 bg-sd-ivory ec-grain overflow-hidden border-t border-sd-border-default/30">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Archival Header */}
        <div className="flex flex-col mb-20 lg:mb-32 relative">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-12 h-[1px] bg-sd-gold" />
            <span className="font-mono text-[10px] font-bold tracking-[0.5em] text-sd-gold uppercase">Motion Gallery</span>
            <div className="flex-1 h-[1px] bg-sd-border-default/20" />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl lg:text-8xl font-display text-sd-black leading-[0.9] mb-8">
                Observed <br />
                <span className="italic text-sd-gold">Phenomena</span>
              </h2>
              <p className="font-mono text-[11px] text-sd-text-secondary uppercase tracking-widest max-w-lg leading-relaxed">
                TECHNICAL CAPTURES FROM THE SARENG DIGITAL CULTURAL ARCHIVE. MOTION LOG: 2026_Q2_DISCOVERY.
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-sd-ivory bg-sd-ivory-dark flex items-center justify-center">
                    <Layers className="w-4 h-4 text-sd-gold/40" />
                  </div>
                ))}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-sd-text-muted">Total Fragments: {reels.length}</span>
            </div>
          </div>
        </div>

        {/* The Gallery Spread */}
        {/* On Mobile: Horizontal Film Strip | On Desktop: Asymmetric Staggered Grid */}
        <div className="relative group/gallery">
          <div className="flex lg:grid lg:grid-cols-5 gap-6 lg:gap-8 overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 scrollbar-none snap-x snap-mandatory">
            {reels.map((url, index) => {
              // Add some randomness to desktop positioning for bolder look
              const isEven = index % 2 === 0;
              const staggerY = isEven ? 'lg:translate-y-12' : 'lg:-translate-y-8';
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex-shrink-0 w-[85vw] md:w-[45vw] lg:w-full snap-start ${staggerY}`}
                >
                  <div className="relative group cursor-pointer">
                    {/* Archival Metadata Header */}
                    <div className="flex items-center justify-between mb-4 px-1">
                      <span className="font-mono text-[8px] font-bold text-sd-black/40 uppercase tracking-tighter">IDX_{index + 1}</span>
                      <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-sd-gold animate-pulse" />
                         <span className="font-mono text-[8px] font-bold text-sd-gold uppercase tracking-widest">LIVE_FEED</span>
                      </div>
                    </div>

                    {/* The Media Containment */}
                    <div className="ec-paper-stack aspect-[9/16] bg-sd-white overflow-hidden border border-sd-border-default shadow-sm group-hover:shadow-sd-hover transition-all duration-700 ease-out relative">
                      {/* Technical Frame Overlay */}
                      <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-sd-white/10" />
                      
                      {/* The Reel */}
                      <iframe 
                        src={`${url}embed/`}
                        className="w-full h-[105%] -mt-[2.5%] border-none scale-100 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                        loading="lazy"
                        title={`Artifact Capture ${index + 1}`}
                      />

                      {/* Interaction Overlay (Delight) */}
                      <div className="absolute inset-0 bg-sd-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex flex-col items-center justify-center gap-6 z-20">
                        <div className="w-16 h-16 rounded-full border border-sd-white/30 flex items-center justify-center group/btn hover:border-sd-gold transition-colors">
                           <Play className="w-6 h-6 text-sd-white group-hover/btn:text-sd-gold fill-current" />
                        </div>
                        <div className="flex items-center gap-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                          <button className="flex items-center gap-2 font-mono text-[9px] text-sd-white uppercase tracking-widest hover:text-sd-gold transition-colors">
                            <Eye className="w-3 h-3" /> Observe
                          </button>
                          <button className="flex items-center gap-2 font-mono text-[9px] text-sd-white uppercase tracking-widest hover:text-sd-gold transition-colors">
                            <Share2 className="w-3 h-3" /> Transmit
                          </button>
                        </div>
                      </div>
                      
                      {/* Scanning Line (Subtle Animate) */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1px] bg-sd-gold/20 z-10 pointer-events-none"
                      />
                    </div>

                    {/* Technical ID Plate */}
                    <div className="mt-6 border-l-2 border-sd-gold pl-4 py-1">
                      <h4 className="font-display italic text-xl text-sd-black mb-1">Phenomenon {index + 1}</h4>
                      <p className="font-mono text-[8px] text-sd-text-muted uppercase tracking-[0.2em]">Capture Ref: ARCH-LNK-REEL-0{index + 24}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Decorative Elements */}
          <div className="hidden lg:block absolute -right-24 top-1/2 -translate-y-12 rotate-90 scale-150 opacity-10 pointer-events-none">
            <span className="font-display italic text-[200px] text-sd-black select-none">Motion</span>
          </div>
        </div>

        {/* Mobile Interaction Hint */}
        <div className="mt-16 flex flex-col items-center lg:hidden">
          <div className="w-48 h-[2px] bg-sd-border-default/20 relative overflow-hidden">
             <motion.div 
               animate={{ x: ['-100%', '200%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-0 bottom-0 w-1/3 bg-sd-gold"
             />
          </div>
          <span className="font-mono text-[8px] text-sd-gold uppercase tracking-[0.5em] mt-4 font-bold">Swipe Archive</span>
        </div>
      </div>
    </section>
  );
};

export default InstagramReelViewer;