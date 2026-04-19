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
      className={`group relative p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${
        selected 
        ? 'border-sd-gold/40 bg-sd-gold/5 shadow-[0_0_40px_rgba(201,168,76,0.1)]' 
        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
      }`}
    >
      {/* Selection Glow */}
      {selected && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-sd-gold/10 blur-[80px] -mr-16 -mt-16 pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl transition-all duration-500 ${selected ? 'bg-sd-gold text-sd-black' : 'bg-white/5 text-sd-gold'}`}>
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <button 
             onClick={(e) => { e.stopPropagation(); onEdit(address); }}
             className="p-3 text-sd-text-muted hover:text-sd-ivory hover:bg-white/5 rounded-full transition-all"
           >
             <Edit2 className="w-4 h-4" />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); address.id && onDelete(address.id); }}
             className="p-3 text-sd-text-muted hover:text-sd-danger hover:bg-sd-danger/10 rounded-full transition-all"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <span className="text-sd-gold text-[8px] font-bold tracking-[0.3em] uppercase block mb-1">Recipient</span>
          <h4 className="text-lg font-bold text-sd-ivory">{address.name}</h4>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-3.5 h-3.5 text-sd-gold/40" />
          <span className="text-xs text-sd-text-secondary font-mono tracking-wider">{address.phone}</span>
        </div>
        <div className="pt-2 border-t border-white/5">
           <p className="text-xs text-sd-text-muted leading-relaxed font-light">
             {address.address_line_1}<br/>
             <span className="text-[10px] font-bold tracking-widest uppercase text-sd-ivory/60">{address.city}</span>
           </p>
        </div>
      </div>

      {address.is_default_shipping && (
        <div className="absolute bottom-6 right-8">
           <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-sd-gold/60">Boutique Default</span>
        </div>
      )}

      {selected && (
        <motion.div 
          layoutId="address-ring"
          className="absolute inset-0 border-[3px] border-sd-gold/20 rounded-[2rem] pointer-events-none"
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        />
      )}
    </div>
  );
};

export default AddressCard;
