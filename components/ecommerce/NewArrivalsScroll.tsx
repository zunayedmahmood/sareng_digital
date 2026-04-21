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
      <section className="py-16 bg-sd-ivory">
        <div className="container mx-auto px-6">
          <div className="h-8 w-48 bg-sd-black/5 sd-skeleton rounded mb-10" />
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-[280px] aspect-[3/4] bg-sd-black/5 sd-skeleton rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-sd-ivory overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-sd-black text-[10px] font-bold tracking-[0.4em] uppercase mb-3 block">FRESH DROPS</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-sd-black tracking-tight">
              New <span className="font-display italic font-normal text-sd-gold">Arrivals</span>
            </h2>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
             <button 
               onClick={() => scroll('left')}
               className="w-14 h-14 rounded-full border border-sd-black/10 flex items-center justify-center text-sd-black hover:bg-sd-black hover:text-sd-white hover:border-sd-black transition-all shadow-sm"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
               onClick={() => scroll('right')}
               className="w-14 h-14 rounded-full border border-sd-black/10 flex items-center justify-center text-sd-black hover:bg-sd-black hover:text-sd-white hover:border-sd-black transition-all shadow-sm"
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
          <div className="flex-shrink-0 w-[240px] flex items-center justify-center snap-start">
             <Link href="/e-commerce/products" className="flex flex-col items-center gap-6 group">
                <div className="w-20 h-20 rounded-full border border-sd-black/10 flex items-center justify-center text-sd-black/40 group-hover:bg-sd-black group-hover:text-sd-white group-hover:border-sd-black transition-all transform group-hover:scale-110 shadow-sm">
                   <ChevronRight className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.3em] text-sd-black/40 group-hover:text-sd-black uppercase transition-colors">View Curated List</span>
             </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsScroll;
