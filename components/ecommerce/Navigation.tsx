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
  { name: 'Collections', slug: 'products' },
  { name: 'Earbuds', slug: 'earbuds' },
  { name: 'Mice', slug: 'mice' },
  { name: 'Keyboards', slug: 'keyboards' },
  { name: 'Pendrives', slug: 'pendrives', isNew: true },
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
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const cartBadge = cartCount > 0 && (
    <motion.span 
      key={cartCount}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -top-1 -right-1 bg-sd-gold text-sd-black text-[9px] font-mono font-bold h-4 w-4 flex items-center justify-center border border-sd-black/10"
    >
      {cartCount}
    </motion.span>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[200] hidden lg:block transition-all duration-700 ease-in-out ${
        isScrolled ? 'h-16' : 'h-24'
      }`}>
        {/* Border and Glass Background */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          isScrolled 
            ? 'bg-sd-white/90 backdrop-blur-xl border-b border-sd-border-default' 
            : 'bg-transparent border-b border-transparent'
        }`} />

        <div className="container mx-auto px-12 h-full relative z-10">
          <div className="grid grid-cols-3 h-full items-center">
            {/* Left: Collections & About (Technical Labels) */}
            <nav className="flex items-center gap-12">
               {['Products', 'About'].map((link) => (
                 <Link 
                   key={link}
                   href={link === 'Products' ? '/e-commerce/products' : `/e-commerce/${link.toLowerCase()}`}
                   className="group flex flex-col"
                 >
                   <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-sd-text-secondary group-hover:text-sd-black transition-colors">
                     {link}
                   </span>
                   <div className="h-[1px] w-0 bg-sd-gold group-hover:w-full transition-all duration-500 ease-in-out" />
                 </Link>
               ))}
            </nav>

            {/* Center: The Masthead */}
            <Link href="/e-commerce" className="flex flex-col items-center group">
              <span className="text-sd-black font-display italic text-4xl lg:text-5xl leading-none transition-transform duration-700">
                Sareng
              </span>
              <span className="text-sd-black text-[9px] font-mono tracking-[0.7em] uppercase mt-1.5 opacity-60">
                Digital
              </span>
            </Link>

            {/* Right: Actions (Artifact Interaction) */}
            <div className="flex items-center justify-end gap-10">
              <button 
                onClick={() => router.push('/e-commerce/search')}
                className="group flex items-center gap-3 text-sd-black py-2 transition-all"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">Search</span>
                <Search className="w-4 h-4 stroke-[1.5px]" />
              </button>

              <div className="h-4 w-[1px] bg-sd-border-default" />

              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">Cart</span>
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4 stroke-[1.5px] text-sd-black" />
                    {cartBadge}
                  </div>
                </button>

                <Link href="/e-commerce/my-account" className="text-sd-black hover:text-sd-gold transition-colors">
                  <User className="w-4 h-4 stroke-[1.5px]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE (The Pocket Gallery) --- */}
      <div className={`fixed top-0 left-0 right-0 h-16 z-[200] flex lg:hidden items-center justify-between px-6 transition-all duration-500 ${
        isScrolled ? 'bg-sd-white border-b border-sd-border-default' : 'bg-transparent'
      }`}>
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 text-sd-black">
          <Menu className="w-6 h-6 stroke-[1.5px]" />
        </button>
        
        <Link href="/e-commerce" className="flex flex-col items-center">
          <span className="text-sd-black font-display italic text-2xl leading-none">Sareng</span>
          <span className="text-[7px] font-mono tracking-[0.4em] text-sd-black opacity-50 uppercase">Digital</span>
        </Link>

        <button onClick={() => setIsCartOpen(true)} className="p-2 -mr-2 text-sd-black relative">
          <ShoppingBag className="w-5 h-5 stroke-[1px]" />
          {cartBadge}
        </button>
      </div>

      {/* --- MOBILE BOTTOM BAR --- */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sd-white border-t border-sd-border-default lg:hidden flex items-center justify-around z-[200]">
        {[
          { icon: Home, label: 'Home', href: '/e-commerce' },
          { icon: Store, label: 'Catalog', href: '/e-commerce/products' },
          { icon: Search, label: 'Search', href: '/e-commerce/search' },
          { icon: Heart, label: 'Saved', href: '/e-commerce/wishlist' },
          { icon: User, label: 'Account', href: '/e-commerce/my-account' },
        ].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all ${
                isActive ? 'text-sd-gold' : 'text-sd-text-muted'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
              <span className="text-[8px] font-mono uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* --- SIDE CATALOG DRAWER --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[300]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-sd-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.6, ease: [0.87, 0, 0.13, 1] }}
              className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-sd-ivory flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-sd-border-default">
                <div className="flex flex-col">
                  <span className="text-sd-black font-display italic text-3xl leading-none">Sareng</span>
                  <span className="text-sd-text-secondary text-[8px] font-mono tracking-[0.4em] uppercase">Digital Archive</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-sd-black p-2 -mr-2">
                  <X className="w-5 h-5 stroke-[1px]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-12 px-10">
                <div className="space-y-10">
                  {CATEGORIES.map((cat) => (
                    <Link 
                      key={cat.slug} 
                      href={cat.slug === 'products' ? '/e-commerce/products' : `/e-commerce/${cat.slug}`}
                      className="group flex items-end justify-between transition-all"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-sd-gold uppercase tracking-[0.2em]">0{cat.isNew ? 'New' : 'Cat'}</span>
                        <span className="text-3xl font-display group-hover:italic group-hover:translate-x-2 transition-all duration-500 text-sd-black">
                          {cat.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-sd-gold/30 group-hover:text-sd-gold transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-10 border-t border-sd-border-default">
                <Link href="/e-commerce/about" className="block text-[10px] font-mono text-sd-black opacity-60 mb-6 uppercase tracking-widest">Store Anthology</Link>
                <p className="text-[10px] font-mono text-sd-text-muted leading-relaxed uppercase">
                  © 2026 SARENG DIGITAL ARCHIVE.<br />CURATED CHARACTER TECH.
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
