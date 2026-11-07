import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { BattleSummary, OwnedCard } from '@deckr/shared';
import { type ComparedPlayer, compareProfiles, recentOpponents } from './compare.ts';

const card = (index: number, level: number): OwnedCard => ({ index, level, count: 0, evolutionLevel: 0 });

const player = (overrides: Partial<ComparedPlayer> = {}): ComparedPlayer => ({
   tag: 'AAA',
   name: 'A',
   kingLevel: 50,
   trophies: 7000,
   bestTrophies: 7500,
   arena: null,
   clan: null,
   wins: 100,
   losses: 100,
   threeCrownWins: 30,
   battleCount: 220,
   currentDeck: [1, 2, 3, 4, 5, 6, 7, 8],
   favouriteCard: null,
   cards: [card(1, 16), card(2, 14), card(3, 12)],
   unknownCards: 0,
   syncedAt: '2026-11-07T00:00:00.000Z',
   ...overrides,
});

const metric = (comparison: ReturnType<typeof compareProfiles>, key: string) =>
   comparison.metrics.find((item) => item.key === key);

test('each figure goes to whoever is ahead, and the leads are counted', () => {
   const result = compareProfiles(player({ trophies: 8000 }), player({ tag: 'BBB', kingLevel: 60 }));

   assert.equal(metric(result, 'trophies')?.leader, 'you');
   assert.equal(metric(result, 'kingLevel')?.leader, 'them');
   assert.equal(metric(result, 'wins')?.leader, 'tie');
   assert.deepEqual(result.lead, { you: 1, them: 1 });
});

test('a lead too small to see once rounded is a tie', () => {
   // 52.31% vs 52.34%: both shown as 52.3%.
   const you = player({ wins: 5231, losses: 4769 });
   const them = player({ tag: 'BBB', wins: 5234, losses: 4766 });

   assert.equal(metric(compareProfiles(you, them), 'winRate')?.leader, 'tie');
});

test('a player with no battles has no win rate, and nobody leads it', () => {
   const result = compareProfiles(player({ wins: 0, losses: 0 }), player({ tag: 'BBB' }));

   assert.equal(metric(result, 'winRate')?.you, null);
   assert.equal(metric(result, 'winRate')?.leader, null);
});

test('collections: maxed cards, average level and the overlap', () => {
   const result = compareProfiles(player(), player({ tag: 'BBB', cards: [card(2, 16), card(9, 16)] }));

   assert.deepEqual(metric(result, 'cardsMaxed'), { key: 'cardsMaxed', you: 1, them: 2, leader: 'them' });
   assert.equal(metric(result, 'averageLevel')?.you, 14);
   assert.deepEqual(result.cards, { onlyYou: [1, 3], onlyThem: [9], shared: 1 });
});

test('recent opponents: newest first, each once, never yourself', () => {
   const battle = (tag: string, name: string) =>
      ({ opponent: { tag, name, trophies: null, clan: null } }) as BattleSummary;
   const battles = [
      battle('X1', 'Ana'),
      battle('AAA', 'Me'),
      battle('X1', 'Ana'),
      battle('X2', 'Bia'),
      battle('', '?'),
   ];

   assert.deepEqual(recentOpponents(battles, 'AAA'), [
      { tag: 'X1', name: 'Ana' },
      { tag: 'X2', name: 'Bia' },
   ]);
   assert.equal(recentOpponents(battles, 'AAA', 1).length, 1);
});
