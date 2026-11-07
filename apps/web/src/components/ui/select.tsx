'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fieldRing } from './input';
import { floatingItem, floatingSurface } from './popup';
import { TextSkeleton } from './skeleton';

export interface SelectItem<Value extends string> {
   value: Value;
   label: string;
   disabled?: boolean;
}

interface SelectProps<Value extends string> {
   label: ReactNode;
   items: readonly SelectItem<Value>[];
   value: Value;
   onValueChange: (value: Value) => void;
   className?: string;
   /** Shows the label beside the trigger instead of above it. */
   inline?: boolean;
   /** Keeps the label for screen readers only below `xl`, where the value says enough ("Any arena"). */
   compact?: boolean;
   /** The value isn't known yet: the trigger is disabled and shows this instead (a placeholder, or a default). */
   loading?: ReactNode;
}

export function Select<Value extends string>({
   label,
   items,
   value,
   onValueChange,
   className,
   inline,
   compact,
   loading,
}: SelectProps<Value>) {
   const pending = loading !== undefined && loading !== null && loading !== false;

   return (
      <BaseSelect.Root
         items={items as SelectItem<Value>[]}
         value={value}
         disabled={pending}
         onValueChange={(next) => {
            if (next !== null) onValueChange(next as Value);
         }}
      >
         <div className={cn('flex', inline ? 'items-center gap-3' : 'flex-col gap-2', className)}>
            <BaseSelect.Label className={cn('font-medium whitespace-nowrap', compact && 'max-xl:sr-only')}>
               {label}
            </BaseSelect.Label>
            <BaseSelect.Trigger
               className={cn(
                  'flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-full border border-control bg-ground pr-3 pl-4 text-left pointer-fine:sm:h-9',
                  'hover:bg-active data-disabled:cursor-default data-disabled:hover:bg-ground data-popup-open:border-muted data-popup-open:bg-active data-popup-open:ring-4 data-popup-open:ring-ink/15',
                  fieldRing,
               )}
            >
               {pending ? (
                  <span className="truncate">{loading === true ? <TextSkeleton className="w-32" /> : loading}</span>
               ) : (
                  <BaseSelect.Value className="truncate" />
               )}
               <BaseSelect.Icon className="text-muted">
                  <ChevronsUpDown aria-hidden className="size-4" />
               </BaseSelect.Icon>
            </BaseSelect.Trigger>
         </div>
         <BaseSelect.Portal>
            <BaseSelect.Positioner className="z-50 outline-none" sideOffset={6} alignItemWithTrigger={false}>
               <BaseSelect.Popup className={cn(floatingSurface, 'min-w-(--anchor-width)')}>
                  <BaseSelect.List className="max-h-[min(24rem,var(--available-height))] scroll-py-1 overflow-y-auto">
                     {items.map((item) => (
                        <BaseSelect.Item
                           key={item.value}
                           value={item.value}
                           disabled={item.disabled}
                           className={cn(floatingItem, 'grid grid-cols-[1rem_1fr]')}
                        >
                           <BaseSelect.ItemIndicator className="col-start-1 text-gold">
                              <Check aria-hidden />
                           </BaseSelect.ItemIndicator>
                           <BaseSelect.ItemText className="col-start-2">{item.label}</BaseSelect.ItemText>
                        </BaseSelect.Item>
                     ))}
                  </BaseSelect.List>
               </BaseSelect.Popup>
            </BaseSelect.Positioner>
         </BaseSelect.Portal>
      </BaseSelect.Root>
   );
}
