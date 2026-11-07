// Generates the PWA's PNG icons from Deckr's mark (the same drawing as src/app/icon.svg):
//   public/icons/icon-{192,512}.png      "any": the mark on a rounded black tile (browsers, desktop)
//   public/icons/maskable-{192,512}.png  "maskable": full-bleed black, the mark inside the safe zone, so Android
//                                         can crop it to a circle or squircle without cutting it
// Run with `pnpm icons` after changing the mark.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const out = path.join(import.meta.dirname, '..', 'public', 'icons');
const GOLD = '#f2b33d';

/** The mark (24 × 28) scaled to `height` px and centred on a `size` px canvas. */
function mark(size, height) {
   const scale = height / 28;
   const x = (size - 24 * scale) / 2;
   const y = (size - height) / 2;
   return `<g transform="translate(${x} ${y}) scale(${scale})">
      <rect x="1" y="1" width="22" height="26" rx="5" fill="${GOLD}"/>
      <path d="M8 8h4.2c3.3 0 5.3 2.3 5.3 6s-2 6-5.3 6H8z" fill="none" stroke="#000" stroke-width="2.6"/>
   </g>`;
}

const any = (size) =>
   `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#000"/>${mark(size, size * 0.62)}</svg>`;

// The maskable safe zone is the centred circle with 80% of the width; the mark fits well inside it.
const maskable = (size) =>
   `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#000"/>${mark(size, size * 0.5)}</svg>`;

await mkdir(out, { recursive: true });

for (const size of [192, 512]) {
   for (const [name, svg] of [
      ['icon', any(size)],
      ['maskable', maskable(size)],
   ]) {
      const file = path.join(out, `${name}-${size}.png`);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
      console.log(path.relative(process.cwd(), file));
   }
}
