'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import catalogService, { SimpleProduct } from '@/services/catalogService';
import PremiumProductCard from './ui/PremiumProductCard';

const NewArrivalsScroll: React.FC = () => {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await catalogService.getProducts({ 
          sort_by: 'created_at', 
          sort_order: 'desc',
          per_page: 8 
        });
        setProducts(data.data || []);
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-sd-black">
        <div className="container mx-auto px-6">
          <div className="h-8 w-48 bg-sd-onyx sd-skeleton rounded mb-10" />
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-[280px] aspect-[3/4] bg-sd-onyx sd-skeleton rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-sd-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-sd-gold text-[10px] font-bold tracking-[0.4em] uppercase mb-3 block">FRESH DROPS</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-sd-ivory tracking-tight">
              New <span className="font-display italic font-normal text-sd-gold">Arrivals</span>
            </h2>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
             <button 
               onClick={() => scroll('left')}
               className="w-12 h-12 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold transition-all"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
               onClick={() => scroll('right')}
               className="w-12 h-12 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold transition-all"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-12 scrollbar-none snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0"
        >
          {products.map((product, index) => (
            <div key={product.id} className="flex-shrink-0 w-[260px] md:w-[300px] snap-start">
              <PremiumProductCard 
                product={product} 
                animDelay={index * 100}
                onOpen={(p) => window.location.href = `/e-commerce/product/${p.slug || p.id}`}
              />
            </div>
          ))}
          
          {/* View All Card at the end */}
          <div className="flex-shrink-0 w-[200px] flex items-center justify-center snap-start">
             <Link href="/e-commerce/products" className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 rounded-full border border-sd-border-default flex items-center justify-center text-sd-text-muted group-hover:border-sd-gold group-hover:text-sd-gold transition-all transform group-hover:scale-110">
                   <ChevronRight className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold tracking-[0.2em] text-sd-text-muted group-hover:text-sd-gold uppercase">View All</span>
             </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsScroll;
