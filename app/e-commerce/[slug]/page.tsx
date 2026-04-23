"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  ShoppingBag,
  Loader2,
  ArrowRight,
  SlidersHorizontal,
  X,
  History,
  Layers,
  Hash
} from 'lucide-react';

import Navigation from '@/components/ecommerce/Navigation';
import CategorySidebar from '@/components/ecommerce/category/CategorySidebar';
import { useCart } from '@/app/e-commerce/CartContext';
import catalogService, {
  CatalogCategory,
  SimpleProduct,
  GetProductsParams,
} from '@/services/catalogService';
import NeoProductCard from '@/components/ecommerce/ui/NeoProductCard';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoBadge from '@/components/ecommerce/ui/NeoBadge';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import { groupProductsByMother } from '@/lib/ecommerceProductGrouping';
import { fireToast } from '@/lib/globalToast';
import { motion, AnimatePresence } from 'framer-motion';

const UI_CARDS_PER_PAGE = 30;

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sd-ivory flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-black border-t-sd-gold animate-spin" />
        <span className="font-neo font-black text-[10px] uppercase tracking-widest">Scanning Sector...</span>
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}

function CategoryPageContent() {
  const params = useParams() as any;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const categorySlug = params.slug || '';

  // --- State ---
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CatalogCategory | null>(null);
  const fetchProductsIdRef = useRef(0);

  // --- Filter State (Synced with URL) ---
  const query = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort') as 'newest' | 'price_asc' | 'price_desc') || 'newest';
  const priceRange = searchParams.get('price') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // --- Local UI State ---
  const [searchInput, setSearchInput] = useState(query);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // --- Navigation Helper ---
  const updateURL = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || (key === 'page' && value === 1)) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    if (!updates.page) newParams.delete('page');

    router.push(`/e-commerce/${categorySlug}?${newParams.toString()}`);
  };

  // --- Effects ---
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categorySlug, query, sortBy, priceRange, currentPage, categories]);

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
    if (categories.length === 0) return;
    
    const currentFetchId = ++fetchProductsIdRef.current;
    setIsLoading(true);

    // Find active category to get its ID
    const findCategory = (cats: CatalogCategory[]): CatalogCategory | null => {
      for (const cat of cats) {
        if (cat.slug === categorySlug) return cat;
        if (cat.children?.length) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const foundCat = findCategory(categories);
    setActiveCategory(foundCat);

    try {
      const apiParams: any = {
        page: currentPage,
        per_page: UI_CARDS_PER_PAGE,
        category_id: foundCat?.id,
        sort_by: sortBy === 'newest' ? 'created_at' : sortBy,
        sort_order: sortBy === 'price_asc' ? 'asc' : 'desc',
        group_by_sku: true,
      };

      if (query) apiParams.search = query;
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-');
        if (min) apiParams.min_price = min;
        if (max) apiParams.max_price = max;
      }

      const response = await catalogService.getProducts(apiParams);
      if (currentFetchId !== fetchProductsIdRef.current) return;

      const displayProducts = response.grouped_products?.length
        ? response.grouped_products.map(gp => gp.main_variant)
        : response.products;

      setProducts(displayProducts as SimpleProduct[]);
    } catch (error) {
      if (currentFetchId === fetchProductsIdRef.current) {
        console.error('Failed to load products:', error);
        fireToast('Sector Synchronization Failed', 'error');
      }
    } finally {
      if (currentFetchId === fetchProductsIdRef.current) {
        setIsLoading(false);
      }
    }
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

  const handleCategoryChange = (val: string) => {
    if (val === 'all') {
      router.push('/e-commerce/products');
    } else {
      router.push(`/e-commerce/${val}`);
    }
  };

  return (
    <div className="min-h-screen bg-sd-ivory">
      <Navigation />

      {/* ── Category Header ── */}
      <header className="relative pt-32 pb-16 border-b-4 border-black bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-sd-gold/5 -skew-x-12 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-sd-gold/20" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Layers size={16} className="text-sd-gold" />
                <span className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-sd-gold italic">Department Classification</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-neo font-black uppercase tracking-tighter text-black leading-[0.85]">
                {activeCategory?.name || categorySlug.replace(/-/g, ' ')}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <NeoBadge variant="black" className="text-[10px]">Sector: {categorySlug.toUpperCase()}</NeoBadge>
                <NeoBadge variant="violet" className="text-[10px]">Protocol: Selective Discovery</NeoBadge>
              </div>
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
               activeCategory={categorySlug}
               onCategoryChange={handleCategoryChange}
               selectedPriceRange={priceRange}
               onPriceRangeChange={(val) => updateURL({ price: val })}
               selectedSort={sortBy}
               onSortChange={(val) => updateURL({ sort: val })}
               searchQuery={searchInput}
               onSearchChange={setSearchInput}
               useIdForRouting={false}
             />
          </aside>

          {/* ── Main Feed ── */}
          <div className="flex-1">
             {/* Mobile Actions */}
             <div className="lg:hidden flex flex-col gap-4 mb-10">
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
                  <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">
                    Retrieving artifacts for sector: <span className="text-black not-italic">{activeCategory?.name}</span>
                  </span>
               </div>
            </div>

            {/* Product Feed */}
            <div className="relative min-h-[600px]">
               {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
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
                    <h3 className="text-3xl font-neo font-black uppercase italic mb-4">Sector Depleted</h3>
                    <p className="font-neo text-[10px] uppercase tracking-widest text-black/40 mb-10 text-center max-w-xs leading-loose">
                      No archival matches remain in this classified sector with the current refinement parameters.
                    </p>
                    <NeoButton 
                      variant="outline" 
                      className="px-10 py-4 text-[10px]"
                      onClick={() => {
                         setSearchInput('');
                         updateURL({ search: null, price: 'all', sort: 'newest' });
                      }}
                    >
                      Reset Refinement
                    </NeoButton>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    activeCategory={categorySlug}
                    onCategoryChange={(val) => { handleCategoryChange(val); setShowMobileFilters(false); }}
                    selectedPriceRange={priceRange}
                    onPriceRangeChange={(val) => { updateURL({ price: val }); setShowMobileFilters(false); }}
                    selectedSort={sortBy}
                    onSortChange={(val) => { updateURL({ sort: val }); setShowMobileFilters(false); }}
                    searchQuery={searchInput}
                    onSearchChange={setSearchInput}
                    useIdForRouting={false}
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

