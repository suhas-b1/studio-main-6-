'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { EmergencyAlertDialog } from './emergency-alert-dialog';
import { cn } from '@/lib/utils';

interface EmergencyButtonProps {
  className?: string;
  variant?: 'fab' | 'inline';
}

export function EmergencyButton({ className, variant = 'fab' }: EmergencyButtonProps) {
  const [open, setOpen] = useState(false);

  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition active:scale-95',
            className
          )}
        >
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <span className="text-red-400">Emergency Alert</span>
        </button>
        <EmergencyAlertDialog open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  // FAB (Floating Action Button) variant
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-50 flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-2xl transition active:scale-95',
          'animate-[pulse_2s_ease-in-out_infinite]',
          className
        )}
        style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          boxShadow: '0 0 0 0 rgba(220,38,38,0.7), 0 8px 30px rgba(220,38,38,0.5)',
          animation: 'sos-pulse 2s infinite',
        }}
        title="Send Emergency Alert"
        aria-label="Emergency Alert"
      >
        <ShieldAlert className="h-7 w-7 text-white" />
        <span className="text-[9px] font-black text-white mt-0.5">SOS</span>
      </button>

      <style jsx global>{`
        @keyframes sos-pulse {
          0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7), 0 8px 30px rgba(220,38,38,0.4); }
          70% { box-shadow: 0 0 0 16px rgba(220,38,38,0), 0 8px 30px rgba(220,38,38,0.4); }
          100% { box-shadow: 0 0 0 0 rgba(220,38,38,0), 0 8px 30px rgba(220,38,38,0.4); }
        }
      `}</style>

      <EmergencyAlertDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
