'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  // The card product itself (spread from main_variant) has created_at
  const own = toMs((product as any)?.created_at);
  if (own > 0) return own;

  // Check variants as fallback
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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
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

      // We maintain client side sort to ensure flawless display regardless of unstable backend default ordering.
      const sorted = [...rawCards].sort((a, b) => getCreatedMs(b) - getCreatedMs(a));

      // Always show the newest top N products available, without strict date cutoffs.
      setProducts(sorted.slice(0, limit));
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (productId: number) => {
    setImageErrors(prev => {
      if (prev.has(productId)) return prev;
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
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
      <section style={{ background: '#ffffff', padding: '48px 0', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="ec-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ height: '1px', width: '48px', background: '#e0e0e0' }} />
            <div style={{ height: '24px', width: '180px', background: '#f5f5f5', borderRadius: '4px' }} />
            <div style={{ height: '1px', width: '48px', background: '#e0e0e0' }} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 md:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div style={{ aspectRatio: '2/3', background: '#f5f5f5', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ height: '14px', background: '#f5f5f5', borderRadius: '4px', width: '70%', marginBottom: '6px' }} />
                <div style={{ height: '14px', background: '#f5f5f5', borderRadius: '4px', width: '40%' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Section hides if there are no genuinely new products
  if (products.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 border-t border-sd-border-default/50 bg-sd-ivory ec-grain">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="font-mono text-[10px] text-sd-gold uppercase tracking-[0.5em] mb-4 block">New Entries</span>
            <h2 className="text-4xl lg:text-6xl font-display text-sd-black italic">Newly Cataloged</h2>
          </div>
          <Link 
            href="/e-commerce/products" 
            className="font-mono text-[10px] uppercase tracking-[0.3em] pb-1 border-b border-sd-border-default hover:border-sd-gold transition-colors inline-block"
          >
            Explore Complete Archive {'->'}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {products.map((product, idx) => (
            <PremiumProductCard
              key={product.id}
              product={product}
              imageErrored={imageErrors.has(product.id)}
              onImageError={handleImageError}
              onOpen={handleProductClick}
              onAddToCart={handleAddToCart}
              animDelay={idx * 50}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;