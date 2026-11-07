'use client';

import { type PlayerProfile, playerTagSchema } from '@deckr/shared';
import { ArrowLeftRight, Swords, Trophy } from 'lucide-react';
import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import { DeckGrid } from '@/components/deck-grid';
import { Button, Dialog, ErrorState, Field, PrefixInput, Skeleton, TextSkeleton } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { ApiRequestError, api, errorMessage } from '@/lib/api';
import {
   type ComparedPlayer,
   type Comparison,
   compareProfiles,
   type Leader,
   type Metric,
   type MetricKey,
   recentOpponents,
} from '@/lib/compare';
import { useOpenInBuilder } from '@/lib/deck-editor';
import { formatDecimal, formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

type State =
   | { status: 'idle' }
   | { status: 'loading'; tag: string }
   | { status: 'error'; tag: string; error: unknown }
   | { status: 'ready'; them: ComparedPlayer };

/** Errors that are about the tag typed: shown under the field, where the fix is. The rest get a retry. */
const fieldErrors = new Set(['cr_player_not_found', 'invalid_tag', 'cr_bad_request']);

/**
 * "Compare" on the profile: type another player's tag (or pick someone you just played) and see both players side
 * by side. The field stays at the top, so comparing with someone else is one edit away; the last result is kept
 * while the dialog is closed.
 */
export function CompareDialog({
   open,
   onOpenChange,
   you,
}: {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   you: PlayerProfile;
}) {
   const { t } = useI18n();
   const [draft, setDraft] = useState('');
   const [fieldError, setFieldError] = useState<string | null>(null);
   const [state, setState] = useState<State>({ status: 'idle' });
   const input = useRef<HTMLInputElement>(null);
   // Only the latest lookup may update the dialog, if the player asks for another before the first answers.
   const latest = useRef(0);

   const compare = async (raw: string) => {
      const parsed = playerTagSchema.safeParse(raw);

      if (!parsed.success) {
         setFieldError(t.compare.tagInvalid);
         input.current?.focus();
         return;
      }

      if (parsed.data === you.tag) {
         setFieldError(t.compare.self);
         input.current?.focus();
         return;
      }

      const tag = parsed.data;
      const request = ++latest.current;
      setDraft(tag);
      setFieldError(null);
      setState({ status: 'loading', tag });

      try {
         const { player } = await api.player(tag);
         if (request === latest.current) setState({ status: 'ready', them: player });
      } catch (error) {
         if (request !== latest.current) return;

         if (error instanceof ApiRequestError && error.code && fieldErrors.has(error.code)) {
            setFieldError(errorMessage(error, t));
            setState({ status: 'idle' });
            input.current?.focus();
            return;
         }

         setState({ status: 'error', tag, error });
      }
   };

   const submit = (event: FormEvent) => {
      event.preventDefault();
      compare(draft);
   };

   const loading = state.status === 'loading';
   const opponents = recentOpponents(you.battles, you.tag);

   return (
      <Dialog
         open={open}
         onOpenChange={(next) => {
            if (!next) setFieldError(null);
            onOpenChange(next);
         }}
         size="lg"
         title={t.compare.title}
         description={t.compare.description}
      >
         {/* One scroll area for everything: on phones the field scrolls away and the result gets the screen. */}
         <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 sm:-mx-pad sm:px-pad">
            <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
               <Field label={t.compare.tag} hint={t.compare.tagHint} error={fieldError} className="sm:flex-1">
                  <PrefixInput
                     ref={input}
                     prefix="#"
                     value={draft}
                     onChange={(event) => {
                        setDraft(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                        if (fieldError) setFieldError(null);
                     }}
                     maxLength={15}
                     autoComplete="off"
                     autoCapitalize="characters"
                     spellCheck={false}
                     enterKeyHint="search"
                     placeholder="C8Q2QR08"
                     className="num"
                  />
               </Field>
               <Button variant="primary" type="submit" className="sm:mt-7 pointer-fine:sm:h-10" disabled={loading}>
                  <ArrowLeftRight aria-hidden />
                  {loading ? t.compare.loading : t.compare.submit}
               </Button>
            </form>

            {opponents.length > 0 ? (
               <div className="mt-4">
                  <p className="text-xs text-faint">{t.compare.recent}</p>
                  {/* One row that scrolls sideways on phones, so the result keeps the room below. */}
                  <ul className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-0 sm:flex-wrap sm:px-0">
                     {opponents.map((opponent) => {
                        const current =
                           (state.status === 'ready' && state.them.tag === opponent.tag) ||
                           (state.status === 'loading' && state.tag === opponent.tag);

                        return (
                           <li key={opponent.tag} className="shrink-0">
                              <Button
                                 variant="secondary"
                                 className={cn('max-w-56', current && 'bg-ink text-black hover:bg-ink-hover')}
                                 aria-label={t.compare.recentLabel(opponent.name, opponent.tag)}
                                 aria-pressed={current}
                                 disabled={loading}
                                 onClick={() => compare(opponent.tag)}
                              >
                                 <span className="truncate">{opponent.name}</span>
                              </Button>
                           </li>
                        );
                     })}
                  </ul>
               </div>
            ) : null}

            <div
               className="-mx-4 mt-5 border-t border-border px-4 pt-5 sm:-mx-pad sm:px-pad"
               aria-live="polite"
               aria-busy={loading}
            >
               {state.status === 'idle' ? (
                  <p className="rounded-field border border-dashed border-control px-4 py-6 text-center text-pretty text-muted">
                     {t.compare.empty}
                  </p>
               ) : state.status === 'loading' ? (
                  <ResultSkeleton />
               ) : state.status === 'error' ? (
                  <ErrorState message={errorMessage(state.error, t)} onRetry={() => compare(state.tag)} />
               ) : (
                  <Result you={you} them={state.them} onClose={() => onOpenChange(false)} />
               )}
            </div>
         </div>
      </Dialog>
   );
}

function Result({ you, them, onClose }: { you: PlayerProfile; them: ComparedPlayer; onClose: () => void }) {
   const { t } = useI18n();
   const comparison = compareProfiles(you, them);
   const { lead } = comparison;

   return (
      <div className="flex flex-col gap-6 pb-1">
         <section aria-label={`${you.name} ${t.compare.versus} ${them.name}`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-5">
               <PlayerHeading player={you} label={t.compare.you} align="start" />
               <span aria-hidden className="mt-6 text-xs font-medium tracking-wide text-faint uppercase">
                  {t.compare.versus}
               </span>
               <PlayerHeading player={them} align="end" />
            </div>
            {lead.you + lead.them > 0 ? (
               <p className="mt-4 flex justify-center">
                  <span
                     className={cn(
                        'num inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                        lead.you > lead.them ? 'bg-gold text-black' : 'bg-raised text-ink',
                     )}
                  >
                     <Trophy aria-hidden className="size-3.5" />
                     {t.compare.summary(lead.you, lead.them, them.name)}
                  </span>
               </p>
            ) : null}
         </section>

         <section aria-labelledby="compare-stats">
            <h3 id="compare-stats" className="sr-only">
               {t.compare.stats}
            </h3>
            <ul className="flex flex-col">
               {comparison.metrics.map((metric) => (
                  <MetricRow key={metric.key} metric={metric} name={them.name} />
               ))}
            </ul>
         </section>

         <Decks you={you} them={them} comparison={comparison} onTry={onClose} />
         <Cards name={them.name} comparison={comparison} />
      </div>
   );
}

function PlayerHeading({ player, label, align }: { player: ComparedPlayer; label?: string; align: 'start' | 'end' }) {
   const { t } = useI18n();

   return (
      <div className={cn('min-w-0', align === 'end' && 'text-right')}>
         <p className="text-xs text-faint">{label ?? `#${player.tag}`}</p>
         <p className="mt-0.5 truncate text-lg font-semibold" title={player.name}>
            {player.name}
         </p>
         <p className="num truncate text-xs text-muted">
            {[t.profile.kingLevel(player.kingLevel), player.clan?.name ?? t.compare.noClan].join(' · ')}
         </p>
      </div>
   );
}

const formatters: Record<MetricKey, 'number' | 'percent' | 'decimal'> = {
   trophies: 'number',
   bestTrophies: 'number',
   kingLevel: 'number',
   winRate: 'percent',
   wins: 'number',
   threeCrownWins: 'number',
   battles: 'number',
   cardsUnlocked: 'number',
   cardsMaxed: 'number',
   averageLevel: 'decimal',
};

/**
 * One figure: both values with the label between them, and a bar from the centre out to each side, as long as the
 * value against the larger of the two. The leader's value and bar are gold; a screen reader hears one sentence.
 */
function MetricRow({ metric, name }: { metric: Metric; name: string }) {
   const { locale, t } = useI18n();
   const label = t.compare.metrics[metric.key];

   const format = (value: number | null) => {
      if (value === null) return '—';
      if (formatters[metric.key] === 'percent') return formatPercent(value, 1, locale);
      return formatters[metric.key] === 'decimal' ? formatDecimal(value, locale) : formatNumber(value, locale);
   };

   const top = Math.max(metric.you ?? 0, metric.them ?? 0);
   const width = (value: number | null) => (top > 0 && value !== null ? `${(value / top) * 100}%` : '0%');

   return (
      <li className="border-t border-border py-3 first:border-t-0 first:pt-0">
         <p className="sr-only">{t.compare.row(label, format(metric.you), format(metric.them), name, metric.leader)}</p>
         <div aria-hidden>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline gap-3">
               <Value leads={metric.leader === 'you'}>{format(metric.you)}</Value>
               <span className="text-center text-xs text-muted sm:text-sm">{label}</span>
               <Value leads={metric.leader === 'them'} className="text-right">
                  {format(metric.them)}
               </Value>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
               <div className="flex h-1.5 justify-end overflow-hidden rounded-l-full bg-active">
                  <span className={bar(metric.leader, 'you')} style={{ width: width(metric.you) }} />
               </div>
               <div className="flex h-1.5 overflow-hidden rounded-r-full bg-active">
                  <span className={bar(metric.leader, 'them')} style={{ width: width(metric.them) }} />
               </div>
            </div>
         </div>
      </li>
   );
}

const bar = (leader: Leader, side: 'you' | 'them') =>
   cn('h-full transition-[width] duration-500 ease-out', leader === side ? 'bg-gold' : 'bg-control');

function Value({ leads, className, children }: { leads: boolean; className?: string; children: string }) {
   return (
      <span
         className={cn(
            'num truncate text-base font-semibold sm:text-lg',
            leads ? 'text-gold' : 'text-muted',
            className,
         )}
      >
         {children}
      </span>
   );
}

function Decks({
   you,
   them,
   comparison,
   onTry,
}: {
   you: PlayerProfile;
   them: ComparedPlayer;
   comparison: Comparison;
   onTry: () => void;
}) {
   const { locale, t } = useI18n();
   const openInBuilder = useOpenInBuilder();
   const elixir = (value: number | null) => (value === null ? '—' : t.compare.elixir(formatDecimal(value, locale)));

   return (
      <section aria-labelledby="compare-decks">
         <h3 id="compare-decks" className="mb-3 font-semibold">
            {t.compare.decks}
         </h3>
         <div className="grid gap-4 md:grid-cols-2">
            <DeckPanel title={t.compare.yourDeck} detail={elixir(comparison.elixir.you)} deck={you.currentDeck} />
            <DeckPanel
               title={t.compare.theirDeck(them.name)}
               detail={elixir(comparison.elixir.them)}
               deck={them.currentDeck}
               action={
                  <Button
                     variant="ghost"
                     className="-ml-2"
                     onClick={() => {
                        onTry();
                        openInBuilder(them.currentDeck);
                     }}
                  >
                     <Swords aria-hidden />
                     {t.compare.tryDeck}
                  </Button>
               }
            />
         </div>
      </section>
   );
}

function DeckPanel({
   title,
   detail,
   deck,
   action,
}: {
   title: string;
   detail: string;
   deck: number[];
   action?: ReactNode;
}) {
   return (
      <div className="min-w-0 rounded-field border border-border p-3">
         <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <p className="min-w-0 truncate font-medium">{title}</p>
            <p className="num shrink-0 text-xs text-faint">{detail}</p>
         </div>
         <DeckGrid deck={deck} variant="strip" label={title} />
         {action ? <div className="mt-2">{action}</div> : null}
      </div>
   );
}

function Cards({ name, comparison }: { name: string; comparison: Comparison }) {
   const { locale, t } = useI18n();
   const { onlyYou, shared, onlyThem } = comparison.cards;
   const items = [
      { label: t.compare.onlyYou, count: onlyYou.length },
      { label: t.compare.shared, count: shared },
      { label: t.compare.onlyThem(name), count: onlyThem.length },
   ];

   return (
      <section aria-labelledby="compare-cards">
         <h3 id="compare-cards" className="mb-3 font-semibold">
            {t.compare.cards}
         </h3>
         <dl className="grid grid-cols-3 rounded-field border border-border">
            {items.map((item, index) => (
               <div key={item.label} className={cn('min-w-0 px-3 py-3', index > 0 && 'border-l border-border')}>
                  <dt className="truncate text-xs text-faint" title={item.label}>
                     {item.label}
                  </dt>
                  <dd className="num mt-1">
                     <span className="text-lg font-semibold">{formatNumber(item.count, locale)}</span>{' '}
                     <span className="text-xs text-muted">{t.compare.cardsUnit(item.count)}</span>
                  </dd>
               </div>
            ))}
         </dl>
      </section>
   );
}

/** The result's layout while the player loads, so nothing jumps when it arrives. */
function ResultSkeleton() {
   const { t } = useI18n();

   return (
      <div className="flex flex-col gap-6" role="status">
         <span className="sr-only">{t.compare.loadingLabel}</span>
         <div aria-hidden className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-5">
            <div>
               <TextSkeleton className="w-10" />
               <p className="mt-0.5 text-lg">
                  <TextSkeleton className="w-32 max-w-full" />
               </p>
               <TextSkeleton className="w-24" />
            </div>
            <span className="mt-6 text-xs text-transparent">{t.compare.versus}</span>
            <div className="flex flex-col items-end">
               <TextSkeleton className="w-14" />
               <p className="mt-0.5 text-lg">
                  <TextSkeleton className="w-32 max-w-full" />
               </p>
               <TextSkeleton className="w-24" />
            </div>
         </div>
         <ul aria-hidden className="flex flex-col">
            {Array.from({ length: 6 }, (_, row) => (
               // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders.
               <li key={row} className="border-t border-border py-3 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between text-lg">
                     <TextSkeleton className="w-14" />
                     <TextSkeleton className="w-20" />
                     <TextSkeleton className="w-14" />
                  </div>
                  <Skeleton className="mt-2 h-1.5 rounded-full" />
               </li>
            ))}
         </ul>
      </div>
   );
}
