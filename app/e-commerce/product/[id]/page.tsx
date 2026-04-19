'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCart } from '@/app/CartContext';
import catalogService, { 
  Product, 
  ProductDetailResponse, 
  SimpleProduct 
} from '@/services/catalogService';
import cartService from '@/services/cartService';
import { wishlistUtils } from '@/lib/wishlistUtils';
import { fireToast } from '@/lib/globalToast';

import ProductGallery from '@/components/ecommerce/product/ProductGallery';
import ProductInfo from '@/components/ecommerce/product/ProductInfo';
import VariantPicker from '@/components/ecommerce/product/VariantPicker';
import ProductSpecs from '@/components/ecommerce/product/ProductSpecs';
import PremiumProductCard from '@/components/ecommerce/ui/PremiumProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id ? parseInt(params.id as string) : null;
  const { refreshCart } = useCart();

  // --- State ---
  const [product, setProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response: ProductDetailResponse = await catalogService.getProduct(productId);
        const mainProduct = response.product;
        
        setProduct(mainProduct);
        setRelatedProducts(response.related_products || []);
        
        // Handle variants
        const variants = (mainProduct as any).variants || [];
        if (variants.length > 0) {
          // Normalize variants
          const normalizedVariants = variants.map((v: any) => ({
            ...v,
            in_stock: v.in_stock ?? v.stock_quantity > 0,
            selling_price: v.selling_price || v.price
          }));
          
          // Ensure main product is included if not in variants list
          const mainInVariants = normalizedVariants.some((v: any) => v.id === mainProduct.id);
          const allVariants = mainInVariants ? normalizedVariants : [mainProduct, ...normalizedVariants];
          
          setProductVariants(allVariants);
          setSelectedVariant(allVariants.find((v: any) => v.id === productId) || allVariants[0]);
        } else {
          setProductVariants([mainProduct]);
          setSelectedVariant(mainProduct);
        }

        setIsInWishlist(wishlistUtils.isInWishlist(productId));
      } catch (error) {
        console.error('Failed to fetch product:', error);
        fireToast('Product not found', 'error');
        router.push('/e-commerce/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // --- Handlers ---
  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    setQuantity(1);
    // Silent URL update
    window.history.replaceState(null, '', `/e-commerce/product/${variant.id}`);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.in_stock) return;

    try {
      setIsAdding(true);
      await cartService.addToCart({
        product_id: selectedVariant.id,
        quantity: quantity,
      });
      await refreshCart();
      fireToast(`Added ${selectedVariant.name} to cart`, 'success');
    } catch (error: any) {
      fireToast(error.message || 'Failed to add to cart', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleWishlist = () => {
    if (!productId || !product) return;
    if (isInWishlist) {
      wishlistUtils.remove(productId);
      setIsInWishlist(false);
    } else {
      wishlistUtils.add({
        id: product.id,
        name: product.name,
        price: product.selling_price,
        image: product.images[0]?.url || '',
        sku: product.sku
      });
      setIsInWishlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sd-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sd-gold" />
      </div>
    );
  }

  if (!product || !selectedVariant) return null;

  return (
    <div className="bg-sd-black min-h-screen">
      {/* 1. Navigation Back */}
      <div className="container mx-auto px-6 py-8 lg:py-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sd-gold text-[10px] font-bold tracking-[0.2em] uppercase hover:text-sd-ivory transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Collection
        </button>
      </div>

      <main className="container mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left Column: Gallery */}
          <div className="w-full lg:w-3/5">
            <ProductGallery 
              images={selectedVariant.images?.length > 0 ? selectedVariant.images : product.images} 
              title={product.name} 
            />
          </div>

          {/* Right Column: Info & Actions */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 lg:h-max space-y-12">
            <ProductInfo 
              product={product}
              selectedVariant={selectedVariant}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
              isInWishlist={isInWishlist}
              onToggleWishlist={toggleWishlist}
            />

            <VariantPicker 
              variants={productVariants}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
            />
          </div>
        </div>

        {/* Full Details & Specs */}
        <div className="mt-24 lg:mt-40 border-t border-sd-border-default pt-24">
           <ProductSpecs 
             description={product.description} 
             attributes={selectedVariant.attributes || product.attributes} 
           />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 lg:mt-48">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sd-gold text-[10px] font-bold tracking-[0.4em] uppercase mb-3 block">STYLE IT WITH</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-sd-ivory">
                  Complete the <span className="font-display italic font-normal text-sd-gold">Experience</span>
                </h2>
              </div>
              <a href="/e-commerce/products" className="hidden lg:flex items-center gap-2 text-sd-gold text-xs font-bold tracking-widest uppercase hover:text-sd-ivory transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
               {relatedProducts.slice(0, 4).map((p, i) => (
                 <PremiumProductCard 
                   key={p.id} 
                   product={p} 
                   animDelay={i * 50} 
                   onOpen={(prod) => router.push(`/e-commerce/product/${prod.slug || prod.id}`)}
                 />
               ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Add to Cart (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-sd-black/80 backdrop-blur-md border-t border-sd-border-default z-[200]">
         <div className="flex items-center gap-4">
           <div className="flex-1">
             <button
               disabled={!selectedVariant.in_stock || isAdding}
               onClick={handleAddToCart}
               className="w-full bg-sd-gold text-sd-black py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2"
             >
               {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingBag className="w-4 h-4" /> Add to Bag</>}
             </button>
           </div>
           <div className="text-right">
              <div className="text-[10px] font-bold text-sd-gold uppercase tracking-widest">Price</div>
              <div className="text-xl font-bold text-sd-ivory">৳{(selectedVariant.selling_price || product.selling_price).toLocaleString()}</div>
           </div>
         </div>
      </div>
    </div>
  );
}
