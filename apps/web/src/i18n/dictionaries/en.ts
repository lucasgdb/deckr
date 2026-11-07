import type { Dictionary } from './pt-br';

const plural = (count: number, one: string, other: string) => (count === 1 ? one : other);

const en: Dictionary = {
   meta: {
      siteName: 'Deckr',
      title: 'Clash Royale Deck Builder & Random Deck Generator · Deckr',
      appName: 'Deckr — Deck builder for Clash Royale',
      description:
         'Build or roll Clash Royale decks from the cards you own: meta-archetype rolls, average elixir, 4-card cycle and a link that opens the deck in game. Free.',
      pages: {
         builder: {
            title: 'Deck builder & generator',
            description:
               'Build or roll Clash Royale decks from the cards you own: meta-archetype rolls, average elixir, 4-card cycle and a link that opens the deck in game. Free.',
         },
         decks: {
            title: 'My decks',
            description: 'The decks you saved on Deckr, ready to copy, share or open in the game.',
         },
         cards: {
            title: 'All Clash Royale cards by arena',
            description:
               'Every Clash Royale card, grouped by the arena that unlocks it. Pick which ones the deck generator uses, or load your own collection.',
         },
         chests: {
            title: 'Upcoming chests',
            description: 'See any Clash Royale player’s chest cycle by their tag.',
         },
         profile: {
            title: 'Profile',
            description: 'Your Clash Royale profile: trophies, current deck, collection and recent battles.',
         },
      },
   },

   common: {
      skipToContent: 'Skip to content',
      cancel: 'Cancel',
      tryAgain: 'Try again',
      dismiss: 'Dismiss',
      showToken: 'Show token',
      hideToken: 'Hide token',
      of: 'of',
      copy: 'Copy',
      copyLink: 'Copy link',
      share: 'Share',
      openInGame: 'Open in game',
      logIn: 'Log in',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      elixirCost: 'Elixir cost',
      emptySlot: 'Empty slot',
      cards: 'Cards',
      name: (item) => item.name,
      cardTooltip: (name, elixir) => `${name} · ${elixir ?? '?'} elixir`,
      playerDataRefreshed: 'Player data refreshed',
      couldNotRefresh: (reason) => `Couldn’t refresh. ${reason}`,
      poolSetToCollection: (count) => `Card pool set to your ${count} cards`,
   },

   nav: {
      main: 'Main',
      builder: 'Builder',
      decks: 'My decks',
      cards: 'Cards',
      chests: 'Chests',
      profile: 'Profile',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      language: 'Language',
      changeLanguage: (current) => `${current}: change language`,
   },

   account: {
      label: (name) => `Account: ${name}`,
      profile: 'Profile',
      refresh: 'Refresh data',
      logOut: 'Log out',
      loggedOut: 'Logged out',
   },

   footer: {
      tagline: 'Deckr — deck builder for Clash Royale',
      madeBy: 'Made by Lucas Bittencourt',
      about: 'Deckr is a free, open-source fan project. Card names and arenas follow the game; player data comes from the official Clash Royale API.',
      sourceCode: 'Code on GitHub',
      reportIssue: 'Report a problem',
      privacy: 'Privacy policy',
      privacyUrl: 'https://lucasbittencourt.dev/tool/deckr/privacy',
      opensInNewTab: '(opens lucasbittencourt.dev in a new tab)',
      disclaimer:
         'This material is unofficial and is not endorsed by Supercell. For more information see Supercell’s Fan Content Policy:',
      fanContentPolicy: 'supercell.com/fan-content-policy',
   },

   faq: {
      title: 'Frequently asked questions',
      items: [
         {
            question: 'What is Deckr?',
            answer:
               'Deckr is a free deck builder for Clash Royale. It rolls 8-card decks from the cards you choose, shows the average elixir cost and the 4-card cycle, and opens the deck straight in the game.',
         },
         {
            question: 'How does smart roll work?',
            answer:
               'Instead of any 8 cards, smart roll picks a meta archetype (such as Hog Cycle, Log Bait, Golem Beatdown or LavaLoon) and fills each role with cards from your pool: win condition, support, defense, air control, a small spell, a bigger one and cycle cards. The deck plays like a real deck, and Deckr shows what each card is there for.',
         },
         {
            question: 'Can I roll only from the cards I own?',
            answer:
               'Yes. On the Cards page, pick the arena you’ve reached or switch cards in and out of the pool one by one. Logged in, “Use my collection” puts exactly the cards you’ve unlocked in the pool. Both random and smart rolls only use the pool.',
         },
         {
            question: 'How do I paste another player’s deck?',
            answer:
               'In Clash Royale, share the deck and copy the link (it has ?deck= followed by eight numbers). In Deckr, use “Paste” and paste the link: the deck shows up in the builder, ready to swap cards, save or open in the game.',
         },
         {
            question: 'How do I open a Deckr deck in Clash Royale?',
            answer:
               'Fill all 8 slots and use “Open in game”. On a phone the deck opens in the Clash Royale app; on a computer, the official link (link.clashroyale.com) offers to open the game. You can also copy the link and send it to someone.',
         },
         {
            question: 'What is a deck’s average elixir?',
            answer:
               'It’s the average elixir cost of the deck’s cards. Around 3 is a fast, cheap deck to play; 4 and above is heavier and slower. Mirror is left out because its cost depends on the card it copies.',
         },
         {
            question: 'What is the 4-card cycle?',
            answer:
               'It’s the total elixir of the deck’s four cheapest cards. You hold four cards at a time, so it’s the least you spend to cycle back to any card, such as your win condition. Lower cycles faster.',
         },
         {
            question: 'Do I need to log in?',
            answer:
               'No. Building, rolling and saving decks works without an account, and decks stay in this browser. Logging in with your player tag and a Clash Royale API key shows your profile, collection and battles, lets you roll only from cards you’ve unlocked, and saves decks to your account.',
         },
         {
            question: 'Is Deckr an official Clash Royale site?',
            answer:
               'No. Deckr is a fan project by Lucas Bittencourt, not affiliated with Supercell. Player data comes from the official Clash Royale API.',
         },
      ],
   },

   guide: {
      title: 'How to build a good Clash Royale deck',
      intro: 'A deck has 8 cards, and the ones that work tend to follow the same recipe. Deckr’s smart roll follows it; to build yours by hand, check each point:',
      steps: [
         {
            title: 'One win condition',
            body: 'The card that takes towers, such as Hog Rider, Giant, Golem, Balloon or X-Bow. Pick one (or two that work together, like Lava Hound and Balloon) and build the rest of the deck to get it to the tower.',
         },
         {
            title: 'Two spells',
            body: 'A small one, like Zap, The Log or Arrows, for swarms like Skeleton Army and Goblin Gang; and a bigger one, like Fireball, Poison or Rocket, for support troops and to finish a tower.',
         },
         {
            title: 'Defense and air control',
            body: 'A building or troop that stops tanks, such as Cannon, Inferno Tower or Mini P.E.K.K.A, and at least two cards that hit air troops, such as Musketeer, Electro Wizard or Bats.',
         },
         {
            title: 'Average elixir between 3 and 4',
            body: 'Cycle decks like Hog Cycle sit near 3 and get back to their win condition fast; heavy decks like Golem Beatdown go above 4 and bet on one big push. The builder shows the average elixir and the 4-card cycle as you pick.',
         },
      ],
      pool: {
         before: 'Only use the cards you have: on the ',
         link: 'Cards',
         after: ' page, pick the arena you’ve reached or load your collection, and rolls will only use those cards.',
      },
   },

   deck: {
      empty: 'Empty deck',
      describe: (names) => {
         if (names.length <= 2) return names.join(' and ');
         return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
      },
      linkCopied: 'Deck link copied',
      copyFailed: 'Couldn’t copy the link. Select it and copy it by hand.',
      shareTitle: 'Clash Royale deck',
      shareText: (deck) => `${deck}, built with Deckr`,
      shareFailed: 'Couldn’t open the share sheet. Copy the link instead.',
   },

   builder: {
      title: 'Clash Royale deck builder',
      summaryFew: (owned, total) => `Only ${owned} of ${total} cards are in your pool, so rolls leave slots empty.`,
      summary: (owned, total) => `Rolls draw from the ${owned} of ${total} cards in your pool.`,
      roll: 'Roll a deck',
      rollOthers: (count) => `Roll the other ${count}`,
      ready: 'Deck ready: copy the link, open it in Clash Royale or save it.',
      start: 'Roll a random deck, use smart roll for a meta deck, pick cards one by one, or paste a link.',
      slotsLeft: (count) =>
         `Clash Royale only takes full decks: ${count} ${plural(count, 'slot', 'slots')} still empty.`,
      yourDeck: 'Your deck',
      cardCount: 'Cards',
      avgElixir: 'Avg elixir',
      cycle: '4-card cycle',
      statsHelpTitle: 'Reading these numbers',
      statsHelpLabel: 'What average elixir and 4-card cycle mean',
      avgElixirHelp:
         'The average cost of the deck’s cards. Around 3 is fast and cheap to play; 4 and above is heavier and slower. Mirror is left out because its cost depends on the card it copies.',
      cycleHelp:
         'The elixir of the four cheapest cards. You hold four cards at a time, so this is the least you spend to cycle back to any card, such as your win condition. Lower cycles faster.',
      myDeck: 'My deck',
      myDeckLabel: 'Load the deck you’re using in Clash Royale',
      paste: 'Paste',
      pasteLabel: 'Paste a deck link',
      undo: 'Undo',
      clear: 'Clear',
      share: 'Share',
      deckLink: 'Deck link',
      linkPlaceholder: 'Fill all 8 slots to get a link',
      save: 'Save deck',
      saving: 'Saving…',
      savedToAccount: 'Deck saved to your account',
      savedInBrowser: 'Deck saved in this browser',
      viewMyDecks: 'View my decks',
      saveFailed: (reason) => `Couldn’t save the deck. ${reason}`,
      pool: 'Card pool',
      poolMeter: 'Cards in your pool',
      editPool: 'Edit card pool',
      loadedFromLink: 'Deck loaded from link',
      pasteTitle: 'Paste a deck link',
      pasteDescription: 'Use the link Clash Royale gives you when you share a deck.',
      pasteHint: 'It holds ?deck= followed by eight card ids.',
      pasteInvalid: 'That link has no 8-card deck in it.',
      loadDeck: 'Load deck',
   },

   smart: {
      roll: 'Smart roll',
      rollHint: 'Rolls a deck with a plan: win condition, support, defense, spells and cycle from a meta archetype.',
      fallback: 'Your pool doesn’t have the cards for a deck with a plan, so this is a regular roll.',
      rolled: (archetype) => `${archetype} deck rolled`,
      title: 'How the deck plays',
      archetype: (name, average) => `${name} · ${average} average elixir`,
      roles: {
         win: { label: 'Win condition', hint: 'What takes towers, and what clears the way for it.' },
         bait: { label: 'Bait', hint: 'They all ask for the same spell: the opponent can’t answer every one.' },
         support: { label: 'Support', hint: 'Back the push and hold the counterattack.' },
         defense: { label: 'Defense', hint: 'Stop tanks and bridge pushes.' },
         air: { label: 'Air control', hint: 'Answer air troops and swarms.' },
         spells: { label: 'Spells', hint: 'A small one for swarms, a bigger one for troops and towers.' },
         cycle: { label: 'Cycle', hint: 'Cheap, to get back to the win condition fast.' },
         locked: { label: 'Your locked cards', hint: 'Kept where they were.' },
      },
   },

   hand: {
      label: 'Cards in your deck',
      addCard: 'Add card',
      changeCard: 'Change card',
      unlock: 'Unlock',
      lock: 'Lock when rolling',
      moveLeft: 'Move left',
      moveRight: 'Move right',
      remove: 'Remove',
      emptySlot: (position) => `Add card to slot ${position}, empty`,
      filledSlot: (position, name, locked) => `Slot ${position}: ${name}${locked ? ', locked' : ''}. Change card`,
      actionsFor: (name) => `Actions for ${name}`,
   },

   picker: {
      addTitle: (slot) => `Add a card to slot ${slot}`,
      replaceTitle: (name) => `Replace ${name}`,
      search: 'Search cards',
      show: 'Show',
      allCards: 'All cards',
      myPool: 'My card pool',
      myCollection: 'My collection',
      cost: 'Cost',
      anyElixir: 'Any elixir',
      elixir: (cost) => `${cost} elixir`,
      arena: 'Arena',
      anyArena: 'Any arena',
      count: (count) => `${count} ${plural(count, 'card', 'cards')}`,
      noResults: 'No cards match these filters.',
      cardLabel: (name, elixir, inDeck) =>
         `${name}, ${elixir ?? 'variable'} elixir${inDeck ? ', already in the deck: swaps places' : ''}`,
      inSlot: 'In slot',
      inDeck: 'In deck',
      removeFromDeck: 'Remove from deck',
   },

   arenas: {
      label: (level, name) => (level === 0 ? name : `Arena ${level} · ${name}`),
      level: (level) => `Arena ${level}`,
      starting: 'Starting arena',
   },

   pool: {
      title: 'Clash Royale cards',
      summary: { between: ' of ', after: ' cards are in your pool. Deck rolls only use these.' },
      useCollection: 'Use my collection',
      upTo: 'Unlocked up to',
      allArenas: 'All arenas',
      ownPick: 'Your own pick',
      everyArena: 'Every arena',
      trainingOnly: 'Training Camp only',
      upToArena: (level, name) => `Up to arena ${level}, ${name}`,
      inPool: (count, total) => ` · ${count} of ${total} in pool`,
      upToHere: 'Use up to here',
      upToHereLabel: (arena) => `Use up to here: every card up to ${arena}`,
      noCards: 'No new cards unlock in this arena.',
      level: (level) => `Level ${level}`,
      cardLevel: (name, level) => `${name}, level ${level}`,
      locked: 'Not unlocked',
   },

   saved: {
      title: 'My decks',
      fallbackSummary: 'Decks you saved from the builder.',
      none: (account) => `No decks saved ${account ? 'in your account' : 'in this browser'} yet.`,
      count: (count, account) =>
         `${count} ${plural(count, 'deck', 'decks')} ${account ? 'in your account' : 'in this browser'}, newest first.`,
      build: 'Build a deck',
      loading: 'Loading saved decks',
      loadFailed: (reason) => `Couldn’t load your saved decks. ${reason}`,
      empty: 'Decks you save in the builder show up here, ready to copy or open in the game.',
      removed: 'Deck removed',
      removeFailed: (reason) => `Couldn’t remove the deck. ${reason}`,
      confirmTitle: 'Remove this deck?',
      confirmDescription: (deck) => `${deck} will be removed from your saved decks. This can’t be undone.`,
      keep: 'Keep it',
      remove: 'Remove deck',
      savedAgo: (ago) => `Saved ${ago}`,
      incomplete: 'has empty slots, so it can’t be shared',
      moreActions: 'More actions',
      moreActionsFor: (deck) => `More actions for ${deck}`,
      cardsIn: (deck) => `Cards in ${deck}`,
   },

   chests: {
      title: 'Upcoming chests',
      summary: 'The chest cycle of any player, looked up by their tag.',
      lookUpLabel: 'Look up a player',
      tag: 'Player tag',
      ownOnlyHint: 'You logged in with the in-game token, so you can see your own chests only.',
      tagHint: 'Letters and digits, as shown under the name on the player’s profile.',
      tagInvalid: 'Enter a player tag of at least 3 letters or digits.',
      lookUp: 'Look up chests',
      lookingUp: 'Looking up…',
      cycle: 'Chest cycle',
      cycleFor: 'Chest cycle for',
      loginFirst: 'Chest lookups go through the Clash Royale API, so log in with your API token first.',
      enterTag: 'Enter a player tag to see their next chests.',
      none: (tag) => `No upcoming chests were reported for #${tag}.`,
      loadFailed: (tag, reason) => `Couldn’t load chests for #${tag}. ${reason}`,
      loading: 'Loading chests',
      next: 'Next',
   },

   profile: {
      title: 'Profile',
      anonymousSummary: 'Your Clash Royale profile, cards and recent battles.',
      anonymous: 'Log in with your player tag and API token to see your profile here.',
      loading: 'Loading profile…',
      kingLevel: (level) => `King level ${level}`,
      updated: (ago) => `Updated ${ago}`,
      stats: 'Player stats',
      trophies: 'Trophies',
      noArena: 'No arena yet',
      atBest: 'at your best',
      best: (value) => `best ${value}`,
      winRate: 'Win rate',
      winsLosses: (wins, losses) => `${wins} wins · ${losses} losses`,
      threeCrowns: 'Three-crown wins',
      ofWins: (percent) => `${percent} of wins`,
      battles: 'Battles',
      editInBuilder: 'Edit in builder',
      editLabel: (deck) => `Edit ${deck} in the builder`,
      currentDeck: 'Current deck',
      currentDeckDescription: 'The deck selected in the game',
      currentDeckCards: 'Cards in your current deck',
      yourCurrentDeck: 'your current deck',
      collection: 'Collection',
      maxed: (count) => `${count} at max level`,
      unknownCards: (count) => `${count} newer ${plural(count, 'card', 'cards')} not shown`,
      unlocked: 'Cards unlocked',
      useAsPool: 'Use as card pool',
      recentBattles: 'Recent battles',
      noBattles: 'None yet',
      wonOf: (wins, total) => `${wins} won of the last ${total}`,
      battlesEmpty: 'Battles you play show up here after the next refresh.',
      showAll: (count) => (count === undefined ? 'Show all' : `Show all ${count}`),
      showFewer: 'Show fewer',
      win: 'Win',
      loss: 'Loss',
      draw: 'Draw',
      versus: 'vs',
      trophyChange: (change) => `${change} trophies`,
      opponentDeck: 'Opponent’s deck',
      opponentDeckOf: (name) => `${name}’s deck`,
      tryDeck: 'Try this deck',
      copyLabel: (deck) => `Copy ${deck}`,
   },

   compare: {
      open: 'Compare',
      title: 'Compare profiles',
      description: 'You against another player: trophies, wins, collection and current deck.',
      tag: 'Other player’s tag',
      tagHint: 'The code under the name, on the player’s in-game profile.',
      tagInvalid: 'Enter a tag with at least 3 letters or numbers.',
      self: 'That’s your tag. Enter another player’s.',
      submit: 'Compare',
      loading: 'Looking up…',
      loadingLabel: 'Looking up the player',
      recent: 'Recent opponents',
      recentLabel: (name, tag) => `Compare with ${name}, #${tag}`,
      empty: 'Enter a player’s tag or pick a recent opponent to see who comes out ahead on each figure.',
      you: 'You',
      versus: 'vs',
      noClan: 'No clan',
      summary: (you, them, name) =>
         you === them
            ? `Even: ${you} each`
            : you > them
              ? `You lead ${you} of ${you + them}`
              : `${name} leads ${them} of ${you + them}`,
      stats: 'Side by side',
      metrics: {
         trophies: 'Trophies',
         bestTrophies: 'Best trophies',
         kingLevel: 'King Level',
         winRate: 'Win rate',
         wins: 'Wins',
         threeCrownWins: 'Three-crown wins',
         battles: 'Battles',
         cardsUnlocked: 'Cards unlocked',
         cardsMaxed: 'Cards at max level',
         averageLevel: 'Average card level',
      },
      row: (metric, you, them, name, leader) =>
         `${metric}: you ${you}, ${name} ${them}${leader === 'you' ? '. You lead' : leader === 'them' ? `. ${name} leads` : leader === 'tie' ? '. Tied' : ''}.`,
      decks: 'Current decks',
      yourDeck: 'Your deck',
      theirDeck: (name) => `${name}’s deck`,
      elixir: (value) => `${value} average elixir`,
      tryDeck: 'Try this deck',
      cards: 'Collection',
      onlyYou: 'Only you have',
      shared: 'In common',
      onlyThem: (name) => `Only ${name} has`,
      cardsUnit: (count) => plural(count, 'card', 'cards'),
   },

   login: {
      title: 'Log in with Clash Royale',
      description: 'Deckr reads your profile, cards, current deck and battles through the official Clash Royale API.',
      tag: 'Player tag',
      tagHint: 'The code under your name on your in-game profile.',
      tagInvalid: 'Enter your player tag, like C8Q2QR08.',
      how: 'How to log in',
      gameToken: 'In-game token',
      apiKey: 'Your API key',
      tokenLabel: 'API token',
      tokenHint: 'Proves the account is yours. It isn’t stored, and you’ll only see your own data.',
      tokenPlaceholder: 'From Settings → API Token',
      tokenShort: 'That doesn’t look like the in-game API token.',
      keyLabel: 'API key',
      keyHint: 'Stored encrypted, and only used to read player data for you.',
      keyShort: 'That doesn’t look like an API key.',
      noSpaces: 'It can’t have spaces.',
      gameTokenUnavailable:
         'The in-game token can’t be used here yet: Clash Royale only lets partner sites verify it. Log in with your own API key.',
      checking: 'Checking…',
      submit: 'Log in',
      loggedIn: (name) => `Logged in as ${name}`,
      gameTokenHelpLabel: 'Where to find the in-game API token',
      gameTokenHelpTitle: 'Find your API token in the game',
      gameTokenSteps: {
         open: 'Open Clash Royale.',
         settingsBefore: 'Tap the menu at the top right and open ',
         settings: 'Settings',
         settingsAfter: '.',
         tokenBefore: 'Tap ',
         token: 'API Token',
         tokenAfter: ' and copy the code it shows.',
         paste: 'Paste it here. If it’s refused, copy a fresh one from the same place.',
      },
      apiKeyHelpLabel: 'How to create an API key',
      apiKeyHelpTitle: 'Create an API key',
      apiKeySteps: {
         openBefore: 'Open ',
         openAfter: ' and log in, or create a free account.',
         accountBefore: 'Open your name at the top right, choose ',
         account: 'My Account',
         accountMiddle: ', then ',
         create: 'Create New Key',
         accountAfter: '.',
         name: 'Give the key any name and description, such as “Deckr”.',
         ipBefore: 'Under ',
         ip: 'Allowed IP addresses',
         ipAfter: ', add the address Deckr reaches Clash Royale from:',
         finding: 'Finding it…',
         unavailable: 'Unavailable',
         copyIp: 'Copy IP address',
         copied: 'IP address copied',
         finish: 'Create the key, open it, and copy the long token into this field.',
      },
   },

   share: {
      label: 'Share',
   },

   pwa: {
      screenshots: {
         builder: 'Smart roll: a meta deck, with what each group of cards is for',
         cards: 'Choose which cards rolls use, arena by arena',
         profile: 'Your profile: trophies, current deck, collection and recent battles',
         wide: 'The deck builder on a computer',
      },
      install: 'Install the app',
      installed: 'App installed',
      iosTitle: 'Install Deckr on your iPhone or iPad',
      iosSteps: {
         share: 'Tap Share, in Safari’s toolbar.',
         add: 'Choose “Add to Home Screen”.',
         confirm: 'Tap Add: Deckr opens like an app, full screen.',
      },
      offline: 'You’re offline. Pages you’ve already opened are still available.',
   },

   keyIssue: {
      banner: (ip) =>
         ip
            ? `Clash Royale rejected your API key: Deckr now reaches the game from ${ip}, which the key doesn't allow.`
            : 'Clash Royale rejected your API key: the address Deckr reaches the game from changed.',
      fix: 'Update key',
      title: 'Update your API key',
      description:
         'The IP address Deckr reaches Clash Royale from can change from time to time. Create a new key that allows the current address and paste it here: your data and decks stay in your account.',
      inlineHint: 'Create a new key that allows this address:',
      field: 'New API key',
      save: 'Save key',
      saving: 'Saving…',
      saved: 'Key updated',
      later: 'Not now',
   },

   notFound: {
      title: 'Page not found',
      body: 'There’s nothing at this address.',
      home: 'Go to the deck builder',
   },

   errors: {
      network: 'Couldn’t reach the Deckr server.',
      status: (status) => `The server answered with status ${status}.`,
      generic: 'Something went wrong.',
      api: {
         internal: () => 'Something went wrong.',
         not_found: () => 'Not found.',
         invalid_login: () => 'Enter a player tag and an API token.',
         invalid_tag: () => 'Invalid player tag.',
         login_required: () => 'Log in with your player tag and API token first.',
         session_expired: () => 'Your player isn’t connected anymore. Log in again.',
         api_key_missing: () => 'Your saved API key is missing. Log in again.',
         own_chests_only: () => 'With the in-game token you can only see your own chests.',
         own_profile_only: () =>
            'With the in-game token you can only see your own profile. Log in with your API key to compare.',
         invalid_deck: () => 'A deck needs exactly 8 known cards.',
         deck_limit: (params) => `You can keep up to ${params.max ?? 200} decks. Remove one to save another.`,
         deck_not_saved: () => 'The deck wasn’t saved.',
         invalid_sync: () => 'Couldn’t read the decks to sync.',
         game_token_unavailable: () =>
            'Logging in with the in-game token isn’t available: Clash Royale only grants that permission to partner sites. Log in with your own API key instead.',
         game_token_invalid: () =>
            'That token isn’t valid for this player. In Clash Royale, open Settings → API Token and copy a fresh one.',
         cr_unreachable: () => 'Clash Royale didn’t answer. Try again in a moment.',
         cr_bad_request: () => 'Clash Royale rejected the request. Check the player tag.',
         cr_key_rejected: (params) =>
            `Clash Royale rejected the API token. Make sure it’s copied in full and that the key allows the IP address ${params.ip ?? 'of this server'}.`,
         cr_server_key_rejected: () =>
            'Deckr can’t reach Clash Royale right now. Try again later or log in with your own API key.',
         cr_player_not_found: () => 'No player found with that tag.',
         cr_rate_limited: () => 'Clash Royale is limiting requests for this token. Try again in a minute.',
         cr_maintenance: () => 'Clash Royale is under maintenance. Try again later.',
         cr_error: (params) => `Clash Royale answered with status ${params.status ?? '?'}.`,
      },
   },
};

export default en;
