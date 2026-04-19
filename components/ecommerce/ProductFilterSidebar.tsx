'use client';

import React from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { CatalogCategory } from '@/services/catalogService';

interface ProductFilterSidebarProps {
  categories: CatalogCategory[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  priceRange: string;
  onPriceChange: (range: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClose?: () => void;
}

const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ৳1,000', value: '0-1000' },
  { label: '৳1,000 - ৳3,000', value: '1000-3000' },
  { label: '৳3,000 - ৳5,000', value: '3000-5000' },
  { label: 'Above ৳5,000', value: '5000-100000' },
];

const SORT_OPTIONS = [
  { label: 'Recently Added', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  onClose,
}) => {
  return (
    <div className="flex flex-col gap-12">
      {/* Categories */}
      <section>
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">Collections</span>
          <div className="h-[1px] w-8 bg-sd-gold/30" />
        </div>
        <ul className="space-y-5">
          <li>
            <button 
              onClick={() => onCategoryChange('all')}
              className={`group flex items-center justify-between w-full text-xs tracking-widest uppercase transition-all duration-300 ${activeCategory === 'all' ? 'text-sd-ivory font-bold' : 'text-sd-text-muted hover:text-sd-gold'}`}
            >
              All Boutiques
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeCategory === 'all' ? 'bg-sd-gold shadow-[0_0_8px_rgba(201,168,76,0.5)]' : 'bg-transparent border border-white/10 group-hover:border-sd-gold'}`} />
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button 
                onClick={() => onCategoryChange(String(cat.id))}
                className={`group flex items-center justify-between w-full text-xs tracking-widest uppercase transition-all duration-300 text-left ${activeCategory === String(cat.id) ? 'text-sd-ivory font-bold' : 'text-sd-text-muted hover:text-sd-gold'}`}
              >
                {cat.name}
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeCategory === String(cat.id) ? 'bg-sd-gold shadow-[0_0_8px_rgba(201,168,76,0.5)]' : 'bg-transparent border border-white/10 group-hover:border-sd-gold'}`} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Price Range */}
      <section>
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">Investment</span>
          <div className="h-[1px] w-8 bg-sd-gold/30" />
        </div>
        <div className="flex flex-col gap-2">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => onPriceChange(range.value)}
              className={`text-[11px] py-3 px-5 rounded-full border text-left tracking-wider transition-all duration-500 ${
                priceRange === range.value 
                  ? 'border-sd-gold/50 bg-sd-gold/5 text-sd-gold shadow-inner' 
                  : 'border-white/5 text-sd-text-muted hover:border-sd-gold/30 hover:text-sd-ivory'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </section>

      {/* Sorting */}
      <section>
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">Order By</span>
          <div className="h-[1px] w-8 bg-sd-gold/30" />
        </div>
        <div className="grid grid-cols-1 gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`text-[11px] py-3 px-5 rounded-full border text-left tracking-wider transition-all duration-500 ${
                sortBy === opt.value 
                  ? 'border-sd-gold/50 bg-sd-gold/5 text-sd-gold' 
                  : 'border-white/5 text-sd-text-muted hover:border-sd-gold/30 hover:text-sd-ivory'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {onClose && (
        <button 
          onClick={onClose}
          className="lg:hidden w-full bg-sd-gold text-sd-black py-4 rounded-full font-bold text-xs tracking-widest uppercase mt-6 shadow-2xl active:scale-95"
        >
          View Collection
        </button>
      )}
    </div>
  );
};

export default ProductFilterSidebar;
