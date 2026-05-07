'use client';

import { useEmergencyAlerts, EmergencyAlert } from '@/context/emergency-alerts-context';
import { useUser } from '@/firebase';
import { ShieldAlert, MapPin, Clock, CheckCircle2, ChevronUp, X, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { calculateDistance } from '@/lib/distance';
import { useEffect, useState, useRef } from 'react';

// Simple Web Audio API Siren
function playSiren() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.8);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.7);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn("Audio playback failed", e);
  }
}

function GlobalSOSOverlay({ alert, onClose }: { alert: EmergencyAlert, onClose: () => void }) {
  useEffect(() => {
    playSiren();
    const interval = setInterval(playSiren, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-red-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="text-center space-y-6 p-6 max-w-lg w-full animate-in zoom-in-95 duration-500">
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75" />
          <div className="relative flex items-center justify-center w-full h-full bg-red-600 rounded-full shadow-[0_0_60px_rgba(220,38,38,0.8)]">
            <ShieldAlert className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-widest drop-shadow-2xl">
          SOS ALERT
        </h1>
        
        <div className="bg-black/40 p-6 rounded-3xl border border-red-500/30 backdrop-blur-xl">
          <p className="text-lg md:text-xl text-white font-medium leading-relaxed mb-4">
            {alert.description}
          </p>
          <div className="flex items-center justify-center gap-2 text-red-200 bg-red-900/40 py-2 px-4 rounded-xl inline-flex mx-auto">
            <MapPin className="h-5 w-5" />
            <span className="font-bold">{alert.location}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={onClose} 
            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition"
          >
            Dismiss
          </button>
          <a 
            href={`/alerts?role=donor&focus=${alert.id}`} 
            className="px-8 py-4 rounded-2xl bg-red-600 text-white font-black text-lg hover:bg-red-500 hover:scale-105 transition-all shadow-[0_0_40px_rgba(220,38,38,0.4)]"
          >
            Show Details & Map
          </a>
        </div>
      </div>
    </div>
  );
}

const PRIORITY_COLORS = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500 text-white', dot: 'bg-red-500', text: 'text-red-400' },
  medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500 text-white', dot: 'bg-orange-500', text: 'text-orange-400' },
  low: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-black', dot: 'bg-yellow-500', text: 'text-yellow-400' },
};

function AlertCard({ alert, canRespond, distance }: { alert: EmergencyAlert; canRespond: boolean; distance?: number }) {
  const { respondToAlert, closeAlert } = useEmergencyAlerts();
  const { user } = useUser();
  const colors = PRIORITY_COLORS[alert.priority];

  const googleMapsUrl = alert.latitude && alert.longitude 
    ? `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.location)}`;

  return (
    <div className={cn('rounded-2xl border p-4 space-y-3 transition-all', colors.bg, colors.border)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0 animate-pulse', colors.dot)} />
          <span className={cn('text-xs font-black uppercase tracking-widest', colors.text)}>
            {alert.priority} Priority
          </span>
          {alert.status === 'escalated' && (
            <span className="text-[10px] font-bold bg-red-900/40 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded-full animate-pulse">
              ESCALATED
            </span>
          )}
          {distance !== undefined && (
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
              {distance.toFixed(1)} km away
            </span>
          )}
        </div>
        <button onClick={() => closeAlert(alert.id)} className="text-muted-foreground hover:text-foreground transition flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground leading-relaxed">{alert.description}</p>

      {/* Location & Time */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between group/loc">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <span className="truncate font-medium text-foreground/80">{alert.location}</span>
          </div>
          <a 
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline ml-2 flex-shrink-0 bg-primary/10 px-2 py-1 rounded-lg"
          >
            <Navigation className="h-3 w-3" />
            Directions
          </a>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
            <span className="text-muted-foreground/60">• by {alert.creatorName}</span>
          </div>
          <a 
            href={`/alerts?role=${user?.uid === alert.creatorId ? 'donor' : 'ngo'}&focus=${alert.id}`}
            className="text-[10px] font-bold text-muted-foreground hover:text-primary transition"
          >
            View on Map
          </a>
        </div>
      </div>

      {/* Action buttons */}
      {canRespond && alert.status !== 'responded' && alert.responderId !== user?.uid && (
        <button
          onClick={() => respondToAlert(alert.id)}
          className="w-full h-9 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 transition flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" />
          I Can Help – Respond Now
        </button>
      )}
      {alert.responderId === user?.uid && (
        <div className="flex items-center gap-2 text-xs font-bold text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          You are responding to this alert
        </div>
      )}
    </div>
  );
}

export function ActiveAlertsBanner({ role }: { role: string }) {
  const { activeAlerts } = useEmergencyAlerts();
  const [expanded, setExpanded] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sosAlert, setSosAlert] = useState<EmergencyAlert | null>(null);
  const seenAlertsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Location permission denied for radius filtering')
      );
    }
  }, []);

  const isNgoOrVolunteer = role === 'ngo';
  
  // Filtering logic: Donors only see alerts within 5km. NGOs see everything.
  const filteredAlerts = activeAlerts.map(alert => {
    let distance: number | undefined;
    if (userCoords && alert.latitude && alert.longitude) {
      distance = calculateDistance(userCoords.lat, userCoords.lng, alert.latitude, alert.longitude);
    }
    return { ...alert, distance };
  }).filter(alert => {
    if (isNgoOrVolunteer) return true; // NGOs see all
    if (alert.distance === undefined) return true; // Show if distance unknown (fallback)
    return alert.distance <= 5; // Donors only see within 5km
  });

  // Check for new high-priority alerts to trigger the SOS Overlay
  useEffect(() => {
    if (filteredAlerts.length === 0) return;
    
    const newHighPriority = filteredAlerts.find(alert => {
      // Must be high priority
      if (alert.priority !== 'high') return false;
      // Must be relatively new (created in the last 2 minutes)
      const isNew = (Date.now() - new Date(alert.createdAt).getTime()) < 2 * 60 * 1000;
      // Must not have been seen in this session
      const notSeen = !seenAlertsRef.current.has(alert.id);
      return isNew && notSeen;
    });

    if (newHighPriority) {
      seenAlertsRef.current.add(newHighPriority.id);
      setSosAlert(newHighPriority);
    }

    // Mark all current alerts as seen so we don't trigger them later
    filteredAlerts.forEach(a => seenAlertsRef.current.add(a.id));
  }, [filteredAlerts]);

  const highAlertsCount = filteredAlerts.filter(a => a.priority === 'high').length;

  if (filteredAlerts.length === 0) return null;

  return (
    <>
      {sosAlert && <GlobalSOSOverlay alert={sosAlert} onClose={() => setSosAlert(null)} />}
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 overflow-hidden mb-4 animate-in fade-in slide-in-from-top-2">
      {/* Banner header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-500/10 transition"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <span className="text-sm font-black text-red-400 uppercase tracking-wide">
            {filteredAlerts.length} Emergency Alert{filteredAlerts.length > 1 ? 's' : ''} Nearby
          </span>
          {highAlertsCount > 0 && (
            <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {highAlertsCount} HIGH
            </span>
          )}
        </div>
        <ChevronUp className={cn('h-4 w-4 text-red-400 transition-transform', !expanded && 'rotate-180')} />
      </button>

      {/* Alert list */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {filteredAlerts.slice(0, 5).map(alert => (
            <AlertCard key={alert.id} alert={alert} canRespond={isNgoOrVolunteer} distance={alert.distance} />
          ))}
          {filteredAlerts.length > 5 && (
            <p className="text-xs text-center text-muted-foreground">
              +{filteredAlerts.length - 5} more alerts — <a href="/alerts" className="text-primary underline">View All</a>
            </p>
          )}
        </div>
      )}
    </div>
    </>
  );
}
