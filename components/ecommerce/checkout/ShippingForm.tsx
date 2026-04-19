'use client';

import React from 'react';
import { User, Phone, Mail, MapPin, Building, Hash } from 'lucide-react';

interface ShippingFormProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  error?: string | null;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  formData,
  onChange,
  onSave,
  onCancel,
  isProcessing,
  error
}) => {
  return (
    <div className="bg-sd-onyx border border-sd-border-default rounded-2xl p-8 space-y-8">
      <div className="flex items-center justify-between">
         <h3 className="text-sd-ivory text-xl font-bold font-display italic">Add Delivery Address</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Name */}
         <div className="space-y-2">
            <label className="text-sd-gold text-[10px] font-bold tracking-widest uppercase ml-1">Full Name</label>
            <div className="relative">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sd-text-muted" />
               <input 
                 type="text" 
                 value={formData.name}
                 onChange={(e) => onChange('name', e.target.value)}
                 className="w-full bg-sd-black border border-sd-border-default rounded-xl py-3.5 pl-12 pr-4 text-sm text-sd-ivory focus:outline-none focus:border-sd-gold transition-colors"
                 placeholder="John Doe"
               />
            </div>
         </div>

         {/* Phone */}
         <div className="space-y-2">
            <label className="text-sd-gold text-[10px] font-bold tracking-widest uppercase ml-1">Phone Number</label>
            <div className="relative">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sd-text-muted" />
               <input 
                 type="tel" 
                 value={formData.phone}
                 onChange={(e) => onChange('phone', e.target.value)}
                 className="w-full bg-sd-black border border-sd-border-default rounded-xl py-3.5 pl-12 pr-4 text-sm text-sd-ivory focus:outline-none focus:border-sd-gold transition-colors"
                 placeholder="017XXXXXXXX"
               />
            </div>
         </div>

         {/* Email */}
         <div className="space-y-2">
            <label className="text-sd-gold text-[10px] font-bold tracking-widest uppercase ml-1">Email Address (Optional)</label>
            <div className="relative">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sd-text-muted" />
               <input 
                 type="email" 
                 value={formData.email}
                 onChange={(e) => onChange('email', e.target.value)}
                 className="w-full bg-sd-black border border-sd-border-default rounded-xl py-3.5 pl-12 pr-4 text-sm text-sd-ivory focus:outline-none focus:border-sd-gold transition-colors"
                 placeholder="john@example.com"
               />
            </div>
         </div>

         {/* City */}
         <div className="space-y-2">
            <label className="text-sd-gold text-[10px] font-bold tracking-widest uppercase ml-1">City</label>
            <div className="relative">
               <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sd-text-muted" />
               <select 
                 value={formData.city}
                 onChange={(e) => onChange('city', e.target.value)}
                 className="w-full bg-sd-black border border-sd-border-default rounded-xl py-3.5 pl-12 pr-10 text-sm text-sd-ivory focus:outline-none focus:border-sd-gold transition-colors appearance-none"
               >
                 <option value="Dhaka">Dhaka</option>
                 <option value="Chittagong">Chittagong</option>
                 <option value="Sylhet">Sylhet</option>
                 <option value="Khulna">Khulna</option>
                 <option value="Rajshahi">Rajshahi</option>
                 <option value="Barisal">Barisal</option>
                 <option value="Rangpur">Rangpur</option>
                 <option value="Mymensingh">Mymensingh</option>
                 <option value="Outside Dhaka">Other (Outside Dhaka)</option>
               </select>
            </div>
         </div>

         {/* Address Line 1 */}
         <div className="md:col-span-2 space-y-2">
            <label className="text-sd-gold text-[10px] font-bold tracking-widest uppercase ml-1">Delivery Address</label>
            <div className="relative">
               <MapPin className="absolute left-4 top-4 w-4 h-4 text-sd-text-muted" />
               <textarea 
                 value={formData.address_line_1}
                 onChange={(e) => onChange('address_line_1', e.target.value)}
                 rows={3}
                 className="w-full bg-sd-black border border-sd-border-default rounded-xl py-3.5 pl-12 pr-4 text-sm text-sd-ivory focus:outline-none focus:border-sd-gold transition-colors resize-none"
                 placeholder="House No., Street Name, Area..."
               />
            </div>
         </div>

         {/* Postal Code */}
         <div className="space-y-2">
            <label className="text-sd-gold text-[10px] font-bold tracking-widest uppercase ml-1">Postal Code (Optional)</label>
            <div className="relative">
               <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sd-text-muted" />
               <input 
                 type="text" 
                 value={formData.postal_code}
                 onChange={(e) => onChange('postal_code', e.target.value)}
                 className="w-full bg-sd-black border border-sd-border-default rounded-xl py-3.5 pl-12 pr-4 text-sm text-sd-ivory focus:outline-none focus:border-sd-gold transition-colors"
                 placeholder="1200"
               />
            </div>
         </div>
      </div>

      {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

      <div className="flex gap-4 pt-4">
         <button 
           onClick={onCancel}
           className="flex-1 py-4 border border-sd-border-default rounded-xl text-sd-text-primary text-xs font-bold tracking-widest uppercase hover:bg-sd-black transition-all"
         >
           Cancel
         </button>
         <button 
           onClick={onSave}
           disabled={isProcessing}
           className="flex-1 py-4 bg-sd-gold text-sd-black rounded-xl text-xs font-bold tracking-widest uppercase shadow-lg shadow-sd-gold/10 hover:bg-sd-gold-soft transition-all disabled:opacity-50"
         >
           {isProcessing ? 'Saving...' : 'Save Address'}
         </button>
      </div>
    </div>
  );
};

export default ShippingForm;
