'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import catalogService, { SimpleProduct } from '@/services/catalogService';
import PremiumProductCard from './ui/PremiumProductCard';

const BestSellersGrid: React.FC = () => {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetching "featured" or top sold items
        const data = await catalogService.getProducts({ 
          per_page: 8,
          // Assuming there's a way to get best sellers, or just use featured
        });
        setProducts(data.data || []);
      } catch (error) {
        console.error('Failed to fetch best sellers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-sd-ivory">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-10 w-64 bg-sd-black/5 sd-skeleton rounded mb-12 mx-auto" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-sd-black/5 sd-skeleton rounded-[30px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 lg:py-40 bg-sd-ivory">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <span className="text-sd-black text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">TRENDING DROPS</span>
          <h2 className="text-4xl lg:text-6xl font-bold text-sd-black leading-tight tracking-tight">
            Our Most <span className="font-display italic font-normal text-sd-gold">Acquired</span> Designs
          </h2>
          <div className="w-20 h-1 bg-sd-gold/30 mx-auto mt-10 rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
          {products.map((product, index) => (
            <PremiumProductCard 
              key={product.id}
              product={product}
              animDelay={index * 50}
              onOpen={(p) => window.location.href = `/e-commerce/product/${p.slug || p.id}`}
            />
          ))}
        </div>

        <div className="mt-24 text-center">
           <button 
             onClick={() => window.location.href = '/e-commerce/products'}
             className="group px-14 py-6 rounded-full bg-sd-black text-sd-white font-bold text-xs tracking-[0.2em] uppercase hover:bg-sd-gold hover:text-sd-black transition-all shadow-sd-card hover:shadow-sd-hover active:scale-95"
           >
             Explore Full Repository
           </button>
        </div>
      </div>
    </section>
  );
};

export default BestSellersGrid;
