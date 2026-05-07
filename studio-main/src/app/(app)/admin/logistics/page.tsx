'use client';

import AdminLogisticsDashboard from '@/components/delivery/admin-logistics-dashboard';
import { Truck, ShieldCheck, Map, Activity } from 'lucide-react';

export default function AdminLogisticsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Logistics Control</h1>
          </div>
          <p className="text-muted-foreground font-medium">Real-time monitoring of global food rescue fleet.</p>
        </div>

        <div className="flex gap-2">
          <Badge icon={<ShieldCheck className="h-3 w-3" />} label="Fleet Secure" color="text-green-400" />
          <Badge icon={<Activity className="h-3 w-3" />} label="Nodes: 3 Active" color="text-blue-400" />
        </div>
      </div>

      <AdminLogisticsDashboard />
    </div>
  );
}

function Badge({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-inner">
      <span className={color}>{icon}</span>
      <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
    </div>
  );
}
