'use client';

import VolunteerLogisticsHub from '@/components/delivery/volunteer-logistics-hub';
import { Bike, Star, Navigation, Zap } from 'lucide-react';

export default function VolunteerLogisticsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bike className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Logistics Hub</h1>
          </div>
          <p className="text-muted-foreground font-medium">Manage your active rescues and track your impact in real-time.</p>
        </div>

        <div className="flex gap-2">
          <Badge icon={<Star className="h-3 w-3" />} label="Top Rescuer" color="text-yellow-400" />
          <Badge icon={<Zap className="h-3 w-3" />} label="XP: 4,820" color="text-primary" />
        </div>
      </div>

      <VolunteerLogisticsHub />
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
