
'use client';
import { useDonations } from '@/context/donations-context';
import { formatDistanceToNow, format } from 'date-fns';
import Image from 'next/image';
import { Package, CheckCircle2, Truck, Star, Clock, MapPin, Phone, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/* ── mock tracking state for demo ─────────────────────── */
const TRACKING: Record<string, { step: number; eta: string; driver: string; vehicle: string; rating: number; phone: string }> = {
    'donation-3': { step: 2, eta: '45 min', driver: 'Arjun S.', vehicle: 'Mahindra Bolero · KA-05-0219', rating: 4.8, phone: '+91 98765 43210' },
    'donation-9': { step: 1, eta: '2 hrs', driver: 'Priya M.', vehicle: 'Tata Ace · MH-03-1181', rating: 4.6, phone: '+91 72345 98761' },
};

const STEPS = [
    { icon: Package, label: 'Listed', sublabel: 'Donation created' },
    { icon: CheckCircle2, label: 'Claimed', sublabel: 'Redistribution confirmed' },
    { icon: Truck, label: 'Picked Up', sublabel: 'In transit to your location' },
    { icon: CheckCircle2, label: 'Delivered', sublabel: 'Estimated arrival' },
];

function DeliveryCard({ donation }: { donation: any }) {
    const tracking = TRACKING[donation.id] ?? { step: 0, eta: 'TBD', driver: 'Pending', vehicle: 'TBD', rating: 5, phone: 'N/A' };
    const orderNo = `NC-${donation.id.replace('donation-', '').padStart(4, '0')}`;

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden card-glow animate-slide-up">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    ACTIVE SHIPMENT
                </span>
                <span className="text-[10px] font-black text-primary">Order #{orderNo}</span>
            </div>

            {/* Food image + title */}
            <div className="relative h-32 w-full">
                <Image src={donation.imageUrl} alt={donation.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4">
                    <p className="font-black text-white text-base leading-tight">{donation.title}</p>
                    <p className="text-xs text-orange-300 font-medium">{donation.quantity}</p>
                </div>
            </div>

            {/* Logistics Journey vertical timeline */}
            <div className="px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                    Logistics Journey
                </p>
                <div className="relative">
                    {/* vertical track */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />

                    {STEPS.map((step, i) => {
                        const done = i <= tracking.step;
                        const current = i === tracking.step;
                        const Icon = step.icon;

                        return (
                            <div key={i} className="flex items-start gap-4 mb-5 last:mb-0 relative">
                                {/* Circle */}
                                <div className={cn(
                                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all",
                                    done
                                        ? "bg-primary border-primary"
                                        : "bg-card border-border"
                                )}>
                                    <Icon className={cn("h-3.5 w-3.5", done ? "text-white" : "text-muted-foreground")} />
                                    {current && (
                                        <div className="absolute inset-0 rounded-full animate-pulse-orange" />
                                    )}
                                </div>

                                <div className="flex-1 pt-0.5">
                                    <p className={cn("text-sm font-bold", done ? "text-foreground" : "text-muted-foreground")}>
                                        {step.label}
                                        {current && (
                                            <span className="ml-2 text-[9px] font-black text-primary uppercase tracking-wide">← NOW</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{step.sublabel}</p>

                                    {/* "In transit" quote box */}
                                    {i === 2 && current && (
                                        <div className="mt-2 rounded-xl border-l-2 border-primary bg-primary/8 px-3 py-2">
                                            <p className="text-xs font-medium text-foreground">
                                                "Your donation is on its way. ETA: <strong className="text-primary">{tracking.eta}</strong>"
                                            </p>
                                        </div>
                                    )}
                                    {/* Estimated label on last step */}
                                    {i === 3 && !done && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Est. in {tracking.eta}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Driver card (only if picked up or beyond) */}
            {tracking.step >= 2 && (
                <div className="mx-5 mb-4 rounded-xl border border-border bg-card/50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Driver Details</p>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground text-sm">{tracking.driver}</p>
                            <p className="text-xs text-muted-foreground truncate">{tracking.vehicle}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-semibold text-foreground">{tracking.rating}</span>
                                <span className="text-xs text-muted-foreground">· NourishConnect Logistics</span>
                            </div>
                        </div>
                        <a
                            href={`tel:${tracking.phone}`}
                            className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0"
                        >
                            <Phone className="h-4 w-4 text-primary" />
                        </a>
                    </div>
                </div>
            )}

            {/* Content summary */}
            <div className="mx-5 mb-5 rounded-xl border border-border p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Content Details</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Item</span>
                        <span className="font-semibold text-foreground truncate ml-4 text-right max-w-[60%]">{donation.title}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-semibold text-foreground">{donation.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-semibold text-foreground">{donation.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Donor</span>
                        <span className="font-semibold text-foreground">{donation.donor.organizationName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pickup by</span>
                        <span className="font-semibold text-foreground">{format(donation.pickupDeadline, 'dd MMM, h:mm a')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MyClaimsPage() {
    const { donations } = useDonations();
    // Show all claimed/picked-up donations as demo (not filter by uid so mock data shows)
    const claimed = donations.filter(d => d.status === 'claimed' || d.status === 'picked-up');

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-foreground">My Claims</h1>
                <p className="text-sm text-muted-foreground mt-1">Track all your active and completed food pickups.</p>
            </div>

            {claimed.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-14 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-bold text-foreground">No active claims</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">Go to Smart Matches to claim your first donation</p>
                    <Button asChild><Link href="/matches?role=ngo">Find Donations</Link></Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {claimed.map(d => <DeliveryCard key={d.id} donation={d} />)}
                </div>
            )}
        </div>
    );
}
