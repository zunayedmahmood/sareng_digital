import MyAccountShell from '@/components/ecommerce/my-account/MyAccountShell';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import { ShoppingBag, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MyAccount() {
  return (
    <MyAccountShell 
      title="Access Console" 
      subtitle="Welcome to your central registry interface. Manage your hardware assets, retrieval nodes, and operator intel."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
        
        <NeoCard variant="white" className="p-10 border-4 border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-12 -translate-y-12">
              <ShoppingBag size={80} />
           </div>
           <h3 className="font-neo font-black text-2xl text-black uppercase italic mb-4">Archived Assets</h3>
           <p className="font-neo font-bold text-[11px] text-black/40 uppercase tracking-widest leading-loose mb-10 italic">Your historical displacement logs and procurement records.</p>
           <Link href="/e-commerce/my-account/orders" className="inline-flex items-center gap-4 font-neo font-black text-xs uppercase tracking-[0.3em] text-sd-gold hover:text-black transition-all group/link">
             Analyze History <ArrowRight size={18} className="group-hover/link:translate-x-2 transition-transform" />
           </Link>
        </NeoCard>
        
        <NeoCard variant="white" className="p-10 border-4 border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] flex items-center justify-center -rotate-12 translate-x-12 -translate-y-12">
              <MapPin size={80} />
           </div>
           <h3 className="font-neo font-black text-2xl text-black uppercase italic mb-4">Retrieval Nodes</h3>
           <p className="font-neo font-bold text-[11px] text-black/40 uppercase tracking-widest leading-loose mb-10 italic">Designated physical drop-points for hardware acquisition.</p>
           <Link href="/e-commerce/my-account/addresses" className="inline-flex items-center gap-4 font-neo font-black text-xs uppercase tracking-[0.3em] text-sd-gold hover:text-black transition-all group/link">
             Manage Nodes <ArrowRight size={18} className="group-hover/link:translate-x-2 transition-transform" />
           </Link>
        </NeoCard>

      </div>
    </MyAccountShell>
  );
}