'use client';

import React, {
  createContext, useContext, useState, useCallback, useRef, ReactNode,
} from 'react';
import {
  AssignmentRequest, AssignmentResult, ScoredOption,
  DeliveryOption, HistoryEntry, UrgencyLevel,
} from '@/lib/delivery-assignment/types';
import { buildOptions, scoreOptions, autoSelect } from '@/lib/delivery-assignment/scoring-engine';
import { getPerformanceScores, recordOutcome, getPerformanceSummary } from '@/lib/delivery-assignment/learning';

// ─── Mock Resource Pool ───────────────────────────────────────────────────────
// In production, fetch these from Firestore or a REST API
const MOCK_VOLUNTEERS = [
  { id: 'v1', name: 'Ravi Kumar',   lat: 12.9800, lng: 77.5900, isOnline: true  },
  { id: 'v2', name: 'Priya Singh',  lat: 12.9650, lng: 77.6100, isOnline: true  },
  { id: 'v3', name: 'Arjun Mehta',  lat: 12.9550, lng: 77.5800, isOnline: false },
];
const MOCK_PARTNERS = [
  { id: 'p1', name: 'SwiftDeliver',    available: true  },
  { id: 'p2', name: 'QuickMove Cargo', available: false },
];

// ─── Context Type ─────────────────────────────────────────────────────────────
interface DeliveryAssignmentContextType {
  assignments:     AssignmentResult[];
  currentRequest:  AssignmentRequest | null;
  isProcessing:    boolean;
  // Actions
  createRequest:   (req: Omit<AssignmentRequest, 'id' | 'requestedAt'>) => Promise<AssignmentResult>;
  acceptOption:    (requestId: string, option: ScoredOption) => void;
  triggerReassign: (requestId: string) => Promise<void>;
  markDelivered:   (requestId: string, actualMinutes: number) => void;
  markFailed:      (requestId: string) => void;
  getPerformance:  () => ReturnType<typeof getPerformanceSummary>;
}

const Ctx = createContext<DeliveryAssignmentContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DeliveryAssignmentProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<AssignmentResult[]>([]);
  const [currentRequest, setCurrentRequest] = useState<AssignmentRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const reassignTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Helper: update one assignment ─────────────────────────────────────────
  const update = useCallback((requestId: string, patch: Partial<AssignmentResult>) => {
    setAssignments(prev => prev.map(a => a.requestId === requestId ? { ...a, ...patch } : a));
  }, []);

  // ── Create + auto-score ───────────────────────────────────────────────────
  const createRequest = useCallback(async (
    reqData: Omit<AssignmentRequest, 'id' | 'requestedAt'>
  ): Promise<AssignmentResult> => {
    setIsProcessing(true);

    const req: AssignmentRequest = {
      ...reqData,
      id: `req_${Date.now()}`,
      requestedAt: new Date(),
    };
    setCurrentRequest(req);

    // Simulate async resource lookup (replaces Firestore fetch in production)
    await delay(800);

    const rawOptions = buildOptions(req, MOCK_VOLUNTEERS, MOCK_PARTNERS);
    const perfScores  = getPerformanceScores();
    const scored      = scoreOptions(rawOptions, req.urgency, perfScores);
    const best        = autoSelect(scored);

    const log: HistoryEntry = {
      timestamp: new Date(),
      action:    'auto_scored',
      method:    best?.method,
      detail:    best
        ? `Auto-selected "${best.label}" with score ${best.scores.total}`
        : 'No available option found',
    };

    const result: AssignmentResult = {
      requestId:      req.id,
      status:         best ? 'assigned' : 'failed',
      selectedOption: best,
      allOptions:     scored,
      assignedAt:     best ? new Date() : null,
      retryCount:     0,
      history:        [log],
    };

    setAssignments(prev => [result, ...prev]);
    setIsProcessing(false);

    // Auto-reassign if no response within 3 min (180,000ms — reduced to 10s for demo)
    if (best) scheduleReassign(req, result);

    return result;
  }, []);

  // ── Manual option accept ──────────────────────────────────────────────────
  const acceptOption = useCallback((requestId: string, option: ScoredOption) => {
    clearReassign(requestId);
    update(requestId, {
      status:         'assigned',
      selectedOption: option,
      assignedAt:     new Date(),
    });
    addLog(requestId, 'manual_accept', option.method, `Donor manually selected "${option.label}"`);
  }, [update]);

  // ── Dynamic Reassignment ──────────────────────────────────────────────────
  const triggerReassign = useCallback(async (requestId: string) => {
    const assignment = assignments.find(a => a.requestId === requestId);
    if (!assignment) return;

    update(requestId, { status: 'reassigning' });
    addLog(requestId, 'reassigning', undefined, 'No response — starting dynamic reassignment');

    await delay(600);

    // Re-run scoring (volunteers/partners may have changed)
    const req = currentRequest;
    if (!req) return;

    const rawOptions = buildOptions(req, MOCK_VOLUNTEERS, MOCK_PARTNERS);
    const perfScores  = getPerformanceScores();
    const scored      = scoreOptions(rawOptions, req.urgency, perfScores);
    // Exclude the previously selected method on reassign
    const filtered    = scored.filter(o => o.method !== assignment.selectedOption?.method);
    const next        = autoSelect(filtered.length ? filtered : scored);

    if (next) {
      update(requestId, {
        status:         'assigned',
        selectedOption: next,
        allOptions:     scored,
        assignedAt:     new Date(),
        retryCount:     (assignment.retryCount || 0) + 1,
      });
      addLog(requestId, 'reassigned', next.method,
        `Reassigned to "${next.label}" (attempt ${(assignment.retryCount || 0) + 1})`);
    } else {
      update(requestId, { status: 'failed' });
      addLog(requestId, 'failed', undefined, 'No alternative available — delivery failed');
    }
  }, [assignments, currentRequest, update]);

  // ── Mark delivered (records outcome for learning) ─────────────────────────
  const markDelivered = useCallback((requestId: string, actualMinutes: number) => {
    clearReassign(requestId);
    const a = assignments.find(x => x.requestId === requestId);
    if (!a?.selectedOption) return;
    recordOutcome(a.selectedOption.method, true, a.selectedOption.estimatedMinutes, actualMinutes);
    update(requestId, { status: 'assigned' });
    addLog(requestId, 'delivered', a.selectedOption.method, `Delivered in ${actualMinutes} min (est. ${a.selectedOption.estimatedMinutes} min)`);
  }, [assignments, update]);

  // ── Mark failed ───────────────────────────────────────────────────────────
  const markFailed = useCallback((requestId: string) => {
    clearReassign(requestId);
    const a = assignments.find(x => x.requestId === requestId);
    if (a?.selectedOption) {
      recordOutcome(a.selectedOption.method, false, a.selectedOption.estimatedMinutes, a.selectedOption.estimatedMinutes + 60);
    }
    update(requestId, { status: 'failed' });
    addLog(requestId, 'failed', undefined, 'Marked as failed by user');
  }, [assignments, update]);

  // ── Performance Data ──────────────────────────────────────────────────────
  const getPerformance = useCallback(() => getPerformanceSummary(), []);

  // ─── Internal Helpers ─────────────────────────────────────────────────────
  function addLog(requestId: string, action: string, method?: any, detail?: string) {
    setAssignments(prev => prev.map(a => {
      if (a.requestId !== requestId) return a;
      return { ...a, history: [...a.history, { timestamp: new Date(), action, method, detail: detail ?? '' }] };
    }));
  }

  function scheduleReassign(req: AssignmentRequest, result: AssignmentResult) {
    // 30-second no-response window for demo (replace with 3 min in production)
    const timer = setTimeout(() => triggerReassign(result.requestId), 30_000);
    reassignTimers.current.set(result.requestId, timer);
  }

  function clearReassign(requestId: string) {
    const t = reassignTimers.current.get(requestId);
    if (t) { clearTimeout(t); reassignTimers.current.delete(requestId); }
  }

  return (
    <Ctx.Provider value={{
      assignments, currentRequest, isProcessing,
      createRequest, acceptOption, triggerReassign,
      markDelivered, markFailed, getPerformance,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDeliveryAssignment() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDeliveryAssignment must be inside DeliveryAssignmentProvider');
  return ctx;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
