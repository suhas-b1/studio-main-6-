'use client';

import { useState, useEffect } from 'react';
import { useDelivery } from '@/context/delivery-context';
import { useTrackingEngine } from '@/context/tracking-engine-context';
import { useUser } from '@/firebase';
import { 
  Bike, 
  MapPin, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LiveTrackingScreen from './live-tracking-screen';
import VolunteerTrackingControls from './volunteer-tracking-controls';

export default function VolunteerLogisticsHub() {
  const { activeDeliveries } = useDelivery();
  const { user } = useUser();
  const { startGPS, stopGPS, isGPSActive } = useTrackingEngine();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const myDeliveries = activeDeliveries.filter(d => d.volunteerId === user?.uid);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[2rem] bg-primary/20 border border-primary/40 flex items-center justify-center relative shadow-2xl shadow-primary/10">
            <Bike className="h-10 w-10 text-primary" />
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 border-4 border-[#0a0a0a] flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Volunteer Portal</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                Active Status: Online
              </span>
              <span className="text-[10px] font-bold text-muted-foreground italic">Rank: Hero Class S</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center bg-white/5 px-6 py-4 rounded-3xl border border-white/5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Impact Level</p>
            <p className="text-2xl font-black text-white">4.9 ★</p>
          </div>
          <div className="text-center bg-primary px-6 py-4 rounded-3xl border-2 border-black/10 shadow-xl shadow-primary/10">
            <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-1">Deliveries</p>
            <p className="text-2xl font-black text-black">128</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Tasks List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" /> Active Assignments
            </h3>
            <span className="text-xs font-bold text-muted-foreground">{myDeliveries.length} task(s) found</span>
          </div>

          <div className="space-y-4">
            {myDeliveries.length === 0 ? (
              <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-16 text-center">
                <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h4 className="text-white font-black uppercase tracking-tight mb-2">No Active Tasks</h4>
                <p className="text-sm text-muted-foreground italic max-w-xs mx-auto">
                  New donation requests will appear here when assigned. Stay tuned, hero!
                </p>
              </div>
            ) : (
              myDeliveries.map(d => (
                <div 
                  key={d.id}
                  className="group bg-[#111] border border-white/10 rounded-[2.5rem] p-6 hover:border-primary/40 transition-all shadow-xl"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Navigation className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase">Route Active</span>
                          <span className="text-[10px] font-bold text-muted-foreground">#NC-{d.id.slice(0, 5)}</span>
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Mumbai Central Route</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Est. Completion</p>
                      <p className="text-sm font-black text-white uppercase tracking-tighter">{d.eta || '--'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pickup</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">Green Park NGOs Office</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Drop</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">Community Shelter Home</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedId(d.id)}
                      className="flex-1 h-14 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <MapPin className="h-4 w-4" /> Open Live Map
                    </button>
                    <button className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition active:scale-95">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Task Controls */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-green-500" /> Control Center
            </h3>
          </div>

          {selectedId && myDeliveries.find(d => d.id === selectedId) ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <VolunteerTrackingControls delivery={myDeliveries.find(d => d.id === selectedId)!} />
              
              <div className="mt-8 bg-[#111] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                 <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Activity className="h-4 w-4 text-primary" /> Delivery Logic Engine
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground font-medium">GPS Sync Mode</span>
                     <span className="text-green-400 font-black uppercase tracking-widest text-[10px]">High Accuracy</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground font-medium">Background Tracking</span>
                     <span className="text-primary font-black uppercase tracking-widest text-[10px]">Enabled</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground font-medium">Auto-Status Updates</span>
                     <span className="text-primary font-black uppercase tracking-widest text-[10px]">Active (0.5km)</span>
                   </div>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                   <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                     * The system automatically recalculates ETA every 15 seconds based on your speed and live traffic.
                   </p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/10 border-dashed rounded-[2.5rem] p-20 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Navigation className="h-8 w-8 text-white/20" />
              </div>
              <p className="text-muted-foreground text-sm font-bold italic">
                Select an assignment from the left to start tracking and managing the delivery flow.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Map Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-[110] bg-[#0a0a0a] animate-in fade-in duration-500">
           <div className="absolute top-6 left-6 z-[120]">
             <button 
               onClick={() => setSelectedId(null)}
               className="h-12 px-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 active:scale-95 transition"
             >
               <ChevronRight className="h-4 w-4 rotate-180" /> Back to Hub
             </button>
           </div>
           <LiveTrackingScreen deliveryId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
