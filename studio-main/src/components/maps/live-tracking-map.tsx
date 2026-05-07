
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Custom icons ──────────────────────────────────────────────────────────
const donorIcon = L.divIcon({
    html: `<div style="background:#64748b;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

const deliveryPartnerIcon = L.divIcon({
    html: `
    <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:100%;height:100%;background:rgba(249,115,22,0.2);border-radius:50%;animation:pulse 2s infinite;"></div>
        <div style="background:#f97316;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.2);z-index:2;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M21 16c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2v-1H8v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-1c0-1.1.9-2 2-2h1V9c0-1.1.9-2 2-2h6.58l-1.58-1.58L12.42 4 16 7.58 12.42 11.17l-1.42-1.42L12.58 8H8c-1.1 0-2 .9-2 2v3h11v-1c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1z"/>
            </svg>
        </div>
        <style>
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(1.8); opacity: 0; }
            }
        </style>
    </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const ngoIcon = L.divIcon({
    html: `<div style="background:#f97316;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(249,115,22,0.5)"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

export default function LiveTrackingMap({ currentStatus }: { currentStatus: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const partnerMarkerRef = useRef<L.Marker | null>(null);

    // Mock locations: Lucknow (as an example)
    const donorPos: [number, number] = [26.8467, 80.9462];
    const receiverPos: [number, number] = [26.8597, 80.9592];

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [26.8532, 80.9527],
            zoom: 14,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            className: 'map-tiles-grayscale' 
        }).addTo(map);

        // Add Pickup point
        L.marker(donorPos, { icon: donorIcon }).addTo(map)
            .bindTooltip("Pickup", { permanent: true, direction: 'top', className: 'map-tooltip' });

        // Add Delivery point
        L.marker(receiverPos, { icon: ngoIcon }).addTo(map)
            .bindTooltip("Dropoff", { permanent: true, direction: 'top', className: 'map-tooltip' });

        // Draw Route line
        L.polyline([donorPos, receiverPos], {
            color: '#f97316',
            weight: 3,
            opacity: 0.4,
            dashArray: '5, 10'
        }).addTo(map);

        // Add Delivery Partner
        const partnerMarker = L.marker(donorPos, { icon: deliveryPartnerIcon }).addTo(map);
        partnerMarkerRef.current = partnerMarker;

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Animate marker based on status
    useEffect(() => {
        if (!partnerMarkerRef.current || !mapRef.current) return;

        let targetT = 0;
        if (currentStatus === 'PENDING' || currentStatus === 'REACHED_PICKUP') {
            targetT = 0.0;
        } else if (currentStatus === 'PICKED_UP') {
            targetT = 0.1;
        } else if (currentStatus === 'ON_THE_WAY') {
            targetT = 0.6;
        } else if (currentStatus === 'NEAR_DESTINATION') {
            targetT = 0.95;
        } else if (currentStatus === 'DELIVERED') {
            targetT = 1.0;
        }

        // We'll simulate a smooth pan to the targetT
        // For a real app, this would use actual GPS coordinates from Supabase
        const currentLatLng = partnerMarkerRef.current.getLatLng();
        
        const targetLat = donorPos[0] + (receiverPos[0] - donorPos[0]) * targetT;
        const targetLng = donorPos[1] + (receiverPos[1] - donorPos[1]) * targetT;

        const startLat = currentLatLng.lat;
        const startLng = currentLatLng.lng;

        let frame = 0;
        const frames = 60; // 1 second animation at 60fps

        const animate = () => {
            frame++;
            const t = frame / frames;
            
            // Ease out quad
            const easeT = t * (2 - t);

            const lat = startLat + (targetLat - startLat) * easeT;
            const lng = startLng + (targetLng - startLng) * easeT;

            partnerMarkerRef.current?.setLatLng([lat, lng]);

            if (frame < frames) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);

    }, [currentStatus]);

    return (
        <>
            <div ref={containerRef} className="h-full w-full" />
            <style jsx global>{`
                .map-tiles-grayscale {
                    filter: grayscale(1) invert(0) brightness(1.2) contrast(0.8);
                }
                .map-tooltip {
                    background: white !important;
                    border: none !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                    border-radius: 8px !important;
                    font-weight: 800 !important;
                    font-size: 10px !important;
                    padding: 4px 8px !important;
                    color: black !important;
                }
                .leaflet-tooltip-top:before {
                    border-top-color: white !important;
                }
            `}</style>
        </>
    );
}
