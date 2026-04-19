'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SdImage from '../SdImage';

interface ProductGalleryProps {
  images: { url: string }[];
  title: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-sd-onyx rounded-3xl flex items-center justify-center border border-white/5">
         <span className="text-sd-text-muted text-[10px] uppercase tracking-[0.3em] font-bold">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Mini Thumbnails (Desktop Only) */}
      <div className="hidden lg:flex flex-col gap-4 w-20 flex-shrink-0">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-500 ${activeIndex === index ? 'border-sd-gold shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'border-white/5 opacity-40 hover:opacity-100'}`}
          >
            <SdImage 
              src={img.url} 
              alt={`${title} - Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              context="card"
            />
          </button>
        ))}
      </div>

      {/* Main Large View */}
      <div className="flex-1">
        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0D0D0D] group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <SdImage 
                src={images[activeIndex].url} 
                alt={`${title} - View ${activeIndex + 1}`}
                fill
                priority
                className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                context="pdp"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Subtle Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-sd-black/40 via-transparent to-sd-black/10 pointer-events-none" />

          {/* Floating Detail Indicator */}
          <div className="absolute top-8 left-8 z-10 px-4 py-2 bg-sd-black/20 backdrop-blur-md border border-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
             <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-sd-ivory/60">View {activeIndex + 1} / {images.length}</span>
          </div>
        </div>

        {/* Mobile View Indicators */}
        <div className="flex lg:hidden justify-center gap-3 mt-8">
           {images.map((_, i) => (
             <button 
               key={i} 
               onClick={() => setActiveIndex(i)}
               className={`h-1 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-8 bg-sd-gold' : 'w-2 bg-white/10'}`} 
             />
           ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
