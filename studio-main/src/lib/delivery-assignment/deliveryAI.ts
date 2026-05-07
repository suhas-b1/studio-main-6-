import { 
  AssignmentRequest, 
  UrgencyLevel, 
  ScoredOption 
} from './types';
import { 
  buildOptions, 
  scoreOptions, 
  autoSelect 
} from './scoring-engine';

/**
 * AI Smart Delivery Assignment Logic (Hackathon Level)
 * 
 * This service implements an intelligent decision-making algorithm that 
 * selects the optimal delivery method based on distance, expiry, and urgency.
 */
export function assignDeliveryAI(params: {
  expiryMinutes: number;
  distanceKm: number;
  volunteerAvailable: boolean;
  priority: UrgencyLevel;
  isFloodZone?: boolean;
  isRemoteArea?: boolean;
}) {
  const { 
    expiryMinutes, 
    distanceKm, 
    volunteerAvailable, 
    priority,
    isFloodZone,
    isRemoteArea 
  } = params;

  // 1. Create a virtual request for our engine
  const req: AssignmentRequest = {
    id: `ai_${Date.now()}`,
    donationId: 'ai-request',
    donationTitle: 'Intelligent Assignment',
    donorLat: 0, donorLng: 0, // Virtual relative coords
    receiverLat: 0, receiverLng: distanceKm / 111, // Rough lat shift
    urgency: priority,
    foodWeightKg: 5,
    pickupDeadlineMinutes: expiryMinutes,
    requestedAt: new Date(),
    isFloodZone,
    isRemoteArea
  };

  // 2. Mock resource pool for decision logic
  const mockVolunteers = volunteerAvailable 
    ? [{ id: 'v1', name: 'Hero Volunteer', lat: 0, lng: 0, isOnline: true }] 
    : [];
  const mockPartners = [{ id: 'p1', name: 'Porter Logistics', available: true }];

  // 3. Run full scoring engine
  const rawOptions = buildOptions(req, mockVolunteers, mockPartners);
  const scored = scoreOptions(rawOptions, req);
  const best = autoSelect(scored);

  // 4. Return result in the format requested by the plan
  return {
    method: best?.label || "Volunteer",
    reason: best?.reasoning || "Standard delivery",
    score: best?.scores.total || 0,
    futureSuggestion: best?.futureSuggestion,
    details: best
  };
}

/**
 * Simple Score System (Bonus Feature)
 */
export function calculateDeliveryScore(urgency: number, expiryRisk: number, distance: number) {
  // Higher score -> faster delivery option
  return (urgency * 5) + (expiryRisk * 4) + (distance * 2);
}
