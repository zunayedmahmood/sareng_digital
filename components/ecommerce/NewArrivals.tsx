'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/CartContext';
import catalogService, { SimpleProduct } from '@/services/catalogService';
import { buildCardProductsFromResponse } from '@/lib/ecommerceCardUtils';
import PremiumProductCard from '@/components/ecommerce/ui/PremiumProductCard';
import { fireToast } from '@/lib/globalToast';

interface NewArrivalsProps {
  categoryId?: number;
  limit?: number;
}

/* Parse a date string → ms timestamp, returns 0 if unparseable */
const toMs = (v: unknown): number => {
  if (!v) return 0;
  const ms = Date.parse(String(v));
  return Number.isFinite(ms) ? ms : 0;
};

/**
 * Get the CREATION timestamp for a card product.
 * We deliberately ignore updated_at — an old product that was recently edited
 * should NOT reappear as a "new arrival".
 */
const getCreatedMs = (product: SimpleProduct): number => {
  const own = toMs((product as any)?.created_at);
  if (own > 0) return own;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  let best = 0;
  for (const v of variants) {
    const t = toMs((v as any)?.created_at);
    if (t > best) best = t;
  }
  return best;
};

const NewArrivals: React.FC<NewArrivalsProps> = ({ categoryId, limit = 8 }) => {
  const router = useRouter();
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchNewArrivals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, limit]);

  const fetchNewArrivals = async () => {
    setIsLoading(true);
    try {
      const response = await catalogService.getProducts({
        page: 1,
        per_page: limit,
        category_id: categoryId,
        sort_by: 'newest',
        sort: 'created_at',
        order: 'desc',
        sort_order: 'desc',
        new_arrivals: true,
      });

      const rawCards = buildCardProductsFromResponse(response);
      const sorted = [...rawCards].sort((a, b) => getCreatedMs(b) - getCreatedMs(a));
      setProducts(sorted.slice(0, limit));
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: SimpleProduct) => {
    router.push(`/e-commerce/product/${product.id}`);
  };

  const handleAddToCart = async (product: SimpleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.has_variants) {
      router.push(`/e-commerce/product/${product.id}`);
      return;
    }
    try {
      await addToCart(product.id, 1);
      fireToast(`Added to cart: ${product?.name || 'Item'}`, 'success');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      fireToast(error?.message || 'Failed to add to cart', 'error');
    }
  };

  if (isLoading) {
    return (
      <section className="py-32 bg-sd-ivory">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="animate-pulse">
            <div className="h-24 w-1/2 bg-sd-ivory-dark/20 mb-20 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-sd-ivory-dark/20 rounded-[32px]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-32 bg-sd-ivory relative overflow-hidden">
      {/* Decorative Background Typography */}
      <div className="absolute top-20 left-12 opacity-[0.03] pointer-events-none select-none hidden lg:block">
        <span className="text-[120px] font-display italic font-light text-sd-black">Newly Cataloged</span>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[9px] text-sd-gold font-bold uppercase tracking-[0.5em]">Current Entries: {products.length}</span>
              <div className="h-[1px] w-12 bg-sd-gold/30" />
            </div>
            <h2 className="text-6xl lg:text-8xl font-display text-sd-black leading-[0.85] tracking-tight">
              Latest <br />
              <span className="italic font-medium text-sd-gold">Artifacts</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-end gap-6">
            <Link 
              href="/e-commerce/products" 
              className="group flex flex-col items-end gap-1"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-sd-black font-bold group-hover:text-sd-gold transition-colors">Complete Archive</span>
              <div className="h-[1px] w-24 bg-sd-border-default/20 group-hover:w-full group-hover:bg-sd-gold/50 transition-all duration-500" />
            </Link>
          </div>
        </div>

        {/* Recessed Grid Well */}
        <div className="p-1 px-4 lg:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, idx) => (
              <PremiumProductCard
                key={product.id}
                product={product}
                onOpen={handleProductClick}
                onAddToCart={handleAddToCart}
                animDelay={idx * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;