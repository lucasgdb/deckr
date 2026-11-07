'use client';

import { DECK_SIZE, EMPTY_CARD, getCard } from '@deckr/shared';
import { PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { ArrowLeft, ArrowRight, Ellipsis, Lock, LockOpen, Plus, Replace, Trash2 } from 'lucide-react';
import { Button, ContextMenu, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, Tile } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import type { Slot } from '@/lib/deck-editor';
import { cn } from '@/lib/utils';
import { CardArt } from './card-art';
import { ElixirCost } from './elixir-cost';

/*
 * Drag with a mouse after 6px of movement, so a plain click still opens the card picker; on touch, after
 * holding for 200ms, so the page still scrolls. Keyboard users move cards from each card's menu instead.
 * The card is a button (it opens the picker), so dragging is allowed from inside it; only areas marked
 * `data-no-drag` (the card's menu) never start a drag.
 */
const sensors = [
   PointerSensor.configure({
      preventActivation: (event) => event.target instanceof Element && event.target.closest('[data-no-drag]') !== null,
      activationConstraints: (event) =>
         event.pointerType === 'touch'
            ? [new PointerActivationConstraints.Delay({ value: 200, tolerance: 8 })]
            : [new PointerActivationConstraints.Distance({ value: 6 })],
   }),
];

interface DeckHandProps {
   slots: readonly Slot[];
   onOpenSlot: (index: number) => void;
   onToggleLock: (index: number) => void;
   onMove: (from: number, to: number) => void;
   onRemove: (index: number) => void;
   onReorder: (ids: string[]) => void;
   /** Cards to point out (a hovered smart-roll group); the others dim. */
   highlight?: readonly number[] | null;
}

/** The deck being built: 4 × 2 cards that can be dragged into a new order, picked, locked or removed. */
export function DeckHand({ slots, onOpenSlot, onToggleLock, onMove, onRemove, onReorder, highlight }: DeckHandProps) {
   const { t } = useI18n();

   return (
      <DragDropProvider
         sensors={sensors}
         onDragEnd={(event) => {
            if (event.canceled) return;
            onReorder(
               move(
                  slots.map((slot) => slot.id),
                  event,
               ),
            );
         }}
      >
         <ol aria-label={t.hand.label} className="grid grid-cols-4 gap-x-2 gap-y-4 sm:gap-x-gap sm:gap-y-5">
            {slots.map((slot, index) => (
               <SlotItem
                  key={slot.id}
                  slot={slot}
                  index={index}
                  onOpen={() => onOpenSlot(index)}
                  onToggleLock={() => onToggleLock(index)}
                  onMove={(to) => onMove(index, to)}
                  onRemove={() => onRemove(index)}
                  dimmed={highlight ? !highlight.includes(slot.card) : false}
               />
            ))}
         </ol>
      </DragDropProvider>
   );
}

interface SlotItemProps {
   slot: Slot;
   index: number;
   onOpen: () => void;
   onToggleLock: () => void;
   onMove: (to: number) => void;
   onRemove: () => void;
   dimmed: boolean;
}

function SlotItem({ slot, index, onOpen, onToggleLock, onMove, onRemove, dimmed }: SlotItemProps) {
   const { t } = useI18n();
   // The card's button is the drag handle, so the slot keeps its list-item role and dnd-kit adds no second button.
   const { ref, handleRef, isDragging } = useSortable({ id: slot.id, index });
   const empty = slot.card === EMPTY_CARD;
   const card = getCard(slot.card);
   const position = index + 1;
   const artSizes = '(min-width: 1024px) 130px, 25vw';

   // One set of actions for the "⋯" button and for a right click anywhere on the slot.
   const actions = empty ? (
      <>
         <MenuItem onClick={onOpen}>
            <Plus aria-hidden />
            {t.hand.addCard}
         </MenuItem>
         <MenuSeparator />
         <MenuItem onClick={() => onMove(index - 1)} disabled={index === 0}>
            <ArrowLeft aria-hidden />
            {t.hand.moveLeft}
         </MenuItem>
         <MenuItem onClick={() => onMove(index + 1)} disabled={index === DECK_SIZE - 1}>
            <ArrowRight aria-hidden />
            {t.hand.moveRight}
         </MenuItem>
      </>
   ) : (
      <>
         <MenuItem onClick={onOpen}>
            <Replace aria-hidden />
            {t.hand.changeCard}
         </MenuItem>
         <MenuItem onClick={onToggleLock}>
            {slot.locked ? <LockOpen aria-hidden /> : <Lock aria-hidden />}
            {slot.locked ? t.hand.unlock : t.hand.lock}
         </MenuItem>
         <MenuSeparator />
         <MenuItem onClick={() => onMove(index - 1)} disabled={index === 0}>
            <ArrowLeft aria-hidden />
            {t.hand.moveLeft}
         </MenuItem>
         <MenuItem onClick={() => onMove(index + 1)} disabled={index === DECK_SIZE - 1}>
            <ArrowRight aria-hidden />
            {t.hand.moveRight}
         </MenuItem>
         <MenuSeparator />
         <MenuItem variant="danger" onClick={onRemove}>
            <Trash2 aria-hidden />
            {t.hand.remove}
         </MenuItem>
      </>
   );

   // The whole slot (art, name, cost) is both the drag source and the right-click area.
   return (
      <ContextMenu
         menu={actions}
         render={<li ref={ref} />}
         className={cn(
            'group relative min-w-0 touch-manipulation transition-opacity duration-200',
            dimmed && 'opacity-35',
            isDragging ? 'z-10 cursor-grabbing' : 'cursor-grab',
         )}
      >
         {empty ? (
            <Tile
               ref={handleRef}
               onClick={onOpen}
               aria-label={t.hand.emptySlot(position)}
               className="flex aspect-[302/363] cursor-grab flex-col items-center justify-center gap-1.5 rounded-art border border-dashed border-control text-faint transition-colors hover:border-muted hover:text-ink"
            >
               <Plus aria-hidden className="size-5" />
               <span className="px-1 text-center text-xs">{t.hand.addCard}</span>
            </Tile>
         ) : (
            <Tile
               ref={handleRef}
               onClick={onOpen}
               aria-label={t.hand.filledSlot(position, t.common.name(card), slot.locked)}
               className={cn(
                  'relative cursor-grab transition-[filter] duration-150',
                  isDragging && 'cursor-grabbing drop-shadow-[0_16px_24px_rgb(0_0_0/0.65)]',
               )}
            >
               <CardArt index={slot.card} sizes={artSizes} />
               {/* Phones: the cost sits on the art, as in the game, so the line below has room for the name. */}
               <span aria-hidden className="absolute bottom-1 left-1 rounded-full bg-black/75 px-1.5 py-0.5 sm:hidden">
                  <ElixirCost cost={card.elixir} className="text-ink" />
               </span>
               {slot.locked ? (
                  <span
                     aria-hidden
                     className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-black/75 text-gold"
                  >
                     <Lock className="size-3.5" />
                  </span>
               ) : null}
            </Tile>
         )}

         {empty ? null : (
            <div
               data-no-drag
               className="absolute -top-0.5 -right-0.5 opacity-0 transition-opacity pointer-fine:sm:top-1 pointer-fine:sm:right-1 group-focus-within:opacity-100 group-hover:opacity-100 has-[[data-popup-open]]:opacity-100 [@media(hover:none)]:opacity-100"
            >
               <Menu>
                  <MenuTrigger
                     render={
                        // A 40px touch area around a small circle, so the button covers little of the card.
                        <Button
                           variant="ghost"
                           size="icon"
                           className="group/menu size-10 bg-transparent text-ink hover:bg-transparent pointer-fine:sm:size-7"
                           aria-label={t.hand.actionsFor(t.common.name(card))}
                        />
                     }
                  >
                     <span className="flex size-7 items-center justify-center rounded-full bg-black/70 transition-colors group-hover/menu:bg-black/90">
                        <Ellipsis aria-hidden />
                     </span>
                  </MenuTrigger>
                  <MenuContent>{actions}</MenuContent>
               </Menu>
            </div>
         )}

         <div aria-hidden className="mt-1.5 flex items-center justify-center gap-1.5 text-xs">
            {empty ? (
               <span className="text-faint">—</span>
            ) : (
               <>
                  <span className="truncate text-muted">{t.common.name(card)}</span>
                  <ElixirCost cost={card.elixir} className="flex-none max-sm:hidden" />
               </>
            )}
         </div>
      </ContextMenu>
   );
}
