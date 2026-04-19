'use client';

import React from 'react';

interface ProductSpecsProps {
  description: string;
  attributes?: Record<string, any>;
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ description, attributes }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-24 lg:gap-32">
      {/* Description Section */}
      <section className="w-full lg:w-3/5">
        <div className="flex flex-col gap-1 mb-10">
          <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">The Narrative</span>
          <h3 className="text-3xl font-display font-medium italic text-sd-ivory">A detailed exploration</h3>
        </div>
        <div 
          className="prose prose-invert prose-sd prose-lg max-w-none text-sd-text-secondary leading-relaxed font-light"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </section>

      {/* Specifications Section */}
      {attributes && Object.keys(attributes).length > 0 && (
        <section className="w-full lg:w-2/5">
          <div className="flex flex-col gap-1 mb-10">
            <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase">Technical Details</span>
            <h3 className="text-3xl font-display font-medium italic text-sd-ivory">Specifications</h3>
          </div>
          <div className="flex flex-col border-t border-white/5">
             {Object.entries(attributes).map(([key, value]) => (
               <div key={key} className="flex items-center justify-between border-b border-white/5 py-6 group hover:bg-white/[0.02] transition-colors px-2">
                 <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sd-gold/60 group-hover:text-sd-gold transition-colors">{key}</span>
                 <span className="text-sm text-sd-ivory/80 font-medium group-hover:text-sd-ivory transition-colors">{String(value)}</span>
               </div>
             ))}
          </div>
          
          {/* Subtle Craftsmanship Note */}
          <div className="mt-12 p-8 rounded-[2rem] bg-sd-onyx/30 border border-white/5">
             <p className="text-[10px] text-sd-text-muted leading-relaxed uppercase tracking-widest text-center">
                Each Sareng Digital piece is masterfully engineered with precision to ensure a premium experience.
             </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductSpecs;
