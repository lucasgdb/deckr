'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { floatingSurface } from './popup';

interface PopoverProps {
   /** The element that opens the popover, usually an icon `Button`. */
   trigger: ReactElement;
   title: string;
   children: ReactNode;
   side?: 'top' | 'bottom' | 'left' | 'right';
   align?: 'start' | 'center' | 'end';
   className?: string;
}

/** Help or detail that opens on click, next to the control it explains. */
export function Popover({ trigger, title, children, side = 'bottom', align = 'start', className }: PopoverProps) {
   return (
      <BasePopover.Root>
         <BasePopover.Trigger render={trigger} />
         <BasePopover.Portal>
            <BasePopover.Positioner className="z-[60] outline-none" side={side} align={align} sideOffset={8}>
               <BasePopover.Popup className={cn(floatingSurface, 'w-[min(24rem,calc(100vw-32px))] p-4', className)}>
                  <BasePopover.Title className="mb-2 font-semibold">{title}</BasePopover.Title>
                  <div className="text-muted">{children}</div>
               </BasePopover.Popup>
            </BasePopover.Positioner>
         </BasePopover.Portal>
      </BasePopover.Root>
   );
}
