import { averageElixir, type BattleSummary, type PlayerProfile } from '@deckr/shared';

/*
 * Two players side by side: the figures the profile shows, who leads each one, and how their collections overlap.
 * Pure functions, so the dialog only lays them out (and the rules are tested on their own).
 */

/** What comparing needs from a player: the profile without its battle log (another player's is never fetched). */
export type ComparedPlayer = Omit<PlayerProfile, 'battles'>;

/** A card's top level in the game, on the one scale every rarity shares. */
export const MAX_CARD_LEVEL = 16;

export const metricKeys = [
   'trophies',
   'bestTrophies',
   'kingLevel',
   'winRate',
   'wins',
   'threeCrownWins',
   'battles',
   'cardsUnlocked',
   'cardsMaxed',
   'averageLevel',
] as const;

export type MetricKey = (typeof metricKeys)[number];

/** Who's ahead on a figure; null when either side has no value (e.g. a win rate with no battles). */
export type Leader = 'you' | 'them' | 'tie' | null;

export interface Metric {
   key: MetricKey;
   you: number | null;
   them: number | null;
   leader: Leader;
}

export interface Comparison {
   metrics: Metric[];
   /** How many figures each side leads. */
   lead: { you: number; them: number };
   /** Catalog indexes of the cards only one side has unlocked, and how many both have. */
   cards: { onlyYou: number[]; onlyThem: number[]; shared: number };
   /** Average elixir of each current deck; null for an empty or unknown deck. */
   elixir: { you: number | null; them: number | null };
}

/** Rounded to what the dialog shows, so a lead is never invisible (52.31% vs 52.34% is a tie at 52.3%). */
const shown: Partial<Record<MetricKey, (value: number) => number>> = {
   winRate: (value) => Math.round(value * 1000) / 1000,
   averageLevel: (value) => Math.round(value * 10) / 10,
};

function values(player: ComparedPlayer): Record<MetricKey, number | null> {
   const games = player.wins + player.losses;
   const levels = player.cards.map((card) => card.level);

   return {
      trophies: player.trophies,
      bestTrophies: player.bestTrophies,
      kingLevel: player.kingLevel,
      winRate: games > 0 ? player.wins / games : null,
      wins: player.wins,
      threeCrownWins: player.threeCrownWins,
      battles: player.battleCount,
      cardsUnlocked: player.cards.length,
      cardsMaxed: levels.filter((level) => level >= MAX_CARD_LEVEL).length,
      averageLevel: levels.length > 0 ? levels.reduce((sum, level) => sum + level, 0) / levels.length : null,
   };
}

function leader(key: MetricKey, you: number | null, them: number | null): Leader {
   if (you === null || them === null) return null;

   const round = shown[key] ?? ((value: number) => value);
   const a = round(you);
   const b = round(them);

   return a === b ? 'tie' : a > b ? 'you' : 'them';
}

export function compareProfiles(you: ComparedPlayer, them: ComparedPlayer): Comparison {
   const mine = values(you);
   const theirs = values(them);
   const metrics = metricKeys.map((key) => ({
      key,
      you: mine[key],
      them: theirs[key],
      leader: leader(key, mine[key], theirs[key]),
   }));

   const yourCards = new Set(you.cards.map((card) => card.index));
   const theirCards = new Set(them.cards.map((card) => card.index));

   return {
      metrics,
      lead: {
         you: metrics.filter((metric) => metric.leader === 'you').length,
         them: metrics.filter((metric) => metric.leader === 'them').length,
      },
      cards: {
         onlyYou: [...yourCards].filter((index) => !theirCards.has(index)),
         onlyThem: [...theirCards].filter((index) => !yourCards.has(index)),
         shared: [...yourCards].filter((index) => theirCards.has(index)).length,
      },
      elixir: { you: averageElixir(you.currentDeck), them: averageElixir(them.currentDeck) },
   };
}

export interface RecentOpponent {
   tag: string;
   name: string;
}

/** The latest distinct opponents from the battle log, newest first: one tap to compare with someone you just played. */
export function recentOpponents(battles: readonly BattleSummary[], ownTag: string, limit = 6): RecentOpponent[] {
   const seen = new Set<string>([ownTag]);
   const opponents: RecentOpponent[] = [];

   for (const battle of battles) {
      const { tag, name } = battle.opponent;
      if (!tag || seen.has(tag)) continue;

      seen.add(tag);
      opponents.push({ tag, name });
      if (opponents.length === limit) break;
   }

   return opponents;
}
