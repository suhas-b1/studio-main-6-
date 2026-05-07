'use client';
import { HandHeart, HeartPulse, Leaf, Package, Truck, Users, ArrowRight, Clock, CheckCircle2, Circle, MapPin, Zap } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { mockDonations, impactStats } from '@/lib/mock-data';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ActiveAlertsBanner } from '@/components/emergency/active-alerts-banner';
import { EmergencyButton } from '@/components/emergency/emergency-button';
import { useEmergencyAlerts } from '@/context/emergency-alerts-context';
import { calculateDistance } from '@/lib/distance';
import { useEffect, useState } from 'react';
import { ActiveDeliveriesDashboard } from '@/components/delivery/active-deliveries-dashboard';

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

function EmergencyHighlights() {
  const { activeAlerts } = useEmergencyAlerts();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const filtered = activeAlerts.filter(alert => {
    if (!alert.latitude || !alert.longitude || !userCoords) return alert.priority === 'high';
    const dist = calculateDistance(userCoords.lat, userCoords.lng, alert.latitude, alert.longitude);
    return dist <= 5 && alert.priority === 'high';
  }).slice(0, 2);

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nearby High Priority</h3>
        <Link href="/alerts?role=donor" className="text-[10px] font-bold text-primary hover:underline">View All Alerts</Link>
      </div>
      <div className="grid gap-3">
        {filtered.map(alert => (
          <Link key={alert.id} href={`/alerts?role=donor&focus=${alert.id}`}>
            <div className="group rounded-2xl border border-red-500/30 bg-red-500/5 p-4 transition-all hover:bg-red-500/10 hover:border-red-500/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">High Priority</span>
                  </div>
                  <p className="text-sm font-bold text-foreground line-clamp-1 mb-1">{alert.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 text-red-400" />
                    <span className="truncate">{alert.location}</span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition">
                  <ArrowRight className="h-4 w-4 text-red-400" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


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

      {/* Nearby Emergency Alerts Highlight */}
      <EmergencyHighlights />

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
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  d.status === 'claimed' ? 'badge-claimed' : 'badge-completed'
                )}>
                  {d.status === 'claimed' ? 'In Transit' : 'Pending'}
                </span>
                {d.status === 'claimed' && (
                  <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 rounded-full border-primary/50 text-primary hover:bg-primary/10" asChild>
                    <button onClick={() => {}}>
                      Track Live
                    </button>
                  </Button>
                )}
              </div>
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

/* ─── Volunteer Dashboard ─────────────────────────────── */
const VolunteerDashboard = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-primary to-primary-foreground text-black">
        <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Impact Points</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black italic tracking-tighter">4,820</span>
          <span className="text-lg font-bold">XP</span>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="bg-black/10 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">Level 14</span>
          <span className="bg-black/10 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Top 5% Rescuer</span>
        </div>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-black/5 blur-xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Deliveries Done" value="124" icon={CheckCircle2} trend={12} trendLabel="this week" iconBg="bg-green-500/15" />
        <StatCard title="Food Saved" value="540kg" icon={HandHeart} iconBg="bg-blue-500/15" />
      </div>

      <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center bg-white/5">
        <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Ready for a mission?</h3>
        <p className="text-sm text-muted-foreground mb-6">Nearby NGOs need help delivering food. Accept a task to start tracking.</p>
        <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest">Find Missions Nearby</Button>
      </div>
    </div>
  );
};

import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'donor';

  const renderDashboard = () => {
    switch (role) {
      case 'volunteer': return <VolunteerDashboard />;
      case 'ngo': return <NgoDashboard />;
      default: return <DonorDashboard />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === 'volunteer' ? 'Track your active missions and impact.' : 
             role === 'donor' ? 'Your food rescue impact at a glance.' : 
             'Find and claim food donations near you.'}
          </p>
        </div>
        <Link href={`/alerts?role=${role}`} className="flex items-center gap-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded-xl px-3 py-2 bg-red-500/10 hover:bg-red-500/20 transition">
          🚨 Alerts
        </Link>
      </div>

      {/* Emergency Alerts Banner - visible to all */}
      <ActiveAlertsBanner role={role} />

      {/* Live Delivery Tracking Section */}
      <ActiveDeliveriesDashboard role={role} />

      {renderDashboard()}

      {/* Floating SOS button on mobile */}
      <EmergencyButton variant="fab" />
    </div>
  );
}
