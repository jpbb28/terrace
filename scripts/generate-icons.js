import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Embed Playfair Display (Latin subset) from Next.js font cache (optional)
const playfairPath = join(__dirname, '../.next/static/media/eaead17c7dbfcd5d-s.p.woff2');
let playfairFontFace = '';
try {
  const playfairB64 = readFileSync(playfairPath).toString('base64');
  playfairFontFace = `@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 700;
  src: url('data:font/woff2;base64,${playfairB64}') format('woff2');
}`;
} catch {
  // Font cache not available; will fall back to Georgia/serif
}

// sunFill: fraction of canvas the sun occupies (0–1)
// For "any" icons: ~0.75 (fills most of the icon)
// For "maskable" icons: ~0.50 (fits within the 80% safe-zone circle)
function makeSunSvg(size, sunFill = 0.75) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const scale = (s * sunFill) / 32;

  const tx = (x) => cx + (x - 16) * scale;
  const ty = (y) => cy + (y - 16) * scale;
  const tp = (pts) => pts.map(([x, y]) => `${tx(x)},${ty(y)}`).join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <rect width="${s}" height="${s}" fill="#c45d3e"/>
  <polygon points="${tp([[16,1],[14,8],[18,8]])}" fill="#faf6f1"/>
  <polygon points="${tp([[16,31],[14,24],[18,24]])}" fill="#faf6f1"/>
  <polygon points="${tp([[1,16],[8,14],[8,18]])}" fill="#faf6f1"/>
  <polygon points="${tp([[31,16],[24,14],[24,18]])}" fill="#faf6f1"/>
  <polygon points="${tp([[5.4,5.4],[10.2,8.4],[7.8,10.8]])}" fill="#faf6f1"/>
  <polygon points="${tp([[26.6,26.6],[21.8,23.6],[24.2,21.2]])}" fill="#faf6f1"/>
  <polygon points="${tp([[26.6,5.4],[23.6,10.2],[21.2,7.8]])}" fill="#faf6f1"/>
  <polygon points="${tp([[5.4,26.6],[8.4,21.8],[10.8,24.2]])}" fill="#faf6f1"/>
  <circle cx="${cx}" cy="${cy}" r="${6 * scale}" fill="#faf6f1"/>
</svg>`;
}

function makeInstagramSvg(bg, fg) {
  const s = 1080;
  const cx = s / 2;
  const sunCy = 400;
  const sunScale = (s * 0.42) / 32;

  const tx = (x) => cx + (x - 16) * sunScale;
  const ty = (y) => sunCy + (y - 16) * sunScale;
  const tp = (pts) => pts.map(([x, y]) => `${tx(x)},${ty(y)}`).join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <defs>
    <style>${playfairFontFace}</style>
  </defs>
  <rect width="${s}" height="${s}" fill="${bg}"/>
  <polygon points="${tp([[16,1],[14,8],[18,8]])}" fill="${fg}"/>
  <polygon points="${tp([[16,31],[14,24],[18,24]])}" fill="${fg}"/>
  <polygon points="${tp([[1,16],[8,14],[8,18]])}" fill="${fg}"/>
  <polygon points="${tp([[31,16],[24,14],[24,18]])}" fill="${fg}"/>
  <polygon points="${tp([[5.4,5.4],[10.2,8.4],[7.8,10.8]])}" fill="${fg}"/>
  <polygon points="${tp([[26.6,26.6],[21.8,23.6],[24.2,21.2]])}" fill="${fg}"/>
  <polygon points="${tp([[26.6,5.4],[23.6,10.2],[21.2,7.8]])}" fill="${fg}"/>
  <polygon points="${tp([[5.4,26.6],[8.4,21.8],[10.8,24.2]])}" fill="${fg}"/>
  <circle cx="${cx}" cy="${sunCy}" r="${6 * sunScale}" fill="${fg}"/>
  <text
    x="${cx}" y="730"
    text-anchor="middle"
    font-family="Playfair Display, Georgia, serif"
    font-size="112"
    font-weight="700"
    fill="${fg}"
    letter-spacing="2"
  >Terrasse Season</text>
</svg>`;
}

function makeInstagramSvgTwoLines(bg, fg) {
  const s = 1080;
  const cx = s / 2;
  const sunCy = 370;
  const sunScale = (s * 0.42) / 32;

  const tx = (x) => cx + (x - 16) * sunScale;
  const ty = (y) => sunCy + (y - 16) * sunScale;
  const tp = (pts) => pts.map(([x, y]) => `${tx(x)},${ty(y)}`).join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <defs>
    <style>${playfairFontFace}</style>
  </defs>
  <rect width="${s}" height="${s}" fill="${bg}"/>
  <polygon points="${tp([[16,1],[14,8],[18,8]])}" fill="${fg}"/>
  <polygon points="${tp([[16,31],[14,24],[18,24]])}" fill="${fg}"/>
  <polygon points="${tp([[1,16],[8,14],[8,18]])}" fill="${fg}"/>
  <polygon points="${tp([[31,16],[24,14],[24,18]])}" fill="${fg}"/>
  <polygon points="${tp([[5.4,5.4],[10.2,8.4],[7.8,10.8]])}" fill="${fg}"/>
  <polygon points="${tp([[26.6,26.6],[21.8,23.6],[24.2,21.2]])}" fill="${fg}"/>
  <polygon points="${tp([[26.6,5.4],[23.6,10.2],[21.2,7.8]])}" fill="${fg}"/>
  <polygon points="${tp([[5.4,26.6],[8.4,21.8],[10.8,24.2]])}" fill="${fg}"/>
  <circle cx="${cx}" cy="${sunCy}" r="${6 * sunScale}" fill="${fg}"/>
  <text
    x="${cx}" y="700"
    text-anchor="middle"
    font-family="Playfair Display, Georgia, serif"
    font-size="120"
    font-weight="700"
    fill="${fg}"
    letter-spacing="2"
  >Terrasse</text>
  <text
    x="${cx}" y="840"
    text-anchor="middle"
    font-family="Playfair Display, Georgia, serif"
    font-size="120"
    font-weight="700"
    fill="${fg}"
    letter-spacing="2"
  >Season</text>
</svg>`;
}

const pwaOutputs = [
  { name: 'icon-192x192.png', size: 192, fill: 0.75 },
  { name: 'icon-192x192-maskable.png', size: 192, fill: 0.50 },
  { name: 'icon-512x512.png', size: 512, fill: 0.75 },
  { name: 'icon-512x512-maskable.png', size: 512, fill: 0.50 },
  { name: 'apple-touch-icon.png', size: 180, fill: 0.75 },
];

async function generate() {
  for (const { name, size, fill } of pwaOutputs) {
    const svg = makeSunSvg(size, fill);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(join(__dirname, `../public/${name}`));
    console.log(`Generated ${name} (${size}x${size})`);
  }

  const igSvg = makeInstagramSvg('#c45d3e', '#faf6f1');
  await sharp(Buffer.from(igSvg))
    .png()
    .toFile(join(__dirname, '../public/icon-instagram.png'));
  console.log('Generated icon-instagram.png (1080x1080)');

  const igInvertedSvg = makeInstagramSvg('#faf6f1', '#c45d3e');
  await sharp(Buffer.from(igInvertedSvg))
    .png()
    .toFile(join(__dirname, '../public/icon-instagram-inverted.png'));
  console.log('Generated icon-instagram-inverted.png (1080x1080)');

  const igTwoLinesSvg = makeInstagramSvgTwoLines('#c45d3e', '#faf6f1');
  await sharp(Buffer.from(igTwoLinesSvg))
    .png()
    .toFile(join(__dirname, '../public/icon-instagram-2lines.png'));
  console.log('Generated icon-instagram-2lines.png (1080x1080)');

  const igTwoLinesInvertedSvg = makeInstagramSvgTwoLines('#faf6f1', '#c45d3e');
  await sharp(Buffer.from(igTwoLinesInvertedSvg))
    .png()
    .toFile(join(__dirname, '../public/icon-instagram-2lines-inverted.png'));
  console.log('Generated icon-instagram-2lines-inverted.png (1080x1080)');
}

generate().catch(console.error);
