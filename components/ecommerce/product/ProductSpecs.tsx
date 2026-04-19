'use client';

import React from 'react';

interface ProductSpecsProps {
  description: string;
  attributes?: Record<string, any>;
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ description, attributes }) => {
  return (
    <div className="space-y-16">
      <section className="max-w-4xl">
        <h3 className="text-sd-gold text-xs font-bold tracking-[0.4em] uppercase mb-8">Description</h3>
        <div 
          className="prose prose-invert prose-sd prose-lg max-w-none text-sd-text-secondary leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </section>

      {attributes && Object.keys(attributes).length > 0 && (
        <section className="max-w-4xl">
          <h3 className="text-sd-gold text-xs font-bold tracking-[0.4em] uppercase mb-8">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border-t border-sd-border-default pt-8">
             {Object.entries(attributes).map(([key, value]) => (
               <div key={key} className="flex items-center justify-between border-b border-sd-border-light py-4">
                 <span className="text-[10px] font-bold tracking-widest uppercase text-sd-text-muted">{key}</span>
                 <span className="text-sm text-sd-ivory font-medium">{String(value)}</span>
               </div>
             ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductSpecs;
