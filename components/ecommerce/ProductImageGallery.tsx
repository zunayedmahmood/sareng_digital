'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const safeImages = images.length > 0 
    ? images 
    : [{ id: 0, url: '/placeholder-product.png', is_primary: true }];

  // Sync scroll position for mobile carousel
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, offsetWidth } = scrollContainerRef.current;
    const index = Math.round(scrollLeft / offsetWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToImage = (index: number) => {
    if (!scrollContainerRef.current) return;
    const { offsetWidth } = scrollContainerRef.current;
    scrollContainerRef.current.scrollTo({
      left: index * offsetWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
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
    <div className="flex flex-col-reverse md:flex-row gap-6">
      {/* Vertical Thumbnails (Desktop) */}
      {safeImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-3 w-20 flex-shrink-0">
          {safeImages.map((img, index) => (
            <button
              key={img.id || index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className={`relative overflow-hidden rounded-xl bg-gray-50 border-2 transition-all duration-300 ${
                activeIndex === index ? 'border-black' : 'border-transparent hover:border-gray-200'
              }`}
              style={{ aspectRatio: '1/1' }}
            >
              <img src={img.url} alt={`${productName} view ${index + 1}`} className="w-full h-full object-cover p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 relative group">
        {/* Mobile Swipe Carousel / Desktop Main Image */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar md:overflow-hidden rounded-2xl border border-gray-100 bg-[#f9f9f9]"
          style={{ aspectRatio: '600/850' }}
        >
          <div className="flex h-full md:block">
            {safeImages.map((img, index) => (
              <div 
                key={img.id || index}
                className={`snap-start flex-shrink-0 w-full h-full md:absolute md:inset-0 transition-opacity duration-500 ${
                  index === activeIndex ? 'md:opacity-100 z-10' : 'md:opacity-0 z-0'
                }`}
              >
                <img
                  src={img.url}
                  alt={`${productName} view ${index + 1}`}
                  className="w-full h-full object-contain p-4 sm:p-8 transition-transform duration-700 md:group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Status Badges */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2 z-20">
            {!inStock && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase shadow-lg">
                Out of Stock
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-widest uppercase shadow-lg">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Navigation Arrows (Desktop) */}
          {safeImages.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 hidden sm:flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-white shadow-xl text-black hover:bg-black hover:text-white transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-white shadow-xl text-black hover:bg-black hover:text-white transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* Dot Indicators (Mobile) */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 md:hidden z-20">
              {safeImages.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? 'w-6 bg-[var(--gold)]' : 'w-1.5 bg-white/30'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
