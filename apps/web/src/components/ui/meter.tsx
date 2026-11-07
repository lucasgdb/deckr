'use client';

import { Meter as BaseMeter } from '@base-ui/react/meter';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { TextSkeleton } from './skeleton';

interface MeterProps {
   label: string;
   value: number;
   max: number;
   min?: number;
   /** The value isn't known yet: the same layout, with the figure as a placeholder and an empty track. */
   loading?: boolean;
   className?: string;
}

/** An amount within a known range: the figure, a flat gold track at the true ratio, both ends labelled. */
export function Meter({ label, value, max, min = 0, loading = false, className }: MeterProps) {
   const { t } = useI18n();

   return (
      <BaseMeter.Root
         value={loading ? min : value}
         min={min}
         max={max}
         aria-busy={loading || undefined}
         className={cn('grid grid-cols-2 gap-y-3', className)}
      >
         <BaseMeter.Label className="sr-only">{label}</BaseMeter.Label>
         <p className="num col-span-2 text-2xl font-semibold">
            {loading ? <TextSkeleton className="w-12" /> : <span className="text-gold">{value}</span>}
            <span className="text-base font-normal text-muted">
               {' '}
               {t.common.of} {max}
            </span>
         </p>
         <BaseMeter.Track className="col-span-2 h-2 overflow-hidden rounded-full bg-raised">
            <BaseMeter.Indicator className="rounded-full bg-gold transition-[width] duration-500" />
         </BaseMeter.Track>
         <span aria-hidden className="num -mt-1.5 text-xs text-faint">
            {min}
         </span>
         <span aria-hidden className="num -mt-1.5 text-right text-xs text-faint">
            {max}
         </span>
      </BaseMeter.Root>
   );
}
