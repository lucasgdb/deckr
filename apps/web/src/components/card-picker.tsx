'use client';

import { type Arena, arenas, EMPTY_CARD, getCard, playableCards } from '@deckr/shared';
import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Dialog, DialogFooter, PrefixInput, Select, Tile } from '@/components/ui';
import type { Dictionary } from '@/i18n';
import { useI18n } from '@/i18n/provider';
import { useCardPool } from '@/lib/card-pool';
import { usePlayer } from '@/lib/session';
import { cn } from '@/lib/utils';
import { CardArt } from './card-art';
import { ElixirCost } from './elixir-cost';

type Source = 'all' | 'pool' | 'collection';
type Cost = 'any' | '1' | '2' | '3' | '4' | '5' | '6' | '7+';

const costItems = (t: Dictionary): { value: Cost; label: string }[] => [
   { value: 'any', label: t.picker.anyElixir },
   ...(['1', '2', '3', '4', '5', '6', '7+'] as const).map((value) => ({ value, label: t.picker.elixir(value) })),
];

const arenaItems = (t: Dictionary) => [
   { value: 'all', label: t.picker.anyArena },
   ...arenas.map((arena: Arena) => ({ value: String(arena.level), label: t.arenas.label(arena.level, arena.name) })),
];

const normalize = (text: string) =>
   text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z0-9]/g, '');

interface CardPickerProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   /** 1-based slot number, for the title. */
   slot: number;
   /** The card in the slot now, or EMPTY_CARD. */
   current: number;
   deck: readonly number[];
   onPick: (card: number) => void;
   onRemove: () => void;
}

/** Choose a card for one deck slot: search by name, narrow by source, elixir and arena. */
export function CardPicker({ open, onOpenChange, slot, current, deck, onPick, onRemove }: CardPickerProps) {
   const { t } = useI18n();
   const { pool } = useCardPool();
   const player = usePlayer();
   const [query, setQuery] = useState('');
   const [source, setSource] = useState<Source>('all');
   const [cost, setCost] = useState<Cost>('any');
   const [arena, setArena] = useState('all');

   const collection = useMemo(() => new Set(player?.cards.map((card) => card.index) ?? []), [player]);
   const inDeck = new Set(deck.filter((card) => card !== EMPTY_CARD));

   const sourceItems: { value: Source; label: string }[] = [
      { value: 'all', label: t.picker.allCards },
      { value: 'pool', label: t.picker.myPool },
      ...(player ? [{ value: 'collection' as const, label: t.picker.myCollection }] : []),
   ];

   const results = playableCards.filter((card) => {
      if (query && !normalize(card.name).includes(normalize(query))) return false;
      if (source === 'pool' && !pool[card.index]) return false;
      if (source === 'collection' && !collection.has(card.index)) return false;
      if (cost !== 'any' && (cost === '7+' ? (card.elixir ?? 0) < 7 : card.elixir !== Number(cost))) return false;
      if (arena !== 'all' && card.arena !== Number(arena)) return false;
      return true;
   });

   const title = current === EMPTY_CARD ? t.picker.addTitle(slot) : t.picker.replaceTitle(getCard(current).name);

   return (
      <Dialog open={open} onOpenChange={onOpenChange} size="lg" title={title}>
         <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
            <PrefixInput
               prefix={<Search className="size-4" />}
               value={query}
               onChange={(event) => setQuery(event.target.value)}
               placeholder={t.picker.search}
               aria-label={t.picker.search}
               autoFocus
            />
            <Select
               label={t.picker.show}
               inline
               className="sm:w-48"
               items={sourceItems}
               value={source}
               onValueChange={setSource}
            />
            <Select
               label={t.picker.cost}
               inline
               className="sm:w-44"
               items={costItems(t)}
               value={cost}
               onValueChange={setCost}
            />
            <Select
               label={t.picker.arena}
               inline
               className="sm:w-56"
               items={arenaItems(t)}
               value={arena}
               onValueChange={setArena}
            />
         </div>

         <p className="num mt-3 mb-2 text-xs text-faint" aria-live="polite">
            {t.picker.count(results.length)}
         </p>

         <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-1">
            {results.length === 0 ? (
               <p className="rounded-field border border-dashed border-control px-4 py-6 text-center text-muted">
                  {t.picker.noResults}
               </p>
            ) : (
               <ul className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-x-3 gap-y-4">
                  {results.map((card) => {
                     const chosen = card.index === current;
                     const elsewhere = !chosen && inDeck.has(card.index);

                     return (
                        <li key={card.index}>
                           <Tile
                              onClick={() => onPick(card.index)}
                              disabled={chosen}
                              aria-label={t.picker.cardLabel(card.name, card.elixir, elsewhere)}
                              className="flex flex-col items-center gap-1 p-1 hover:bg-active data-disabled:opacity-100"
                           >
                              <CardArt
                                 index={card.index}
                                 sizes="96px"
                                 className={cn((chosen || elsewhere) && 'opacity-40')}
                              />
                              <span className="w-full truncate text-center text-xs">{card.name}</span>
                              <span className="flex items-center gap-1.5">
                                 <ElixirCost cost={card.elixir} />
                                 {chosen ? <span className="text-[11px] text-gold">{t.picker.inSlot}</span> : null}
                                 {elsewhere ? <span className="text-[11px] text-faint">{t.picker.inDeck}</span> : null}
                              </span>
                           </Tile>
                        </li>
                     );
                  })}
               </ul>
            )}
         </div>

         <DialogFooter className="mt-4 justify-between">
            {current === EMPTY_CARD ? (
               <span />
            ) : (
               <Button variant="danger" onClick={onRemove}>
                  <Trash2 aria-hidden />
                  {t.picker.removeFromDeck}
               </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
               {t.common.cancel}
            </Button>
         </DialogFooter>
      </Dialog>
   );
}
