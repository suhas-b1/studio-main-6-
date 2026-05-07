'use client';

import { useState } from 'react';
import { useDeliveryAssignment } from '@/context/delivery-assignment-context';
import { UrgencyLevel } from '@/lib/delivery-assignment/types';
import { OptionCard } from './option-card';
import {
  Brain, Loader2, RotateCcw, CheckCircle2, XCircle,
  History, MapPin, Zap, TrendingUp, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  critical: 'border-red-500    bg-red-500/10    text-red-400',
  high:     'border-orange-500 bg-orange-500/10 text-orange-400',
  medium:   'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  low:      'border-green-500  bg-green-500/10  text-green-400',
};

// ─── Demo Form ────────────────────────────────────────────────────────────────
const DEMO_SCENARIOS = [
  {
    label: '🏙️ Nearby Critical',
    req: { donationTitle: 'Rice & Dal (5 kg)', donorLat: 12.9716, donorLng: 77.5946, receiverLat: 12.9730, receiverLng: 77.5960, urgency: 'critical' as UrgencyLevel, foodWeightKg: 5, pickupDeadlineMinutes: 30, donationId: 'd1' },
  },
  {
    label: '📦 Medium Distance High',
    req: { donationTitle: 'Cooked Meals (20 packs)', donorLat: 12.9716, donorLng: 77.5946, receiverLat: 12.9200, receiverLng: 77.6500, urgency: 'high' as UrgencyLevel, foodWeightKg: 15, pickupDeadlineMinutes: 60, donationId: 'd2' },
  },
  {
    label: '🌆 Far Low Priority',
    req: { donationTitle: 'Canned Goods (30 kg)', donorLat: 12.9716, donorLng: 77.5946, receiverLat: 12.8000, receiverLng: 77.7500, urgency: 'low' as UrgencyLevel, foodWeightKg: 30, pickupDeadlineMinutes: 180, donationId: 'd3' },
  },
];

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function SmartAssignmentPanel() {
  const { assignments, isProcessing, createRequest, acceptOption, triggerReassign, markDelivered, markFailed, getPerformance } = useDeliveryAssignment();
  const [activeTab, setActiveTab] = useState<'assign' | 'history' | 'performance'>('assign');
  const [showAllOptions, setShowAllOptions] = useState<Record<string, boolean>>({});

  const handleScenario = async (scenario: typeof DEMO_SCENARIOS[number]) => {
    await createRequest(scenario.req);
    setActiveTab('assign');
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
        {(['assign', 'history', 'performance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
              activeTab === tab ? 'bg-primary text-black shadow-md' : 'text-muted-foreground hover:text-white',
            )}
          >
            {tab === 'assign' ? '🤖 Assign' : tab === 'history' ? '📋 History' : '📊 Learning'}
          </button>
        ))}
      </div>

      {/* ── ASSIGN TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'assign' && (
        <div className="space-y-6">
          {/* Demo Scenarios */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Quick Demo Scenarios</h3>
            <div className="grid gap-3">
              {DEMO_SCENARIOS.map(s => (
                <button
                  key={s.label}
                  disabled={isProcessing}
                  onClick={() => handleScenario(s)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-left disabled:opacity-50 group"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.req.donationTitle}</p>
                  </div>
                  <div className={cn('text-[10px] font-black px-2 py-1 rounded-full border uppercase', URGENCY_COLORS[s.req.urgency])}>
                    {s.req.urgency}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white uppercase tracking-tight">AI Scoring...</p>
                <p className="text-xs text-muted-foreground animate-pulse">Analysing distance, cost, urgency & availability</p>
              </div>
              <div className="flex gap-2">
                {['Distance', 'Cost', 'Speed', 'Availability'].map((dim, i) => (
                  <span
                    key={dim}
                    className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full uppercase animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    {dim}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Latest Assignment Result */}
          {!isProcessing && assignments.length > 0 && (
            <AssignmentResultPanel
              assignment={assignments[0]}
              showAll={showAllOptions[assignments[0].requestId] ?? false}
              onToggleAll={() => setShowAllOptions(p => ({ ...p, [assignments[0].requestId]: !p[assignments[0].requestId] }))}
              onAccept={opt => acceptOption(assignments[0].requestId, opt)}
              onReassign={() => triggerReassign(assignments[0].requestId)}
              onDelivered={() => markDelivered(assignments[0].requestId, Math.round(assignments[0].selectedOption!.estimatedMinutes * (0.8 + Math.random() * 0.4)))}
              onFailed={() => markFailed(assignments[0].requestId)}
            />
          )}
        </div>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <EmptyState label="No assignments yet. Run a demo scenario." />
          ) : (
            assignments.map(a => (
              <div key={a.requestId} className="bg-[#111] border border-white/8 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                      {a.requestId.replace('req_', '#')}
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {a.selectedOption?.label ?? 'Unassigned'} · {a.selectedOption ? `Score ${a.selectedOption.scores.total}` : '—'}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  {a.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground">
                      <span className="text-[9px] text-white/30 font-mono mt-0.5 flex-shrink-0">
                        {formatDistanceToNow(h.timestamp, { addSuffix: true })}
                      </span>
                      <span>{h.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PERFORMANCE TAB ──────────────────────────────────────────────── */}
      {activeTab === 'performance' && <PerformancePanel getPerformance={getPerformance} />}
    </div>
  );
}

// ─── Assignment Result ────────────────────────────────────────────────────────
function AssignmentResultPanel({ assignment, showAll, onToggleAll, onAccept, onReassign, onDelivered, onFailed }: any) {
  const { selectedOption, allOptions, status, retryCount } = assignment;

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {retryCount > 0 && (
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
              Retry #{retryCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {status === 'assigned' && (
            <>
              <button
                onClick={onDelivered}
                className="text-[10px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl hover:bg-green-500/20 transition uppercase tracking-widest"
              >
                ✓ Mark Delivered
              </button>
              <button
                onClick={onFailed}
                className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl hover:bg-red-500/20 transition uppercase tracking-widest"
              >
                ✗ Mark Failed
              </button>
            </>
          )}
          {(status === 'assigned' || status === 'failed') && (
            <button
              onClick={onReassign}
              className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/10 transition flex items-center gap-1 uppercase tracking-widest"
            >
              <RotateCcw className="h-3 w-3" /> Reassign
            </button>
          )}
        </div>
      </div>

      {/* Recommended option */}
      {selectedOption && (
        <div>
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">
            🤖 AI Recommended Assignment
          </h3>
          <OptionCard option={selectedOption} onAccept={onAccept} />
        </div>
      )}

      {/* All options toggle */}
      <button
        onClick={onToggleAll}
        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-muted-foreground hover:text-white hover:bg-white/10 transition uppercase tracking-widest"
      >
        {showAll ? '▲ Hide All Options' : `▼ Compare All ${allOptions.length} Options`}
      </button>

      {showAll && (
        <div className="grid gap-4">
          {allOptions.filter((o: any) => o.method !== selectedOption?.method).map((o: any) => (
            <OptionCard key={o.method} option={o} onAccept={onAccept} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Performance Panel ────────────────────────────────────────────────────────
function PerformancePanel({ getPerformance }: { getPerformance: () => any[] }) {
  const data = getPerformance();
  const METHOD_LABELS: Record<string, string> = {
    self_pickup:         '🚶 Self Pickup',
    volunteer_delivery:  '🛵 Volunteer',
    partner_logistics:   '🚚 Partner',
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-black text-white">Learning Engine</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The AI learns from every completed delivery. Mark deliveries as "Delivered" or "Failed"
          to train the model. Scores improve automatically over time.
        </p>
      </div>
      {data.map(d => (
        <div key={d.method} className="bg-[#111] border border-white/8 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-white">{METHOD_LABELS[d.method]}</h4>
            <span className="text-[10px] font-bold text-muted-foreground">{d.totalRuns} runs</span>
          </div>
          {d.totalRuns === 0 ? (
            <p className="text-xs text-muted-foreground italic">No data yet — complete deliveries to train</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Success Rate</span>
                <span className={cn('text-sm font-black', d.successRate >= 80 ? 'text-green-400' : d.successRate >= 50 ? 'text-yellow-400' : 'text-red-400')}>
                  {d.successRate}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', d.successRate >= 80 ? 'bg-green-500' : d.successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                  style={{ width: `${d.successRate}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Avg delta: <span className={cn('font-bold', d.avgDeltaMin <= 0 ? 'text-green-400' : 'text-orange-400')}>{d.avgDeltaMin > 0 ? '+' : ''}{d.avgDeltaMin} min</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending:     { color: 'text-white/40 bg-white/5 border-white/10', icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'Pending' },
    scoring:     { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: <Brain className="h-3 w-3 animate-pulse" />, label: 'Scoring' },
    assigned:    { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Assigned' },
    reassigning: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: <RotateCcw className="h-3 w-3 animate-spin" />, label: 'Reassigning' },
    failed:      { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle className="h-3 w-3" />, label: 'Failed' },
  };
  const c = cfg[status] ?? cfg.pending;
  return (
    <span className={cn('flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest', c.color)}>
      {c.icon} {c.label}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Brain className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground italic">{label}</p>
    </div>
  );
}
