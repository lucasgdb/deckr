'use client';

import { Button as BaseButton } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
   [
      'inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium',
      // A press shrinks the button slightly, except on buttons that open a popup (menu, popover): the popup is
      // positioned against the button the moment it's pressed, so shrinking it would make both jitter.
      'transition-[background-color,color,scale] duration-150 [&:not([aria-haspopup])]:active:scale-[0.97]',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
      '[&_svg]:size-4 [&_svg]:shrink-0',
   ],
   {
      variants: {
         variant: {
            /** The one primary action on a screen: inverted, white on black. */
            primary: 'bg-ink text-black hover:bg-ink-hover',
            secondary: 'bg-raised text-ink hover:bg-raised-hover',
            ghost: 'text-muted hover:bg-active hover:text-ink data-popup-open:bg-active data-popup-open:text-ink',
            danger: 'text-negative hover:bg-negative-bg',
            /** Destructive confirmation inside a dialog. */
            destructive: 'bg-negative-bg text-negative hover:bg-[#3a2029]',
         },
         size: {
            /** 44px on touch screens (phones and tablets); 36px with a mouse from `sm` up. */
            md: 'h-11 px-4 text-sm pointer-fine:sm:h-9',
            icon: 'size-11 pointer-fine:sm:size-9',
         },
      },
      defaultVariants: { variant: 'secondary', size: 'md' },
   },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = ComponentProps<typeof BaseButton> & ButtonVariants & { className?: string };

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
   return <BaseButton type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

type LinkButtonProps = Omit<ComponentProps<'a'>, 'href'> &
   ButtonVariants & {
      href: string;
      /** Renders a disabled button instead, so there is nothing to follow. */
      disabled?: boolean;
   };

/** A link that looks like a button. Internal paths use Next's client navigation. */
export function LinkButton({ variant, size, className, href, disabled, children, ...props }: LinkButtonProps) {
   const classes = cn(buttonVariants({ variant, size }), className);

   if (disabled) {
      return (
         <BaseButton disabled className={classes}>
            {children}
         </BaseButton>
      );
   }

   return (
      <BaseButton
         nativeButton={false}
         className={classes}
         render={href.startsWith('/') ? <Link href={href} {...props} /> : <a href={href} {...props} />}
      >
         {children}
      </BaseButton>
   );
}

/**
 * An unstyled clickable area (a card in a grid, a deck slot): pointer, focus ring and disabled state only.
 * Use `Button` for anything that reads as a button.
 */
export function Tile({
   className,
   type = 'button',
   ...props
}: ComponentProps<typeof BaseButton> & { className?: string }) {
   return (
      <BaseButton
         type={type}
         className={cn('block w-full rounded-art text-left select-none data-disabled:opacity-40', className)}
         {...props}
      />
   );
}

/*
 * A row of actions that never leaves one button on a line of its own. Phones: equal columns, each an icon above a
 * short label (two lines at most). From `sm` up: an ordinary row that wraps. Put `actionBar` on the container and
 * `actionBarItem` on each button.
 */
export const actionBar = 'grid grid-flow-col auto-cols-fr gap-2 sm:flex sm:flex-wrap';

export const actionBarItem =
   'max-sm:h-auto max-sm:rounded-2xl max-sm:min-h-14 max-sm:flex-col max-sm:gap-1 max-sm:px-1.5 max-sm:py-2 max-sm:text-center max-sm:text-xs max-sm:leading-tight max-sm:whitespace-normal';
