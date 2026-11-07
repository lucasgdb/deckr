#!/usr/bin/env node
/**
 * Converts source PNGs into the small WebP files the app serves from `public/`.
 *
 *   pnpm --filter @deckr/web images <kind> <source-dir>
 *
 * kind: `cards` (file name = catalog slug, e.g. `hog-rider.png`), `arenas` (arena slug) or `chests` (chest kind).
 * Sizes are twice the largest size each image is shown at, for sharp rendering on high-density screens.
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const presets = {
   // Shown up to ~130px wide in the builder hand; cards keep the game's 302×363 frame.
   cards: { width: 260, height: 312, fit: 'contain' },
   // Shown at 56px next to each arena heading.
   arenas: { width: 128, height: 128, fit: 'contain' },
   // Shown at 96px in the chest cycle.
   chests: { width: 192, height: 192, fit: 'contain' },
};

const [kind, source] = process.argv.slice(2);
const preset = presets[kind];

if (!preset || !source) {
   console.error('Usage: optimize-images.mjs <cards|arenas|chests> <source-dir>');
   process.exit(1);
}

const target = resolve(import.meta.dirname, '../public', kind);
await mkdir(target, { recursive: true });

const files = (await readdir(source)).filter((file) => /\.(png|webp|jpe?g)$/i.test(file));
let before = 0;
let after = 0;

for (const file of files) {
   const output = join(target, `${basename(file, extname(file))}.webp`);
   const input = join(source, file);
   before += (await stat(input)).size;

   const info = await sharp(input)
      .resize({ ...preset, background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(output);

   after += info.size;
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
console.log(`${kind}: ${files.length} images, ${kb(before)} → ${kb(after)}`);
