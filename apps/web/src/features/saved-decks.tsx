'use client';

import { isCompleteDeck, type SavedDeck } from '@deckr/shared';
import { Copy, Ellipsis, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeckGrid } from '@/components/deck-grid';
import { PageHeader } from '@/components/page-header';
import { Prepaint } from '@/components/prepaint';
import { ShareDeckButton } from '@/components/share-deck-button';
import {
   Button,
   ConfirmDialog,
   EmptyState,
   ErrorState,
   LinkButton,
   Menu,
   MenuContent,
   MenuItem,
   MenuTrigger,
   TextSkeleton,
   toast,
} from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { errorMessage } from '@/lib/api';
import { copyDeckLink, describeDeck, useOpenDeckHref } from '@/lib/deck-actions';
import { timeAgo } from '@/lib/format';
import { removeDeck, retrySavedDecks, useSavedDecks } from '@/lib/saved-decks';

/** Rows shown while decks load. */
const PLACEHOLDER_ROWS = 5;

/** Decks are in this browser, or in the account of a session that was open last time. */
const loadingDeps = ['decks', 'session'] as const;

export function SavedDecks() {
   const { t, href } = useI18n();
   const state = useSavedDecks();
   // The deck being confirmed stays set while the dialog animates out; `confirming` drives visibility.
   const [removing, setRemoving] = useState<SavedDeck | null>(null);
   const [confirming, setConfirming] = useState(false);

   const askToRemove = (deck: SavedDeck) => {
      setRemoving(deck);
      setConfirming(true);
   };

   const remove = async (deck: SavedDeck) => {
      setConfirming(false);

      try {
         await removeDeck(deck.id);
         toast.success(t.saved.removed);
      } catch (error) {
         toast.error(t.saved.removeFailed(errorMessage(error, t)));
      }
   };

   const loading = state.status === 'loading';
   // No decks yet, in this browser: what the server renders. Kept as the same tree once loaded (lib/prepaint.ts).
   const noLocalDecks =
      state.status === 'loading' || (state.status === 'ready' && state.account === null && state.decks.length === 0);

   const summary = (() => {
      if (noLocalDecks) {
         return (
            <Prepaint ready={!loading} deps={loadingDeps} placeholder={<TextSkeleton className="w-56" />}>
               {t.saved.none(false)}
            </Prepaint>
         );
      }
      if (state.status === 'error') return t.saved.fallbackSummary;
      if (state.status !== 'ready') return null;

      const account = state.account !== null;
      const count = state.decks.length;

      return count === 0 ? t.saved.none(account) : t.saved.count(count, account);
   })();

   return (
      <>
         <PageHeader
            title={t.saved.title}
            summary={summary}
            actions={
               <LinkButton href={href('/')} variant="primary">
                  {t.saved.build}
               </LinkButton>
            }
         />

         {noLocalDecks || (state.status === 'ready' && state.decks.length === 0) ? (
            <Prepaint
               ready={!loading}
               deps={loadingDeps}
               placeholder={
                  <ul aria-busy="true" aria-label={t.saved.loading} className="flex flex-col gap-gap">
                     {Array.from({ length: PLACEHOLDER_ROWS }, (_, row) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders.
                        <DeckRow key={row} deck={null} />
                     ))}
                  </ul>
               }
            >
               <EmptyState>{t.saved.empty}</EmptyState>
            </Prepaint>
         ) : null}
         {state.status === 'error' ? (
            <ErrorState message={t.saved.loadFailed(errorMessage(state.error, t))} onRetry={retrySavedDecks} />
         ) : null}
         {state.status === 'ready' && state.decks.length > 0 ? (
            <ul className="flex flex-col gap-gap">
               {state.decks.map((deck) => (
                  <DeckRow key={deck.id} deck={deck} onRemove={() => askToRemove(deck)} />
               ))}
            </ul>
         ) : null}

         <ConfirmDialog
            open={confirming}
            onOpenChange={setConfirming}
            title={t.saved.confirmTitle}
            description={removing ? t.saved.confirmDescription(describeDeck(removing.cards, t)) : ''}
            cancelLabel={t.saved.keep}
            confirmLabel={
               <>
                  <Trash2 aria-hidden />
                  {t.saved.remove}
               </>
            }
            onConfirm={() => removing && remove(removing)}
         />
      </>
   );
}

/**
 * One saved deck. With `deck` null it renders the same row (buttons included, disabled), with only the name,
 * the date and the cards as placeholders, so nothing moves when the decks arrive.
 */
function DeckRow({ deck, onRemove }: { deck: SavedDeck | null; onRemove?: () => void }) {
   const { locale, t } = useI18n();
   const cards = deck?.cards ?? [];
   const name = deck ? describeDeck(cards, t) : '';
   const complete = deck !== null && isCompleteDeck(cards);
   const open = useOpenDeckHref(cards);

   return (
      <li className="rounded-card bg-surface p-4 sm:p-pad">
         <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:mb-4">
            <div className="min-w-0">
               <h2 className="truncate font-medium">{deck ? name : <TextSkeleton className="w-56" />}</h2>
               {/* Always one line, so every row (and its placeholder) has the same height. */}
               <p className="truncate text-xs text-faint">
                  {deck ? (
                     [t.saved.savedAgo(timeAgo(deck.createdAt, locale)), complete ? null : t.saved.incomplete]
                        .filter(Boolean)
                        .join(' · ')
                  ) : (
                     <TextSkeleton className="w-28" />
                  )}
               </p>
            </div>
            <div className="flex items-center gap-2">
               <LinkButton
                  href={open.href}
                  disabled={!complete}
                  target={open.external ? '_blank' : undefined}
                  rel="noreferrer"
               >
                  <ExternalLink aria-hidden />
                  {t.common.openInGame}
               </LinkButton>
               <ShareDeckButton deck={cards} />
               <Button onClick={() => copyDeckLink(cards, t)} disabled={!complete}>
                  <Copy aria-hidden />
                  {t.common.copyLink}
               </Button>
               <Menu>
                  <MenuTrigger
                     render={
                        <Button
                           variant="ghost"
                           size="icon"
                           disabled={!deck}
                           aria-label={deck ? t.saved.moreActionsFor(name) : t.saved.moreActions}
                        />
                     }
                  >
                     <Ellipsis aria-hidden />
                  </MenuTrigger>
                  <MenuContent>
                     <MenuItem variant="danger" onClick={onRemove}>
                        <Trash2 aria-hidden />
                        {t.saved.remove}
                     </MenuItem>
                  </MenuContent>
               </Menu>
            </div>
         </div>
         <DeckGrid deck={deck?.cards ?? null} variant="strip" label={deck ? t.saved.cardsIn(name) : t.common.cards} />
      </li>
   );
}
