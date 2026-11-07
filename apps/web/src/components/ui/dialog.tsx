'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps, ReactNode } from 'react';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { Button } from './button';

const backdrop =
   'fixed inset-0 min-h-dvh bg-black/70 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute';

/*
 * Phones: a sheet from the bottom edge, full width, that slides up; it scrolls if taller than the screen, keeps clear
 * of the home indicator, and `lg` (browsing, e.g. the card picker) takes the full height. From `sm` up: centred.
 */
const popup = cn(
   'fixed inset-x-0 bottom-0 flex max-h-[calc(100dvh-max(24px,env(safe-area-inset-top)))] w-full flex-col overflow-y-auto overscroll-contain rounded-t-card bg-surface px-4 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] text-ink',
   'data-[size=lg]:h-[calc(100dvh-max(24px,env(safe-area-inset-top)))] data-[size=lg]:overflow-hidden',
   'transition-[translate,opacity] duration-200 ease-out data-ending-style:translate-y-full data-starting-style:translate-y-full',
   'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:block sm:max-h-[calc(100dvh-32px)] sm:w-[min(30rem,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-card sm:p-pad',
   'sm:data-[size=lg]:flex sm:data-[size=lg]:h-auto sm:data-[size=lg]:max-h-[min(48rem,calc(100dvh-32px))] sm:data-[size=lg]:w-[min(60rem,calc(100vw-32px))] sm:data-[size=lg]:flex-col',
   'sm:transition-[scale,opacity] sm:duration-150 sm:data-ending-style:translate-y-[-50%] sm:data-ending-style:scale-[0.98] sm:data-ending-style:opacity-0 sm:data-starting-style:translate-y-[-50%] sm:data-starting-style:scale-[0.98] sm:data-starting-style:opacity-0',
   'shadow-[0_24px_64px_rgb(0_0_0/0.6)] outline outline-raised',
);

interface DialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   title: string;
   description?: ReactNode;
   /** `lg` is a wide dialog whose body scrolls, for browsing (e.g. the card picker). */
   size?: 'md' | 'lg';
   children: ReactNode;
}

/** A modal dialog: focus is trapped; Escape and a click outside close it. */
export function Dialog({ open, onOpenChange, title, description, size = 'md', children }: DialogProps) {
   return (
      <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
         <BaseDialog.Portal>
            <BaseDialog.Backdrop className={backdrop} />
            <BaseDialog.Popup className={popup} data-size={size}>
               <BaseDialog.Title className="text-base font-semibold">{title}</BaseDialog.Title>
               {description ? (
                  <BaseDialog.Description className="mt-1 text-muted">{description}</BaseDialog.Description>
               ) : null}
               <div className={cn('mt-5', size === 'lg' && 'flex min-h-0 flex-1 flex-col')}>{children}</div>
            </BaseDialog.Popup>
         </BaseDialog.Portal>
      </BaseDialog.Root>
   );
}

interface ConfirmDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   title: string;
   description: ReactNode;
   cancelLabel?: string;
   confirmLabel: ReactNode;
   onConfirm: () => void;
}

/** Asks before a destructive action. It can't be dismissed by clicking outside. */
export function ConfirmDialog({
   open,
   onOpenChange,
   title,
   description,
   cancelLabel,
   confirmLabel,
   onConfirm,
}: ConfirmDialogProps) {
   const { t } = useI18n();

   return (
      <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
         <AlertDialog.Portal>
            <AlertDialog.Backdrop className={backdrop} />
            <AlertDialog.Popup className={popup}>
               <AlertDialog.Title className="text-base font-semibold">{title}</AlertDialog.Title>
               <AlertDialog.Description className="mt-1 text-muted">{description}</AlertDialog.Description>
               <DialogFooter>
                  <AlertDialog.Close render={<Button variant="ghost" />}>
                     {cancelLabel ?? t.common.cancel}
                  </AlertDialog.Close>
                  <Button variant="destructive" onClick={onConfirm}>
                     {confirmLabel}
                  </Button>
               </DialogFooter>
            </AlertDialog.Popup>
         </AlertDialog.Portal>
      </AlertDialog.Root>
   );
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
   return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
}

/** Closes the surrounding dialog. */
export function DialogClose(props: ComponentProps<typeof Button>) {
   return <BaseDialog.Close render={<Button variant="ghost" {...props} />} />;
}
