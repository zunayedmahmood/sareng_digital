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
      <section className="py-20 bg-sd-black">
        <div className="container mx-auto px-6">
          <div className="h-10 w-64 bg-sd-onyx sd-skeleton rounded mb-12 mx-auto" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-sd-onyx sd-skeleton rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 lg:py-32 bg-sd-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sd-gold text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">TREINDING NOW</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-sd-ivory leading-tight">
            Our Best <span className="font-display italic font-normal text-sd-gold">Sellers</span>
          </h2>
          <div className="w-24 h-1 bg-sd-gold/20 mx-auto mt-8 rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
          {products.map((product, index) => (
            <PremiumProductCard 
              key={product.id}
              product={product}
              animDelay={index * 50}
              onOpen={(p) => window.location.href = `/e-commerce/product/${p.slug || p.id}`}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
           <button 
             onClick={() => window.location.href = '/e-commerce/products'}
             className="px-12 py-4 rounded-full border border-sd-gold text-sd-gold font-bold text-sm tracking-widest uppercase hover:bg-sd-gold hover:text-sd-black transition-all transform active:scale-95 shadow-sd-gold/10 shadow-lg"
           >
             Discover More Drops
           </button>
        </div>
      </div>
    </section>
  );
};

export default BestSellersGrid;
