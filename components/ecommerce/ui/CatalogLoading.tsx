'use client';

import React from 'react';

interface CatalogLoadingProps {
  count?: number;
  gridCols?: string;
}

export default function CatalogLoading({ 
  count = 8,
  gridCols = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
}: CatalogLoadingProps) {
  return (
    <div className={`grid ${gridCols} gap-6 animate-pulse`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="aspect-[3/4] bg-sd-onyx rounded-xl" />
          <div className="h-4 bg-sd-onyx rounded-full w-3/4" />
          <div className="h-4 bg-sd-onyx rounded-full w-1/2" />
        </div>
      ))}
    </div>
  );
}
