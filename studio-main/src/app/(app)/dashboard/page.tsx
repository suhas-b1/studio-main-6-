
'use client';
import { use } from 'react';
import { HandHeart, HeartPulse, Leaf, Package, Truck, Users, ArrowRight, Clock, CheckCircle2, Circle, MapPin, Zap } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { mockDonations, impactStats } from '@/lib/mock-data';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

/* ─── small helpers ─────────────────────────────────────── */
const BAR_DATA = [38, 55, 42, 70, 63, 85, 100]; // last 7 days, % of max

function MiniBarChart() {
  return (
    <div className="flex items-end gap-[3px] h-12">
      {BAR_DATA.map((h, i) => (
        <div
          key={i}
          className="animate-bar-grow flex-1 rounded-t"
          style={{
            height: `${h}%`,
            background: i === BAR_DATA.length - 1 ? '#f97316' : `rgba(249,115,22,${0.25 + i * 0.1})`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

const statusMeta = {
  available: { label: 'AVAILABLE', cls: 'badge-claimed' },
  claimed: { label: 'CLAIMED', cls: 'badge-urgent' },
  'picked-up': { label: 'COMPLETED', cls: 'badge-completed' },
  expired: { label: 'EXPIRED', cls: 'badge-standard' },
} as const;

/* ─── Donor Dashboard ───────────────────────────────────── */
const DonorDashboard = () => {
  const myDonations = mockDonations.filter(d => d.donorId === 'user-donor-1' || d.donorId === 'user-donor-2');
  const activeListings = myDonations.filter(d => d.status === 'available');

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Hero impact card */}
      <Link href="/impact?role=donor" className="block group">
        <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Your Impact</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-foreground">{impactStats.mealsProvided.toLocaleString()}</span>
                <span className="text-lg text-muted-foreground mb-1">Meals Provided</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <span>↑ +12% from last month</span>
                </div>
                <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
                  View Full Stats <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
            <div className="w-24 h-12 flex-shrink-0"><MiniBarChart /></div>
          </div>
          {/* subtle glow */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        </div>
      </Link>

      {/* Secondary stat tiles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <HeartPulse className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">KG Saved</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{impactStats.foodSavedKg} kg</div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-bar-grow" style={{ width: '68%' }} />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">CO₂ Reduced</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{impactStats.co2ReducedTons} t</div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-bar-grow" style={{ width: '45%' }} />
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Active Listings" value={activeListings.length} icon={Package} description="Available for pickup" trend={8} trendLabel="this week" />
        <StatCard title="Total Donations" value={myDonations.length} icon={Truck} description="All time" />
      </div>

      {/* Food Need Hotspots Map Card */}
      <Link href="/donor-hotspot-map?role=donor" className="block group">
        <div className="rounded-2xl border border-red-500/25 bg-card p-5 relative overflow-hidden transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Food Need Hotspots</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Slums, shelters &amp; orphanages across India needing donations
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">🏚️ Slum Colonies</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">🏠 Shelters</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">👶 Orphanages</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                View Map <ArrowRight className="h-3 w-3" />
              </span>
              <span className="text-[10px] text-muted-foreground">200+ locations</span>
            </div>
          </div>
          {/* Live pulse dot */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-red-500/5 blur-2xl pointer-events-none" />
        </div>
      </Link>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
          <Link href="/donations?role=donor" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {myDonations.slice(0, 3).map(d => {
            const isExpired = new Date() > d.pickupDeadline;
            const s = (isExpired && d.status === 'available' ? 'expired' : d.status) as keyof typeof statusMeta;
            const meta = statusMeta[s] ?? statusMeta.expired;
            return (
              <div key={d.id} className="card-glow flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={d.imageUrl} alt={d.title} width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{d.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.quantity} · {d.distance.toFixed(1)} km away</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", meta.cls)}>{meta.label}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(d.createdAt, { addSuffix: true })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─── NGO / Receiver Dashboard ─────────────────────────── */
const NgoDashboard = () => {
  const claimedDonations = mockDonations.filter(d => d.claimedByNgoId === 'user-ngo-1');
  const availableDonations = mockDonations.filter(d => d.status === 'available');

  // nearby "urgent needs" — simulate with the 3 closest available
  const urgentNearby = [...availableDonations]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Orange hero card */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-100/70 mb-1">Total Food Saved</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white">1,240</span>
          <span className="text-xl font-bold text-orange-100">kg</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">↑ 15% this month</span>
        </div>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Lives Impacted" value="850" icon={Users} trend={8} trendLabel="increase" iconBg="bg-emerald-500/15" />
        <StatCard title="Active Listings" value={availableDonations.length} icon={Package} description="4 pending pickup" />
      </div>

      {/* Urgent needs nearby */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Urgent Needs Nearby</h2>
          </div>
          <Link href="/food-aid-map?role=ngo" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View Map <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {urgentNearby.map((d, i) => (
            <div key={d.id} className="card-glow flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={d.imageUrl} alt={d.title} width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {i === 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">CLOSING SOON</span>}
                  {i === 1 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">HIGH IMPACT</span>}
                </div>
                <div className="font-semibold text-sm text-foreground truncate">{d.title}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />{d.distance.toFixed(1)} km away
                </div>
              </div>
              <Button size="sm" className="flex-shrink-0 text-xs px-3" asChild>
                <Link href={`/donations?role=ngo`}>Claim</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* My active claims */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">My Active Claims</h2>
        <div className="space-y-3">
          {claimedDonations.slice(0, 2).map(d => (
            <div key={d.id} className="card-glow flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">{d.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{d.quantity}</div>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                d.status === 'claimed' ? 'badge-claimed' : 'badge-completed'
              )}>
                {d.status === 'claimed' ? 'In Transit' : 'Pending'}
              </span>
            </div>
          ))}
          {claimedDonations.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Circle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active claims yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'donor';

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">
          {role === 'donor' ? 'Donor Dashboard' : 'Receiver Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {role === 'donor' ? 'Your food rescue impact at a glance.' : 'Find and claim food donations near you.'}
        </p>
      </div>
      {role === 'donor' ? <DonorDashboard /> : <NgoDashboard />}
    </div>
  );
}
