'use client';

import { Suspense } from 'react';
import { DeliveryAssignmentProvider } from '@/context/delivery-assignment-context';
import SmartAssignmentPanel from '@/components/delivery-assignment/smart-assignment-panel';
import { Brain, Zap, TrendingUp, ShieldCheck, RotateCcw, Star } from 'lucide-react';

export default function SmartDeliveryPage() {
  return (
    <DeliveryAssignmentProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] border-b border-white/5 px-6 py-12">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-primary text-black px-3 py-1 rounded-full uppercase tracking-widest">AI Engine v1.0</span>
                  <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic mb-3">
              Smart Delivery<br />
              <span className="text-primary">Assignment</span>
            </h1>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              AI-powered logistics engine that auto-selects the optimal delivery method using
              a multi-dimensional scoring system — balancing distance, cost, urgency, and availability
              in real time.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                { icon: <Zap className="h-3 w-3" />, label: 'Auto-Assignment' },
                { icon: <TrendingUp className="h-3 w-3" />, label: 'Urgency Scoring' },
                { icon: <ShieldCheck className="h-3 w-3" />, label: 'Cost Optimisation' },
                { icon: <RotateCcw className="h-3 w-3" />, label: 'Dynamic Reassign' },
                { icon: <Star className="h-3 w-3" />, label: 'Learning Engine' },
              ].map(f => (
                <span key={f.label} className="flex items-center gap-1.5 text-[10px] font-black text-white/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {f.icon} {f.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Score Legend */}
        <div className="border-b border-white/5 bg-[#0d0d0d]">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Critical', hint: 'Speed 70% · Dist 10% · Cost 5%', color: 'text-red-400' },
              { label: 'High',     hint: 'Speed 45% · Dist 20% · Cost 15%', color: 'text-orange-400' },
              { label: 'Medium',   hint: 'Speed 20% · Dist 30% · Cost 30%', color: 'text-yellow-400' },
              { label: 'Low',      hint: 'Speed 5% · Dist 25% · Cost 50%', color: 'text-green-400' },
            ].map(u => (
              <div key={u.label} className="text-center">
                <p className={`text-xs font-black uppercase tracking-widest ${u.color}`}>{u.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{u.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Suspense fallback={<div className="text-muted-foreground text-sm text-center py-12">Loading assignment engine...</div>}>
            <SmartAssignmentPanel />
          </Suspense>
        </div>
      </div>
    </DeliveryAssignmentProvider>
  );
}
