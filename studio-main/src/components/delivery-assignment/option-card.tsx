'use client';

import { ScoredOption, DeliveryMethod } from '@/lib/delivery-assignment/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, IndianRupee, MapPin, Zap, Star, AlertCircle } from 'lucide-react';

const METHOD_ICONS: Record<DeliveryMethod, string> = {
  self_pickup:         '🚶',
  volunteer_delivery:  '🛵',
  partner_logistics:   '🚚',
  emergency_fast:      '⚡',
};

const METHOD_COLORS: Record<DeliveryMethod, { ring: string; badge: string; glow: string }> = {
  self_pickup:        { ring: 'border-blue-500/40',   badge: 'bg-blue-500/20 text-blue-400',   glow: 'shadow-blue-500/10'   },
  volunteer_delivery: { ring: 'border-primary/40',    badge: 'bg-primary/20 text-primary',      glow: 'shadow-primary/10'    },
  partner_logistics:  { ring: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-400',glow: 'shadow-purple-500/10' },
  emergency_fast:     { ring: 'border-red-500/40',    badge: 'bg-red-500/20 text-red-400',      glow: 'shadow-red-500/10'    },
};

interface OptionCardProps {
  option:    ScoredOption;
  onAccept?: (option: ScoredOption) => void;
  compact?:  boolean;
}

export function OptionCard({ option, onAccept, compact }: OptionCardProps) {
  const colors = METHOD_COLORS[option.method];

  return (
    <div className={cn(
      'relative rounded-3xl border p-5 transition-all duration-300 overflow-hidden',
      'bg-[#111] hover:bg-[#161616]',
      option.recommended ? `${colors.ring} shadow-xl ${colors.glow}` : 'border-white/8',
      !option.isAvailable && 'opacity-50 cursor-not-allowed',
    )}>
      {/* Recommended badge */}
      {option.recommended && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          <Star className="h-3 w-3" /> AI Smart Pick
        </div>
      )}

      {/* Unavailable badge */}
      {!option.isAvailable && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 text-muted-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          <AlertCircle className="h-3 w-3" /> Unavailable
        </div>
      )}

      {/* Future Suggestion */}
      {option.futureSuggestion && (
        <div className="mb-4 bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-start gap-3 animate-pulse">
          <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] font-black text-primary uppercase tracking-wider leading-relaxed">
            {option.futureSuggestion}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl">{METHOD_ICONS[option.method]}</div>
        <div>
          <h3 className="text-lg font-black text-white">{option.label}</h3>
          {option.resourceName && (
            <p className="text-xs text-muted-foreground font-medium">via {option.resourceName}</p>
          )}
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Metric icon={<Clock className="h-3.5 w-3.5" />} label="ETA" value={`${option.estimatedMinutes} min`} />
        <Metric
          icon={<IndianRupee className="h-3.5 w-3.5" />}
          label="Cost"
          value={option.costRupees === 0 ? 'Free' : `₹${option.costRupees}`}
          highlight={option.costRupees === 0}
        />
        <Metric icon={<MapPin className="h-3.5 w-3.5" />} label="Distance" value={`${option.distanceKm.toFixed(1)} km`} />
      </div>

      {/* Score bars */}
      {!compact && (
        <div className="space-y-2 mb-4 bg-white/2 rounded-2xl p-3">
          <ScoreBar label="Distance" value={option.scores.distance} color="bg-blue-500" />
          <ScoreBar label="Cost"     value={option.scores.cost}     color="bg-green-500" />
          <ScoreBar label="Expiry"   value={option.scores.expiry}   color="bg-orange-500" />
          <ScoreBar label="Reliab."  value={option.scores.availability} color="bg-purple-500" />
        </div>
      )}

      {/* Total score */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Decision Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${option.scores.total}%`, background: option.recommended ? '#f97316' : '#6b7280' }}
            />
          </div>
          <span className="text-sm font-black text-white">{option.scores.total}</span>
        </div>
      </div>

      {/* Reasoning */}
      {!compact && option.reasoning && (
        <p className="text-[11px] text-muted-foreground leading-relaxed bg-white/5 rounded-2xl px-4 py-3 mb-4 italic border border-white/5">
          🤖 Reasoning: {option.reasoning}
        </p>
      )}

      {/* Accept button */}
      {onAccept && option.isAvailable && (
        <button
          onClick={() => onAccept(option)}
          className={cn(
            'w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl',
            option.recommended
              ? 'bg-primary text-black hover:bg-primary/90 hover:scale-[1.02] active:scale-95'
              : 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
          )}
        >
          <CheckCircle2 className="h-4 w-4 inline mr-2" />
          {option.recommended ? 'Accept Smart Assignment' : 'Choose This Option'}
        </button>
      )}
    </div>
  );
}

function Metric({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
      <div className={cn('flex justify-center mb-1', highlight ? 'text-green-400' : 'text-muted-foreground')}>{icon}</div>
      <p className={cn('text-sm font-black', highlight ? 'text-green-400' : 'text-white')}>{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-muted-foreground w-14 uppercase font-bold tracking-widest text-left">{label}</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[9px] font-black text-white w-6 text-right">{value}</span>
    </div>
  );
}
