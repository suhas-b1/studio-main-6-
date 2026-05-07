'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bike, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { DeliveryTracking, DeliveryStatus } from '@/context/delivery-context';
import LiveTrackingMap from './tracking-map';
import { cn } from '@/lib/utils';

interface BlinkitTrackingScreenProps {
  delivery: DeliveryTracking;
  onClose: () => void;
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; description: string; icon: any; color: string }> = {
  pending: { label: 'Finding Volunteer', description: 'Searching for nearest volunteer...', icon: Bike, color: 'text-yellow-400' },
  assigned: { label: 'Volunteer Assigned', description: 'Help is on the way to the donor.', icon: ShieldCheck, color: 'text-blue-400' },
  accepted: { label: 'Accepted', description: 'Volunteer has accepted your request.', icon: ShieldCheck, color: 'text-blue-400' },
  heading_to_donor: { label: 'Heading to Pickup', description: 'Volunteer is moving towards the donor location.', icon: MapPin, color: 'text-orange-400' },
  arrived_at_donor: { label: 'Arrived at Donor', description: 'Volunteer has reached the donor location.', icon: MapPin, color: 'text-green-400' },
  picked_up: { label: 'Food Picked Up', description: 'Donation is safely with the volunteer.', icon: Bike, color: 'text-primary' },
  heading_to_receiver: { label: 'On the Way', description: 'Volunteer is bringing the food to you.', icon: Navigation, color: 'text-primary' },
  near_receiver: { label: 'Arriving Soon', description: 'Volunteer is within 500m of your location!', icon: Bike, color: 'text-green-400' },
  delivered: { label: 'Delivered', description: 'Food has been successfully delivered. Thank you!', icon: ShieldCheck, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', description: 'This delivery has been cancelled.', icon: MapPin, color: 'text-red-500' },
};

const STATUS_STEPS: DeliveryStatus[] = [
  'assigned',
  'picked_up',
  'heading_to_receiver',
  'delivered'
];

export default function BlinkitTrackingScreen({ delivery, onClose }: BlinkitTrackingScreenProps) {
  const currentStatus = STATUS_CONFIG[delivery.status];
  
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${delivery.currentLat},${delivery.currentLng}&destination=${delivery.destLat},${delivery.destLng}&travelmode=driving`;

  const getStepStatus = (step: DeliveryStatus) => {
    const currentIndex = STATUS_STEPS.indexOf(delivery.status);
    const stepIndex = STATUS_STEPS.indexOf(step);
    
    // Handle statuses not in the main sequence
    if (delivery.status === 'near_receiver') return step === 'delivered' ? 'pending' : 'completed';
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse">
            <Bike className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Tracking Delivery</h1>
            <p className="text-xs text-primary font-bold">{currentStatus.label}</p>
          </div>
        </div>
        <button onClick={onClose} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          <ChevronRight className="h-6 w-6 rotate-90" />
        </button>
      </div>

      {/* Main Map Content */}
      <div className="flex-1 relative">
        <LiveTrackingMap delivery={delivery} role="receiver" />
        
        {/* Floating ETA Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-6 right-6 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${delivery.volunteerName}`} 
                  alt="Volunteer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white leading-tight">{delivery.volunteerName}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Delivery Partner</span>
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-xs text-primary font-black italic">4.9 ★</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition">
                <Phone className="h-5 w-5" />
              </button>
              <button className="h-12 w-12 rounded-2xl bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition">
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="flex justify-between items-center px-2">
            {STATUS_STEPS.map((step, idx) => {
              const state = getStepStatus(step);
              return (
                <div key={step} className="flex flex-col items-center gap-2 relative">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    state === 'completed' ? "bg-primary border-primary text-black" :
                    state === 'active' ? "bg-primary/20 border-primary text-primary animate-pulse" :
                    "bg-white/5 border-white/10 text-white/40"
                  )}>
                    {STATUS_CONFIG[step].icon && <STATUS_CONFIG[step].icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tighter text-center max-w-[60px]",
                    state === 'active' ? "text-primary" : "text-white/40"
                  )}>
                    {STATUS_CONFIG[step].label.split(' ')[0]}
                  </span>
                  
                  {/* Connector Line */}
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className="absolute top-5 left-10 w-[calc(100vw/5)] h-[2px] bg-white/10 -z-10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: state === 'completed' ? '100%' : '0%' }}
                        className="h-full bg-primary"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Est. Arrival</span>
              </div>
              <p className="text-xl font-black text-white">{delivery.eta || 'Calculating...'}</p>
            </div>
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary rounded-2xl p-4 flex flex-col justify-center items-center gap-1 group"
            >
              <Navigation className="h-5 w-5 text-black group-hover:scale-110 transition" />
              <span className="text-[10px] font-black text-black uppercase tracking-widest">Open Maps</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Safety Indicator */}
      <div className="bg-[#0f0f0f] px-6 py-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-tight uppercase">Food Safety: Verified Secure</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black uppercase italic">
          Powered by Nourish Connect Live
        </div>
      </div>
    </div>
  );
}
