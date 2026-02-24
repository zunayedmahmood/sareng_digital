'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import catalogService, { CatalogCategory, SimpleProduct } from '@/services/catalogService';
import { buildCardProductsFromResponse, getCardNewestSortKey } from '@/lib/ecommerceCardUtils';
import PremiumProductCard from '@/components/ecommerce/ui/PremiumProductCard';
import { useCart } from '@/app/e-commerce/CartContext';

/* ─────────────────────────────────────────────────────────────────────────── */

interface CategoryTabData {
  category: CatalogCategory;
  products: SimpleProduct[];
  loading: boolean;
  loaded: boolean;
}

const flattenCategories = (nodes: CatalogCategory[]): CatalogCategory[] => {
  const out: CatalogCategory[] = [];
  const walk = (list: CatalogCategory[]) =>
    list.forEach((n) => { out.push(n); if (n.children?.length) walk(n.children); });
  walk(nodes);
  return out;
};

const catSlug = (c: CatalogCategory) =>
  c.slug || c.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

/* ─────────────────────────────────────────────────────────────────────────── */

const SubcategoryProductTabs: React.FC<{ tabsCount?: number; productsPerTab?: number }> = ({
  tabsCount = 6,
  productsPerTab = 8,
}) => {
  const router  = useRouter();
  const { addToCart } = useCart();

  const [categories,       setCategories]       = useState<CatalogCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [tabData,          setTabData]          = useState<Record<number, CategoryTabData>>({});
  const [loadingCats,      setLoadingCats]      = useState(true);
  const [imageErrors,      setImageErrors]      = useState<Set<number>>(new Set());

  /* ── load category list ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const tree = await catalogService.getCategories();
        const all  = flattenCategories(tree).filter(c => c.name);
        all.sort((a, b) => Number(b.product_count || 0) - Number(a.product_count || 0));
        const top  = all.slice(0, tabsCount);
        if (!alive) return;
        setCategories(top);
        if (top.length) setActiveCategoryId(top[0].id);
      } catch {}
      if (alive) setLoadingCats(false);
    })();
    return () => { alive = false; };
  }, [tabsCount]);

  /* ── load products for active tab ── */
  useEffect(() => {
    if (!activeCategoryId) return;
    const cat = categories.find(c => c.id === activeCategoryId);
    if (!cat) return;
    if (tabData[activeCategoryId]?.loaded || tabData[activeCategoryId]?.loading) return;

    let alive = true;
    setTabData(p => ({ ...p, [activeCategoryId]: { category: cat, products: [], loading: true, loaded: false } }));

    (async () => {
      const tries = [
        { category_id: cat.id,                                    sort_by: 'newest' as const, sort_order: 'desc' as const },
        { category_id: cat.id, category: cat.name,                sort_by: 'newest' as const, sort_order: 'desc' as const },
        { category: cat.name,  category_slug: cat.slug,           sort_by: 'newest' as const, sort_order: 'desc' as const },
        {                                                          sort_by: 'newest' as const, sort_order: 'desc' as const },
      ];
      let products: SimpleProduct[] = [];
      for (const params of tries) {
        try {
          const res   = await catalogService.getProducts({ page: 1, per_page: Math.max(productsPerTab * 4, 40), ...(params as any) });
          const cards = buildCardProductsFromResponse(res)
            .sort((a, b) => getCardNewestSortKey(b) - getCardNewestSortKey(a))
            .slice(0, productsPerTab);
          if (cards.length) { products = cards; break; }
        } catch {}
      }
      if (alive) setTabData(p => ({ ...p, [activeCategoryId]: { category: cat, products, loading: false, loaded: true } }));
    })();

    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId, categories.length]);

  const activeTab = activeCategoryId ? tabData[activeCategoryId] : null;

  /* ── event handlers ── */
  const onProductClick  = (p: SimpleProduct) => router.push(`/e-commerce/product/${p.id}`);
  const onAddToCart     = async (p: SimpleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (p.has_variants) { router.push(`/e-commerce/product/${p.id}`); return; }
    try { await addToCart(p.id, 1); } catch {}
  };
  const onImageError = (id: number) => setImageErrors(prev => { const s = new Set(prev); s.add(id); return s; });

  /* ── skeleton ── */
  if (loadingCats) {
    return (
      <section className="ec-section">
        <div className="ec-container">
          <div className="ec-surface p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex justify-between items-end">
              <div className="space-y-2">
                <div className="h-3 w-32 rounded-full bg-neutral-200 animate-pulse" />
                <div className="h-8 w-56 rounded-lg   bg-neutral-200 animate-pulse" />
                <div className="h-3 w-80 rounded-full bg-neutral-200 animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
              {[1,2,3].map(i => <div key={i} className="aspect-[3/4] rounded-2xl bg-neutral-100 animate-pulse" />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <section className="ec-section">
      <div className="ec-container">
        <div className="ec-surface overflow-hidden">

          {/* ══ Header ════════════════════════════════════════════════════ */}
          <div className="px-4 pt-6 pb-5 sm:px-6 lg:px-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ec-eyebrow">Collections</p>
              <h2 className="ec-heading mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Shop by Subcategory
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Select a collection to explore the latest styles
              </p>
            </div>
            {activeTab?.category && (
              <button
                onClick={() => router.push(`/e-commerce/${encodeURIComponent(catSlug(activeTab.category))}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-neutral-400 self-start sm:self-auto"
              >
                View all in {activeTab.category.name}
                <span>→</span>
              </button>
            )}
          </div>

          {/* ══ Category banner row — matches reference image ═════════════
               Reference: 3 tall portrait images side by side, full bleed,
               category name as large bold text at the bottom-left             */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)` }}
            >
              {categories.slice(0, 3).map((cat) => {
                const active = cat.id === activeCategoryId;
                const imgUrl = cat.image_url || (cat as any).image || null;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-300 focus-visible:outline-none ${
                      active
                        ? 'ring-2 ring-offset-2 ring-neutral-900 shadow-2xl'
                        : 'shadow-md hover:shadow-xl'
                    }`}
                  >
                    {/* ── Image ── */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={cat.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        /* Elegant gradient placeholder — looks intentional, not broken */
                        <div
                          className="absolute inset-0"
                          style={{
                            background: [
                              'linear-gradient(160deg,#e8e4df 0%,#d3cdc5 40%,#b8b0a5 100%)',
                              'linear-gradient(160deg,#dde4e8 0%,#c5cdd3 40%,#a5b0b8 100%)',
                              'linear-gradient(160deg,#e8e4df 0%,#c8c2ba 40%,#a59e95 100%)',
                            ][categories.indexOf(cat) % 3],
                          }}
                        />
                      )}

                      {/* Strong bottom gradient for text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                      {/* Active check mark */}
                      {active && (
                        <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
                          <svg className="h-4 w-4 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      {/* Category label — premium typography, bottom-left like reference */}
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        {/* Small eyebrow line */}
                        <div className="mb-1.5 flex items-center gap-2">
                          <div className="h-px w-8 bg-white/60" />
                          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/70">
                            Collection
                          </span>
                        </div>
                        {/* Main category name */}
                        <p
                          className="text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-2xl lg:text-3xl"
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, letterSpacing: '-0.01em' }}
                        >
                          {cat.name}
                        </p>
                        {/* Explore CTA */}
                        <p className={`mt-2 text-xs font-medium tracking-wide transition-opacity duration-300 ${active ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                          {active ? '✦ Currently viewing' : 'Tap to explore →'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* More categories as slim pills if > 3 */}
            {categories.length > 3 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.slice(3).map((cat) => {
                  const active = cat.id === activeCategoryId;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`ec-pill ${active ? 'ec-pill-active' : ''} px-4 py-1.5 text-xs`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ Divider ═══════════════════════════════════════════════════ */}
          <div className="mx-4 sm:mx-6 lg:mx-8 border-t border-neutral-100" />

          {/* ══ Product grid ══════════════════════════════════════════════ */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab?.loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: productsPerTab }).map((_, i) => (
                  <div key={i} className="ec-card overflow-hidden rounded-2xl animate-pulse">
                    <div className="aspect-[4/5] bg-neutral-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 rounded bg-neutral-100" />
                      <div className="h-4 rounded bg-neutral-100" />
                      <div className="h-4 w-1/2 rounded bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab?.products.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {activeTab.products.map(product => (
                  <PremiumProductCard
                    key={`${activeTab.category.id}-${product.id}`}
                    product={product}
                    compact
                    imageErrored={imageErrors.has(product.id)}
                    onImageError={onImageError}
                    onOpen={onProductClick}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-14 text-center">
                <p className="ec-heading text-lg font-medium text-neutral-400">No products in this category yet</p>
                <p className="mt-1 text-sm text-neutral-400">Check back soon for new arrivals</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default SubcategoryProductTabs;
