'use client';

import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { PromotionProvider } from '@/contexts/PromotionContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CartProvider } from '@/app/CartContext';
import { Toaster } from 'react-hot-toast';

import ScrollToTopOnRouteChange from '@/components/ecommerce/ScrollToTopOnRouteChange';
import GlobalCartSidebar from '@/components/ecommerce/cart/GlobalCartSidebar';
import PageTransitionWrapper from '@/components/ecommerce/PageTransitionWrapper';
import Footer from '@/components/ecommerce/Footer';
import Navigation from '@/components/ecommerce/Navigation';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--sd-font-sans',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--sd-font-display',
  weight: ['700'],
  style: ['italic'],
  preload: false,
});

export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <PromotionProvider>
            <CurrencyProvider>
              <div className={`${inter.variable} ${playfair.variable} font-sans selection:bg-sd-gold selection:text-sd-black`}>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'var(--sd-onyx)',
                      color: 'var(--sd-text-primary)',
                      borderLeft: '4px solid var(--sd-gold)',
                      borderRadius: 'var(--sd-radius-md)',
                      fontSize: '14px',
                    },
                  }}
                />
                
                <Suspense fallback={null}>
                  <ScrollToTopOnRouteChange />
                </Suspense>

                <GlobalCartSidebar />

                <div className="flex flex-col min-h-screen bg-sd-black text-sd-text-primary overflow-x-hidden">
                  <Navigation />
                  
                  <main className="flex-1 flex flex-col pt-12 lg:pt-0 pb-20 lg:pb-0">
                    <PageTransitionWrapper>
                      {children}
                    </PageTransitionWrapper>
                  </main>

                  <Footer />
                </div>
              </div>
            </CurrencyProvider>
          </PromotionProvider>
        </CartProvider>
      </CustomerAuthProvider>
    </ThemeProvider>
  );
}
