
'use client';
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, Award, XCircle, HeartHandshake, Zap, Package, Leaf, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Donation, UserRole } from "@/lib/types";
import { ClaimDonationDialog } from "./claim-donation-dialog";
import { DonationDetailsDialog } from "./donation-details-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { canAnyServiceDeliver, getEstimatedDeliveryMinutes } from "@/lib/delivery-utils";

/* Urgency thresholds: if pickup deadline < 4h ⇒ URGENT */
function getUrgency(d: Donation) {
  const hoursLeft = (d.pickupDeadline.getTime() - Date.now()) / 3_600_000;
  if (hoursLeft < 0) return { label: 'EXPIRED', cls: 'badge-standard' };
  if (hoursLeft < 4) return { label: 'URGENT', cls: 'badge-urgent' };
  if (d.type === 'Produce' || d.type === 'Baked Goods')
    return { label: 'FRESH', cls: 'badge-fresh' };
  return { label: 'STANDARD', cls: 'badge-standard' };
}

/* Circular match % ring (SVG) */
function MatchRing({ pct }: { pct: number }) {
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 90 ? '#f97316' : pct >= 75 ? '#fb923c' : '#94a3b8';
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 22 22)" />
      </svg>
      <span className="text-[10px] font-bold -mt-9 leading-none" style={{ color }}>{pct}%</span>
      <span className="text-[9px] text-muted-foreground mt-5 leading-none">MATCH</span>
    </div>
  );
}

/* Deterministic match % from donation id */
function mockMatchPct(id: string): number {
  const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 62 + (n % 37); // 62–98
}

export function DonationCard({ donation, role }: { donation: Donation; role: UserRole }) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  const isExpired = new Date() > donation.pickupDeadline;
  const currentStatus = isExpired && donation.status === 'available' ? 'expired' : donation.status;
  const urgency = getUrgency(donation);
  const matchPct = mockMatchPct(donation.id);

  return (
    <>
      <div className="card-glow flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
        {/* Image with urgency badge overlay */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={donation.imageUrl}
            alt={donation.title}
            fill
            className="object-cover"
            data-ai-hint={donation.imageHint}
          />
          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Urgency badge top-left */}
          <span className={cn("absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full", urgency.cls)}>
            {urgency.label}
          </span>

          {/* Distance bottom-left */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
            <MapPin className="h-3 w-3" />{donation.distance.toFixed(1)} km away
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {donation.donor.organizationName}
                {donation.donor.isVerified && (
                  <Award className="inline h-3 w-3 ml-1 text-primary" />
                )}
                {' · '}{donation.type}
              </div>
              <h3 className="font-bold text-foreground text-sm leading-tight">{donation.title}</h3>
            </div>
            {role === 'ngo' && <MatchRing pct={matchPct} />}
          </div>

          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{donation.description}</p>

          {/* Deadline */}
          <div className={cn("flex items-center gap-1.5 mt-3 text-xs font-medium",
            currentStatus === 'expired' ? 'text-red-400' : 'text-muted-foreground'
          )}>
            {currentStatus === 'expired'
              ? <><XCircle className="h-3.5 w-3.5" />Expired</>
              : <><Clock className="h-3.5 w-3.5" />Pick up by {donation.pickupDeadline.toLocaleDateString()}</>
            }
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          {/* Delivery safety warning banner for NGO */}
          {role === 'ngo' && currentStatus === 'available' && !canAnyServiceDeliver(donation) && (
            <div className="flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/25 px-3 py-2 text-[10px] font-semibold text-red-400">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>Food will expire before any delivery option can arrive</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setIsViewingDetails(true)}>
              Details
            </Button>
            {role === 'ngo' && currentStatus === 'available' && (
              canAnyServiceDeliver(donation) ? (
                <Button size="sm" className="flex-1 text-xs" onClick={() => setIsClaiming(true)}>
                  <HeartHandshake className="h-3.5 w-3.5 mr-1" />Claim Donation
                </Button>
              ) : (
                <span className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold rounded-md border border-red-500/30 bg-red-500/10 text-red-400 px-2 py-1">
                  <XCircle className="h-3 w-3" />Too Late to Claim
                </span>
              )
            )}
            {role === 'donor' && (
              <span className={cn(
                "flex-1 flex items-center justify-center text-[10px] font-bold rounded-md border",
                currentStatus === 'available' ? 'badge-claimed' :
                  currentStatus === 'claimed' ? 'badge-urgent' :
                    currentStatus === 'picked-up' ? 'badge-completed' : 'badge-standard'
              )}>
                {currentStatus.toUpperCase().replace('-', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <ClaimDonationDialog open={isClaiming} onOpenChange={setIsClaiming} donation={donation} />
      <DonationDetailsDialog open={isViewingDetails} onOpenChange={setIsViewingDetails} donation={donation} role={role} onClaimClick={() => { setIsViewingDetails(false); setIsClaiming(true); }} />
    </>
  );
}
