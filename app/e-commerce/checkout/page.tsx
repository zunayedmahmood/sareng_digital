import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="bg-sd-black min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
             <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-sd-gold mx-auto" />
                <p className="text-sd-text-muted text-[10px] font-bold tracking-[0.2em] uppercase">Initializing Secure Checkout...</p>
             </div>
          </div>
        }
      >
        <CheckoutClient />
      </Suspense>
    </div>
  );
}
