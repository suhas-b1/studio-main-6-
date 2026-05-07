// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryMethod = 'self_pickup' | 'volunteer_delivery' | 'partner_logistics';
export type UrgencyLevel   = 'critical' | 'high' | 'medium' | 'low';
export type AssignmentStatus = 'pending' | 'scoring' | 'assigned' | 'reassigning' | 'failed';

export interface DeliveryOption {
  method: DeliveryMethod;
  label: string;
  distanceKm: number;
  estimatedMinutes: number;
  costRupees: number;
  availabilityScore: number; // 0–1
  isAvailable: boolean;
  resourceId?: string;       // volunteer/partner ID
  resourceName?: string;
}

export interface ScoringWeights {
  distance:     number; // 0–1, should sum to 1 with others
  cost:         number;
  urgency:      number;
  availability: number;
}

export interface ScoredOption extends DeliveryOption {
  scores: {
    distance:     number;
    cost:         number;
    urgency:      number;
    availability: number;
    total:        number;
  };
  rank: number;
  recommended: boolean;
  reasoning: string;
}

export interface AssignmentRequest {
  id: string;
  donationId: string;
  donationTitle: string;
  donorLat: number;
  donorLng: number;
  receiverLat: number;
  receiverLng: number;
  urgency: UrgencyLevel;
  foodWeightKg: number;
  pickupDeadlineMinutes: number;
  requestedAt: Date;
}

export interface AssignmentResult {
  requestId: string;
  status: AssignmentStatus;
  selectedOption: ScoredOption | null;
  allOptions: ScoredOption[];
  assignedAt: Date | null;
  retryCount: number;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  timestamp: Date;
  action: string;
  method?: DeliveryMethod;
  detail: string;
}

// ─── Urgency Config ───────────────────────────────────────────────────────────
// Each urgency level specifies which weight profile to use
export const URGENCY_WEIGHTS: Record<UrgencyLevel, ScoringWeights> = {
  critical: { distance: 0.10, cost: 0.05, urgency: 0.70, availability: 0.15 },
  high:     { distance: 0.20, cost: 0.15, urgency: 0.45, availability: 0.20 },
  medium:   { distance: 0.30, cost: 0.30, urgency: 0.20, availability: 0.20 },
  low:      { distance: 0.25, cost: 0.50, urgency: 0.05, availability: 0.20 },
};

// ─── Method Speed Scores (how fast each method is) ───────────────────────────
export const METHOD_SPEED_SCORE: Record<DeliveryMethod, number> = {
  self_pickup:         0.5,   // medium — receiver travels
  volunteer_delivery:  0.85,  // fast   — dedicated volunteer
  partner_logistics:   0.70,  // good   — third-party partner
};

// ─── Base Cost Per KM (₹) ────────────────────────────────────────────────────
export const METHOD_BASE_COST: Record<DeliveryMethod, number> = {
  self_pickup:         0,     // free for the system
  volunteer_delivery:  8,     // ₹8/km fuel reimbursement
  partner_logistics:   14,    // ₹14/km partner rate
};
