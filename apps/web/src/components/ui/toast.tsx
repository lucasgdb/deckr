'use client';

import { Toast } from '@base-ui/react/toast';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useI18n } from '@/i18n/provider';
import { buttonVariants } from './button';

/** One manager for the whole app, so toasts can be raised from anywhere. */
const manager = Toast.createToastManager();

interface ToastOptions {
   action?: { label: string; onClick: () => void };
}

function add(type: 'success' | 'error', title: string, options?: ToastOptions) {
   return manager.add({
      type,
      title,
      priority: type === 'error' ? 'high' : 'low',
      timeout: options?.action ? 8000 : 5000,
      actionProps: options?.action ? { children: options.action.label, onClick: options.action.onClick } : undefined,
   });
}

export const toast = {
   success: (title: string, options?: ToastOptions) => add('success', title, options),
   error: (title: string, options?: ToastOptions) => add('error', title, options),
};

export function Toaster() {
   return (
      <Toast.Provider toastManager={manager}>
         <Toast.Portal>
            <Toast.Viewport className="fixed bottom-4 left-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 sm:bottom-6 sm:w-[24rem]">
               <ToastList />
            </Toast.Viewport>
         </Toast.Portal>
      </Toast.Provider>
   );
}

function ToastList() {
   const { toasts } = Toast.useToastManager();
   const { t } = useI18n();

   return toasts.map((item) => (
      <Toast.Root
         key={item.id}
         toast={item}
         className="[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] absolute right-0 bottom-0 left-0 z-[calc(1000-var(--toast-index))] h-(--height) origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] rounded-[14px] bg-[#1c1c1c] text-ink shadow-[0_16px_48px_rgb(0_0_0/0.55)] outline outline-raised select-none [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]"
      >
         <Toast.Content className="flex items-center gap-3 overflow-hidden py-2.5 pr-2 pl-4 transition-opacity duration-200 data-behind:opacity-0 data-expanded:opacity-100">
            {item.type === 'error' ? (
               <CircleAlert aria-hidden className="size-4 shrink-0 text-negative" />
            ) : (
               <CircleCheck aria-hidden className="size-4 shrink-0 text-gold" />
            )}
            <Toast.Title className="min-w-0 flex-1 font-medium" />
            <Toast.Action className={buttonVariants({ variant: 'secondary' })} />
            <Toast.Close aria-label={t.common.dismiss} className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
               <X aria-hidden />
            </Toast.Close>
         </Toast.Content>
      </Toast.Root>
   ));
}
