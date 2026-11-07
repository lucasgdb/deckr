'use client';

import { averageElixir, getCard } from '@deckr/shared';
import { Tooltip } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { formatDecimal } from '@/lib/format';
import type { SmartDeck } from '@/lib/smart-deck';
import { CardArt } from './card-art';

interface DeckGroupsProps {
   smart: SmartDeck;
   /** The deck as it is now: groups only list cards still in it. */
   deck: readonly number[];
   /** A group is hovered: its cards, so the hand can point them out. Null when none is. */
   onHighlight: (cards: readonly number[] | null) => void;
}

/** How a smart-rolled deck plays: one square per group (win condition, support, spells…) with its cards. */
export function DeckGroups({ smart, deck, onHighlight }: DeckGroupsProps) {
   const { locale, t } = useI18n();
   const groups = smart.groups
      .map((group) => ({ ...group, cards: group.cards.filter((card) => deck.includes(card)) }))
      .filter((group) => group.cards.length > 0);
   const average = averageElixir(deck);

   return (
      <section aria-labelledby="deck-groups-title" className="mt-6 border-t border-border pt-5">
         <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 id="deck-groups-title" className="font-medium">
               {t.smart.title}
            </h3>
            <p className="num text-xs text-muted">
               {t.smart.archetype(smart.name, average === null ? '—' : formatDecimal(average, locale))}
            </p>
         </div>
         <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {groups.map((group) => {
               const role = t.smart.roles[group.role];

               return (
                  <li
                     key={group.role}
                     onPointerEnter={() => onHighlight(group.cards)}
                     onPointerLeave={() => onHighlight(null)}
                     className="flex items-center gap-3 rounded-field border border-border p-3 transition-colors hover:border-control hover:bg-raised/40"
                  >
                     <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{role.label}</p>
                        <p className="text-xs text-faint">{role.hint}</p>
                     </div>
                     <ol className="flex flex-none gap-1" aria-label={role.label}>
                        {group.cards.map((card) => (
                           <li key={card} className="w-9">
                              <Tooltip render={<div />} content={getCard(card).name}>
                                 <CardArt index={card} alt={getCard(card).name} sizes="36px" />
                              </Tooltip>
                           </li>
                        ))}
                     </ol>
                  </li>
               );
            })}
         </ul>
      </section>
   );
}
