'use client';

import {
   averageElixir,
   buildDeckLink,
   cycleCost,
   DECK_SIZE,
   EMPTY_CARD,
   filledSlots,
   isCompleteDeck,
   parseDeckLink,
   playableCards,
} from '@deckr/shared';
import {
   Bookmark,
   CircleHelp,
   ClipboardPaste,
   Copy,
   Dices,
   Eraser,
   ExternalLink,
   Undo2,
   UserRound,
   WandSparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { DeckGrid } from '@/components/deck-grid';
import { DeckGroups } from '@/components/deck-groups';
import { DeckHand } from '@/components/deck-hand';
import { PageHeader } from '@/components/page-header';
import { Prepaint } from '@/components/prepaint';
import { ShareDeckButton } from '@/components/share-deck-button';
import {
   Button,
   Card,
   CardHeader,
   CardTitle,
   Field,
   InputGroup,
   InputGroupInput,
   LinkButton,
   Meter,
   Notice,
   Popover,
   TextSkeleton,
   toast,
} from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { errorMessage } from '@/lib/api';
import { describePreset, poolPreset, useCardPool } from '@/lib/card-pool';
import { copyDeckLink, useOpenDeckHref } from '@/lib/deck-actions';
import { useDeckEditor } from '@/lib/deck-editor';
import { formatDecimal } from '@/lib/format';
import { saveDeck } from '@/lib/saved-decks';
import { usePlayer, useSession } from '@/lib/session';
import { type SmartDeck, smartDeck } from '@/lib/smart-deck';

// Dialogs are downloaded the first time they're opened, not with the page.
const CardPicker = dynamic(() => import('@/components/card-picker').then((module) => module.CardPicker), {
   ssr: false,
});
const PasteDialog = dynamic(() => import('@/components/paste-dialog').then((module) => module.PasteDialog), {
   ssr: false,
});

const isTyping = (target: EventTarget | null) =>
   target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

export function DeckBuilder() {
   const { locale, t, href } = useI18n();
   const router = useRouter();
   const player = usePlayer();
   const session = useSession();
   const { ready: poolReady, pool, owned } = useCardPool();
   const editor = useDeckEditor();
   const { deck, slots } = editor;
   const [saving, setSaving] = useState(false);
   // `used`: the dialog was opened once, so it's mounted (and stays, so closing animates).
   const [paste, setPaste] = useState({ open: false, used: false });
   const setPasteOpen = (open: boolean) => setPaste((current) => ({ open, used: current.used || open }));
   // The picker keeps its last slot while it animates closed.
   const [picker, setPicker] = useState({ open: false, used: false, slot: 0 });

   const { load, undo, canUndo } = editor;
   // The last smart roll's groups, shown under the hand while its cards are in the deck. Other rolls and loads drop it.
   const [smart, setSmart] = useState<SmartDeck | null>(null);
   const [highlight, setHighlight] = useState<readonly number[] | null>(null);

   const rollSmart = () => {
      const lockedCards = slots.filter((slot) => slot.locked).map((slot) => slot.card);
      const result = smartDeck(owned, lockedCards);

      if (!result) {
         editor.roll(owned);
         setSmart(null);
         toast.error(t.smart.fallback);
         return;
      }

      editor.fill(result.cards);
      setSmart(result);
   };

   // Stable: `DeckFromUrl` runs its effect when this changes.
   const loadDeck = useCallback(
      (next: readonly number[]) => {
         load(next);
         setSmart(null);
      },
      [load],
   );

   // Ctrl/⌘+Z undoes the last change, unless the user is typing or a dialog is open.
   useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key.toLowerCase() !== 'z' || !(event.metaKey || event.ctrlKey) || event.shiftKey) return;
         if (isTyping(event.target) || document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
         if (!canUndo) return;

         event.preventDefault();
         undo();
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
   }, [undo, canUndo]);

   const filled = filledSlots(deck);
   const isEmpty = filled === 0;
   const complete = isCompleteDeck(deck);
   const locked = slots.filter((slot) => slot.locked).length;
   const average = averageElixir(deck);
   const cycle = cycleCost(deck);
   const open = useOpenDeckHref(deck);

   const save = async () => {
      setSaving(true);

      try {
         await saveDeck(deck);
         toast.success(session.status === 'signed-in' ? t.builder.savedToAccount : t.builder.savedInBrowser, {
            action: { label: t.builder.viewMyDecks, onClick: () => router.push(href('/decks')) },
         });
      } catch (error) {
         toast.error(t.builder.saveFailed(errorMessage(error, t)));
      } finally {
         setSaving(false);
      }
   };

   // Stored data (pool, draft, session) shows the server's default or a placeholder until it's known: lib/prepaint.ts.
   const deckReady = editor.ready;
   const summary = (
      <Prepaint ready={poolReady} deps={['pool']} placeholder={<TextSkeleton className="w-72 max-w-full" />}>
         {owned.length < DECK_SIZE
            ? t.builder.summaryFew(owned.length, playableCards.length)
            : t.builder.summary(owned.length, playableCards.length)}
      </Prepaint>
   );

   const empties = DECK_SIZE - filled;

   return (
      <>
         {/* The query string is only known in the browser; only this reader waits for it, not the whole page. */}
         <Suspense fallback={null}>
            <DeckFromUrl onDeck={loadDeck} />
         </Suspense>
         <PageHeader
            title={t.builder.title}
            summary={summary}
            actions={
               <>
                  <Button
                     onClick={rollSmart}
                     disabled={!poolReady || owned.length === 0 || locked === DECK_SIZE}
                     title={t.smart.rollHint}
                  >
                     <WandSparkles aria-hidden />
                     {t.smart.roll}
                  </Button>
                  <Button
                     variant="primary"
                     onClick={() => {
                        editor.roll(owned);
                        setSmart(null);
                     }}
                     disabled={!poolReady || owned.length === 0 || locked === DECK_SIZE}
                  >
                     <Dices aria-hidden />
                     {locked > 0 ? t.builder.rollOthers(DECK_SIZE - locked) : t.builder.roll}
                  </Button>
               </>
            }
         />

         <Notice tone={complete ? 'success' : 'info'} className="mb-gap">
            <Prepaint ready={deckReady} deps={['draft']} placeholder={<TextSkeleton className="w-64 max-w-full" />}>
               {complete ? t.builder.ready : isEmpty ? t.builder.start : t.builder.slotsLeft(empties)}
            </Prepaint>
         </Notice>

         <div className="grid grid-cols-1 items-start gap-gap lg:grid-cols-2">
            <Card aria-labelledby="deck-title">
               <CardHeader>
                  <div className="min-w-0">
                     <CardTitle id="deck-title">{t.builder.yourDeck}</CardTitle>
                     <div className="mt-0.5 flex flex-wrap items-center gap-x-3">
                        <dl className="num flex flex-wrap items-center gap-x-3 text-muted" aria-live="polite">
                           <div className="flex gap-1">
                              <dt className="sr-only">{t.builder.cardCount}</dt>
                              <dd>
                                 <Prepaint
                                    ready={deckReady}
                                    deps={['draft']}
                                    placeholder={<TextSkeleton className="w-3" />}
                                 >
                                    <span className={isEmpty ? undefined : 'text-gold'}>{filled}</span>
                                 </Prepaint>{' '}
                                 {t.common.of} {DECK_SIZE}
                              </dd>
                           </div>
                           <div className="flex gap-1">
                              <dt>{t.builder.avgElixir}</dt>
                              <dd className="text-ink">
                                 <Prepaint
                                    ready={deckReady}
                                    deps={['draft']}
                                    placeholder={<TextSkeleton className="w-5" />}
                                 >
                                    {average === null ? '—' : formatDecimal(average, locale)}
                                 </Prepaint>
                              </dd>
                           </div>
                           <div className="flex gap-1">
                              <dt>{t.builder.cycle}</dt>
                              <dd className="text-ink">
                                 <Prepaint
                                    ready={deckReady}
                                    deps={['draft']}
                                    placeholder={<TextSkeleton className="w-4" />}
                                 >
                                    {cycle ?? '—'}
                                 </Prepaint>
                              </dd>
                           </div>
                        </dl>
                        <Popover
                           title={t.builder.statsHelpTitle}
                           trigger={
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="-my-1 size-6 sm:size-6"
                                 aria-label={t.builder.statsHelpLabel}
                              >
                                 <CircleHelp aria-hidden />
                              </Button>
                           }
                        >
                           <dl className="flex flex-col gap-3">
                              <div>
                                 <dt className="font-medium text-ink">{t.builder.avgElixir}</dt>
                                 <dd>{t.builder.avgElixirHelp}</dd>
                              </div>
                              <div>
                                 <dt className="font-medium text-ink">{t.builder.cycle}</dt>
                                 <dd>{t.builder.cycleHelp}</dd>
                              </div>
                           </dl>
                        </Popover>
                     </div>
                  </div>
                  <div className="-mx-2 flex flex-wrap gap-1 sm:mx-0 sm:-mr-2">
                     {player ? (
                        <Button
                           variant="ghost"
                           onClick={() => loadDeck(player.currentDeck)}
                           aria-label={t.builder.myDeckLabel}
                        >
                           <UserRound aria-hidden />
                           {t.builder.myDeck}
                        </Button>
                     ) : (
                        // Held in place while the session loads, when this browser was signed in last time.
                        <Prepaint
                           ready={session.status !== 'loading'}
                           deps={['session']}
                           placeholder={
                              <Button variant="ghost" disabled>
                                 <UserRound aria-hidden />
                                 {t.builder.myDeck}
                              </Button>
                           }
                        />
                     )}
                     <Button variant="ghost" onClick={() => setPasteOpen(true)} aria-label={t.builder.pasteLabel}>
                        <ClipboardPaste aria-hidden />
                        {t.builder.paste}
                     </Button>
                     <Button variant="ghost" onClick={undo} disabled={!canUndo} aria-keyshortcuts="Control+Z Meta+Z">
                        <Undo2 aria-hidden />
                        {t.builder.undo}
                     </Button>
                     <Button
                        variant="ghost"
                        onClick={() => {
                           editor.clear();
                           setSmart(null);
                        }}
                        disabled={isEmpty}
                     >
                        <Eraser aria-hidden />
                        {t.builder.clear}
                     </Button>
                  </div>
               </CardHeader>
               <Prepaint ready={deckReady} deps={['draft']} placeholder={<DeckGrid deck={null} label="" />}>
                  <DeckHand
                     slots={slots}
                     onOpenSlot={(slot) => setPicker({ open: true, used: true, slot })}
                     onToggleLock={editor.toggleLock}
                     onMove={editor.move}
                     onRemove={(slot) => editor.setCard(slot, EMPTY_CARD)}
                     onReorder={editor.reorder}
                     highlight={highlight}
                  />
               </Prepaint>
               {smart ? <DeckGroups smart={smart} deck={deck} onHighlight={setHighlight} /> : null}
            </Card>

            <div className="flex flex-col gap-gap">
               <Card aria-labelledby="share-title" className="flex flex-col gap-4">
                  <CardTitle id="share-title">{t.builder.share}</CardTitle>

                  <Field label={t.builder.deckLink}>
                     <InputGroup>
                        <InputGroupInput
                           readOnly
                           value={complete ? buildDeckLink(deck) : ''}
                           placeholder={t.builder.linkPlaceholder}
                           onFocus={(event) => event.currentTarget.select()}
                           className="text-muted"
                        />
                        <Button
                           className="h-full rounded-none pr-4 pl-3 sm:h-full"
                           disabled={!complete}
                           onClick={() => copyDeckLink(deck, t)}
                        >
                           <Copy aria-hidden />
                           {t.common.copy}
                        </Button>
                     </InputGroup>
                  </Field>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-2">
                     <ShareDeckButton deck={deck} />
                     <LinkButton
                        href={open.href}
                        disabled={!complete}
                        target={open.external ? '_blank' : undefined}
                        rel="noreferrer"
                     >
                        <ExternalLink aria-hidden />
                        {t.common.openInGame}
                     </LinkButton>
                     <Button onClick={save} disabled={isEmpty || saving}>
                        <Bookmark aria-hidden />
                        {saving ? t.builder.saving : t.builder.save}
                     </Button>
                  </div>
               </Card>

               <Card aria-labelledby="pool-title" className="flex flex-col gap-4">
                  <div className="flex items-baseline justify-between gap-4">
                     <CardTitle id="pool-title">{t.builder.pool}</CardTitle>
                     <p className="text-muted">
                        <Prepaint ready={poolReady} deps={['pool']} placeholder={<TextSkeleton className="w-28" />}>
                           {describePreset(poolPreset(pool), t)}
                        </Prepaint>
                     </p>
                  </div>
                  <Prepaint
                     ready={poolReady}
                     deps={['pool']}
                     placeholder={<Meter label={t.builder.poolMeter} value={0} max={playableCards.length} loading />}
                  >
                     <Meter label={t.builder.poolMeter} value={owned.length} max={playableCards.length} />
                  </Prepaint>
                  <Link href={href('/cards')} className="w-fit font-medium underline-offset-4 hover:underline">
                     {t.builder.editPool}
                  </Link>
               </Card>
            </div>
         </div>

         {picker.used ? (
            <CardPicker
               open={picker.open}
               onOpenChange={(next) => setPicker((current) => ({ ...current, open: next }))}
               slot={picker.slot + 1}
               current={deck[picker.slot] ?? EMPTY_CARD}
               deck={deck}
               onPick={(card) => {
                  editor.setCard(picker.slot, card);
                  setPicker((current) => ({ ...current, open: false }));
               }}
               onRemove={() => {
                  editor.setCard(picker.slot, EMPTY_CARD);
                  setPicker((current) => ({ ...current, open: false }));
               }}
            />
         ) : null}

         {paste.used ? (
            <PasteDialog
               open={paste.open}
               onClose={() => setPasteOpen(false)}
               onPaste={(pasted) => {
                  loadDeck(pasted);
                  setPasteOpen(false);
                  toast.success(t.builder.loadedFromLink);
               }}
            />
         ) : null}
      </>
   );
}

/** A deck handed over in the URL (from the profile or a shared link) opens in the builder, then the URL is cleaned. */
function DeckFromUrl({ onDeck }: { onDeck: (deck: number[]) => void }) {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   useEffect(() => {
      const shared = searchParams.get('deck');
      const parsed = shared ? parseDeckLink(`?deck=${shared}`) : null;

      if (parsed) {
         onDeck(parsed);
         router.replace(pathname, { scroll: false });
      }
   }, [searchParams, router, pathname, onDeck]);

   return null;
}
