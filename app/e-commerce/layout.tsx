'use client';

import { Suspense } from 'react';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { CartProvider } from '@/app/e-commerce/CartContext';
import Footer from '@/components/ecommerce/Footer';
import ScrollToTopOnRouteChange from '@/components/ecommerce/ScrollToTopOnRouteChange';

export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <Suspense fallback={null}>
          <ScrollToTopOnRouteChange />
        </Suspense>

        {/* ── Sitewide dark background with grid + grain texture ── */}
        <div className="ec-root ec-bg-texture min-h-screen relative">

          {/* Fixed gold glow — top-left atmospheric bloom (sits behind all content) */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background: [
                /* top-left warm gold bloom */
                'radial-gradient(ellipse 60vw 50vh at -5vw -10vh, rgba(176,124,58,0.13) 0%, transparent 70%)',
                /* bottom-right cool tint */
                'radial-gradient(ellipse 50vw 40vh at 105vw 110vh, rgba(100,120,160,0.06) 0%, transparent 70%)',
              ].join(', '),
            }}
          />

          {/* Page content sits above the glow */}
          <div className="relative z-10">
            {children}
            <Footer />
          </div>
        </div>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
