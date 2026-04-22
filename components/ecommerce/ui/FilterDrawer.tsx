'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  title = "Filters",
  children
}: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-sd-black/80 backdrop-blur-sm z-[300]"
          />
          
          {/* Drawer */}
          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-sd-onyx z-[301] rounded-t-[2rem] overflow-hidden flex flex-col pt-safe shadow-2xl"
          >
            <div className="p-6 flex items-center justify-between border-b border-sd-border-default">
              <h2 className="text-xl font-bold text-sd-ivory font-display italic">{title}</h2>
              <button onClick={onClose} className="p-2 text-sd-text-secondary">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 pb-20">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
