'use client';

import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { Button } from './button';

/** One sentence in the frame where the data would be. */
export function EmptyState({
   children,
   action,
   className,
}: {
   children: ReactNode;
   action?: ReactNode;
   className?: string;
}) {
   return (
      <div
         className={cn(
            'flex flex-wrap items-center justify-between gap-3 rounded-field border border-dashed border-control px-4 py-4 text-muted',
            className,
         )}
      >
         <p>{children}</p>
         {action}
      </div>
   );
}

/** What failed, inside the block that failed, with a way to try again. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
   const { t } = useI18n();

   return (
      <div
         role="alert"
         className="flex flex-col items-start gap-2 rounded-field bg-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
         <p className="flex gap-2">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-negative" />
            {message}
         </p>
         {onRetry ? (
            <Button variant="ghost" className="-ml-2 sm:ml-0" onClick={onRetry}>
               {t.common.tryAgain}
            </Button>
         ) : null}
      </div>
   );
}

/** A one-line status for the whole screen: what to do next, or that it's done. */
export function Notice({
   tone = 'info',
   children,
   className,
}: {
   tone?: 'info' | 'success';
   children: ReactNode;
   className?: string;
}) {
   const Icon = tone === 'success' ? CircleCheck : Info;

   return (
      <p
         aria-live="polite"
         className={cn('flex items-center gap-2.5 rounded-field bg-surface px-4 py-3 text-muted', className)}
      >
         <Icon aria-hidden className={cn('size-4 shrink-0', tone === 'success' ? 'text-gold' : 'text-faint')} />
         {children}
      </p>
   );
}
