'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Share2, Layers, Circle } from 'lucide-react';

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
    <section className="py-24 lg:py-48 bg-sd-ivory overflow-hidden relative">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Archival Metadata Header */}
        <div className="flex flex-col mb-16 lg:mb-24">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-sd-gold font-bold">Registry: Motion Archives</span>
            <div className="h-[1px] flex-1 bg-sd-border-default/20" />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-6xl lg:text-[100px] font-display text-sd-black leading-[0.85] mb-8">
                Observed <br />
                <span className="italic font-medium text-sd-gold">Phenomena</span>
              </h2>
            </div>
            <div className="flex flex-col items-end gap-3 text-right max-w-[240px]">
              <div className="flex items-center gap-2">
                <Circle className="w-2 h-2 fill-sd-gold text-sd-gold animate-pulse" />
                <span className="font-mono text-[10px] text-sd-black font-bold uppercase tracking-widest">Live Capture</span>
              </div>
              <p className="font-mono text-[9px] text-sd-text-muted uppercase tracking-[0.2em] leading-relaxed">
                Fragments of character-driven design in motion. Captured from the global Sareng Digital community.
              </p>
            </div>
          </div>
        </div>

        {/* The Gallery Strip */}
        <div className="relative">
          <div className="flex gap-6 lg:gap-10 overflow-x-auto pb-12 overflow-y-visible scrollbar-none snap-x snap-mandatory px-4 -mx-4 lg:px-0 lg:mx-0">
            {reels.map((url, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 w-[280px] lg:w-[320px] snap-center first:ml-4 last:mr-4 lg:first:ml-0 lg:last:mr-0"
              >
                <div className="group relative">
                  {/* The Recessed Containment */}
                  <div className="sd-depth-recess rounded-[32px] p-2 aspect-[9/16] relative transition-all duration-700 group-hover:sd-depth-lift">
                    {/* The "Paper Cut" Window */}
                    <div className="absolute inset-0 border-[8px] border-sd-ivory rounded-[32px] z-20 pointer-events-none" />
                    
                    <div className="w-full h-full rounded-[24px] overflow-hidden relative">
                      {/* Technical ID Watermark */}
                      <div className="absolute top-6 left-6 z-30 opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="bg-sd-black/80 backdrop-blur-md px-3 py-1 text-[8px] font-mono text-sd-white rounded shadow-sm">
                          ID_0{index + 1}
                        </span>
                      </div>

                      <iframe 
                        src={`${url}embed/`}
                        className="w-full h-[105%] -mt-[2.5%] border-none"
                        loading="lazy"
                        title={`Artifact Capture ${index + 1}`}
                      />

                      {/* Interactive Lift Overlay */}
                      <div className="absolute inset-0 bg-sd-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 backdrop-blur-[1px] z-20 flex items-center justify-center">
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          className="w-16 h-16 rounded-2xl bg-sd-white shadow-sd-lift flex items-center justify-center group/play cursor-pointer"
                        >
                          <Play className="w-6 h-6 text-sd-black fill-current group-hover:text-sd-gold transition-colors" />
                        </motion.div>
                      </div>

                      {/* Scanline */}
                      <motion.div 
                        animate={{ y: ['0%', '2000%'] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-0 right-0 h-[1.5px] bg-sd-gold/20 z-20 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Metadata Tag */}
                  <div className="mt-8 flex flex-col gap-2 px-2">
                    <div className="flex items-center gap-3">
                      <div className="h-[1px] w-4 bg-sd-gold" />
                      <span className="font-mono text-[9px] text-sd-gold font-bold uppercase tracking-widest">Entry Ref: ARCH-LNK-{index + 24}</span>
                    </div>
                    <h3 className="text-xl font-display text-sd-black group-hover:italic transition-all">Capture Fragment {index + 1}</h3>
                    <div className="flex items-center gap-6 mt-2">
                      <button className="flex items-center gap-2 font-mono text-[8px] text-sd-text-muted uppercase tracking-widest hover:text-sd-gold transition-colors">
                        <Eye className="w-3 h-3" /> Observe
                      </button>
                      <button className="flex items-center gap-2 font-mono text-[8px] text-sd-text-muted uppercase tracking-widest hover:text-sd-gold transition-colors">
                        <Share2 className="w-3 h-3" /> Transmit
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Decorative Typography */}
        <div className="absolute -right-24 bottom-24 hidden lg:block opacity-[0.03] rotate-90 pointer-events-none select-none">
          <span className="text-[240px] font-display italic text-sd-black">Archive</span>
        </div>
      </div>
    </section>
  );
};

export default InstagramReelViewer;