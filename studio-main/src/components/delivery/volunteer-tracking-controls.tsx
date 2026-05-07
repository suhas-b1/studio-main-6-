'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bike, 
  MapPin, 
  CheckCircle2, 
  Navigation, 
  Loader2, 
  ShieldAlert,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useDelivery, DeliveryTracking, DeliveryStatus } from '@/context/delivery-context';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance } from '@/lib/distance';
import { cn } from '@/lib/utils';

interface VolunteerTrackingControlsProps {
  delivery: DeliveryTracking;
}

const FLOW: DeliveryStatus[] = [
  'accepted',
  'heading_to_donor',
  'arrived_at_donor',
  'picked_up',
  'heading_to_receiver',
  'near_receiver',
  'delivered'
];

export default function VolunteerTrackingControls({ delivery }: VolunteerTrackingControlsProps) {
  const { updateDeliveryStatus, updateVolunteerLocation } = useDelivery();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const watchId = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation Not Supported' });
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // Calculate dynamic ETA (Simplified for demo)
        const distToDest = calculateDistance(latitude, longitude, delivery.destLat, delivery.destLng);
        const etaMin = Math.round(distToDest * 5) + 2; // ~5 mins per km + 2 min buffer
        
        updateVolunteerLocation(delivery.id, latitude, longitude, `${etaMin} mins`);
        
        // Auto-update to 'near_receiver' if within 500m
        if (distToDest <= 0.5 && delivery.status === 'heading_to_receiver') {
          updateDeliveryStatus(delivery.id, 'near_receiver');
        }
      },
      (err) => console.error('Tracking Error:', err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  }, [delivery.id, delivery.destLat, delivery.destLng, delivery.status, updateVolunteerLocation, updateDeliveryStatus, toast]);

  useEffect(() => {
    if (delivery.status !== 'delivered' && delivery.status !== 'cancelled') {
      startTracking();
    }
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [delivery.status, startTracking]);

  const handleNextStatus = async () => {
    const currentIndex = FLOW.indexOf(delivery.status);
    const nextStatus = FLOW[currentIndex + 1];
    if (!nextStatus) return;

    setIsUpdating(true);
    try {
      await updateDeliveryStatus(delivery.id, nextStatus);
      toast({ title: 'Status Updated', description: `Moving to: ${nextStatus.replace(/_/g, ' ')}` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusButtonLabel = () => {
    switch(delivery.status) {
      case 'accepted': return 'Start Heading to Donor';
      case 'heading_to_donor': return 'Arrived at Donor';
      case 'arrived_at_donor': return 'Confirm Pickup';
      case 'picked_up': return 'Start Delivery to Receiver';
      case 'heading_to_receiver': return 'Near Destination? Confirm Arrival';
      case 'near_receiver': return 'Mark as Delivered';
      default: return 'Next Step';
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
    delivery.status.includes('donor') ? delivery.pickupLat + ',' + delivery.pickupLng : delivery.destLat + ',' + delivery.destLng
  }&travelmode=driving`;

  return (
    <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bike className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Active Task</h4>
            <p className="text-xs text-muted-foreground">Order ID: NC-{delivery.id.slice(0, 5)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-400 uppercase">Live GPS Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
          <p className="text-sm font-bold text-white capitalize">{delivery.status.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Your ETA</p>
          <p className="text-sm font-bold text-primary">{delivery.eta || 'Syncing...'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white font-bold hover:bg-white/10 transition"
        >
          <ExternalLink className="h-4 w-4" />
          Get Navigation Directions
        </a>
        
        <button
          onClick={handleNextStatus}
          disabled={isUpdating || delivery.status === 'delivered'}
          className={cn(
            "w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-95",
            delivery.status === 'delivered' 
              ? "bg-green-500 text-black cursor-default" 
              : "bg-primary text-black hover:bg-primary/90"
          )}
        >
          {isUpdating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : delivery.status === 'delivered' ? (
            <><CheckCircle2 className="h-5 w-5" /> Delivery Completed</>
          ) : (
            <>{getStatusButtonLabel()} <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-orange-200/80 leading-relaxed font-medium">
          <b>Safety Tip:</b> Please maintain a steady speed. If the ETA exceeds food freshness, the system will alert you to prioritize speed or reroute.
        </p>
      </div>
    </div>
  );
}
