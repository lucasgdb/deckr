/*
 * Tells IndexNow search engines (Bing, Yandex, Naver, Seznam…) that the site's pages changed, so they recrawl them
 * soon instead of on their own schedule. Bing's index also feeds Copilot and ChatGPT search. Run after a deploy:
 *
 *   SITE_URL=https://deckr.lucasbittencourt.dev pnpm --filter @deckr/web indexnow
 *
 * The key is public by design: search engines check that `<key>.txt` on the site holds it, which proves the
 * request comes from the site's owner. It lives in `public/`, named after itself.
 */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const siteUrl = process.env.SITE_URL?.replace(/\/+$/, '');
if (!siteUrl) throw new Error('Set SITE_URL to the public origin, e.g. https://deckr.lucasbittencourt.dev');

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const key = readdirSync(publicDir)
   .find((file) => /^[0-9a-f]{32}\.txt$/.test(file))
   ?.slice(0, -4);
if (!key) throw new Error('No IndexNow key file (32 hex characters + .txt) in public/');

const sitemap = await fetch(`${siteUrl}/sitemap.xml`).then((response) => {
   if (!response.ok) throw new Error(`sitemap.xml answered ${response.status}`);
   return response.text();
});
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const response = await fetch('https://api.indexnow.org/indexnow', {
   method: 'POST',
   headers: { 'content-type': 'application/json; charset=utf-8' },
   body: JSON.stringify({ host: new URL(siteUrl).host, key, keyLocation: `${siteUrl}/${key}.txt`, urlList }),
});

// 200 and 202 both mean accepted; 202 while the key is being checked the first time.
if (!response.ok) throw new Error(`IndexNow answered ${response.status}: ${await response.text()}`);
console.log(`IndexNow: submitted ${urlList.length} URLs (${response.status})`);
