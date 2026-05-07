
import type { Donation } from './types';
import type { ServiceType } from './types';

/**
 * Returns estimated delivery time in minutes based on service type and distance.
 * - pickup:  NGO travels to donor, loads, returns.  ~3 min/km + 15 min buffer
 * - delivery: Volunteer picks up, packs, delivers.   ~5 min/km + 30 min buffer
 * - drop:    Donor travels to NGO.                   ~4 min/km + 20 min buffer
 */
export function getEstimatedDeliveryMinutes(
  serviceType: ServiceType,
  distanceKm: number
): number {
  switch (serviceType) {
    case 'pickup':
      return Math.round(distanceKm * 3 + 15);
    case 'delivery':
      return Math.round(distanceKm * 5 + 30);
    case 'drop':
      return Math.round(distanceKm * 4 + 20);
    default:
      return 60;
  }
}

/**
 * Returns the estimated arrival Date for a given service type & donation.
 */
export function getEstimatedArrival(
  serviceType: ServiceType,
  distanceKm: number
): Date {
  const mins = getEstimatedDeliveryMinutes(serviceType, distanceKm);
  return new Date(Date.now() + mins * 60_000);
}

/**
 * Returns true if the food will still be within its pickup deadline
 * when it arrives via the selected service type.
 */
export function isDeliverableBefore(
  donation: Donation,
  serviceType: ServiceType
): boolean {
  const arrival = getEstimatedArrival(serviceType, donation.distance);
  return arrival < donation.pickupDeadline;
}

/**
 * Returns true if at least one service type can deliver the food in time.
 */
export function canAnyServiceDeliver(donation: Donation): boolean {
  const types: ServiceType[] = ['pickup', 'delivery', 'drop'];
  return types.some((t) => isDeliverableBefore(donation, t));
}

/**
 * Returns a human-readable delivery warning string, or null if safe.
 */
export function getDeliveryWarning(
  donation: Donation,
  serviceType: ServiceType
): string | null {
  if (isDeliverableBefore(donation, serviceType)) return null;

  const mins = getEstimatedDeliveryMinutes(serviceType, donation.distance);
  const deadlineMs = donation.pickupDeadline.getTime() - Date.now();
  const deadlineMins = Math.round(deadlineMs / 60_000);
  const overBy = mins - deadlineMins;

  if (overBy <= 0) return null;

  const fmt = (m: number) =>
    m >= 60
      ? `${Math.floor(m / 60)}h ${m % 60}m`
      : `${m}m`;

  return `This food expires in ${fmt(deadlineMins)}, but ${serviceType} takes ~${fmt(mins)}. It would arrive ${fmt(overBy)} too late.`;
}

/**
 * Returns a formatted label for the estimated arrival time.
 */
export function formatArrivalLabel(
  serviceType: ServiceType,
  distanceKm: number
): string {
  const mins = getEstimatedDeliveryMinutes(serviceType, distanceKm);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
  }
  return `~${mins}m`;
}
