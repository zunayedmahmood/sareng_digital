'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    scrollContainerRef.current.scrollTo({
      left: index * offsetWidth,
      behavior: isMobile ? 'smooth' : 'instant' as any
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
    <div className="flex flex-col gap-6 lg:gap-10">
      {/* ── Main Shadow Box Showcase ── */}
      <div className="relative group">
        <div 
          className="sd-depth-recess bg-sd-ivory-dark/20 rounded-[48px] overflow-hidden relative"
          style={{ aspectRatio: '4/5' }}
        >
          {/* Internal Stacking Border */}
          <div className="absolute inset-0 border-[12px] border-sd-white/40 rounded-[48px] z-10 pointer-events-none" />
          
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x"
          >
            {safeImages.map((img, idx) => (
              <div 
                key={img.id || idx} 
                className="w-full h-full flex-shrink-0 snap-start flex items-center justify-center p-8 lg:p-16"
              >
                <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ 
                      opacity: activeIndex === idx ? 1 : 0.4, 
                      scale: activeIndex === idx ? 1 : 0.95,
                      filter: activeIndex === idx ? 'grayscale(0)' : 'grayscale(1)'
                   }}
                   className="w-full h-full relative"
                >
                  <img 
                    src={img.url} 
                    alt={`${productName} view ${idx + 1}`}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>
            ))}
          </div>

          {/* Registry Status Badges */}
          <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
             {discountPercent > 0 && (
                <div className="bg-sd-gold text-sd-black px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest shadow-sd-lift">
                   Save {discountPercent}%
                </div>
             )}
             {!inStock && (
                <div className="bg-sd-black text-sd-white px-4 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest shadow-sd-lift border border-sd-white/20">
                   Unavailable
                </div>
             )}
          </div>

          {/* Navigation Overlay (Desktop) */}
          <div className="absolute inset-y-0 left-0 right-0 hidden lg:flex items-center justify-between px-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30">
            <button
               onClick={(e) => { e.stopPropagation(); prevImage(); }}
               className="pointer-events-auto w-16 h-16 rounded-full bg-sd-white/80 backdrop-blur-md border border-sd-border-default/10 flex items-center justify-center text-sd-black shadow-sd-lift hover:bg-sd-gold hover:border-sd-gold transition-all active:scale-90"
            >
               <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <button
               onClick={(e) => { e.stopPropagation(); nextImage(); }}
               className="pointer-events-auto w-16 h-16 rounded-full bg-sd-white/80 backdrop-blur-md border border-sd-border-default/10 flex items-center justify-center text-sd-black shadow-sd-lift hover:bg-sd-gold hover:border-sd-gold transition-all active:scale-90"
            >
               <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Image Counter Strip */}
          <div className="absolute bottom-8 right-8 z-20 bg-sd-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-sd-white/10">
             <span className="font-mono text-[10px] text-sd-white font-bold tracking-widest uppercase">
                {activeIndex + 1} / {safeImages.length}
             </span>
          </div>
        </div>
      </div>

      {/* ── Thumbnail Index (Paper Slips) ── */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 p-1">
           {safeImages.map((img, idx) => (
             <button
                key={img.id || idx}
                onClick={() => scrollToImage(idx)}
                className={`
                   relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-500 border-2
                   ${activeIndex === idx 
                      ? 'border-sd-gold sd-depth-lift scale-105 z-10' 
                      : 'border-sd-border-default/5 hover:border-sd-gold/30 opacity-60 hover:opacity-100'}
                `}
             >
                <img 
                   src={img.url} 
                   alt={`Thumbnail ${idx + 1}`} 
                   className="w-full h-full object-cover p-2"
                />
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
