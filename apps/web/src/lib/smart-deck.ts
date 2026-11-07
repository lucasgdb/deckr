import { cards, DECK_SIZE, EMPTY_CARD } from '@deckr/shared';
// (No `@/` imports here, so `node --test` can load it: src/lib/smart-deck.test.ts.)

/*
 * "Smart roll": random decks that still make sense. Each archetype is a well-known way to play (taken from decks
 * that are or were meta), split into groups with one job each: the win condition and its partner, bait, support,
 * defense, spells, cycle. A group lists its slots, and each slot the cards that can fill it, so every roll differs
 * while the deck keeps its logic. No AI, no network: a weighted random pick among valid combinations.
 */

export type GroupRole = 'win' | 'bait' | 'support' | 'defense' | 'air' | 'spells' | 'cycle' | 'locked';

interface GroupSpec {
   role: Exclude<GroupRole, 'locked'>;
   /** One card per slot, chosen among the slot's options (card slugs). */
   slots: readonly (readonly string[])[];
}

interface Archetype {
   id: string;
   /** The community's name for it; the same in every language. */
   name: string;
   /** Average elixir range a deck of this archetype should land in (Mirror excluded). */
   elixir: readonly [number, number];
   groups: readonly GroupSpec[];
}

const smallSpells = ['the-log', 'zap', 'arrows', 'barbarian-barrel', 'giant-snowball'];
const cycleCards = ['skeletons', 'ice-spirit', 'electro-spirit', 'fire-spirit'];

export const archetypes: readonly Archetype[] = [
   {
      id: 'hog-cycle',
      name: 'Hog Cycle',
      elixir: [2.6, 3.4],
      groups: [
         { role: 'win', slots: [['hog-rider'], ['ice-golem', 'earthquake', 'valkyrie']] },
         {
            role: 'defense',
            slots: [
               ['cannon', 'tesla', 'bomb-tower'],
               ['musketeer', 'firecracker', 'electro-wizard'],
            ],
         },
         { role: 'cycle', slots: [cycleCards, cycleCards] },
         { role: 'spells', slots: [['fireball', 'poison', 'rocket'], smallSpells] },
      ],
   },
   {
      id: 'log-bait',
      name: 'Log Bait',
      elixir: [2.8, 3.5],
      groups: [
         { role: 'bait', slots: [['goblin-barrel'], ['princess', 'dart-goblin'], ['goblin-gang', 'skeleton-army']] },
         {
            role: 'defense',
            slots: [
               ['inferno-tower', 'tesla', 'cannon'],
               ['knight', 'valkyrie'],
            ],
         },
         { role: 'spells', slots: [['rocket'], ['the-log']] },
         { role: 'cycle', slots: [['ice-spirit', 'electro-spirit', 'skeletons']] },
      ],
   },
   {
      id: 'golem',
      name: 'Golem Beatdown',
      elixir: [3.8, 4.7],
      groups: [
         { role: 'win', slots: [['golem'], ['night-witch']] },
         {
            role: 'support',
            slots: [
               ['baby-dragon', 'electro-dragon'],
               ['lumberjack', 'dark-prince'],
            ],
         },
         { role: 'air', slots: [['tornado'], ['mega-minion', 'inferno-dragon']] },
         {
            role: 'spells',
            slots: [
               ['lightning', 'poison'],
               ['barbarian-barrel', 'zap', 'the-log'],
            ],
         },
      ],
   },
   {
      id: 'lavaloon',
      name: 'LavaLoon',
      elixir: [3.5, 4.3],
      groups: [
         { role: 'win', slots: [['lava-hound'], ['balloon']] },
         {
            role: 'air',
            slots: [['mega-minion'], ['minions', 'bats'], ['skeleton-dragons', 'inferno-dragon', 'baby-dragon']],
         },
         { role: 'defense', slots: [['tombstone', 'guards', 'skeleton-army']] },
         {
            role: 'spells',
            slots: [
               ['fireball', 'lightning'],
               ['zap', 'the-log', 'barbarian-barrel'],
            ],
         },
      ],
   },
   {
      id: 'x-bow',
      name: 'X-Bow Cycle',
      elixir: [2.6, 3.4],
      groups: [
         { role: 'win', slots: [['x-bow'], ['tesla']] },
         {
            role: 'defense',
            slots: [
               ['knight', 'ice-golem'],
               ['archers', 'firecracker'],
            ],
         },
         { role: 'cycle', slots: [['skeletons'], ['ice-spirit', 'electro-spirit']] },
         {
            role: 'spells',
            slots: [
               ['fireball', 'rocket'],
               ['the-log', 'zap'],
            ],
         },
      ],
   },
   {
      id: 'miner-control',
      name: 'Miner Control',
      elixir: [3.0, 3.7],
      groups: [
         { role: 'win', slots: [['miner'], ['poison']] },
         {
            role: 'defense',
            slots: [
               ['inferno-tower', 'bomb-tower', 'tesla'],
               ['valkyrie', 'knight', 'bandit'],
            ],
         },
         {
            role: 'support',
            slots: [
               ['musketeer', 'electro-wizard', 'magic-archer'],
               ['bats', 'minions', 'spear-goblins'],
            ],
         },
         { role: 'cycle', slots: [cycleCards] },
         { role: 'spells', slots: [['the-log', 'zap', 'arrows']] },
      ],
   },
   {
      id: 'graveyard',
      name: 'Graveyard',
      elixir: [3.2, 4.0],
      groups: [
         { role: 'win', slots: [['graveyard'], ['poison', 'freeze']] },
         {
            role: 'support',
            slots: [
               ['ice-wizard', 'baby-dragon'],
               ['knight', 'valkyrie', 'bowler'],
            ],
         },
         { role: 'defense', slots: [['tornado'], ['tombstone', 'cannon-cart', 'cannon']] },
         { role: 'spells', slots: [['barbarian-barrel', 'the-log', 'zap']] },
         { role: 'cycle', slots: [['ice-spirit', 'skeletons']] },
      ],
   },
   {
      id: 'pekka-bridge-spam',
      name: 'PEKKA Bridge Spam',
      elixir: [3.5, 4.2],
      groups: [
         { role: 'win', slots: [['pekka'], ['battle-ram', 'ram-rider']] },
         {
            role: 'support',
            slots: [
               ['bandit', 'royal-ghost'],
               ['magic-archer', 'electro-wizard', 'dark-prince'],
            ],
         },
         { role: 'air', slots: [['minions', 'bats', 'mega-minion']] },
         {
            role: 'spells',
            slots: [
               ['poison', 'fireball'],
               ['zap', 'the-log'],
            ],
         },
         { role: 'cycle', slots: [['electro-spirit', 'ice-spirit', 'royal-ghost']] },
      ],
   },
   {
      id: 'royal-giant',
      name: 'Royal Giant',
      elixir: [3.4, 4.1],
      groups: [
         { role: 'win', slots: [['royal-giant'], ['fisherman', 'lightning']] },
         {
            role: 'support',
            slots: [
               ['hunter', 'mother-witch', 'electro-wizard'],
               ['phoenix', 'mega-minion'],
            ],
         },
         {
            role: 'defense',
            slots: [
               ['skeletons', 'guards'],
               ['electro-spirit', 'ice-spirit'],
            ],
         },
         { role: 'spells', slots: [['fireball', 'poison'], smallSpells] },
      ],
   },
   {
      id: 'giant-double-prince',
      name: 'Giant Double Prince',
      elixir: [3.3, 4.0],
      groups: [
         { role: 'win', slots: [['giant'], ['prince'], ['dark-prince']] },
         {
            role: 'support',
            slots: [
               ['electro-wizard', 'musketeer'],
               ['mega-minion', 'minions'],
            ],
         },
         { role: 'cycle', slots: [['ice-spirit', 'electro-spirit', 'skeletons']] },
         {
            role: 'spells',
            slots: [
               ['zap', 'the-log'],
               ['fireball', 'poison'],
            ],
         },
      ],
   },
   {
      id: 'mega-knight',
      name: 'Mega Knight',
      elixir: [3.4, 4.1],
      groups: [
         { role: 'win', slots: [['mega-knight'], ['miner', 'wall-breakers', 'royal-hogs']] },
         {
            role: 'support',
            slots: [
               ['bats', 'minions'],
               ['inferno-dragon', 'electro-wizard', 'musketeer'],
            ],
         },
         { role: 'bait', slots: [['goblin-gang', 'skeleton-barrel', 'spear-goblins']] },
         {
            role: 'spells',
            slots: [
               ['zap', 'the-log'],
               ['fireball', 'poison', 'arrows'],
            ],
         },
         { role: 'cycle', slots: [['ice-spirit', 'electro-spirit']] },
      ],
   },
   {
      id: 'electro-giant',
      name: 'Electro Giant',
      elixir: [3.6, 4.4],
      groups: [
         { role: 'win', slots: [['electro-giant'], ['tornado', 'lightning']] },
         {
            role: 'support',
            slots: [
               ['bowler', 'baby-dragon', 'dark-prince'],
               ['mother-witch', 'golden-knight'],
            ],
         },
         {
            role: 'defense',
            slots: [
               ['cannon', 'tombstone', 'goblin-cage'],
               ['barbarian-barrel', 'zap'],
            ],
         },
         { role: 'spells', slots: [['poison', 'fireball', 'void']] },
         { role: 'cycle', slots: [cycleCards] },
      ],
   },
   {
      id: 'goblin-giant-sparky',
      name: 'Goblin Giant Sparky',
      elixir: [3.7, 4.4],
      groups: [
         { role: 'win', slots: [['goblin-giant'], ['sparky']] },
         {
            role: 'support',
            slots: [
               ['dark-prince', 'mini-pekka'],
               ['mega-minion', 'minions'],
            ],
         },
         { role: 'cycle', slots: [['ice-spirit', 'electro-spirit', 'heal-spirit']] },
         {
            role: 'spells',
            slots: [
               ['zap', 'the-log'],
               ['rage', 'fireball'],
            ],
         },
         { role: 'defense', slots: [['goblin-gang', 'skeleton-army', 'guards']] },
      ],
   },
   {
      id: 'balloon',
      name: 'Balloon Cycle',
      elixir: [3.0, 3.8],
      groups: [
         { role: 'win', slots: [['balloon'], ['lumberjack', 'freeze', 'miner']] },
         {
            role: 'defense',
            slots: [
               ['inferno-tower', 'bomb-tower', 'tesla'],
               ['ice-golem', 'knight', 'valkyrie'],
            ],
         },
         { role: 'support', slots: [['musketeer', 'electro-wizard', 'baby-dragon']] },
         { role: 'cycle', slots: [cycleCards] },
         { role: 'spells', slots: [smallSpells, ['fireball', 'poison', 'arrows']] },
      ],
   },
];

export interface SmartGroup {
   role: GroupRole;
   cards: number[];
}

export interface SmartDeck {
   archetype: string;
   name: string;
   /** The cards for the unlocked slots, in group order. */
   cards: number[];
   groups: SmartGroup[];
}

const bySlug = new Map(cards.map((card) => [card.slug, card]));

const pick = <T>(items: readonly T[], random: () => number): T | undefined =>
   items[Math.floor(random() * items.length)];

const averageOf = (deck: readonly number[]) => {
   const costs = deck.flatMap((index) => {
      const elixir = cards[index]?.elixir;
      return typeof elixir === 'number' ? [elixir] : [];
   });
   return costs.length ? costs.reduce((sum, cost) => sum + cost, 0) / costs.length : 0;
};

/** One attempt at an archetype: a card per slot, from the pool, no repeats. Null when the pool can't fill it. */
function build(archetype: Archetype, pool: ReadonlySet<number>, locked: readonly number[], random: () => number) {
   const used = new Set(locked);
   const groups: SmartGroup[] = locked.length ? [{ role: 'locked', cards: [...locked] }] : [];
   let free = DECK_SIZE - locked.length;

   for (const spec of archetype.groups) {
      if (free === 0) break;
      const chosen: number[] = [];

      for (const options of spec.slots) {
         if (free === 0) break;
         const available = options
            .map((slug) => bySlug.get(slug)?.index)
            .filter((index): index is number => index !== undefined && pool.has(index) && !used.has(index));
         const card = pick(available, random);

         // The win condition (first slot of the first group) is what the archetype is about: no substitute.
         if (card === undefined) {
            if (spec === archetype.groups[0] && options === spec.slots[0]) return null;
            continue;
         }

         chosen.push(card);
         used.add(card);
         free -= 1;
      }

      if (chosen.length) groups.push({ role: spec.role, cards: chosen });
   }

   if (free > 0) return null;

   const deck = groups.flatMap((group) => group.cards);
   const average = averageOf(deck);

   return average >= archetype.elixir[0] - 0.15 && average <= archetype.elixir[1] + 0.15 ? groups : null;
}

/**
 * A deck that makes sense, built from the player's pool around the locked cards. Null when no archetype can be
 * built from the pool (too few cards, or none of the win conditions).
 */
export function smartDeck(
   pool: readonly number[],
   locked: readonly number[] = [],
   random: () => number = Math.random,
): SmartDeck | null {
   const available = new Set(pool.filter((card) => card !== EMPTY_CARD));
   const lockedCards = locked.filter((card) => card !== EMPTY_CARD);
   const order = [...archetypes].sort(() => random() - 0.5);

   // A few tries per archetype: slot choices are random, and some combinations miss the elixir range.
   for (const archetype of order) {
      for (let attempt = 0; attempt < 12; attempt += 1) {
         const groups = build(archetype, available, lockedCards, random);

         if (groups) {
            return {
               archetype: archetype.id,
               name: archetype.name,
               cards: groups.filter((group) => group.role !== 'locked').flatMap((group) => group.cards),
               groups,
            };
         }
      }
   }

   return null;
}
