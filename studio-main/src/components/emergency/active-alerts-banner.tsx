'use client';

import { useEmergencyAlerts, EmergencyAlert } from '@/context/emergency-alerts-context';
import { initializeFirebase } from '@/firebase';
import { ShieldAlert, MapPin, Clock, CheckCircle2, ChevronUp, X, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState, useRef } from 'react';

// ─── Audio Siren ─────────────────────────────────────────────────────────────
function playSiren() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const play = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + start + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + 0.4);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.5);
    };
    play(880, 0);
    play(660, 0.5);
    play(880, 1.0);
  } catch (e) { /* silent */ }
}

// ─── SOS Full‑Screen Overlay ──────────────────────────────────────────────────
function GlobalSOSOverlay({ alert, onClose }: { alert: EmergencyAlert; onClose: () => void }) {
  const [flash, setFlash] = useState(false);
  const { respondToAlert } = useEmergencyAlerts();

  useEffect(() => {
    playSiren();
    const siren = setInterval(playSiren, 1500);
    const flasher = setInterval(() => setFlash(f => !f), 200);
    return () => { clearInterval(siren); clearInterval(flasher); };
  }, []);

  const googleMapsUrl = alert.latitude && alert.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.location)}`;

  const handleAccept = async () => {
    await respondToAlert(alert.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6"
      style={{ background: flash ? '#1a0000' : '#000000' }}
    >
      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 w-full h-0.5 bg-red-500"
          style={{
            boxShadow: '0 0 20px 4px #ff0000',
            animation: 'scanline 2s linear infinite',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.08) 0%, transparent 70%)' }} />
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes radarpulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(3.5); opacity: 0;   }
        }
      `}</style>

      {/* Radar rings */}
      <div className="relative mb-8">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-red-500"
            style={{
              inset: `-${i * 30}px`,
              animation: `radarpulse 2s ease-out ${i * 0.4}s infinite`,
              opacity: 0,
            }}
          />
        ))}
        <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-red-600 to-black flex items-center justify-center border-4 border-white/20 overflow-hidden" style={{ boxShadow: '0 0 80px rgba(255,0,0,0.7)' }}>
          <ShieldAlert className="w-20 h-20 text-white z-10" style={{ animation: 'bounce 0.6s infinite alternate' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/40 to-transparent" style={{ animation: 'spin 2s linear infinite' }} />
        </div>
      </div>

      {/* Text */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-block px-4 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em]" style={{ animation: 'pulse 1s infinite' }}>
          🔴 LIVE EMERGENCY BROADCAST
        </div>
        <h1
          className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic"
          style={{ textShadow: flash ? '0 0 30px #ff0000' : 'none', transition: 'text-shadow 0.1s' }}
        >
          SOS ALERT
        </h1>
        <p className="text-sm font-bold text-red-400 uppercase tracking-widest" style={{ animation: 'pulse 1s infinite' }}>
          Nearby donors are being notified...
        </p>
      </div>

      {/* Alert card */}
      <div className="w-full max-w-lg bg-black/80 border-2 border-red-600 rounded-3xl p-6 mb-8 space-y-4" style={{ boxShadow: '0 0 40px rgba(220,38,38,0.3)' }}>
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-red-500" style={{ animation: 'pulse 1s infinite' }} />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">{alert.priority} Priority</span>
          <span className="text-[10px] font-bold text-muted-foreground">· by {alert.creatorName}</span>
        </div>
        <p className="text-xl text-white font-bold leading-snug">"{alert.description}"</p>
        <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-4 py-3 rounded-2xl">
          <MapPin className="h-5 w-5 text-red-400 flex-shrink-0" />
          <span className="text-sm font-bold text-white">{alert.location}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <button
          onClick={onClose}
          className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition"
        >
          Dismiss
        </button>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/20 transition text-center"
        >
          📍 Directions
        </a>
        <button
          onClick={handleAccept}
          className="flex-1 py-4 rounded-2xl text-white font-black text-lg uppercase tracking-widest transition hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: '0 10px 40px rgba(220,38,38,0.5)' }}
        >
          I'm Coming!
        </button>
      </div>
    </div>
  );
}

// ─── Priority colors ──────────────────────────────────────────────────────────
const P = {
  high:   { bg: 'bg-red-500/10',    border: 'border-red-500/30',   dot: 'bg-red-500',    text: 'text-red-400'    },
  medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/30',dot: 'bg-orange-500', text: 'text-orange-400' },
  low:    { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30',dot: 'bg-yellow-500', text: 'text-yellow-400' },
};

// ─── Individual Alert Card ────────────────────────────────────────────────────
function AlertCard({ alert, canRespond }: { alert: EmergencyAlert & { distance?: number }; canRespond: boolean }) {
  const { respondToAlert, closeAlert } = useEmergencyAlerts();
  const c = P[alert.priority];

  const googleMapsUrl = alert.latitude && alert.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alert.location)}`;

  return (
    <div className={cn('rounded-2xl border p-4 space-y-3 transition-all', c.bg, c.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className={cn('h-2 w-2 rounded-full flex-shrink-0 animate-pulse', c.dot)} />
          <span className={cn('text-xs font-black uppercase tracking-widest', c.text)}>{alert.priority} Priority</span>
          {alert.status === 'accepted' && (
            <span className="text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full">ACCEPTED</span>
          )}
          {(alert as any).distance !== undefined && (
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
              {(alert as any).distance.toFixed(1)} km away
            </span>
          )}
        </div>
        <button onClick={() => closeAlert(alert.id)} className="text-muted-foreground hover:text-white transition flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-foreground leading-relaxed font-medium">{alert.description}</p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
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
            <Navigation className="h-3 w-3" /> Directions
          </a>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
            <span className="text-muted-foreground/60">· by {alert.creatorName}</span>
          </div>
          <a href={`/alerts?role=donor&focus=${alert.id}`} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition">
            View on Map
          </a>
        </div>
      </div>

      {canRespond && alert.status === 'active' && (
        <button
          onClick={() => respondToAlert(alert.id)}
          className="w-full h-9 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary/90 transition flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" /> I Can Help – Respond Now
        </button>
      )}

      {alert.status === 'accepted' && alert.acceptedBy && (
        <div className="flex items-center gap-2 text-xs font-bold text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {alert.acceptedByName || 'A donor'} is responding
        </div>
      )}

      {/* Debug Retry Button */}
      {alert.priority === 'high' && alert.status === 'active' && (
        <button
          onClick={async () => {
            const { firestore } = initializeFirebase();
            const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
            await updateDoc(doc(firestore, 'emergency_alerts', alert.id), {
              lastNotificationSent: serverTimestamp(),
              retryCount: (alert.retryCount || 0) + 1,
            });
          }}
          className="w-full text-[9px] font-black text-red-500 bg-red-500/5 border border-red-500/20 px-2 py-1.5 rounded-xl hover:bg-red-500/20 transition uppercase tracking-widest"
        >
          🔁 Simulate Retry Broadcast
        </button>
      )}
    </div>
  );
}

// ─── Main Banner ──────────────────────────────────────────────────────────────
export function ActiveAlertsBanner({ role }: { role: string }) {
  const { activeAlerts } = useEmergencyAlerts();
  const [expanded, setExpanded] = useState(true);
  const [sosAlert, setSosAlert] = useState<EmergencyAlert | null>(null);
  // Track which alert IDs + lastNotificationSent we've already shown popups for
  const shownRef = useRef<Set<string>>(new Set());

  // ── Trigger SOS popup for any unseen active/high-priority alert ─────────────
  useEffect(() => {
    if (activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      if (alert.priority !== 'high' || alert.status !== 'active') continue;

      // Unique key = id + lastNotificationSent timestamp
      const sentTime = alert.lastNotificationSent
        ? new Date(alert.lastNotificationSent).getTime()
        : new Date(alert.createdAt).getTime();
      const key = `${alert.id}-${sentTime}`;

      if (!shownRef.current.has(key)) {
        shownRef.current.add(key);
        setSosAlert(alert);
        break; // Show one at a time
      }
    }
  }, [activeAlerts]);

  const highCount = activeAlerts.filter(a => a.priority === 'high' && a.status === 'active').length;

  return (
    <>
      {/* SOS fullscreen overlay */}
      {sosAlert && (
        <GlobalSOSOverlay
          alert={sosAlert}
          onClose={() => setSosAlert(null)}
        />
      )}

      {/* Inline banner — show even if 0 alerts so user sees "no alerts" state */}
      {activeAlerts.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 overflow-hidden mb-4">
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-500/10 transition"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span className="text-sm font-black text-red-400 uppercase tracking-wide">
                {activeAlerts.length} Emergency Alert{activeAlerts.length > 1 ? 's' : ''} Active
              </span>
              {highCount > 0 && (
                <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                  {highCount} HIGH
                </span>
              )}
            </div>
            <ChevronUp className={cn('h-4 w-4 text-red-400 transition-transform', !expanded && 'rotate-180')} />
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-3">
              {activeAlerts.slice(0, 5).map(alert => (
                <AlertCard key={alert.id} alert={alert} canRespond={true} />
              ))}
              {activeAlerts.length > 5 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{activeAlerts.length - 5} more — <a href="/alerts" className="text-primary underline">View All</a>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
