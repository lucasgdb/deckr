'use client';

import { Download, Share } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Popover } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/** Registers the service worker (src/app/sw.js/route.ts) once the page has loaded. Mounted once, in the layout. */
export function ServiceWorker() {
   useEffect(() => {
      if (!('serviceWorker' in navigator)) return;

      const register = () => {
         navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
            // Not supported here (private mode, some embedded browsers): the site just works without it.
         });
      };

      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register, { once: true });
   }, []);

   return null;
}

interface InstallPromptEvent extends Event {
   prompt: () => Promise<void>;
   userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallState = { kind: 'none' } | { kind: 'prompt'; event: InstallPromptEvent } | { kind: 'ios' };

const standalone = () =>
   window.matchMedia('(display-mode: standalone)').matches ||
   (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** How this browser installs Deckr: its own prompt (Chrome, Edge, Android), Safari's Share menu (iOS), or not at all. */
function useInstall() {
   const [state, setState] = useState<InstallState>({ kind: 'none' });

   useEffect(() => {
      if (standalone()) return;

      // iPhone and iPad (iPadOS reports a Mac with touch): no prompt, installed from the Share menu.
      const ios =
         /iphone|ipad|ipod/i.test(navigator.userAgent) ||
         (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
      if (ios) setState({ kind: 'ios' });

      const onPrompt = (event: Event) => {
         event.preventDefault();
         setState({ kind: 'prompt', event: event as InstallPromptEvent });
      };
      const onInstalled = () => setState({ kind: 'none' });

      window.addEventListener('beforeinstallprompt', onPrompt);
      window.addEventListener('appinstalled', onInstalled);
      return () => {
         window.removeEventListener('beforeinstallprompt', onPrompt);
         window.removeEventListener('appinstalled', onInstalled);
      };
   }, []);

   return [state, setState] as const;
}

/** "Install the app": shown only where Deckr can be installed and isn't yet. */
export function InstallApp({ className }: { className?: string }) {
   const { t } = useI18n();
   const [state, setState] = useInstall();

   if (state.kind === 'none') return null;

   const button = (
      <Button variant="secondary" className={cn('w-fit', className)}>
         <Download aria-hidden />
         {t.pwa.install}
      </Button>
   );

   if (state.kind === 'ios') {
      return (
         <Popover title={t.pwa.iosTitle} trigger={button}>
            <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-faint">
               <li>
                  {t.pwa.iosSteps.share} <Share aria-hidden className="inline size-4 align-[-0.2em] text-ink" />
               </li>
               <li>{t.pwa.iosSteps.add}</li>
               <li>{t.pwa.iosSteps.confirm}</li>
            </ol>
         </Popover>
      );
   }

   return (
      <Button
         variant="secondary"
         className={cn('w-fit', className)}
         onClick={async () => {
            await state.event.prompt();
            const { outcome } = await state.event.userChoice;
            if (outcome === 'accepted') setState({ kind: 'none' });
         }}
      >
         <Download aria-hidden />
         {t.pwa.install}
      </Button>
   );
}
