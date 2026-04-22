'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total?: number;
}

interface CatalogPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  variant?: 'full' | 'simple';
}

export default function CatalogPagination({ 
  pagination, 
  onPageChange,
  variant = 'full'
}: CatalogPaginationProps) {
  const { current_page, last_page } = pagination;

  if (!last_page || last_page <= 1) return null;

  return (
    <div className="mt-20 flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        {/* Previous Button */}
        <button 
          disabled={current_page === 1}
          onClick={() => onPageChange(current_page - 1)}
          className="w-10 h-10 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold transition-colors disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {variant === 'full' ? (
          <div className="flex items-center gap-2">
            {[...Array(last_page)].map((_, i) => {
              const page = i + 1;
              // Logic to show first, last, current, and one around current
              if (page === 1 || page === last_page || Math.abs(page - current_page) <= 1) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                      current_page === page 
                      ? 'bg-sd-gold text-sd-black' 
                      : 'text-sd-text-secondary hover:text-sd-ivory'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === 2 || page === last_page - 1) {
                return <span key={page} className="text-sd-text-muted">...</span>;
              }
              return null;
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sd-text-muted text-xs font-bold tracking-widest uppercase">
              Page {current_page} of {last_page}
            </span>
          </div>
        )}

        {/* Next Button */}
        <button 
          disabled={current_page === last_page}
          onClick={() => onPageChange(current_page + 1)}
          className="w-10 h-10 rounded-full border border-sd-border-default flex items-center justify-center text-sd-ivory hover:border-sd-gold hover:text-sd-gold transition-colors disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {variant === 'full' && (
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sd-text-muted">
           Page {current_page} of {last_page}
        </span>
      )}
    </div>
  );
}
