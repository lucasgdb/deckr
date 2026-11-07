/** The parts of the Clash Royale API responses Deckr reads. Everything else is ignored. */

export interface RawCard {
   id: number;
   name: string;
   level?: number;
   maxLevel?: number;
   count?: number;
   evolutionLevel?: number;
}

export interface RawPlayer {
   tag: string;
   name: string;
   expLevel?: number;
   trophies?: number;
   bestTrophies?: number;
   wins?: number;
   losses?: number;
   battleCount?: number;
   threeCrownWins?: number;
   role?: string;
   arena?: { id: number; name: string };
   clan?: { tag: string; name: string };
   cards?: RawCard[];
   currentDeck?: RawCard[];
   currentFavouriteCard?: RawCard;
}

export interface RawBattleSide {
   tag: string;
   name: string;
   crowns?: number;
   startingTrophies?: number;
   trophyChange?: number;
   clan?: { name: string };
   cards?: RawCard[];
}

export interface RawBattle {
   type?: string;
   battleTime: string;
   gameMode?: { name?: string };
   team: RawBattleSide[];
   opponent: RawBattleSide[];
}

export interface RawUpcomingChests {
   items?: { index: number; name: string }[];
}
