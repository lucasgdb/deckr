'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<Value extends string> {
   value: Value;
   label: ReactNode;
   disabled?: boolean;
}

interface TabsProps<Value extends string> {
   items: readonly TabItem<Value>[];
   value: Value;
   onValueChange: (value: Value) => void;
   /** Names the set of tabs for assistive tech. */
   label: string;
   className?: string;
   children: ReactNode;
}

/**
 * A segmented control that switches panels. The selected tab sits on a sliding pill.
 * Put one `TabPanel` per item inside.
 */
export function Tabs<Value extends string>({
   items,
   value,
   onValueChange,
   label,
   className,
   children,
}: TabsProps<Value>) {
   return (
      <BaseTabs.Root value={value} onValueChange={(next) => onValueChange(next as Value)} className={className}>
         <BaseTabs.List
            aria-label={label}
            className="relative z-0 grid auto-cols-fr grid-flow-col rounded-full bg-ground p-1"
         >
            {items.map((item) => (
               <BaseTabs.Tab
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className="flex h-10 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium whitespace-nowrap text-muted outline-none transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink data-active:text-black data-disabled:opacity-50 pointer-fine:sm:h-8"
               >
                  {item.label}
               </BaseTabs.Tab>
            ))}
            <BaseTabs.Indicator className="absolute top-1/2 left-0 -z-10 h-10 w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-full bg-ink transition-[translate,width] duration-200 ease-out pointer-fine:sm:h-8" />
         </BaseTabs.List>
         {children}
      </BaseTabs.Root>
   );
}

export function TabPanel({ value, className, children }: { value: string; className?: string; children: ReactNode }) {
   return (
      <BaseTabs.Panel value={value} className={cn('outline-none', className)}>
         {children}
      </BaseTabs.Panel>
   );
}
