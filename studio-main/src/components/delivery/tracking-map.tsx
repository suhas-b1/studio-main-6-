'use client';

import { useEffect, useRef, useState } from 'react';
import { Shield, MapPin, Navigation, User, Bike } from 'lucide-react';
import { DeliveryTracking } from '@/context/delivery-context';

interface TrackingMapProps {
  delivery: DeliveryTracking;
  role: 'donor' | 'volunteer' | 'receiver';
}

const PRIORITY_COLORS = {
  high: '#dc2626',
  medium: '#f97316',
  low: '#eab308',
};

export default function LiveTrackingMap({ delivery, role }: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const volunteerMarkerRef = useRef<any>(null);
  
  // Interpolated position for smooth movement
  const [smoothPos, setSmoothPos] = useState<[number, number]>([
    delivery.currentLat || delivery.pickupLat,
    delivery.currentLng || delivery.pickupLng
  ]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, {
        center: [delivery.pickupLat, delivery.pickupLng],
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        className: 'map-tiles-dark',
      }).addTo(map);

      // Custom Icons
      const donorIcon = L.divIcon({
        html: `<div class="p-2 bg-green-500 rounded-full border-2 border-white shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const receiverIcon = L.divIcon({
        html: `<div class="p-2 bg-blue-500 rounded-full border-2 border-white shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const volunteerIcon = L.divIcon({
        html: `<div class="volunteer-marker-container">
                <div class="volunteer-pulse"></div>
                <div class="p-2 bg-primary rounded-full border-2 border-black shadow-2xl relative z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5">
                    <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                  </svg>
                </div>
              </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Add Markers
      L.marker([delivery.pickupLat, delivery.pickupLng], { icon: donorIcon }).addTo(map)
        .bindPopup('<b>Pickup:</b> Donor Location');
      L.marker([delivery.destLat, delivery.destLng], { icon: receiverIcon }).addTo(map)
        .bindPopup('<b>Destination:</b> Receiver Location');

      volunteerMarkerRef.current = L.marker(smoothPos, { icon: volunteerIcon }).addTo(map);

      // Fit bounds initially
      const bounds = L.latLngBounds([
        [delivery.pickupLat, delivery.pickupLng],
        [delivery.destLat, delivery.destLng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapInstanceRef.current = { map, L };
    });

    return () => {
      mapInstanceRef.current?.map?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update volunteer position with interpolation
  useEffect(() => {
    if (!mapInstanceRef.current || !delivery.currentLat || !delivery.currentLng) return;
    const { map } = mapInstanceRef.current;
    
    const targetPos: [number, number] = [delivery.currentLat, delivery.currentLng];
    const startPos = smoothPos;
    
    let startTime = performance.now();
    const duration = 2000; // 2 seconds for smooth transition

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const lat = startPos[0] + (targetPos[0] - startPos[0]) * progress;
      const lng = startPos[1] + (targetPos[1] - startPos[1]) * progress;
      
      const newPos: [number, number] = [lat, lng];
      setSmoothPos(newPos);
      
      if (volunteerMarkerRef.current) {
        volunteerMarkerRef.current.setLatLng(newPos);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Auto-recenter if volunteer is moving
    if (role === 'volunteer') {
      map.panTo(targetPos);
    }
  }, [delivery.currentLat, delivery.currentLng]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl">
      <style>{`
        .map-tiles-dark { filter: invert(100%) hue-rotate(180deg) brightness(0.8) contrast(1.2); }
        .volunteer-marker-container { position: relative; }
        .volunteer-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.3;
          animation: sos-pulse 2s infinite;
        }
        @keyframes sos-pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Live Tracking</span>
          </div>
        </div>
        <div className="bg-primary px-4 py-2 rounded-2xl shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-black uppercase tracking-widest">ETA: {delivery.eta || 'Calculating...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
