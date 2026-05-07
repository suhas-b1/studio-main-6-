'use client';

import { useState, useRef, useCallback } from 'react';
import { AlertTriangle, Mic, MicOff, MapPin, X, Loader2, Send, ShieldAlert } from 'lucide-react';
import { useEmergencyAlerts, AlertPriority } from '@/context/emergency-alerts-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmergencyAlertDialogProps {
  open: boolean;
  onClose: () => void;
}

const PRIORITY_CONFIG = {
  high: {
    label: 'HIGH',
    description: 'Immediate life risk. Critical hunger emergency.',
    color: 'border-red-500 bg-red-500/10 text-red-400',
    activeBg: 'bg-red-500 text-white border-red-500',
    dot: 'bg-red-500',
  },
  medium: {
    label: 'MEDIUM',
    description: 'Urgent need but not immediately life-threatening.',
    color: 'border-orange-500 bg-orange-500/10 text-orange-400',
    activeBg: 'bg-orange-500 text-white border-orange-500',
    dot: 'bg-orange-500',
  },
  low: {
    label: 'LOW',
    description: 'Food shortage, need within a few hours.',
    color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    activeBg: 'bg-yellow-500 text-black border-yellow-500',
    dot: 'bg-yellow-500',
  },
};

export function EmergencyAlertDialog({ open, onClose }: EmergencyAlertDialogProps) {
  const { createAlert } = useEmergencyAlerts();
  const { toast } = useToast();

  const [priority, setPriority] = useState<AlertPriority>('high');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const handleLocate = useCallback(async () => {
    setIsLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      setLatitude(lat);
      setLongitude(lng);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setLocation(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch {
      toast({ variant: 'destructive', title: 'Location failed', description: 'Please type your location manually.' });
    } finally {
      setIsLocating(false);
    }
  }, [toast]);

  const toggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Voice not supported', description: 'Please type your alert description instead.' });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setVoiceTranscript(transcript);
      setDescription(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({ variant: 'destructive', title: 'Voice error', description: 'Could not capture voice. Please try again.' });
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  }, [isListening, toast]);

  const handleSubmit = async () => {
    if (!location.trim()) {
      toast({ variant: 'destructive', title: 'Location required', description: 'Please provide your location.' });
      return;
    }
    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Description required', description: 'Briefly describe the emergency.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createAlert({ priority, description, location, latitude, longitude, voiceTranscript });
      toast({
        title: '🚨 Alert Sent!',
        description: 'Nearby NGOs & volunteers have been notified. Help is on the way.',
      });
      onClose();
      setDescription('');
      setLocation('');
      setVoiceTranscript('');
    } catch (err: any) {
      if (err.message?.startsWith('RATE_LIMIT')) {
        toast({ variant: 'destructive', title: 'Too many alerts', description: 'You can submit at most 3 alerts per hour.' });
      } else if (err.message?.startsWith('DUPLICATE')) {
        toast({ variant: 'destructive', title: 'Duplicate alert', description: 'An alert from this location was already submitted recently.' });
      } else {
        toast({ variant: 'destructive', title: 'Failed to send alert', description: 'Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-[#100700] border border-red-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-900/60 to-red-800/40 px-6 pt-6 pb-5 border-b border-red-500/20">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center animate-pulse">
              <ShieldAlert className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Emergency Alert</h2>
              <p className="text-xs text-red-300/80">NGOs & volunteers will be notified immediately</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Priority Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Alert Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PRIORITY_CONFIG) as [AlertPriority, typeof PRIORITY_CONFIG.high][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className={cn(
                    'relative px-3 py-3 rounded-2xl border text-center transition-all duration-200',
                    priority === key ? cfg.activeBg : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  )}
                >
                  <div className={cn('h-2 w-2 rounded-full mx-auto mb-1.5', priority === key ? 'bg-white' : cfg.dot)} />
                  <p className="text-xs font-black">{cfg.label}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground px-1">{PRIORITY_CONFIG[priority].description}</p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Location *</label>
            <div className="flex gap-2">
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter your address or area..."
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
              />
              <button
                type="button"
                onClick={handleLocate}
                disabled={isLocating}
                className="px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
              >
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Description + Voice */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Describe the Emergency *</label>
              <button
                type="button"
                onClick={toggleVoice}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition',
                  isListening
                    ? 'bg-red-500 text-white border-red-500 animate-pulse'
                    : 'bg-card border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400'
                )}
              >
                {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                {isListening ? 'Stop' : 'Voice'}
              </button>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g., Family of 5 with no food since 2 days, children present..."
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 transition resize-none"
            />
            {voiceTranscript && (
              <p className="text-[11px] text-muted-foreground px-1">
                🎤 Voice captured: <span className="text-primary">{voiceTranscript.slice(0, 80)}...</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', boxShadow: '0 8px 30px -5px rgba(220,38,38,0.5)' }}
          >
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Sending Alert...</>
            ) : (
              <><Send className="h-5 w-5" /> Send Emergency Alert</>
            )}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            ⚠️ False alerts are tracked and may result in account suspension.
          </p>
        </div>
      </div>
    </div>
  );
}
