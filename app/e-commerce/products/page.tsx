'use client';

import React, { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Loader2, 
  Filter, 
  X, 
  ShoppingBag,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import catalogService, { 
  CatalogCategory, 
  SimpleProduct, 
  PaginationMeta 
} from '@/services/catalogService';
import PremiumProductCard from '@/components/ecommerce/ui/PremiumProductCard';
import CatalogHeader from '@/components/ecommerce/CatalogHeader';
import ProductFilterSidebar from '@/components/ecommerce/ProductFilterSidebar';

const PRODUCTS_PER_PAGE = 24;

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sd-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sd-gold" />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State ---
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const fetchIdRef = useRef(0);

  // --- Filter State (Synced with URL) ---
  const query = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || 'all';
  const sortBy = (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc') || 'newest';
  const priceRange = searchParams.get('price') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const activeCategoryName = categories.find(c => String(c.id) === categoryId)?.name || 'Products';

  // --- Effects ---
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await catalogService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, categoryId, sortBy, priceRange, currentPage]);

  const fetchProducts = async () => {
    const currentFetchId = ++fetchIdRef.current;
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: PRODUCTS_PER_PAGE,
        sort_by: sortBy === 'newest' ? 'created_at' : sortBy,
        sort_order: sortBy === 'price_asc' ? 'asc' : 'desc',
        group_by_sku: true,
      };

      if (query) params.search = query;
      if (categoryId !== 'all') params.category_id = categoryId;

      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-');
        if (min) params.min_price = min;
        if (max) params.max_price = max;
      }

      const response = await catalogService.getProducts(params);

      if (currentFetchId !== fetchIdRef.current) return;

      const displayProducts = response.grouped_products?.length
        ? response.grouped_products.map(gp => gp.main_variant)
        : response.products;

      setProducts(displayProducts as SimpleProduct[]);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const updateURL = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || (key === 'page' && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (!updates.page) params.delete('page');
    router.push(`/e-commerce/products?${params.toString()}`);
  }, [searchParams, router]);

  const handlePageChange = (page: number) => {
    updateURL({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-sd-black min-h-screen">
      {/* Header */}
      <CatalogHeader 
        title={query ? `Results for "${query}"` : activeCategoryName} 
        count={pagination?.total}
        category={categoryId !== 'all' ? activeCategoryName : undefined}
      />

      <main className="container mx-auto px-6 py-12 lg:py-20">
        {/* Mobile Filters Trigger */}
        <div className="lg:hidden mb-8">
           <button 
             onClick={() => setShowMobileFilters(true)}
             className="w-full bg-sd-onyx border border-sd-border-default rounded-xl py-4 flex items-center justify-center gap-3 text-sm font-bold tracking-widest text-sd-ivory uppercase"
           >
             <SlidersHorizontal className="w-4 h-4 text-sd-gold" />
             Filters & Sorting
           </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilterSidebar 
              categories={categories}
              activeCategory={categoryId}
              onCategoryChange={(id) => updateURL({ category: id })}
              priceRange={priceRange}
              onPriceChange={(range) => updateURL({ price: range })}
              sortBy={sortBy}
              onSortChange={(sort) => updateURL({ sort: sort })}
            />
          </aside>

          {/* Product Feed */}
          <div className="flex-1">
             {isLoading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-sd-onyx rounded-xl" />
                  ))}
               </div>
             ) : products.length === 0 ? (
               <div className="py-24 text-center">
                  <ShoppingBag className="w-16 h-16 text-sd-gold/20 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-sd-ivory mb-2">No Products Found</h3>
                  <p className="text-sd-text-secondary mb-8">Try adjusting your filters or search query.</p>
                  <button 
                    onClick={() => updateURL({ category: 'all', price: 'all', search: null })}
                    className="bg-sd-gold text-sd-black px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-sd-gold-soft transition-colors"
                  >
                    Reset All Filters
                  </button>
               </div>
             ) : (
               <>
                 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
                    {products.map((p, i) => (
                      <PremiumProductCard 
                        key={p.id} 
                        product={p} 
                        animDelay={i * 30}
                        onOpen={(product) => window.location.href = `/e-commerce/product/${product.slug || product.id}`}
                      />
                    ))}
                 </div>

                 {/* Pagination */}
                 {pagination && pagination.last_page > 1 && (
                   <div className="mt-20 flex flex-col items-center gap-6">
                      <div className="flex items-center gap-4">
                        <button 
                          disabled={pagination.current_page === 1}
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          className="w-10 h-10 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold transition-colors disabled:opacity-20 disabled:pointer-events-none"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {[...Array(pagination.last_page)].map((_, i) => {
                            const page = i + 1;
                            // Show first, last, current, and one around current
                            if (page === 1 || page === pagination.last_page || Math.abs(page - pagination.current_page) <= 1) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                                    pagination.current_page === page 
                                    ? 'bg-sd-gold text-sd-black' 
                                    : 'text-sd-text-secondary hover:text-sd-ivory'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (page === 2 || page === pagination.last_page - 1) {
                               return <span key={page} className="text-sd-text-muted">...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <button 
                          disabled={pagination.current_page === pagination.last_page}
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          className="w-10 h-10 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold transition-colors disabled:opacity-20 disabled:pointer-events-none"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sd-text-muted">
                         Page {pagination.current_page} of {pagination.last_page}
                      </span>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-sd-black/80 backdrop-blur-sm z-[250]"
            />
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-sd-onyx z-[251] rounded-t-[2rem] overflow-hidden flex flex-col pt-safe"
            >
              <div className="p-6 flex items-center justify-between border-b border-sd-border-default">
                <h2 className="text-xl font-bold text-sd-ivory font-display italic">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-sd-text-secondary">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 pb-12">
                <ProductFilterSidebar 
                  categories={categories}
                  activeCategory={categoryId}
                  onCategoryChange={(id) => updateURL({ category: id })}
                  priceRange={priceRange}
                  onPriceChange={(range) => updateURL({ price: range })}
                  sortBy={sortBy}
                  onSortChange={(sort) => updateURL({ sort: sort })}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
