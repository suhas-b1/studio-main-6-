
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    CheckCircle2,
    MapPin,
    Clock,
    Phone,
    ChevronLeft,
    Navigation,
    Bike,
    Package,
    ShieldCheck,
    Search,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Lazy load the map to improve initial performance
const LiveTrackingMap = dynamic(() => import('@/components/maps/live-tracking-map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><Search className="animate-spin text-muted-foreground mr-2" /> Loading Live Map...</div>
});

const STEPS = [
    { id: 'placed', label: 'Order Placed', time: '4:30 PM', sub: 'We have received your claim' },
    { id: 'confirmed', label: 'Donor Confirmed', time: '4:35 PM', sub: 'Renuka\'s Kitchen is preparing food' },
    { id: 'picked-up', label: 'Picked Up', time: 'Expecting 4:50 PM', sub: 'Delivery partner has collected food' },
    { id: 'delivered', label: 'Delivered', time: 'ETA 5:05 PM', sub: 'Food will reach your location soon' },
];

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1); // Start at 'confirmed' for demo
    const [progress, setProgress] = useState(45);

    // Simple simulator for status updates
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentStep < STEPS.length - 1) {
                // setCurrentStep(prev => prev + 1); // Auto advance just for demo if we want
            }
        }, 10000);
        return () => clearTimeout(timer);
    }, [currentStep]);

    return (
        <div className="flex flex-col h-screen bg-background animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="font-black text-lg tracking-tight">Order #NC{params.id}</h1>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">ETA: 15 MINS</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-full h-9 gap-1 font-bold text-xs bg-primary/5 text-primary border-primary/20">
                        <ShieldCheck className="h-3 w-3" /> Support
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left: Status and Details */}
                <div className="flex-1 overflow-y-auto w-full md:max-w-md border-r bg-card/30">
                    <div className="p-6 space-y-8">
                        {/* Live Status Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-foreground">Out for Delivery</h2>
                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Bike className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-sm text-muted-foreground">Arshad is on his way to <span className="text-foreground font-bold">Community Kitchen</span></p>
                        </div>

                        <Separator />

                        {/* Delivery Partner Info */}
                        <div className="flex items-center justify-between bg-card border rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted relative">
                                    <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arshad" alt="Arshad" fill />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Arshad Khan</h3>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">5.0 ★ Verified Partner</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-green-500/20 text-green-600 hover:bg-green-50">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-primary/20 text-primary hover:bg-primary/5">
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-6 pt-2">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Order Status</h3>
                            <div className="relative space-y-1">
                                {STEPS.map((step, idx) => (
                                    <div key={step.id} className="flex gap-4 relative group">
                                        {/* Line */}
                                        {idx !== STEPS.length - 1 && (
                                            <div className={cn(
                                                "absolute left-2.5 top-6 bottom-0 w-0.5",
                                                idx < currentStep ? "bg-primary" : "bg-muted"
                                            )} />
                                        )}

                                        {/* Circle */}
                                        <div className={cn(
                                            "h-5 w-5 rounded-full flex-shrink-0 z-10 flex items-center justify-center transition-colors duration-300",
                                            idx <= currentStep ? "bg-primary" : "bg-muted",
                                            idx === currentStep && "ring-4 ring-primary/20"
                                        )}>
                                            {idx < currentStep ? <CheckCircle2 className="h-3 w-3 text-primary-foreground font-bold" /> : <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                        </div>

                                        <div className="pb-8">
                                            <div className="flex items-center gap-2">
                                                <p className={cn("text-sm font-bold", idx <= currentStep ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                                                <p className="text-[10px] font-mono text-muted-foreground">{step.time}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{step.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address Summary */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Delivery Location</h3>
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">NGO Head Office</p>
                                    <p className="text-xs text-muted-foreground mt-1">123 Charity Lane, Springfield Center, West Bengal, 700001</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Real-time Map (or Large Map on desktop) */}
                <div className="flex-[2] relative bg-muted hidden md:block">
                    <LiveTrackingMap />

                    {/* Floating Info */}
                    <div className="absolute top-6 left-6 right-6 z-10 flex gap-4">
                        <div className="bg-card border rounded-2xl shadow-xl p-4 flex-1 flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Navigation className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Picking up from</p>
                                <p className="text-sm font-bold truncate max-w-[200px]">Renuka's Kitchen, Sec-5</p>
                            </div>
                        </div>
                        <div className="bg-card border rounded-2xl shadow-xl p-4 flex-1 flex items-center gap-4 border-primary/20">
                            <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                <Clock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Estimated Arrival</p>
                                <p className="text-sm font-bold">5:05 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* Animated Legend Overlay */}
                    <div className="absolute bottom-6 right-6 z-10 bg-card rounded-2xl shadow-xl border p-4 w-48 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-primary rounded-full ring-4 ring-primary/20 animate-pulse" />
                            <span className="text-xs font-bold text-foreground">Arshad (Partner)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-muted-foreground rounded-full" />
                            <span className="text-xs font-bold text-muted-foreground">Renuka's Kitchen</span>
                        </div>
                        <Separator />
                        <Button className="w-full text-xs h-8 rounded-xl" variant="outline">Refresh Map</Button>
                    </div>
                </div>

                {/* Mobile Map Toggle (Sticky for mobile) */}
                <div className="md:hidden sticky bottom-0 z-50 p-4 bg-background border-t">
                    <Button className="w-full h-12 rounded-2xl font-bold gap-2">
                        <MapIcon className="h-4 w-4" /> View Live Map
                    </Button>
                </div>
            </div>
        </div>
    );
}
