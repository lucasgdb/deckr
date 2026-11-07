'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';

/** Shares the hover delay, so moving from one tooltip to the next opens it right away. Mount once. */
export function TooltipProvider({ children }: { children: ReactNode }) {
   return (
      <BaseTooltip.Provider delay={300} closeDelay={0}>
         {children}
      </BaseTooltip.Provider>
   );
}

interface TooltipProps {
   /** Supplementary text only: it never shows on touch, so nothing essential may live only here. */
   content: ReactNode;
   /** The element that shows the tooltip on hover; a plain `<div />` keeps it out of the tab order. */
   render: ReactElement;
   children: ReactNode;
   side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, render, children, side = 'top' }: TooltipProps) {
   return (
      <BaseTooltip.Root>
         <BaseTooltip.Trigger render={render}>{children}</BaseTooltip.Trigger>
         <BaseTooltip.Portal>
            <BaseTooltip.Positioner side={side} sideOffset={6} className="z-[70]">
               <BaseTooltip.Popup className="origin-(--transform-origin) rounded-[8px] bg-[#1c1c1c] px-2.5 py-1 text-xs font-medium text-ink shadow-[0_8px_24px_rgb(0_0_0/0.5)] outline outline-raised transition-[scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                  {content}
               </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
         </BaseTooltip.Portal>
      </BaseTooltip.Root>
   );
}
