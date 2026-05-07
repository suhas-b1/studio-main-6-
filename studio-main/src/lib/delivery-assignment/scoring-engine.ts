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
const METHOD_AVG_SPEED_KMH: Record<DeliveryMethod, number> = {
  self_pickup:         20,
  volunteer_delivery:  25,
  partner_logistics:   30,
  emergency_fast:      50, // Rapid response for AI priority
};

export function estimateMinutes(method: DeliveryMethod, distanceKm: number): number {
  const speed = METHOD_AVG_SPEED_KMH[method];
  const travelMins = (distanceKm / speed) * 60;
  const overheadMins = 
    method === 'self_pickup' ? 5 : 
    method === 'volunteer_delivery' ? 10 : 
    method === 'emergency_fast' ? 5 : 15;
  return Math.round(travelMins + overheadMins);
}

// ─── Cost Calculator ─────────────────────────────────────────────────────────
export function estimateCost(method: DeliveryMethod, distanceKm: number): number {
  const base = METHOD_BASE_COST[method];
  if (base === 0) return 0;
  const handlingFee = method === 'partner_logistics' ? 25 : method === 'emergency_fast' ? 100 : 10;
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

  // 1. Self Pickup
  options.push({
    method: 'self_pickup',
    label: 'Self Pickup',
    distanceKm: totalDist,
    estimatedMinutes: estimateMinutes('self_pickup', totalDist),
    costRupees: 0,
    availabilityScore: 1.0,
    isAvailable: true,
  });

  // 2. Volunteer Delivery
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
  }

  // 3. Partner Logistics (Porter Style)
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

  // 4. Emergency Fast Delivery (Priority)
  options.push({
    method: 'emergency_fast',
    label: 'Emergency Fast Delivery',
    distanceKm: totalDist,
    estimatedMinutes: estimateMinutes('emergency_fast', totalDist),
    costRupees: estimateCost('emergency_fast', totalDist),
    availabilityScore: 0.95,
    isAvailable: req.urgency === 'critical' || req.urgency === 'high',
  });

  return options;
}

// ─── Scoring Engine ───────────────────────────────────────────────────────────
export function scoreOptions(
  options: DeliveryOption[],
  req: AssignmentRequest,
  pastPerformance?: Record<DeliveryMethod, number>
): ScoredOption[] {
  const weights: ScoringWeights = URGENCY_WEIGHTS[req.urgency];
  const maxDist  = Math.max(...options.map(o => o.distanceKm), 1);
  const maxCost  = Math.max(...options.map(o => o.costRupees), 1);
  const maxTime  = Math.max(...options.map(o => o.estimatedMinutes), 1);

  const scored: ScoredOption[] = options.map(opt => {
    const distScore  = 1 - opt.distanceKm / maxDist;
    const costScore  = opt.costRupees === 0 ? 1 : 1 - opt.costRupees / maxCost;
    const speedScore = METHOD_SPEED_SCORE[opt.method];
    const timeScore  = 1 - opt.estimatedMinutes / maxTime;

    // Expiry Risk Score: If ETA is close to deadline, score drops
    const deadlineMins = req.pickupDeadlineMinutes || 120;
    const expiryScore = Math.max(0, Math.min(1, (deadlineMins - opt.estimatedMinutes) / deadlineMins));

    const urgScore   = req.urgency === 'critical' || req.urgency === 'high'
      ? (speedScore * 0.6 + timeScore * 0.4)
      : timeScore;

    const histPerf = pastPerformance?.[opt.method] ?? 0.75;
    const availScore = opt.isAvailable ? (opt.availabilityScore * 0.7 + histPerf * 0.3) : 0;

    const total = opt.isAvailable
      ? (distScore  * weights.distance) +
        (costScore  * weights.cost) +
        (urgScore   * weights.urgency) +
        (availScore * weights.availability) +
        (expiryScore * weights.expiry)
      : 0;

    const reasoning = buildReasoning(opt, req, distScore, costScore, urgScore, expiryScore);
    
    // Bonus Feature: Drone Suggestion
    let futureSuggestion;
    if (req.isFloodZone || req.isRemoteArea || (req.urgency === 'critical' && opt.distanceKm > 10)) {
      futureSuggestion = "Future Recommendation: Drone Delivery Possible for this terrain.";
    }

    return {
      ...opt,
      scores: {
        distance:     parseFloat((distScore  * 100).toFixed(1)),
        cost:         parseFloat((costScore  * 100).toFixed(1)),
        urgency:      parseFloat((urgScore   * 100).toFixed(1)),
        availability: parseFloat((availScore * 100).toFixed(1)),
        expiry:       parseFloat((expiryScore * 100).toFixed(1)),
        total:        parseFloat((total      * 100).toFixed(1)),
      },
      rank: 0,
      recommended: false,
      reasoning,
      futureSuggestion,
    };
  });

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
  req: AssignmentRequest,
  distScore: number,
  costScore: number,
  urgScore: number,
  expiryScore: number
): string {
  if (!opt.isAvailable) return 'Not available right now.';
  const parts: string[] = [];

  if (req.urgency === 'critical') parts.push('High priority hunger alert.');
  if (expiryScore < 0.3) parts.push('Food is close to expiry.');
  if (opt.method === 'volunteer_delivery' && distScore > 0.7) parts.push('Volunteer available nearby.');
  if (opt.method === 'partner_logistics' && req.pickupDeadlineMinutes < 60) parts.push('Rapid partner delivery needed for tight window.');
  if (opt.distanceKm > 8) parts.push('Long distance delivery optimization.');

  return parts.join(' ') || 'Standard delivery recommended.';
}

export function autoSelect(scored: ScoredOption[]): ScoredOption | null {
  const available = scored.filter(o => o.isAvailable);
  return available[0] ?? null;
}

export function distanceRule(distKm: number, urgency: UrgencyLevel): DeliveryMethod {
  if (distKm <= 2) return 'self_pickup';
  if (distKm <= 8) return 'volunteer_delivery';
  return 'partner_logistics';
}
