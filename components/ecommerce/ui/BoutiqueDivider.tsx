'use client';

import React from 'react';

interface BoutiqueDividerProps {
  text?: string;
  className?: string;
}

export default function BoutiqueDivider({ 
  text = "Boutique Imports. Bangladesh.",
  className = "py-20"
}: BoutiqueDividerProps) {
  return (
    <div className={`${className} bg-transparent flex items-center justify-center`}>
       <div className="h-px w-24 bg-sd-black/10" />
       <div className="mx-8 font-display italic text-2xl text-sd-black/20">{text}</div>
       <div className="h-px w-24 bg-sd-black/10" />
    </div>
  );
}
