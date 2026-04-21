'use client';

import React from 'react';
import HeroSection from '@/components/ecommerce/HeroSection';
import FeaturedCategories from '@/components/ecommerce/FeaturedCategories';
import NewArrivalsScroll from '@/components/ecommerce/NewArrivalsScroll';
import InstagramReelViewer from '@/components/ecommerce/InstagramReelViewer';
import PendrivesFeature from '@/components/ecommerce/PendrivesFeature';
import EditorialBlock from '@/components/ecommerce/EditorialBlock';
import BestSellersGrid from '@/components/ecommerce/BestSellersGrid';
import TestimonialsStrip from '@/components/ecommerce/TestimonialsStrip';
import { Search } from 'lucide-react';

export default function EcommerceHomePage() {
  return (
    <div className="flex flex-col bg-sd-ivory min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Categories Strip */}
      <FeaturedCategories />

      {/* 3. New Arrivals Horizontal Scroll */}
      <NewArrivalsScroll />

      {/* 4. Editorial Block 1 - Mouse Feature */}
      <EditorialBlock 
        title="Precision Redefined for the Digital Age"
        subtitle="Our collection combines hyper-responsive sensors with ergonomic character-driven designs that stand out on any desk. Crafted for the aesthetic enthusiast."
        imageUrl="/images/product_images/mouse_themed_mouse.png"
        ctaHref="/e-commerce/mice"
      />

      {/* 5. Instagram Reels Viewer */}
      <InstagramReelViewer />

      {/* 6. Pendrives Feature Section */}
      <PendrivesFeature />

      {/* 7. Best Sellers Grid */}
      <BestSellersGrid />

      {/* 8. Testimonials Strip */}
      <TestimonialsStrip />

      {/* 9. Secondary Editorial Block - Audio Feature */}
      <EditorialBlock 
        reverse
        title="Your Sound, Your Identity"
        subtitle="Experience audio clarity wrapped in designs that speak to your passions. Our limited boutique earbuds are as unique as your curated playlist."
        imageUrl="/images/product_images/pokemon_themed_earbuds.png"
        ctaHref="/e-commerce/earbuds"
        ctaText="Shop Audio"
      />

      {/* 10. Social Proof Divider */}
      <div className="py-20 bg-sd-ivory flex items-center justify-center">
         <div className="h-px w-24 bg-sd-black/10" />
         <div className="mx-8 font-display italic text-2xl text-sd-black/20">Boutique Imports. Bangladesh.</div>
         <div className="h-px w-24 bg-sd-black/10" />
      </div>

      {/* SEO hidden content */}
      <section className="sr-only">
        <h1>Sareng Digital - Premium Tech Boutique in Bangladesh</h1>
        <p>Discover the best earbuds, gaming mice, mechanical keyboards, and character-driven pendrives at Sareng Digital. High-quality boutique imports for enthusiasts.</p>
      </section>
    </div>
  );
}
