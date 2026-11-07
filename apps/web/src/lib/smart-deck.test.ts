import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cards, DECK_SIZE, EMPTY_CARD, playableCards } from '@deckr/shared';
import { archetypes, smartDeck } from './smart-deck.ts';

const all = playableCards.map((card) => card.index);
const slugs = new Set(cards.map((card) => card.slug));
const average = (deck: number[]) => {
   const costs = deck.map((index) => cards[index]?.elixir).filter((cost): cost is number => typeof cost === 'number');
   return costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
};

test('every card in every archetype exists in the catalog', () => {
   for (const archetype of archetypes) {
      for (const group of archetype.groups) {
         for (const options of group.slots) {
            for (const slug of options) assert.ok(slugs.has(slug), `${archetype.id}: unknown card ${slug}`);
         }
      }
   }
});

test('every archetype can be built from the full pool', () => {
   const seen = new Set<string>();
   for (let i = 0; i < 2000 && seen.size < archetypes.length; i += 1) seen.add(smartDeck(all)?.archetype ?? '');
   for (const archetype of archetypes) assert.ok(seen.has(archetype.id), `${archetype.id} never came out`);
});

test('a smart deck has 8 different cards, in its archetype’s elixir range', () => {
   for (let i = 0; i < 500; i += 1) {
      const deck = smartDeck(all);
      assert.ok(deck);
      assert.equal(deck.cards.length, DECK_SIZE);
      assert.equal(new Set(deck.cards).size, DECK_SIZE);
      assert.ok(!deck.cards.includes(EMPTY_CARD));
      assert.deepEqual(deck.groups.flatMap((group) => group.cards).sort(), [...deck.cards].sort());
      const range = archetypes.find((archetype) => archetype.id === deck.archetype)?.elixir;
      assert.ok(range);
      const avg = average(deck.cards);
      assert.ok(avg >= range[0] - 0.15 && avg <= range[1] + 0.15, `${deck.archetype} averages ${avg}`);
   }
});

test('only cards from the pool are used, and locked cards are kept', () => {
   const locked = [cards.find((card) => card.slug === 'knight')?.index ?? 0];
   for (let i = 0; i < 200; i += 1) {
      const deck = smartDeck(all, locked);
      assert.ok(deck);
      assert.equal(deck.cards.length, DECK_SIZE - 1);
      assert.ok(!deck.cards.includes(locked[0] ?? -1));
      assert.deepEqual(deck.groups[0], { role: 'locked', cards: locked });
   }

   const small = all.slice(0, 12);
   const deck = smartDeck(small);
   if (deck) for (const card of deck.cards) assert.ok(small.includes(card));
});

test('null when the pool can’t make any archetype', () => {
   assert.equal(smartDeck(all.slice(0, 5)), null);
});
