'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TYPE_COLORS, TYPE_LABELS, TYPE_EMOJIS, type AidLocation } from '@/lib/india-aid-locations';

// ─── Custom pin icons ──────────────────────────────────────────────────────
const makeIcon = (color: string, emoji: string) =>
    L.divIcon({
        html: `
      <div style="position:relative;width:32px;height:40px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
        <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10.667 16 24 16 24S32 26.667 32 16C32 7.163 24.837 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="16" r="9" fill="white" opacity="0.95"/>
        </svg>
        <div style="position:absolute;top:7px;left:0;width:32px;text-align:center;font-size:13px;line-height:1;pointer-events:none">${emoji}</div>
      </div>`,
        className: '',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -42],
    });

const ICONS: Record<string, L.DivIcon> = {};
// Build icons lazily (only on client)
function getIcon(type: string): L.DivIcon {
    if (!ICONS[type]) {
        ICONS[type] = makeIcon(
            TYPE_COLORS[type as keyof typeof TYPE_COLORS],
            TYPE_EMOJIS[type as keyof typeof TYPE_EMOJIS],
        );
    }
    return ICONS[type];
}

// ─── Pop-up HTML builder ───────────────────────────────────────────────────
function buildPopup(loc: AidLocation): string {
    const color = TYPE_COLORS[loc.type];
    const linksHtml = [
        loc.phone ? `<a href="tel:${loc.phone}" style="font-size:11px;color:#2563eb;text-decoration:none">📞 ${loc.phone}</a>` : '',
        loc.website ? `<a href="${loc.website}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#2563eb;text-decoration:none">🌐 Website →</a>` : '',
    ].filter(Boolean).join(' ');

    // The directions button calls openDirections() which is set on window below.
    // We embed lat/lng as data attributes to pass them to the click handler.
    const directionsBtn = `
    <button
      data-lat="${loc.lat}"
      data-lng="${loc.lng}"
      data-name="${loc.name.replace(/"/g, '&quot;')}"
      onclick="window.__openFoodAidDirections(this)"
      style="
        display:flex; align-items:center; gap:6px;
        margin-top:10px; padding:7px 14px;
        background:#1a73e8; color:white;
        border:none; border-radius:8px;
        font-size:12px; font-weight:600;
        cursor:pointer; width:100%;
        justify-content:center;
        box-shadow:0 2px 6px rgba(26,115,232,0.35);
        transition:background 0.2s;
      "
      onmouseover="this.style.background='#1557b0'"
      onmouseout="this.style.background='#1a73e8'"
    >
      🗺️ Get Directions (Live Location)
    </button>`;

    return `
    <div style="font-family:system-ui,sans-serif;min-width:220px;max-width:280px">
      <div style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;
                  background:${color}20;color:${color};font-size:11px;font-weight:600;margin-bottom:6px;
                  border:1px solid ${color}40">
        ${TYPE_EMOJIS[loc.type]} ${TYPE_LABELS[loc.type]}
      </div>
      <div style="font-weight:700;font-size:14px;line-height:1.3;margin-bottom:4px">${loc.name}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:6px">📍 ${loc.city}, ${loc.state}</div>
      <div style="font-size:12px;color:#374151;line-height:1.5;margin-bottom:8px">${loc.description}</div>
      ${loc.address ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:4px">🏠 ${loc.address}</div>` : ''}
      ${linksHtml ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${linksHtml}</div>` : ''}
      ${directionsBtn}
    </div>`;
}

// Extend the Window interface to include our custom function
declare global {
    interface Window {
        __openFoodAidDirections?: (buttonElement: HTMLButtonElement) => void;
    }
}

// ─── Component ─────────────────────────────────────────────────────────────
interface LeafletFoodAidMapProps {
    locations: AidLocation[];
    onSelectLocation: (loc: AidLocation | null) => void;
    selectedLocation: AidLocation | null;
}

export default function LeafletFoodAidMap({ locations, onSelectLocation }: LeafletFoodAidMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // ── Initialize map exactly once ──────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [22.5, 82.3],
            zoom: 5,
            scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapRef.current = map;

        // ── Register global directions handler ──────────────────────────────
        // Called by the inline onclick in popup HTML.
        // Reads destination from button data-attributes, gets live GPS, opens Google Maps.
        window.__openFoodAidDirections = (btn: HTMLButtonElement) => {
            const destLat = btn.getAttribute('data-lat');
            const destLng = btn.getAttribute('data-lng');
            const destName = btn.getAttribute('data-name') || 'Destination';
            if (!destLat || !destLng) return;

            // Show loading state
            const original = btn.innerHTML;
            btn.innerHTML = '⏳ Getting your location…';
            btn.disabled = true;

            const openGoogleMaps = (originLat?: number, originLng?: number) => {
                let url: string;
                if (originLat != null && originLng != null) {
                    // Full turn-by-turn with exact current location as origin
                    url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
                } else {
                    // Fallback: Google Maps will use device location itself
                    url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
                }
                window.open(url, '_blank', 'noopener,noreferrer');
                btn.innerHTML = original;
                btn.disabled = false;
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => openGoogleMaps(pos.coords.latitude, pos.coords.longitude),
                    () => openGoogleMaps(), // permission denied — use fallback
                    { timeout: 6000, enableHighAccuracy: true }
                );
            } else {
                openGoogleMaps(); // geolocation not supported
            }
        };

        // Cleanup: destroy map on unmount (handles React 18 Strict Mode double-mount)
        return () => {
            map.remove();
            mapRef.current = null;
            delete window.__openFoodAidDirections;
        };
    }, []); // empty deps — runs once on mount

    // ── Sync markers whenever `locations` changes ────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add new markers
        const added = locations.map(loc => {
            const marker = L.marker([loc.lat, loc.lng], { icon: getIcon(loc.type) })
                .addTo(map)
                .bindPopup(buildPopup(loc), { maxWidth: 300 });
            marker.on('click', () => onSelectLocation(loc));
            return marker;
        });

        markersRef.current = added;

        // Fit map to visible markers
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng] as [number, number]));
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
        }
    }, [locations, onSelectLocation]);

    return (
        <div
            ref={containerRef}
            style={{ height: '100%', width: '100%', minHeight: 400 }}
        />
    );
}
