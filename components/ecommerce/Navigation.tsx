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
      initial={{ opacity: 0, scale: 0.8, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute -top-1.5 -right-1.5 bg-sd-gold text-sd-black text-[9px] font-mono font-bold h-4 w-4 flex items-center justify-center rounded-full border border-sd-black/5 shadow-sm"
    >
      {cartCount}
    </motion.span>
  );

  return (
    <>
      {/* ── DESKTOP MASTHEAD ── */}
      <header className={`fixed top-0 left-0 right-0 z-[200] hidden lg:block transition-all duration-500 ease-in-out ${
        isScrolled ? 'h-16 py-2' : 'h-24 py-4'
      }`}>
        <div className={`absolute inset-0 transition-all duration-500 ${
          isScrolled 
            ? 'bg-sd-white/95 backdrop-blur-md shadow-sd-lift border-b border-sd-border-default/30' 
            : 'bg-transparent'
        }`} />

        <div className="container mx-auto px-12 h-full relative z-10 flex items-center justify-between">
          {/* Left: Collections (Tactile Labels) */}
          <nav className="flex items-center gap-10">
            {['Archive', 'Artifacts'].map((link) => (
              <Link 
                key={link}
                href={link === 'Archive' ? '/e-commerce/products' : '/e-commerce/search'}
                className="group relative py-2"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-sd-text-secondary group-hover:text-sd-black transition-colors block">
                  {link}
                </span>
                <motion.div 
                  className="absolute bottom-0 left-0 h-[1px] bg-sd-gold"
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
            ))}
          </nav>

          {/* Center: Branding (The Deep Cut) */}
          <Link href="/e-commerce" className="flex flex-col items-center group perspective-1000">
            <motion.div 
              className="flex flex-col items-center gap-0"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sd-black font-display italic text-4xl lg:text-5xl leading-none">
                Sareng
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-[1px] w-4 bg-sd-gold/30" />
                <span className="text-sd-black text-[9px] font-mono tracking-[0.6em] uppercase opacity-40">
                  Digital
                </span>
                <div className="h-[1px] w-4 bg-sd-gold/30" />
              </div>
            </motion.div>
          </Link>

          {/* Right: Actions (Lifting UI) */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push('/e-commerce/search')}
              className="group p-2 text-sd-black hover:sd-depth-lift transition-all rounded-lg"
            >
              <Search className="w-5 h-5 stroke-[1.5px] opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className="h-4 w-[1px] bg-sd-border-default/20" />

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-sd-white shadow-sd-card border border-sd-border-default/10 rounded-xl hover:shadow-sd-lift transition-all group overflow-hidden"
              >
                <div className="absolute inset-0 bg-sd-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <ShoppingBag className="w-5 h-5 stroke-[1.5px] text-sd-black relative z-10" />
                {cartBadge}
              </button>

              <Link 
                href="/e-commerce/my-account" 
                className="p-2.5 text-sd-text-secondary hover:text-sd-black transition-colors"
              >
                <User className="w-5 h-5 stroke-[1.5px]" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE HEADER (Paper Stack) ── */}
      <div className={`fixed top-0 left-0 right-0 h-20 z-[200] flex lg:hidden items-end pb-4 px-6 transition-all duration-500 ${
        isScrolled ? 'bg-sd-white shadow-sd-lift' : 'bg-transparent pb-6'
      }`}>
        <div className="flex items-center justify-between w-full">
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            className="p-2.5 bg-sd-white/90 backdrop-blur-sm shadow-sd-card border border-sd-border-default/10 rounded-xl"
          >
            <Menu className="w-6 h-6 stroke-[1.5px] text-sd-black" />
          </button>
          
          <Link href="/e-commerce" className="flex flex-col items-center">
            <span className="text-sd-black font-display italic text-3xl leading-none">Sareng</span>
            <span className="text-[7px] font-mono tracking-[0.4em] text-sd-gold uppercase font-bold">Archive</span>
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)} 
            className="p-2.5 bg-sd-white/90 backdrop-blur-sm shadow-sd-card border border-sd-border-default/10 rounded-xl relative"
          >
            <ShoppingBag className="w-6 h-6 stroke-[1.2px] text-sd-black" />
            {cartBadge}
          </button>
        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR (The Lifted Shelf) ── */}
      <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-[190] lg:hidden">
        <div className="absolute inset-x-4 bottom-4 h-16 bg-sd-white shadow-sd-float border border-sd-border-default/10 rounded-2xl flex items-center justify-around px-2 pointer-events-auto overflow-hidden">
          <div className="absolute inset-0 bg-sd-ivory-dark/10 pointer-events-none" />
          {[
            { icon: Home, label: 'Home', href: '/e-commerce' },
            { icon: Store, label: 'Store', href: '/e-commerce/products' },
            { icon: Search, label: 'Find', href: '/e-commerce/search' },
            { icon: Heart, label: 'Saved', href: '/e-commerce/wishlist' },
            { icon: User, label: 'User', href: '/e-commerce/my-account' },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all relative ${
                  isActive ? 'text-sd-black' : 'text-sd-text-muted opacity-60'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-sd-gold/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
                <span className="text-[7px] font-mono tracking-widest uppercase relative z-10 font-bold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── SIDE CATALOG DRAWER (Recessed Well) ── */}
      <AnimatePresence mode="wait">
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[300]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-sd-black/60 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-sd-ivory sd-depth-recess flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-sd-border-default/20">
                <div className="flex flex-col">
                  <span className="text-sd-black font-display italic text-3xl leading-none">Sareng</span>
                  <span className="text-sd-gold text-[8px] font-mono tracking-[0.4em] uppercase font-bold">Registry</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-3 bg-sd-white shadow-sd-card border border-sd-border-default/10 rounded-xl"
                >
                  <X className="w-5 h-5 stroke-[1.5px] text-sd-black" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-12 px-10">
                <div className="space-y-12">
                  {CATEGORIES.map((cat, idx) => (
                    <Link 
                      key={cat.slug} 
                      href={cat.slug === 'products' ? '/e-commerce/products' : `/e-commerce/${cat.slug}`}
                      className="group flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-sd-gold font-bold">0{idx + 1}</span>
                        <div className="h-[1px] w-6 bg-sd-border-default/30 group-hover:w-full group-hover:bg-sd-gold/30 transition-all duration-700" />
                      </div>
                      <span className="text-3xl font-display group-hover:italic group-hover:translate-x-3 transition-transform duration-500 text-sd-black flex items-center justify-between">
                        {cat.name}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-10 bg-sd-ivory-dark/30 border-t border-sd-border-default/20">
                <p className="text-[9px] font-mono text-sd-text-muted leading-relaxed uppercase tracking-wider">
                  © 2026 SARENG ARCHIVE.<br />
                  <span className="text-sd-black/40">CURATED CHARACTER ARTIFACTS.</span>
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
