'use client';

import React from 'react';
import Link from 'next/link';
import { CatalogCategory } from '@/services/catalogService';
import { motion } from 'framer-motion';

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
    <section className="py-24 bg-sd-ivory">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="font-mono text-[10px] text-sd-gold uppercase tracking-[0.4em] mb-4 block">Archive Classification</span>
            <h2 className="text-5xl lg:text-7xl font-display text-sd-black leading-tight">
              Curated <span className="italic">Departments</span>
            </h2>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-sd-text-muted text-right max-w-[200px]">
            Every category is a deliberate collection of form and function.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-sd-border-default h-full">
          {displayCollections.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex flex-col bg-sd-white overflow-hidden transition-colors hover:bg-sd-ivory-dark/10 ${idx !== displayCollections.length - 1 ? 'lg:border-r border-sd-border-default' : ''} border-b lg:border-b-0 border-sd-border-default`}
            >
              {/* Asset Index */}
              <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                <span className="font-mono text-[10px] text-sd-gold font-bold">{item.index}</span>
                <div className="h-[1px] w-4 bg-sd-border-default" />
              </div>

              {/* Image Area (Paper stack effect) */}
              <div className="p-8 pb-0">
                <div className="relative aspect-[1/1] mb-8 overflow-hidden ec-paper-stack border border-sd-black/5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-sd-gold/0 group-hover:bg-sd-gold/5 transition-colors duration-700" />
                </div>
              </div>

              {/* Label Area */}
              <div className="px-8 pb-10 flex-1 flex flex-col">
                <h3 className="text-3xl font-display text-sd-black mb-4 group-hover:italic transition-all duration-500">{item.title}</h3>
                <p className="font-sans text-xs text-sd-text-secondary leading-relaxed mb-8 flex-1">
                  {item.subtitle}
                </p>
                
                <div className="flex items-center gap-3">
                   <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-sd-black opacity-40 group-hover:opacity-100 transition-opacity">Enter Archive</span>
                   <div className="h-[1px] flex-1 bg-sd-border-default relative overflow-hidden">
                      <div className="absolute inset-0 bg-sd-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
