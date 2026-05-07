'use client';

import { useState } from 'react';
import { useDelivery, DeliveryTracking } from '@/context/delivery-context';
import { useUser } from '@/firebase';
import { Bike, MapPin, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import BlinkitTrackingScreen from './blinkit-tracking-screen';
import VolunteerTrackingControls from './volunteer-tracking-controls';

export function ActiveDeliveriesDashboard({ role }: { role: string }) {
  const { activeDeliveries, createDelivery } = useDelivery();
  const { user } = useUser();
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryTracking | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    if (!user) return;
    setIsSimulating(true);
    try {
      await createDelivery({
        donationId: 'test-donation',
        volunteerId: user.uid,
        volunteerName: user.displayName || 'John Doe',
        receiverId: user.uid,
        pickupLat: 12.9716,
        pickupLng: 77.5946,
        destLat: 12.9352,
        destLng: 77.6245,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  if (activeDeliveries.length === 0 && role !== 'volunteer') return null;

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Live Trackings <span className="text-primary">({activeDeliveries.length})</span>
        </h2>
        {role === 'volunteer' && (
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="text-[10px] font-black bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white uppercase tracking-widest hover:bg-white/10 transition"
          >
            {isSimulating ? 'Creating...' : '+ Simulate Delivery'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="group relative bg-[#111] border border-white/10 rounded-[2rem] p-6 hover:border-primary/40 transition-all cursor-pointer overflow-hidden shadow-xl"
            onClick={() => setSelectedDelivery(delivery)}
            style={{ animation: 'fadeIn 0.4s ease' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
            
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <Bike className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-primary text-black px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span>
                    <span className="text-xs text-muted-foreground font-bold italic">#{delivery.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight uppercase truncate max-w-[180px]">
                    {delivery.volunteerName}'s Journey
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
                <p className="text-sm font-bold text-white">{delivery.eta || 'Calculated'}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Receiver</span>
                </div>
                <p className="text-sm font-bold text-white truncate">NGO Office</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-500" /> Secure Delivery Active
              </span>
              <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase group-hover:gap-2 transition-all">
                Track Live <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 lg:p-12">
          <div
            onClick={() => setSelectedDelivery(null)}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <div className="relative w-full h-full md:max-w-6xl md:max-h-[850px] bg-[#0a0a0a] md:rounded-[3rem] overflow-hidden border border-white/10 flex flex-col md:flex-row shadow-2xl" style={{ animation: 'zoomIn 0.3s ease' }}>
            <div className="flex-1 min-h-[300px] relative">
              <BlinkitTrackingScreen
                delivery={selectedDelivery}
                onClose={() => setSelectedDelivery(null)}
              />
            </div>
            {(role === 'volunteer' || role === 'admin') && (
              <div className="w-full md:w-[400px] bg-[#111] p-8 border-l border-white/10 overflow-y-auto">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Logistics Control</h3>
                <VolunteerTrackingControls delivery={selectedDelivery} />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
