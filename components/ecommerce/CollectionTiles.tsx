'use client';

import React from 'react';
import Link from 'next/link';
import { CatalogCategory } from '@/services/catalogService';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface Collection {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  index: string;
}

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: '1',
    title: 'Character Audio',
    subtitle: 'Precision engineering for playful soundscapes.',
    image: '/images/product_images/duck_themed_earbuds.png',
    href: '/e-commerce/earbuds',
    index: '01',
  },
  {
    id: '2',
    title: 'Tactile Precision',
    subtitle: 'Mice designed for sensory feedback.',
    image: '/images/product_images/cat_themed_mouse.png',
    href: '/e-commerce/mice',
    index: '02',
  },
  {
    id: '3',
    title: 'Keystroke Poetry',
    subtitle: 'Mechanical masterpieces for daily prose.',
    image: '/images/product_images/transparent_themed_keyboard.png',
    href: '/e-commerce/keyboards',
    index: '03',
  },
  {
    id: '4',
    title: 'Archival Storage',
    subtitle: 'Safe passage for your digital memories.',
    image: '/images/product_images/camera_themed_pendrive.png',
    href: '/e-commerce/pendrives',
    index: '04',
  }
];

interface CollectionTilesProps {
  categories?: CatalogCategory[];
}

export default function CollectionTiles({ categories }: CollectionTilesProps) {
  const displayCollections: Collection[] = categories && categories.length > 0
    ? categories.slice(0, 4).map((cat, i) => ({
        id: cat.id,
        title: cat.name,
        subtitle: cat.description || `Explore our curated ${cat.name} artifacts.`,
        image: cat.image_url || '/images/product_images/duck_themed_earbuds.png',
        href: `/e-commerce/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        index: `0${i + 1}`
      }))
    : DEFAULT_COLLECTIONS;

  return (
    <section className="py-32 bg-sd-ivory overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-baseline justify-between mb-24 gap-8">
          <div className="max-w-2xl relative">
            <span className="font-mono text-[10px] text-sd-gold uppercase tracking-[0.4em] mb-4 block">Archive Classification</span>
            <h2 className="text-6xl lg:text-8xl font-display text-sd-black leading-[0.85] tracking-tight">
              Selected <br />
              <span className="italic font-medium text-sd-gold">Departments</span>
            </h2>
            <div className="absolute -top-12 -left-8 text-[120px] font-display italic opacity-[0.03] pointer-events-none select-none">
              Index
            </div>
          </div>
          <div className="flex flex-col items-end gap-4 max-w-xs text-right">
            <div className="h-[1px] w-24 bg-sd-gold/30" />
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sd-text-muted leading-relaxed">
              Every category is a deliberate collection of form and function. Curated for character.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCollections.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative"
            >
              <motion.div
                whileHover={{ y: -12 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col h-full rounded-[30px] p-2 bg-sd-ivory-dark/30 border border-sd-border-default/10"
              >
                {/* Image Section (Recessed Well) */}
                <div className="sd-depth-recess rounded-[26px] p-2 aspect-[4/5] overflow-hidden relative group-hover:sd-depth-lift transition-all duration-700">
                  <div className="w-full h-full rounded-[18px] overflow-hidden relative">
                    <motion.img
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 10 }}
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-sd-gold/0 group-hover:bg-sd-gold/5 transition-colors duration-700" />
                  </div>

                  {/* Index Overlay */}
                  <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                    <span className="bg-sd-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-sd-black font-bold rounded shadow-sm">
                      #{item.index}
                    </span>
                  </div>
                </div>

                {/* Content Section (Layered Text) */}
                <div className="p-6 pt-8 flex-1 flex flex-col relative">
                  <div className="absolute top-0 right-8 h-10 w-[1px] bg-sd-gold/20" />
                  
                  <h3 className="text-3xl font-display text-sd-black mb-3 group-hover:italic transition-all duration-500 flex items-center justify-between">
                    {item.title}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-sd-gold" />
                  </h3>
                  
                  <p className="font-sans text-sm text-sd-text-secondary leading-relaxed mb-8 flex-1">
                    {item.subtitle}
                  </p>
                  
                  <div className="flex items-center gap-3">
                     <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-sd-gold font-bold">Entry Path</span>
                     <div className="h-[1px] flex-1 bg-sd-border-default/10 relative overflow-hidden">
                        <motion.div 
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="absolute inset-0 bg-sd-gold" 
                        />
                     </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
