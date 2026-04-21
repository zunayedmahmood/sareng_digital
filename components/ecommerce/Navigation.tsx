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
      setIsScrolled(window.scrollY > 30);
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
      className="absolute -top-1 -right-1 bg-sd-black text-sd-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-sd-white"
    >
      {cartCount}
    </motion.span>
  );

  return (
    <>
      {/* --- DESKTOP NAVIGATION --- */}
      <header className={`fixed top-0 left-0 right-0 z-[200] hidden lg:block transition-all duration-700 ${
        isScrolled 
          ? 'h-20 translate-y-2' 
          : 'h-28 translate-y-0'
      }`}>
        <div className="container mx-auto px-10 h-full flex items-center justify-center">
           <div className={`flex items-center w-full px-12 h-full transition-all duration-700 ${
             isScrolled 
               ? 'bg-sd-ivory/80 backdrop-blur-3xl border border-sd-border-default h-16 rounded-full shadow-sd-card translate-y--2 max-w-5xl' 
               : 'bg-transparent border-transparent'
           }`}>
            <div className="grid grid-cols-3 w-full items-center">
              {/* Left: Links */}
              <nav className="flex items-center gap-10">
                 {['Products', 'Checkout', 'About'].map((link) => (
                   <Link 
                     key={link}
                     href={`/e-commerce/${link.toLowerCase()}`}
                     className="text-[11px] font-bold tracking-[0.25em] uppercase text-sd-text-secondary hover:text-sd-black transition-colors"
                   >
                     {link}
                   </Link>
                 ))}
              </nav>

              {/* Center: Logo */}
              <Link href="/e-commerce" className="flex flex-col items-center group">
                <span className="text-sd-black font-display italic text-3xl leading-none transition-transform group-hover:scale-105 duration-700">Sareng</span>
                <span className="text-sd-black text-[8px] tracking-[0.6em] uppercase mt-1 opacity-60">Digital</span>
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
                    className="w-32 bg-transparent border-b border-sd-border-default py-1 px-2 pl-8 text-xs text-sd-black focus:outline-none focus:border-sd-black transition-all placeholder:text-sd-text-muted focus:w-48"
                  />
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-sd-black/30 group-focus-within:text-sd-black transition-colors" />
                </form>

                <div className="flex items-center gap-4">
                  <Link href="/e-commerce/wishlist" className="text-sd-black hover:opacity-60 transition-all p-2">
                    <Heart className="w-5 h-5 stroke-[1.5px]" />
                  </Link>
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="text-sd-black hover:opacity-60 transition-all p-2 relative"
                  >
                    <ShoppingBag className="w-5 h-5 stroke-[1.5px]" />
                    {cartBadge}
                  </button>
                  <Link href="/e-commerce/my-account" className="text-sd-black hover:opacity-60 transition-all p-2">
                    <User className="w-5 h-5 stroke-[1.5px]" />
                  </Link>
                </div>
              </div>
            </div>
           </div>
        </div>
      </header>

      {/* --- MOBILE TOP BAR --- */}
      <div className={`fixed top-0 left-0 right-0 h-16 z-[200] flex lg:hidden items-center justify-between px-6 transition-all duration-300 ${
        isScrolled ? 'bg-sd-ivory/90 backdrop-blur-xl border-b border-sd-border-default' : 'bg-transparent'
      }`}>
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 text-sd-black">
          <Menu className="w-6 h-6" />
        </button>
        
        <Link href="/e-commerce" className="flex flex-col items-center">
          <span className="text-sd-black font-display italic text-2xl leading-none">Sareng</span>
          <span className="text-[7px] tracking-[0.4em] text-sd-black opacity-50 uppercase">Digital</span>
        </Link>

        <button onClick={() => setIsCartOpen(true)} className="p-2 -mr-2 text-sd-black relative">
          <ShoppingBag className="w-6 h-6 stroke-[1.5px]" />
          {cartBadge}
        </button>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION (Glassmorphic) --- */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-sd-white/80 backdrop-blur-2xl border border-sd-border-default rounded-full z-[200] lg:hidden flex items-center justify-around shadow-sd-card">
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
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                isActive ? 'text-sd-black scale-110' : 'text-sd-text-muted'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
                {isActive && <motion.div layoutId="nav-glow" className="absolute -inset-2 bg-sd-black/5 rounded-full z-[-1]" />}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
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
              className="fixed inset-0 bg-sd-black/40 backdrop-blur-sm z-[300]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-sd-ivory z-[301] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-sd-border-default">
                <div className="flex flex-col">
                  <span className="text-sd-black font-display italic text-2xl leading-none">Sareng</span>
                  <span className="text-sd-text-secondary text-[8px] tracking-[0.4em] uppercase">Digital</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-sd-black p-2 -mr-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6">
                <div className="space-y-6">
                  {CATEGORIES.map((cat) => (
                    <Link 
                      key={cat.slug} 
                      href={cat.slug === 'all' ? '/e-commerce/products' : `/e-commerce/${cat.slug}`}
                      className="flex items-center justify-between border-b border-sd-border-default pb-4 group transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-medium text-sd-black group-hover:translate-x-2 transition-transform duration-500">
                          {cat.name}
                        </span>
                        {cat.isNew && (
                          <span className="text-[8px] bg-sd-black text-sd-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">New</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-sd-black/20 group-hover:text-sd-black transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-8 space-y-4">
                <Link href="/e-commerce/about" className="block text-xs font-bold uppercase tracking-widest text-sd-black/60 hover:text-sd-black transition-colors">About Sareng</Link>
                <div className="h-px bg-sd-border-default w-full" />
                <div className="flex gap-4">
                   <p className="text-[10px] text-sd-text-muted">© 2024 SARENG DIGITAL. ALL RIGHTS RESERVED.</p>
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
