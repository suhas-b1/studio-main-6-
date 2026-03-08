
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Donation } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

// Dynamically import the map component to avoid SSR issues with Leaflet
const DeliveryMap = dynamic(() => import('@/components/maps/delivery-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});


type TrackDeliveryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation;
};

// Mock location data
const donorLocation: [number, number] = [34.0522, -118.2437]; // Los Angeles
const ngoLocation: [number, number] = [34.0722, -118.2637]; // A bit north of LA
const driverLocation: [number, number] = [34.0622, -118.2537]; // Somewhere in between

export function TrackDeliveryDialog({
  open,
  onOpenChange,
  donation,
}: TrackDeliveryDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Live Tracking for: {donation.title}
          </DialogTitle>
          <DialogDescription>
            Watch your donation's journey in real-time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 h-[400px] w-full rounded-lg overflow-hidden border">
           <DeliveryMap 
                donor={{...donation.donor, position: donorLocation }} 
                ngo={{ name: 'Your Organization', position: ngoLocation }}
                driver={{ name: 'David R.', position: driverLocation }}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
