'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SdImage from '../SdImage';

interface ProductGalleryProps {
  images: { url: string }[];
  title: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title }) => {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-sd-onyx rounded-2xl flex items-center justify-center border border-sd-border-default">
         <span className="text-sd-text-muted text-xs uppercase tracking-widest">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      {/* Mobile Slider / Desktop Vertical Stack */}
      <div className="flex overflow-x-auto lg:flex-col gap-4 lg:gap-8 snap-x snap-mandatory scrollbar-none">
        {images.map((img, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex-shrink-0 w-full snap-center"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-sd-border-default bg-sd-onyx group">
              <SdImage 
                src={img.url} 
                alt={`${title} - View ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                context="pdp"
              />
              
              {/* Subtle overlay for the first image on mobile */}
              {index === 0 && (
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sd-black/40 to-transparent lg:hidden" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mini Thumbnails (Desktop only) or indicator */}
      {images.length > 1 && (
        <div className="flex lg:hidden justify-center gap-2 mt-2">
           {images.map((_, i) => (
             <div key={i} className="w-1.5 h-1.5 rounded-full bg-sd-border-strong" />
           ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
