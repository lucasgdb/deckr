'use client';

import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A two-state button (`aria-pressed`). Style the off state with `not-data-pressed:`. */
export function Toggle({ className, ...props }: ComponentProps<typeof BaseToggle> & { className?: string }) {
   return <BaseToggle className={cn('cursor-pointer select-none', className)} {...props} />;
}
