'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from '@/components/ecommerce/Navigation';
import AccountSidebar from '@/components/ecommerce/my-account/AccountSidebar';
import PaymentStatusChecker from '@/components/ecommerce/Paymentstatuschecker';
import { useRequireCustomerAuth } from '@/contexts/CustomerAuthContext';
import { ShoppingBag, User, MapPin, Heart, LayoutDashboard } from 'lucide-react';
import NeoCard from '@/components/ecommerce/ui/NeoCard';

export default function MyAccountShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireCustomerAuth('/e-commerce/login');
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: 'DB', icon: LayoutDashboard, path: '/e-commerce/my-account' },
    { label: 'OS', icon: ShoppingBag, path: '/e-commerce/my-account/orders' },
    { label: 'ID', icon: User, path: '/e-commerce/my-account/account-details' },
    { label: 'AD', icon: MapPin, path: '/e-commerce/my-account/addresses' },
    { label: 'WS', icon: Heart, path: '/e-commerce/wishlist' },
  ];

  return (
    <div className="min-h-screen bg-sd-ivory pb-20 lg:pb-40 selection:bg-sd-gold selection:text-black">
      <Navigation />
      <PaymentStatusChecker />
      
      <div className="container mx-auto px-6 lg:px-12 pt-40">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
           
           {/* ── Desktop Registry Sidebar ── */}
           <div className="hidden lg:block w-80 flex-shrink-0 sticky top-40">
              <AccountSidebar />
           </div>

           {/* ── Main Operational Content ── */}
           <div className="flex-1 w-full">
              <div className="mb-16 border-b-4 border-black pb-10">
                 <span className="font-neo font-black text-[10px] uppercase tracking-[0.5em] text-sd-gold italic block mb-6">Operational Console</span>
                 <h1 className="text-6xl font-neo font-black text-black uppercase italic leading-none tracking-tighter mb-4">{title}</h1>
                 {subtitle && (
                   <p className="font-neo font-bold text-[11px] text-black/40 uppercase tracking-widest leading-loose max-w-2xl">{subtitle}</p>
                 )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                   <div className="w-12 h-12 border-4 border-black border-t-sd-gold animate-spin mb-8" />
                   <span className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-black/30">Synchronizing Registry...</span>
                </div>
              ) : (
                <div className="ec-anim-fade-up">
                  {children}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* ── Mobile Registry Tabs ── */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-black border-t-4 border-black flex h-20 items-stretch overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.label}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all relative ${
                isActive 
                  ? 'bg-sd-gold text-black italic' 
                  : 'text-sd-gold/30 hover:text-sd-gold/60'
              }`}
            >
              {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-black" />}
              <Icon size={20} strokeWidth={isActive ? 3 : 2} className={isActive ? '' : 'group-hover:rotate-12 transition-transform'} />
              <span className="font-neo font-black text-[7px] uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
