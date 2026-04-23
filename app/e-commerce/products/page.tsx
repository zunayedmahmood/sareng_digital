'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  ShoppingBag,
  Loader2,
  ArrowRight,
  SlidersHorizontal,
  X,
  History
} from 'lucide-react';

import Navigation from '@/components/ecommerce/Navigation';
import { useCart } from '@/app/e-commerce/CartContext';
import catalogService, {
  CatalogCategory,
  SimpleProduct,
  PaginationMeta
} from '@/services/catalogService';
import NeoProductCard from '@/components/ecommerce/ui/NeoProductCard';
import CategorySidebar from '@/components/ecommerce/category/CategorySidebar';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoBadge from '@/components/ecommerce/ui/NeoBadge';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import { fireToast } from '@/lib/globalToast';
import { motion, AnimatePresence } from 'framer-motion';

const PRODUCTS_PER_PAGE = 30;

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sd-ivory flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-black border-t-sd-gold animate-spin" />
        <span className="font-neo font-black text-[10px] uppercase tracking-widest">Initializing Registry...</span>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  // --- State ---
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchIdRef = useRef(0);

  // --- Filter State (Synced with URL) ---
  const query = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || 'all';
  const sortBy = (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc') || 'newest';
  const priceRange = searchParams.get('price') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // --- Local UI State ---
  const [searchInput, setSearchInput] = useState(query);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Notify navigation about mobile sidebar state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobile-sidebar-toggle', { detail: { open: showMobileFilters } }));
    return () => {
      window.dispatchEvent(new CustomEvent('mobile-sidebar-toggle', { detail: { open: false } }));
    };
  }, [showMobileFilters]);

  // --- Navigation Helper ---
  const updateURL = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || (key === 'page' && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (!updates.page) {
      params.delete('page');
    }

    router.push(`/e-commerce/products?${params.toString()}`);
  }, [searchParams, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== query) {
        updateURL({ search: searchInput || null });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, updateURL, query]);

  // --- Effects ---
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, categoryId, sortBy, priceRange, currentPage]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // --- Actions ---
  const fetchCategories = async () => {
    try {
      const data = await catalogService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

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
      if (currentFetchId === fetchIdRef.current) {
        console.error('Failed to load products:', error);
        fireToast('Registry Access Denied. Re-syncing...', 'error');
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchInput || null });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product: SimpleProduct) => {
    router.push(`/e-commerce/product/${product.id}`);
  };

  const handleAddToCart = async (product: SimpleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.has_variants) {
      handleProductClick(product);
      return;
    }

    try {
      await addToCart(product.id, 1);
      fireToast(`Artifact ${product.name} Secured`, 'success');
    } catch (err: any) {
      fireToast(err.message || 'Transfer Failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-sd-ivory">
      <Navigation />

      {/* ── Registry Header ── */}
      <header className="relative pt-32 pb-16 border-b-4 border-black bg-white overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-full bg-sd-gold/5 -skew-x-12 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-sd-gold/20" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <History size={16} className="text-sd-gold" />
                <span className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-sd-gold italic">Source: Central Registry</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-neo font-black uppercase tracking-tighter text-black leading-[0.85]">
                Master <span className="text-sd-gold">Catalog</span>
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <NeoBadge variant="black" className="text-[10px]">Protocol: Selective Discovery</NeoBadge>
                <NeoBadge variant="violet" className="text-[10px]">Updated: Real-time</NeoBadge>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Total Entries</span>
              <span className="text-5xl font-neo font-black text-black">
                {pagination?.total || '---'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Sidebar (Desktop) ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <CategorySidebar
               categories={categories}
               activeCategory={String(categoryId)}
               onCategoryChange={(val) => updateURL({ category: val })}
               selectedPriceRange={priceRange}
               onPriceRangeChange={(val) => updateURL({ price: val })}
               selectedSort={sortBy}
               onSortChange={(val) => updateURL({ sort: val })}
               searchQuery={searchInput}
               onSearchChange={setSearchInput}
               useIdForRouting={true}
             />
          </aside>

          {/* ── Main Feed ── */}
          <div className="flex-1">
            {/* Mobile Actions */}
            <div className="lg:hidden flex flex-col gap-4 mb-10">
              <form onSubmit={handleSearchSubmit} className="relative">
                 <NeoCard variant="white" hasHover={false} className="p-0 border-2 neo-shadow-sm overflow-hidden">
                    <div className="flex items-center px-4">
                       <Search size={18} className="text-black/20" />
                       <input 
                         type="text" 
                         placeholder="SCAN REGISTRY..."
                         value={searchInput}
                         onChange={e => setSearchInput(e.target.value)}
                         className="w-full py-4 px-4 font-neo font-black text-xs uppercase tracking-widest focus:outline-none placeholder:text-black/10"
                       />
                    </div>
                 </NeoCard>
              </form>
              <NeoButton 
                variant="primary" 
                className="w-full py-4 text-[10px]"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter size={14} /> Refine Classification
              </NeoButton>
            </div>

            {/* Grid Header */}
            <div className="flex items-center justify-between mb-10 border-b-2 border-black pb-4">
               <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-sd-gold animate-pulse" />
                  <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black">
                    Registry Stream: <span className="opacity-40 italic">Active</span>
                  </span>
               </div>
               <div className="hidden md:flex gap-4">
                  <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Sorted by: {sortBy.replace('_', ' ')}</span>
               </div>
            </div>

            {/* Product Feed */}
            <div className="relative min-h-[600px]">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-8">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] border-4 border-black bg-white/50 animate-pulse relative">
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-neo font-black text-[8px] uppercase tracking-widest opacity-20">Scanning...</span>
                       </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 border-4 border-black border-dashed rounded-[40px] bg-white/30">
                   <NeoBadge variant="black" className="mb-6">0 Results Detected</NeoBadge>
                   <h3 className="text-3xl font-neo font-black uppercase italic mb-4">No Retrieval Matches</h3>
                   <p className="font-neo text-[10px] uppercase tracking-widest text-black/40 mb-10 text-center max-w-xs leading-loose">
                     Your specific parameters did not yield any archival matches in the current sectors.
                   </p>
                   <NeoButton 
                     variant="outline" 
                     className="px-10 py-4 text-[10px]"
                     onClick={() => {
                        setSearchInput('');
                        updateURL({ search: null, category: 'all', sort: 'newest', price: 'all' });
                     }}
                   >
                     Reset All Protocol
                   </NeoButton>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {products.map((product, idx) => (
                     <NeoProductCard
                       key={product.id}
                       product={product}
                       onOpen={handleProductClick}
                       onAddToCart={handleAddToCart}
                       animDelay={idx * 50}
                     />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
              <div className="mt-24 pt-10 border-t-4 border-black flex flex-col items-center gap-10">
                <div className="flex items-center gap-4">
                  <NeoButton 
                    variant="outline" 
                    size="sm"
                    className="w-16 h-16 p-0"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ArrowRight className="rotate-180" size={20} />
                  </NeoButton>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.last_page) }).map((_, i) => {
                       const pNum = i + 1;
                       return (
                         <button
                           key={pNum}
                           onClick={() => handlePageChange(pNum)}
                           className={`w-12 h-12 border-2 border-black font-neo font-black text-[11px] transition-all
                             ${currentPage === pNum ? 'bg-sd-black text-sd-gold' : 'bg-white text-black hover:bg-sd-gold/10'}
                           `}
                         >
                           {String(pNum).padStart(2, '0')}
                         </button>
                       );
                    })}
                  </div>

                  <NeoButton 
                    variant="outline" 
                    size="sm"
                    className="w-16 h-16 p-0"
                    disabled={currentPage === pagination.last_page}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ArrowRight size={20} />
                  </NeoButton>
                </div>
                
                <div className="flex items-center gap-2">
                   <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Page</span>
                   <span className="font-neo font-black text-xl text-black">{currentPage}</span>
                   <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40">of {pagination.last_page}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Mobile Filters Overlay ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-[100] flex flex-col">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
               onClick={() => setShowMobileFilters(false)}
            />
            <motion.div 
               initial={{ y: '100%' }}
               animate={{ y: 0 }}
               exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="mt-auto relative bg-sd-ivory border-t-4 border-black rounded-t-[40px] max-h-[90vh] overflow-hidden flex flex-col"
            >
               <div className="flex items-center justify-between p-8 border-b-2 border-black/10">
                  <h3 className="font-neo font-black text-xl uppercase italic">Refinement</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 border-2 border-black flex items-center justify-center">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 pb-32">
                  <CategorySidebar
                    categories={categories}
                    activeCategory={String(categoryId)}
                    onCategoryChange={(val) => { updateURL({ category: val }); setShowMobileFilters(false); }}
                    selectedPriceRange={priceRange}
                    onPriceRangeChange={(val) => { updateURL({ price: val }); setShowMobileFilters(false); }}
                    selectedSort={sortBy}
                    onSortChange={(val) => { updateURL({ sort: val }); setShowMobileFilters(false); }}
                    searchQuery={searchInput}
                    onSearchChange={setSearchInput}
                    useIdForRouting={true}
                  />
               </div>
               
               <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 bg-sd-ivory border-t-2 border-black/10">
                  <NeoButton 
                    variant="primary" 
                    className="w-full py-5 text-[10px]"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Execute Parameters
                  </NeoButton>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
