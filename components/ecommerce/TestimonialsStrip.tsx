'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  "\"The best earbuds I've ever owned. The character design is just the cherry on top.\"",
  "\"Sareng Digital's precision mice changed my gaming setup forever.\"",
  "\"Finally, a tech brand that understands aesthetic matters as much as performance.\"",
  "\"Unbeatable quality for the price. Highly recommended!\"",
  "\"The packaging alone feels like a luxury experience.\"",
];

const TestimonialsStrip: React.FC = () => {
  return (
    <div className="bg-sd-ivory-dark/30 py-10 lg:py-12 overflow-hidden border-y border-sd-border-default flex relative">
      <motion.div 
        animate={{ x: ["0%", "-100%"] }}
        transition={{ 
          duration: 50, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex items-center gap-16 whitespace-nowrap"
      >
        {[...TESTIMONIALS, ...TESTIMONIALS].map((text, i) => (
          <div key={i} className="flex items-center gap-16">
            <span className="text-sd-black text-sm lg:text-lg font-bold tracking-[0.1em] uppercase opacity-80">
              {text}
            </span>
            <div className="w-3 h-[1px] bg-sd-gold" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TestimonialsStrip;
