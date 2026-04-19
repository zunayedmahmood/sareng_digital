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
    <div className="bg-sd-gold py-6 lg:py-8 overflow-hidden border-y border-sd-gold/20 flex relative">
      <motion.div 
        animate={{ x: ["0%", "-100%"] }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex items-center gap-12 whitespace-nowrap"
      >
        {[...TESTIMONIALS, ...TESTIMONIALS].map((text, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="text-sd-black text-sm lg:text-base font-bold tracking-tight uppercase">
              {text}
            </span>
            <div className="w-2 h-2 rounded-full bg-sd-black" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TestimonialsStrip;
