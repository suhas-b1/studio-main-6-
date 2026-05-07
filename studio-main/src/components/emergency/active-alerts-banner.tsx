'use client';

import { useEmergencyAlerts, EmergencyAlert } from '@/context/emergency-alerts-context';
import { useUser } from '@/firebase';
import { ShieldAlert, MapPin, Clock, CheckCircle2, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const PRIORITY_COLORS = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500 text-white', dot: 'bg-red-500', text: 'text-red-400' },
  medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500 text-white', dot: 'bg-orange-500', text: 'text-orange-400' },
  low: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-black', dot: 'bg-yellow-500', text: 'text-yellow-400' },
};

function AlertCard({ alert, canRespond }: { alert: EmergencyAlert; canRespond: boolean }) {
  const { respondToAlert, closeAlert } = useEmergencyAlerts();
  const { user } = useUser();
  const colors = PRIORITY_COLORS[alert.priority];

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
          {alert.status === 'responded' && (
            <span className="text-[10px] font-bold bg-green-900/40 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded-full">
              HELP COMING
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
          {alert.latitude && alert.longitude && (
            <a 
              href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-primary hover:underline ml-2 flex-shrink-0"
            >
              Navigate
            </a>
          )}
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

  const highAlerts = activeAlerts.filter(a => a.priority === 'high');
  const isNgoOrVolunteer = role === 'ngo';

  if (activeAlerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 overflow-hidden mb-4">
      {/* Banner header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-500/10 transition"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <span className="text-sm font-black text-red-400 uppercase tracking-wide">
            {activeAlerts.length} Active Emergency Alert{activeAlerts.length > 1 ? 's' : ''}
          </span>
          {highAlerts.length > 0 && (
            <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {highAlerts.length} HIGH
            </span>
          )}
        </div>
        <ChevronUp className={cn('h-4 w-4 text-red-400 transition-transform', !expanded && 'rotate-180')} />
      </button>

      {/* Alert list */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {activeAlerts.slice(0, 5).map(alert => (
            <AlertCard key={alert.id} alert={alert} canRespond={isNgoOrVolunteer} />
          ))}
          {activeAlerts.length > 5 && (
            <p className="text-xs text-center text-muted-foreground">
              +{activeAlerts.length - 5} more alerts — <a href="/alerts" className="text-primary underline">View All</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
