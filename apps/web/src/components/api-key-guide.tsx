'use client';

import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

export const DEVELOPER_SITE = 'https://developer.clashroyale.com';

/** The IP to allow on a Clash Royale API key, with a button that copies it. `undefined` while it's being looked up. */
export function CopyIp({ ip, className }: { ip: string | null | undefined; className?: string }) {
   const { t } = useI18n();
   const steps = t.login.apiKeySteps;
   const [copied, setCopied] = useState(false);

   const copy = async () => {
      if (!ip) return;
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   return (
      <span className={cn('flex items-center gap-2', className)}>
         <code className="num rounded-[8px] bg-raised px-2 py-1 text-ink">
            {ip === undefined ? steps.finding : (ip ?? steps.unavailable)}
         </code>
         {ip ? (
            <Button
               variant="ghost"
               size="icon"
               className="size-10 pointer-fine:sm:size-8"
               onClick={copy}
               aria-label={copied ? steps.copied : steps.copyIp}
            >
               {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            </Button>
         ) : null}
      </span>
   );
}

/** A link to Supercell's developer portal, where keys are created. */
export function DeveloperSiteLink() {
   return (
      <a
         href={DEVELOPER_SITE}
         target="_blank"
         rel="noreferrer"
         className="inline-flex items-center gap-1 font-medium text-ink underline-offset-4 hover:underline"
      >
         developer.clashroyale.com
         <ExternalLink aria-hidden className="size-3.5" />
      </a>
   );
}

/** How to create a Clash Royale API key that allows Deckr's IP: shown at login and when the IP changes. */
export function ApiKeySteps({ ip }: { ip: string | null | undefined }) {
   const { t } = useI18n();
   const steps = t.login.apiKeySteps;

   return (
      <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-faint">
         <li>
            {steps.openBefore}
            <DeveloperSiteLink />
            {steps.openAfter}
         </li>
         <li>
            {steps.accountBefore}
            <span className="text-ink">{steps.account}</span>
            {steps.accountMiddle}
            <span className="text-ink">{steps.create}</span>
            {steps.accountAfter}
         </li>
         <li>{steps.name}</li>
         <li>
            {steps.ipBefore}
            <span className="text-ink">{steps.ip}</span>
            {steps.ipAfter}
            <CopyIp ip={ip} className="mt-2" />
         </li>
         <li>{steps.finish}</li>
      </ol>
   );
}
