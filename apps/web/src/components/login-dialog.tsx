'use client';

import { type LoginMethod, loginSchema, type ServerInfo } from '@deckr/shared';
import { CircleHelp, Gamepad2, KeyRound } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import {
   Button,
   Dialog,
   DialogFooter,
   Field,
   Popover,
   PrefixInput,
   SecretInput,
   TabPanel,
   Tabs,
   toast,
} from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { ApiRequestError, errorMessage } from '@/lib/api';
import { closeLogin, fetchServerInfo, login, readSavedTag, saveTag, useLoginOpen } from '@/lib/session';
import { ApiKeySteps, CopyIp, DeveloperSiteLink } from './api-key-guide';

/** `ip`: the key was rejected because it doesn't allow Deckr's IP, which is shown with the fix. */
type Errors = { tag?: string; token?: string; form?: string; ip?: string | null };

export function LoginDialog() {
   const { t } = useI18n();
   const open = useLoginOpen();
   const [server, setServer] = useState<ServerInfo | null>(null);
   const [method, setMethod] = useState<LoginMethod>('game-token');
   const [tag, setTag] = useState('');
   const [tokens, setTokens] = useState<Record<LoginMethod, string>>({ 'game-token': '', 'api-key': '' });
   const [errors, setErrors] = useState<Errors>({});
   const [submitting, setSubmitting] = useState(false);

   const gameTokenAvailable = server?.gameTokenLogin ?? true;

   // On open: fill in the tag this browser last used, and ask the server which login methods it supports.
   useEffect(() => {
      if (!open) return;

      setTag((current) => current || readSavedTag());
      fetchServerInfo()
         .then((info) => {
            setServer(info);
            if (!info.gameTokenLogin) setMethod('api-key');
         })
         .catch(() => setServer({ ip: null, gameTokenLogin: false }));
   }, [open]);

   const submit = async (event: FormEvent) => {
      event.preventDefault();

      const parsed = loginSchema.safeParse({ method, tag, token: tokens[method] });

      if (!parsed.success) {
         const issues = parsed.error.issues;
         const tokenIssue = issues.find((issue) => issue.path[0] === 'token');
         const tooShort = method === 'game-token' ? t.login.tokenShort : t.login.keyShort;

         setErrors({
            tag: issues.some((issue) => issue.path[0] === 'tag') ? t.login.tagInvalid : undefined,
            // Too short (or empty), or it has spaces: the schema's only other rule.
            token: tokenIssue ? (tokenIssue.code === 'invalid_format' ? t.login.noSpaces : tooShort) : undefined,
         });
         return;
      }

      setErrors({});
      setSubmitting(true);

      try {
         const player = await login(parsed.data);
         closeLogin();
         setTokens({ 'game-token': '', 'api-key': '' });
         toast.success(t.login.loggedIn(player.name));
      } catch (error) {
         const keyRejected = error instanceof ApiRequestError && error.code === 'cr_key_rejected';
         const ip = keyRejected ? error.params.ip : undefined;
         setErrors({
            form: errorMessage(error, t),
            ip: keyRejected ? (typeof ip === 'string' ? ip : null) : undefined,
         });
      } finally {
         setSubmitting(false);
      }
   };

   const setToken = (value: string) => setTokens((current) => ({ ...current, [method]: value.trim() }));

   return (
      <Dialog
         open={open}
         onOpenChange={(next) => {
            if (!next) {
               closeLogin();
               setErrors({});
            }
         }}
         title={t.login.title}
         description={t.login.description}
      >
         <form onSubmit={submit} noValidate autoComplete="off" className="flex flex-col gap-4">
            <Field label={t.login.tag} hint={t.login.tagHint} error={errors.tag}>
               <PrefixInput
                  prefix="#"
                  value={tag}
                  onChange={(event) => {
                     const next = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                     setTag(next);
                     // Remember the tag as it's typed, so it survives a failed attempt or a closed dialog.
                     saveTag(next);
                  }}
                  maxLength={15}
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="C8Q2QR08"
                  className="num"
               />
            </Field>

            <Tabs
               label={t.login.how}
               value={method}
               onValueChange={(next) => {
                  setMethod(next);
                  setErrors({});
               }}
               items={[
                  {
                     value: 'game-token',
                     label: (
                        <>
                           <Gamepad2 aria-hidden className="size-4" />
                           {t.login.gameToken}
                        </>
                     ),
                     disabled: !gameTokenAvailable,
                  },
                  {
                     value: 'api-key',
                     label: (
                        <>
                           <KeyRound aria-hidden className="size-4" />
                           {t.login.apiKey}
                        </>
                     ),
                  },
               ]}
            >
               <TabPanel value="game-token" className="mt-4">
                  <Field
                     label={t.login.tokenLabel}
                     labelAside={<GameTokenHelp />}
                     hint={t.login.tokenHint}
                     error={method === 'game-token' ? errors.token : null}
                  >
                     <SecretInput
                        value={tokens['game-token']}
                        onChange={(event) => setToken(event.target.value)}
                        placeholder={t.login.tokenPlaceholder}
                     />
                  </Field>
               </TabPanel>

               <TabPanel value="api-key" className="mt-4">
                  <Field
                     label={t.login.keyLabel}
                     labelAside={<ApiKeyHelp ip={server?.ip} />}
                     hint={t.login.keyHint}
                     error={method === 'api-key' ? errors.token : null}
                  >
                     <SecretInput
                        value={tokens['api-key']}
                        onChange={(event) => setToken(event.target.value)}
                        placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOi…"
                     />
                  </Field>
               </TabPanel>
            </Tabs>

            {gameTokenAvailable ? null : <p className="text-xs text-faint">{t.login.gameTokenUnavailable}</p>}

            {errors.form ? (
               <div role="alert" className="flex flex-col gap-2 rounded-field bg-negative-bg px-3 py-2.5">
                  <p className="text-negative">{errors.form}</p>
                  {/* The usual cause: Deckr's IP changed. The fix, right here: the address to allow and where. */}
                  {errors.ip !== undefined ? (
                     <div className="flex flex-col gap-1.5 text-muted">
                        <p>{t.keyIssue.inlineHint}</p>
                        <CopyIp ip={errors.ip ?? server?.ip ?? null} />
                        <DeveloperSiteLink />
                     </div>
                  ) : null}
               </div>
            ) : null}

            <DialogFooter className="mt-2">
               <Button variant="ghost" onClick={closeLogin}>
                  {t.common.cancel}
               </Button>
               <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? t.login.checking : t.login.submit}
               </Button>
            </DialogFooter>
         </form>
      </Dialog>
   );
}

const helpTrigger = (label: string) => (
   <Button variant="ghost" size="icon" className="-my-2.5 size-11 pointer-fine:sm:size-7" aria-label={label}>
      <CircleHelp aria-hidden />
   </Button>
);

/** "?" beside the in-game token: where the game shows it. */
function GameTokenHelp() {
   const { t } = useI18n();
   const steps = t.login.gameTokenSteps;

   return (
      <Popover title={t.login.gameTokenHelpTitle} trigger={helpTrigger(t.login.gameTokenHelpLabel)}>
         <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-faint">
            <li>{steps.open}</li>
            <li>
               {steps.settingsBefore}
               <span className="text-ink">{steps.settings}</span>
               {steps.settingsAfter}
            </li>
            <li>
               {steps.tokenBefore}
               <span className="text-ink">{steps.token}</span>
               {steps.tokenAfter}
            </li>
            <li>{steps.paste}</li>
         </ol>
      </Popover>
   );
}

/** "?" beside the API key: how to create one, and the IP address to allow. */
function ApiKeyHelp({ ip }: { ip: string | null | undefined }) {
   const { t } = useI18n();

   return (
      <Popover title={t.login.apiKeyHelpTitle} trigger={helpTrigger(t.login.apiKeyHelpLabel)}>
         <ApiKeySteps ip={ip} />
      </Popover>
   );
}
