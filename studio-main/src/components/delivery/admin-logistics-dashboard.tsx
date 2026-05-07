'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { 
  Activity, 
  Map as MapIcon, 
  AlertTriangle, 
  Clock, 
  Users, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Bike
} from 'lucide-react';
import { DeliveryTracking } from '@/context/delivery-context';
import { cn } from '@/lib/utils';
import LiveTrackingScreen from './live-tracking-screen';

export default function AdminLogisticsDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryTracking[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { firestore } = initializeFirebase();

  useEffect(() => {
    const q = query(
      collection(firestore, 'deliveries'),
      where('status', 'not-in', ['delivered', 'cancelled'])
    );

    const unsub = onSnapshot(q, (snap) => {
      setDeliveries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    return () => unsub();
  }, [firestore]);

  const stats = {
    active: deliveries.length,
    alerts: deliveries.filter(d => d.status === 'heading_to_receiver' && (d as any).etaMinutes > 60).length,
    volunteers: new Set(deliveries.map(d => d.volunteerId)).size,
    avgEta: '14m'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Live Deliveries" value={stats.active} color="text-primary" />
        <StatCard icon={AlertTriangle} label="Critical Alerts" value={stats.alerts} color="text-red-400" />
        <StatCard icon={Users} label="Active Heroes" value={stats.volunteers} color="text-blue-400" />
        <StatCard icon={Clock} label="Avg. ETA" value={stats.avgEta} color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Fleet Monitor</h2>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Realtime Feed</span>
            </div>
          </div>

          <div className="grid gap-4">
            {deliveries.length === 0 ? (
              <div className="bg-[#111] border border-white/5 rounded-[2rem] p-12 text-center">
                <div className="h-16 w-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <MapIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-bold italic">No active deliveries in the fleet.</p>
              </div>
            ) : (
              deliveries.map(d => (
                <div 
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className="group bg-[#111] border border-white/10 rounded-[2.5rem] p-6 hover:border-primary/40 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.volunteerName}`} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-none uppercase mb-1">{d.volunteerName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                          {d.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground italic">#{d.id.slice(0, 5)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Estimated Arrival</p>
                      <p className="text-xl font-black text-white tracking-tighter uppercase">{d.eta || 'Syncing'}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fleet Insights Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Fleet Insights</h2>
          
          <div className="bg-gradient-to-br from-primary to-orange-600 rounded-[2.5rem] p-8 text-black shadow-2xl shadow-primary/20">
            <TrendingUp className="h-8 w-8 mb-4" />
            <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-2">Impact Velocity</h3>
            <p className="text-sm font-bold opacity-80 mb-6 italic">Current delivery pace is 12% faster than last week.</p>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-black w-[85%]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mt-4">85% Optimization Goal Reached</p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" /> System Health
            </h4>
            
            <HealthItem label="Socket.IO Nodes" status="Healthy" value="3/3" color="text-green-400" />
            <HealthItem label="GPS Sync Rate" status="Nominal" value="1.2s" color="text-blue-400" />
            <HealthItem label="API Latency" status="Optimized" value="42ms" color="text-primary" />
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-[2.5rem] p-8 flex items-start gap-4">
             <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
               <AlertTriangle className="h-6 w-6 text-orange-400" />
             </div>
             <div>
               <h4 className="text-sm font-black text-orange-400 uppercase tracking-widest mb-1">Dispatch Alert</h4>
               <p className="text-xs text-orange-200/60 font-medium leading-relaxed">
                 Heavy traffic detected in South Mumbai. Volunteers in the area have been notified of rerouting options.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Selected Tracking Modal */}
      {selectedId && (
        <LiveTrackingScreen deliveryId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-[#111] border border-white/10 p-6 rounded-3xl shadow-xl hover:border-white/20 transition-all">
      <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-4", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}

function HealthItem({ label, status, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-white">{label}</p>
        <p className={cn("text-[9px] font-black uppercase tracking-widest", color)}>{status}</p>
      </div>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}
