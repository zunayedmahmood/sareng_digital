'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface CatalogEmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function CatalogEmptyState({
  title = "No Products Found",
  description = "Try adjusting your filters or search query.",
  actionText = "Reset All Filters",
  onAction,
  icon = <ShoppingBag className="w-16 h-16 text-sd-gold/20 mx-auto mb-6" />
}: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-sd-onyx/30 rounded-3xl border border-dashed border-sd-border-default">
      {icon}
      <h3 className="text-2xl font-bold text-sd-ivory mb-2 font-display italic">{title}</h3>
      <p className="text-sd-text-secondary mb-8 max-w-xs mx-auto text-sm">{description}</p>
      {onAction && (
        <button 
          onClick={onAction}
          className="bg-sd-gold text-sd-black px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-sd-gold-soft transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
