'use client';

import { useEffect, useRef, useState } from 'react';
import { useTrackingEngine, LiveDeliveryState } from '@/context/tracking-engine-context';
import { ShieldCheck, MapPin, Navigation, Bike, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumTrackingMapProps {
  deliveryId: string;
  role: 'donor' | 'volunteer' | 'receiver';
}

export default function PremiumTrackingMap({ deliveryId, role }: PremiumTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const volunteerMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  
  const { getLiveState, subscribe, unsubscribe } = useTrackingEngine();
  const state = getLiveState(deliveryId);

  useEffect(() => {
    subscribe(deliveryId);
    return () => unsubscribe(deliveryId);
  }, [deliveryId, subscribe, unsubscribe]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, {
        center: [state?.pickupLat || 12.9716, state?.pickupLng || 77.5946],
        zoom: 15,
        zoomControl: false,
      });

      // Premium Dark Mode Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Custom Icon Builders
      const createDivIcon = (html: string, size: [number, number] = [32, 32]) => L.divIcon({
        html,
        className: '',
        iconSize: size,
        iconAnchor: [size[0]/2, size[1]/2],
      });

      const donorIcon = createDivIcon(`
        <div class="relative flex items-center justify-center">
          <div class="absolute h-10 w-10 bg-green-500/20 rounded-full animate-ping"></div>
          <div class="h-8 w-8 bg-green-500 rounded-2xl border-2 border-white shadow-xl flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>
      `);

      const receiverIcon = createDivIcon(`
        <div class="h-8 w-8 bg-blue-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `);

      const volunteerIcon = createDivIcon(`
        <div class="volunteer-marker-premium">
          <div class="volunteer-pulse-effect"></div>
          <div class="h-12 w-12 bg-primary rounded-2xl border-2 border-black shadow-2xl flex items-center justify-center relative z-10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5">
              <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
            </svg>
          </div>
        </div>
      `, [48, 48]);

      if (state) {
        L.marker([state.pickupLat, state.pickupLng], { icon: donorIcon }).addTo(map);
        L.marker([state.destLat, state.destLng], { icon: receiverIcon }).addTo(map);
        volunteerMarkerRef.current = L.marker([state.smoothLat, state.smoothLng], { icon: volunteerIcon, zIndexOffset: 1000 }).addTo(map);
        
        // Draw initial route line
        polylineRef.current = L.polyline([
          [state.pickupLat, state.pickupLng],
          [state.destLat, state.destLng]
        ], {
          color: '#f97316',
          weight: 4,
          opacity: 0.6,
          dashArray: '10, 10'
        }).addTo(map);

        const bounds = L.latLngBounds([
          [state.pickupLat, state.pickupLng],
          [state.destLat, state.destLng]
        ]);
        map.fitBounds(bounds, { padding: [100, 100] });
      }

      mapInstanceRef.current = { map, L };
    });

    return () => {
      mapInstanceRef.current?.map?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync volunteer marker with smooth context position
  useEffect(() => {
    if (!state || !volunteerMarkerRef.current || !mapInstanceRef.current) return;
    volunteerMarkerRef.current.setLatLng([state.smoothLat, state.smoothLng]);
    
    // Auto-recenter for volunteer
    if (role === 'volunteer') {
      mapInstanceRef.current.map.panTo([state.smoothLat, state.smoothLng]);
    }
  }, [state?.smoothLat, state?.smoothLng]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#111] overflow-hidden">
      <style>{`
        .volunteer-marker-premium { position: relative; display: flex; align-items: center; justify-content: center; }
        .volunteer-pulse-effect {
          position: absolute;
          width: 80px;
          height: 80px;
          background: #f97316;
          border-radius: 50%;
          opacity: 0.2;
          animation: premium-pulse 2s infinite;
        }
        @keyframes premium-pulse {
          0% { transform: scale(0.5); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-container { background: #0a0a0a !important; }
      `}</style>
      
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Overlay Stats */}
      {state && (
        <div className="absolute top-6 left-6 right-6 flex flex-col gap-4 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl pointer-events-auto flex items-center gap-4 shadow-2xl">
              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Bike className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Speed</p>
                <p className="text-sm font-black text-white">{state.speedKmh} km/h</p>
              </div>
            </div>

            <div className="bg-primary px-6 py-4 rounded-3xl shadow-2xl shadow-primary/20 pointer-events-auto text-center border-2 border-black/10">
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest leading-none mb-1">Estimated Arrival</p>
              <p className="text-xl font-black text-black tracking-tight">{state.etaLabel}</p>
            </div>
          </div>

          {state.safetyAlert && (
            <div className="self-center bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest animate-bounce shadow-2xl flex items-center gap-2 pointer-events-auto border-2 border-white/20">
              <ShieldCheck className="h-4 w-4" />
              {state.safetyAlert}
            </div>
          )}
        </div>
      )}

      {/* Floating Action HUD (Bottom) */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-center gap-3 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl pointer-events-auto flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Realtime Active</span>
        </div>
      </div>
    </div>
  );
}
