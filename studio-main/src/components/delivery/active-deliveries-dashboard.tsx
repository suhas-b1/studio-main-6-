'use client';

import { useState } from 'react';
import { useDelivery, DeliveryTracking } from '@/context/delivery-context';
import { useUser } from '@/firebase';
import { Bike, MapPin, ChevronRight, Clock, ShieldCheck, Navigation } from 'lucide-react';
import LiveTrackingScreen from './live-tracking-screen';
import VolunteerLogisticsHub from './volunteer-logistics-hub';
import { cn } from '@/lib/utils';

export function ActiveDeliveriesDashboard({ role }: { role: string }) {
  const { activeDeliveries, createDelivery } = useDelivery();
  const { user } = useUser();
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Filter deliveries based on user role
  const myDeliveries = activeDeliveries.filter(d => 
    role === 'volunteer' ? d.volunteerId === user?.uid : 
    role === 'ngo' ? d.receiverId === user?.uid : true
  );

  const handleSimulate = async () => {
    if (!user) return;
    setIsSimulating(true);
    try {
      await createDelivery({
        donationId: 'test-donation',
        volunteerId: user.uid,
        volunteerName: user.displayName || 'Hero Donor',
        receiverId: user.uid, // Simulate to self for testing
        pickupLat: 12.9716, // Bangalore
        pickupLng: 77.5946,
        destLat: 12.9352,
        destLng: 77.6245,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // If volunteer, show the full Logistics Hub instead of just a list
  if (role === 'volunteer' && myDeliveries.length > 0) {
    return <VolunteerLogisticsHub />;
  }

  if (myDeliveries.length === 0 && role !== 'volunteer') return null;

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <Navigation className="h-6 w-6 text-primary" />
          Live Trackings <span className="text-primary">({myDeliveries.length})</span>
        </h2>
        {role === 'volunteer' && (
          <button 
            onClick={handleSimulate}
            disabled={isSimulating}
            className="text-[10px] font-black bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white uppercase tracking-widest hover:bg-white/10 transition flex items-center gap-2"
          >
            {isSimulating ? <div className="h-2 w-2 rounded-full bg-white animate-ping" /> : '+'} Simulate Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="group relative bg-[#111] border border-white/10 rounded-[2rem] p-6 hover:border-primary/40 transition-all cursor-pointer overflow-hidden shadow-xl"
            onClick={() => setSelectedDeliveryId(delivery.id)}
            style={{ animation: 'fadeIn 0.4s ease' }}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
            
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <Bike className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">In Transit</span>
                    <span className="text-xs text-muted-foreground font-bold italic">#{delivery.id.slice(0, 5)}</span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight uppercase truncate max-w-[180px]">
                    {delivery.volunteerName}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-bold text-primary capitalize">{delivery.status.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ETA</span>
                </div>
                <p className="text-sm font-bold text-white tracking-tighter">{delivery.eta || 'Syncing...'}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loc</span>
                </div>
                <p className="text-sm font-bold text-white truncate uppercase">NGO Center</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-500" /> Realtime Link Active
              </span>
              <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase group-hover:gap-2 transition-all">
                View Tracker <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Modal Overlay */}
      {selectedDeliveryId && (
        <LiveTrackingScreen
          deliveryId={selectedDeliveryId}
          onClose={() => setSelectedDeliveryId(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
