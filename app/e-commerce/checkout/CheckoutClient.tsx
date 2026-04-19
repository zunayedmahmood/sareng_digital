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
  const isAuthenticated = () => !!localStorage.getItem('auth_token');

  // --- Effects ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Load items
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

        // Load addresses for auth users
        if (isAuthenticated()) {
          const res = await checkoutService.getAddresses();
          setAddresses(res.addresses);
          if (res.default_shipping) setSelectedAddressId(res.default_shipping.id!);
          else if (res.addresses.length > 0) setSelectedAddressId(res.addresses[0].id!);
        }

        // Load payment methods
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
      
      // Cleanup
      localStorage.removeItem('checkout-selected-items');
      router.push(`/e-commerce/order-confirmation/${result.order.order_number}`);
    } catch (err: any) {
      fireToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Summary Calculations ---
  const subtotal = selectedItems.reduce((acc, it) => acc + (it.unit_price * it.quantity), 0);
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + shippingCharge - discount;
  const summary = { subtotal, shipping: shippingCharge, discount, total_amount: total };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sd-gold" />
      </div>
    );
  }

  return (
    <div className="bg-sd-black min-h-screen pb-32">
      <CheckoutHeader step={currentStep} />

      <main className="container mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left: Input Areas */}
          <div className="flex-1 space-y-16">
            
            {/* Step 1: Shipping */}
            <section className={currentStep !== 'shipping' ? 'opacity-40 grayscale pointer-events-none' : ''}>
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sd-gold/10 flex items-center justify-center text-sd-gold border border-sd-gold/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-sd-ivory font-display italic">Shipping Details</h2>
                  </div>
                  {isAuthenticated() && !showAddressForm && (
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="text-sd-gold text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Address
                    </button>
                  )}
               </div>

               {showAddressForm ? (
                 <ShippingForm 
                   formData={addressForm}
                   onChange={(f,v) => setAddressForm({...addressForm, [f]: v})}
                   onCancel={() => setShowAddressForm(false)}
                   onSave={async () => {
                     // Local temp save or actual save logic
                     const res = await checkoutService.createAddress(addressForm);
                     setAddresses([...addresses, res.address]);
                     setSelectedAddressId(res.address.id!);
                     setShowAddressForm(false);
                   }}
                   isProcessing={isProcessing}
                 />
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                         className="h-44 rounded-2xl border-2 border-dashed border-sd-border-default flex flex-col items-center justify-center gap-4 text-sd-text-muted hover:border-sd-gold hover:text-sd-gold transition-all"
                      >
                         <Plus className="w-8 h-8" />
                         <span className="text-[10px] font-bold tracking-widest uppercase">Add New Delivery Address</span>
                      </button>
                    )}
                 </div>
               )}

               {currentStep === 'shipping' && (
                 <div className="mt-12 flex justify-end">
                    <button 
                      onClick={() => setCurrentStep('payment')}
                      disabled={!selectedAddressId}
                      className="bg-sd-ivory text-sd-black px-12 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-sd-gold transition-all shadow-xl shadow-sd-gold/10"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
               )}
            </section>

            {/* Step 2: Payment */}
            <section className={currentStep !== 'payment' ? 'opacity-40 grayscale pointer-events-none' : ''}>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-sd-gold/10 flex items-center justify-center text-sd-gold border border-sd-gold/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-sd-ivory font-display italic">Payment Method</h2>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.code}
                      onClick={() => setSelectedPaymentCode(method.code)}
                      className={`p-6 rounded-2xl border text-left transition-all relative ${
                        selectedPaymentCode === method.code 
                        ? 'border-sd-gold bg-sd-gold-dim shadow-lg' 
                        : 'border-sd-border-default bg-sd-onyx hover:border-sd-border-hover'
                      }`}
                    >
                      <h4 className="text-sd-ivory font-bold mb-2">{method.name}</h4>
                      <p className="text-[10px] text-sd-text-secondary leading-relaxed uppercase tracking-widest">
                        {method.description || 'Secure and fast payment'}
                      </p>
                      {selectedPaymentCode === method.code && (
                        <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-sd-gold" />
                      )}
                    </button>
                  ))}
               </div>

               {currentStep === 'payment' && (
                 <div className="mt-12 flex justify-between items-center">
                    <button 
                      onClick={() => setCurrentStep('shipping')}
                      className="text-sd-text-muted text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors"
                    >
                      Go back to Shipping
                    </button>
                    <button 
                      onClick={() => setCurrentStep('review')}
                      className="bg-sd-ivory text-sd-black px-12 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-sd-gold transition-all shadow-xl shadow-sd-gold/10"
                    >
                      Review Order
                      <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
               )}
            </section>

            {/* Step 3: Review */}
            <section className={currentStep !== 'review' ? 'opacity-40 grayscale pointer-events-none' : ''}>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-sd-gold/10 flex items-center justify-center text-sd-gold border border-sd-gold/20">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-sd-ivory font-display italic">Review & Confirm</h2>
               </div>

               <div className="bg-sd-onyx border border-sd-border-default rounded-2xl p-8 space-y-6">
                  <p className="text-sd-text-secondary text-sm leading-relaxed">
                    By clicking "Complete Purchase", you agree to our Terms of Service and Privacy Policy. A confirmation email and SMS will be sent once the order is placed.
                  </p>
                  
                  {currentStep === 'review' && (
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full bg-sd-gold text-sd-black py-5 rounded-full font-bold text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-sd-gold-soft transition-all shadow-2xl shadow-sd-gold/20 transform active:scale-[0.98]"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Luxury Purchase'}
                    </button>
                  )}
               </div>

               {currentStep === 'review' && (
                 <div className="mt-8">
                   <button 
                     onClick={() => setCurrentStep('payment')}
                     className="text-sd-text-muted text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors"
                   >
                     Go back to Payment
                   </button>
                 </div>
               )}
            </section>
          </div>

          {/* Right: Summary */}
          <div className="w-full lg:w-96">
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

        </div>
      </main>
    </div>
  );
}
