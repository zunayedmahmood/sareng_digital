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
    <div className="flex flex-col bg-sd-black">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Mobile Floating Search Bar (Visible on scroll) */}
      <div className="lg:hidden sticky top-12 z-[150] px-4 py-3 bg-sd-black/80 backdrop-blur-md border-b border-sd-border-default">
         <div className="relative group">
            <input 
              type="text" 
              placeholder="Search accessories..."
              className="w-full bg-sd-onyx border border-sd-border-default rounded-full py-2 px-10 text-xs text-sd-text-primary focus:outline-none focus:border-sd-gold transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sd-gold" />
         </div>
      </div>

      {/* 3. Featured Categories Strip */}
      <FeaturedCategories />

      {/* 4. New Arrivals Horizontal Scroll */}
      <NewArrivalsScroll />

      {/* 5. Instagram Reels Viewer */}
      <InstagramReelViewer />

      {/* 6. Editorial Block 1 */}
      <EditorialBlock 
        title="Precision Redefined for the Digital Age"
        subtitle="Our mice collection combines hyper-responsive sensors with ergonomic character-driven designs that stand out on any desk."
        imageUrl="/images/editorial-mice.jpg"
        ctaHref="/e-commerce/mice"
      />

      {/* 7. Pendrives Feature Section */}
      <PendrivesFeature />

      {/* 8. Best Sellers Grid */}
      <BestSellersGrid />

      {/* 9. Testimonials Strip */}
      <TestimonialsStrip />

      {/* 10. Secondary Editorial Block */}
      <EditorialBlock 
        reverse
        title="Your Sound, Your Identity"
        subtitle="Experience audio clarity wrapped in designs that speak to your passions. Our limited edition earbuds are as unique as your playlist."
        imageUrl="/images/editorial-earbuds.jpg"
        ctaHref="/e-commerce/earbuds"
        ctaText="Shop Audio"
      />

      {/* SEO hidden content */}
      <section className="sr-only">
        <h1>Sareng Digital - Premium Tech Accessories in Bangladesh</h1>
        <p>Discover the best earbuds, gaming mice, mechanical keyboards, and character-driven pendrives at Sareng Digital. High-quality peripherals for enthusiasts.</p>
      </section>
    </div>
  );
}
