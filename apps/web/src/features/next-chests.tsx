'use client';

import { playerTagSchema, type UpcomingChest } from '@deckr/shared';
import { LogIn, Package, Search } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Prepaint } from '@/components/prepaint';
import {
   Button,
   Card,
   CardTitle,
   EmptyState,
   ErrorState,
   Field,
   PrefixInput,
   Skeleton,
   TextSkeleton,
} from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { api, errorMessage } from '@/lib/api';
import { chestImage } from '@/lib/assets';
import { openLogin, useSession } from '@/lib/session';
import { cn } from '@/lib/utils';

type State =
   | { status: 'idle' }
   | { status: 'loading' }
   | { status: 'error'; tag: string; error: unknown }
   | { status: 'ready'; chests: UpcomingChest[] };

/** The game's title case in the DS's sentence case: `Mega Lightning Chest` → `Mega lightning chest`. */
const sentenceCase = (name: string) => `${name.charAt(0).toUpperCase()}${name.slice(1).toLowerCase()}`;

export function NextChests() {
   const { t } = useI18n();
   const router = useRouter();
   const pathname = usePathname();
   const session = useSession();
   const signedIn = session.status === 'signed-in';
   const ownTag = session.status === 'signed-in' ? session.player.tag : '';
   // Logged in with the in-game token: only the player's own chests are visible.
   const ownOnly = session.status === 'signed-in' && session.method === 'game-token';
   // The tag in the URL (?tag=), read by `TagFromUrl` once the page is in the browser.
   const [requestedTag, setRequestedTag] = useState<string | null>(null);
   // Without a tag in the URL, show the signed-in player's own chests.
   const tag = ownOnly ? ownTag : (requestedTag ?? ownTag);
   const [draft, setDraft] = useState(tag);
   const [fieldError, setFieldError] = useState<string | null>(null);
   const [state, setState] = useState<State>({ status: 'idle' });

   const lookUp = useCallback(async (playerTag: string) => {
      setState({ status: 'loading' });

      try {
         setState({ status: 'ready', chests: await api.upcomingChests(playerTag) });
      } catch (error) {
         setState({ status: 'error', tag: playerTag, error });
      }
   }, []);

   useEffect(() => {
      setDraft(tag);

      if (tag && signedIn) lookUp(tag);
      else setState({ status: 'idle' });
   }, [tag, signedIn, lookUp]);

   const submit = (event: FormEvent) => {
      event.preventDefault();

      if (!signedIn) {
         openLogin();
         return;
      }

      const parsed = playerTagSchema.safeParse(draft);

      if (!parsed.success) {
         setFieldError(t.chests.tagInvalid);
         return;
      }

      setFieldError(null);

      if (parsed.data === tag) lookUp(tag);
      else router.push(`${pathname}?tag=${parsed.data}`);
   };

   const loading = state.status === 'loading';

   return (
      <>
         {/* The query string is only known in the browser; only this reader waits for it, not the whole page. */}
         <Suspense fallback={null}>
            <TagFromUrl onTag={setRequestedTag} />
         </Suspense>
         <PageHeader title={t.chests.title} summary={t.chests.summary} />

         <div className="flex flex-col gap-gap">
            <Card aria-label={t.chests.lookUpLabel}>
               <form onSubmit={submit} noValidate className="flex flex-col gap-4 md:flex-row md:items-start">
                  <Field
                     label={t.chests.tag}
                     hint={ownOnly ? t.chests.ownOnlyHint : t.chests.tagHint}
                     error={fieldError}
                     className="md:w-96"
                  >
                     <PrefixInput
                        prefix="#"
                        value={draft}
                        readOnly={ownOnly}
                        onChange={(event) => setDraft(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        maxLength={15}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder="C8Q2QR08"
                        className="num"
                     />
                  </Field>
                  <Button variant="primary" type="submit" className="md:mt-7 md:h-10" disabled={loading}>
                     <Search aria-hidden />
                     {loading ? t.chests.lookingUp : t.chests.lookUp}
                  </Button>
               </form>
            </Card>

            <Card aria-labelledby="cycle-title" aria-busy={loading}>
               <CardTitle id="cycle-title" className="mb-4">
                  {tag ? (
                     <>
                        {t.chests.cycleFor} <span className="num">#{tag}</span>
                     </>
                  ) : (
                     t.chests.cycle
                  )}
               </CardTitle>

               {/* While the session loads: the logged-out message (the server's version), or chests to come when
                   this browser was signed in last time (lib/prepaint.ts). */}
               {state.status === 'idle' && session.status !== 'signed-in' ? (
                  <Prepaint
                     ready={session.status === 'anonymous'}
                     deps={['session']}
                     placeholder={<ChestPlaceholders />}
                  >
                     <EmptyState
                        action={
                           <Button variant="primary" onClick={openLogin}>
                              <LogIn aria-hidden />
                              {t.common.logIn}
                           </Button>
                        }
                     >
                        {t.chests.loginFirst}
                     </EmptyState>
                  </Prepaint>
               ) : null}
               {state.status === 'idle' && signedIn ? <EmptyState>{t.chests.enterTag}</EmptyState> : null}
               {state.status === 'loading' ? <ChestPlaceholders /> : null}
               {state.status === 'error' ? (
                  <ErrorState
                     message={t.chests.loadFailed(state.tag, errorMessage(state.error, t))}
                     onRetry={() => lookUp(tag)}
                  />
               ) : null}
               {state.status === 'ready' && state.chests.length === 0 ? (
                  <EmptyState>{t.chests.none(tag)}</EmptyState>
               ) : null}
               {state.status === 'ready' && state.chests.length > 0 ? <ChestList chests={state.chests} /> : null}
            </Card>
         </div>
      </>
   );
}

function TagFromUrl({ onTag }: { onTag: (tag: string | null) => void }) {
   const tag = useSearchParams().get('tag');

   useEffect(() => onTag(tag), [tag, onTag]);

   return null;
}

/**
 * A chest's name always takes two lines (shorter names leave the second empty, longer ones are cut), so every row,
 * and the placeholders', has the same height whatever the names.
 */
const chestName = 'line-clamp-2 min-h-[2lh] text-xs';

const chestGrid = 'grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-x-3 gap-y-6';

function ChestList({ chests }: { chests: UpcomingChest[] }) {
   const { t } = useI18n();

   return (
      <ol className={chestGrid}>
         {chests.map((chest) => {
            const image = chestImage(chest.chest);

            return (
               <li key={`${chest.position}-${chest.chest}`} className="flex flex-col items-center text-center">
                  {image ? (
                     <Image src={image} alt="" width={96} height={96} className="size-24 object-contain" />
                  ) : (
                     <div
                        aria-hidden
                        className="flex size-24 items-center justify-center rounded-art bg-raised text-faint"
                     >
                        <Package className="size-8" />
                     </div>
                  )}
                  <p className={cn('num mt-1 text-2xl font-semibold', chest.position === 'Next' && 'text-gold')}>
                     {chest.position === 'Next' ? t.chests.next : chest.position}
                  </p>
                  <p className={cn(chestName, 'text-muted')}>{sentenceCase(chest.name)}</p>
               </li>
            );
         })}
      </ol>
   );
}

/** A player's cycle lists this many chests: the next few, then the special ones further ahead. */
const PLACEHOLDER_CHESTS = 14;

/** The same items as `ChestList`, with the chest, its position and its name as placeholders. */
function ChestPlaceholders() {
   const { t } = useI18n();

   return (
      <ul aria-label={t.chests.loading} className={chestGrid}>
         {Array.from({ length: PLACEHOLDER_CHESTS }, (_, slot) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders.
            <li key={slot} className="flex flex-col items-center text-center">
               <Skeleton className="size-24 rounded-art" />
               <p className="num mt-1 text-2xl font-semibold">
                  <TextSkeleton className="w-12" />
               </p>
               <p className={chestName}>
                  <TextSkeleton className="w-24" />
               </p>
            </li>
         ))}
      </ul>
   );
}
