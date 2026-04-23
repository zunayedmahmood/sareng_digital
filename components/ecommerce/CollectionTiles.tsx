'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CatalogCategory } from '@/services/catalogService';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import NeoCard from './ui/NeoCard';
import NeoBadge from './ui/NeoBadge';

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
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=2071&auto=format&fit=crop',
    href: '/e-commerce/keyboards',
    index: '03',
  },
  {
    id: '4',
    title: 'Archival Storage',
    subtitle: 'Safe passage for your digital memories.',
    image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=2070&auto=format&fit=crop',
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
        image: cat.image_url || DEFAULT_COLLECTIONS[i % DEFAULT_COLLECTIONS.length].image,
        href: `/e-commerce/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        index: `0${i + 1}`
      }))
    : DEFAULT_COLLECTIONS;

  return (
    <section className="py-24 sm:py-32 bg-sd-ivory overflow-hidden px-4 sm:px-6 lg:px-12">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl relative">
            <NeoBadge variant="black" className="mb-6">Archive Classification</NeoBadge>
            <h2 className="font-neo font-black text-6xl sm:text-8xl lg:text-[100px] uppercase leading-[0.8] tracking-tighter text-black">
              Departmental <br />
              <span className="text-sd-gold italic">Registry</span>
            </h2>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-6 max-w-sm">
             <div className="neo-border-2 bg-white p-4 neo-shadow-sm rotate-2 hover:rotate-0 transition-transform">
                <p className="font-neo font-bold text-sm uppercase leading-tight text-black">
                  Every category is a deliberate collection of form and function. Curated for character.
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 pt-12">
          {displayCollections.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              className="group block"
            >
              <NeoCard 
                variant={idx % 2 === 0 ? 'white' : 'ivory'}
                className={idx % 2 === 0 ? 'rotate-2 group-hover:rotate-0' : '-rotate-2 group-hover:rotate-0'}
              >
                {/* Image Section */}
                <div className="neo-border-b-4 border-black aspect-[4/5] overflow-hidden relative">
                   <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full relative"
                   >
                     <Image 
                      src={item.image} 
                      alt={item.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                     />
                   </motion.div>

                   <NeoBadge variant="gold" className="absolute top-4 left-4 z-10 shadow-none">
                     #{item.index}
                   </NeoBadge>
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="font-neo font-black text-2xl sm:text-3xl uppercase tracking-tighter text-black">
                        {item.title}
                     </h3>
                     <div className="w-10 h-10 neo-border-2 bg-white flex items-center justify-center group-hover:bg-sd-gold transition-colors">
                        <ArrowUpRight size={20} className="text-black" />
                     </div>
                  </div>
                  
                  <p className="font-neo font-bold text-sm uppercase leading-tight text-black/60 line-clamp-2">
                    {item.subtitle}
                  </p>

                  <div className="flex items-center gap-2 pt-4 border-t-2 border-black/10">
                     <span className="font-neo font-black text-[10px] uppercase tracking-widest text-sd-gold">Enter Path</span>
                     <div className="h-[2px] flex-1 bg-black/10" />
                  </div>
                </div>
              </NeoCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
