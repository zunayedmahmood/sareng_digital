'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeoBadge from './ui/NeoBadge';
import NeoCard from './ui/NeoCard';

interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
  alt_text?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  discountPercent?: number;
  inStock?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  discountPercent = 0,
  inStock = true
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [images]);

  const safeImages = images.length > 0
    ? images
    : [{ id: 0, url: '/placeholder-product.png', is_primary: true } as ProductImage];

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, offsetWidth } = scrollContainerRef.current;
    if (offsetWidth === 0) return;
    const index = Math.round(scrollLeft / offsetWidth);
    if (index !== activeIndex && index < safeImages.length) {
      setActiveIndex(index);
    }
  };

  const scrollToImage = (index: number) => {
    setActiveIndex(index);
    if (!scrollContainerRef.current) return;
    const { offsetWidth } = scrollContainerRef.current;
    
    scrollContainerRef.current.scrollTo({
      left: index * offsetWidth,
      behavior: 'smooth'
    });
  };

  const prevImage = () => {
    const nextIdx = activeIndex === 0 ? safeImages.length - 1 : activeIndex - 1;
    scrollToImage(nextIdx);
  };

  const nextImage = () => {
    const nextIdx = activeIndex === safeImages.length - 1 ? 0 : activeIndex + 1;
    scrollToImage(nextIdx);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main Container */}
      <div className="relative group">
        <NeoCard 
          variant="white" 
          hasHover={false}
          className="aspect-[4/5] overflow-hidden relative neo-border-4"
        >
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x bg-sd-ivory"
          >
            {safeImages.map((img, idx) => (
              <div 
                key={img.id || idx} 
                className="w-full h-full flex-shrink-0 snap-start flex items-center justify-center p-4 sm:p-8"
              >
                <motion.img 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={img.url} 
                  alt={`${productName} view ${idx + 1}`}
                  className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            ))}
          </div>

          {/* Badges Overlay */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-3 items-start">
             {discountPercent > 0 && (
               <NeoBadge variant="violet" isRotated className="text-xs shadow-none">
                 -{discountPercent}% OFF
               </NeoBadge>
             )}
             {!inStock && (
               <NeoBadge variant="black" className="text-xs shadow-none">OUT OF REGISTRY</NeoBadge>
             )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 right-6 z-20">
             <NeoBadge variant="gold" className="text-[10px] sm:text-xs shadow-none">
               SCAN {activeIndex + 1} / {safeImages.length}
             </NeoBadge>
          </div>

          {/* Nav Buttons */}
          <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none">
             <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="pointer-events-auto w-12 h-12 neo-border-2 bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-[2px]"
             >
                <ChevronLeft size={20} />
             </button>
             <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="pointer-events-auto w-12 h-12 neo-border-2 bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-[2px]"
             >
                <ChevronRight size={20} />
             </button>
          </div>
        </NeoCard>
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex flex-wrap gap-4">
           {safeImages.map((img, idx) => (
             <button
                key={img.id || idx}
                onClick={() => scrollToImage(idx)}
                className={`
                  relative w-16 sm:w-20 aspect-square neo-border-2 transition-all p-2 bg-white
                  ${activeIndex === idx 
                    ? 'neo-shadow-sm -translate-y-1 z-10 border-black' 
                    : 'opacity-40 hover:opacity-100 hover:border-black/50 grayscale'}
                `}
             >
                <img 
                   src={img.url} 
                   alt={`Thumbnail ${idx + 1}`} 
                   className="w-full h-full object-contain"
                />
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
