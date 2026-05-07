'use client';

import { useEmergencyAlerts, EmergencyAlert } from '@/context/emergency-alerts-context';
import { useUser } from '@/firebase';
import { ShieldAlert, MapPin, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function AlertHistoryPage() {
  const { alerts, isLoading } = useEmergencyAlerts();
  const { user } = useUser();

  const myAcceptedAlerts = alerts.filter(a => a.acceptedBy === user?.uid);
  const myCreatedAlerts = alerts.filter(a => a.creatorId === user?.uid);
  const expiredAlerts = alerts.filter(a => a.status === 'expired' && a.creatorId === user?.uid);

  if (isLoading) return <div className="p-8 text-center">Loading alert history...</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Alert History</h1>
        <p className="text-muted-foreground italic">Track your emergency responses and rescue impact.</p>
      </header>

      {/* Section: Alerts I Accepted */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Successful Rescues</h2>
        </div>
        
        <div className="grid gap-4">
          {myAcceptedAlerts.map(alert => (
            <AlertHistoryCard key={alert.id} alert={alert} type="accepted" />
          ))}
          {myAcceptedAlerts.length === 0 && (
            <p className="text-sm text-muted-foreground bg-white/5 p-8 rounded-3xl border border-dashed border-white/10 text-center">
              You haven't accepted any alerts yet.
            </p>
          )}
        </div>
      </section>

      {/* Section: Alerts I Created */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-red-500/20 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">My Emergency Reports</h2>
        </div>
        
        <div className="grid gap-4">
          {myCreatedAlerts.map(alert => (
            <AlertHistoryCard key={alert.id} alert={alert} type="created" />
          ))}
          {myCreatedAlerts.length === 0 && (
            <p className="text-sm text-muted-foreground bg-white/5 p-8 rounded-3xl border border-dashed border-white/10 text-center">
              You haven't created any alerts yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function AlertHistoryCard({ alert, type }: { alert: EmergencyAlert, type: 'accepted' | 'created' }) {
  const statusColors = {
    active: 'bg-red-500/20 text-red-400 border-red-500/30',
    accepted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    expired: 'bg-white/5 text-muted-foreground border-white/10',
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className={cn('text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border', statusColors[alert.status])}>
              {alert.status}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {alert.priority} Priority
            </span>
          </div>
          
          <p className="text-lg font-bold text-white leading-tight">
            {alert.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">{alert.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {alert.status === 'accepted' && (
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/5 px-3 py-2 rounded-xl border border-emerald-500/20 w-fit">
              <CheckCircle2 className="h-4 w-4" />
              Responded by: {type === 'accepted' ? 'You' : alert.acceptedByName}
            </div>
          )}
        </div>

        <Link 
          href={`/alerts?role=donor&focus=${alert.id}`}
          className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-all shadow-xl"
        >
          <ArrowRight className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
