import type { ApiErrorCode, ApiErrorParams } from '@deckr/shared';

/*
 * Portuguese is Deckr's default language and the source of the `Dictionary` type: every other language has the
 * same keys. Plain strings for fixed copy; functions where a value or a plural goes in.
 */

const plural = (count: number, one: string, other: string) => (count === 1 ? one : other);

const ptBr = {
   meta: {
      siteName: 'Deckr',
      /** The home page's `<title>`: what people search for first, the brand last. */
      title: 'Montador de deck Clash Royale e gerador aleatório · Deckr',
      /** The installed app's name. */
      appName: 'Deckr — Montador de decks para Clash Royale',
      description:
         'Monte ou sorteie decks de Clash Royale com as suas cartas: sorteio por arquétipo do meta, elixir médio, ciclo de 4 cartas e link para abrir no jogo. Grátis.',
      pages: {
         builder: {
            title: 'Montador e gerador de decks',
            description:
               'Monte ou sorteie decks de Clash Royale com as suas cartas: sorteio por arquétipo do meta, elixir médio, ciclo de 4 cartas e link para abrir no jogo. Grátis.',
         },
         decks: {
            title: 'Meus decks',
            description: 'Os decks que você salvou no Deckr, prontos para copiar, compartilhar ou abrir no jogo.',
         },
         cards: {
            title: 'Cartas do Clash Royale por arena',
            description:
               'Todas as cartas do Clash Royale com os nomes do jogo, organizadas pela arena que libera cada uma. Escolha quais entram no gerador de decks ou use a sua coleção.',
         },
         chests: {
            title: 'Próximos baús',
            description: 'Veja o ciclo de baús de qualquer jogador de Clash Royale pela tag.',
         },
         profile: {
            title: 'Perfil',
            description: 'Seu perfil de Clash Royale: troféus, deck atual, coleção e batalhas recentes.',
         },
      },
   },

   common: {
      skipToContent: 'Pular para o conteúdo',
      cancel: 'Cancelar',
      tryAgain: 'Tentar de novo',
      dismiss: 'Fechar',
      showToken: 'Mostrar token',
      hideToken: 'Ocultar token',
      of: 'de',
      copy: 'Copiar',
      copyLink: 'Copiar link',
      share: 'Compartilhar',
      openInGame: 'Abrir no jogo',
      logIn: 'Entrar',
      refresh: 'Atualizar',
      refreshing: 'Atualizando…',
      elixirCost: 'Custo de elixir',
      emptySlot: 'Espaço vazio',
      cards: 'Cartas',
      /** A card's or arena's name as the game shows it in Portuguese (English when no translation is known yet). */
      name: (item: { name: string; namePtBr?: string }) => item.namePtBr ?? item.name,
      cardTooltip: (name: string, elixir: number | null) => `${name} · ${elixir ?? '?'} de elixir`,
      playerDataRefreshed: 'Dados do jogador atualizados',
      couldNotRefresh: (reason: string) => `Não foi possível atualizar. ${reason}`,
      poolSetToCollection: (count: number) => `Pool de cartas definido com as suas ${count} cartas`,
   },

   nav: {
      main: 'Principal',
      builder: 'Montar',
      decks: 'Meus decks',
      cards: 'Cartas',
      chests: 'Baús',
      profile: 'Perfil',
      openMenu: 'Abrir menu',
      closeMenu: 'Fechar menu',
      language: 'Idioma',
      changeLanguage: (current: string) => `${current}: mudar idioma`,
   },

   account: {
      label: (name: string) => `Conta: ${name}`,
      profile: 'Perfil',
      refresh: 'Atualizar dados',
      logOut: 'Sair',
      loggedOut: 'Você saiu da conta',
   },

   footer: {
      tagline: 'Deckr — montador de decks para Clash Royale',
      madeBy: 'Feito por Lucas Bittencourt',
      about: 'O Deckr é um projeto de fã, gratuito e de código aberto. Os nomes e as arenas das cartas seguem o jogo; os dados de jogador vêm da API oficial do Clash Royale.',
      sourceCode: 'Código no GitHub',
      reportIssue: 'Reportar um problema',
      privacy: 'Política de privacidade',
      privacyUrl: 'https://lucasbittencourt.dev/pt-br/tool/deckr/privacy',
      opensInNewTab: '(abre lucasbittencourt.dev em uma nova aba)',
      /** Required by Supercell's Fan Content Policy. */
      disclaimer:
         'Este material não é oficial e não é endossado pela Supercell. Para mais informações, veja a Política de Conteúdo de Fãs da Supercell:',
      fanContentPolicy: 'supercell.com/fan-content-policy',
   },

   /** Questions people ask about Deckr, answered on the builder page. */
   faq: {
      title: 'Perguntas frequentes',
      items: [
         {
            question: 'O que é o Deckr?',
            answer:
               'O Deckr é um montador de decks gratuito para Clash Royale. Ele sorteia decks de 8 cartas a partir das cartas que você escolher, mostra o custo médio de elixir e o ciclo de 4 cartas, e abre o deck direto no jogo.',
         },
         {
            question: 'Como funciona o sorteio inteligente?',
            answer:
               'Em vez de 8 cartas quaisquer, o sorteio inteligente escolhe um arquétipo do meta (como Hog Cycle, Log Bait, Golem Beatdown ou LavaLoon) e preenche cada função com cartas do seu pool: condição de vitória, apoio, defesa, controle aéreo, um feitiço pequeno, um maior e cartas de ciclo. O deck sai com cara de deck de verdade, e o Deckr mostra o papel de cada carta.',
         },
         {
            question: 'Dá para sortear só com as cartas que eu tenho?',
            answer:
               'Sim. Na página Cartas, escolha até qual arena você chegou ou marque carta por carta o que entra no pool. Entrando com a sua conta, “Usar minha coleção” coloca no pool exatamente as cartas que você já liberou. Os sorteios, normais e inteligentes, só usam o pool.',
         },
         {
            question: 'Como colar o deck de outro jogador?',
            answer:
               'No Clash Royale, compartilhe o deck e copie o link (ele tem ?deck= seguido de oito números). No Deckr, use “Colar” e cole o link: o deck aparece no montador, pronto para trocar cartas, salvar ou abrir no jogo.',
         },
         {
            question: 'Como abrir um deck do Deckr no Clash Royale?',
            answer:
               'Preencha os 8 espaços e use “Abrir no jogo”. No celular, o deck abre no app do Clash Royale; no computador, o link oficial (link.clashroyale.com) oferece abrir o jogo. Você também pode copiar o link e mandar para alguém.',
         },
         {
            question: 'O que é o elixir médio de um deck?',
            answer:
               'É a média do custo de elixir das cartas do deck. Perto de 3 é um deck rápido e barato de jogar; 4 ou mais é mais pesado e lento. O Espelho fica de fora, porque o custo dele depende da carta que copia.',
         },
         {
            question: 'O que é o ciclo de 4 cartas?',
            answer:
               'É a soma do elixir das quatro cartas mais baratas do deck. Como você tem quatro cartas na mão, esse é o mínimo que gasta para voltar a qualquer carta, como a sua condição de vitória. Quanto menor, mais rápido o ciclo.',
         },
         {
            question: 'Preciso entrar com a minha conta?',
            answer:
               'Não. Montar, sortear e salvar decks funciona sem conta, e os decks ficam neste navegador. Entrando com a sua tag de jogador e uma chave da API do Clash Royale, você vê seu perfil, coleção e batalhas, pode sortear só com as cartas que já liberou, e os decks salvos vão para a sua conta.',
         },
         {
            question: 'O Deckr é um site oficial do Clash Royale?',
            answer:
               'Não. O Deckr é um projeto de fã, feito por Lucas Bittencourt, sem ligação com a Supercell. Os dados do jogador vêm da API oficial do Clash Royale.',
         },
      ],
   },

   /** How to build a deck, on the builder page under the tool: plain text for players and search engines. */
   guide: {
      title: 'Como montar um bom deck no Clash Royale',
      intro: 'Um deck tem 8 cartas, e os que funcionam costumam seguir a mesma receita. O sorteio inteligente do Deckr usa essa receita; para montar o seu à mão, confira cada ponto:',
      steps: [
         {
            title: 'Uma condição de vitória',
            body: 'É a carta que derruba torres, como Corredor, Gigante, Golem, Balão ou X-Besta. Escolha uma (ou duas que combinam, como Lava Hound e Balão) e monte o resto do deck para levá-la até a torre.',
         },
         {
            title: 'Dois feitiços',
            body: 'Um pequeno, como Zap, O Tronco ou Flechas, para enxames como Exército de Esqueletos e Gangue de Goblins; e um maior, como Bola de Fogo, Veneno ou Foguete, para tropas de apoio e para fechar a partida na torre.',
         },
         {
            title: 'Defesa e controle aéreo',
            body: 'Uma construção ou tropa que segura tanques, como Canhão, Torre Inferno ou Mini P.E.K.K.A, e pelo menos duas cartas que acertam tropas aéreas, como Mosqueteira, Mago Elétrico ou Morcegos.',
         },
         {
            title: 'Elixir médio entre 3 e 4',
            body: 'Decks de ciclo, como Hog Cycle, ficam perto de 3 e voltam rápido à condição de vitória; decks pesados, como Golem Beatdown, passam de 4 e apostam em um grande ataque. O montador mostra o elixir médio e o ciclo de 4 cartas enquanto você escolhe.',
         },
      ],
      pool: {
         before: 'Use só as cartas que você tem: na página ',
         link: 'Cartas',
         after: ', escolha até qual arena você chegou ou carregue a sua coleção, e os sorteios passam a usar só essas cartas.',
      },
   },

   deck: {
      empty: 'Deck vazio',
      /** "Corredor, Mosqueteira e mais 6" — how a deck is named in lists and dialogs. */
      describe: (names: string[]) => {
         if (names.length <= 2) return names.join(' e ');
         return `${names.slice(0, 2).join(', ')} e mais ${names.length - 2}`;
      },
      linkCopied: 'Link do deck copiado',
      copyFailed: 'Não foi possível copiar o link. Selecione e copie manualmente.',
      shareTitle: 'Deck de Clash Royale',
      shareText: (deck: string) => `${deck}, montado no Deckr`,
      shareFailed: 'Não foi possível abrir o compartilhamento. Copie o link.',
   },

   builder: {
      title: 'Montador de deck para Clash Royale',
      summaryFew: (owned: number, total: number) =>
         `Só ${owned} de ${total} cartas estão no seu pool, então os sorteios deixam espaços vazios.`,
      summary: (owned: number, total: number) => `Os sorteios usam as ${owned} de ${total} cartas do seu pool.`,
      roll: 'Sortear um deck',
      rollOthers: (count: number) => `Sortear as outras ${count}`,
      ready: 'Deck pronto: copie o link, abra no Clash Royale ou salve.',
      start: 'Sorteie um deck aleatório, use o sorteio inteligente para um deck do meta, escolha carta por carta ou cole um link.',
      slotsLeft: (count: number) =>
         `O Clash Royale só aceita decks completos: ${plural(count, 'falta 1 espaço', `faltam ${count} espaços`)}.`,
      yourDeck: 'Seu deck',
      cardCount: 'Cartas',
      avgElixir: 'Elixir médio',
      cycle: 'Ciclo de 4 cartas',
      statsHelpTitle: 'Entendendo esses números',
      statsHelpLabel: 'O que significam elixir médio e ciclo de 4 cartas',
      avgElixirHelp:
         'O custo médio das cartas do deck. Perto de 3 é rápido e barato de jogar; 4 ou mais é mais pesado e lento. O Espelho fica de fora, porque o custo dele depende da carta que copia.',
      cycleHelp:
         'O elixir das quatro cartas mais baratas. Você tem quatro cartas na mão por vez, então esse é o mínimo que gasta para voltar a qualquer carta, como a sua condição de vitória. Quanto menor, mais rápido o ciclo.',
      myDeck: 'Meu deck',
      myDeckLabel: 'Carregar o deck que você está usando no Clash Royale',
      paste: 'Colar',
      pasteLabel: 'Colar um link de deck',
      undo: 'Desfazer',
      clear: 'Limpar',
      share: 'Compartilhar',
      deckLink: 'Link do deck',
      linkPlaceholder: 'Preencha os 8 espaços para gerar o link',
      save: 'Salvar deck',
      saving: 'Salvando…',
      savedToAccount: 'Deck salvo na sua conta',
      savedInBrowser: 'Deck salvo neste navegador',
      viewMyDecks: 'Ver meus decks',
      saveFailed: (reason: string) => `Não foi possível salvar o deck. ${reason}`,
      pool: 'Pool de cartas',
      poolMeter: 'Cartas no seu pool',
      editPool: 'Editar pool de cartas',
      loadedFromLink: 'Deck carregado do link',
      pasteTitle: 'Colar um link de deck',
      pasteDescription: 'Use o link que o Clash Royale gera quando você compartilha um deck.',
      pasteHint: 'Ele tem ?deck= seguido de oito ids de cartas.',
      pasteInvalid: 'Esse link não tem um deck de 8 cartas.',
      loadDeck: 'Carregar deck',
   },

   smart: {
      roll: 'Sorteio inteligente',
      rollHint:
         'Sorteia um deck com lógica: condição de vitória, apoio, defesa, feitiços e ciclo de um arquétipo do meta.',
      fallback: 'Seu pool não tem cartas para um deck com lógica, então sorteamos um deck comum.',
      rolled: (archetype: string) => `Deck ${archetype} sorteado`,
      title: 'Como o deck joga',
      archetype: (name: string, average: string) => `${name} · ${average} de elixir médio`,
      roles: {
         win: { label: 'Condição de vitória', hint: 'O que derruba as torres, e quem abre caminho para ela.' },
         bait: { label: 'Isca', hint: 'Pedem o mesmo feitiço do adversário: ele não dá conta de todas.' },
         support: { label: 'Apoio', hint: 'Acompanham o ataque e seguram o contra-ataque.' },
         defense: { label: 'Defesa', hint: 'Seguram tanques e ataques na ponte.' },
         air: { label: 'Controle aéreo', hint: 'Respondem a tropas aéreas e enxames.' },
         spells: { label: 'Feitiços', hint: 'Um pequeno para enxames, um maior para tropas e torres.' },
         cycle: { label: 'Ciclo', hint: 'Baratas, para voltar rápido à condição de vitória.' },
         locked: { label: 'Suas cartas travadas', hint: 'Mantidas onde estavam.' },
      },
   },

   hand: {
      label: 'Cartas no seu deck',
      addCard: 'Adicionar carta',
      changeCard: 'Trocar carta',
      unlock: 'Destravar',
      lock: 'Travar ao sortear',
      moveLeft: 'Mover para a esquerda',
      moveRight: 'Mover para a direita',
      remove: 'Remover',
      emptySlot: (position: number) => `Adicionar carta no espaço ${position}, vazio`,
      filledSlot: (position: number, name: string, locked: boolean) =>
         `Espaço ${position}: ${name}${locked ? ', travada' : ''}. Trocar carta`,
      actionsFor: (name: string) => `Ações para ${name}`,
   },

   picker: {
      addTitle: (slot: number) => `Adicionar uma carta ao espaço ${slot}`,
      replaceTitle: (name: string) => `Substituir ${name}`,
      search: 'Buscar cartas',
      show: 'Mostrar',
      allCards: 'Todas as cartas',
      myPool: 'Meu pool de cartas',
      myCollection: 'Minha coleção',
      cost: 'Custo',
      anyElixir: 'Qualquer elixir',
      elixir: (cost: string) => `${cost} de elixir`,
      arena: 'Arena',
      anyArena: 'Qualquer arena',
      count: (count: number) => `${count} ${plural(count, 'carta', 'cartas')}`,
      noResults: 'Nenhuma carta com esses filtros.',
      cardLabel: (name: string, elixir: number | null, inDeck: boolean) =>
         `${name}, ${elixir ?? 'variável'} de elixir${inDeck ? ', já está no deck: troca de lugar' : ''}`,
      inSlot: 'No espaço',
      inDeck: 'No deck',
      removeFromDeck: 'Remover do deck',
   },

   arenas: {
      /** "Arena 5 · Spell Valley"; the training arena goes by its name alone. */
      label: (level: number, name: string) => (level === 0 ? name : `Arena ${level} · ${name}`),
      level: (level: number) => `Arena ${level}`,
      starting: 'Arena inicial',
   },

   pool: {
      title: 'Cartas do Clash Royale',
      /** "{owned} de {total} cartas…", with the two numbers styled by the page. */
      summary: { between: ' de ', after: ' cartas estão no seu pool. Os sorteios só usam essas.' },
      useCollection: 'Usar minha coleção',
      upTo: 'Liberadas até',
      allArenas: 'Todas as arenas',
      ownPick: 'Escolha sua',
      everyArena: 'Todas as arenas',
      trainingOnly: 'Só o Campo de Treinamento',
      upToArena: (level: number, name: string) => `Até a arena ${level}, ${name}`,
      inPool: (count: number, total: number) => ` · ${count} de ${total} no pool`,
      upToHere: 'Usar até aqui',
      upToHereLabel: (arena: string) => `Usar até aqui: todas as cartas até ${arena}`,
      noCards: 'Nenhuma carta nova é liberada nesta arena.',
      level: (level: number) => `Nível ${level}`,
      cardLevel: (name: string, level: number) => `${name}, nível ${level}`,
      locked: 'Não liberada',
   },

   saved: {
      title: 'Meus decks',
      fallbackSummary: 'Decks que você salvou no montador.',
      none: (account: boolean): string =>
         account ? 'Nenhum deck salvo na sua conta ainda.' : 'Nenhum deck salvo neste navegador ainda.',
      count: (count: number, account: boolean) =>
         `${count} ${plural(count, 'deck', 'decks')} ${account ? 'na sua conta' : 'neste navegador'}, do mais novo ao mais antigo.`,
      build: 'Montar um deck',
      loading: 'Carregando decks salvos',
      loadFailed: (reason: string) => `Não foi possível carregar seus decks salvos. ${reason}`,
      empty: 'Os decks que você salvar no montador aparecem aqui, prontos para copiar ou abrir no jogo.',
      removed: 'Deck removido',
      removeFailed: (reason: string) => `Não foi possível remover o deck. ${reason}`,
      confirmTitle: 'Remover este deck?',
      confirmDescription: (deck: string) => `${deck} será removido dos seus decks salvos. Não dá para desfazer.`,
      keep: 'Manter',
      remove: 'Remover deck',
      savedAgo: (ago: string) => `Salvo ${ago}`,
      incomplete: 'tem espaços vazios, então não pode ser compartilhado',
      moreActions: 'Mais ações',
      moreActionsFor: (deck: string) => `Mais ações para ${deck}`,
      cardsIn: (deck: string) => `Cartas de ${deck}`,
   },

   chests: {
      title: 'Próximos baús',
      summary: 'O ciclo de baús de qualquer jogador, pela tag.',
      lookUpLabel: 'Buscar um jogador',
      tag: 'Tag do jogador',
      ownOnlyHint: 'Você entrou com o token do jogo, então só pode ver os seus baús.',
      tagHint: 'Letras e números, como aparecem abaixo do nome no perfil do jogador.',
      tagInvalid: 'Digite uma tag com pelo menos 3 letras ou números.',
      lookUp: 'Buscar baús',
      lookingUp: 'Buscando…',
      cycle: 'Ciclo de baús',
      cycleFor: 'Ciclo de baús de',
      loginFirst: 'A busca de baús passa pela API do Clash Royale, então entre com o seu token antes.',
      enterTag: 'Digite uma tag para ver os próximos baús do jogador.',
      none: (tag: string) => `Nenhum próximo baú foi informado para #${tag}.`,
      loadFailed: (tag: string, reason: string) => `Não foi possível carregar os baús de #${tag}. ${reason}`,
      loading: 'Carregando baús',
      next: 'Próximo',
   },

   profile: {
      title: 'Perfil',
      anonymousSummary: 'Seu perfil de Clash Royale, cartas e batalhas recentes.',
      anonymous: 'Entre com a sua tag e o seu token da API para ver o seu perfil aqui.',
      loading: 'Carregando perfil…',
      kingLevel: (level: number) => `Nível do Rei ${level}`,
      updated: (ago: string) => `Atualizado ${ago}`,
      stats: 'Estatísticas do jogador',
      trophies: 'Troféus',
      noArena: 'Sem arena ainda',
      atBest: 'no seu recorde',
      best: (value: string) => `recorde ${value}`,
      winRate: 'Taxa de vitória',
      winsLosses: (wins: string, losses: string) => `${wins} vitórias · ${losses} derrotas`,
      threeCrowns: 'Vitórias de 3 coroas',
      ofWins: (percent: string) => `${percent} das vitórias`,
      battles: 'Batalhas',
      editInBuilder: 'Editar no montador',
      editLabel: (deck: string) => `Editar ${deck} no montador`,
      currentDeck: 'Deck atual',
      currentDeckDescription: 'O deck selecionado no jogo',
      currentDeckCards: 'Cartas do seu deck atual',
      yourCurrentDeck: 'seu deck atual',
      collection: 'Coleção',
      maxed: (count: number) => `${count} no nível máximo`,
      unknownCards: (count: number) =>
         `${count} ${plural(count, 'carta nova não aparece', 'cartas novas não aparecem')}`,
      unlocked: 'Cartas liberadas',
      useAsPool: 'Usar como pool de cartas',
      recentBattles: 'Batalhas recentes',
      noBattles: 'Nenhuma ainda',
      wonOf: (wins: number, total: number) => `${wins} ${plural(wins, 'vitória', 'vitórias')} nas últimas ${total}`,
      battlesEmpty: 'As batalhas que você jogar aparecem aqui depois da próxima atualização.',
      showAll: (count?: number) => (count === undefined ? 'Mostrar todas' : `Mostrar todas as ${count}`),
      showFewer: 'Mostrar menos',
      win: 'Vitória',
      loss: 'Derrota',
      draw: 'Empate',
      versus: 'vs',
      trophyChange: (change: string) => `${change} troféus`,
      opponentDeck: 'Deck do oponente',
      opponentDeckOf: (name: string) => `deck de ${name}`,
      tryDeck: 'Testar este deck',
      copyLabel: (deck: string) => `Copiar ${deck}`,
   },

   /** "Compare" on the profile: you against another player, figure by figure. */
   compare: {
      open: 'Comparar',
      title: 'Comparar perfis',
      description: 'Você contra outro jogador: troféus, vitórias, coleção e deck atual.',
      tag: 'Tag do outro jogador',
      tagHint: 'O código abaixo do nome, no perfil do jogador dentro do jogo.',
      tagInvalid: 'Digite uma tag com pelo menos 3 letras ou números.',
      self: 'Essa é a sua tag. Digite a de outro jogador.',
      submit: 'Comparar',
      loading: 'Buscando…',
      loadingLabel: 'Buscando o jogador',
      recent: 'Oponentes recentes',
      recentLabel: (name: string, tag: string) => `Comparar com ${name}, #${tag}`,
      empty: 'Digite a tag de um jogador ou escolha um oponente recente para ver quem leva a melhor em cada número.',
      you: 'Você',
      versus: 'vs',
      noClan: 'Sem clã',
      summary: (you: number, them: number, name: string) =>
         you === them
            ? `Empate: cada um lidera em ${you}`
            : you > them
              ? `Você lidera em ${you} de ${you + them}`
              : `${name} lidera em ${them} de ${you + them}`,
      stats: 'Números lado a lado',
      metrics: {
         trophies: 'Troféus',
         bestTrophies: 'Recorde de troféus',
         kingLevel: 'Nível do Rei',
         winRate: 'Taxa de vitória',
         wins: 'Vitórias',
         threeCrownWins: 'Vitórias de 3 coroas',
         battles: 'Batalhas',
         cardsUnlocked: 'Cartas liberadas',
         cardsMaxed: 'Cartas no nível máximo',
         averageLevel: 'Nível médio das cartas',
      },
      /** What a screen reader hears for one row. */
      row: (metric: string, you: string, them: string, name: string, leader: 'you' | 'them' | 'tie' | null) =>
         `${metric}: você ${you}, ${name} ${them}${leader === 'you' ? '. Você lidera' : leader === 'them' ? `. ${name} lidera` : leader === 'tie' ? '. Empate' : ''}.`,
      decks: 'Decks atuais',
      yourDeck: 'Seu deck',
      theirDeck: (name: string) => `Deck de ${name}`,
      elixir: (value: string) => `${value} de elixir médio`,
      tryDeck: 'Testar este deck',
      cards: 'Coleção',
      onlyYou: 'Só você tem',
      shared: 'Em comum',
      onlyThem: (name: string) => `Só ${name} tem`,
      cardsUnit: (count: number) => plural(count, 'carta', 'cartas'),
   },

   login: {
      title: 'Entrar com o Clash Royale',
      description: 'O Deckr lê seu perfil, cartas, deck atual e batalhas pela API oficial do Clash Royale.',
      tag: 'Tag do jogador',
      tagHint: 'O código abaixo do seu nome no perfil dentro do jogo.',
      tagInvalid: 'Digite sua tag de jogador, como C8Q2QR08.',
      how: 'Como entrar',
      gameToken: 'Token do jogo',
      apiKey: 'Sua chave da API',
      tokenLabel: 'Token da API',
      tokenHint: 'Prova que a conta é sua. Ele não é guardado, e você só vê os seus próprios dados.',
      tokenPlaceholder: 'Em Configurações → Token da API',
      tokenShort: 'Isso não parece o token da API do jogo.',
      keyLabel: 'Chave da API',
      keyHint: 'Guardada criptografada e usada só para ler os dados do jogador para você.',
      keyShort: 'Isso não parece uma chave da API.',
      noSpaces: 'Não pode ter espaços.',
      gameTokenUnavailable:
         'O token do jogo ainda não pode ser usado aqui: o Clash Royale só permite que sites parceiros o verifiquem. Entre com a sua própria chave da API.',
      checking: 'Verificando…',
      submit: 'Entrar',
      loggedIn: (name: string) => `Você entrou como ${name}`,
      gameTokenHelpLabel: 'Onde encontrar o token da API no jogo',
      gameTokenHelpTitle: 'Encontre o seu token da API no jogo',
      gameTokenSteps: {
         open: 'Abra o Clash Royale.',
         settingsBefore: 'Toque no menu no canto superior direito e abra ',
         settings: 'Configurações',
         settingsAfter: '.',
         tokenBefore: 'Toque em ',
         token: 'Token da API',
         tokenAfter: ' e copie o código que aparece.',
         paste: 'Cole aqui. Se for recusado, copie um novo no mesmo lugar.',
      },
      apiKeyHelpLabel: 'Como criar uma chave da API',
      apiKeyHelpTitle: 'Crie uma chave da API',
      apiKeySteps: {
         openBefore: 'Abra ',
         openAfter: ' e entre, ou crie uma conta gratuita.',
         accountBefore: 'Clique no seu nome no canto superior direito, escolha ',
         account: 'My Account',
         accountMiddle: ' e depois ',
         create: 'Create New Key',
         accountAfter: '.',
         name: 'Dê qualquer nome e descrição à chave, como “Deckr”.',
         ipBefore: 'Em ',
         ip: 'Allowed IP addresses',
         ipAfter: ', adicione o endereço de onde o Deckr acessa o Clash Royale:',
         finding: 'Buscando…',
         unavailable: 'Indisponível',
         copyIp: 'Copiar endereço IP',
         copied: 'Endereço IP copiado',
         finish: 'Crie a chave, abra-a e copie o token longo para este campo.',
      },
   },

   share: {
      label: 'Compartilhar',
   },

   /** The installable app (PWA): manifest copy and the install button. */
   pwa: {
      screenshots: {
         builder: 'Sorteio inteligente: um deck do meta, com o papel de cada grupo de cartas',
         cards: 'Escolha quais cartas entram nos sorteios, arena por arena',
         profile: 'Seu perfil: troféus, deck atual, coleção e batalhas recentes',
         wide: 'O montador de decks no computador',
      },
      install: 'Instalar o app',
      installed: 'App instalado',
      iosTitle: 'Instale o Deckr no iPhone ou iPad',
      iosSteps: {
         share: 'Toque em Compartilhar, na barra do Safari.',
         add: 'Escolha “Adicionar à Tela de Início”.',
         confirm: 'Toque em Adicionar: o Deckr abre como um app, em tela cheia.',
      },
      offline: 'Você está sem conexão. As páginas que você já abriu continuam disponíveis.',
   },

   /** Clash Royale rejected the player's key, usually because Deckr's IP changed. */
   keyIssue: {
      banner: (ip: string | null): string =>
         ip
            ? `O Clash Royale recusou a sua chave da API: o Deckr agora acessa o jogo pelo endereço ${ip}, que a chave não permite.`
            : 'O Clash Royale recusou a sua chave da API: o endereço de onde o Deckr acessa o jogo mudou.',
      fix: 'Atualizar chave',
      title: 'Atualize a sua chave da API',
      description:
         'O endereço IP de onde o Deckr acessa o Clash Royale pode mudar de tempos em tempos. Crie uma chave nova que permita o endereço atual e cole aqui: seus dados e decks continuam na conta.',
      inlineHint: 'Crie uma chave nova que permita este endereço:',
      field: 'Nova chave da API',
      save: 'Salvar chave',
      saving: 'Salvando…',
      saved: 'Chave atualizada',
      later: 'Agora não',
   },

   notFound: {
      title: 'Página não encontrada',
      body: 'Não há nada neste endereço.',
      home: 'Ir para o montador de decks',
   },

   errors: {
      network: 'Não foi possível acessar o servidor do Deckr.',
      status: (status: number) => `O servidor respondeu com o status ${status}.`,
      generic: 'Algo deu errado.',
      api: {
         internal: () => 'Algo deu errado.',
         not_found: () => 'Não encontrado.',
         invalid_login: () => 'Digite uma tag de jogador e um token da API.',
         invalid_tag: () => 'Tag de jogador inválida.',
         login_required: () => 'Entre com a sua tag e o seu token da API primeiro.',
         session_expired: () => 'Seu jogador não está mais conectado. Entre de novo.',
         api_key_missing: () => 'Sua chave da API salva sumiu. Entre de novo.',
         own_chests_only: () => 'Com o token do jogo, você só pode ver os seus próprios baús.',
         own_profile_only: () =>
            'Com o token do jogo, você só pode ver o seu próprio perfil. Entre com a sua chave da API para comparar.',
         invalid_deck: () => 'Um deck precisa de exatamente 8 cartas conhecidas.',
         deck_limit: (params) => `Você pode guardar até ${params.max ?? 200} decks. Remova um para salvar outro.`,
         deck_not_saved: () => 'O deck não foi salvo.',
         invalid_sync: () => 'Não foi possível ler os decks para sincronizar.',
         game_token_unavailable: () =>
            'Entrar com o token do jogo não está disponível: o Clash Royale só dá essa permissão a sites parceiros. Entre com a sua própria chave da API.',
         game_token_invalid: () =>
            'Esse token não vale para este jogador. No Clash Royale, abra Configurações → Token da API e copie um novo.',
         cr_unreachable: () => 'O Clash Royale não respondeu. Tente de novo em instantes.',
         cr_bad_request: () => 'O Clash Royale recusou a requisição. Confira a tag do jogador.',
         cr_key_rejected: (params) =>
            `O Clash Royale recusou o token da API. Confira se ele foi copiado inteiro e se a chave permite o endereço IP ${params.ip ?? 'deste servidor'}.`,
         cr_server_key_rejected: () =>
            'O Deckr não consegue acessar o Clash Royale agora. Tente mais tarde ou entre com a sua própria chave da API.',
         cr_player_not_found: () => 'Nenhum jogador encontrado com essa tag.',
         cr_rate_limited: () => 'O Clash Royale está limitando as requisições deste token. Tente de novo em um minuto.',
         cr_maintenance: () => 'O Clash Royale está em manutenção. Tente mais tarde.',
         cr_error: (params) => `O Clash Royale respondeu com o status ${params.status ?? '?'}.`,
      } satisfies Record<ApiErrorCode, (params: ApiErrorParams) => string>,
   },
};

export type Dictionary = typeof ptBr;

export default ptBr;
