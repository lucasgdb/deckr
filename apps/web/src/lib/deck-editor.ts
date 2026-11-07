'use client';

import { CATALOG_VERSION, cards, DECK_SIZE, EMPTY_CARD } from '@deckr/shared';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { shuffled } from './deck-actions';

/**
 * A slot in the deck being built. The id travels with the card when slots are reordered, which is what
 * drag and drop needs; `locked` keeps the card in place when the rest of the deck is re-rolled.
 */
export interface Slot {
   id: string;
   card: number;
   locked: boolean;
}

const HISTORY_LIMIT = 50;
const DRAFT_KEY = 'deckr.draft';

let nextId = 0;

function slotId() {
   nextId += 1;
   return `slot-${nextId}`;
}

const toSlots = (deck: readonly number[], locked: readonly boolean[] = []): Slot[] =>
   Array.from({ length: DECK_SIZE }, (_, index) => ({
      id: slotId(),
      card: deck[index] ?? EMPTY_CARD,
      locked: (deck[index] ?? EMPTY_CARD) !== EMPTY_CARD && locked[index] === true,
   }));

const isKnownCard = (value: unknown): value is number =>
   typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < cards.length;

function readDraft(): Slot[] | null {
   try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const draft = raw ? (JSON.parse(raw) as { version?: number; cards?: unknown[]; locked?: unknown[] }) : null;

      if (!draft || draft.version !== CATALOG_VERSION || !Array.isArray(draft.cards)) return null;

      return toSlots(
         draft.cards.map((card) => (isKnownCard(card) ? card : EMPTY_CARD)),
         Array.isArray(draft.locked) ? draft.locked.map((value) => value === true) : [],
      );
   } catch {
      return null;
   }
}

function writeDraft(slots: readonly Slot[]) {
   try {
      localStorage.setItem(
         DRAFT_KEY,
         JSON.stringify({
            version: CATALOG_VERSION,
            cards: slots.map((slot) => slot.card),
            locked: slots.map((slot) => slot.locked),
         }),
      );
   } catch {
      // Storage unavailable: the draft just won't survive a reload.
   }
}

interface EditorState {
   slots: Slot[];
   /** Earlier decks, most recent last. */
   history: Slot[][];
}

type EditorAction =
   | { type: 'change'; change: (current: Slot[]) => Slot[] }
   | { type: 'undo' }
   | { type: 'restore'; slots: Slot[] };

function reducer(state: EditorState, action: EditorAction): EditorState {
   switch (action.type) {
      case 'change': {
         const next = action.change(state.slots);
         if (next === state.slots) return state;
         return { slots: next, history: [...state.history.slice(-(HISTORY_LIMIT - 1)), state.slots] };
      }
      case 'undo': {
         const previous = state.history.at(-1);
         return previous ? { slots: previous, history: state.history.slice(0, -1) } : state;
      }
      case 'restore':
         return { slots: action.slots, history: [] };
   }
}

/**
 * The builder's deck: eight slots with undo history, kept as a draft in this browser so a reload
 * doesn't lose work.
 */
export function useDeckEditor() {
   const [{ slots, history }, dispatch] = useReducer(reducer, undefined, () => ({ slots: toSlots([]), history: [] }));
   const restored = useRef(false);
   // False until the draft is restored: the deck shown before that is the server's empty one.
   const [ready, setReady] = useState(false);

   // Restore the draft once, after hydration (the server renders an empty deck).
   useEffect(() => {
      if (restored.current) return;
      restored.current = true;

      const draft = readDraft();
      if (draft) dispatch({ type: 'restore', slots: draft });
      setReady(true);
   }, []);

   useEffect(() => {
      if (restored.current) writeDraft(slots);
   }, [slots]);

   /** Applies a change; the previous deck goes to the undo history. */
   const update = useCallback((change: (current: Slot[]) => Slot[]) => dispatch({ type: 'change', change }), []);

   // Stable actions: safe to use in effect dependencies.
   const actions = useMemo(
      () => ({
         undo() {
            dispatch({ type: 'undo' });
         },

         /** Replaces the whole deck (paste, the player's in-game deck, a deck from a link). Locks are cleared. */
         load(next: readonly number[]) {
            update(() => toSlots(next));
         },

         clear() {
            update((current) => (current.every((slot) => slot.card === EMPTY_CARD) ? current : toSlots([])));
         },

         /**
          * Fills every unlocked slot with different cards drawn from the pool, keeping locked cards where they are.
          * Slots stay empty when the pool runs out.
          */
         roll(pool: readonly number[]) {
            update((current) => {
               const kept = new Set(current.filter((slot) => slot.locked).map((slot) => slot.card));
               const draw = shuffled(pool.filter((card) => !kept.has(card)));

               return current.map((slot) => (slot.locked ? slot : { ...slot, card: draw.shift() ?? EMPTY_CARD }));
            });
         },

         /** Fills the unlocked slots, in order, with these cards; locked cards stay where they are. */
         fill(next: readonly number[]) {
            update((current) => {
               const queue = [...next];
               return current.map((slot) => (slot.locked ? slot : { ...slot, card: queue.shift() ?? EMPTY_CARD }));
            });
         },

         /** Puts a card in a slot. If the card is already elsewhere in the deck, the two slots trade places. */
         setCard(slotIndex: number, card: number) {
            update((current) => {
               const target = current[slotIndex];
               if (!target || target.card === card) return current;

               const existing = card === EMPTY_CARD ? -1 : current.findIndex((slot) => slot.card === card);

               return current.map((slot, index) => {
                  if (index === slotIndex) return { ...slot, card, locked: card === EMPTY_CARD ? false : slot.locked };
                  if (index === existing) return { ...slot, card: target.card, locked: false };
                  return slot;
               });
            });
         },

         toggleLock(slotIndex: number) {
            update((current) =>
               current.map((slot, index) =>
                  index === slotIndex && slot.card !== EMPTY_CARD ? { ...slot, locked: !slot.locked } : slot,
               ),
            );
         },

         /** Moves the slot at `from` to `to`, shifting the slots in between (drag and drop, Move left/right). */
         move(from: number, to: number) {
            update((current) => {
               if (from === to || to < 0 || to >= current.length) return current;

               const next = [...current];
               const [moved] = next.splice(from, 1);
               if (moved) next.splice(to, 0, moved);
               return next;
            });
         },

         /** Applies an order of slot ids computed by drag and drop. */
         reorder(ids: readonly string[]) {
            update((current) => {
               const byId = new Map(current.map((slot) => [slot.id, slot]));
               const next = ids.map((id) => byId.get(id)).filter((slot): slot is Slot => slot !== undefined);

               return next.length === current.length && next.some((slot, index) => slot !== current[index])
                  ? next
                  : current;
            });
         },
      }),
      [update],
   );

   return { ready, slots, deck: slots.map((slot) => slot.card), canUndo: history.length > 0, ...actions };
}
