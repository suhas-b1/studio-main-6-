// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryMethod = 'self_pickup' | 'volunteer_delivery' | 'partner_logistics' | 'emergency_fast';
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
  expiry:       number;
}

export interface ScoredOption extends DeliveryOption {
  scores: {
    distance:     number;
    cost:         number;
    urgency:      number;
    availability: number;
    expiry:       number;
    total:        number;
  };
  rank: number;
  recommended: boolean;
  reasoning: string;
  futureSuggestion?: string; // e.g., "Drone Delivery Possible"
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
  pickupDeadlineMinutes: number; // Used as expiryMinutes
  requestedAt: Date;
  isRemoteArea?: boolean;
  isFloodZone?: boolean;
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
export const URGENCY_WEIGHTS: Record<UrgencyLevel, ScoringWeights> = {
  critical: { distance: 0.05, cost: 0.05, urgency: 0.50, availability: 0.10, expiry: 0.30 },
  high:     { distance: 0.15, cost: 0.10, urgency: 0.40, availability: 0.15, expiry: 0.20 },
  medium:   { distance: 0.25, cost: 0.25, urgency: 0.20, availability: 0.15, expiry: 0.15 },
  low:      { distance: 0.25, cost: 0.50, urgency: 0.05, availability: 0.15, expiry: 0.05 },
};

// ─── Method Speed Scores (0-1) ────────────────────────────────────────────────
export const METHOD_SPEED_SCORE: Record<DeliveryMethod, number> = {
  self_pickup:         0.5,
  volunteer_delivery:  0.85,
  partner_logistics:   0.70,
  emergency_fast:      0.95,
};

// ─── Base Cost Per KM (₹) ────────────────────────────────────────────────────
export const METHOD_BASE_COST: Record<DeliveryMethod, number> = {
  self_pickup:         0,
  volunteer_delivery:  8,
  partner_logistics:   14,
  emergency_fast:      25,
};
