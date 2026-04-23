'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import catalogService, { CatalogCategory, SimpleProduct } from '@/services/catalogService';
import { buildCardProductsFromResponse } from '@/lib/ecommerceCardUtils';
import NeoProductCard from '@/components/ecommerce/ui/NeoProductCard';
import NeoBadge from '@/components/ecommerce/ui/NeoBadge';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import { useCart } from '@/app/CartContext';
import { fireToast } from '@/lib/globalToast';
import { ArrowRight, Box } from 'lucide-react';

const normalizeKey = (v: unknown): string =>
  String(v || '').toLowerCase().trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');

const catSlug = (c: CatalogCategory) =>
  c.slug || c.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

const flattenAll = (nodes: CatalogCategory[]): CatalogCategory[] => {
  const out: CatalogCategory[] = [];
  const walk = (list: CatalogCategory[]) =>
    list.forEach(n => { out.push(n); if (n.children?.length) walk(n.children); });
  walk(nodes);
  return out;
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

interface TabData {
  category: CatalogCategory;
  products: SimpleProduct[];
  loading: boolean;
  loaded: boolean;
}

interface SubcategoryProductTabsProps {
  tabsCount?: number;
  productsPerTab?: number;
  parentQueries?: string[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  hideIfNotFound?: boolean;
}

const SubcategoryProductTabs: React.FC<SubcategoryProductTabsProps> = memo(({
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

  const [tabs, setTabs] = useState<CatalogCategory[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [tabData, setTabData] = useState<Record<string, TabData>>({});
  const [loadingCats, setLoadingCats] = useState(true);
  const [parentLabel, setParentLabel] = useState<string>('');
  const [parentNode, setParentNode] = useState<CatalogCategory | null>(null);

  const findParentNode = useCallback((flat: CatalogCategory[], queries: string[]): CatalogCategory | null => {
    const q = (queries || []).map(normalizeKey).filter(Boolean);
    if (!q.length) return null;
    for (const needle of q) {
      const exact = flat.find(c => normalizeKey(c?.slug) === needle || normalizeKey(c?.name) === needle) || null;
      if (exact) return exact;
    }
    for (const needle of q) {
      const relaxed = flat.find(c => normalizeKey(c?.slug).includes(needle) || normalizeKey(c?.name).includes(needle)) || null;
      if (relaxed) return relaxed;
    }
    return null;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const tree = await catalogService.getCategories();
        const flat = flattenAll(tree);
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
        }

        if (!alive) return;
        setTabs(selected);
        if (selected.length > 0) setActiveId(selected[0].id);
      } catch (e) {
        console.error('SubcategoryTabs: failed to load categories', e);
      }
      if (alive) setLoadingCats(false);
    })();
    return () => { alive = false; };
  }, [tabsCount, findParentNode, hideIfNotFound, parentQueries]);

  useEffect(() => {
    if (activeId === null || activeId === undefined) return;
    const key = String(activeId);
    if (tabData[key]?.loaded || tabData[key]?.loading) return;
    const cat = tabs.find(c => c.id === activeId);
    if (!cat) return;

    let alive = true;
    setTabData(p => ({ ...p, [key]: { category: cat!, products: [], loading: true, loaded: false } }));

    (async () => {
      try {
        const response = await catalogService.getProducts({
          page: 1,
          per_page: productsPerTab,
          category_id: activeId,
          sort_by: 'newest',
          group_by_sku: true as any,
        } as any);

        const rawProducts = response.grouped_products?.length
          ? response.grouped_products.map(gp => gp.main_variant)
          : response.products;

        const products = buildCardProductsFromResponse({ ...response, products: rawProducts });
        if (alive) {
          setTabData(p => ({ ...p, [key]: { category: cat!, products, loading: false, loaded: true } }));
        }
      } catch (e) {
        console.error('SubcategoryTabs: fetch failed', e);
      }
    })();
    return () => { alive = false; };
  }, [activeId, tabs, productsPerTab, tabData]);

  const activeKey = String(activeId);
  const activeTab = tabData[activeKey];

  const onProductClick = useCallback((p: SimpleProduct) => router.push(`/e-commerce/product/${p.id}`), [router]);
  const onAddToCart = useCallback(async (p: SimpleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(p.id, 1);
      fireToast(`Added to registry: ${p?.name}`, 'success');
    } catch (error: any) {
      fireToast(error?.message || 'Failed to add to registry', 'error');
    }
  }, [addToCart]);

  if (loadingCats) return (
    <section className="py-24 bg-sd-ivory px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto animate-pulse space-y-12">
        <div className="h-40 w-full sm:w-1/2 bg-black/5 neo-border-4 border-black/10" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
           {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-black/5 neo-border-2 border-black/10" />)}
        </div>
      </div>
    </section>
  );

  if (hideIfNotFound && tabs.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-sd-ivory relative overflow-hidden px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col gap-12 mb-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
            <div className="max-w-3xl relative">
              <NeoBadge variant="violet" className="mb-6">Registry Unit: {parentLabel || eyebrow || 'Archive'}</NeoBadge>
              <h2 className="font-neo font-black text-5xl sm:text-7xl lg:text-[100px] uppercase leading-[0.8] tracking-tighter text-black">
                {title ?? (parentLabel || eyebrow || 'Specimens')}
              </h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center gap-3">
               {tabs.map((cat) => (
                 <button
                    key={cat.id}
                    onClick={() => setActiveId(cat.id)}
                    className={`
                      px-6 py-3 font-neo font-black text-xs uppercase tracking-widest transition-all
                      neo-border-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                      ${activeId === cat.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-sd-gold'}
                    `}
                 >
                   {cat.name}
                 </button>
               ))}
            </div>
          </div>

          {subtitle && (
            <NeoCard variant="white" className="p-6 max-w-2xl rotate-1">
               <p className="font-neo font-bold text-lg uppercase leading-tight text-black">
                 {subtitle}
               </p>
            </NeoCard>
          )}
        </div>

        <div className="min-h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {activeTab?.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-black/5 neo-border-4 border-black/10 animate-pulse" />
              ))
            ) : activeTab?.products.length ? (
              activeTab.products.map((p, index) => (
                <NeoProductCard
                  key={`${activeKey}-${p.id}`}
                  product={p}
                  animDelay={index * 50}
                  onOpen={onProductClick}
                  onAddToCart={onAddToCart}
                />
              ))
            ) : (
              <div className="col-span-full py-40 neo-border-4 border-dashed border-black/20 flex flex-col items-center justify-center gap-6">
                <Box size={60} className="text-black/10" />
                <p className="font-neo font-black text-2xl uppercase text-black/20">Registry Empty</p>
              </div>
            )}
          </div>
        </div>

        {activeTab?.category && activeTab.products.length > 0 && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <Link href={`/e-commerce/${encodeURIComponent(catSlug(activeTab.category))}`}>
              <NeoButton variant="black" size="xl" className="group px-12">
                Enter Department <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </NeoButton>
            </Link>
            <span className="font-neo font-black text-[10px] uppercase tracking-widest text-black/30">
              Scanned {activeTab.products.length} of {activeTab.category.product_count || '...'} Specimens
            </span>
          </div>
        )}
      </div>
    </section>
  );
});

SubcategoryProductTabs.displayName = 'SubcategoryProductTabs';


export default SubcategoryProductTabs;

