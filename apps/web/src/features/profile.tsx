'use client';

import { type BattleSummary, isCompleteDeck, type PlayerProfile, playableCards } from '@deckr/shared';
import { Copy, Crown, ExternalLink, Layers, LogIn, Pencil, RefreshCw, Swords, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DeckGrid } from '@/components/deck-grid';
import { PageHeader } from '@/components/page-header';
import { Prepaint } from '@/components/prepaint';
import { ShareDeckButton } from '@/components/share-deck-button';
import {
   actionBarItem,
   Button,
   Card,
   CardDescription,
   CardHeader,
   CardTitle,
   EmptyState,
   LinkButton,
   Meter,
   TextSkeleton,
   toast,
} from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { errorMessage } from '@/lib/api';
import { useCardPool } from '@/lib/card-pool';
import { copyDeckLink, deckQuery, describeDeck, useOpenDeckHref } from '@/lib/deck-actions';
import { formatChange, formatNumber, formatPercent, timeAgo } from '@/lib/format';
import { openLogin, refreshPlayer, useSession } from '@/lib/session';
import { cn } from '@/lib/utils';

export function Profile() {
   const { t } = useI18n();
   const session = useSession();

   const anonymous = (
      <>
         <PageHeader title={t.profile.title} summary={t.profile.anonymousSummary} />
         <EmptyState
            action={
               <Button variant="primary" onClick={openLogin}>
                  <LogIn aria-hidden />
                  {t.common.logIn}
               </Button>
            }
         >
            {t.profile.anonymous}
         </EmptyState>
      </>
   );

   // While the session loads: the logged-out page (the server's version), or the profile's layout with
   // placeholders when this browser was signed in last time (lib/prepaint.ts).
   // Same tree while loading and once anonymous, so the logged-out page isn't rebuilt (and repainted).
   if (session.status !== 'signed-in') {
      return (
         <Prepaint
            ready={session.status === 'anonymous'}
            deps={['session']}
            placeholder={<PlayerView player={null} syncing={false} />}
         >
            {anonymous}
         </Prepaint>
      );
   }

   return <PlayerView player={session.player} syncing={session.syncing} />;
}

/** The profile. With `player` null it renders the same layout, labels and actions, with only the data as placeholders. */
function PlayerView({ player, syncing }: { player: PlayerProfile | null; syncing: boolean }) {
   const { locale, t } = useI18n();

   const refresh = async () => {
      try {
         await refreshPlayer();
         toast.success(t.common.playerDataRefreshed);
      } catch (error) {
         toast.error(t.common.couldNotRefresh(errorMessage(error, t)));
      }
   };

   const subline = player
      ? [`#${player.tag}`, t.profile.kingLevel(player.kingLevel), player.clan?.name].filter(Boolean).join(' · ')
      : null;

   return (
      <div aria-busy={player ? undefined : true}>
         {player ? null : <p className="sr-only">{t.profile.loading}</p>}
         <PageHeader
            title={player ? player.name : <TextSkeleton className="w-40" />}
            summary={subline ?? <TextSkeleton className="w-64" />}
            actions={
               <>
                  <span className="text-xs text-faint">
                     {player ? t.profile.updated(timeAgo(player.syncedAt, locale)) : <TextSkeleton className="w-28" />}
                  </span>
                  <Button onClick={refresh} disabled={!player || syncing}>
                     <RefreshCw aria-hidden className={cn(syncing && 'animate-spin')} />
                     {syncing ? t.common.refreshing : t.common.refresh}
                  </Button>
               </>
            }
         />

         <div className="flex flex-col gap-gap">
            <Stats player={player} />
            <div className="grid grid-cols-1 gap-gap lg:grid-cols-2">
               <CurrentDeck deck={player?.currentDeck ?? null} />
               <Collection player={player} />
            </div>
            <Battles battles={player?.battles ?? null} />
         </div>
      </div>
   );
}

/**
 * One container: trophies lead with their context (best and arena) underneath, then three figures,
 * each with a line that says what it's measured against. Columns are split by a hairline and stack on phones.
 */
function Stats({ player }: { player: PlayerProfile | null }) {
   const { locale, t } = useI18n();
   const percent = (part: number, whole: number) => formatPercent(part, whole, locale);
   const number = (value: number) => formatNumber(value, locale);

   const items: { label: string; value?: string; detail?: string }[] = [
      {
         label: t.profile.winRate,
         value: player ? percent(player.wins, player.wins + player.losses) : undefined,
         detail: player ? t.profile.winsLosses(number(player.wins), number(player.losses)) : undefined,
      },
      {
         label: t.profile.threeCrowns,
         value: player ? number(player.threeCrownWins) : undefined,
         detail: player ? t.profile.ofWins(percent(player.threeCrownWins, player.wins)) : undefined,
      },
      {
         label: t.profile.battles,
         value: player ? number(player.battleCount) : undefined,
         detail: player ? t.profile.kingLevel(player.kingLevel) : undefined,
      },
   ];

   return (
      <Card
         aria-label={t.profile.stats}
         className="grid grid-cols-3 gap-y-5 sm:gap-y-6 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]"
      >
         <div className="col-span-3 min-w-0 lg:col-span-1 lg:pr-8">
            <p className="text-muted">{t.profile.trophies}</p>
            <p className="num mt-1.5 flex items-center gap-2.5 text-3xl font-semibold">
               <Trophy aria-hidden className="size-7 text-gold" />
               {player ? number(player.trophies) : <TextSkeleton className="w-32" />}
            </p>
            <p className="mt-2 text-muted">
               {player ? (
                  <>
                     {player.arena?.name ?? t.profile.noArena}
                     <span className="num text-faint">
                        {' · '}
                        {player.trophies >= player.bestTrophies
                           ? t.profile.atBest
                           : t.profile.best(number(player.bestTrophies))}
                     </span>
                  </>
               ) : (
                  <TextSkeleton className="w-52" />
               )}
            </p>
         </div>

         {items.map((item, index) => (
            <div
               key={item.label}
               // Below `lg` the trophies take the first row and the three figures share the second (three columns,
               // even on phones), split by hairlines.
               className={cn(
                  'min-w-0 border-border',
                  index === 0 ? 'pr-3 lg:border-l lg:pl-8' : 'border-l pr-3 pl-3 sm:pl-6 lg:pl-8',
               )}
            >
               {/* Two lines on phones, where the labels wrap, so the three figures line up. */}
               <p className="text-muted max-sm:min-h-[2lh]">{item.label}</p>
               <p className="num mt-1.5 text-xl font-semibold sm:text-2xl">
                  {item.value ?? <TextSkeleton className="w-16" />}
               </p>
               <p className="num mt-1 text-xs text-faint">
                  {item.detail ?? <TextSkeleton className="w-24 max-w-full" />}
               </p>
            </div>
         ))}
      </Card>
   );
}

function DeckActions({ deck, name }: { deck: number[] | null; name: string }) {
   const { t, href } = useI18n();
   const router = useRouter();
   const cards = deck ?? [];
   const complete = deck !== null && isCompleteDeck(deck);
   const open = useOpenDeckHref(cards);

   // Four actions: a 2 × 2 grid on phones (four columns would squeeze "Compartilhar"), a row from `sm`.
   return (
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
         <Button
            className={actionBarItem}
            onClick={() => router.push(href(`/?${deckQuery(cards)}`))}
            disabled={!deck}
            aria-label={t.profile.editLabel(name)}
         >
            <Pencil aria-hidden />
            {t.profile.editInBuilder}
         </Button>
         <ShareDeckButton deck={cards} className={actionBarItem} />
         <Button className={actionBarItem} onClick={() => copyDeckLink(cards, t)} disabled={!complete}>
            <Copy aria-hidden />
            {t.common.copyLink}
         </Button>
         <LinkButton
            className={actionBarItem}
            href={open.href}
            disabled={!complete}
            target={open.external ? '_blank' : undefined}
            rel="noreferrer"
         >
            <ExternalLink aria-hidden />
            {t.common.openInGame}
         </LinkButton>
      </div>
   );
}

function CurrentDeck({ deck }: { deck: number[] | null }) {
   const { t } = useI18n();

   return (
      <Card aria-labelledby="current-deck-title" className="flex flex-col">
         <CardHeader>
            <CardTitle id="current-deck-title">{t.profile.currentDeck}</CardTitle>
            <CardDescription>{t.profile.currentDeckDescription}</CardDescription>
         </CardHeader>
         <DeckGrid deck={deck} variant="strip" label={t.profile.currentDeckCards} />
         <div className="mt-5">
            <DeckActions deck={deck} name={t.profile.yourCurrentDeck} />
         </div>
      </Card>
   );
}

function Collection({ player }: { player: PlayerProfile | null }) {
   const { t } = useI18n();
   const { setCards } = useCardPool();
   const owned = player?.cards.map((card) => card.index) ?? [];
   const maxed = player?.cards.filter((card) => card.level >= 16).length ?? 0;
   const collectionNote = player
      ? [t.profile.maxed(maxed), player.unknownCards > 0 ? t.profile.unknownCards(player.unknownCards) : null]
           .filter(Boolean)
           .join(' · ')
      : null;

   return (
      <Card aria-labelledby="collection-title" className="flex flex-col gap-4">
         {/* One line on every screen: the description shortens instead of wrapping, so the card keeps its height. */}
         <CardHeader className="mb-0 flex-nowrap sm:mb-0">
            <CardTitle id="collection-title" className="flex-none">
               {t.profile.collection}
            </CardTitle>
            <CardDescription className="num min-w-0 truncate text-right" title={collectionNote ?? undefined}>
               {collectionNote ?? <TextSkeleton className="w-24" />}
            </CardDescription>
         </CardHeader>
         <Meter label={t.profile.unlocked} value={owned.length} max={playableCards.length} loading={!player} />
         <div className="mt-auto">
            <Button
               disabled={!player}
               onClick={() => {
                  setCards(owned);
                  toast.success(t.common.poolSetToCollection(owned.length));
               }}
            >
               <Layers aria-hidden />
               {t.profile.useAsPool}
            </Button>
         </div>
      </Card>
   );
}

const resultStyle = {
   win: 'bg-[#1d2a12] text-[#b9e46a]',
   loss: 'bg-negative-bg text-negative',
   draw: 'bg-raised text-muted',
} as const;

function Battles({ battles }: { battles: BattleSummary[] | null }) {
   const { t } = useI18n();
   const [showAll, setShowAll] = useState(false);

   if (!battles) {
      return (
         <Card aria-labelledby="battles-title">
            <CardHeader>
               <CardTitle id="battles-title">{t.profile.recentBattles}</CardTitle>
               <CardDescription className="num">
                  <TextSkeleton className="w-36" />
               </CardDescription>
            </CardHeader>
            <ul className="flex flex-col">
               {/* As many rows as the list shows before "Show all". */}
               {Array.from({ length: VISIBLE_BATTLES }, (_, row) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders.
                  <BattleRowSkeleton key={row} />
               ))}
            </ul>
            {/* Players usually have more battles than fit, so the real list ends with this button. */}
            <Button variant="ghost" className="mt-3 -ml-2" disabled>
               {t.profile.showAll()}
            </Button>
         </Card>
      );
   }

   const visible = showAll ? battles : battles.slice(0, VISIBLE_BATTLES);
   const wins = battles.filter((battle) => battle.result === 'win').length;

   return (
      <Card aria-labelledby="battles-title">
         <CardHeader>
            <CardTitle id="battles-title">{t.profile.recentBattles}</CardTitle>
            <CardDescription className="num">
               {battles.length === 0 ? t.profile.noBattles : t.profile.wonOf(wins, battles.length)}
            </CardDescription>
         </CardHeader>

         {battles.length === 0 ? (
            <EmptyState>{t.profile.battlesEmpty}</EmptyState>
         ) : (
            <ul className="flex flex-col">
               {visible.map((battle) => (
                  <BattleRow key={battle.time} battle={battle} />
               ))}
            </ul>
         )}

         {battles.length > VISIBLE_BATTLES ? (
            <Button variant="ghost" className="mt-3 -ml-2" onClick={() => setShowAll((value) => !value)}>
               {showAll ? t.profile.showFewer : t.profile.showAll(battles.length)}
            </Button>
         ) : null}
      </Card>
   );
}

/** Battles listed before "Show all". */
const VISIBLE_BATTLES = 6;

const resultPill = 'flex-none rounded-full px-2.5 py-0.5 text-xs font-medium';

const battleRow =
   'grid gap-x-6 gap-y-3 border-t border-border py-4 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] lg:items-center';

function BattleRowSkeleton() {
   const { t } = useI18n();

   return (
      <li className={battleRow}>
         <div className="flex min-w-0 items-start gap-3">
            {/* The same pill as a real result, with its text hidden, so it takes exactly the same space. */}
            <span aria-hidden className={cn(resultPill, 'bg-raised text-transparent')}>
               {t.profile.loss}
            </span>
            <div className="min-w-0 flex-1">
               <p className="num font-medium">
                  <TextSkeleton className="w-40" />
               </p>
               <p className="num text-xs text-faint">
                  <span className="block">
                     <TextSkeleton className="w-28" />
                  </span>
                  <span className="block">
                     <TextSkeleton className="w-40" />
                  </span>
               </p>
            </div>
         </div>
         <DeckGrid deck={null} variant="strip" label={t.profile.opponentDeck} />
         <div className="flex gap-2 lg:flex-col">
            <Button variant="ghost" disabled>
               <Swords aria-hidden />
               {t.profile.tryDeck}
            </Button>
            <Button variant="ghost" disabled>
               <Copy aria-hidden />
               {t.common.copyLink}
            </Button>
         </div>
      </li>
   );
}

function BattleRow({ battle }: { battle: BattleSummary }) {
   const { locale, t } = useI18n();
   const opponent = t.profile.opponentDeckOf(battle.opponent.name);

   return (
      <li className={battleRow}>
         <div className="flex min-w-0 items-start gap-3">
            <span className={cn(resultPill, resultStyle[battle.result])}>{t.profile[battle.result]}</span>
            <div className="min-w-0 flex-1">
               <p className="num flex min-w-0 items-center gap-1.5 font-medium">
                  <Crown aria-hidden className="size-3.5 shrink-0 text-gold" />
                  {/* The score never breaks; a long opponent name is shortened instead. */}
                  <span className="shrink-0 whitespace-nowrap">
                     {battle.crowns}–{battle.opponentCrowns}
                  </span>
                  <span className="shrink-0 text-muted">{t.profile.versus}</span>
                  <span className="min-w-0 truncate">{battle.opponent.name}</span>
               </p>
               {/* Always two lines (mode, then trophies and time), so rows keep one height and match the placeholder. */}
               <p className="num text-xs text-faint">
                  <span className="block truncate">{battle.mode}</span>
                  <span className="block truncate">
                     {[
                        battle.trophyChange !== null ? t.profile.trophyChange(formatChange(battle.trophyChange)) : null,
                        timeAgo(battle.time, locale),
                     ]
                        .filter(Boolean)
                        .join(' · ')}
                  </span>
               </p>
            </div>
         </div>
         <div className="min-w-0">
            <p className="sr-only">{describeDeck(battle.opponentDeck, t)}</p>
            <DeckGrid deck={battle.opponentDeck} variant="strip" label={opponent} />
         </div>
         <div className="flex gap-2 lg:flex-col">
            <OpponentDeckActions deck={battle.opponentDeck} name={opponent} />
         </div>
      </li>
   );
}

function OpponentDeckActions({ deck, name }: { deck: number[]; name: string }) {
   const { t, href } = useI18n();
   const router = useRouter();

   return (
      <>
         <Button
            variant="ghost"
            onClick={() => router.push(href(`/?${deckQuery(deck)}`))}
            aria-label={t.profile.editLabel(name)}
         >
            <Swords aria-hidden />
            {t.profile.tryDeck}
         </Button>
         <Button
            variant="ghost"
            onClick={() => copyDeckLink(deck, t)}
            disabled={!isCompleteDeck(deck)}
            aria-label={t.profile.copyLabel(name)}
         >
            <Copy aria-hidden />
            {t.common.copyLink}
         </Button>
      </>
   );
}
