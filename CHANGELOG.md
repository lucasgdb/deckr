# Changelog

## 2.0.0 — modernization

### Removed

- [x] Yarn workspaces, `packages/frontend` and `packages/backend` (now `apps/web` and `apps/api`)
- [x] Create React App, react-app-rewired, customize-cra, babel-plugin-root-import
- [x] Bootstrap, react-bootstrap, jQuery and Popper (and their copies in `public/static`)
- [x] ESLint (airbnb config), Prettier, husky, concurrently
- [x] axios, react-copy-to-clipboard, react-icons, nodemon
- [x] Vite (replaced by Next.js) and nginx (Next serves the app and proxies `/api`)
- [x] sonner (replaced by Base UI Toast) and every native control: `<select>`, `<dialog>`, `<meter>`
- [x] The RoyaleAPI integration and its token committed in `token.json`
- [x] The About page and the author photo
- [x] The `master` branch (renamed to `main` on GitHub; open PRs retargeted)
- [x] The 8 stale dependabot pull requests (closed)
- [x] Shuffle in the deck builder
- [x] Press and hover movement on cards in the card pool

### Changed

- [x] pnpm 12 workspaces: `apps/web`, `apps/api`, `packages/shared` (catalog, deck-link rules, API schemas)
- [x] TypeScript 7 everywhere; Biome for lint and format
- [x] Web: Next.js 16 (App Router, standalone build), React 19, Tailwind CSS 4, `next/font`, `next/image`
- [x] API: Node 24 running TypeScript directly, Express 5, Mongoose 9, Zod 4, helmet, central error handling
- [x] MongoDB 9; `compose.yaml` starts MongoDB, the API and the web app (`docker compose up -d --build`)
- [x] Deck links in the format the game shares today: `https://link.clashroyale.com/en?clashroyale://copyDeck?deck=…`
- [x] Pasting accepts the current, the older `/deck/en?deck=` and the bare `clashroyale://` forms
- [x] Card catalog with official ids for every card (82 were missing, which broke links), current names, unlock arena and elixir cost
- [x] Card indexes stay stable: saved decks and stored card pools keep working; older pools are migrated
- [x] Art for every card, arena and chest refreshed and converted to WebP sized for display (≈4 MB → ≈1.5 MB)
- [x] UI redesigned (true-black, flat surfaces, Clash Royale gold as the one data hue); header with blur
- [x] Favicon, app icon and manifest from the new Deckr mark
- [x] Footer links to lucasbittencourt.dev
- [x] Chest cycle reads the official Clash Royale API with the signed-in player's token

### Added

- [x] Portuguese and English: Portuguese at the root URLs, English under `/en`; language menu in the header and links in the footer
- [x] Per-language metadata: `html lang`, titles and descriptions, canonical and `hreflang` alternates, Open Graph locale, `sitemap.xml` and `robots.txt` (`SITE_URL`)
- [x] Localized 404 pages, rendered on the server with a 404 status
- [x] API error codes, so error messages show in the reader's language
- [x] SEO: JSON-LD on the home page, a visible FAQ, share images per language, `/llms.txt`, Supercell fan-content notice
- [x] No flicker on reload: stored pool, draft, saved decks and session show as skeletons until known, and as the final content right away for first-time visitors
- [x] Chest skeleton with the same 14 items as the real cycle
- [x] Performance: the builder and chests pages render on the server (only the query-string reader waits for the browser), login, card picker and paste dialogs load on first use, CSS inlined, shared packages marked side-effect free
- [x] Accessibility: deck slots keep list semantics (the card is the drag handle), accessible names match visible labels
- [x] `GET /api/me` answers 200 with `{ player: null }` when nobody is signed in (no console error)
- [x] Tests for URL rules and the proxy (`pnpm test`)
- [x] Smart roll: decks built from 14 meta archetypes and their synergy groups, shown as squares under the hand
- [x] Images served as AVIF (WebP fallback), smaller srcsets, cached for a week
- [x] Hot reload in `next dev` works from 127.0.0.1 and the machine's IPs (WSL), not only localhost
- [x] `compose.dev.yaml`: the Docker stack in development mode, hot reload on 8080
- [x] Railway infrastructure as code (`infra/railway.ts`): web, API and MongoDB 9 with a daily-backed-up volume, measured resource ceilings, per-service watch patterns for monorepo deploys
- [x] Chest names always take two lines, so the skeleton and the real cycle have the same height
- [x] Mobile and tablet pass: equal-column action bars, bottom-sheet dialogs, 16px fields on touch, 40px+ touch targets, notch-safe layout, language switcher in the mobile menu
- [x] When the server's IP changes, a banner and dialog guide the player through updating their API key
- [x] PWA: per-language manifest with PNG and maskable icons, screenshots and shortcuts; service worker that keeps card art cached until it changes and opens offline; install button (including iOS steps); asset links for a Play Store build
- [x] Design system in `apps/web/src/components/ui` on Base UI: Button, LinkButton, Tile, Card, Dialog, ConfirmDialog, Select, Menu, ContextMenu, Popover, Tabs, Tooltip, Field, Input, PrefixInput, InputGroup, SecretInput, Meter, Toggle, Toast, Skeleton, EmptyState, ErrorState, Notice
- [x] DS rules: pointer cursor on everything clickable, always-visible scrollbar, animated focus ring on fields, no browser autofill, no press effect on buttons that open popups
- [x] 29 new cards and 5 new arenas (19 arenas that unlock cards, Training Camp to Silent Sanctuary)
- [x] `pnpm --filter @deckr/web images` to optimize new art into `public/`
- [x] Log in with the player tag plus either the **in-game API token** (Settings → API Token; verified with `verifytoken`, never stored, own data only) or **your own API key** (stored encrypted), each with step-by-step help
- [x] `CLASH_ROYALE_API_KEY`: Deckr's own key, used to verify in-game tokens and read those players. Verifying needs a permission Clash Royale grants to partner sites only; Deckr detects it and disables that login option when the key lacks it
- [x] Token stored encrypted (AES-256-GCM); session as an `HttpOnly` cookie stored only as a hash
- [x] Player data refreshes on login, on Refresh (`POST /api/me/sync`) and when coming back with stored data older than 30 minutes; no scheduled sync
- [x] Player tag remembered in this browser
- [x] Profile: trophies, best, arena, king level, clan, wins/losses, win rate, current deck, collection, recent battles with the opponent's deck
- [x] Saved decks belong to the player: in the browser when logged out, in the account when logged in (mirrored to the browser), synced on login with offline saves and removals
- [x] Loading states keep the real layout: labels and actions show, only the data is a placeholder
- [x] Card names on hover wherever art shows without a name (profile, battles, my decks)
- [x] Card pool from your collection, with each card's level
- [x] Card pool toggles strike the name through with a drawn-in line
- [x] Native share (Web Share API) for complete decks in the builder, saved decks and profile; hidden where the browser has no share sheet
- [x] Deck builder:
  - [x] pick any card for a slot (search, source, elixir and arena filters; picking a card already in the deck swaps them)
  - [x] drag and drop to reorder (mouse and touch), with Move left/right in each card's menu for the keyboard
  - [x] right click anywhere on a card (art, name, cost) opens the same actions as its “⋯” menu; empty slots offer Add card and Move
  - [x] lock cards so “Roll” only replaces the rest
  - [x] remove a single card
  - [x] average elixir and 4-card cycle, with a “?” explaining both
  - [x] undo (button and Ctrl/⌘+Z)
  - [x] the deck being built survives a reload
  - [x] load your in-game deck; open any deck from the profile or a link (`/?deck=…`)
  - [x] share actions only for complete decks, with the reason shown above the builder
- [x] Accessibility: skip link, focus moved on navigation, labelled controls, `aria-pressed` toggles, live regions, 44px touch targets, reduced motion
