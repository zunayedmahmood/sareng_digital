'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, MapPin, CreditCard, ShoppingBag, AlertCircle, Loader2, 
  ChevronRight, Plus, Edit2, Trash2, CheckCircle, Lock, 
  ArrowRight, Shield, User, Tag, X, Database, ShieldCheck 
} from 'lucide-react';
import Navigation from '@/components/ecommerce/Navigation';
import SSLCommerzPayment from '@/components/ecommerce/SSLCommerzPayment';
import checkoutService, { Address, OrderItem, PaymentMethod } from '@/services/checkoutService';
import cartService from '@/services/cartService';
import guestCheckoutService, { GuestPaymentMethod } from '@/services/guestCheckoutService';
import campaignService, { CouponValidationResult, CouponErrorCode } from '@/services/campaignService';
import { usePromotion } from '@/contexts/PromotionContext';
import CheckoutHeader from '@/components/ecommerce/checkout/CheckoutHeader';
import CheckoutStepTitle from '@/components/ecommerce/checkout/CheckoutStepTitle';
import CheckoutOrderSummary from '@/components/ecommerce/checkout/CheckoutOrderSummary';
import NeoButton from '@/components/ecommerce/ui/NeoButton';
import NeoCard from '@/components/ecommerce/ui/NeoCard';
import Price from '@/components/ecommerce/ui/Price';

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getApplicablePromotion } = usePromotion();

  // State
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Address management
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<number | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const getEmptyAddressForm = (): Omit<Address, 'id'> => ({
    name: '',
    phone: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: 'Dhaka',
    state: 'Dhaka Division',
    postal_code: '',
    country: 'Bangladesh',
    landmark: '',
    delivery_instructions: '',
    type: 'both',
    is_default_shipping: false,
    is_default_billing: false,
  });

  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>(getEmptyAddressForm());
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(''); // ✅ CHANGED: stores payment method CODE
  const [orderNotes, setOrderNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ discount: number; message: string; promotion_name?: string } | null>(null);
  const [couponApplyLoading, setCouponApplyLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [shippingCharge, setShippingCharge] = useState(60);

  // Guest checkout state
  const [guestPhone, setGuestPhone] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPaymentMethod, setGuestPaymentMethod] = useState<GuestPaymentMethod>('cod');
  const [guestAddress, setGuestAddress] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: 'Dhaka',
    state: 'Dhaka',
    postal_code: '',
    country: 'Bangladesh',
  });

  // ✅ NEW: SSLCommerz payment screen state
  const [showSSLCommerzPayment, setShowSSLCommerzPayment] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false); // Mobile summary collapse
  const formRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  };

  const isGuestCheckout = () => !isAuthenticated();

  const cleanPhone = (input: string) => input.replace(/[^0-9+]/g, '');

  const formatBDPhone = (input: string) => {
    const cleaned = input.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+880')) return cleaned;
    if (cleaned.startsWith('880')) return '+880' + cleaned.slice(3);
    if (cleaned.startsWith('0')) return cleaned;
    if (/^1[3-9]\d{8}$/.test(cleaned)) return '0' + cleaned;
    return cleaned;
  };

  const isValidBDPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^(?:880|0)?1[3-9]\d{8}$/.test(cleaned);
  };

  // ✅ NEW: Handle payment errors from URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'payment_failed':
          setError('Payment failed. Please try again or use a different method.');
          break;
        case 'payment_cancelled':
          setError('Payment was cancelled. You can try again when you are ready.');
          break;
        case 'payment_processing_error':
          setError('An error occurred while processing your payment. Please contact support if the amount was deducted.');
          break;
        default:
          setError('An unexpected payment error occurred.');
      }
    }
  }, [searchParams]);

  const refreshCheckoutItems = async () => {
    const selectedIdsStr = localStorage.getItem('checkout-selected-items');
    if (!selectedIdsStr) {
      router.push('/e-commerce');
      return;
    }

    try {
      const ids = JSON.parse(selectedIdsStr);
      if (!Array.isArray(ids) || ids.length === 0) {
        router.push('/e-commerce');
        return;
      }

      const cartData = await cartService.getCart();
      const items = cartData.cart_items.filter(item => ids.includes(item.id));

      if (items.length === 0) {
        localStorage.removeItem('checkout-selected-items');
        router.push('/e-commerce');
        return;
      }

      const transformedItems = items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        category: typeof item.product?.category === 'object' && item.product?.category != null ? (item.product.category as any).name || (item.product.category as any).id : (typeof item.product?.category === 'string' ? item.product.category : undefined),
        name: item.product.name,
        images: item.product.images || [],
        sku: item.product.sku ?? '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        variant_options: item.variant_options,
        notes: item.notes,
        available_inventory: item.product.available_inventory,
      })) as any[];

      setSelectedItems(transformedItems);
      setIsLoadingItems(false);
    } catch (error) {
      console.error('❌ Error refreshing checkout items:', error);
    }
  };

  useEffect(() => {
    refreshCheckoutItems();
  }, [router]);

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateQuantity(cartItemId, { quantity: newQuantity });
      await refreshCheckoutItems();
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    if (!confirm('Remove this item from your order?')) return;
    try {
      await cartService.removeFromCart(cartItemId);
      const selectedIdsStr = localStorage.getItem('checkout-selected-items');
      if (selectedIdsStr) {
        const ids = JSON.parse(selectedIdsStr).filter((id: number) => id !== cartItemId);
        if (ids.length === 0) {
          localStorage.removeItem('checkout-selected-items');
          router.push('/e-commerce');
        } else {
          localStorage.setItem('checkout-selected-items', JSON.stringify(ids));
          await refreshCheckoutItems();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    }
  };


  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated()) return;

      try {
        setLoadingAddresses(true);
        const result = await checkoutService.getAddresses();

        console.log('📍 Fetched addresses:', result);
        setAddresses(result.addresses);

        if (result.default_shipping) {
          setSelectedShippingAddressId(result.default_shipping.id!);
        } else if (result.addresses.length > 0) {
          setSelectedShippingAddressId(result.addresses[0].id!);
        }

        if (result.default_billing) {
          setSelectedBillingAddressId(result.default_billing.id!);
        }

      } catch (error: any) {
        console.error('Failed to fetch addresses:', error);
        setError('Failed to load addresses');
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  // ✅ FIXED: Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await checkoutService.getPaymentMethods();
        console.log('💳 Fetched payment methods:', methods);
        setPaymentMethods(methods);

        // Set default payment method by CODE
        if (methods.length > 0) {
          const defaultMethod = methods.find(m => m.code === 'cash') || methods[0];
          setSelectedPaymentMethod(defaultMethod.code);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);

        const fallbackMethods: PaymentMethod[] = [
          {
            id: 1,
            code: 'cash',
            name: 'Cash on Delivery',
            description: 'Pay with cash when your order is delivered',
            type: 'cash',
            allowed_customer_types: ['ecommerce'],
            is_active: true,
            requires_reference: false,
            supports_partial: true,
            min_amount: null,
            max_amount: null,
            processor: null,
            processor_config: null,
            icon: null,
            fixed_fee: 0,
            percentage_fee: 0,
            sort_order: 1,
          }
        ];
        setPaymentMethods(fallbackMethods);
        setSelectedPaymentMethod(fallbackMethods[0].code);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Update shipping charge based on selected address
  useEffect(() => {
    if (selectedShippingAddressId) {
      const address = addresses.find(a => a.id === selectedShippingAddressId);
      if (address) {
        const charge = checkoutService.calculateDeliveryCharge(address.city);
        setShippingCharge(charge);
      }
    }
  }, [selectedShippingAddressId, addresses]);

  // Guest shipping charge (based on typed city)
  useEffect(() => {
    if (isGuestCheckout()) {
      setShippingCharge(checkoutService.calculateDeliveryCharge(guestAddress.city || 'Dhaka'));
    }
  }, [guestAddress.city]);

  // Calculate totals
  const orderItems: OrderItem[] = selectedItems.map(item => {
    const originalUnitPrice = typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price;
    const promo = getApplicablePromotion(item.product_id, item.category_id ?? null);
    const discountPercent = promo?.discount_value ?? 0;
    const unitPrice = discountPercent > 0 ? Math.max(0, originalUnitPrice - (originalUnitPrice * discountPercent / 100)) : originalUnitPrice;
    const totalPrice = unitPrice * item.quantity;
    
    return {
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      price: unitPrice,
      total: totalPrice,
      original_price: originalUnitPrice, // Add this for UI strike-through
      product_image: item.images?.find((i: any) => i?.is_primary)?.image_url || (item.images?.[0] as any)?.image_url || (item.images?.[0] as any)?.url || '/placeholder-product.png',
      sku: item.sku || '',
    };
  });
  const couponDiscount = appliedCoupon?.discount || 0;
  const summary = checkoutService.calculateOrderSummary(orderItems, shippingCharge, couponDiscount);

  const handleSaveAddress = async () => {
    setError(null);

    if (!addressForm.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!addressForm.phone.trim() || addressForm.phone.length !== 11) {
      setError('Valid 11-digit phone number is required');
      return;
    }

    if (!addressForm.address_line_1.trim()) {
      setError('Address is required');
      return;
    }

    if (!addressForm.city || addressForm.city === '') {
      setError('City is required');
      return;
    }

    if (!addressForm.state || addressForm.state === '') {
      setError('State/Division is required');
      return;
    }

    // Postal code is optional

    try {
      setIsProcessing(true);

      if (editingAddressId) {
        const result = await checkoutService.updateAddress(editingAddressId, {
          ...addressForm,
          postal_code: addressForm.postal_code || undefined
        });
        setAddresses(prev => prev.map(addr =>
          addr.id === editingAddressId ? result.address : addr
        ));
      } else {
        const result = await checkoutService.createAddress({
          ...addressForm,
          postal_code: addressForm.postal_code || undefined
        });
        setAddresses(prev => [...prev, result.address]);

        if (addresses.length === 0 || addressForm.is_default_shipping) {
          setSelectedShippingAddressId(result.address.id!);
        }
      }

      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(getEmptyAddressForm());
      setError(null);

    } catch (error: any) {
      console.error('❌ Failed to save address:', error);
      setError(error.message || 'Failed to save address. Please try again.');

      // 6.3 — Auto-scroll to error
      setTimeout(() => {
        const firstErr = formRef.current?.querySelector('[aria-invalid="true"]');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstErr as HTMLElement).focus();
        }
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm(address);
    setEditingAddressId(address.id!);
    setShowAddressForm(true);
    setError(null);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await checkoutService.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));

      if (selectedShippingAddressId === id) {
        const remainingAddresses = addresses.filter(addr => addr.id !== id);
        setSelectedShippingAddressId(remainingAddresses[0]?.id || null);
      }
      if (selectedBillingAddressId === id) {
        setSelectedBillingAddressId(null);
      }
    } catch (error: any) {
      console.error('Failed to delete address:', error);
      setError(error.message || 'Failed to delete address');
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setCouponApplyLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    // Build cart context
    const customerIdRaw = localStorage.getItem('customer_id') || localStorage.getItem('customerId');
    const customer_id = customerIdRaw ? parseInt(customerIdRaw, 10) : null;

    const cart_items = selectedItems.map((item: any) => ({
      product_id: item.product_id ?? item.id,
      category_id: item.category_id ?? undefined,
      quantity: item.quantity ?? 1,
      unit_price: Number(item.selling_price ?? item.price ?? 0),
    }));

    const result: CouponValidationResult = await campaignService.validateCouponCode({
      code,
      customer_id,
      cart_subtotal: summary.subtotal,
      cart_items,
    });

    setCouponApplyLoading(false);

    if (result.success && result.data) {
      setAppliedCoupon({
        discount: result.data.applied_amount,
        message: result.data.message,
        promotion_name: result.data.promotion.name,
      });
      setCouponSuccess(
        `${result.data.promotion.name} applied! You save ৳${result.data.applied_amount.toFixed(2)}` +
        (result.data.capped ? ` (max discount: ৳${result.data.max_discount})` : '')
      );
    } else {
      setAppliedCoupon(null);
      // Human-readable messages for each known error code
      const errorMessages: Record<CouponErrorCode, string> = {
        INVALID_CODE: 'Invalid coupon code. Please check and try again.',
        PROMOTION_EXPIRED: 'This coupon has expired.',
        PROMOTION_NOT_STARTED: 'This coupon is not active yet.',
        PROMOTION_LIMIT_REACHED: 'This coupon has reached its usage limit.',
        PROMOTION_INACTIVE: 'This coupon is currently inactive.',
        CUSTOMER_LIMIT_REACHED: 'You have already used this coupon the maximum number of times.',
        CUSTOMER_NOT_ELIGIBLE: 'You are not eligible for this coupon.',
        MINIMUM_NOT_MET: `This coupon requires a minimum order of ৳${(result.minimum_purchase ?? 0).toFixed(2)}.`,
        NO_ELIGIBLE_ITEMS: 'No items in your cart are eligible for this coupon.',
        LOGIN_REQUIRED: 'Please log in to use this coupon.',
      };
      setCouponError(
        result.error_code ? (errorMessages[result.error_code] ?? result.message ?? 'Invalid coupon.') : (result.message ?? 'Invalid coupon.')
      );
    }
  };


  const handleGuestPlaceOrder = async () => {
    setError(null);

    if (selectedItems.length === 0) {
      setError('Your cart is empty. Please add items first.');
      return;
    }

    if (!guestPhone.trim() || !isValidBDPhone(guestPhone)) {
      setError('Please enter a valid Bangladesh phone number (e.g. 017xxxxxxxx)');
      return;
    }

    if (!guestAddress.full_name.trim()) {
      setError('Delivery name is required');
      return;
    }

    if (!guestAddress.address_line_1.trim()) {
      setError('Delivery address is required');
      return;
    }

    if (!guestAddress.city.trim()) {
      setError('City is required');
      return;
    }

    // Postal code is optional

    setIsProcessing(true);
    try {
      const payload = {
        phone: cleanPhone(formatBDPhone(guestPhone)),
        items: selectedItems.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          ...(it.variant_options ? { variant_options: it.variant_options } : {}),
        })),
        payment_method: guestPaymentMethod,
        // Force no pre-assigned branch/store for ecommerce orders
        store_id: null,
        delivery_address: {
          full_name: guestAddress.full_name,
          ...(guestAddress.phone?.trim() ? { phone: cleanPhone(guestAddress.phone) } : {}),
          address_line_1: guestAddress.address_line_1,
          ...(guestAddress.address_line_2?.trim() ? { address_line_2: guestAddress.address_line_2 } : {}),
          city: guestAddress.city,
          ...(guestAddress.state?.trim() ? { state: guestAddress.state } : {}),
          postal_code: guestAddress.postal_code || undefined,
          country: guestAddress.country || 'Bangladesh',
        },
        ...(guestName.trim() ? { customer_name: guestName.trim() } : {}),
        ...(guestEmail.trim() ? { customer_email: guestEmail.trim() } : {}),
        ...(orderNotes.trim() ? { notes: orderNotes.trim() } : {}),
      };

      const resp: any = await guestCheckoutService.checkout(payload as any);

      // SSLCommerz style response
      const paymentUrl = resp?.data?.payment_url;
      if (paymentUrl) {
        // Store a lightweight last-order preview (guest can't fetch /customer/orders)
        try {
          const orderNo = resp?.data?.order_number || resp?.data?.order?.order_number;
          const txn = resp?.data?.transaction_id;
          const amt = resp?.data?.total_amount ?? summary.total_amount;
          if (orderNo) {
            localStorage.setItem(
              'ec_last_order',
              JSON.stringify({
                order_number: orderNo,
                payment_method: 'sslcommerz',
                total_amount: typeof amt === 'number' ? amt : Number(amt),
                shipping_charge: shippingCharge,
                discount: couponDiscount,
                created_at: Date.now(),
                customer: { phone: cleanPhone(formatBDPhone(guestPhone)), name: guestName || undefined, email: guestEmail || undefined },
                items: selectedItems.map((it) => ({
                  name: it.name,
                  quantity: it.quantity,
                  unit_price: Number(it.unit_price),
                  total_price: Number(it.total_price),
                  image_url: it.images?.find((i: any) => i?.is_primary)?.image_url || (it.images?.[0] as any)?.image_url || (it.images?.[0] as any)?.url || '/placeholder-product.png',
                  sku: it.sku || '',
                  variant_options: it.variant_options || undefined,
                })),
              })
            );
          }

          // Also store intent so /payment/success can resolve order reference
          if (orderNo && txn) {
            localStorage.setItem(
              'sslc_payment_intent',
              JSON.stringify({
                order_id: resp?.data?.order_id || resp?.data?.order?.order_id || resp?.data?.order?.id || 0,
                order_number: orderNo,
                transaction_id: txn,
                amount: typeof amt === 'number' ? amt : Number(amt),
                timestamp: Date.now(),
              })
            );
          }
        } catch {
          // ignore localStorage errors
        }
        window.location.href = paymentUrl;
        return;
      }

      // COD style response
      const orderNumber = resp?.data?.order?.order_number;
      if (!orderNumber) {
        throw new Error(resp?.message || 'Order created, but no order number returned');
      }

      // Store a lightweight last-order preview for the Thank You page
      try {
        localStorage.setItem(
          'ec_last_order',
          JSON.stringify({
            order_number: orderNumber,
            payment_method: guestPaymentMethod,
            total_amount: summary.total_amount,
            shipping_charge: shippingCharge,
            discount: couponDiscount,
            created_at: Date.now(),
            customer: { phone: cleanPhone(formatBDPhone(guestPhone)), name: guestName || undefined, email: guestEmail || undefined },
            items: selectedItems.map((it) => ({
              product_name: it.name,
              quantity: it.quantity,
              price: Number(it.unit_price),
              total: Number(it.total_price),
              product_image: it.images?.find((i: any) => i?.is_primary)?.image_url || (it.images?.[0] as any)?.image_url || (it.images?.[0] as any)?.url || '/placeholder-product.png',
              sku: it.sku || '',
              variant_options: it.variant_options || undefined,
            })),
          })
        );
      } catch {
        // ignore
      }

      // Remove checked-out items from cart
      for (const it of selectedItems) {
        try {
          await cartService.removeFromCart(it.id);
        } catch {
          // ignore
        }
      }

      localStorage.removeItem('checkout-selected-items');

      router.push(`/e-commerce/order-confirmation/${orderNumber}`);
    } catch (err: any) {
      console.error('❌ Guest checkout failed:', err);

      const serverError = err?.response?.data;
      if (serverError?.errors) {
        console.error('📋 Server validation errors:', serverError.errors);
        const mappedErrors: Record<string, string> = {};
        Object.keys(serverError.errors).forEach(key => {
          mappedErrors[key] = Array.isArray(serverError.errors[key]) ? serverError.errors[key][0] : serverError.errors[key];
        });
        setFieldErrors(mappedErrors);
        setError('Please check the highlighted fields');
      } else {
        setError(serverError?.message || err?.message || 'Failed to place order. Please try again.');
      }

      // Auto-scroll to error
      setTimeout(() => {
        const firstErr = formRef.current?.querySelector('[aria-invalid="true"]');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstErr as HTMLElement).focus();
        }
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ FIXED: Handle place order with SSLCommerz detection
  const handlePlaceOrder = async () => {
    if (!selectedShippingAddressId) {
      setError('Please select a shipping address');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    // ✅ Find the selected payment method object
    const paymentMethod = paymentMethods.find(pm => pm.code === selectedPaymentMethod);

    if (!paymentMethod) {
      setError('Invalid payment method selected');
      return;
    }

    console.log('💳 Selected payment method:', paymentMethod);

    // ✅ Check if it's an online payment method
    const isOnlinePayment = checkoutService.isOnlinePaymentMethod(paymentMethod);

    console.log('🔍 Is online payment:', isOnlinePayment);

    if (isOnlinePayment) {
      // ✅ Show SSLCommerz payment component
      console.log('🔐 Showing SSLCommerz payment screen');
      setShowSSLCommerzPayment(true);
      return;
    }

    // ✅ Continue with offline payment (COD, Cash, etc.)
    setIsProcessing(true);
    setError(null);

    try {
      const orderData: any = {
        payment_method: paymentMethod.code, // ✅ Use payment method code
        shipping_address_id: selectedShippingAddressId,
        billing_address_id: sameAsShipping ? selectedShippingAddressId : (selectedBillingAddressId || selectedShippingAddressId),
        notes: orderNotes || '',
        delivery_preference: 'standard' as const,
        // Keep unassigned; manual assignment from Store Assignment page
        store_id: null,
      };

      if (appliedCoupon && couponCode) {
        orderData.coupon_code = couponCode;
      }

      console.log('📦 Placing order:', orderData);

      const result = await checkoutService.createOrderFromCart(orderData);

      console.log('✅ Order placed successfully:', result);

      // Store last order preview (even for logged-in users, nicer UX)
      try {
        localStorage.setItem(
          'ec_last_order',
          JSON.stringify({
            order_number: result.order.order_number,
            payment_method: paymentMethod.code,
            total_amount: typeof result.order.total_amount === 'number' ? result.order.total_amount : Number(result.order.total_amount),
            created_at: Date.now(),
            items: orderItems.map((it) => ({
              product_name: it.product_name,
              quantity: it.quantity,
              price: it.price,
              total: it.total,
              product_image: it.product_image || '/placeholder-product.png',
              sku: it.sku || '',
            })),
          })
        );
      } catch {
        // ignore
      }

      // Clear checkout data
      localStorage.removeItem('checkout-selected-items');

      // ✅ Show success message

      // ✅ Redirect to a public Thank You page (no forced login)
      router.push(`/e-commerce/order-confirmation/${result.order.order_number}`);

    } catch (error: any) {
      console.error('❌ Order placement failed:', error);
      setError(error?.response?.data?.message || error.message || 'Failed to place order. Please try again.');

      // 6.3 — Auto-scroll to error
      setTimeout(() => {
        const firstErr = formRef.current?.querySelector('[aria-invalid="true"]');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstErr as HTMLElement).focus();
        }
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoadingItems) {
    return (
      <div className="ec-root ec-darkify min-h-screen">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[var(--gold)] mx-auto mb-4" />
            <p className="text-white/60">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ NEW: Show SSLCommerz payment screen
  if (showSSLCommerzPayment) {
    return (
      <div className="ec-root ec-darkify min-h-screen">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <button
            onClick={() => setShowSSLCommerzPayment(false)}
            className="mb-4 text-neutral-900 hover:text-neutral-900 flex items-center gap-2 font-medium"
          >
            ← Back to Review Order
          </button>

          <SSLCommerzPayment
            shippingAddressId={selectedShippingAddressId!}
            billingAddressId={sameAsShipping ? selectedShippingAddressId! : (selectedBillingAddressId ?? undefined)}
            orderNotes={orderNotes}
            couponCode={appliedCoupon ? couponCode : undefined}
            totalAmount={summary.total_amount}
            items={selectedItems}
            shippingCharge={shippingCharge}
            discount={couponDiscount}
            onError={(error) => {
              console.error('❌ Payment error:', error);
              setError(error);
              setShowSSLCommerzPayment(false);
            }}
            onCancel={() => {
              setShowSSLCommerzPayment(false);
            }}
          />
        </div>
      </div>
    );
  }

  if (isGuestCheckout()) {
    return (
      <div className="min-h-screen bg-sd-ivory pb-40">
        <Navigation />
        <CheckoutHeader step="review" />

        <div className="container mx-auto px-6 lg:px-12 pt-40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                 <Shield className="text-sd-gold" size={14} />
                 <span className="font-neo font-black text-[9px] uppercase tracking-[0.4em] text-sd-gold italic">Guest Protocol Active</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-neo font-black uppercase tracking-tighter text-black leading-none italic">Fast Retrieval</h1>
              <p className="font-neo font-bold text-[10px] text-black/40 uppercase tracking-widest mt-2">Direct dispatch bypass - No central account required.</p>
            </div>
            <Link href="/e-commerce/login">
              <NeoButton variant="outline" className="px-8 py-4 text-[10px] italic">
                 EXISTING CITIZEN? LOGIN
              </NeoButton>
            </Link>
          </div>

          {error && (
            <div className="mb-12 bg-white border-4 border-black p-8 flex items-start gap-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-sd-gold" />
              <div className="w-12 h-12 border-2 border-black bg-sd-gold/10 flex items-center justify-center flex-shrink-0">
                 <AlertCircle className="text-black" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-black mb-1 italic">Protocol Anomaly</h3>
                <p className="text-black text-sm font-bold uppercase tracking-tight leading-relaxed">{error}</p>
              </div>
               <button onClick={() => setError(null)} className="text-black/20 hover:text-black transition-colors self-start">
                  <X size={20} />
               </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Form Cluster */}
            <div className="lg:col-span-7 space-y-12">
              <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-8">
                   <User size={18} className="text-sd-gold" />
                   <h2 className="font-neo font-black text-xl uppercase italic tracking-tighter text-black leading-none">Contact Identification</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Signal Access *</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Registry Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="YOUR ALIAS..."
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Communication Proxy (Optional)</label>
                    <input
                      type="email"
                      placeholder="NAME@ARCHIVE.COM"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </NeoCard>

              <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-8">
                   <MapPin size={18} className="text-sd-gold" />
                   <h2 className="font-neo font-black text-xl uppercase italic tracking-tighter text-black leading-none">Dispatch Coordinate</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Full Receiver Name *</label>
                    <input
                      type="text"
                      placeholder="IDENTIFY RECIPIENT..."
                      value={guestAddress.full_name}
                      onChange={(e) => setGuestAddress({ ...guestAddress, full_name: e.target.value })}
                      className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Primary Coordinate *</label>
                    <input
                      type="text"
                      placeholder="STREET, BLOCK, SECTOR..."
                      value={guestAddress.address_line_1}
                      onChange={(e) => setGuestAddress({ ...guestAddress, address_line_1: e.target.value })}
                      className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                     <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Metro Node *</label>
                     <input
                       type="text"
                       placeholder="DHAKA NODE..."
                       value={guestAddress.city}
                       onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                       className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                     />
                  </div>

                  <div>
                     <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Post Index</label>
                     <input
                       type="text"
                       placeholder="0000..."
                       value={guestAddress.postal_code}
                       onChange={(e) => setGuestAddress({ ...guestAddress, postal_code: e.target.value })}
                       className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                     />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Handling Instructions (Optional)</label>
                    <textarea
                      rows={3}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-all outline-none"
                      placeholder="SPECIFY PROTOCOLS..."
                    />
                  </div>
                </div>
              </NeoCard>

              <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-8">
                   <Database size={18} className="text-sd-gold" />
                   <h2 className="font-neo font-black text-xl uppercase italic tracking-tighter text-black leading-none">Settlement Policy</h2>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'cod', name: 'Cash on Arrival', desc: 'Settle protocol at delivery node' },
                    { id: 'sslcommerz', name: 'Instant Proxy Transfer', desc: 'Authenticate via automated gateway' }
                  ].map((method) => (
                    <label 
                      key={method.id} 
                      className={`
                        flex items-center gap-6 p-6 border-4 cursor-pointer transition-all bg-white
                        ${guestPaymentMethod === method.id ? 'border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'border-black/5 hover:border-sd-gold/40'}
                      `}
                    >
                      <input
                        type="radio"
                        className="w-6 h-6 border-2 border-black accent-black"
                        checked={guestPaymentMethod === method.id}
                        onChange={() => setGuestPaymentMethod(method.id as any)}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="font-neo font-black text-lg uppercase italic tracking-tighter text-black">{method.name}</span>
                        <span className="font-neo font-bold text-[9px] uppercase tracking-widest text-black/40 italic">{method.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </NeoCard>
            </div>

            {/* Sidebar Summary Module */}
            <div className="lg:col-span-5">
              <CheckoutOrderSummary 
                 items={selectedItems.map((it: any, idx: number) => ({
                   id: idx,
                   name: it.name,
                   quantity: it.quantity,
                   price: it.unit_price,
                   total: it.quantity * it.unit_price,
                   product_image: it.image || it.images?.[0]?.image_url,
                   variant_options: it.variant_options
                 }))}
                 subtotal={summary.subtotal}
                 shipping={shippingCharge}
                 discount={couponDiscount}
                 total={summary.total_amount}
                 couponCode={couponCode}
                 onCouponChange={(code) => setCouponCode(code.toUpperCase())}
                 onApplyCoupon={handleApplyCoupon}
                 onRemoveCoupon={() => { setAppliedCoupon(null); setCouponSuccess(null); }}
                 isApplyingCoupon={couponApplyLoading}
                 couponError={couponError}
                 couponSuccess={couponSuccess}
              />
              
              <div className="mt-8">
                 <NeoButton 
                   variant="primary" 
                   className="w-full py-8 text-xl italic font-black uppercase tracking-[0.4em] group"
                   onClick={handleGuestPlaceOrder}
                   disabled={isProcessing}
                 >
                    {isProcessing ? 'SYNCHRONIZING...' : 'COMMIT TRANSACTION'}
                    {!isProcessing && <CheckCircle size={24} className="ml-4 group-hover:scale-125 transition-transform text-sd-gold" />}
                 </NeoButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sd-ivory pb-40 relative">
      <Navigation />
      <CheckoutHeader step={currentStep} />

      <div className="container mx-auto px-6 lg:px-12 pt-40 relative z-10">
        {error && (
          <div className="mb-12 bg-white border-4 border-black p-8 flex items-start gap-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-sd-gold" />
            <div className="w-12 h-12 border-2 border-black bg-sd-gold/10 flex items-center justify-center flex-shrink-0">
               <AlertCircle className="text-black" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-black mb-1 italic">Protocol Anomaly</h3>
              <p className="text-black text-sm font-bold uppercase tracking-tight leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-black/20 hover:text-black transition-colors self-start">
               <X size={20} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start" ref={formRef}>
          <div className="lg:col-span-7 space-y-16">
            {/* Step 1: Identification (Shipping) */}
            {currentStep === 'shipping' && (
              <div className="space-y-12">
                <CheckoutStepTitle 
                  number={1} 
                  label="Identification Protocol" 
                  title="Shipping Registry" 
                  rightElement={
                    <NeoButton 
                      variant="outline" 
                      className="px-6 py-3 text-[10px] italic"
                      onClick={() => {
                        setShowAddressForm(true);
                        setEditingAddressId(null);
                        setAddressForm(getEmptyAddressForm());
                        setError(null);
                      }}
                    >
                      <Plus size={14} className="mr-2" /> Add Entry
                    </NeoButton>
                  }
                />

                {loadingAddresses ? (
                   <div className="py-20 text-center">
                      <div className="w-12 h-12 border-4 border-black border-t-sd-gold animate-spin mx-auto mb-4" />
                      <span className="font-neo font-black text-[10px] uppercase tracking-[0.4em] italic">Syncing Central Registry...</span>
                   </div>
                ) : addresses.length === 0 && !showAddressForm ? (
                   <div className="py-32 text-center border-4 border-black border-dashed rounded-[40px] bg-white/30">
                      <MapPin className="h-20 w-20 text-black/10 mx-auto mb-8" />
                      <h3 className="font-neo font-black text-2xl uppercase italic mb-4">No Records Detected</h3>
                      <p className="font-neo text-[10px] uppercase tracking-widest text-black/40 mb-10 max-w-xs mx-auto leading-loose">
                         The primary coordinate database is currently void of archival entries.
                      </p>
                      <NeoButton 
                        variant="primary" 
                        className="px-12 py-4"
                        onClick={() => { setShowAddressForm(true); setError(null); }}
                      >
                         Initialize First Entry
                      </NeoButton>
                   </div>
                ) : (
                  <>
                    {showAddressForm && (
                      <NeoCard variant="white" className="p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sd-gold/5 pointer-events-none -rotate-12 translate-x-12 -translate-y-12" />
                        
                        <div className="relative z-10 space-y-10">
                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Entry Principal <span className="text-sd-gold font-bold">*</span></label>
                                <input
                                  type="text"
                                  value={addressForm.name}
                                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                  className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                                  placeholder="IDENTIFY RECIPIENT..."
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Signal Access <span className="text-sd-gold font-bold">*</span></label>
                                <input
                                  type="tel"
                                  value={addressForm.phone}
                                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                                  placeholder="01XXXXXXXXX"
                                  maxLength={11}
                                  className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest focus:outline-none focus:bg-white transition-colors"
                                />
                             </div>
                          </div>

                          <div className="space-y-3 font-neo font-bold mb-4">
                             <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Coordinate Node <span className="text-sd-gold font-bold">*</span></label>
                             <input
                               type="text"
                               value={addressForm.address_line_1}
                               onChange={(e) => setAddressForm({ ...addressForm, address_line_1: e.target.value })}
                               placeholder="STREET, BLOCK, SECTOR..."
                               className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                             />
                          </div>

                          <div className="grid md:grid-cols-3 gap-8">
                             <div className="space-y-3">
                                <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Sector Node</label>
                                <select
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                  className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors appearance-none"
                                >
                                  {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'].map(city => (
                                    <option key={city} value={city}>{city.toUpperCase()} NODE</option>
                                  ))}
                                </select>
                             </div>
                             <div className="col-span-2 space-y-3">
                                <label className="font-neo font-black text-[10px] uppercase tracking-widest text-black/40 italic">Landmark Proxy</label>
                                <input
                                  type="text"
                                  value={addressForm.landmark || ''}
                                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                                  placeholder="VISIBLE MARKERS..."
                                  className="w-full bg-sd-ivory border-2 border-black px-6 py-4 font-neo font-bold text-[11px] tracking-widest uppercase focus:outline-none focus:bg-white transition-colors"
                                />
                             </div>
                          </div>

                          <div className="flex items-center gap-3">
                             <input
                               type="checkbox"
                               id="defaultShipping"
                               checked={addressForm.is_default_shipping || false}
                               onChange={(e) => setAddressForm({ ...addressForm, is_default_shipping: e.target.checked })}
                               className="w-6 h-6 border-2 border-black accent-black"
                             />
                             <label htmlFor="defaultShipping" className="font-neo font-black text-[9px] uppercase tracking-widest text-black/60 italic">Register as primary retrieval point</label>
                          </div>

                          <div className="flex gap-4 pt-6 border-t-2 border-black/10">
                            <NeoButton 
                              variant="primary" 
                              className="flex-1 py-5 text-[11px] italic tracking-[0.2em]"
                              onClick={handleSaveAddress}
                              disabled={isProcessing}
                            >
                               {isProcessing ? 'SYNCHRONIZING...' : (editingAddressId ? 'RE-VALIDATE RECORD' : 'AUTHENTICATE RECORD')}
                            </NeoButton>
                            <NeoButton 
                              variant="outline" 
                              className="px-10 py-5 text-[11px]"
                              onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                            >
                               ABORT
                            </NeoButton>
                          </div>
                        </div>
                      </NeoCard>
                    )}

                    {!showAddressForm && addresses.length > 0 && (
                      <div className="grid grid-cols-1 gap-6">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => setSelectedShippingAddressId(address.id!)}
                            className={`
                               group relative p-8 border-4 transition-all cursor-pointer bg-white
                               ${selectedShippingAddressId === address.id 
                                 ? 'border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] translate-x-[-4px] translate-y-[-4px]' 
                                 : 'border-black/5 hover:border-sd-gold/40'}
                            `}
                          >
                            <div className="flex items-start justify-between mb-8">
                               <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${selectedShippingAddressId === address.id ? 'bg-sd-gold animate-pulse' : 'bg-black/10'}`} />
                                     <span className="font-neo font-black text-[9px] uppercase tracking-[0.4em] text-black/40 italic">Entry Index 00{address.id}</span>
                                  </div>
                                  <h3 className="font-neo font-black text-2xl uppercase italic tracking-tighter text-black">{address.name}</h3>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }} className="w-10 h-10 border-2 border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all"><Edit2 size={14} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id!); }} className="w-10 h-10 border-2 border-black/10 text-sd-gold flex items-center justify-center hover:bg-sd-gold hover:text-black transition-all"><Trash2 size={14} /></button>
                               </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                               <p className="font-neo font-bold text-[11px] uppercase tracking-widest text-black">{address.phone}</p>
                               <p className="font-neo font-black text-[10px] text-black/40 uppercase tracking-tighter mt-1 italic leading-relaxed">
                                  {address.address_line_1}<br/>{address.city.toUpperCase()} NODE • BD
                               </p>
                            </div>

                            {selectedShippingAddressId === address.id && (
                               <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-t-black border-l-transparent" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {addresses.length > 0 && !showAddressForm && (
                   <div className="pt-8">
                      <NeoButton 
                        variant="primary" 
                        className="w-full py-8 text-lg italic tracking-[0.3em] uppercase group"
                        onClick={() => setCurrentStep('payment')}
                        disabled={!selectedShippingAddressId}
                      >
                         Initiate Operational Status <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" />
                      </NeoButton>
                   </div>
                )}
              </div>
            )}

            {/* Step 2: Transaction Protocol (Payment) */}
            {currentStep === 'payment' && (
              <div className="space-y-12">
                <CheckoutStepTitle 
                  number={2} 
                  label="Settlement Authorization" 
                  title="Transaction Protocol" 
                />

                <div className="grid grid-cols-1 gap-6">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.code)}
                      className={`
                        group relative p-8 border-4 transition-all cursor-pointer bg-white overflow-hidden
                        ${selectedPaymentMethod === method.code 
                          ? 'border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] translate-x-[-4px] translate-y-[-4px]' 
                          : 'border-black/5 hover:border-sd-gold/40'}
                      `}
                    >
                      <div className="flex items-center gap-8 relative z-10">
                        <div className={`w-16 h-16 border-2 flex items-center justify-center transition-colors ${selectedPaymentMethod === method.code ? 'bg-black text-sd-gold border-black' : 'bg-sd-ivory border-black/10 text-black/40'}`}>
                          {method.code === 'cod' ? <Package size={28} /> : <CreditCard size={28} />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-neo font-black text-2xl uppercase italic tracking-tighter text-black">{method.name}</h3>
                          <p className="font-neo font-black text-[9px] text-black/40 uppercase tracking-widest mt-1 italic">{method.description || 'Secure authenticated gateway'}</p>
                        </div>
                        <div className={`w-8 h-8 border-2 border-black flex items-center justify-center ${selectedPaymentMethod === method.code ? 'bg-black text-sd-gold' : 'bg-white text-transparent'}`}>
                           <CheckCircle size={16} strokeWidth={3} />
                        </div>
                      </div>
                      
                      {selectedPaymentMethod === method.code && (
                         <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-t-black border-l-transparent" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-6 pt-12">
                   <NeoButton 
                    variant="outline" 
                    className="px-12 py-8 text-[11px] italic tracking-[0.2em]"
                    onClick={() => setCurrentStep('shipping')}
                  >
                    RETURN TO REGISTRY
                  </NeoButton>
                  <NeoButton 
                    variant="primary" 
                    className="flex-1 py-8 text-lg italic tracking-[0.3em] uppercase group"
                    onClick={() => setCurrentStep('review')}
                    disabled={!selectedPaymentMethod}
                  >
                    Finalize Audit <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" />
                  </NeoButton>
                </div>
              </div>
            )}

            {/* Step 3: Final Audit (Review) */}
            {currentStep === 'review' && (
              <div className="space-y-12">
                <CheckoutStepTitle 
                  number={3} 
                  label="Operational Clearance" 
                  title="Final Audit" 
                />

                <NeoCard variant="white" className="p-12 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] space-y-12 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-black/[0.02] -rotate-45 translate-x-12 -translate-y-12 pointer-events-none flex items-center justify-center">
                      <Archive size={120} className="text-black/5" />
                   </div>

                   <div className="grid md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <MapPin size={14} className="text-sd-gold" />
                            <h4 className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-black/40 italic">Retrieval Node</h4>
                         </div>
                         <div className="pl-6 border-l-2 border-black/10">
                            <p className="font-neo font-black text-2xl uppercase italic text-black leading-tight mb-2">
                               {addresses.find(a => a.id === selectedShippingAddressId)?.name}
                            </p>
                            <p className="font-neo font-bold text-[11px] text-black/60 uppercase tracking-tighter leading-relaxed italic">
                               {addresses.find(a => a.id === selectedShippingAddressId)?.address_line_1}<br/>
                               {addresses.find(a => a.id === selectedShippingAddressId)?.city.toUpperCase()} NODE • BD
                            </p>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <CreditCard size={14} className="text-sd-gold" />
                            <h4 className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-black/40 italic">Settlement Protocol</h4>
                         </div>
                         <div className="pl-6 border-l-2 border-black/10">
                            <p className="font-neo font-black text-2xl uppercase italic text-black leading-tight mb-2">
                               {paymentMethods.find(m => m.code === selectedPaymentMethod)?.name}
                            </p>
                            <p className="font-neo font-bold text-[11px] text-black/60 uppercase tracking-widest italic">AUTHORIZED TRANSACTION</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="pt-10 border-t-4 border-black relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <Edit2 size={14} className="text-sd-gold" />
                         <h4 className="font-neo font-black text-[10px] uppercase tracking-[0.4em] text-black/40 italic">Archival Notes</h4>
                      </div>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="SPECIFY HANDLING REQUIREMENTS..."
                        className="w-full bg-sd-ivory border-2 border-black p-8 font-neo font-bold text-[11px] text-black focus:outline-none focus:bg-white transition-colors min-h-[160px] uppercase tracking-[0.2em] placeholder:text-black/10"
                      />
                   </div>
                </NeoCard>

                <div className="flex gap-6">
                   <NeoButton 
                    variant="outline" 
                    className="px-12 py-8 text-[11px] italic tracking-[0.2em]"
                    onClick={() => setCurrentStep('payment')}
                  >
                    REVISION
                  </NeoButton>
                  <NeoButton 
                    variant="primary" 
                    className="flex-1 py-8 text-xl italic tracking-[0.4em] uppercase group"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                       'PROCESSING...'
                    ) : (
                      <span className="flex items-center justify-center gap-4">
                         Commit Transaction <CheckCircle size={24} strokeWidth={3} className="group-hover:scale-125 transition-transform" />
                      </span>
                    )}
                  </NeoButton>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: The Registry Sidebar (Consolidated Summary) */}
          <div className="lg:col-span-5">
            <div className="sticky top-40">
               <CheckoutOrderSummary 
                  items={selectedItems}
                  summary={summary}
                  shippingCharge={shippingCharge}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  handleApplyCoupon={handleApplyCoupon}
                  couponApplyLoading={couponApplyLoading}
                  couponError={couponError}
                  handleRemoveItem={handleRemoveItem}
                  handleUpdateQuantity={handleUpdateQuantity}
               />

               {/* Security Protocol Block */}
               <div className="mt-12 group">
                  <div className="border-4 border-black p-8 flex items-center gap-8 bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-transform group-hover:scale-[1.02]">
                     <div className="w-16 h-16 border-2 border-black bg-black text-sd-gold flex items-center justify-center">
                        <Lock size={28} strokeWidth={2.5} />
                     </div>
                     <div>
                        <h4 className="font-neo font-black text-xs uppercase tracking-[0.3em] text-black italic">Security Protocol</h4>
                        <p className="font-neo font-bold text-[9px] text-black/40 uppercase tracking-tighter mt-1">SSL 256-BIT ENCRYPTED ARCHIVE</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}