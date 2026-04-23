'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Info
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NeoProductCard from '@/components/ecommerce/ui/NeoProductCard';
import NeoBadge from '@/components/ecommerce/ui/NeoBadge';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import { usePromotion } from '@/contexts/PromotionContext';

import { useCart } from '@/app/CartContext';
import Navigation from '@/components/ecommerce/Navigation';
import { getBaseProductName, getColorLabel, getSizeLabel } from '@/lib/productNameUtils';
import CartSidebar from '@/components/ecommerce/cart/CartSidebar';
import catalogService, {
  Product,
  ProductDetailResponse,
  SimpleProduct,
  ProductImage
} from '@/services/catalogService';
import { fireToast } from '@/lib/globalToast';
import ProductImageGallery from '@/components/ecommerce/ProductImageGallery';
import VariantSelector from '@/components/ecommerce/VariantSelector';
import StickyAddToCart from '@/components/ecommerce/StickyAddToCart';

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

  const { addToCart } = useCart();
  const { getApplicablePromotion } = usePromotion();

  const [product, setProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
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
    if (!productId) { setError('Invalid unit ID'); setLoading(false); return; }
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
      }, 1200);
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
    <div className="min-h-screen bg-sd-ivory flex items-center justify-center px-4">
       <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 neo-border-4 border-black animate-spin bg-sd-gold" />
          <span className="font-neo font-black text-xl uppercase tracking-widest animate-pulse">Cataloging Unit...</span>
       </div>
    </div>
  );

  if (error || !product || !selectedVariant) return (
    <div className="min-h-screen bg-sd-ivory flex flex-col items-center justify-center p-12 px-4 text-center">
       <h1 className="font-neo font-black text-5xl uppercase mb-8">Unit Not Found</h1>
       <NeoButton variant="black" onClick={() => router.back()} className="px-12">Return to Index</NeoButton>
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
      
      {/* Background Decor */}
      <div className="absolute top-[15%] right-[-5%] opacity-[0.03] pointer-events-none select-none hidden lg:block">
        <span className="text-[18vw] font-neo font-black uppercase text-black leading-none">Registry</span>
      </div>

      <main className="pt-24 sm:pt-32 pb-40 relative z-10 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto">
          
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16 pb-8 border-b-4 border-black">
            <div className="flex items-center gap-4">
               <Link href="/e-commerce" className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 hover:text-black">INDEX</Link>
               <span className="text-sd-gold font-neo font-black">/</span>
               <Link href={`/e-commerce/${getCategorySlug(product?.category)}`} className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 hover:text-black">{getCategoryName(product?.category)}</Link>
            </div>
            <div className="flex-1 hidden md:block" />
            <NeoBadge variant="gold" className="shadow-none">REGISTRY STATUS: LIVE</NeoBadge>
            <div className="flex items-center gap-3">
               <span className="font-neo font-black text-[10px] uppercase tracking-widest text-sd-gold">OBSERVERS: {liveViewers}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
            {/* Gallery Column */}
            <div className="w-full lg:w-[50%] lg:sticky lg:top-32">
              <ProductImageGallery 
                images={safeImages}
                productName={baseName}
                discountPercent={discountPercent}
                inStock={selectedVariant.in_stock}
              />
            </div>

            {/* Info Column */}
            <div className="w-full lg:w-[50%] space-y-12">
              <div className="relative">
                 <NeoBadge variant="violet" className="mb-6 shadow-none">PROTOCOL NO. {selectedVariant.sku}</NeoBadge>
                 <h1 className="font-neo font-black text-5xl sm:text-7xl lg:text-8xl uppercase leading-[0.8] tracking-tighter text-black mb-8">
                   {baseName}
                 </h1>
                 
                 <div className="flex flex-wrap items-baseline gap-6 mb-8">
                    <span className="text-5xl lg:text-6xl font-neo font-black text-black">
                      {formatBDT(sellingPrice)}
                    </span>
                    {salePromo && (
                      <span className="text-2xl font-neo font-black text-black/20 line-through">
                        {formatBDT(originalPrice)}
                      </span>
                    )}
                 </div>

                 <NeoCard variant="white" className="p-4 inline-flex items-center gap-3 -rotate-1 shadow-none">
                    <Info size={16} className="text-sd-gold" />
                    <span className="font-neo font-bold text-xs uppercase text-black">Direct Archival Entry: Immediate Release Protocol Enabled</span>
                 </NeoCard>
              </div>

              {hasMultipleVariants && (
                 <div className="pt-12 border-t-4 border-black">
                    <VariantSelector variants={productVariants} selectedVariant={selectedVariant} onVariantChange={handleVariantChange} />
                 </div>
              )}

              <div className="space-y-8 pt-12 border-t-4 border-black">
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                    {/* Qty Selector */}
                    <div className="flex items-center bg-white neo-border-2 p-1">
                       <button 
                         onClick={() => handleQuantityChange(-1)} 
                         disabled={quantity <= 1} 
                         className="w-12 h-12 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all disabled:opacity-20"
                       >
                         <Minus size={16} strokeWidth={3} />
                       </button>
                       <div className="w-16 flex items-center justify-center">
                         <span className="font-neo font-black text-xl">{quantity}</span>
                       </div>
                       <button 
                         onClick={() => handleQuantityChange(1)} 
                         disabled={quantity >= availableInventory} 
                         className="w-12 h-12 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all disabled:opacity-20"
                       >
                         <Plus size={16} strokeWidth={3} />
                       </button>
                    </div>

                    <NeoButton 
                      ref={mainCtaRef} 
                      onClick={handleAddToCart} 
                      disabled={!selectedVariant.in_stock || isAdding || availableInventory <= 0} 
                      variant="primary"
                      className="flex-1 h-[68px]"
                    >
                       <AnimatePresence mode="wait">
                          {cartStatus === 'loading' ? (
                             <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-neo font-black text-sm uppercase">Archiving...</motion.span>
                          ) : cartStatus === 'success' ? (
                             <motion.span key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 font-neo font-black text-sm uppercase"><ShoppingCart size={18} /> Entry Recorded</motion.span>
                          ) : (
                             <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 font-neo font-black text-sm uppercase">
                               <ShoppingBag size={18} /> {availableInventory <= 0 ? 'Waitlist Entry' : 'Acquire Specimen'}
                             </motion.span>
                          )}
                       </AnimatePresence>
                    </NeoButton>
                 </div>
                 
                 <button 
                   onClick={handleBuyItNow} 
                   disabled={!selectedVariant.in_stock || isAdding || availableInventory <= 0} 
                   className="w-full h-[68px] neo-border-4 border-black bg-white font-neo font-black text-sm uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all neo-shadow-sm active:translate-y-1 active:shadow-none"
                 >
                   Instant Transfer protocol
                 </button>
              </div>

              {/* Specs */}
              <div className="pt-16 space-y-10">
                 <h3 className="font-neo font-black text-2xl uppercase text-black flex items-center gap-4">
                   Provenance & Detail <div className="h-1 flex-1 bg-black/10" />
                 </h3>
                 <div className="space-y-8">
                    {product.description && (
                      <NeoCard variant="white" className="p-8 rotate-1 shadow-none">
                         <div className="font-neo font-bold text-lg text-black/70 leading-relaxed">
                           {product.description}
                         </div>
                      </NeoCard>
                    )}
                    
                    <div className="neo-border-4 border-black bg-white overflow-hidden">
                       <table className="w-full text-left border-collapse">
                          <tbody>
                             <tr className="border-b-2 border-black/10 hover:bg-black/5 transition-colors">
                               <td className="p-4 font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Inventory Status</td>
                               <td className="p-4 font-neo font-black text-sm uppercase text-right">
                                 {availableInventory > 0 ? (
                                   <span className="text-sd-gold">Archived: {availableInventory} Units</span>
                                 ) : (
                                   <span className="text-red-500">Registry Depleted</span>
                                 )}
                               </td>
                             </tr>
                             <tr className="border-b-2 border-black/10 hover:bg-black/5 transition-colors">
                               <td className="p-4 font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Authentication</td>
                               <td className="p-4 font-neo font-black text-sm uppercase text-right">Registry Verified</td>
                             </tr>
                             <tr className="hover:bg-black/5 transition-colors">
                               <td className="p-4 font-neo font-black text-[10px] uppercase tracking-widest text-black/40">Dispatch</td>
                               <td className="p-4 font-neo font-black text-sm uppercase text-right">Immediate Release</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Section */}
        {relatedProducts.length > 0 && (
           <section className="mt-40 pt-32 border-t-8 border-black relative overflow-hidden">
             <div className="container mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-12">
                   <div>
                      <NeoBadge variant="gold" className="mb-6 shadow-none">ASSOCIATED SPECIMENS</NeoBadge>
                      <h2 className="font-neo font-black text-6xl sm:text-8xl uppercase leading-[0.8] tracking-tighter text-black">
                        Registry <br /><span className="text-sd-gold italic">Connections</span>
                      </h2>
                   </div>
                   <Link href="/e-commerce/products">
                      <NeoButton variant="black" className="px-10">Complete Anthology <ArrowRight /></NeoButton>
                   </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                   {relatedProducts.slice(0, 4).map((item, idx) => (
                     <NeoProductCard 
                       key={item.id} 
                       product={item} 
                       animDelay={idx * 100} 
                       onOpen={(p) => router.push(`/e-commerce/product/${p.id}`)} 
                       onAddToCart={handleQuickAddToCart} 
                     />
                   ))}
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
