'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PremiumProductCard from '@/components/ecommerce/ui/PremiumProductCard';
import { usePromotion } from '@/contexts/PromotionContext';

import { useCart } from '@/app/CartContext';
import Navigation from '@/components/ecommerce/Navigation';
import { getBaseProductName, getColorLabel, getSizeLabel } from '@/lib/productNameUtils';
import { adaptCatalogGroupedProducts, groupProductsByMother } from '@/lib/ecommerceProductGrouping';
import CartSidebar from '@/components/ecommerce/cart/CartSidebar';
import catalogService, {
  Product,
  ProductDetailResponse,
  SimpleProduct,
  ProductImage
} from '@/services/catalogService';
import cartService from '@/services/cartService';
import { wishlistUtils } from '@/lib/wishlistUtils';
import ProductImageGallery from '@/components/ecommerce/ProductImageGallery';
import VariantSelector from '@/components/ecommerce/VariantSelector';
import StickyAddToCart from '@/components/ecommerce/StickyAddToCart';
import { fireToast } from '@/lib/globalToast';

// Types for product variations
export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  variation_suffix?: string | null;
  option_label?: string;
  selling_price: number | null;
  in_stock: boolean;
  stock_quantity: number | null;
  available_inventory: number | null;
  images: ProductImage[] | null;
}

const normalizeVariantText = (value: any): string =>
  String(value ?? '').trim().replace(/[‐‑‒–—−﹘﹣－]/g, '-').replace(/\s+/g, ' ');

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const parseVariationSuffix = (suffix?: string | null): { color?: string; size?: string; label?: string } => {
  const raw = normalizeVariantText(suffix || '');
  if (!raw) return {};
  const trimmed = raw.startsWith('-') ? raw.slice(1) : raw;
  const parts = trimmed.split('-').map(t => t.trim()).filter(Boolean);
  const label = parts.join(' / ');
  return { label };
};

const deriveVariantMeta = (variant: any, name: string) => {
  const parsed = parseVariationSuffix(variant?.variation_suffix);
  const color = normalizeVariantText(variant?.attributes?.color || variant?.color) || getColorLabel(name);
  const size = normalizeVariantText(variant?.attributes?.size || variant?.size) || getSizeLabel(name);
  const variationSuffix = normalizeVariantText(variant?.variation_suffix || '') || null;
  const optionLabel = variant?.option_label || parsed.label || [color, size].filter(Boolean).join(' / ') || undefined;

  return { color, size, variationSuffix, optionLabel };
};

const getVariationDisplayLabel = (variant: ProductVariant, index: number): string => {
  const explicit = normalizeVariantText(variant.option_label || '');
  if (explicit) return explicit;
  const parts = [normalizeVariantText(variant.color || ''), normalizeVariantText(variant.size || '')].filter(Boolean);
  if (parts.length > 0) return parts.join(' / ');
  return `Option ${index + 1}`;
};

const getCategorySlug = (category: Product['category'] | null | undefined): string => {
  if (!category) return 'general';
  if (typeof category === 'string') return slugify(category);
  return category.slug || slugify(category.name);
};

const getCategoryName = (category: Product['category'] | null | undefined): string => {
  if (!category) return 'General';
  if (typeof category === 'string') return category;
  return category.name || 'General';
};

const getCategoryId = (category: Product['category'] | null | undefined): number | null => {
  if (!category || typeof category === 'string') return null;
  return category.id;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id ? parseInt(params.id as string) : null;

  const { refreshCart, addToCart } = useCart();
  const { getApplicablePromotion } = usePromotion();

  const [product, setProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartStatus, setCartStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [liveViewers, setLiveViewers] = useState(0);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const mainCtaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateViewers = () => {
      if (!productId) return;
      const bracket = Math.floor(Date.now() / (1000 * 300));
      const seed = (parseInt(String(productId), 10) + bracket) % 23 + 4;
      setLiveViewers(seed);
    };
    updateViewers();
    const interval = setInterval(updateViewers, 300000);
    return () => clearInterval(interval);
  }, [productId]);

  useEffect(() => {
    if (!mainCtaRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsStickyVisible(!entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(mainCtaRef.current);
    return () => observer.disconnect();
  }, [loading]);

  const formatBDT = (value: any) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return 'Tk 0.00';
    return `Tk ${n.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
  };

  const buildVariantFromAny = (variant: any): ProductVariant => {
    const name = variant?.name || '';
    const meta = deriveVariantMeta(variant, name);
    return {
      id: Number(variant?.id),
      name,
      sku: variant?.sku || `SKU-${variant?.id}`,
      color: meta.color,
      size: meta.size,
      variation_suffix: meta.variationSuffix,
      option_label: meta.optionLabel,
      selling_price: Number(variant?.selling_price ?? 0),
      in_stock: !!(variant?.in_stock || Number(variant?.stock_quantity || 0) > 0),
      stock_quantity: Number(variant?.stock_quantity || 0),
      available_inventory: Number(variant?.available_inventory ?? variant?.stock_quantity ?? 0),
      images: Array.isArray(variant?.images) ? variant.images : [],
    };
  };

  useEffect(() => {
    if (!productId) { setError('Invalid product ID'); setLoading(false); return; }
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response: ProductDetailResponse = await catalogService.getProduct(productId);
        const mainProduct = response.product;
        setProduct(mainProduct);
        setRelatedProducts(response.related_products || []);

        const variantsRaw = Array.isArray((mainProduct as any).variants) ? (mainProduct as any).variants : [];
        if (variantsRaw.length > 0) {
          const variations = variantsRaw.map(v => buildVariantFromAny(v));
          setProductVariants(variations);
          setSelectedVariant(variations.find(v => v.id === productId) || variations[0]);
        } else {
          const self = buildVariantFromAny(mainProduct);
          setProductVariants([self]);
          setSelectedVariant(self);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load artifact');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleVariantChange = async (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedImageIndex(0);
    setQuantity(1);
    window.history.pushState(null, '', `/e-commerce/product/${variant.id}`);
    
    try {
      const response = await catalogService.getProduct(variant.id);
      if (response?.product) {
        const fullVariant = buildVariantFromAny(response.product);
        setProductVariants(prev => prev.map(v => v.id === variant.id ? fullVariant : v));
        setSelectedVariant(fullVariant);
      }
    } catch (err) {}
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.in_stock) return;
    try {
      setIsAdding(true);
      setCartStatus('loading');
      await addToCart(selectedVariant.id, quantity);
      setCartStatus('success');
      setTimeout(() => {
        setCartStatus('idle');
        setIsAdding(false);
        setCartSidebarOpen(true);
      }, 1500);
    } catch (error: any) {
      fireToast(error?.message || 'Archival integration failed', 'error');
      setIsAdding(false);
      setCartStatus('idle');
    }
  };

  const handleBuyItNow = async () => {
    if (!selectedVariant || !selectedVariant.in_stock) return;
    try {
      setIsAdding(true);
      await addToCart(selectedVariant.id, quantity);
      router.push('/e-commerce/checkout');
    } catch (error: any) {
      fireToast(error?.message || 'Direct transfer failed', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickAddToCart = async (item: SimpleProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(item.id, 1);
      setCartSidebarOpen(true);
    } catch (error: any) {
      fireToast(error.message || 'Failed to archive item', 'error');
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!selectedVariant) return;
    const avail = selectedVariant.available_inventory || 0;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= avail) setQuantity(newQty);
  };

  if (loading) return (
    <div className="min-h-screen bg-sd-ivory flex items-center justify-center">
       <span className="font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Cataloging...</span>
    </div>
  );

  if (error || !product || !selectedVariant) return (
    <div className="min-h-screen bg-sd-ivory flex flex-col items-center justify-center p-12">
       <h1 className="font-display italic text-4xl mb-8">Artifact Not Found</h1>
       <button onClick={() => router.back()} className="font-mono text-[10px] uppercase tracking-widest border border-sd-black px-8 py-4">Return to Anthology</button>
    </div>
  );

  const baseName = (product as any).base_name || getBaseProductName(product.name);
  const catId = getCategoryId(product.category);
  const salePromo = getApplicablePromotion(selectedVariant.id, catId);
  const originalPrice = Number(selectedVariant.selling_price || 0);
  const sellingPrice = salePromo ? originalPrice - (originalPrice * salePromo.discount_value / 100) : originalPrice;
  const availableInventory = selectedVariant.available_inventory || 0;
  const discountPercent = salePromo?.discount_value || 0;
  const safeImages = Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0 ? selectedVariant.images : [];
  const hasMultipleVariants = productVariants.length > 1;

  return (
    <div className="min-h-screen bg-sd-ivory relative overflow-hidden">
      <Navigation />
      <CartSidebar isOpen={cartSidebarOpen} onClose={() => setCartSidebarOpen(false)} />
      
      <div className="absolute top-[10%] left-[-2%] opacity-[0.03] pointer-events-none select-none">
        <span className="text-[20vw] font-display italic font-light text-sd-black leading-none whitespace-nowrap">Archives</span>
      </div>

      <main className="pt-32 pb-40 relative z-10">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16 pb-8 border-b border-sd-border-default/10">
            <div className="flex items-center gap-4">
               <Link href="/e-commerce" className="font-mono text-[9px] uppercase tracking-[0.4em] text-sd-text-muted hover:text-sd-black transition-colors">Anthology Index</Link>
               <span className="text-sd-gold">/</span>
               <Link href={`/e-commerce/${getCategorySlug(product?.category)}`} className="font-mono text-[9px] uppercase tracking-[0.4em] text-sd-text-muted hover:text-sd-black transition-colors">{getCategoryName(product?.category)}</Link>
            </div>
            <div className="h-[1px] flex-1 bg-sd-border-default/10 hidden md:block" />
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full animate-pulse bg-sd-gold" />
               <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-sd-gold font-bold">Observers: {liveViewers}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-20 lg:gap-32 items-start">
            <div className="w-full lg:w-[55%] lg:sticky lg:top-32">
              <ProductImageGallery 
                images={safeImages}
                productName={baseName}
                discountPercent={discountPercent}
                inStock={selectedVariant.in_stock}
              />
              <div className="mt-16 hidden lg:grid grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <span className="font-mono text-[9px] text-sd-gold uppercase tracking-[0.4em] font-bold">Certification</span>
                    <p className="text-[10px] text-sd-text-secondary leading-relaxed uppercase tracking-tighter">Certified 100% genuine artifact. Subjected to Sareng Digital's strict quality inspection registry.</p>
                 </div>
                 <div className="space-y-4">
                    <span className="font-mono text-[9px] text-sd-gold uppercase tracking-[0.4em] font-bold">Logistics</span>
                    <p className="text-[10px] text-sd-text-secondary leading-relaxed uppercase tracking-tighter">Domestic priority dispatch protocol enabled for this specimen.</p>
                 </div>
              </div>
            </div>

            <div className="w-full lg:w-[45%]">
              <div className="flex flex-col gap-12">
                <div className="relative">
                   <div className="absolute -top-12 -left-6 text-8xl font-display italic opacity-[0.03] pointer-events-none">ENTRY</div>
                   <div className="flex items-center gap-4 mb-6">
                      <span className="font-mono text-[10px] font-bold text-sd-gold uppercase tracking-[0.5em]">No. {selectedVariant.sku}</span>
                      <div className="h-[1px] w-20 bg-sd-gold/30" />
                   </div>
                   <h1 className="text-6xl lg:text-[100px] font-display text-sd-black leading-[0.85] tracking-tight mb-8">{baseName}</h1>
                   <div className="flex items-baseline gap-6">
                      <span className="text-5xl lg:text-7xl font-mono font-bold text-sd-black">{formatBDT(sellingPrice)}</span>
                      {salePromo && <span className="text-2xl font-mono text-sd-text-muted line-through opacity-40">{formatBDT(originalPrice)}</span>}
                   </div>
                </div>

                {hasMultipleVariants && (
                   <div className="pt-12 border-t border-sd-border-default/10">
                      <VariantSelector variants={productVariants} selectedVariant={selectedVariant} onVariantChange={handleVariantChange} />
                   </div>
                )}

                <div className="space-y-8 pt-12 border-t border-sd-border-default/10">
                   <div className="flex items-center gap-4">
                      <div className="sd-depth-recess flex items-center bg-sd-ivory-dark/20 p-2 rounded-2xl">
                         <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="w-12 h-12 flex items-center justify-center text-sd-black hover:bg-sd-white hover:sd-depth-lift rounded-xl transition-all disabled:opacity-20"><Minus size={14} strokeWidth={2.5} /></button>
                         <div className="w-16 flex items-center justify-center"><span className="font-mono font-bold text-xl">{quantity}</span></div>
                         <button onClick={() => handleQuantityChange(1)} disabled={quantity >= availableInventory} className="w-12 h-12 flex items-center justify-center text-sd-black hover:bg-sd-white hover:sd-depth-lift rounded-xl transition-all disabled:opacity-20"><Plus size={14} strokeWidth={2.5} /></button>
                      </div>
                      <button ref={mainCtaRef} onClick={handleAddToCart} disabled={!selectedVariant.in_stock || isAdding || availableInventory <= 0} className="flex-1 group relative h-[68px] bg-sd-black rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:sd-depth-lift disabled:opacity-50">
                         <div className="absolute inset-0 bg-sd-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                         <AnimatePresence mode="wait">
                            {cartStatus === 'loading' ? (
                               <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 font-mono text-[10px] text-sd-white font-bold uppercase tracking-[0.4em]">Archiving...</motion.div>
                            ) : cartStatus === 'success' ? (
                               <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 flex items-center gap-4 text-sd-black font-mono text-[10px] font-bold uppercase tracking-[0.4em]"><ShoppingCart size={16} /> Added</motion.div>
                            ) : (
                               <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10 flex items-center gap-4 text-sd-white group-hover:text-sd-black transition-colors font-mono text-[10px] font-bold uppercase tracking-[0.4em]"><Plus size={14} /> {availableInventory <= 0 ? 'Waitlist' : 'Acquire Artifact'}</motion.div>
                            )}
                         </AnimatePresence>
                      </button>
                   </div>
                   <button onClick={handleBuyItNow} disabled={!selectedVariant.in_stock || isAdding || availableInventory <= 0} className="w-full h-[68px] rounded-2xl border-2 border-sd-black font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-sd-black hover:bg-sd-black hover:text-sd-white transition-all duration-700 disabled:opacity-30">Complete Transfer</button>
                </div>

                <div className="pt-16 space-y-10">
                   <div className="flex items-center gap-6"><h3 className="font-mono text-[10px] uppercase tracking-[0.5em] text-sd-gold font-bold">Provenance & Detail</h3><div className="h-[1px] flex-1 bg-sd-border-default/10" /></div>
                   <div className="max-w-none font-sans text-sd-text-secondary text-base leading-relaxed space-y-6">
                      {product.description && <div className="opacity-80">{product.description}</div>}
                      <div className="sd-depth-recess bg-sd-white p-1 rounded-2xl overflow-hidden mt-8">
                         <table className="w-full border-collapse">
                            <tbody>
                               <tr className="border-b border-sd-border-default/5"><td className="p-4 font-mono text-[9px] uppercase tracking-[0.3em] text-sd-black/40">Status</td><td className="p-4 font-mono text-[10px] font-bold text-sd-black uppercase text-right">{availableInventory > 0 ? <span className="text-sd-gold">Archived: {availableInventory} Units</span> : <span className="text-sd-danger">Registry Depleted</span>}</td></tr>
                               <tr className="border-b border-sd-border-default/5"><td className="p-4 font-mono text-[9px] uppercase tracking-[0.3em] text-sd-black/40">Authentication</td><td className="p-4 font-mono text-[10px] font-bold text-sd-black uppercase text-right">Registry Verified</td></tr>
                               <tr><td className="p-4 font-mono text-[9px] uppercase tracking-[0.3em] text-sd-black/40">Dispatch</td><td className="p-4 font-mono text-[10px] font-bold text-sd-black uppercase text-right">Immediate Release</td></tr>
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
           <section className="mt-60 pt-40 border-t border-sd-border-default/10 relative overflow-hidden">
             <div className="absolute top-20 right-10 opacity-[0.02] text-[180px] font-display italic pointer-events-none select-none -rotate-6">Related</div>
             <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
                   <div>
                      <div className="flex items-center gap-4 mb-4"><span className="font-mono text-[10px] text-sd-gold uppercase tracking-[0.6em] font-bold">Anthology</span><div className="h-[1px] w-12 bg-sd-gold/30" /></div>
                      <h2 className="text-6xl lg:text-8xl font-display text-sd-black leading-[0.8] tracking-tight">Associated <br /><span className="italic font-medium text-sd-gold">Specimens</span></h2>
                   </div>
                   <Link href="/e-commerce/products" className="group flex flex-col items-end gap-2"><span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold group-hover:text-sd-gold transition-colors">Enter Archive</span><div className="h-[1px] w-24 bg-sd-black group-hover:w-full transition-all duration-700" /></Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                   {relatedProducts.slice(0, 4).map((item, idx) => (<PremiumProductCard key={item.id} product={item} animDelay={idx * 100} onOpen={(p) => router.push(`/e-commerce/product/${p.id}`)} onAddToCart={handleQuickAddToCart} />))}
                </div>
             </div>
           </section>
        )}
      </main>

      <StickyAddToCart 
        isVisible={isStickyVisible}
        productName={selectedVariant.name}
        priceText={formatBDT(sellingPrice)}
        isAdding={isAdding}
        disabled={!selectedVariant.in_stock || availableInventory <= 0}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
