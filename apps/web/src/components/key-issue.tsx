'use client';

import { KeyRound, TriangleAlert } from 'lucide-react';
import { type FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { Button, Dialog, DialogFooter, Field, SecretInput, toast } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { errorMessage } from '@/lib/api';
import { clearKeyIssue, getKeyIssue, subscribeKeyIssue } from '@/lib/key-issue';
import { fetchServerInfo, login, useSession } from '@/lib/session';
import { ApiKeySteps } from './api-key-guide';

export function useKeyIssue() {
   return useSyncExternalStore(subscribeKeyIssue, getKeyIssue, () => null);
}

/**
 * Shown under the header when Clash Royale rejects the signed-in player's API key (usually because Deckr's IP
 * changed: there's no fixed outbound IP on Railway's Hobby plan). It explains why and opens the fix.
 */
export function KeyIssueBanner() {
   const { t } = useI18n();
   const issue = useKeyIssue();
   const session = useSession();
   const [open, setOpen] = useState(false);
   const [used, setUsed] = useState(false);

   // Only for players logged in with their own key; a failed login shows the same fix in the login dialog.
   const affected = issue !== null && session.status === 'signed-in' && session.method === 'api-key';

   useEffect(() => {
      if (open) setUsed(true);
   }, [open]);

   return (
      <>
         {affected ? (
            <div className="page mt-4">
               <div
                  role="alert"
                  className="flex flex-col gap-3 rounded-card border border-gold/30 bg-gold/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"
               >
                  <p className="flex gap-2.5 text-pretty">
                     <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-gold" />
                     {t.keyIssue.banner(issue.ip)}
                  </p>
                  <Button variant="primary" className="shrink-0" onClick={() => setOpen(true)}>
                     <KeyRound aria-hidden />
                     {t.keyIssue.fix}
                  </Button>
               </div>
            </div>
         ) : null}
         {used && session.status === 'signed-in' ? (
            <UpdateKeyDialog open={open} onOpenChange={setOpen} tag={session.player.tag} reportedIp={issue?.ip} />
         ) : null}
      </>
   );
}

/** Copy the IP, create a key that allows it, paste it: logs in again with the same tag, keeping the account. */
function UpdateKeyDialog({
   open,
   onOpenChange,
   tag,
   reportedIp,
}: {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   tag: string;
   reportedIp: string | null | undefined;
}) {
   const { t } = useI18n();
   const [key, setKey] = useState('');
   const [ip, setIp] = useState<string | null | undefined>(reportedIp ?? undefined);
   const [error, setError] = useState<string | null>(null);
   const [saving, setSaving] = useState(false);

   // The IP the error reported is the freshest; without one, ask the server.
   useEffect(() => {
      if (!open) return;
      if (reportedIp) {
         setIp(reportedIp);
         return;
      }
      fetchServerInfo()
         .then((info) => setIp(info.ip))
         .catch(() => setIp(null));
   }, [open, reportedIp]);

   const submit = async (event: FormEvent) => {
      event.preventDefault();
      if (!key.trim()) return;

      setSaving(true);
      setError(null);

      try {
         await login({ method: 'api-key', tag, token: key.trim() });
         setKey('');
         onOpenChange(false);
         clearKeyIssue();
         toast.success(t.keyIssue.saved);
      } catch (failure) {
         setError(errorMessage(failure, t));
      } finally {
         setSaving(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange} title={t.keyIssue.title} description={t.keyIssue.description}>
         <form onSubmit={submit} noValidate autoComplete="off" className="flex flex-col gap-5">
            <ApiKeySteps ip={ip} />
            <Field label={t.keyIssue.field} error={error}>
               <SecretInput
                  value={key}
                  onChange={(event) => setKey(event.target.value.trim())}
                  placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOi…"
               />
            </Field>
            <DialogFooter>
               <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  {t.keyIssue.later}
               </Button>
               <Button variant="primary" type="submit" disabled={saving || !key}>
                  {saving ? t.keyIssue.saving : t.keyIssue.save}
               </Button>
            </DialogFooter>
         </form>
      </Dialog>
   );
}
