'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/CartContext';
import catalogService, { SimpleProduct } from '@/services/catalogService';
import { buildCardProductsFromResponse } from '@/lib/ecommerceCardUtils';
import NeoProductCard from '@/components/ecommerce/ui/NeoProductCard';
import NeoBadge from '@/components/ecommerce/ui/NeoBadge';
import { fireToast } from '@/lib/globalToast';
import { ArrowRight } from 'lucide-react';

interface NewArrivalsProps {
  categoryId?: number;
  limit?: number;
}

const toMs = (v: unknown): number => {
  if (!v) return 0;
  const ms = Date.parse(String(v));
  return Number.isFinite(ms) ? ms : 0;
};

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
      fireToast(`Added to registry: ${product?.name}`, 'success');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      fireToast(error?.message || 'Failed to add to registry', 'error');
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-sd-ivory px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-12">
            <div className="h-40 w-full sm:w-2/3 bg-black/5 neo-border-4 border-black/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-black/5 neo-border-4 border-black/10" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-sd-ivory relative overflow-hidden px-4 sm:px-6 lg:px-12">
      {/* Decorative Background Typography */}
      <div className="absolute top-20 right-[-5%] opacity-[0.03] pointer-events-none select-none hidden lg:block">
        <span className="text-[180px] font-neo font-black uppercase text-black">Arrivals</span>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl relative">
            <NeoBadge variant="gold" className="mb-6">Registry Entry Status: Live</NeoBadge>
            <h2 className="font-neo font-black text-6xl sm:text-8xl lg:text-[100px] uppercase leading-[0.8] tracking-tighter text-black">
              Newly <br />
              <span className="text-sd-gold italic">Cataloged</span>
            </h2>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-6">
            <Link 
              href="/e-commerce/products" 
              className="group flex items-center gap-4 bg-black text-white px-8 py-4 neo-border-2 hover:bg-sd-gold hover:text-black transition-all neo-shadow-sm"
            >
              <span className="font-neo font-black text-sm uppercase tracking-widest">Complete Archive</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {products.map((product, idx) => (
            <NeoProductCard
              key={product.id}
              product={product}
              onOpen={handleProductClick}
              onAddToCart={handleAddToCart}
              animDelay={idx * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;