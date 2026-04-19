'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Home, 
  Store,
  X,
  ChevronRight
} from 'lucide-react';
import { useCart } from '@/app/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { name: 'All', slug: 'all' },
  { name: 'Earbuds', slug: 'earbuds' },
  { name: 'Mice', slug: 'mice' },
  { name: 'Keyboards', slug: 'keyboards' },
  { name: 'Pendrives', slug: 'pendrives', isNew: true },
  { name: 'Accessories', slug: 'accessories' },
];

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { cart, setIsCartOpen } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const cartBadge = cartCount > 0 && (
    <motion.span 
      key={cartCount}
      initial={{ scale: 1.4 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 bg-sd-gold text-sd-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
    >
      {cartCount}
    </motion.span>
  );

  return (
    <>
      {/* --- DESKTOP NAVIGATION (≥1024px) --- */}
      <header className={`fixed top-0 left-0 right-0 z-[200] hidden lg:block transition-all duration-500 ${
        isScrolled 
          ? 'bg-sd-black/80 backdrop-blur-2xl border-b border-sd-border-default h-20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
          : 'bg-transparent h-28'
      }`}>
        <div className="container mx-auto px-10 h-full flex items-center">
          <div className="grid grid-cols-3 w-full items-center">
            {/* Left: Links */}
            <nav className="flex items-center gap-10">
               {['Products', 'Checkout', 'About'].map((link) => (
                 <Link 
                   key={link}
                   href={`/e-commerce/${link.toLowerCase()}`}
                   className="text-[11px] font-bold tracking-[0.25em] uppercase text-sd-text-secondary hover:text-sd-gold transition-colors"
                 >
                   {link}
                 </Link>
               ))}
            </nav>

            {/* Center: Logo */}
            <Link href="/e-commerce" className="flex flex-col items-center group">
              <span className="text-sd-gold font-display italic text-3xl leading-none transition-transform group-hover:scale-110 duration-700">Sareng</span>
              <span className="text-sd-ivory text-[8px] tracking-[0.6em] uppercase mt-1 opacity-60">Digital Boutique</span>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-8">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                  if (q.trim()) router.push(`/e-commerce/search?q=${encodeURIComponent(q)}`);
                }}
                className="relative group"
              >
                <input 
                  name="q"
                  type="text" 
                  placeholder="Search..."
                  className="w-48 bg-transparent border-b border-sd-border-default py-1 px-2 pl-8 text-xs text-sd-text-primary focus:outline-none focus:border-sd-gold transition-all placeholder:text-sd-text-muted focus:w-64"
                />
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-sd-gold/50 group-focus-within:text-sd-gold transition-colors" />
              </form>

              <div className="flex items-center gap-5 border-l border-sd-border-default pl-8">
                <Link href="/e-commerce/wishlist" className="text-sd-text-primary hover:text-sd-gold transition-all p-2 hover:-translate-y-0.5">
                  <Heart className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="text-sd-text-primary hover:text-sd-gold transition-all p-2 relative hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartBadge}
                </button>
                <Link href="/e-commerce/my-account" className="text-sd-text-primary hover:text-sd-gold transition-all p-2 hover:-translate-y-0.5">
                  <User className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE TOP BAR (<1024px) --- */}
      <div className={`fixed top-0 left-0 right-0 h-16 z-[200] flex lg:hidden items-center justify-between px-6 transition-all duration-300 ${
        isScrolled ? 'bg-sd-onyx/90 backdrop-blur-xl border-b border-sd-border-default' : 'bg-transparent'
      }`}>
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 text-sd-text-primary">
          <Menu className="w-6 h-6" />
        </button>
        
        <Link href="/e-commerce" className="flex flex-col items-center">
          <span className="text-sd-gold font-display italic text-2xl leading-none">Sareng</span>
          <span className="text-[7px] tracking-[0.4em] text-sd-ivory opacity-50">DIGITAL</span>
        </Link>

        <button onClick={() => setIsCartOpen(true)} className="p-2 -mr-2 text-sd-text-primary relative">
          <ShoppingBag className="w-6 h-6" />
          {cartBadge}
        </button>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sd-onyx border-t border-sd-border-default z-[200] lg:hidden flex items-center justify-around pb-safe">
        {[
          { icon: Home, label: 'Home', href: '/e-commerce' },
          { icon: Store, label: 'Shop', href: '/e-commerce/products' },
          { icon: Search, label: 'Search', href: '/e-commerce/search' },
          { icon: Heart, label: 'Wishlist', href: '/e-commerce/wishlist' },
          { icon: User, label: 'Account', href: '/e-commerce/my-account' },
        ].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? 'text-sd-gold' : 'text-sd-text-muted hover:text-sd-text-secondary'
              }`}
            >
              <div className="relative">
                <item.icon className="w-[22px] h-[22px]" />
                {isActive && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-sd-gold rounded-full" />}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* --- MOBILE CATEGORY DRAWER --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-sd-black/60 backdrop-blur-sm z-[300]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-sd-onyx z-[301] shadow-2xl flex flex-col pt-safe"
            >
              <div className="p-6 flex items-center justify-between border-b border-sd-border-default">
                <div className="flex flex-col">
                  <span className="text-sd-gold font-bold tracking-[0.1em] text-lg leading-none">SARENG</span>
                  <span className="text-sd-text-secondary text-[9px] tracking-[0.05em]">DIGITAL</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-sd-text-secondary p-2 -mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="space-y-4">
                  {CATEGORIES.map((cat) => (
                    <Link 
                      key={cat.slug} 
                      href={cat.slug === 'all' ? '/e-commerce/products' : `/e-commerce/${cat.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-sd-black/40 group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Geometric Icon placeholder */}
                        <div className="w-8 h-8 rounded-full border border-sd-border-default flex items-center justify-center text-sd-gold font-mono text-[10px] group-hover:border-sd-gold transition-colors">
                          {cat.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-sd-text-primary group-hover:text-sd-gold transition-colors">
                          {cat.name}
                        </span>
                        {cat.isNew && (
                          <span className="text-[10px] bg-sd-gold-dim text-sd-gold px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">New</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-sd-text-muted" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-sd-border-default space-y-4">
                <Link href="/e-commerce/about" className="block text-sm text-sd-text-secondary hover:text-sd-gold transition-colors underline-offset-4 hover:underline">About Sareng</Link>
                <div className="flex gap-4">
                   {/* Social links placeholder */}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
