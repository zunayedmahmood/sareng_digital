'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  User, 
  X,
  Plus
} from 'lucide-react';
import { useCart } from '@/app/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import NeoButton from './ui/NeoButton';
import NeoBadge from './ui/NeoBadge';
import NeoCard from './ui/NeoCard';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { name: 'Index', slug: 'products' },
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
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Archival', href: '/e-commerce/products' },
    { name: 'Identity', href: '/e-commerce/my-account' },
    { name: 'Registry', href: '/e-commerce/search' },
  ];

  return (
    <>
      {/* ── GLOBAL HEADER (Neo-Brutalist) ── */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[200] transition-all duration-300",
        isScrolled ? "py-2 sm:py-4" : "py-4 sm:py-6"
      )}>
        <div className="container mx-auto px-4 sm:px-6">
          <NeoCard 
            variant="white" 
            hasHover={false}
            className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8 neo-shadow-md sm:neo-shadow-lg"
          >
            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-4 lg:hidden">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="neo-border-2 p-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none bg-white neo-shadow-sm transition-all"
              >
                <Menu className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="group relative"
                >
                  <span className="font-neo font-black uppercase text-sm tracking-widest text-black/60 group-hover:text-black transition-colors">
                    {link.name}
                  </span>
                  <div className="absolute -bottom-1 left-0 h-[2px] w-0 bg-sd-gold transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Branding */}
            <Link href="/e-commerce" className="flex flex-col items-center">
              <span className="font-neo font-black text-2xl sm:text-4xl text-black leading-none uppercase tracking-tighter">
                Sareng <span className="text-sd-gold italic">Digital</span>
              </span>
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <div className="h-[2px] w-2 sm:w-4 bg-black" />
                <span className="text-black text-[8px] sm:text-[10px] font-neo font-bold tracking-[0.3em] uppercase">
                  Character Artifacts
                </span>
                <div className="h-[2px] w-2 sm:w-4 bg-black" />
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-6">
              <button 
                onClick={() => router.push('/e-commerce/search')}
                className="hidden sm:flex neo-border-2 p-2 bg-white neo-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="neo-border-2 p-2 sm:p-3 bg-black text-white neo-shadow-sm shadow-sd-gold/30 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                {cartCount > 0 && (
                  <NeoBadge 
                    variant="gold" 
                    className="absolute -top-3 -right-3 px-1.5 min-w-[24px] h-6 flex items-center justify-center font-neo font-black shadow-none border-2"
                  >
                    {cartCount}
                  </NeoBadge>
                )}
              </div>

              <Link 
                href="/e-commerce/my-account"
                className="hidden lg:flex neo-border-2 p-3 bg-sd-gold neo-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </NeoCard>
        </div>
      </header>

      {/* ── MOBILE DRAWER (Neo-Brutalist Drawer) ── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[300]">
            {/* Background Blur Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-white/20 backdrop-blur-sm"
            />

            {/* Drawer Content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[90%] max-w-sm bg-sd-ivory neo-border-r-8 border-black flex flex-col p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col">
                  <span className="font-neo font-black text-3xl text-black uppercase leading-none">Catalog</span>
                  <NeoBadge variant="gold" className="mt-2 text-[10px]">Registry v.2.6</NeoBadge>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="neo-border-2 p-3 bg-black text-white neo-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-4">
                {CATEGORIES.map((cat, idx) => (
                  <Link 
                    key={cat.slug}
                    href={cat.slug === 'products' ? '/e-commerce/products' : `/e-commerce/${cat.slug}`}
                    className="block group"
                  >
                    <NeoCard 
                      variant={idx % 2 === 0 ? 'white' : 'gold'}
                      className="p-5 flex items-center justify-between group-hover:translate-x-2 transition-transform"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-neo font-black text-sm text-black/30">0{idx + 1}</span>
                        <span className="font-neo font-black text-xl uppercase text-black">{cat.name}</span>
                      </div>
                      {cat.isNew && (
                        <NeoBadge variant="black" isRotated className="text-[8px] animate-pulse">New Arrival</NeoBadge>
                      )}
                    </NeoCard>
                  </Link>
                ))}
              </nav>

              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-4">
                  <NeoButton variant="black" className="flex-1 h-14">
                    <User size={18} /> Account
                  </NeoButton>
                  <NeoButton variant="gold" className="h-14 w-14 p-0">
                    <Search size={22} />
                  </NeoButton>
                </div>
                
                <div className="p-4 neo-border-2 bg-white flex flex-col gap-2">
                  <p className="font-neo font-black text-[10px] uppercase tracking-tighter text-black/40">Sareng Digital Registry</p>
                  <p className="font-neo font-black text-xs uppercase leading-tight">Curated character artifacts for the modern archival.</p>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
