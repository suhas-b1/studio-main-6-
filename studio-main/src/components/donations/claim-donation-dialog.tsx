
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Donation, UserAddress, ServiceType, BillingDetails, Order } from '@/lib/types';
import {
  Building,
  Phone,
  MapPin,
  Truck,
  Warehouse,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  MoreVertical,
  Loader2,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  Timer,
  XCircle,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { useDonations } from '@/context/donations-context';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { AddressManager } from '../profile/address-manager';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  isDeliverableBefore,
  getDeliveryWarning,
  formatArrivalLabel,
  getEstimatedArrival,
} from '@/lib/delivery-utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type ClaimDonationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation;
};

type Step = 'address' | 'service' | 'payment' | 'processing' | 'success';

export function ClaimDonationDialog({
  open,
  onOpenChange,
  donation,
}: ClaimDonationDialogProps) {
  const { toast } = useToast();
  const { claimDonation } = useDonations();
  const { user } = useUser();
  const { profile, addAddress, deleteAddress, setDefaultAddress, defaultAddress } = useUserProfile();

  const [step, setStep] = useState<Step>('address');
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const router = useRouter();

  // Set initial address from default
  useEffect(() => {
    if (open && defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [open, defaultAddress, selectedAddress]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('address');
        setIsProcessing(false);
      }, 300);
    }
  }, [open]);

  const billing = useMemo((): BillingDetails => {
    const itemTotal = 0; // Donation is free
    const handlingFee = 5; // Flat fee
    let deliveryFee = 0;

    if (serviceType === 'delivery') {
      deliveryFee = Math.max(30, Math.round(donation.distance * 15)); // ₹15 per km, min ₹30
    } else if (serviceType === 'drop') {
      deliveryFee = 20; // Nominal fee if donor drops
    }

    const tip = 0;
    const gst = Math.round((handlingFee + deliveryFee) * 0.18);
    const total = handlingFee + deliveryFee + gst;

    return { itemTotal, handlingFee, deliveryFee, tip, gst, total };
  }, [serviceType, donation.distance]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) return;
    setIsProcessing(true);

    if (paymentMethod === 'cod') {
      await handleCODFlow();
      return;
    }

    try {
      // 1. Create Order on Backend
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: billing.total,
          receipt: `order_rcpt_${Date.now()}`,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Nourish Connect',
        description: `Food Donation for ${donation.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.uid,
              amount: billing.total,
              payment_method: paymentMethod,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            completeOrder(true);
          } else {
            toast({ title: 'Payment Verification Failed', variant: 'destructive' });
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#f97316',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Payment Error:', error);
      toast({ title: 'Error initializing payment', description: error.message, variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const handleCODFlow = async () => {
    try {
      // Store in Supabase as pending
      await supabase.from('payments').insert([{
        user_id: user?.uid,
        amount: billing.total,
        payment_method: 'COD',
        payment_status: 'pending',
        created_at: new Date().toISOString()
      }]);

      completeOrder(false);
    } catch (error) {
      console.error('COD storage error:', error);
      completeOrder(false); // Still complete order even if DB write fails, but log it
    }
  };

  const completeOrder = async (isPaid: boolean) => {
    if (!user) return;
    claimDonation(donation.id, user.uid);
    setIsProcessing(false);
    setStep('success');

    toast({
      title: isPaid ? 'Payment Successful! 🚀' : 'Order Placed! 🚀',
      description: `Your ${serviceType} request for ${donation.title} is confirmed.`,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 'address':
        return (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden shadow-sm">
                <Image src={donation.imageUrl} alt={donation.title} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-foreground leading-tight">{donation.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">From: {donation.donor.organizationName}</p>
              </div>
            </div>

            <AddressManager
              addresses={profile?.addresses || []}
              selectedId={selectedAddress?.id}
              onSelect={setSelectedAddress}
              onAdd={addAddress}
              onDelete={deleteAddress}
              onSetDefault={setDefaultAddress}
            />

            <Button
              className="w-full h-12 rounded-2xl font-bold"
              onClick={() => setStep('service')}
              disabled={!selectedAddress}
            >
              Continue to Service <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'service':
        const isSafe = isDeliverableBefore(donation, serviceType);
        const warningMsg = getDeliveryWarning(donation, serviceType);
        const arrivalLabel = formatArrivalLabel(serviceType, donation.distance);
        const estimatedArrival = getEstimatedArrival(serviceType, donation.distance);
        const timeUntilDeadline = Math.round((donation.pickupDeadline.getTime() - Date.now()) / 60_000);
        const fmtMins = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`.trim() : `${m}m`;

        return (
          <div className="space-y-6 pt-2">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Choose Collection Method</Label>
              <RadioGroup value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)} className="grid gap-3">
                {[
                  { id: 'pickup', label: 'Self Pickup', price: 'Free', icon: Warehouse, desc: 'Your team collects from donor location' },
                  { id: 'delivery', label: 'Delivery Service', price: `₹${billing.deliveryFee}`, icon: Truck, desc: 'Official delivery partner (Recommended)' },
                  { id: 'drop', label: 'Donor Drop', price: '₹20', icon: MapPin, desc: 'Donor brings it to you (Subject to approval)' },
                ].map((s) => {
                  const optionSafe = isDeliverableBefore(donation, s.id as ServiceType);
                  const optionArrival = formatArrivalLabel(s.id as ServiceType, donation.distance);
                  return (
                    <Label
                      key={s.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border bg-card cursor-pointer transition-all hover:border-primary/50",
                        serviceType === s.id && "border-primary ring-1 ring-primary bg-primary/5",
                        !optionSafe && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={s.id} disabled={!optionSafe} className="mt-1" />
                        <div>
                          <div className="flex items-center gap-2">
                            <s.icon className={cn("h-4 w-4", serviceType === s.id ? "text-primary" : "text-muted-foreground")} />
                            <p className="font-bold text-sm">{s.label}</p>
                            {!optionSafe && (
                              <span className="text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 rounded-full px-1.5 py-0.5">TOO SLOW</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-bold text-sm text-primary">{s.price}</p>
                        <span className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border",
                          optionSafe
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {optionArrival}
                        </span>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Delivery Safety Banner */}
            <div className={cn(
              "rounded-2xl border p-4 transition-all duration-300",
              isSafe
                ? "bg-green-500/8 border-green-500/25"
                : "bg-red-500/8 border-red-500/25"
            )}>
              <div className="flex items-center gap-2 mb-3">
                {isSafe ? (
                  <ShieldCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                )}
                <p className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  isSafe ? "text-green-400" : "text-red-400"
                )}>
                  {isSafe ? "Safe to Deliver" : "Delivery Risk Detected"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/40 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Est. Arrival</p>
                  <p className={cn("text-sm font-black", isSafe ? "text-green-400" : "text-red-400")}>{arrivalLabel}</p>
                </div>
                <div className="bg-background/40 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Expires In</p>
                  <p className={cn("text-sm font-black", timeUntilDeadline < 60 ? "text-orange-400" : "text-foreground")}>
                    {fmtMins(Math.max(0, timeUntilDeadline))}
                  </p>
                </div>
              </div>
              {!isSafe && warningMsg && (
                <p className="text-[10px] text-red-400/80 mt-2.5 leading-relaxed">{warningMsg}</p>
              )}
              {isSafe && (
                <p className="text-[10px] text-green-400/80 mt-2.5">
                  ✓ Food will arrive at approximately {estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, well before expiry.
                </p>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Bill Details</h4>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span>Item Total (Donation)</span>
                  <span className="line-through text-muted-foreground">₹299</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Handling Fee</span>
                  <span>₹{billing.handlingFee}</span>
                </div>
                {billing.deliveryFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Delivery Fee ({donation.distance}km)</span>
                    <span>₹{billing.deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span>Taxes and Charges</span>
                  <span>₹{billing.gst}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-sm">
                  <span>To Pay</span>
                  <span>₹{billing.total}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="h-12 rounded-2xl px-4" onClick={() => setStep('address')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                className={cn(
                  "flex-1 h-12 rounded-2xl font-bold transition-all",
                  !isSafe && "opacity-60 cursor-not-allowed"
                )}
                onClick={() => isSafe && setStep('payment')}
                disabled={!isSafe}
                title={!isSafe ? "Select a faster delivery option" : undefined}
              >
                {isSafe ? (
                  <>Proceed to Payment <ChevronRight className="ml-2 h-4 w-4" /></>
                ) : (
                  <><XCircle className="mr-2 h-4 w-4" />Cannot Proceed – Food Will Expire</>
                )}
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6 pt-2">
            <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary uppercase">Amount to Pay</p>
                <p className="text-2xl font-black text-primary">₹{billing.total}</p>
              </div>
              <div className="bg-primary/20 h-10 w-10 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="grid gap-2">
                {[
                  { id: 'upi', label: 'PhonePe / GPay / UPI', icon: Smartphone },
                  { id: 'card', label: 'Add Credit or Debit Cards', icon: CreditCard },
                  { id: 'netbanking', label: 'Netbanking', icon: MoreVertical },
                  { id: 'cod', label: 'Pay on Delivery (Cash/UPI)', icon: Banknote },
                ].map((p) => (
                  <Label
                    key={p.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border bg-card cursor-pointer transition-all hover:bg-muted/50",
                      paymentMethod === p.id && "border-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <p.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-sm">{p.label}</span>
                    </div>
                    <RadioGroupItem value={p.id} />
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="h-12 rounded-2xl px-4" onClick={() => setStep('service')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                className="flex-1 h-12 rounded-2xl font-extrabold text-white"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 25px -5px rgba(234, 88, 12, 0.4)' }}
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Place Order • ₹${billing.total}`}
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative h-20 w-20 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                style={{ clipPath: `conic-gradient(transparent 0deg, white ${paymentProgress}% )` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-black text-foreground mb-2">Redirecting to UPI App...</h2>
            <p className="text-sm text-muted-foreground px-6 leading-relaxed">
              Please do not refresh this page. We are securely opening your PhonePe/GPay app for payment.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>WAITING FOR PAYMENT CONFIRMATION</span>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 fade-in duration-500">
            <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Booking Confirmed!</h2>
            <p className="text-muted-foreground max-w-[280px] mt-2">
              Order ID: #NC{Math.floor(Math.random() * 90000) + 10000}
              <br />
              Your collection request has been sent to the donor.
            </p>

            <div className="w-full mt-10 space-y-3">
              <Button className="w-full h-12 rounded-2xl" variant="outline" onClick={() => { onOpenChange(false); }}>
                Close
              </Button>
              <Button className="w-full h-12 rounded-2xl" onClick={() => {
                onOpenChange(false);
                const orderId = Math.floor(Math.random() * 90000) + 10000;
                router.push(`/orders/${orderId}`);
              }}>
                Track Delivery <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-md p-6 overflow-hidden transition-all duration-300",
        step === 'success' ? "bg-card" : "bg-card"
      )}>
        {step !== 'success' && (
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-tighter mb-1">
              <div className={cn("h-1 flex-1 rounded-full", step === 'address' ? "bg-primary" : "bg-muted")} />
              <div className={cn("h-1 flex-1 rounded-full", step === 'service' ? "bg-primary" : "bg-muted")} />
              <div className={cn("h-1 flex-1 rounded-full", step === 'payment' ? "bg-primary" : "bg-muted")} />
            </div>
            <DialogTitle className="font-black text-2xl tracking-tight">
              {step === 'address' && 'Select Address'}
              {step === 'service' && 'Billing Details'}
              {step === 'payment' && 'Payment Method'}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
          {renderStep()}
        </div>

      </DialogContent>
    </Dialog>
  );
}
