"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/ecommerce/Navigation';
import CategorySidebar from '@/components/ecommerce/category/CategorySidebar';
import { useCart } from '@/app/CartContext';
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
      <div className="ec-root bg-sd-black min-h-screen">
        <Navigation />
        <div className="container mx-auto px-6 py-12 lg:py-20 animate-pulse">
          <div className="h-10 w-64 bg-sd-onyx rounded mb-12" />
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="hidden lg:block w-64 h-[600px] bg-sd-onyx rounded-2xl" />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-sd-onyx rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ec-root bg-sd-black min-h-screen">
      <Navigation />

      {/* Header */}
      <div className="bg-sd-onyx/50 border-b border-sd-border-default mb-8 py-16 lg:py-24">
        <div className="container mx-auto px-6 text-center">
          <span className="text-sd-gold text-[10px] tracking-[0.4em] uppercase mb-4 block">Storefront</span>
          <h1 className="text-4xl lg:text-6xl font-bold text-sd-ivory mb-6 font-display italic">
            {activeCategory?.name || 'Collection'}
          </h1>
          <p className="text-sd-text-secondary max-w-2xl mx-auto">
            {activeCategory?.description || 'Browse our premium selection of precision-engineered accessories and digital essentials.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-24 lg:pb-32">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
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
          </aside>

          <main className="flex-1">
            {/* Mobile: Filters button pill */}
            <div className="lg:hidden mb-8">
               <button 
                 onClick={() => setIsFiltersOpen(true)}
                 className="w-full bg-sd-onyx border border-sd-border-default rounded-xl py-4 flex items-center justify-center gap-3 text-sm font-bold tracking-widest text-sd-ivory uppercase"
               >
                 FILTERS & SORTING
               </button>
            </div>

            {partialLoadWarning && !error && (
              <div className="mb-8 rounded-xl border border-sd-gold/20 bg-sd-gold/5 px-6 py-4 text-sm text-sd-gold">
                {partialLoadWarning}
              </div>
            )}

            {error ? (
              <div className="text-center py-32 bg-sd-onyx rounded-3xl border border-sd-border-default">
                <h3 className="text-xl font-bold text-sd-ivory mb-2">Failed to load products</h3>
                <p className="text-sd-text-secondary mb-8 max-w-xs mx-auto">We encountered an issue while reaching our catalog servers.</p>
                <button
                  onClick={() => fetchProducts(currentPage)}
                  className="px-10 py-3.5 bg-sd-gold text-sd-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-sd-gold-soft transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-sd-onyx rounded-3xl border border-dashed border-sd-border-default">
                <h3 className="text-2xl font-bold text-sd-ivory mb-2 font-display italic">Nothing here yet</h3>
                <p className="text-sd-text-secondary mb-8 max-w-xs mx-auto text-sm">Try adjusting your filters or browse our full collection.</p>
                <button 
                  onClick={() => {
                    setSelectedPriceRange('all');
                    handleCategoryChange('all');
                  }}
                  className="bg-sd-gold text-sd-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-sd-gold-soft transition-all"
                >
                  Browse All Products
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-4 md:gap-8">
                  {products.map((product, index) => (
                    <PremiumProductCard
                      key={product.id}
                      product={product as SimpleProduct}
                      animDelay={Math.min(index, 8) * 50}
                      onOpen={handleProductClick}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-20 gap-3">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold disabled:opacity-20 transition-all shadow-lg"
                    >
                      ←
                    </button>

                    <div className="flex items-center gap-2">
                       <span className="text-sd-text-muted text-xs font-bold tracking-widest uppercase">
                         Page {currentPage} of {totalPages}
                       </span>
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold disabled:opacity-20 transition-all shadow-lg"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {isFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-sd-black/80 backdrop-blur-sm z-[300]"
              onClick={closeFilters}
            />
            <motion.aside 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-sd-onyx z-[301] rounded-t-[2rem] overflow-hidden flex flex-col pt-safe shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-sd-border-default">
                <h2 className="text-xl font-bold text-sd-ivory font-display italic">Filters</h2>
                <button onClick={closeFilters} className="p-2 text-sd-text-secondary"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 pb-32">
                <CategorySidebar
                  categories={categories}
                  activeCategory={categorySlug}
                  onCategoryChange={(v) => {
                    closeFilters();
                    handleCategoryChange(v);
                  }}
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
