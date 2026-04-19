'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  Plus, 
  CheckCircle, 
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';

import CheckoutHeader from '@/components/ecommerce/checkout/CheckoutHeader';
import CheckoutOrderSummary from '@/components/ecommerce/checkout/CheckoutOrderSummary';
import AddressCard from '@/components/ecommerce/checkout/AddressCard';
import ShippingForm from '@/components/ecommerce/checkout/ShippingForm';
import Price from '@/components/ecommerce/Price';

import checkoutService, { Address, OrderItem, PaymentMethod } from '@/services/checkoutService';
import cartService from '@/services/cartService';
import guestCheckoutService from '@/services/guestCheckoutService';
import campaignService from '@/services/campaignService';
import { fireToast } from '@/lib/globalToast';

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State ---
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<any>({
    name: '', phone: '', email: '', address_line_1: '', city: 'Dhaka', state: 'Dhaka', postal_code: ''
  });

  // Payment State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string>('cash');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ discount: number; message: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const [shippingCharge, setShippingCharge] = useState(60);

  // --- Authentication ---
  const isAuthenticated = () => typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

  // --- Effects ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const selectedIdsStr = localStorage.getItem('checkout-selected-items');
        if (!selectedIdsStr) {
          router.push('/e-commerce');
          return;
        }
        const ids = JSON.parse(selectedIdsStr);
        const cartData = await cartService.getCart();
        const items = cartData.cart_items.filter(item => ids.includes(item.id));
        if (items.length === 0) {
          router.push('/e-commerce');
          return;
        }
        setSelectedItems(items);

        if (isAuthenticated()) {
          const res = await checkoutService.getAddresses();
          setAddresses(res.addresses);
          if (res.default_shipping) setSelectedAddressId(res.default_shipping.id!);
          else if (res.addresses.length > 0) setSelectedAddressId(res.addresses[0].id!);
        }

        const methods = await checkoutService.getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedPaymentCode(methods.find(m => m.code === 'cash')?.code || methods[0].code);

      } catch (err) {
        console.error('Checkout init failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);

  // Update shipping charge
  useEffect(() => {
    if (isAuthenticated() && selectedAddressId) {
       const addr = addresses.find(a => a.id === selectedAddressId);
       if (addr) setShippingCharge(checkoutService.calculateDeliveryCharge(addr.city));
    }
  }, [selectedAddressId, addresses]);

  // --- Handlers ---
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await campaignService.validateCouponCode({
        code: couponCode,
        cart_subtotal: summary.subtotal,
        cart_items: selectedItems.map(it => ({ product_id: it.product_id, quantity: it.quantity, unit_price: it.unit_price }))
      });
      if (res.success && res.data) {
        setAppliedCoupon({ discount: res.data.applied_amount, message: res.data.message });
        setCouponSuccess(`${res.data.promotion.name} Applied!`);
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err) {
       setCouponError('Failed to apply coupon');
    } finally {
       setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isAuthenticated() && !selectedAddressId) {
      fireToast('Please select a shipping address', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: any = {
        payment_method: selectedPaymentCode,
        shipping_address_id: selectedAddressId,
        coupon_code: appliedCoupon ? couponCode : undefined,
      };

      const result = await checkoutService.createOrderFromCart(orderData);
      localStorage.removeItem('checkout-selected-items');
      router.push(`/e-commerce/order-confirmation/${result.order.order_number}`);
    } catch (err: any) {
      fireToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = selectedItems.reduce((acc, it) => acc + (it.unit_price * it.quantity), 0);
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + shippingCharge - discount;
  const summary = { subtotal, shipping: shippingCharge, discount, total_amount: total };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sd-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sd-gold" />
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen pb-32">
      <CheckoutHeader step={currentStep} />

      <main className="container mx-auto px-6 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-20 lg:gap-32">
          
          {/* Left: Input Areas */}
          <div className="flex-1 space-y-24">
            
            {/* Step 1: Shipping */}
            <section className={`transition-all duration-700 ${currentStep !== 'shipping' ? 'opacity-20 pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full border border-sd-gold/30 flex items-center justify-center text-sd-gold font-display italic text-xl">1</div>
                    <div>
                      <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase block mb-1">Destination</span>
                      <h2 className="text-3xl font-bold text-sd-ivory font-display italic">Shipping Address</h2>
                    </div>
                  </div>
                  {isAuthenticated() && !showAddressForm && (
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="group flex items-center gap-3 text-sd-gold text-[10px] font-bold tracking-[0.2em] uppercase hover:text-sd-ivory transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" /> New Address
                    </button>
                  )}
               </div>

               <AnimatePresence mode="wait">
                 {showAddressForm ? (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                   >
                     <ShippingForm 
                       formData={addressForm}
                       onChange={(f,v) => setAddressForm({...addressForm, [f]: v})}
                       onCancel={() => setShowAddressForm(false)}
                       onSave={async () => {
                         const res = await checkoutService.createAddress(addressForm);
                         setAddresses([...addresses, res.address]);
                         setSelectedAddressId(res.address.id!);
                         setShowAddressForm(false);
                       }}
                       isProcessing={isProcessing}
                     />
                   </motion.div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <AddressCard 
                          key={addr.id} 
                          address={addr} 
                          selected={selectedAddressId === addr.id}
                          onSelect={setSelectedAddressId}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                      ))}
                      {addresses.length === 0 && !showAddressForm && (
                        <button 
                           onClick={() => setShowAddressForm(true)}
                           className="h-56 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-6 text-sd-text-muted hover:border-sd-gold/30 hover:text-sd-gold transition-all duration-500 group"
                        >
                           <div className="w-12 h-12 rounded-full border border-sd-border-default flex items-center justify-center group-hover:border-sd-gold/30 transition-colors">
                             <Plus className="w-6 h-6" />
                           </div>
                           <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Add New Delivery Details</span>
                        </button>
                      )}
                   </div>
                 )}
               </AnimatePresence>

               {currentStep === 'shipping' && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="mt-16 flex justify-end"
                 >
                    <button 
                      onClick={() => setCurrentStep('payment')}
                      disabled={!selectedAddressId}
                      className="group relative overflow-hidden bg-sd-ivory text-sd-black px-14 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-4 transition-all hover:bg-sd-gold shadow-2xl active:scale-95 disabled:opacity-20"
                    >
                      Continue Selection
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </motion.div>
               )}
            </section>

            {/* Step 2: Payment */}
            <section className={`transition-all duration-700 ${currentStep !== 'payment' ? 'opacity-20 pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
               <div className="flex items-center gap-6 mb-12">
                  <div className="w-12 h-12 rounded-full border border-sd-gold/30 flex items-center justify-center text-sd-gold font-display italic text-xl">2</div>
                  <div>
                    <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase block mb-1">Transaction</span>
                    <h2 className="text-3xl font-bold text-sd-ivory font-display italic">Payment Method</h2>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.code}
                      onClick={() => setSelectedPaymentCode(method.code)}
                      className={`group p-8 rounded-[2rem] border text-left transition-all duration-500 relative overflow-hidden ${
                        selectedPaymentCode === method.code 
                        ? 'border-sd-gold/50 bg-sd-gold/5 shadow-[0_0_30px_rgba(201,168,76,0.1)]' 
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`font-bold transition-colors ${selectedPaymentCode === method.code ? 'text-sd-gold' : 'text-sd-ivory'}`}>{method.name}</h4>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedPaymentCode === method.code ? 'border-sd-gold bg-sd-gold' : 'border-white/10'}`}>
                            {selectedPaymentCode === method.code && <CheckCircle className="w-3.5 h-3.5 text-sd-black" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-sd-text-muted leading-relaxed uppercase tracking-[0.2em]">
                          {method.description || 'Processed via our secure luxury gateway'}
                        </p>
                      </div>
                    </button>
                  ))}
               </div>

               {currentStep === 'payment' && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="mt-16 flex justify-between items-center"
                 >
                    <button 
                      onClick={() => setCurrentStep('shipping')}
                      className="text-sd-text-muted text-[10px] font-bold tracking-[0.3em] uppercase hover:text-white transition-colors"
                    >
                      Back to Shipping
                    </button>
                    <button 
                      onClick={() => setCurrentStep('review')}
                      className="group relative overflow-hidden bg-sd-ivory text-sd-black px-14 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-4 transition-all hover:bg-sd-gold shadow-2xl active:scale-95"
                    >
                      Final Review
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </motion.div>
               )}
            </section>

            {/* Step 3: Review */}
            <section className={`transition-all duration-700 ${currentStep !== 'review' ? 'opacity-20 pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
               <div className="flex items-center gap-6 mb-12">
                  <div className="w-12 h-12 rounded-full border border-sd-gold/30 flex items-center justify-center text-sd-gold font-display italic text-xl">3</div>
                  <div>
                    <span className="text-sd-gold text-[9px] font-bold tracking-[0.4em] uppercase block mb-1">Confirmation</span>
                    <h2 className="text-3xl font-bold text-sd-ivory font-display italic">Review & Complete</h2>
                  </div>
               </div>

               <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] p-10 lg:p-16">
                  <div className="max-w-xl">
                    <h3 className="text-2xl font-display italic text-sd-ivory mb-6">Masterful Completion</h3>
                    <p className="text-sd-text-muted text-sm leading-relaxed mb-12 font-light">
                      By completing this purchase, you are acquiring masterfully crafted digital accessories. A formal confirmation dossier will be dispatched to your inbox momentarily.
                    </p>
                    
                    {currentStep === 'review' && (
                      <button 
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="group relative overflow-hidden w-full bg-sd-gold text-sd-black py-6 rounded-full font-bold text-xs tracking-[0.4em] uppercase flex items-center justify-center gap-4 hover:bg-sd-gold-soft transition-all shadow-3xl transform active:scale-[0.98] disabled:opacity-30"
                      >
                        <div className="relative z-10 flex items-center gap-4">
                          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Complete Luxury Acquisition <ArrowRight className="w-4 h-4" /></>}
                        </div>
                      </button>
                    )}
                  </div>
               </div>

               {currentStep === 'review' && (
                 <div className="mt-12">
                   <button 
                     onClick={() => setCurrentStep('payment')}
                     className="text-sd-text-muted text-[10px] font-bold tracking-[0.3em] uppercase hover:text-white transition-colors"
                   >
                     Adjust Payment Method
                   </button>
                 </div>
               )}
            </section>
          </div>

          {/* Right: Summary */}
          <aside className="w-full lg:w-[26rem]">
            <div className="lg:sticky lg:top-32">
              <CheckoutOrderSummary 
                items={selectedItems.map(it => ({
                  id: it.id,
                  name: it.product.name,
                  quantity: it.quantity,
                  price: it.unit_price,
                  total: it.unit_price * it.quantity,
                  variant_options: it.variant_options,
                  product_image: it.product.images?.[0]?.url
                }))}
                subtotal={subtotal}
                shipping={shippingCharge}
                discount={discount}
                total={total}
                couponCode={couponCode}
                onCouponChange={setCouponCode}
                onApplyCoupon={handleApplyCoupon}
                isApplyingCoupon={isApplyingCoupon}
                couponError={couponError}
                couponSuccess={couponSuccess}
              />
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
