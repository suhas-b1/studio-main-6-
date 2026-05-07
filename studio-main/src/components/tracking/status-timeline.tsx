'use client';

import { CheckCircle2, Circle, Clock, MapPin, Package, Navigation, Phone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Status = 'PENDING' | 'REACHED_PICKUP' | 'PICKED_UP' | 'ON_THE_WAY' | 'NEAR_DESTINATION' | 'DELIVERED';

const STATUS_STAGES = [
  { id: 'PENDING', label: 'Order Confirmed', description: 'Waiting for volunteer' },
  { id: 'REACHED_PICKUP', label: 'Reached Pickup', description: 'Volunteer arrived at donor' },
  { id: 'PICKED_UP', label: 'Food Picked Up', description: 'Food securely collected' },
  { id: 'ON_THE_WAY', label: 'On The Way', description: 'Volunteer is heading to you' },
  { id: 'NEAR_DESTINATION', label: 'Arriving Now', description: 'Volunteer is nearby' },
  { id: 'DELIVERED', label: 'Delivered', description: 'Food successfully delivered' },
];

export function StatusTimeline({ currentStatus }: { currentStatus: Status }) {
  const currentIndex = STATUS_STAGES.findIndex((s) => s.id === currentStatus);

  return (
    <div className="bg-card text-card-foreground p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-border mt-[-20px] relative z-10 w-full animate-slide-up">
      {/* Pull indicator */}
      <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />

      {/* ETA and Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-foreground">
            {currentStatus === 'DELIVERED' ? 'Delivered!' : '15 min'}
          </h2>
          <p className="text-sm font-semibold text-primary flex items-center gap-1 mt-1">
            <Clock className="w-4 h-4" />
            {currentStatus === 'DELIVERED' ? 'Arrived safely' : 'Estimated arrival time'}
          </p>
        </div>
        <div className="bg-primary/15 p-3 rounded-full">
          <Package className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Driver Profile */}
      <div className="flex items-center gap-4 bg-secondary/50 p-4 rounded-2xl mb-8 border border-border">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 border-2 border-primary">
             <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Driver" width={48} height={48} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base">Rahul Kumar</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
             ⭐ 4.9 (120+ deliveries)
          </p>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black hover:bg-primary/90 transition shadow-lg shadow-primary/20">
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0 pl-2">
        {STATUS_STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={stage.id} className="relative flex gap-4">
              {/* Line */}
              {index !== STATUS_STAGES.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-[11px] top-[24px] bottom-[-24px] w-[2px]",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} 
                />
              )}

              {/* Icon */}
              <div className="relative z-10 py-1">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-primary bg-background rounded-full" />
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-muted bg-background rounded-full" />
                )}
              </div>

              {/* Text */}
              <div className={cn("pb-8", isFuture && "opacity-40")}>
                <h4 className={cn("font-bold text-sm", isCurrent && "text-primary")}>
                  {stage.label}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
