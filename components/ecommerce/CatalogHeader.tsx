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
    <header className="bg-sd-black pt-24 pb-12 lg:pt-32 lg:pb-20 border-b border-sd-border-default">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-sd-text-muted mb-8">
          <Link href="/e-commerce" className="hover:text-sd-gold transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/e-commerce/products" className="hover:text-sd-gold transition-colors">Shop</Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-sd-gold">{category}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-sd-ivory leading-tight mb-4 capitalize">
              {title}
            </h1>
            <p className="text-sd-text-secondary text-sm lg:text-base leading-relaxed max-w-lg">
              Explore our premium collection of {category ? category.toLowerCase() : 'accessories'} designed for performance and personality.
            </p>
          </div>

          {count !== undefined && (
            <div className="text-sd-text-muted text-[10px] font-bold tracking-[0.3em] uppercase border-b border-sd-gold/30 pb-2">
              {count} {count === 1 ? 'Product' : 'Products'} Found
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;
