'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, DollarSign, Layers, Check } from 'lucide-react';
import NeoCard from '../ui/NeoCard';
import NeoBadge from '../ui/NeoBadge';

interface Category {
  id: number;
  name: string;
  slug?: string;
  product_count?: number;
  children?: Category[];
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriceRange: string;
  onPriceRangeChange: (range: string) => void;
  selectedStock?: string;
  onStockChange?: (stock: string) => void;
  selectedSort?: string;
  onSortChange?: (sort: any) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  useIdForRouting?: boolean;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function CategorySidebar({
  categories,
  activeCategory,
  onCategoryChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedSort,
  onSortChange,
  searchQuery,
  onSearchChange,
  useIdForRouting = false,
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const isActive = (category: Category) => {
    const normalizedActive = decodeURIComponent(activeCategory || '').toLowerCase();
    if (normalizedActive === String(category.id)) return true;
    const slug = (category.slug || slugify(category.name)).toLowerCase();
    return normalizedActive === slug || normalizedActive === category.name.toLowerCase();
  };

  const categoryRouteValue = (category: Category) => 
    useIdForRouting ? String(category.id) : (category.slug || slugify(category.name));

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const active = isActive(category);

    return (
      <div key={category.id} className="group">
        <button
          onClick={() => onCategoryChange(categoryRouteValue(category))}
          className={`
            w-full flex items-center justify-between py-3 px-4 transition-all duration-100
            ${active 
              ? 'bg-sd-black text-sd-gold font-black z-10' 
              : 'hover:bg-sd-gold/10 text-black font-bold'}
          `}
          style={{ paddingLeft: `${16 + level * 16}px` }}
        >
          <span className="font-neo text-[10px] uppercase tracking-widest text-left">
            {category.name}
          </span>
          {hasChildren && (
            <div
               onClick={(e) => {
                 e.stopPropagation();
                 toggleCategory(category.id);
               }}
               className="p-1 hover:text-sd-gold transition-colors"
            >
               {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-black ml-4">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      {/* ── Search Protocol ── */}
      {onSearchChange && (
        <section className="space-y-4">
           <div className="flex items-center gap-2">
              <Hash size={14} className="text-sd-gold" />
              <h3 className="font-neo text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Query Engine</h3>
           </div>
           <NeoCard variant="white" hasHover={false} className="p-1 neo-shadow-sm border-2">
              <input 
                type="text" 
                placeholder="REGISTRY FILTER..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white px-4 py-3 font-neo text-[11px] font-black text-black focus:outline-none placeholder:text-black/20 uppercase tracking-widest"
              />
           </NeoCard>
        </section>
      )}

      {/* ── Sections ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <Layers size={14} className="text-sd-gold" />
           <h3 className="font-neo text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Archival Nodes</h3>
        </div>
        <NeoCard variant="white" hasHover={false} className="overflow-hidden border-2 p-0 neo-shadow-sm">
          <button
            className={`
              w-full text-left py-4 px-5 text-[11px] font-neo font-black uppercase tracking-widest transition-all
              ${activeCategory === 'products' || activeCategory === 'all' || activeCategory === ''
                ? 'bg-sd-black text-sd-gold'
                : 'bg-white text-black hover:bg-sd-gold/10'}
            `}
            onClick={() => onCategoryChange('all')}
          >
            All Collections
          </button>
          <div className="divide-y-2 divide-black border-t-2 border-black">
            {categories.map(category => renderCategory(category))}
          </div>
        </NeoCard>
      </section>

      {/* ── Value Tiers ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <DollarSign size={14} className="text-sd-gold" />
           <h3 className="font-neo text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Investment Range</h3>
        </div>
        <NeoCard variant="white" hasHover={false} className="p-4 border-2 neo-shadow-sm space-y-2">
           {[
             { value: 'all', label: 'Full Spectrum' },
             { value: '0-500', label: 'Under ৳500' },
             { value: '500-1000', label: '৳500 — ৳1,000' },
             { value: '1000-2000', label: '৳1,000 — ৳2,000' },
             { value: '2000-5000', label: '৳2,000 — ৳5,000' },
             { value: '5000-999999', label: 'Premium ৳5,000+' },
           ].map((range) => (
             <label key={range.value} className="flex items-center justify-between group cursor-pointer py-1.5 px-3 hover:bg-sd-gold/10 transition-colors">
               <span className={`font-neo text-[10px] font-black uppercase tracking-widest transition-all ${selectedPriceRange === range.value ? 'text-sd-black' : 'text-black/50 group-hover:text-black'}`}>
                  {range.label}
               </span>
               <input
                 type="radio"
                 name="priceRange"
                 value={range.value}
                 checked={selectedPriceRange === range.value}
                 onChange={(e) => onPriceRangeChange(e.target.value)}
                 className="hidden"
               />
               <div className={`w-4 h-4 border-2 border-black flex items-center justify-center transition-all ${selectedPriceRange === range.value ? 'bg-sd-gold' : 'bg-white'}`}>
                  {selectedPriceRange === range.value && <Check size={10} strokeWidth={4} />}
               </div>
             </label>
           ))}
        </NeoCard>
      </section>

      {/* ── Sequence ── */}
      {onSortChange && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
             <Layers size={14} className="text-sd-gold" />
             <h3 className="font-neo text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Registry Order</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'newest', label: 'Newest Retrieval' },
              { id: 'price_asc', label: 'Price: Low-High' },
              { id: 'price_desc', label: 'Price: High-Low' },
            ].map((option) => (
              <NeoCard
                key={option.id}
                variant={selectedSort === option.id ? 'black' : 'white'}
                onClick={() => onSortChange(option.id)}
                className={`py-3 px-4 text-center cursor-pointer border-2 neo-shadow-sm ${selectedSort === option.id ? 'text-sd-gold' : 'text-black font-black'}`}
              >
                <span className="font-neo text-[10px] uppercase tracking-widest">
                   {option.label}
                </span>
              </NeoCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
