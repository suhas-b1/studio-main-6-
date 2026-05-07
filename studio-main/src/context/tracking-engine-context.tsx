'use client';

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { DeliveryTracking, DeliveryStatus } from '@/context/delivery-context';
import { estimateETA, isSaneMovement, haversineKm } from '@/lib/tracking/geo-utils';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LiveDeliveryState extends DeliveryTracking {
  // Smoothed position (interpolated, updated per-frame)
  smoothLat: number;
  smoothLng: number;
  // Realtime ETA
  etaMinutes: number;
  etaLabel: string;
  // Distance remaining to receiver
  distanceRemaining: number;
  // Safety flag
  safetyAlert: string | null;
  // Route polyline points [[lat,lng],...]
  routePoints: [number, number][];
  // Speed (km/h approx)
  speedKmh: number;
}

interface TrackingEngineContextType {
  // Live state per deliveryId
  getLiveState: (deliveryId: string) => LiveDeliveryState | null;
  // Subscribe/unsubscribe to a delivery's real-time updates
  subscribe: (deliveryId: string) => void;
  unsubscribe: (deliveryId: string) => void;
  // Volunteer: push own GPS
  pushLocation: (deliveryId: string, lat: number, lng: number) => Promise<void>;
  // Volunteer: update delivery status
  advanceStatus: (deliveryId: string, status: DeliveryStatus) => Promise<void>;
  // Start background GPS watch
  startGPS: (deliveryId: string) => void;
  stopGPS: (deliveryId: string) => void;
  isGPSActive: (deliveryId: string) => boolean;
}

const TrackingEngineContext = createContext<TrackingEngineContextType | undefined>(undefined);

// ─── Food freshness config ────────────────────────────────────────────────────
// Key = delivery status at which we start the freshness countdown
const FOOD_FRESH_MINUTES: Record<string, number> = {
  picked_up: 90,
  heading_to_receiver: 60,
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function TrackingEngineProvider({ children }: { children: ReactNode }) {
  const { firestore } = initializeFirebase();

  // Map of deliveryId → real Firestore-driven state
  const [states, setStates] = useState<Record<string, LiveDeliveryState>>({});
  const subscriptions = useRef<Record<string, () => void>>({});
  const gpsWatches = useRef<Record<string, number>>({});
  const prevPositions = useRef<Record<string, { lat: number; lng: number; ts: number }>>({});
  const animFrames = useRef<Record<string, number>>({});

  // ── Subscribe to a delivery's Firestore document ───────────────────────────
  const subscribe = useCallback((deliveryId: string) => {
    if (subscriptions.current[deliveryId]) return; // already subscribed

    const deliveryRef = doc(firestore, 'deliveries', deliveryId);
    const unsub = onSnapshot(deliveryRef, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();

      const newLat: number = d.current_lat ?? d.pickup_lat;
      const newLng: number = d.current_lng ?? d.pickup_lng;

      // Sanity check
      const prev = prevPositions.current[deliveryId];
      if (prev) {
        const elapsed = (Date.now() - prev.ts) / 1000;
        if (!isSaneMovement(prev.lat, prev.lng, newLat, newLng, elapsed)) {
          console.warn(`[TrackingEngine] Rejected impossible GPS jump on ${deliveryId}`);
          return;
        }
      }
      prevPositions.current[deliveryId] = { lat: newLat, lng: newLng, ts: Date.now() };

      // ETA
      const { minutes: etaMins, label: etaLabel } = estimateETA(
        newLat, newLng,
        d.dest_lat, d.dest_lng
      );

      // Safety check
      const freshMins = FOOD_FRESH_MINUTES[d.status] ?? null;
      const safetyAlert =
        freshMins !== null && etaMins > freshMins
          ? `⚠️ ETA (${etaMins}m) exceeds food freshness (${freshMins}m)! Please speed up or alert receiver.`
          : null;

      // Speed estimate
      let speedKmh = 0;
      if (prev) {
        const dist = haversineKm(prev.lat, prev.lng, newLat, newLng);
        const hrs = (Date.now() - prev.ts) / 3_600_000;
        speedKmh = hrs > 0 ? Math.round(dist / hrs) : 0;
      }

      const distanceRemaining = haversineKm(newLat, newLng, d.dest_lat, d.dest_lng);

      const delivery: DeliveryTracking = {
        id: snap.id,
        donationId: d.donation_id,
        volunteerId: d.volunteer_id,
        volunteerName: d.volunteer_name,
        receiverId: d.receiver_id,
        status: d.status,
        currentLat: newLat,
        currentLng: newLng,
        pickupLat: d.pickup_lat,
        pickupLng: d.pickup_lng,
        destLat: d.dest_lat,
        destLng: d.dest_lng,
        eta: etaLabel,
        polyline: d.polyline,
        lastLocationUpdate: d.last_location_update?.toDate(),
        startedAt: d.started_at?.toDate() ?? new Date(),
      };

      setStates(prev => {
        const current = prev[deliveryId];
        return {
          ...prev,
          [deliveryId]: {
            ...delivery,
            // Start smooth pos from previous if exists, else jump to current
            smoothLat: current?.smoothLat ?? newLat,
            smoothLng: current?.smoothLng ?? newLng,
            etaMinutes: etaMins,
            etaLabel,
            distanceRemaining,
            safetyAlert,
            routePoints: current?.routePoints ?? [],
            speedKmh,
          },
        };
      });

      // Animate marker smoothly to new position
      animateMarker(deliveryId, newLat, newLng);
    });

    subscriptions.current[deliveryId] = unsub;
  }, [firestore]);

  const unsubscribe = useCallback((deliveryId: string) => {
    subscriptions.current[deliveryId]?.();
    delete subscriptions.current[deliveryId];
    if (animFrames.current[deliveryId]) cancelAnimationFrame(animFrames.current[deliveryId]);
  }, []);

  // ── Smooth marker interpolation (rAF loop) ────────────────────────────────
  function animateMarker(deliveryId: string, targetLat: number, targetLng: number) {
    if (animFrames.current[deliveryId]) cancelAnimationFrame(animFrames.current[deliveryId]);
    const duration = 2500; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      setStates(prev => {
        const s = prev[deliveryId];
        if (!s) return prev;
        const smoothLat = s.smoothLat + (targetLat - s.smoothLat) * eased;
        const smoothLng = s.smoothLng + (targetLng - s.smoothLng) * eased;
        if (Math.abs(smoothLat - s.smoothLat) < 1e-9 && Math.abs(smoothLng - s.smoothLng) < 1e-9) return prev;
        return { ...prev, [deliveryId]: { ...s, smoothLat, smoothLng } };
      });

      if (t < 1) animFrames.current[deliveryId] = requestAnimationFrame(step);
    };
    animFrames.current[deliveryId] = requestAnimationFrame(step);
  }

  // ── Push volunteer GPS ─────────────────────────────────────────────────────
  const pushLocation = useCallback(async (deliveryId: string, lat: number, lng: number) => {
    const { minutes, label } = estimateETA(lat, lng,
      states[deliveryId]?.destLat ?? 0,
      states[deliveryId]?.destLng ?? 0
    );
    const deliveryRef = doc(firestore, 'deliveries', deliveryId);
    await updateDoc(deliveryRef, {
      current_lat: lat,
      current_lng: lng,
      eta: label,
      last_location_update: serverTimestamp(),
    });
  }, [firestore, states]);

  // ── Advance delivery status ────────────────────────────────────────────────
  const advanceStatus = useCallback(async (deliveryId: string, status: DeliveryStatus) => {
    const deliveryRef = doc(firestore, 'deliveries', deliveryId);
    const extra: any = {};
    if (status === 'delivered') extra.completed_at = serverTimestamp();
    await updateDoc(deliveryRef, { status, ...extra });
  }, [firestore]);

  // ── Background GPS watchPosition ───────────────────────────────────────────
  const startGPS = useCallback((deliveryId: string) => {
    if (gpsWatches.current[deliveryId]) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => pushLocation(deliveryId, coords.latitude, coords.longitude),
      (err) => console.warn('[GPS]', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 }
    );
    gpsWatches.current[deliveryId] = watchId;
  }, [pushLocation]);

  const stopGPS = useCallback((deliveryId: string) => {
    const id = gpsWatches.current[deliveryId];
    if (id) {
      navigator.geolocation.clearWatch(id);
      delete gpsWatches.current[deliveryId];
    }
  }, []);

  const isGPSActive = useCallback((deliveryId: string) => !!gpsWatches.current[deliveryId], []);

  const getLiveState = useCallback((deliveryId: string) => states[deliveryId] ?? null, [states]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(subscriptions.current).forEach(u => u());
      Object.values(gpsWatches.current).forEach(id => navigator.geolocation?.clearWatch(id));
      Object.values(animFrames.current).forEach(id => cancelAnimationFrame(id));
    };
  }, []);

  return (
    <TrackingEngineContext.Provider value={{
      getLiveState, subscribe, unsubscribe,
      pushLocation, advanceStatus,
      startGPS, stopGPS, isGPSActive,
    }}>
      {children}
    </TrackingEngineContext.Provider>
  );
}

export function useTrackingEngine() {
  const ctx = useContext(TrackingEngineContext);
  if (!ctx) throw new Error('useTrackingEngine must be inside TrackingEngineProvider');
  return ctx;
}
