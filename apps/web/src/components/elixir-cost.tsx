'use client';

import { Droplet } from 'lucide-react';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/** A card's elixir cost: a drop and the number. Variable costs (Mirror) show "?". */
export function ElixirCost({ cost, className }: { cost: number | null; className?: string }) {
   const { t } = useI18n();

   return (
      <span className={cn('num inline-flex items-center gap-0.5 text-xs text-muted', className)}>
         <Droplet aria-hidden className="size-3 fill-current" />
         <span className="sr-only">{t.common.elixirCost} </span>
         {cost ?? '?'}
      </span>
   );
}
