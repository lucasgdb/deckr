'use client';

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { floatingItem, floatingSurface } from './popup';

export const Menu = BaseMenu.Root;

/** Pass the element that opens the menu, usually a `Button`: `<MenuTrigger render={<Button … />} />`. */
export function MenuTrigger({ render, children }: { render: ReactElement; children?: ReactNode }) {
   return <BaseMenu.Trigger render={render}>{children}</BaseMenu.Trigger>;
}

export function MenuContent({
   children,
   align = 'end',
   className,
}: {
   children: ReactNode;
   align?: 'start' | 'center' | 'end';
   className?: string;
}) {
   return (
      <BaseMenu.Portal>
         <BaseMenu.Positioner className="z-50 outline-none" sideOffset={6} align={align}>
            <BaseMenu.Popup className={cn(floatingSurface, 'min-w-44', className)}>{children}</BaseMenu.Popup>
         </BaseMenu.Positioner>
      </BaseMenu.Portal>
   );
}

type MenuItemProps = ComponentProps<typeof BaseMenu.Item> & { variant?: 'default' | 'danger'; className?: string };

export function MenuItem({ variant = 'default', className, ...props }: MenuItemProps) {
   return (
      <BaseMenu.Item
         className={cn(
            floatingItem,
            variant === 'danger' && 'text-negative data-highlighted:bg-negative-bg',
            className,
         )}
         {...props}
      />
   );
}

export function MenuSeparator() {
   return <BaseMenu.Separator className="mx-2 my-1 h-px bg-raised" />;
}

/**
 * A menu that opens on right click (or a long press on touch) over `children`. Fill it with the same
 * `MenuItem`s as a `Menu`, so a right click offers exactly what the "⋯" button offers.
 * `render` replaces the trigger element (e.g. to keep a list item), and receives its props and ref.
 */
export function ContextMenu({
   menu,
   render,
   className,
   children,
}: {
   menu: ReactNode;
   render?: ReactElement;
   className?: string;
   children: ReactNode;
}) {
   return (
      <BaseContextMenu.Root>
         <BaseContextMenu.Trigger render={render} className={className}>
            {children}
         </BaseContextMenu.Trigger>
         <BaseContextMenu.Portal>
            <BaseContextMenu.Positioner className="z-50 outline-none">
               <BaseContextMenu.Popup className={cn(floatingSurface, 'min-w-44')}>{menu}</BaseContextMenu.Popup>
            </BaseContextMenu.Positioner>
         </BaseContextMenu.Portal>
      </BaseContextMenu.Root>
   );
}
