'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { wishlistUtils, WishlistItem } from '@/lib/wishlistUtils';
import { useCart } from '@/app/e-commerce/CartContext';
import Navigation from '@/components/ecommerce/Navigation';
import CartSidebar from '@/components/ecommerce/cart/CartSidebar';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import NeoButton from '@/components/ecommerce/ui/NeoButton';

export default function WishlistPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [addingToCartId, setAddingToCartId] = useState<string | number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load wishlist items
  useEffect(() => {
    const loadWishlist = () => {
      setWishlistItems(wishlistUtils.getAll());
    };

    loadWishlist();

    // Listen for wishlist updates
    window.addEventListener('wishlist-updated', loadWishlist);
    return () => window.removeEventListener('wishlist-updated', loadWishlist);
  }, []);

  const handleAddToCart = (item: WishlistItem) => {
    setAddingToCartId(item.id);
    addToCart(Number(item.id), 1);

    setTimeout(() => {
      setAddingToCartId(null);
      setIsCartOpen(true); // Open cart sidebar after adding
    }, 1000);
  };

  const handleRemove = (id: string | number) => {
    wishlistUtils.remove(id);
  };

  const handleClearAll = () => {
    if (confirm('AUTHORIZE DELETION: Are you sure you want to purge all stored asset shortcuts?')) {
      wishlistUtils.clear();
    }
  };

  const handleNavigateToProduct = (id: string | number) => {
    router.push(`/e-commerce/product/${id}`);
  };

  return (
    <div className="min-h-screen bg-sd-ivory pb-40 selection:bg-sd-gold selection:text-black">
      <Navigation />
      
      <div className="container mx-auto px-6 lg:px-12 pt-40">
        
        {/* ── Title Deck ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 border-b-4 border-black pb-12">
           <div className="flex-1">
              <span className="font-neo font-black text-[10px] uppercase tracking-[0.6em] text-sd-gold italic block mb-6">Local Storage Interface</span>
              <h1 className="text-7xl font-neo font-black text-black uppercase italic leading-[0.8] tracking-tighter">
                 Saved <br/> Assets
              </h1>
              <p className="font-neo font-bold text-[11px] text-black/40 uppercase tracking-widest mt-10">Persistent registry of hardware acquisitions pending authorization.</p>
           </div>

           <div className="flex flex-col items-start md:items-end gap-8">
              <div className="flex flex-col items-end">
                 <span className="font-neo font-black text-[9px] uppercase tracking-widest text-black/40 mb-1 italic">Registry Count</span>
                 <p className="font-neo font-black text-5xl text-black italic uppercase leading-none">{wishlistItems.length}</p>
              </div>
              {wishlistItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-red-500 hover:text-black transition-colors border-b-2 border-red-500 hover:border-black py-1"
                >
                  Purge Registry
                </button>
              )}
           </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="py-40">
            <NeoCard variant="white" className="max-w-xl mx-auto p-16 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-12 -translate-y-12 group-hover:rotate-0 transition-transform duration-700">
                  <Heart size={80} strokeWidth={1} />
               </div>
               <div className="w-24 h-24 border-4 border-black bg-sd-ivory flex items-center justify-center mx-auto mb-10 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                 <Heart size={40} className="text-black/10" />
               </div>
               <h2 className="font-neo font-black text-3xl uppercase italic mb-6">Registry Empty</h2>
               <p className="font-neo font-bold text-[11px] uppercase tracking-widest text-black/40 mb-12 leading-loose">
                 Initialize hardware discovery to populate your saved asset registry.
               </p>
               <NeoButton 
                 variant="primary" 
                 className="w-full py-5 text-lg uppercase italic"
                 onClick={() => router.push('/e-commerce')}
               >
                 Initialize Discovery
               </NeoButton>
            </NeoCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {wishlistItems.map((item) => (
              <NeoCard
                key={item.id}
                variant="white"
                className="group border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex flex-col p-8 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-all"
              >
                <div 
                  onClick={() => handleNavigateToProduct(item.id)}
                  className="relative aspect-[4/5] border-4 border-black bg-white overflow-hidden cursor-pointer mb-8"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-black/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                    className="absolute top-4 right-4 w-12 h-12 border-4 border-black bg-white text-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors z-20 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                  
                  <div className="absolute bottom-4 left-4 font-neo font-black text-[9px] uppercase tracking-widest bg-black text-sd-gold px-4 py-2 border-2 border-sd-gold shadow-[4px_4px_0_0_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                     Record #{item.id}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 
                    onClick={() => handleNavigateToProduct(item.id)}
                    className="font-neo font-black text-2xl uppercase italic text-black leading-none mb-4 min-h-[3rem] cursor-pointer hover:text-sd-gold transition-colors"
                  >
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center justify-between gap-4 mb-8 pt-4 border-t-4 border-black/5">
                     <div className="flex flex-col">
                        <span className="font-neo font-black text-[8px] uppercase tracking-widest text-black/40 italic">Valuation</span>
                        <span className="font-neo font-black text-2xl text-black">৳{item.price.toLocaleString()}</span>
                     </div>
                  </div>
                  
                  <NeoButton
                    variant={addingToCartId === item.id ? "gold" : "primary"}
                    onClick={() => handleAddToCart(item)}
                    disabled={addingToCartId === item.id}
                    className="w-full py-5 text-lg group"
                  >
                    {addingToCartId === item.id ? (
                      <span className="flex items-center gap-3 italic uppercase animate-pulse">✓ Allocated</span>
                    ) : (
                      <span className="flex items-center gap-3 italic uppercase">
                        Allocate Assets <ShoppingCart size={20} className="ml-2 group-hover:rotate-12 transition-transform" />
                      </span>
                    )}
                  </NeoButton>
                </div>
              </NeoCard>
            ))}
          </div>
        )}

        <div className="mt-40 pt-20 border-t-4 border-black text-center">
            <p className="font-neo font-black text-[10px] uppercase tracking-[0.8em] text-black/30 italic">Errum Digital Registry Systems • MMXXVI</p>
        </div>
      </div>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}