'use client';

import { type Arena, arenas, getCard, type OwnedCard, playableCards } from '@deckr/shared';
import { Layers } from 'lucide-react';
import { useState } from 'react';
import { ArenaArt, CardArt } from '@/components/card-art';
import { PageHeader } from '@/components/page-header';
import { Prepaint } from '@/components/prepaint';
import {
   Button,
   Card,
   CardDescription,
   CardHeader,
   CardTitle,
   EmptyState,
   Select,
   type SelectItem,
   Skeleton,
   TextSkeleton,
   Toggle,
   toast,
} from '@/components/ui';
import type { Dictionary } from '@/i18n';
import { useI18n } from '@/i18n/provider';
import { poolPreset, useCardPool } from '@/lib/card-pool';
import { useSession } from '@/lib/session';
import { cn } from '@/lib/utils';

/** Choices for "Unlocked up to"; "Your own pick" only shows (disabled) when the pool matches none of them. */
function presetItems(custom: boolean, t: Dictionary): SelectItem<string>[] {
   return [
      { value: 'all', label: t.pool.allArenas },
      ...arenas
         .slice(0, -1)
         .map((arena) => ({ value: arena.slug, label: t.arenas.label(arena.level, t.common.name(arena)) })),
      ...(custom ? [{ value: 'custom', label: t.pool.ownPick, disabled: true }] : []),
   ];
}

/*
 * Two things on this screen are only known in the browser: the pool (localStorage) and, for signed-in players,
 * their card levels (the session). Until both are known, what depends on them (the count, the "unlocked up to"
 * choice, each card's art and level) shows the server's default (a first visit: every card, nobody signed in)
 * or, if this browser has a pool or a session stored, placeholders; so they all appear together and nothing
 * changes after it's shown. Names, arenas and labels are the same for everyone and always render.
 */
const deps = ['pool', 'session'] as const;
export function CardPool() {
   const { t } = useI18n();
   const { ready: poolReady, pool, owned, toggle, setUpTo, setCards } = useCardPool();
   const session = useSession();
   const ready = poolReady && session.status !== 'loading';
   const player = session.status === 'signed-in' ? session.player : null;
   const collection = player ? new Map(player.cards.map((card) => [card.index, card])) : null;

   const match = poolPreset(pool);
   const preset = match.kind === 'arena' ? match.arena.slug : match.kind;

   return (
      <>
         <PageHeader
            title={t.pool.title}
            summary={
               <Prepaint ready={ready} deps={deps} placeholder={<TextSkeleton className="w-80 max-w-full" />}>
                  <span className="num text-gold">{owned.length}</span>
                  {t.pool.summary.between}
                  <span className="num">{playableCards.length}</span>
                  {t.pool.summary.after}
               </Prepaint>
            }
            actions={
               <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  {player ? (
                     <Button
                        onClick={() => {
                           setCards(player.cards.map((card) => card.index));
                           toast.success(t.common.poolSetToCollection(player.cards.length));
                        }}
                     >
                        <Layers aria-hidden />
                        {t.pool.useCollection}
                     </Button>
                  ) : (
                     // Held in place (disabled) while the session loads, when this browser was signed in last time.
                     <Prepaint
                        ready={session.status !== 'loading'}
                        deps={['session']}
                        placeholder={
                           <Button disabled>
                              <Layers aria-hidden />
                              {t.pool.useCollection}
                           </Button>
                        }
                     />
                  )}
                  <Select
                     inline
                     label={t.pool.upTo}
                     className="w-full sm:w-80"
                     items={presetItems(preset === 'custom', t)}
                     value={preset}
                     loading={
                        ready ? undefined : (
                           <Prepaint ready={false} deps={deps} placeholder={<TextSkeleton className="w-32" />}>
                              {t.pool.allArenas}
                           </Prepaint>
                        )
                     }
                     onValueChange={(value) => {
                        setUpTo(arenas.find((arena) => arena.slug === value)?.level);
                     }}
                  />
               </div>
            }
         />

         <div className="flex flex-col gap-gap" aria-busy={ready ? undefined : true}>
            {arenas.map((arena, position) => (
               <ArenaSection
                  key={arena.slug}
                  arena={arena}
                  first={position === 0}
                  pool={pool}
                  ready={ready}
                  collection={collection}
                  onToggle={toggle}
                  onUpToHere={() => setUpTo(arena.level)}
               />
            ))}
         </div>
      </>
   );
}

function ArenaSection({
   arena,
   first,
   pool,
   ready,
   collection,
   onToggle,
   onUpToHere,
}: {
   arena: Arena;
   /** The top section: its cards are on screen when the page opens, so their art loads first. */
   first: boolean;
   pool: readonly boolean[];
   /** False while the pool and session load; `pool` is then the default (every card). */
   ready: boolean;
   /** The signed-in player's cards by index, to show their levels. */
   collection: Map<number, OwnedCard> | null;
   onToggle: (index: number) => void;
   onUpToHere: () => void;
}) {
   const { t } = useI18n();
   const titleId = `arena-${arena.slug}`;
   const inPool = arena.cards.filter((index) => pool[index]).length;

   return (
      <Card aria-labelledby={titleId}>
         <CardHeader className="justify-start gap-x-4">
            <ArenaArt slug={arena.slug} level={arena.level} />
            <div className="min-w-0 flex-1 basis-40">
               <CardTitle id={titleId}>{t.common.name(arena)}</CardTitle>
               <CardDescription className="num">
                  {arena.level === 0 ? t.arenas.starting : t.arenas.level(arena.level)}
                  {arena.cards.length === 0 ? null : (
                     <Prepaint
                        ready={ready}
                        deps={deps}
                        placeholder={
                           <>
                              {' · '}
                              <TextSkeleton className="w-20" />
                           </>
                        }
                     >
                        {t.pool.inPool(inPool, arena.cards.length)}
                     </Prepaint>
                  )}
               </CardDescription>
            </div>
            {arena.cards.length > 0 ? (
               <Button
                  variant="ghost"
                  className="-ml-2 sm:ml-0"
                  onClick={onUpToHere}
                  disabled={!ready}
                  aria-label={t.pool.upToHereLabel(t.common.name(arena))}
               >
                  {t.pool.upToHere}
               </Button>
            ) : null}
         </CardHeader>

         {arena.cards.length === 0 ? (
            <EmptyState>{t.pool.noCards}</EmptyState>
         ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-x-3 gap-y-4 sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))]">
               {arena.cards.map((index) => (
                  <li key={index}>
                     <CardToggle
                        index={index}
                        eager={first}
                        inPool={pool[index] === true}
                        ready={ready}
                        owned={collection ? (collection.get(index) ?? null) : undefined}
                        onToggle={() => onToggle(index)}
                     />
                  </li>
               ))}
            </ul>
         )}
      </Card>
   );
}

const toggleLayout = 'flex w-full flex-col items-center gap-1.5 rounded-art p-1';
const artSizes = '(min-width: 640px) 100px, 80px';
const levelLine = 'num -mt-1 text-[11px] text-faint';

/**
 * A card in or out of the pool. Out of the pool, the art greys out and the name is struck through:
 * the line is drawn left to right when the card is turned off and withdrawn right to left when it's
 * turned back on. Nothing moves.
 */
function CardToggle({
   index,
   eager,
   inPool,
   ready,
   owned,
   onToggle,
}: {
   index: number;
   eager: boolean;
   inPool: boolean;
   /** False while the pool and session load: placeholders cover the art and level if this browser has them stored. */
   ready: boolean;
   /** The player's copy of the card; null when they haven't unlocked it; undefined when nobody is signed in. */
   owned?: OwnedCard | null;
   onToggle: () => void;
}) {
   const { t } = useI18n();
   // Animate only changes the player makes, not the pool arriving from storage on load.
   const [touched, setTouched] = useState(false);
   const name = t.common.name(getCard(index));

   return (
      <Toggle
         pressed={inPool}
         disabled={!ready}
         onPressedChange={() => {
            setTouched(true);
            onToggle();
         }}
         aria-label={owned ? t.pool.cardLevel(name, owned.level) : name}
         className={toggleLayout}
      >
         {/* The art always loads; until the pool is known a placeholder may cover it, so both appear together. */}
         <span className="relative block w-full">
            <CardArt
               index={index}
               alt={name}
               eager={eager}
               sizes={artSizes}
               className={cn(
                  'block',
                  touched && 'transition-[filter,opacity] duration-300',
                  !inPool && 'opacity-40 grayscale',
               )}
            />
            {ready ? null : (
               <Prepaint
                  ready={false}
                  deps={deps}
                  placeholder={<Skeleton className="absolute inset-0 rounded-art" />}
               />
            )}
         </span>
         {/* The name is struck through like `line-through`, but the line is drawn in and out. */}
         <span className="relative max-w-full truncate text-center text-xs">
            <span className={cn(touched && 'transition-colors duration-300', inPool ? 'text-ink' : 'text-faint')}>
               {name}
            </span>
            <span
               aria-hidden
               className={cn(
                  'pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left bg-faint',
                  touched && 'transition-transform duration-300 ease-out',
                  inPool ? 'scale-x-0' : 'scale-x-100',
               )}
            />
         </span>
         {ready ? (
            owned !== undefined ? (
               <span className={levelLine}>{owned ? t.pool.level(owned.level) : t.pool.locked}</span>
            ) : null
         ) : (
            <Prepaint
               ready={false}
               deps={['session']}
               placeholder={
                  <span className={levelLine}>
                     <TextSkeleton className="w-10" />
                  </span>
               }
            />
         )}
      </Toggle>
   );
}
