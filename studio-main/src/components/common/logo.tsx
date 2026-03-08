import { HandHeart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold text-lg", className)}>
      <div className="bg-primary p-1.5 rounded-lg">
        <HandHeart className="h-5 w-5 text-primary-foreground" />
      </div>
      {!iconOnly && <span className="font-headline tracking-tight">Nourish Connect</span>}
    </div>
  );
}
