'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import catalogService, { CatalogCategory, SimpleProduct } from '@/services/catalogService';
import { buildCardProductsFromResponse } from '@/lib/ecommerceCardUtils';
import PremiumProductCard from '@/components/ecommerce/ui/PremiumProductCard';
import { useCart } from '@/app/CartContext';
import { fireToast } from '@/lib/globalToast';

/* ─── helpers ────────────────────────────────────────────────────────────── */

const normalizeKey = (v: unknown): string =>
  String(v || '').toLowerCase().trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');

const catSlug = (c: CatalogCategory) =>
  c.slug || c.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

/** Flatten the full category tree into a flat array */
const flattenAll = (nodes: CatalogCategory[]): CatalogCategory[] => {
  const out: CatalogCategory[] = [];
  const walk = (list: CatalogCategory[]) =>
    list.forEach(n => { out.push(n); if (n.children?.length) walk(n.children); });
  walk(nodes);
  return out;
};

/* ─── component ─────────────────────────────────────────────────────────── */

interface TabData {
  category: CatalogCategory;
  products: SimpleProduct[];
  loading: boolean;
  loaded: boolean;
}

const GRADIENTS = [
  'linear-gradient(160deg,#e8e4df 0%,#d3cdc5 40%,#b8b0a5 100%)',
  'linear-gradient(160deg,#dde4e8 0%,#c5cdd3 40%,#a5b0b8 100%)',
  'linear-gradient(160deg,#e8e4df 0%,#c8c2ba 40%,#a59e95 100%)',
];

interface SubcategoryProductTabsProps {
  tabsCount?: number;
  productsPerTab?: number;
  /** Parent category matchers (slug or name). Example: ["sneakers"] */
  parentQueries?: string[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** If parent category isn't found, hide the whole section instead of falling back to random leaves. */
  hideIfNotFound?: boolean;
}


const SubcategoryProductTabs: React.FC<SubcategoryProductTabsProps> = ({
  tabsCount = 6,
  productsPerTab = 8,
  parentQueries = ['sneakers', 'sneaker'],
  eyebrow,
  title,
  subtitle,
  hideIfNotFound = true,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();

  const [allCats, setAllCats] = useState<CatalogCategory[]>([]);
  const [tabs, setTabs] = useState<CatalogCategory[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null); // null means "All Products"
  const [tabData, setTabData] = useState<Record<string, TabData>>({}); // use string key to handle 'all'
  const [loadingCats, setLoadingCats] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [parentLabel, setParentLabel] = useState<string>('');
  const [parentNode, setParentNode] = useState<CatalogCategory | null>(null);
  const [heroImgByCat, setHeroImgByCat] = useState<Record<number, string>>({});
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string | number, HTMLButtonElement | null>>({});


  const findParentNode = (flat: CatalogCategory[], queries: string[]): CatalogCategory | null => {
    const q = (queries || []).map(normalizeKey).filter(Boolean);
    if (!q.length) return null;

    // Exact match by slug or name
    for (const needle of q) {
      const exact =
        flat.find(c => normalizeKey(c?.slug) === needle || normalizeKey(c?.name) === needle) || null;
      if (exact) return exact;
    }

    // Contains match (e.g. "Sneakers Collection", "Fashion Accessories")
    for (const needle of q) {
      const relaxed =
        flat.find(
          c => normalizeKey(c?.slug).includes(needle) || normalizeKey(c?.name).includes(needle)
        ) || null;
      if (relaxed) return relaxed;
    }

    return null;
  };

  const uniqById = (list: CatalogCategory[]): CatalogCategory[] => {
    const seen = new Set<number>();
    const out: CatalogCategory[] = [];
    list.forEach(c => {
      const id = Number(c?.id || 0);
      if (!id || seen.has(id)) return;
      seen.add(id);
      out.push(c);
    });
    return out;
  };

  /* ── load category tree ─────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const tree = await catalogService.getCategories();
        const flat = flattenAll(tree);


        /**
         * "Shop by Subcategory" section:
         * - Find a parent category by slug/name (parentQueries)
         * - Show ALL subcategories under that parent
         * - Top 3 (by product_count) appear as image banner cards
         * - The rest appear as pill/capsule tabs
         */
        const parent = findParentNode(flat, parentQueries);
        if (alive) {
          setParentLabel(parent?.name || '');
          setParentNode(parent);
        }
        let selected: CatalogCategory[] = [];

        if (parent) {
          if (parent.children?.length) {
            const descendants = flattenAll(parent.children);
            let leaves = descendants.filter(c => c.name && !c.children?.length);
            if (!leaves.length) leaves = descendants.filter(c => c.name);
            selected = uniqById(leaves);
          } else {
            selected = [parent];
          }

          selected.sort((a, b) => Number(b.product_count || 0) - Number(a.product_count || 0));
        }

        if (!selected.length && !hideIfNotFound) {
          let leaves = flat.filter(c => c.name && !c.children?.length);
          leaves.sort((a, b) => Number(b.product_count || 0) - Number(a.product_count || 0));
          selected = leaves.slice(0, tabsCount);

          if (selected.length < 2) {
            const allNamed = [...flat].filter(c => c.name);
            allNamed.sort((a, b) => Number(b.product_count || 0) - Number(a.product_count || 0));
            selected = allNamed.slice(0, tabsCount);
          }
        }

        if (!alive) return;
        setAllCats(flat);
        setTabs(selected);
        // Default to first tab instead of "All Products"
        if (selected.length > 0) {
          setActiveId(selected[0].id);
        }
      } catch (e) {
        console.error('SubcategoryTabs: failed to load categories', e);
      }
      if (alive) setLoadingCats(false);
    })();
    return () => { alive = false; };
  }, [tabsCount]);

  /**
   * Ensure top 3 banner cards have an image.
   * If category image is missing, use the first product image from that subcategory.
   */
  useEffect(() => {
    let alive = true;
    const top3 = tabs.slice(0, 3);
    if (!top3.length) return;

    (async () => {
      for (const cat of top3) {
        const existing = heroImgByCat[cat.id];
        const direct = cat.image_url || (cat as any).image || '';
        if (existing || direct) continue;

        try {
          const response = await catalogService.getProducts({
            page: 1,
            per_page: 4,
            category_id: cat.id,
            sort_by: 'newest',
          });
          const cards = buildCardProductsFromResponse(response);
          const img = (cards?.[0]?.images?.[0] as any)?.url || '';
          if (alive && img) {
            setHeroImgByCat(prev => ({ ...prev, [cat.id]: img }));
          }
        } catch {
          /* ignore fetch errors for images */
        }
      }
    })();

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.map(t => t.id).join('|')]);

  /* ── fetch products for active tab ──────────────────────────────── */
  useEffect(() => {
    // If activeId is null, we are in "All Products" for the parentNode
    // If we have categories but no explicit selection yet, wait for logic above.
    if (activeId === undefined) return;

    const key = activeId === null ? 'all' : String(activeId);
    if (tabData[key]?.loaded || tabData[key]?.loading) return;

    const cat = activeId === null ? (parentNode || null) : tabs.find(c => c.id === activeId);
    if (!cat && activeId !== null) return;

    let alive = true;
    setTabData(p => ({ ...p, [key]: { category: cat!, products: [], loading: true, loaded: false } }));

    (async () => {
      let products: SimpleProduct[] = [];
      try {
        const targetId = activeId;
        if (!targetId) return;

        const response = await catalogService.getProducts({
          page: 1,
          per_page: productsPerTab,
          category_id: targetId,
          sort_by: 'newest',
          group_by_sku: true as any,
        } as any);

        // Standard logic from products/page.tsx: use grouped_products if available
        const rawProducts = response.grouped_products?.length
          ? response.grouped_products.map(gp => gp.main_variant)
          : response.products;

        products = buildCardProductsFromResponse({ ...response, products: rawProducts });
      } catch (e) {
        console.error('SubcategoryTabs: fetch failed', e);
      }

      if (alive) {
        setTabData(p => ({ ...p, [key]: { category: cat!, products, loading: false, loaded: true } }));
      }
    })();

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, tabs.length, parentNode?.id]);

  const activeKey = activeId === null ? 'all' : String(activeId);
  const activeTab = tabData[activeKey];
  const onImgError = (id: number) => setImageErrors(prev => { const s = new Set(prev); s.add(id); return s; });

  const onProductClick = (p: SimpleProduct) => router.push(`/e-commerce/product/${p.id}`);
  const onAddToCart = async (p: SimpleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (p.has_variants) { router.push(`/e-commerce/product/${p.id}`); return; }
    try {
      await addToCart(p.id, 1);
      fireToast(`Added to cart: ${p?.name || 'Item'}`, 'success');
    } catch (error: any) {
      fireToast(error?.message || 'Failed to add to cart', 'error');
    }
  };

  /* ── skeleton ── */
  if (loadingCats) {
    return (
      <section className="py-24 lg:py-32 border-t border-sd-border-default/50 bg-sd-ivory">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col gap-6 mb-16 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-2 w-24 bg-sd-gold/20" />
              <div className="h-[1px] flex-1 bg-sd-border-default/30" />
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="h-12 w-64 lg:h-16 lg:w-96 bg-sd-ivory-dark/40 mb-6" />
                <div className="h-4 w-48 bg-sd-ivory-dark/40" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-24 bg-sd-ivory-dark/20 border border-sd-border-default/30" />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-sd-ivory-dark/40 mb-4 border border-sd-border-default" />
                <div className="h-4 bg-sd-ivory-dark/40 w-3/4 mb-2" />
                <div className="h-4 bg-sd-ivory-dark/40 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!loadingCats && hideIfNotFound && tabs.length === 0) {
    return null;
  }

  /* ── main ── */
  return (
    <section className="py-32 bg-sd-ivory relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-10 mb-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-sd-gold" />
               <span className="font-mono text-[10px] text-sd-gold uppercase tracking-[0.5em] font-bold">Archives</span>
            </div>
            <div className="h-[1px] flex-1 bg-sd-border-default/10" />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl relative">
              <h2 className="text-6xl lg:text-[100px] font-display text-sd-black leading-[0.85] tracking-tight">
                {title ?? (parentLabel || eyebrow || 'The Collection')}
              </h2>
              <div className="absolute -top-10 -left-6 text-[120px] font-display italic opacity-[0.02] pointer-events-none select-none">
                Catalog
              </div>
            </div>

            {/* Subcategory "Strip" Navigation */}
            <div className="sd-depth-recess bg-sd-ivory-dark/30 p-2 rounded-[28px] overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 min-w-max">
                {tabs.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveId(cat.id)}
                    className={`
                      px-8 py-3.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] rounded-[22px] transition-all duration-500
                      ${activeId === cat.id 
                        ? 'bg-sd-white text-sd-black sd-depth-lift scale-[1.02]' 
                        : 'text-sd-text-muted hover:text-sd-black'}
                    `}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {subtitle && (
            <div className="flex items-center gap-6 mt-4">
               <div className="h-10 w-[1px] bg-sd-gold/30" />
               <p className="max-w-xl text-sd-text-secondary font-sans text-sm leading-relaxed opacity-80">
                 {subtitle}
               </p>
            </div>
          )}
        </div>

        {/* Product Archive Expansion */}
        <div className="min-h-[600px] relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {activeTab?.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-sd-ivory-dark/20 rounded-[32px] mb-6" />
                  <div className="h-4 bg-sd-ivory-dark/20 w-3/4 mb-2 rounded" />
                  <div className="h-4 bg-sd-ivory-dark/20 w-1/4 rounded" />
                </div>
              ))
            ) : activeTab?.products.length ? (
              activeTab.products.map((p, index) => (
                <PremiumProductCard
                  key={`${activeKey}-${p.id}`}
                  product={p}
                  animDelay={index * 80}
                  onOpen={onProductClick}
                  onAddToCart={onAddToCart}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-40 rounded-[48px] border border-dashed border-sd-border-default/20 bg-sd-ivory-dark/5">
                <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-sd-gold font-bold mb-6">Department Empty</span>
                <p className="font-display italic text-3xl text-sd-text-muted opacity-40">No entries recorded in this registry.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Tray */}
        {activeTab?.category && activeTab.products.length > 0 && (
          <div className="mt-24 flex flex-col items-center gap-6">
            <Link
              href={`/e-commerce/${encodeURIComponent(catSlug(activeTab.category))}`}
              className="group relative h-16 px-16 flex items-center justify-center rounded-[20px] bg-sd-black overflow-hidden transition-all duration-700 hover:sd-depth-lift"
            >
              <div className="absolute inset-0 bg-sd-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />
              <span className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-sd-white group-hover:text-sd-black transition-colors flex items-center gap-4">
                Enter Department <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
              </span>
            </Link>
            <span className="font-mono text-[8px] text-sd-text-muted uppercase tracking-[0.2em]">Viewing {activeTab.products.length} of {activeTab.category.product_count || '...'} artifacts</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubcategoryProductTabs;
