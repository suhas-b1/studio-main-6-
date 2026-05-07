'use client';

import { useEmergencyAlerts } from '@/context/emergency-alerts-context';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Map as MapIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminAlertsDashboard() {
  const { alerts, isLoading } = useEmergencyAlerts();

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    accepted: alerts.filter(a => a.status === 'accepted').length,
    expired: alerts.filter(a => a.status === 'expired').length,
    highPriority: alerts.filter(a => a.priority === 'high').length,
  };

  if (isLoading) return <div className="p-8 text-center">Loading admin dashboard...</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Crisis Monitoring Hub</h1>
          <p className="text-muted-foreground italic">Admin view for real-time emergency coordination.</p>
        </div>
        <Link 
          href="/alerts" 
          className="bg-primary text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition shadow-lg"
        >
          <MapIcon className="h-4 w-4" /> Live Map View
        </Link>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Alerts" value={stats.total} icon={Activity} color="text-white" />
        <MetricCard title="Active Now" value={stats.active} icon={ShieldAlert} color="text-red-400" pulse />
        <MetricCard title="Responded" value={stats.accepted} icon={CheckCircle2} color="text-emerald-400" />
        <MetricCard title="Missed/Expired" value={stats.expired} icon={XCircle} color="text-muted-foreground" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Live Alert Stream
          </h2>
          <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Retry</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {alerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-1 rounded-full uppercase',
                          alert.status === 'active' ? 'bg-red-500/20 text-red-400' :
                          alert.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-white/10 text-muted-foreground'
                        )}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'text-[10px] font-bold uppercase',
                          alert.priority === 'high' ? 'text-red-400' : 'text-orange-400'
                        )}>
                          {alert.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-white font-medium line-clamp-1">{alert.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="text-xs font-bold text-white">{alert.retryCount}/{alert.maxRetries}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/alerts?role=donor&focus=${alert.id}`} className="text-[10px] font-black text-primary uppercase hover:underline">
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Coordination Insights */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Insights</h2>
          <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Donor Coverage</span>
              <span className="text-sm font-black text-primary">82%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '82%' }} />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Real-time monitoring of donor availability across high-risk zones. 
              Currently, 14 active donors are online within the 10km radius of the newest reports.
            </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6">
            <h3 className="text-sm font-bold text-red-400 mb-2">High-Risk Zones</h3>
            <ul className="space-y-2">
              <li className="text-[10px] text-white/80">• Downtown District (3 active)</li>
              <li className="text-[10px] text-white/80">• Industrial Area (1 active)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, pulse }: any) {
  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
        <Icon className={cn('h-5 w-5', color, pulse && 'animate-pulse')} />
      </div>
      <div className={cn('text-4xl font-black italic tracking-tighter', color)}>{value}</div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
    </div>
  );
}
