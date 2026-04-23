'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, Filter, DollarSign, Layers } from 'lucide-react';

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
  selectedStock: string;
  onStockChange: (stock: string) => void;
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
      <div key={category.id} className="mb-px group">
        <div
          className={`
            flex items-center justify-between py-3 px-4 transition-all duration-300 relative
            ${active 
              ? 'bg-sd-white text-sd-black font-bold z-10 border-l-4 border-sd-gold' 
              : 'hover:bg-sd-ivory-dark/10 text-sd-text-muted hover:text-sd-black border-l-4 border-transparent'}
          `}
          style={{ paddingLeft: `${16 + level * 16}px` }}
        >
          <span
            onClick={() => onCategoryChange(categoryRouteValue(category))}
            className="flex-1 font-mono text-[10px] uppercase tracking-widest cursor-pointer"
          >
            {category.name}
          </span>
          {hasChildren && (
            <button
               onClick={() => toggleCategory(category.id)}
               className="p-1 hover:text-sd-gold transition-colors"
            >
               {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="bg-sd-ivory-dark/5 border-l border-sd-border-default/10">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* ── Search Artifacts ── */}
      {onSearchChange && (
        <section className="space-y-4">
           <div className="flex items-center gap-2 mb-4">
              <Hash size={12} className="text-sd-gold" />
              <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-sd-black">Query Registry</h3>
           </div>
           <div className="sd-depth-recess bg-sd-ivory-dark/20 p-2 rounded-2xl">
              <input 
                type="text" 
                placeholder="Fragment keywords..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white border border-sd-border-default/50 rounded-xl px-4 py-3 font-mono text-[10px] text-sd-black focus:outline-none focus:border-sd-gold transition-all placeholder:text-sd-text-muted/40 uppercase tracking-widest"
              />
           </div>
        </section>
      )}

      {/* ── Category Anthology ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
           <Layers size={12} className="text-sd-gold" />
           <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-sd-black">Sections</h3>
        </div>
        <div className="sd-depth-recess bg-sd-white overflow-hidden rounded-3xl border border-sd-border-default/30">
          <div
            className={`
              py-4 px-5 text-[10px] font-mono font-bold uppercase tracking-widest cursor-pointer transition-all border-l-4
              ${activeCategory === 'products' || activeCategory === 'all' || activeCategory === ''
                ? 'bg-sd-white text-sd-black border-sd-gold'
                : 'bg-sd-ivory-dark/5 text-sd-text-muted border-transparent hover:bg-sd-ivory-dark/10 hover:text-sd-black'}
            `}
            onClick={() => onCategoryChange('all')}
          >
            All Anthology
          </div>
          <div className="divide-y divide-sd-border-default/5">
            {categories.map(category => renderCategory(category))}
          </div>
        </div>
      </section>

      {/* ── Price Matrix ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
           <DollarSign size={12} className="text-sd-gold" />
           <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-sd-black">Value Tiers</h3>
        </div>
        <div className="sd-depth-recess bg-sd-ivory-dark/20 p-4 rounded-3xl space-y-2">
           {[
             { value: 'all', label: 'Complete Catalog' },
             { value: '0-500', label: 'Under ৳500' },
             { value: '500-1000', label: '৳500 — ৳1,000' },
             { value: '1000-2000', label: '৳1,000 — ৳2,000' },
             { value: '2000-5000', label: '৳2,000 — ৳5,000' },
             { value: '5000-999999', label: 'Above ৳5,000' },
           ].map((range) => (
             <label key={range.value} className="flex items-center justify-between group cursor-pointer py-1">
               <span className={`font-mono text-[9px] uppercase tracking-widest transition-all ${selectedPriceRange === range.value ? 'text-sd-black font-bold border-b border-sd-gold' : 'text-sd-text-muted group-hover:text-sd-black'}`}>
                  {range.label}
               </span>
               <input
                 type="radio"
                 name="priceRange"
                 value={range.value}
                 checked={selectedPriceRange === range.value}
                 onChange={(e) => onPriceRangeChange(e.target.value)}
                 className="opacity-0 w-0 h-0"
               />
               <div className={`w-3 h-3 rounded-full border-2 transition-all ${selectedPriceRange === range.value ? 'bg-sd-gold border-sd-gold' : 'border-sd-border-default group-hover:border-sd-gold/50'}`} />
             </label>
           ))}
        </div>
      </section>

      {/* ── Registry Sequence ── */}
      {onSortChange && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
             <Filter size={12} className="text-sd-gold" />
             <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-sd-black">Sequence</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'newest', label: 'Recency' },
              { id: 'price_asc', label: 'Ascending' },
              { id: 'price_desc', label: 'Descending' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onSortChange(option.id)}
                className={`
                  px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest border transition-all
                  ${selectedSort === option.id 
                    ? 'bg-sd-black text-sd-white border-sd-black sd-depth-lift' 
                    : 'bg-sd-white text-sd-text-muted border-sd-border-default hover:border-sd-gold hover:text-sd-black'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
