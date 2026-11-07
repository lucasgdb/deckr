import { type Arena, arenas, CATALOG_VERSION, cards, EMPTY_CARD } from '@deckr/shared';
import { useSyncExternalStore } from 'react';
import type { Dictionary } from '@/i18n';
import { useHydrated } from './use-hydrated';

/*
 * The card pool is the set of cards a player has unlocked. It is stored as one boolean per card index
 * (index 0 is the empty slot) under the same localStorage keys the first version of Deckr used.
 */
const POOL_KEY = 'cards';
const VERSION_KEY = 'version';
/** Oldest stored format whose indexes still match today's catalog. */
const FIRST_COMPATIBLE_VERSION = 4;

type Pool = readonly boolean[];

const fullPool = (): Pool => cards.map(() => true);

/** What the server renders: every card. The stored pool takes over right after hydration. */
const serverPool: Pool = fullPool();

function readPool(): Pool {
   try {
      const raw = localStorage.getItem(POOL_KEY);
      const version = Number(localStorage.getItem(VERSION_KEY));
      const stored: unknown = raw ? JSON.parse(raw) : null;

      if (!Array.isArray(stored) || version < FIRST_COMPATIBLE_VERSION || version > CATALOG_VERSION) return fullPool();

      // Cards added since the pool was saved join it only if the player had every card before.
      const hadEverything = stored.slice(1).every((inPool) => inPool === true);

      return cards.map((_, index) => (index < stored.length ? stored[index] === true : hadEverything));
   } catch {
      return fullPool();
   }
}

let pool: Pool = typeof window === 'undefined' ? serverPool : readPool();
const listeners = new Set<() => void>();

function emit() {
   for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
   listeners.add(listener);

   const onStorage = (event: StorageEvent) => {
      if (event.key === POOL_KEY || event.key === VERSION_KEY) {
         pool = readPool();
         emit();
      }
   };

   window.addEventListener('storage', onStorage);

   return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
   };
}

function writePool(next: Pool) {
   pool = next;

   try {
      localStorage.setItem(POOL_KEY, JSON.stringify(next));
      localStorage.setItem(VERSION_KEY, String(CATALOG_VERSION));
   } catch {
      // Storage can be unavailable (private mode); the pool still works for this visit.
   }

   emit();
}

const LAST_LEVEL = Math.max(...arenas.map((arena) => arena.level));

/** Every card unlocked up to and including the arena at `level`. */
const poolUpTo = (level: number): Pool => cards.map((card) => card.index === EMPTY_CARD || card.arena <= level);

export function useCardPool() {
   const current = useSyncExternalStore(
      subscribe,
      () => pool,
      () => serverPool,
   );

   // The stored pool is only readable in the browser: until then `pool` is every card, a stand-in to not show.
   const ready = useHydrated();
   const owned = current.flatMap((inPool, index) => (inPool && index !== EMPTY_CARD ? [index] : []));

   return {
      /** False until the stored pool is known; show placeholders for anything that depends on it. */
      ready,
      pool: current,
      owned,
      toggle(index: number) {
         writePool(current.map((inPool, i) => (i === index ? !inPool : inPool)));
      },
      /** Makes the pool exactly these cards, e.g. the player's collection. */
      setCards(indexes: readonly number[]) {
         const owned = new Set(indexes);
         writePool(cards.map((card) => card.index === EMPTY_CARD || owned.has(card.index)));
      },
      /** Puts every card that unlocks up to arena `level` in the pool, and takes the rest out. */
      setUpTo(level: number = LAST_LEVEL) {
         writePool(poolUpTo(level));
      },
   };
}

export type PoolPreset = { kind: 'all' } | { kind: 'arena'; arena: Arena } | { kind: 'custom' };

/** Which "unlocked up to" choice a pool matches: every card, every card up to an arena, or a hand-picked set. */
export function poolPreset(pool: readonly boolean[]): PoolPreset {
   const matches = (level: number) => poolUpTo(level).every((inPool, index) => pool[index] === inPool);

   if (matches(LAST_LEVEL)) return { kind: 'all' };

   const arena = arenas.find((step) => step.level < LAST_LEVEL && matches(step.level));

   return arena ? { kind: 'arena', arena } : { kind: 'custom' };
}

export function describePreset(preset: PoolPreset, t: Dictionary): string {
   if (preset.kind === 'all') return t.pool.everyArena;
   if (preset.kind === 'custom') return t.pool.ownPick;

   return preset.arena.level === 0
      ? t.pool.trainingOnly
      : t.pool.upToArena(preset.arena.level, t.common.name(preset.arena));
}
