import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A resting surface: one lightness step above the ground, no border, no shadow. */
export function Card({ className, ...props }: ComponentProps<'section'>) {
   return <section className={cn('rounded-card bg-surface p-4 sm:p-pad', className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
   return (
      <div
         className={cn('mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:mb-5', className)}
         {...props}
      />
   );
}

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
   return <h2 className={cn('text-base font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
   return <p className={cn('text-muted', className)} {...props} />;
}
