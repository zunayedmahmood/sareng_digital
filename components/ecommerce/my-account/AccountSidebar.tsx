'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  User,
  Heart,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import NeoCard from '@/components/ecommerce/ui/NeoCard';

export default function AccountSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useCustomerAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/e-commerce/my-account' },
    { id: 'shop', label: 'Hardware Discovery', icon: ShoppingCart, path: '/e-commerce/' },
    { id: 'orders', label: 'Archived Assets', icon: ShoppingBag, path: '/e-commerce/my-account/orders' },
    { id: 'addresses', label: 'Retrieval Nodes', icon: MapPin, path: '/e-commerce/my-account/addresses' },
    { id: 'account-details', label: 'Operator Intel', icon: User, path: '/e-commerce/my-account/account-details' },
    { id: 'wishlist', label: 'Saved Assets', icon: Heart, path: '/e-commerce/wishlist' },
  ];

  const isActive = (path: string) => {
    if (path === '/e-commerce/') {
      return pathname === '/e-commerce' ||
        pathname === '/e-commerce/' ||
        (pathname.startsWith('/e-commerce/') && !pathname.startsWith('/e-commerce/my-account'));
    }
    return pathname === path;
  };

  return (
    <NeoCard variant="white" className="border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b-4 border-black flex flex-col items-center text-center bg-sd-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] -rotate-12 translate-x-10 -translate-y-10" />
        <div className="w-20 h-20 border-4 border-black bg-white flex items-center justify-center text-black mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <User size={32} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-neo font-black text-black uppercase italic tracking-tighter">Operator</h2>
        <p className="text-[10px] font-neo font-black uppercase tracking-[0.3em] text-sd-gold mt-2">Level Access: 01</p>
      </div>

      <nav className="p-4 flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center justify-between px-6 py-4 transition-all group border-4 ${
                active
                  ? 'bg-black text-sd-gold border-black italic'
                  : 'text-black hover:bg-sd-gold border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon size={18} strokeWidth={active ? 3 : 2} className={active ? 'text-sd-gold' : 'text-black group-hover:rotate-12 transition-transform'} />
                <span className="font-neo font-black text-xs uppercase tracking-widest leading-none">{item.label}</span>
              </div>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t-4 border-black/5">
           <button
             onClick={() => logout()}
             className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-black hover:text-white transition-all border-4 border-transparent hover:border-black font-neo font-black text-xs uppercase tracking-widest italic"
           >
             <LogOut size={18} strokeWidth={3} />
             <span>Terminate Session</span>
           </button>
        </div>
      </nav>
      
      <div className="p-6 bg-black text-sd-gold/20 font-neo font-black text-[8px] uppercase tracking-[0.5em] text-center italic">
         Registry Access Protocol • v2.4
      </div>
    </NeoCard>
  );
}
