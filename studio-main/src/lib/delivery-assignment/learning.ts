// Learning module: stores past assignment outcomes in localStorage
// Used to bias future scoring toward historically reliable methods

import { DeliveryMethod } from './types';

const STORAGE_KEY = 'nc_delivery_history';

interface OutcomeRecord {
  method:    DeliveryMethod;
  success:   boolean;
  minutesDelta: number; // actual - estimated (negative = early)
  timestamp: number;
}

function load(): OutcomeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function save(records: OutcomeRecord[]) {
  if (typeof window === 'undefined') return;
  // Keep last 200 records
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-200)));
}

export function recordOutcome(
  method: DeliveryMethod,
  success: boolean,
  estimatedMinutes: number,
  actualMinutes: number
) {
  const records = load();
  records.push({ method, success, minutesDelta: actualMinutes - estimatedMinutes, timestamp: Date.now() });
  save(records);
}

/**
 * Returns reliability score per method (0–1) based on recent history.
 * Falls back to 0.75 if no data exists for a method.
 */
export function getPerformanceScores(): Record<DeliveryMethod, number> {
  const records = load();
  const methods: DeliveryMethod[] = ['self_pickup', 'volunteer_delivery', 'partner_logistics'];

  const result = {} as Record<DeliveryMethod, number>;
  for (const method of methods) {
    const relevant = records.filter(r => r.method === method).slice(-30); // last 30
    if (relevant.length === 0) { result[method] = 0.75; continue; }

    const successRate = relevant.filter(r => r.success).length / relevant.length;
    // Penalise for being consistently late
    const avgDelta = relevant.reduce((s, r) => s + r.minutesDelta, 0) / relevant.length;
    const timePenalty = Math.max(0, Math.min(0.2, avgDelta / 60)); // max 20% penalty
    result[method] = Math.max(0, Math.min(1, successRate - timePenalty));
  }
  return result;
}

/**
 * Summarised performance stats for UI display.
 */
export function getPerformanceSummary(): {
  method: DeliveryMethod;
  totalRuns: number;
  successRate: number;
  avgDeltaMin: number;
}[] {
  const records = load();
  const methods: DeliveryMethod[] = ['self_pickup', 'volunteer_delivery', 'partner_logistics'];
  return methods.map(method => {
    const r = records.filter(rec => rec.method === method);
    return {
      method,
      totalRuns: r.length,
      successRate: r.length ? parseFloat(((r.filter(x => x.success).length / r.length) * 100).toFixed(1)) : 0,
      avgDeltaMin: r.length ? parseFloat((r.reduce((s, x) => s + x.minutesDelta, 0) / r.length).toFixed(1)) : 0,
    };
  });
}
