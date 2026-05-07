'use client';

import { useEffect, useRef } from 'react';
import { useEmergencyAlerts, AlertPriority } from '@/context/emergency-alerts-context';

const PRIORITY_COLORS: Record<AlertPriority, string> = {
  high: '#dc2626',
  medium: '#f97316',
  low: '#eab308',
};

export default function AlertsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { activeAlerts } = useEmergencyAlerts();

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629], // India center
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        className: 'grayscale',
      }).addTo(map);

      mapInstanceRef.current = { map, markers: [] as any[] };
    });

    return () => {
      mapInstanceRef.current?.map?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when alerts change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map, markers } = mapInstanceRef.current;

    // Remove old markers
    markers.forEach((m: any) => m.remove());
    const newMarkers: any[] = [];

    import('leaflet').then(L => {
      const validAlerts = activeAlerts.filter(a => a.latitude && a.longitude);
      
      if (validAlerts.length > 0) {
        const bounds = L.latLngBounds(validAlerts.map(a => [a.latitude!, a.longitude!]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }

      validAlerts.forEach(alert => {
        const color = PRIORITY_COLORS[alert.priority];

        const svgIcon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;border-radius:50%;
            background:${color}20;border:3px solid ${color};
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 0 6px ${color}30,0 4px 20px ${color}60;
            animation:sos-map-pulse 2s infinite;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const googleMapsUrl = alert.latitude && alert.longitude 
          ? `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.location)}`;

        const marker = L.marker([alert.latitude!, alert.longitude!], { icon: svgIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui;min-width:200px">
              <div style="color:${color};font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">
                ● ${alert.priority} Priority
              </div>
              <p style="font-size:13px;margin:0 0 6px;color:#fff">${alert.description}</p>
              <p style="font-size:11px;color:#888;margin:0">📍 ${alert.location}</p>
              <p style="font-size:11px;color:#888;margin:4px 0 8px">By: ${alert.creatorName}</p>
              <a 
                href="${googleMapsUrl}" 
                target="_blank" 
                style="
                  display:block;width:100%;text-align:center;
                  background:#f97316;color:#000;padding:8px;
                  border-radius:8px;font-weight:900;font-size:11px;
                  text-decoration:none;text-transform:uppercase;
                "
              >
                🚀 Get Directions
              </a>
            </div>
          `, {
            className: 'dark-popup',
          });

        newMarkers.push(marker);
      });
      mapInstanceRef.current.markers = newMarkers;
    });
  }, [activeAlerts]);

  return (
    <>
      <style>{`
        .grayscale { filter: grayscale(0.4) brightness(0.6); }
        .dark-popup .leaflet-popup-content-wrapper { background: #1a0d00; border: 1px solid #f9731640; border-radius: 12px; color: #fff; }
        .dark-popup .leaflet-popup-tip { background: #1a0d00; }
        @keyframes sos-map-pulse {
          0%,100% { box-shadow: 0 0 0 6px rgba(220,38,38,0.3),0 4px 20px rgba(220,38,38,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(220,38,38,0.1),0 4px 20px rgba(220,38,38,0.4); }
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
    </>
  );
}
