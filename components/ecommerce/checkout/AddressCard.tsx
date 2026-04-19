'use client';

import React from 'react';
import { MapPin, Phone, User, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Address {
  id?: number;
  name: string;
  phone: string;
  address_line_1: string;
  city: string;
  is_default_shipping?: boolean;
}

interface AddressCardProps {
  address: Address;
  selected: boolean;
  onSelect: (id: number) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ 
  address, 
  selected, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div 
      onClick={() => address.id && onSelect(address.id)}
      className={`group relative p-6 rounded-2xl border transition-all cursor-pointer ${
        selected 
        ? 'border-sd-gold bg-sd-gold-dim shadow-lg' 
        : 'border-sd-border-default bg-sd-onyx hover:border-sd-border-hover'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${selected ? 'bg-sd-gold text-sd-black' : 'bg-sd-black text-sd-gold'}`}>
          <MapPin className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={(e) => { e.stopPropagation(); onEdit(address); }}
             className="p-2 text-sd-text-muted hover:text-sd-ivory hover:bg-sd-black rounded-full transition-all"
           >
             <Edit2 className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); address.id && onDelete(address.id); }}
             className="p-2 text-sd-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
           >
             <Trash2 className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-sd-text-muted" />
          <span className="text-sm font-bold text-sd-ivory">{address.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3 text-sd-text-muted" />
          <span className="text-xs text-sd-text-secondary">{address.phone}</span>
        </div>
        <p className="text-xs text-sd-text-secondary leading-relaxed line-clamp-2 pl-5">
          {address.address_line_1}, {address.city}
        </p>
      </div>

      {address.is_default_shipping && (
        <div className="mt-4 flex">
           <span className="text-[8px] font-bold tracking-[0.2em] uppercase bg-sd-gold text-sd-black px-2 py-0.5 rounded-sm">Default</span>
        </div>
      )}

      {selected && (
        <motion.div 
          layoutId="address-ring"
          className="absolute inset-0 border-2 border-sd-gold rounded-2xl pointer-events-none"
        />
      )}
    </div>
  );
};

export default AddressCard;
