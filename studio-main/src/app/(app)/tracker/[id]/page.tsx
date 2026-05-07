'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { StatusTimeline } from '@/components/tracking/status-timeline';

// Dynamically import the Leaflet map so it only loads on the client
const LiveTrackingMap = dynamic(
  () => import('@/components/maps/live-tracking-map'),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div> }
);

type Status = 'PENDING' | 'REACHED_PICKUP' | 'PICKED_UP' | 'ON_THE_WAY' | 'NEAR_DESTINATION' | 'DELIVERED';

const STATUS_SEQUENCE: Status[] = [
  'PENDING',
  'REACHED_PICKUP',
  'PICKED_UP',
  'ON_THE_WAY',
  'NEAR_DESTINATION',
  'DELIVERED'
];

export default function TrackerPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  // Simulate delivery lifecycle for the presentation
  useEffect(() => {
    if (currentStatusIndex >= STATUS_SEQUENCE.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStatusIndex(prev => prev + 1);
    }, 4000); // Progress to next status every 4 seconds

    return () => clearTimeout(timer);
  }, [currentStatusIndex]);

  const currentStatus = STATUS_SEQUENCE[currentStatusIndex];

  return (
    <div className="relative h-[calc(100vh-64px)] w-full flex flex-col bg-background overflow-hidden">
      
      {/* Back Button Overlay */}
      <button 
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:bg-background transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Map Section (Top 60%) */}
      <div className="h-[55%] w-full relative z-0">
        <LiveTrackingMap currentStatus={currentStatus} />
        
        {/* Fading gradient overlay to blend into bottom sheet */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </div>

      {/* Bottom Sheet Section (Bottom 45%) */}
      <div className="h-[45%] w-full flex-shrink-0 z-10 overflow-y-auto pb-24">
        <StatusTimeline currentStatus={currentStatus} />
      </div>
      
    </div>
  );
}
