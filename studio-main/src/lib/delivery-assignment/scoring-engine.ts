import {
  DeliveryMethod,
  DeliveryOption,
  ScoredOption,
  AssignmentRequest,
  ScoringWeights,
  URGENCY_WEIGHTS,
  METHOD_SPEED_SCORE,
  METHOD_BASE_COST,
  UrgencyLevel,
} from './types';

// ─── Haversine Distance ───────────────────────────────────────────────────────
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── ETA Estimator ───────────────────────────────────────────────────────────
// avg speed assumptions: pickup = 20km/h city walk+transit, volunteer = 25km/h bike, partner = 30km/h
const METHOD_AVG_SPEED_KMH: Record<DeliveryMethod, number> = {
  self_pickup:         20,
  volunteer_delivery:  25,
  partner_logistics:   30,
};

export function estimateMinutes(method: DeliveryMethod, distanceKm: number): number {
  const speed = METHOD_AVG_SPEED_KMH[method];
  const travelMins = (distanceKm / speed) * 60;
  const overheadMins = method === 'self_pickup' ? 5 : method === 'volunteer_delivery' ? 10 : 15;
  return Math.round(travelMins + overheadMins);
}

// ─── Cost Calculator ─────────────────────────────────────────────────────────
export function estimateCost(method: DeliveryMethod, distanceKm: number): number {
  const base = METHOD_BASE_COST[method];
  if (base === 0) return 0;
  // Add fixed handling fee
  const handlingFee = method === 'partner_logistics' ? 25 : 10;
  return Math.round(base * distanceKm + handlingFee);
}

// ─── Option Builder ───────────────────────────────────────────────────────────
export function buildOptions(
  req: AssignmentRequest,
  availableVolunteers: { id: string; name: string; lat: number; lng: number; isOnline: boolean }[],
  availablePartners: { id: string; name: string; available: boolean }[]
): DeliveryOption[] {
  const totalDist = haversineKm(req.donorLat, req.donorLng, req.receiverLat, req.receiverLng);

  const options: DeliveryOption[] = [];

  // ─ Option 1: Self Pickup ──────────────────────────────────────────────────
  // Receiver travels to donor directly
  options.push({
    method: 'self_pickup',
    label: 'Self Pickup',
    distanceKm: totalDist,
    estimatedMinutes: estimateMinutes('self_pickup', totalDist),
    costRupees: 0,
    availabilityScore: 1.0, // always available
    isAvailable: true,
  });

  // ─ Option 2: Volunteer Delivery ───────────────────────────────────────────
  const nearestVol = availableVolunteers
    .filter(v => v.isOnline)
    .map(v => ({
      ...v,
      distToPickup: haversineKm(v.lat, v.lng, req.donorLat, req.donorLng),
    }))
    .sort((a, b) => a.distToPickup - b.distToPickup)[0];

  if (nearestVol) {
    const totalVolDist = nearestVol.distToPickup + totalDist;
    options.push({
      method: 'volunteer_delivery',
      label: 'Volunteer Delivery',
      distanceKm: totalVolDist,
      estimatedMinutes: estimateMinutes('volunteer_delivery', totalVolDist),
      costRupees: estimateCost('volunteer_delivery', totalVolDist),
      availabilityScore: Math.max(0, 1 - nearestVol.distToPickup / 15),
      isAvailable: true,
      resourceId: nearestVol.id,
      resourceName: nearestVol.name,
    });
  } else {
    options.push({
      method: 'volunteer_delivery',
      label: 'Volunteer Delivery',
      distanceKm: totalDist,
      estimatedMinutes: estimateMinutes('volunteer_delivery', totalDist),
      costRupees: estimateCost('volunteer_delivery', totalDist),
      availabilityScore: 0,
      isAvailable: false,
    });
  }

  // ─ Option 3: Partner Logistics ────────────────────────────────────────────
  const hasPartner = availablePartners.some(p => p.available);
  options.push({
    method: 'partner_logistics',
    label: 'Partner Logistics',
    distanceKm: totalDist,
    estimatedMinutes: estimateMinutes('partner_logistics', totalDist),
    costRupees: estimateCost('partner_logistics', totalDist),
    availabilityScore: hasPartner ? 0.9 : 0,
    isAvailable: hasPartner,
    resourceId: availablePartners[0]?.id,
    resourceName: availablePartners[0]?.name,
  });

  return options;
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────
export function scoreOptions(
  options: DeliveryOption[],
  urgency: UrgencyLevel,
  pastPerformance?: Record<DeliveryMethod, number> // 0–1 reliability score from history
): ScoredOption[] {
  const weights: ScoringWeights = URGENCY_WEIGHTS[urgency];

  // Normalisation ranges
  const maxDist  = Math.max(...options.map(o => o.distanceKm), 1);
  const maxCost  = Math.max(...options.map(o => o.costRupees), 1);
  const maxTime  = Math.max(...options.map(o => o.estimatedMinutes), 1);

  const scored: ScoredOption[] = options.map(opt => {
    // --- Individual dimension scores (0–1, higher = better) ---
    const distScore  = 1 - opt.distanceKm / maxDist;            // closer = better
    const costScore  = opt.costRupees === 0 ? 1 : 1 - opt.costRupees / maxCost; // cheaper = better
    const speedScore = METHOD_SPEED_SCORE[opt.method];           // method inherent speed
    const timeScore  = 1 - opt.estimatedMinutes / maxTime;       // faster = better
    const urgScore   = urgency === 'critical' || urgency === 'high'
      ? (speedScore * 0.6 + timeScore * 0.4)
      : timeScore;

    // Blend past performance into availability (if data exists)
    const histPerf = pastPerformance?.[opt.method] ?? 0.75;
    const availScore = opt.isAvailable ? (opt.availabilityScore * 0.7 + histPerf * 0.3) : 0;

    // --- Weighted total ---
    const total = opt.isAvailable
      ? (distScore  * weights.distance) +
        (costScore  * weights.cost) +
        (urgScore   * weights.urgency) +
        (availScore * weights.availability)
      : 0; // unavailable options score 0

    // --- Human-readable reasoning ---
    const reasoning = buildReasoning(opt, urgency, distScore, costScore, urgScore, availScore);

    return {
      ...opt,
      scores: {
        distance:     parseFloat((distScore  * 100).toFixed(1)),
        cost:         parseFloat((costScore  * 100).toFixed(1)),
        urgency:      parseFloat((urgScore   * 100).toFixed(1)),
        availability: parseFloat((availScore * 100).toFixed(1)),
        total:        parseFloat((total      * 100).toFixed(1)),
      },
      rank: 0,
      recommended: false,
      reasoning,
    };
  });

  // Rank by total score
  scored.sort((a, b) => b.scores.total - a.scores.total);
  scored.forEach((o, i) => {
    o.rank = i + 1;
    o.recommended = i === 0 && o.isAvailable;
  });

  return scored;
}

// ─── Reasoning Generator ──────────────────────────────────────────────────────
function buildReasoning(
  opt: DeliveryOption,
  urgency: UrgencyLevel,
  distScore: number,
  costScore: number,
  urgScore: number,
  availScore: number
): string {
  if (!opt.isAvailable) return 'Not available right now.';

  const parts: string[] = [];
  if (opt.method === 'self_pickup' && opt.distanceKm < 3)
    parts.push('Very close — ideal for self pickup.');
  if (opt.method === 'volunteer_delivery' && opt.resourceName)
    parts.push(`Volunteer "${opt.resourceName}" is nearby.`);
  if (opt.method === 'partner_logistics')
    parts.push('Professional logistics ensures reliability.');
  if (urgency === 'critical' && urgScore > 0.7)
    parts.push('Fastest option — critical urgency match.');
  if (urgency === 'low' && costScore > 0.7)
    parts.push('Most cost-efficient for low urgency.');
  if (distScore > 0.8)
    parts.push('Shortest travel distance.');
  if (opt.costRupees === 0)
    parts.push('Zero delivery cost.');

  return parts.join(' ') || 'Viable option.';
}

// ─── Auto-Select Decision ─────────────────────────────────────────────────────
export function autoSelect(scored: ScoredOption[]): ScoredOption | null {
  const available = scored.filter(o => o.isAvailable);
  return available[0] ?? null; // already ranked by score
}

// ─── Distance Rule Override ───────────────────────────────────────────────────
// Pure distance-based fast-path (before full scoring)
export function distanceRule(distKm: number, urgency: UrgencyLevel): DeliveryMethod {
  if (distKm <= 2) return 'self_pickup';
  if (distKm <= 8) return 'volunteer_delivery';
  return 'partner_logistics';
}
