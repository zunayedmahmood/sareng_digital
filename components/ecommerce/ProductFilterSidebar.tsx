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
    <div className="flex flex-col gap-10">
      {/* Categories */}
      <section>
        <h3 className="text-sd-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-6 flex items-center justify-between">
          Categories
          <ChevronDown className="w-3 h-3 opacity-50" />
        </h3>
        <ul className="space-y-4">
          <li>
            <button 
              onClick={() => onCategoryChange('all')}
              className={`text-sm transition-all flex items-center gap-2 ${activeCategory === 'all' ? 'text-sd-gold font-bold' : 'text-sd-text-secondary hover:text-sd-ivory'}`}
            >
              {activeCategory === 'all' && <Check className="w-3 h-3" />}
              All Products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button 
                onClick={() => onCategoryChange(String(cat.id))}
                className={`text-sm transition-all flex items-center gap-2 text-left ${activeCategory === String(cat.id) ? 'text-sd-gold font-bold' : 'text-sd-text-secondary hover:text-sd-ivory'}`}
              >
                {activeCategory === String(cat.id) && <Check className="w-3 h-3" />}
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Price Range */}
      <section>
        <h3 className="text-sd-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
          Price Range
        </h3>
        <div className="flex flex-col gap-3">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => onPriceChange(range.value)}
              className={`text-sm py-2 px-4 rounded-lg border text-left transition-all ${
                priceRange === range.value 
                  ? 'border-sd-gold bg-sd-gold-dim text-sd-gold' 
                  : 'border-sd-border-default text-sd-text-secondary hover:border-sd-border-hover'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </section>

      {/* Sorting */}
      <section>
        <h3 className="text-sd-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
          Sort By
        </h3>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-sd-onyer border border-sd-border-default rounded-lg px-4 py-3 text-sm text-sd-text-primary focus:outline-none focus:border-sd-gold transition-colors appearance-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </section>

      {onClose && (
        <button 
          onClick={onClose}
          className="lg:hidden w-full bg-sd-ivory text-sd-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase mt-4"
        >
          See Results
        </button>
      )}
    </div>
  );
};

export default ProductFilterSidebar;
