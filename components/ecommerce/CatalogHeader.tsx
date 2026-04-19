'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CatalogHeaderProps {
  title: string;
  count?: number;
  category?: string;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({ title, count, category }) => {
  return (
    <header className="relative bg-[#0A0A0A] pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Decorative Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-sd-gold/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sd-border-default to-transparent opacity-30" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Breadcrumbs - High End Style */}
        <nav className="flex items-center gap-3 text-[9px] font-bold tracking-[0.4em] uppercase text-sd-text-muted mb-12">
          <Link href="/e-commerce" className="hover:text-sd-gold transition-colors">Home</Link>
          <div className="w-1.5 h-1.5 rounded-full bg-sd-gold/20" />
          <Link href="/e-commerce/products" className="hover:text-sd-gold transition-colors">Boutique</Link>
          {category && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-sd-gold/20" />
              <span className="text-sd-gold">{category}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-8xl font-bold text-sd-ivory leading-[0.9] tracking-tighter mb-8"
            >
              {title.split(' ').map((word, i) => (
                <span key={i} className={`${i % 2 === 1 ? 'font-display italic font-normal text-sd-gold' : ''} block lg:inline-block md:mr-4`}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sd-text-secondary text-base lg:text-xl leading-relaxed max-w-xl font-light"
            >
              Discover our masterfully crafted {category ? category.toLowerCase() : 'accessories'} designed to elevate your digital experience with unparalleled style.
            </motion.p>
          </div>

          {count !== undefined && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 border-l border-sd-gold/20 pl-8 mb-2"
            >
              <span className="text-4xl font-display italic text-sd-gold leading-none">{count}</span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-sd-text-muted">
                Items<br/>Available
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;
