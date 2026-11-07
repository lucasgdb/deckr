'use client';

import { DECK_SIZE, EMPTY_CARD, getCard } from '@deckr/shared';
import { Skeleton, TextSkeleton, Tooltip } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';
import { CardArt } from './card-art';

interface DeckGridProps {
   /** The deck's cards, or null while it loads (eight placeholders at the cards' real size). */
   deck: readonly number[] | null;
   /** `hand` is a 4 × 2 hand with names; `strip` is a compact row for lists, where names show on hover. */
   variant?: 'hand' | 'strip';
   label: string;
}

export function DeckGrid({ deck, variant = 'hand', label }: DeckGridProps) {
   const { t } = useI18n();
   const hand = variant === 'hand';
   const grid = cn(
      'grid grid-cols-4',
      hand ? 'gap-x-2 gap-y-4 sm:gap-x-gap sm:gap-y-5' : 'gap-1.5 sm:grid-cols-8 sm:gap-2',
   );

   if (!deck) {
      return (
         <div aria-hidden className={grid}>
            {Array.from({ length: DECK_SIZE }, (_, slot) => (
               // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders.
               <div key={slot}>
                  <Skeleton className="aspect-[302/363] rounded-art" />
                  {hand ? (
                     <p className="mt-1.5 text-center text-xs">
                        <TextSkeleton className="w-3/4" />
                     </p>
                  ) : null}
               </div>
            ))}
         </div>
      );
   }

   return (
      <ol aria-label={label} className={grid}>
         {deck.map((index, slot) => {
            const card = getCard(index);
            const empty = index === EMPTY_CARD;
            const art = (
               <CardArt
                  index={index}
                  alt={t.common.name(card)}
                  sizes={hand ? '(min-width: 1024px) 130px, 25vw' : '(min-width: 640px) 110px, 25vw'}
               />
            );

            return (
               // biome-ignore lint/suspicious/noArrayIndexKey: a deck is a fixed set of 8 slots.
               <li key={slot} className="min-w-0">
                  {empty ? (
                     <div className="flex aspect-[302/363] items-center justify-center rounded-art border border-dashed border-control text-center text-xs text-faint">
                        <span className={hand ? undefined : 'sr-only'}>{t.common.emptySlot}</span>
                     </div>
                  ) : hand ? (
                     art
                  ) : (
                     // No name under the art here, so it shows on hover. The image's alt text names it for screen readers.
                     <Tooltip render={<div />} content={t.common.cardTooltip(t.common.name(card), card.elixir)}>
                        {art}
                     </Tooltip>
                  )}
                  {hand ? (
                     <p
                        aria-hidden
                        className={cn('mt-1.5 truncate text-center text-xs', empty ? 'text-faint' : 'text-muted')}
                     >
                        {empty ? '—' : t.common.name(card)}
                     </p>
                  ) : null}
               </li>
            );
         })}
      </ol>
   );
}
