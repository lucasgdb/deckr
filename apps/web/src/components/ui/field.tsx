'use client';

import { Field as BaseField } from '@base-ui/react/field';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
   label: ReactNode;
   /** What the field accepts; hidden while `error` is shown. */
   hint?: ReactNode;
   error?: string | null;
   /** Something to show beside the label, such as a help button. */
   labelAside?: ReactNode;
   className?: string;
   /** An `Input`/`PrefixInput` from this design system; Base UI wires the label, hint and error to it. */
   children: ReactNode;
}

/** Label above the control, hint or error below it. */
export function Field({ label, hint, error, labelAside, className, children }: FieldProps) {
   return (
      <BaseField.Root invalid={Boolean(error)} className={cn('flex flex-col', className)}>
         <div className="mb-2 flex items-center gap-1.5">
            <BaseField.Label className="font-medium">{label}</BaseField.Label>
            {labelAside}
         </div>
         {children}
         {error ? null : hint ? (
            <BaseField.Description className="mt-2 text-xs text-faint">{hint}</BaseField.Description>
         ) : null}
         <BaseField.Error match={Boolean(error)} className="mt-2 text-xs text-negative">
            {error}
         </BaseField.Error>
      </BaseField.Root>
   );
}
