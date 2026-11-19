import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const pine = '#143F3D';
const cream = '#F6F1E7';
const mute = '#D5D8D1';
const cursor = '#2BB8B0';

function svg({ padding, background, glyph = pine, secondary = mute, mark = cursor, card = cream }) {
  const x = padding;
  const y = padding;
  const size = 1024 - padding * 2;
  const bg = background ? `<rect width="1024" height="1024" fill="${background}"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bg}
  <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.round(size * 0.16)}" fill="${card}"/>
  <rect x="${x + size * 0.16}" y="${y + size * 0.22}" width="${size * 0.42}" height="${size * 0.055}" rx="${size * 0.03}" fill="${glyph}"/>
  <rect x="${x + size * 0.16}" y="${y + size * 0.36}" width="${size * 0.62}" height="${size * 0.055}" rx="${size * 0.03}" fill="${secondary}"/>
  <rect x="${x + size * 0.16}" y="${y + size * 0.5}" width="${size * 0.28}" height="${size * 0.055}" rx="${size * 0.03}" fill="${secondary}"/>
  <rect x="${x + size * 0.48}" y="${y + size * 0.48}" width="${size * 0.045}" height="${size * 0.12}" rx="${size * 0.02}" fill="${mark}"/>
  <path d="M${x + size * 0.18} ${y + size * 0.7} l${size * 0.08} ${size * 0.07} l${-size * 0.08} ${size * 0.07}" fill="none" stroke="${mark}" stroke-width="${Math.max(10, size * 0.045)}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

async function png(svgText, file, size) {
  await sharp(Buffer.from(svgText)).resize(size, size).png().toFile(file);
}

await mkdir('assets/images', { recursive: true });
await mkdir('public/icons', { recursive: true });

const regular = svg({ padding: 150, background: pine });
const maskable = svg({ padding: 230, background: pine });
const splash = svg({ padding: 210, background: null });
const foreground = svg({ padding: 220, background: null });
const mono = svg({
  padding: 230,
  background: null,
  card: '#FFFFFF',
  glyph: pine,
  secondary: '#FFFFFF',
  mark: pine,
});

await png(regular, 'assets/images/icon.png', 1024);
await png(regular, 'assets/images/favicon.png', 48);
await png(splash, 'assets/images/splash-icon.png', 512);
await png(foreground, 'assets/images/android-icon-foreground.png', 1024);
await png(mono, 'assets/images/android-icon-monochrome.png', 1024);
await png(regular, 'public/icons/icon-192.png', 192);
await png(regular, 'public/icons/icon-512.png', 512);
await png(maskable, 'public/icons/icon-maskable-512.png', 512);
await png(regular, 'public/apple-touch-icon.png', 180);
await png(regular, 'public/favicon.png', 48);
console.log('Wrote PromptKit icons');
