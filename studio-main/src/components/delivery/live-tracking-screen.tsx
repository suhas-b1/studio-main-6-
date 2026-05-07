'use client';

import { useEffect, useState } from 'react';
import { useTrackingEngine } from '@/context/tracking-engine-context';
import { 
  Bike, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Navigation,
  MapPin,
  CheckCircle2,
  Package,
  AlertCircle,
  Flag
} from 'lucide-react';
import PremiumTrackingMap from './premium-tracking-map';
import { buildGoogleMapsUrl } from '@/lib/tracking/geo-utils';
import { cn } from '@/lib/utils';

interface LiveTrackingScreenProps {
  deliveryId: string;
  onClose: () => void;
}

const STEPS = [
  { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'picked_up', label: 'Picked Up', icon: Package },
  { id: 'heading_to_receiver', label: 'On Way', icon: Navigation },
  { id: 'delivered', label: 'Delivered', icon: Flag }
];

export default function LiveTrackingScreen({ deliveryId, onClose }: LiveTrackingScreenProps) {
  const { getLiveState, subscribe, unsubscribe } = useTrackingEngine();
  const state = getLiveState(deliveryId);

  useEffect(() => {
    subscribe(deliveryId);
    return () => unsubscribe(deliveryId);
  }, [deliveryId, subscribe, unsubscribe]);

  if (!state) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[100]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white font-black uppercase tracking-widest text-xs animate-pulse">Initializing Realtime Link...</p>
        </div>
      </div>
    );
  }

  const googleMapsUrl = buildGoogleMapsUrl(state.destLat, state.destLng, state.currentLat, state.currentLng);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-lg">
            <Bike className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Live Tracking</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">ID: NC-{state.id.slice(0, 5)}</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition"
        >
          <ChevronRight className="h-6 w-6 rotate-90" />
        </button>
      </div>

      {/* Main Map View */}
      <div className="flex-1 relative">
        <PremiumTrackingMap deliveryId={deliveryId} role="receiver" />
        
        {/* Realtime Status Banner */}
        <div className="absolute top-32 left-6 right-6 z-10 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex items-center justify-between shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-inner">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${state.volunteerName}`} 
                  alt="Volunteer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Your Hero</p>
                <h3 className="text-lg font-black text-white leading-none uppercase tracking-tight">{state.volunteerName}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-500 uppercase">On the move</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="tel:123" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition active:scale-95">
                <Phone className="h-5 w-5" />
              </a>
              <button className="h-12 w-12 rounded-2xl bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95">
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating ETA Bottom Panel */}
        <div className="absolute bottom-6 left-6 right-6 z-10 space-y-4">
          <div className="bg-[#111]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            {/* Timeline Progress */}
            <div className="flex justify-between items-center px-2 mb-8">
              {STEPS.map((step, idx) => {
                const isCompleted = getStepStatus(step.id, state.status) === 'done';
                const isActive = step.id === state.status || (step.id === 'heading_to_receiver' && state.status === 'near_receiver');
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 relative">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 shadow-lg",
                      isCompleted ? "bg-primary border-primary text-black" :
                      isActive ? "bg-primary/20 border-primary text-primary animate-pulse" :
                      "bg-white/5 border-white/10 text-white/40"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-tighter text-center max-w-[60px]",
                      isActive ? "text-primary" : "text-white/40"
                    )}>
                      {step.label}
                    </span>
                    
                    {/* Progress Connector */}
                    {idx < STEPS.length - 1 && (
                      <div className="absolute top-6 left-12 w-[calc(100vw/5.5)] h-[3px] bg-white/10 -z-10 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full bg-primary transition-all duration-1000", isCompleted ? "w-full" : "w-0")}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Arrival ETA</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tighter uppercase">{state.etaLabel}</p>
              </div>

              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary rounded-3xl p-6 flex flex-col justify-center items-center gap-2 group hover:bg-primary/90 transition shadow-xl shadow-primary/10 active:scale-95"
              >
                <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                  <Navigation className="h-6 w-6 text-black group-hover:scale-110 transition" />
                </div>
                <span className="text-[10px] font-black text-black uppercase tracking-widest">Google Maps</span>
              </a>
            </div>

            {/* Safety Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg",
                  state.safetyAlert ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-green-500/20 text-green-500"
                )}>
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quality Assurance</p>
                  <p className="text-xs font-black text-white uppercase tracking-tight">
                    {state.safetyAlert ? 'Action Required' : 'Freshness Verified'}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all active:scale-95">
                Support <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepStatus(step: string, currentStatus: string) {
  const ORDER = ['pending', 'assigned', 'accepted', 'heading_to_donor', 'arrived_at_donor', 'picked_up', 'heading_to_receiver', 'near_receiver', 'delivered'];
  const currentIndex = ORDER.indexOf(currentStatus);
  const stepIndex = ORDER.indexOf(step);
  
  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}
