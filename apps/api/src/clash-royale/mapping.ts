import {
   type BattleSummary,
   cardIndexById,
   DECK_SIZE,
   EMPTY_CARD,
   type OwnedCard,
   type PlayerProfile,
   type UpcomingChest,
} from '@deckr/shared';
import type { RawBattle, RawCard, RawPlayer, RawUpcomingChests } from './types.ts';

export const stripTag = (tag: string) => tag.replace(/^#/, '');

/** Card ids → catalog indexes, padded to a full deck; cards newer than the catalog become empty slots. */
function toDeck(cards: RawCard[] | undefined): number[] {
   const deck = (cards ?? []).slice(0, DECK_SIZE).map((card) => cardIndexById(card.id) ?? EMPTY_CARD);
   return [...deck, ...Array.from({ length: DECK_SIZE - deck.length }, () => EMPTY_CARD)];
}

/**
 * The API reports levels relative to each rarity's own scale (a max-level legendary is level 8 of 8).
 * The game shows them on one scale, where every card tops out at the common's max level.
 */
function toOwnedCards(raw: RawCard[] | undefined): { cards: OwnedCard[]; unknown: number } {
   const list = raw ?? [];
   const topLevel = Math.max(0, ...list.map((card) => card.maxLevel ?? 0));
   const cards: OwnedCard[] = [];
   let unknown = 0;

   for (const card of list) {
      const index = cardIndexById(card.id);

      if (index === undefined) {
         unknown += 1;
         continue;
      }

      cards.push({
         index,
         level: (card.level ?? 1) + (topLevel - (card.maxLevel ?? topLevel)),
         count: card.count ?? 0,
         evolutionLevel: card.evolutionLevel ?? 0,
      });
   }

   return { cards, unknown };
}

/** `20240105T153020.000Z` → ISO 8601. */
function battleTime(value: string): string {
   const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(value);
   return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z` : value;
}

function toBattle(raw: RawBattle): BattleSummary | null {
   const me = raw.team[0];
   const them = raw.opponent[0];

   if (!me || !them) return null;

   const crowns = me.crowns ?? 0;
   const opponentCrowns = them.crowns ?? 0;

   return {
      time: battleTime(raw.battleTime),
      mode: raw.gameMode?.name?.replace(/_/g, ' ') ?? raw.type ?? 'Battle',
      result: crowns > opponentCrowns ? 'win' : crowns < opponentCrowns ? 'loss' : 'draw',
      crowns,
      opponentCrowns,
      trophyChange: me.trophyChange ?? null,
      opponent: {
         name: them.name,
         tag: stripTag(them.tag),
         trophies: them.startingTrophies ?? null,
         clan: them.clan?.name ?? null,
      },
      deck: toDeck(me.cards),
      opponentDeck: toDeck(them.cards),
   };
}

export function toProfile(player: RawPlayer, battles: RawBattle[], syncedAt: Date): PlayerProfile {
   const owned = toOwnedCards(player.cards);

   return {
      tag: stripTag(player.tag),
      name: player.name,
      kingLevel: player.expLevel ?? 1,
      trophies: player.trophies ?? 0,
      bestTrophies: player.bestTrophies ?? 0,
      arena: player.arena ? { id: player.arena.id, name: player.arena.name } : null,
      clan: player.clan ? { tag: stripTag(player.clan.tag), name: player.clan.name, role: player.role ?? null } : null,
      wins: player.wins ?? 0,
      losses: player.losses ?? 0,
      threeCrownWins: player.threeCrownWins ?? 0,
      battleCount: player.battleCount ?? 0,
      currentDeck: toDeck(player.currentDeck),
      favouriteCard: player.currentFavouriteCard ? (cardIndexById(player.currentFavouriteCard.id) ?? null) : null,
      cards: owned.cards,
      unknownCards: owned.unknown,
      battles: battles
         .slice(0, 25)
         .map(toBattle)
         .filter((battle): battle is BattleSummary => battle !== null),
      syncedAt: syncedAt.toISOString(),
   };
}

/** `Mega Lightning Chest` → `mega-lightning`, `Gold Crate` → `gold-crate`, `King's Chest` → `kings`. */
export function chestSlug(name: string): string {
   return name
      .toLowerCase()
      .replace(/\s+chest$/, '')
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
}

export function toUpcomingChests(raw: RawUpcomingChests): UpcomingChest[] {
   return (raw.items ?? [])
      .toSorted((a, b) => a.index - b.index)
      .map((item) => ({
         chest: chestSlug(item.name),
         name: item.name,
         position: item.index === 0 ? 'Next' : `+${item.index}`,
      }));
}
