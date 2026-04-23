"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/ecommerce/Navigation';
import CategorySidebar from '@/components/ecommerce/category/CategorySidebar';
import { useCart } from '@/app/e-commerce/CartContext';
import catalogService, {
  CatalogCategory,
  Product,
  SimpleProduct,
  GetProductsParams,
} from '@/services/catalogService';
import PremiumProductCard from '@/components/ecommerce/ui/PremiumProductCard';
import { groupProductsByMother } from '@/lib/ecommerceProductGrouping';
import { X } from 'lucide-react';

/**
 * Normalizes keys for comparison (slugs, names, etc.)
 */
const normalizeKey = (value: string) =>
  decodeURIComponent(value || '')
    .toLowerCase()
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');

/**
 * Flattens nested category tree into a flat list
 */
const flattenCategories = (cats: CatalogCategory[]): CatalogCategory[] => {
  const result: CatalogCategory[] = [];

  const walk = (items: CatalogCategory[]) => {
    items.forEach((cat) => {
      result.push(cat);
      if (Array.isArray(cat.children) && cat.children.length > 0) {
        walk(cat.children);
      }
    });
  };

  walk(cats);
  return result;
};

/**
 * Gets all descendant category nodes including the root
 */
const getDescendantCategoryNodes = (category: CatalogCategory | null | undefined): CatalogCategory[] => {
  if (!category) return [];
  const nodes: CatalogCategory[] = [];
  const walk = (node: CatalogCategory) => {
    nodes.push(node);
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };
  walk(category);
  return nodes;
};

/**
 * Builds a set of allowed category IDs and normalized keys for a given category
 */
const buildAllowedCategoryKeys = (category: CatalogCategory | null, slugFallback: string) => {
  const ids = new Set<number>();
  const keys = new Set<string>();

  const addKey = (v: string | undefined | null) => {
    const k = normalizeKey(String(v || ''));
    if (k) keys.add(k);
  };

  if (category) {
    for (const node of getDescendantCategoryNodes(category)) {
      const id = Number((node as any)?.id || 0);
      if (id > 0) ids.add(id);
      addKey(node.name);
      addKey(node.slug);
    }
  }

  addKey(slugFallback);

  return { ids, keys };
};

/**
 * Verifies if a product belongs to the allowed categories
 */
const productMatchesAllowedCategory = (
  product: Product | SimpleProduct,
  allowed: { ids: Set<number>; keys: Set<string> }
) => {
  if ((!allowed.ids || allowed.ids.size === 0) && (!allowed.keys || allowed.keys.size === 0)) return true;

  const cat: any = (product as any)?.category;
  const catId = Number(cat?.id || 0);
  if (catId > 0 && allowed.ids.has(catId)) return true;

  const candidateKeys = [
    cat?.slug,
    cat?.name,
    (product as any)?.category_slug,
    (product as any)?.category_name,
  ]
    .map((v) => normalizeKey(String(v || '')))
    .filter(Boolean);

  return candidateKeys.some((k) => allowed.keys.has(k));
};

const UI_CARDS_PER_PAGE = 20;
const MAX_API_PAGES = 50;
const API_PER_PAGE = 60;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Fetches products from the service without noisy error logging
 */
const getProductsSilent = (params: GetProductsParams) =>
  catalogService.getProducts({ ...(params as any), _suppressErrorLog: true } as GetProductsParams);

/**
 * Groups flat products into representative mother products for display
 */
const buildCardProductsFromFlatCatalog = (rawProducts: (Product | SimpleProduct)[]): SimpleProduct[] => {
  const grouped = groupProductsByMother(rawProducts as any[], {
    useCategoryInKey: true,
    preferSkuGrouping: true,
  });

  return grouped.map((group) => {
    const rawVariants = (group.variants || [])
      .map((variant) => variant.raw)
      .filter(Boolean) as SimpleProduct[];

    const uniqueVariants = new Map<number, SimpleProduct>();
    rawVariants.forEach((variant) => {
      const id = Number((variant as any)?.id) || 0;
      if (!id) return;
      if (!uniqueVariants.has(id)) uniqueVariants.set(id, variant);
    });

    const all = Array.from(uniqueVariants.values());

    // Propagate images across variants
    const fallbackImages =
      all.find((v) => (v as any).images?.some((img: any) => img?.is_primary))?.images ||
      all.find((v) => Array.isArray((v as any).images) && (v as any).images.length > 0)?.images ||
      [];
    const allWithImages = fallbackImages.length
      ? all.map((v) =>
        Array.isArray((v as any).images) && (v as any).images.length > 0
          ? v
          : { ...(v as any), images: fallbackImages }
      )
      : all;

    const representative =
      (allWithImages.find((v) => Number(v.id) === Number((group.representative as any)?.id)) as SimpleProduct) ||
      (group.representative as SimpleProduct) ||
      allWithImages.find((variant) => Number(variant.stock_quantity || 0) > 0) ||
      allWithImages[0];

    if (!representative) {
      return {
        id: Number(group.representativeId || 0),
        name: group.baseName || 'Product',
        display_name: group.baseName || 'Product',
        base_name: group.baseName || 'Product',
        sku: '',
        selling_price: 0,
        stock_quantity: 0,
        description: '',
        images: [],
        in_stock: false,
        has_variants: false,
        total_variants: 0,
        variants: [],
      } as SimpleProduct;
    }

    const variantsWithoutRepresentative = allWithImages.filter(
      (variant) => Number(variant.id) !== Number(representative.id)
    );

    return {
      ...representative,
      name: group.baseName || (representative as any).base_name || representative.name,
      display_name: group.baseName || (representative as any).display_name || (representative as any).base_name || representative.name,
      base_name: group.baseName || (representative as any).base_name || representative.name,
      has_variants: all.length > 1,
      total_variants: all.length,
      variants: variantsWithoutRepresentative,
    } as SimpleProduct;
  });
};

/**
 * Category feed page component
 */
export default function CategoryPage() {
  const params = useParams() as any;
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();

  const categorySlug = params.slug || '';

  const [products, setProducts] = useState<(Product | SimpleProduct)[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [activeCategoryName, setActiveCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialLoadWarning, setPartialLoadWarning] = useState<string | null>(null);

  const [selectedSort, setSelectedSort] = useState<GetProductsParams['sort_by']>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isClosingFilters, setIsClosingFilters] = useState(false);
  
  // Notify navigation about mobile sidebar state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobile-sidebar-toggle', { detail: { open: isFiltersOpen } }));
    return () => {
      window.dispatchEvent(new CustomEvent('mobile-sidebar-toggle', { detail: { open: false } }));
    };
  }, [isFiltersOpen]);

  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const fetchProductsIdRef = useRef(0);

  type CacheEntry = {
    key: string;
    attemptParams: Record<string, any>;
    fetchedApiPages: number;
    apiLastPage: number | null;
    hasMore: boolean;
    rawById: Map<number, Product | SimpleProduct>;
    rawOrdered: Array<Product | SimpleProduct>;
    cards: SimpleProduct[];
    partialWarning: string | null;
  };

  const cacheRef = useRef<Record<string, CacheEntry>>({});

  const normalizedSlug = useMemo(() => normalizeKey(categorySlug), [categorySlug]);
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  /**
   * Identifies the current active category from the flat list
   */
  const activeCategory = useMemo(() => {
    return (
      flatCategories.find((cat) => {
        const slugKey = normalizeKey(cat.slug || '');
        const nameKey = normalizeKey(cat.name || '');
        return slugKey === normalizedSlug || nameKey === normalizedSlug;
      }) || null
    );
  }, [flatCategories, normalizedSlug]);

  /**
   * Fetches the category tree for the sidebar
   */
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categoryData = await catalogService.getCategories();
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  /**
   * Builds the API parameters for the catalog request
   */
  const buildAttemptParams = (): Record<string, any> => {
    const baseParams: GetProductsParams & Record<string, any> = {
      page: 1,
      per_page: API_PER_PAGE,
      sort_by: selectedSort,
      search: searchQuery || undefined,
    };

    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      if (!Number.isNaN(min)) baseParams.min_price = min;
      if (!Number.isNaN(max)) baseParams.max_price = max;
    }

    if (activeCategory?.id || activeCategory?.slug) {
      return {
        ...baseParams,
        category_id: activeCategory?.id,
        category_slug: activeCategory?.slug,
      };
    }
    if (categorySlug) {
      return {
        ...baseParams,
        category_slug: categorySlug,
      };
    }
    return { ...baseParams };
  };

  /**
   * Generates a unique key for caching product results
   */
  const getCacheKey = () => {
    const slugKey = normalizeKey(categorySlug || '');
    return [
      'cat',
      slugKey,
      String(activeCategory?.id || ''),
      selectedSort || '',
      selectedPriceRange,
      searchQuery,
    ].join('::');
  };

  /**
   * Ensures enough cards are loaded/grouped to fill the requested UI page
   */
  const ensureCardsForUiPage = async (entry: CacheEntry, uiPage: number) => {
    const targetCards = uiPage * UI_CARDS_PER_PAGE;
    const allowedCategory = buildAllowedCategoryKeys(activeCategory || null, categorySlug);
    const serverSideCategoryFiltered = Boolean(
      (entry.attemptParams as any)?.category_slug || (entry.attemptParams as any)?.category_id
    );

    const appendFilteredUniqueProducts = (items: (Product | SimpleProduct)[] | undefined | null) => {
      if (!Array.isArray(items) || items.length === 0) return 0;
      let added = 0;
      for (const rawItem of items) {
        if (!rawItem) continue;
        if (!serverSideCategoryFiltered) {
          if (!productMatchesAllowedCategory(rawItem, allowedCategory)) continue;
        }

        const itemId = Number((rawItem as any).id || 0);
        if (itemId > 0) {
          if (entry.rawById.has(itemId)) continue;
          entry.rawById.set(itemId, rawItem);
        }

        entry.rawOrdered.push(rawItem);
        added += 1;
      }
      return added;
    };

    while (entry.cards.length < targetCards && entry.hasMore && entry.fetchedApiPages < MAX_API_PAGES) {
      const nextApiPage = entry.fetchedApiPages + 1;

      try {
        const res = await getProductsSilent({ ...(entry.attemptParams as any), page: nextApiPage } as GetProductsParams);
        entry.fetchedApiPages = nextApiPage;

        const nextProducts = Array.isArray(res?.products) ? (res.products as any[]) : [];
        const lastPage = Number(res?.pagination?.last_page || 0);
        if (Number.isFinite(lastPage) && lastPage > 0) entry.apiLastPage = lastPage;

        appendFilteredUniqueProducts(nextProducts);

        if (nextProducts.length === 0) {
          entry.hasMore = false;
        } else if (res?.pagination?.has_more_pages === false) {
          entry.hasMore = false;
        } else if (entry.apiLastPage && entry.fetchedApiPages >= entry.apiLastPage) {
          entry.hasMore = false;
        }

        entry.cards = buildCardProductsFromFlatCatalog(entry.rawOrdered);
      } catch (err) {
        console.warn(`Error fetching products api page ${nextApiPage}`, err);
        entry.hasMore = false;
        entry.partialWarning = 'Some products could not be loaded due to a server data issue.';
        break;
      }
    }
  };

  /**
   * Main function to fetch products for the display
   */
  const fetchProducts = async (uiPage = 1) => {
    if (categoriesLoading) return;

    const currentFetchId = ++fetchProductsIdRef.current;
    setLoading(true);
    setPartialLoadWarning(null);
    try {
      const key = getCacheKey();
      let entry = cacheRef.current[key];
      if (!entry) {
        entry = {
          key,
          attemptParams: buildAttemptParams(),
          fetchedApiPages: 0,
          apiLastPage: null,
          hasMore: true,
          rawById: new Map(),
          rawOrdered: [],
          cards: [],
          partialWarning: null,
        };
        cacheRef.current[key] = entry;
      }

      await ensureCardsForUiPage(entry, uiPage);

      // Check if this is still the latest request before state updates
      if (currentFetchId !== fetchProductsIdRef.current) return;

      const computedTotalPages = Math.max(1, Math.ceil(entry.cards.length / UI_CARDS_PER_PAGE));
      const safeUiPage = clamp(uiPage, 1, Math.max(computedTotalPages, entry.hasMore ? uiPage : computedTotalPages));
      const startIndex = (safeUiPage - 1) * UI_CARDS_PER_PAGE;
      const pageCards = entry.cards.slice(startIndex, startIndex + UI_CARDS_PER_PAGE);

      setProducts(pageCards);
      setTotalResults(entry.cards.length);
      setCurrentPage(safeUiPage);
      setTotalPages(entry.hasMore ? Math.max(computedTotalPages, safeUiPage + 1) : computedTotalPages);
      setError(null);
      setPartialLoadWarning(entry.partialWarning);
    } catch (err) {
      if (currentFetchId === fetchProductsIdRef.current) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setPartialLoadWarning(null);
        setProducts([]);
        setTotalResults(0);
      }
    } finally {
      if (currentFetchId === fetchProductsIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setImageErrors(new Set());
    cacheRef.current = {};
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory?.id, categoriesLoading, selectedPriceRange, selectedSort, searchQuery]);

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => {
      if (prev.has(productId)) return prev;
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  /**
   * Handles adding a product to the cart
   */
  const handleAddToCart = async (product: SimpleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (product.has_variants) {
        router.push(`/e-commerce/product/${product.id}`);
        return;
      }
      await addToCart(product.id, 1);
      setIsCartOpen(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  /**
   * Navigates to the product detail page
   */
  const handleProductClick = (product: SimpleProduct) => {
    router.push(`/e-commerce/product/${product.id}`);
  };

  /**
   * Handles category selection change
   */
  const handleCategoryChange = (categoryNameOrSlug: string) => {
    if (categoryNameOrSlug === 'all') {
      router.push('/e-commerce/products');
      return;
    }
    router.push(`/e-commerce/${encodeURIComponent(categoryNameOrSlug)}`);
  };

  const closeFilters = () => {
    setIsClosingFilters(true);
    setTimeout(() => {
      setIsFiltersOpen(false);
      setIsClosingFilters(false);
    }, 450);
  };

  /**
   * Handles pagination page change
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && products.length === 0) {
    return (
      <>
        <Navigation />
        <div className="ec-root bg-[var(--bg-root)] min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 rounded w-1/4 mb-8 animate-pulse" style={{ background: 'var(--ivory-ghost)' }}></div>
              <div className="flex gap-8">
                <div className="w-64 h-96 rounded-lg animate-pulse" style={{ background: 'var(--bg-surface)' }}></div>
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-lg animate-pulse bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-sd-ivory relative overflow-hidden">
      <Navigation />
      
      {/* ── Background Typography ── */}
      <div className="absolute top-[5%] right-[-5%] opacity-[0.02] pointer-events-none select-none">
        <span className="text-[25vw] font-display italic font-light text-sd-black leading-none whitespace-nowrap">
           Registry
        </span>
      </div>

      <main className="pt-32 pb-40 relative z-10">
        <div className="container mx-auto px-6 lg:px-12">
          
          {/* Header Strip */}
          <div className="bg-sd-white sd-depth-lift rounded-[32px] mb-20 overflow-hidden relative border border-sd-border-default/20">
             <div className="absolute top-0 right-0 w-32 h-32 bg-sd-gold/5 rounded-bl-full pointer-events-none" />
             <div className="px-10 py-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div>
                   <div className="flex items-center gap-4 mb-6">
                      <span className="font-mono text-[10px] font-bold text-sd-gold uppercase tracking-[0.5em]">Dept classification</span>
                      <div className="h-[1px] w-12 bg-sd-gold/30" />
                   </div>
                   <h1 className="text-6xl lg:text-8xl font-display text-sd-black italic leading-[0.8]">
                      {activeCategory?.name || 'Anthology'}
                   </h1>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-sd-text-muted">Archives Found</span>
                   <span className="font-mono text-3xl font-bold text-sd-black">{totalResults}</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-16 items-start">
            {/* ── 1. Registry Filters (Sidebar) ── */}
            <aside className="hidden xl:block w-72 lg:sticky lg:top-32">
               <div className="sd-depth-recess bg-sd-ivory-dark/10 rounded-[40px] p-8">
                  <CategorySidebar
                    categories={categories}
                    activeCategory={categorySlug}
                    onCategoryChange={handleCategoryChange}
                    selectedPriceRange={selectedPriceRange}
                    onPriceRangeChange={setSelectedPriceRange}
                    selectedStock="all"
                    onStockChange={() => { }}
                    selectedSort={selectedSort}
                    onSortChange={setSelectedSort}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
               </div>
            </aside>

            {/* ── 2. Artifact Registry (Main Feed) ── */}
            <div className="flex-1 w-full">
              {partialLoadWarning && !error && (
                <div className="mb-10 p-4 border border-sd-gold/20 bg-sd-gold/5 rounded-2xl">
                   <p className="font-mono text-[10px] text-sd-gold uppercase tracking-widest text-center">{partialLoadWarning}</p>
                </div>
              )}

              {error ? (
                <div className="sd-depth-recess bg-sd-white/50 rounded-[40px] py-32 text-center flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full border-2 border-sd-gold/20 flex items-center justify-center mb-8">
                      <X className="text-sd-gold" size={32} strokeWidth={1} />
                   </div>
                   <h2 className="font-display text-4xl italic text-sd-black mb-6">Synchronization Failed</h2>
                   <button 
                     onClick={() => fetchProducts(currentPage)}
                     className="bg-sd-black text-sd-white h-14 px-10 rounded-2xl font-mono text-[10px] uppercase tracking-[0.4em] hover:sd-depth-lift transition-all"
                   >
                     Re-Sync Registry
                   </button>
                </div>
              ) : products.length === 0 && !loading ? (
                <div className="sd-depth-recess bg-sd-white/50 rounded-[40px] py-32 text-center flex flex-col items-center border border-dashed border-sd-border-default/30">
                   <div className="w-20 h-20 rounded-full border border-sd-border-default flex items-center justify-center mb-8 opacity-40">
                      <Hash className="text-sd-text-muted" size={32} strokeWidth={1} />
                   </div>
                   <h2 className="font-display text-4xl italic text-sd-black mb-4 opacity-40">Registry Empty</h2>
                   <p className="font-mono text-[10px] text-sd-text-muted uppercase tracking-widest mb-10">No items detected for the current parameters.</p>
                   <button 
                     onClick={() => {
                        setSelectedPriceRange('all');
                        handleCategoryChange('all');
                     }}
                     className="border border-sd-black h-14 px-10 rounded-2xl font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-sd-black hover:text-sd-white transition-all"
                   >
                     Clear Fragments
                   </button>
                </div>
              ) : (
                <div className="space-y-20">
                   <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-y-16 gap-x-8">
                      {products.map((item, idx) => (
                        <PremiumProductCard 
                          key={item.id} 
                          product={item as SimpleProduct} 
                          animDelay={idx * 50}
                          onOpen={handleProductClick}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                   </div>

                   {/* Registry Pagination */}
                   {totalPages > 1 && (
                      <div className="pt-20 border-t border-sd-border-default/10 flex items-center justify-center gap-4">
                         <button
                           onClick={() => handlePageChange(currentPage - 1)}
                           disabled={currentPage === 1}
                           className="w-14 h-14 rounded-2xl border border-sd-border-default flex items-center justify-center text-sd-black hover:bg-sd-black hover:text-sd-white transition-all disabled:opacity-20 mr-4"
                         >
                            <ChevronLeft size={20} />
                         </button>

                         <div className="flex items-center gap-2">
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                               const pageNum = i + 1;
                               return (
                                 <button
                                   key={pageNum}
                                   onClick={() => handlePageChange(pageNum)}
                                   className={`
                                      w-12 h-12 rounded-xl font-mono text-[10px] font-bold transition-all
                                      ${currentPage === pageNum 
                                        ? 'bg-sd-gold text-sd-black sd-depth-lift' 
                                        : 'bg-sd-white text-sd-text-muted border border-sd-border-default/50 hover:border-sd-gold hover:text-sd-black'}
                                   `}
                                 >
                                    {String(pageNum).padStart(2, '0')}
                                 </button>
                               );
                            })}
                         </div>

                         <button
                           onClick={() => handlePageChange(currentPage + 1)}
                           disabled={currentPage === totalPages}
                           className="w-14 h-14 rounded-2xl border border-sd-border-default flex items-center justify-center text-sd-black hover:bg-sd-black hover:text-sd-white transition-all disabled:opacity-20 ml-4"
                         >
                            <ChevronRight size={20} />
                         </button>
                      </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Registry Control Pad */}
      <div className="xl:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full px-6 max-w-[280px]">
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="w-full h-16 bg-sd-black text-sd-white rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all border border-sd-white/10"
        >
          <Filter size={14} className="text-sd-gold" />
          Refine Search
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFiltersOpen && (
          <div className="fixed inset-0 z-[200]">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-sd-black/80 backdrop-blur-xl"
               onClick={closeFilters}
            />
            <motion.div 
               initial={{ y: '100%' }}
               animate={{ y: 0 }}
               exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="absolute bottom-0 left-0 right-0 bg-sd-ivory rounded-t-[48px] max-h-[90vh] overflow-hidden flex flex-col"
            >
               <div className="w-12 h-1.5 bg-sd-border-default/20 rounded-full mx-auto my-6" />
               <div className="px-10 pb-10 overflow-y-auto no-scrollbar">
                  <CategorySidebar
                    categories={categories}
                    activeCategory={categorySlug}
                    onCategoryChange={(v) => { closeFilters(); handleCategoryChange(v); }}
                    selectedPriceRange={selectedPriceRange}
                    onPriceRangeChange={setSelectedPriceRange}
                    selectedStock="all"
                    onStockChange={() => { }}
                    selectedSort={selectedSort}
                    onSortChange={setSelectedSort}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
               </div>
               <div className="px-10 pb-10 pt-4 bg-sd-ivory border-t border-sd-border-default/10">
                  <button 
                     onClick={closeFilters}
                     className="w-full h-16 bg-sd-black text-sd-white rounded-2xl font-mono text-[10px] font-bold uppercase tracking-[0.4em]"
                  >
                     Review Registry
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
}
