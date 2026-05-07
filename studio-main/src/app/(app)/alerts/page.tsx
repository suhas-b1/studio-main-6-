'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, MapPin, Clock, Filter, RefreshCw } from 'lucide-react';
import { useEmergencyAlerts, AlertPriority, EmergencyAlert } from '@/context/emergency-alerts-context';
import { EmergencyButton } from '@/components/emergency/emergency-button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const AlertsMap = dynamic(() => import('@/components/emergency/alerts-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground text-sm">
      Loading Map...
    </div>
  ),
});

const PRIORITY_COLORS = {
  high: { dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'High' },
  medium: { dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', label: 'Medium' },
  low: { dot: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', label: 'Low' },
};

export default function AlertsPage() {
  const { activeAlerts, respondToAlert, closeAlert, isLoading } = useEmergencyAlerts();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'donor';
  const [filter, setFilter] = useState<AlertPriority | 'all'>('all');

  const filtered = filter === 'all' ? activeAlerts : activeAlerts.filter(a => a.priority === filter);
  const focusId = searchParams.get('focus');

  // If a specific alert is focused, ensure it's in the filtered list
  const displayAlerts = focusId && !filtered.find(a => a.id === focusId)
    ? ([activeAlerts.find(a => a.id === focusId), ...filtered].filter(Boolean) as EmergencyAlert[])
    : filtered;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">

      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            Emergency Alerts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeAlerts.length} active • Real-time updates
          </p>
        </div>
        <EmergencyButton variant="inline" />
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2 px-4 pb-3 flex-shrink-0 overflow-x-auto scrollbar-hide">
        {(['all', 'high', 'medium', 'low'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition',
              filter === f
                ? 'bg-primary text-black border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            )}
          >
            {f === 'all' ? `All (${activeAlerts.length})` : (
              <span className="flex items-center gap-1.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_COLORS[f].dot)} />
                {PRIORITY_COLORS[f].label}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Layout: Map + List */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0">

        {/* Map */}
        <div className="relative h-64 lg:h-full mx-4 mb-4 lg:m-4 rounded-2xl overflow-hidden border border-border">
          <AlertsMap />
          {activeAlerts.filter(a => a.latitude).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/80 backdrop-blur-sm rounded-xl px-4 py-2 text-xs text-muted-foreground">
                No geo-located alerts yet
              </div>
            </div>
          )}
        </div>

        {/* Alert List */}
        <div className="overflow-y-auto px-4 pb-24 lg:pb-4 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading alerts...</span>
            </div>
          )}

          {!isLoading && displayAlerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-bold text-foreground">No Active Alerts</h3>
              <p className="text-sm text-muted-foreground mt-1">Everything looks good right now.</p>
            </div>
          )}

          {displayAlerts.map(alert => {
            const colors = PRIORITY_COLORS[alert.priority];
            const isFocused = alert.id === focusId;
            return (
              <div
                key={alert.id}
                id={`alert-${alert.id}`}
                className={cn(
                  'rounded-2xl border p-4 space-y-3 transition-all', 
                  colors.badge,
                  isFocused && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] shadow-xl z-10'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0 animate-pulse', colors.dot)} />
                    <span className="text-xs font-black uppercase tracking-widest">{colors.label} Priority</span>
                    {alert.status === 'escalated' && (
                      <span className="text-[10px] font-bold bg-red-900/40 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                        ESCALATED
                      </span>
                    )}
                    {alert.status === 'responded' && (
                      <span className="text-[10px] font-bold bg-green-900/40 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded-full">
                        RESPONDING
                      </span>
                    )}
                  </div>
                  <button onClick={() => closeAlert(alert.id)} className="text-muted-foreground/50 hover:text-muted-foreground transition text-xs">
                    ✕
                  </button>
                </div>

                <p className="text-sm text-foreground leading-relaxed">{alert.description}</p>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                    <span>• {alert.creatorName}</span>
                  </div>
                </div>

                {role === 'ngo' && alert.status !== 'responded' && (
                  <button
                    onClick={() => respondToAlert(alert.id)}
                    className="w-full h-9 rounded-xl text-xs font-black bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition flex items-center justify-center gap-1.5"
                  >
                    ✅ Respond — I Can Help
                  </button>
                )}
              </div>
            );
          })}
          
          {/* Scroll to focus effect */}
          {focusId && (
            <script dangerouslySetInnerHTML={{ __html: `
              setTimeout(() => {
                const el = document.getElementById('alert-${focusId}');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 500);
            `}} />
          )}
        </div>
      </div>

      {/* Floating SOS button for mobile */}
      <EmergencyButton variant="fab" />
    </div>
  );
}
