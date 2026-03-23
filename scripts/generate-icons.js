import sharp from 'sharp';
import { writePsdBuffer } from 'ag-psd';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import opentype from 'opentype.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Download and cache Playfair Display Bold TTF from Google Fonts
async function ensureFont() {
  const fontDir = join(__dirname, 'fonts');
  const fontPath = join(fontDir, 'PlayfairDisplay-Bold.ttf');
  if (!existsSync(fontPath)) {
    mkdirSync(fontDir, { recursive: true });
    // Old Android UA makes Google Fonts return TTF format
    const cssRes = await fetch('https://fonts.googleapis.com/css?family=Playfair+Display:700', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1' },
    });
    const css = await cssRes.text();
    const match = css.match(/src: url\(([^)]+)\)/);
    if (!match) throw new Error('Could not parse font URL from Google Fonts CSS');
    const fontRes = await fetch(match[1]);
    writeFileSync(fontPath, Buffer.from(await fontRes.arrayBuffer()));
    console.log('Downloaded PlayfairDisplay-Bold.ttf');
  }
  return opentype.loadSync(fontPath);
}

// Render text as an SVG <path>, horizontally centred at cx, baseline at y
function textPath(font, text, cx, y, fontSize, fill) {
  const width = font.getAdvanceWidth(text, fontSize);
  const path = font.getPath(text, cx - width / 2, y, fontSize);
  return `<path d="${path.toPathData(3)}" fill="${fill}"/>`;
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

// Returns SVG markup for just the sun shapes (no background)
function sunShapesSvg(s, cx, sunCy, sunScale, fg) {
  const tx = (x) => cx + (x - 16) * sunScale;
  const ty = (y) => sunCy + (y - 16) * sunScale;
  const tp = (pts) => pts.map(([x, y]) => `${tx(x)},${ty(y)}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <polygon points="${tp([[16,1],[14,8],[18,8]])}" fill="${fg}"/>
  <polygon points="${tp([[16,31],[14,24],[18,24]])}" fill="${fg}"/>
  <polygon points="${tp([[1,16],[8,14],[8,18]])}" fill="${fg}"/>
  <polygon points="${tp([[31,16],[24,14],[24,18]])}" fill="${fg}"/>
  <polygon points="${tp([[5.4,5.4],[10.2,8.4],[7.8,10.8]])}" fill="${fg}"/>
  <polygon points="${tp([[26.6,26.6],[21.8,23.6],[24.2,21.2]])}" fill="${fg}"/>
  <polygon points="${tp([[26.6,5.4],[23.6,10.2],[21.2,7.8]])}" fill="${fg}"/>
  <polygon points="${tp([[5.4,26.6],[8.4,21.8],[10.8,24.2]])}" fill="${fg}"/>
  <circle cx="${cx}" cy="${sunCy}" r="${6 * sunScale}" fill="${fg}"/>
</svg>`;
}

// Returns { flatSvg, layers: [{name, svg}] }
function makeInstagramSvg(bg, fg, font) {
  const s = 1080;
  const cx = s / 2;
  const sunCy = 400;
  const sunScale = (s * 0.42) / 32;

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" fill="${bg}"/></svg>`;
  const sunSvg = sunShapesSvg(s, cx, sunCy, sunScale, fg);
  const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">${textPath(font, 'Terrasse Season', cx, 780, 112, fg)}</svg>`;

  const flatSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <rect width="${s}" height="${s}" fill="${bg}"/>
  ${sunShapesSvg(s, cx, sunCy, sunScale, fg).replace(/<\/?svg[^>]*>/g, '')}
  ${textPath(font, 'Terrasse Season', cx, 780, 112, fg)}
</svg>`;

  return {
    flatSvg,
    layers: [
      { name: 'Background', svg: bgSvg },
      { name: 'Sun', svg: sunSvg },
      { name: 'Text', svg: textSvg },
    ],
  };
}

// Returns { flatSvg, layers: [{name, svg}] }
function makeInstagramSvgTwoLines(bg, fg, font, sunFill = 0.42) {
  const s = 1080;
  const cx = s / 2;
  const sunCy = 370;
  const sunScale = (s * sunFill) / 32;
  const sunBottom = sunCy + 15 * sunScale;
  const text1Y = sunBottom + 150;
  const text2Y = text1Y + 140;

  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" fill="${bg}"/></svg>`;
  const sunSvg = sunShapesSvg(s, cx, sunCy, sunScale, fg);
  const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  ${textPath(font, 'Terrasse', cx, text1Y, 120, fg)}
  ${textPath(font, 'Season', cx, text2Y, 120, fg)}
</svg>`;

  const flatSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <rect width="${s}" height="${s}" fill="${bg}"/>
  ${sunShapesSvg(s, cx, sunCy, sunScale, fg).replace(/<\/?svg[^>]*>/g, '')}
  ${textPath(font, 'Terrasse', cx, text1Y, 120, fg)}
  ${textPath(font, 'Season', cx, text2Y, 120, fg)}
</svg>`;

  return {
    flatSvg,
    layers: [
      { name: 'Background', svg: bgSvg },
      { name: 'Sun', svg: sunSvg },
      { name: 'Text', svg: textSvg },
    ],
  };
}

const pwaOutputs = [
  { name: 'icon-192x192.png', size: 192, fill: 0.75 },
  { name: 'icon-192x192-maskable.png', size: 192, fill: 0.50 },
  { name: 'icon-512x512.png', size: 512, fill: 0.75 },
  { name: 'icon-512x512-maskable.png', size: 512, fill: 0.50 },
  { name: 'apple-touch-icon.png', size: 180, fill: 0.75 },
];

async function svgToImageData(svg, size) {
  const raw = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
  return { data: new Uint8ClampedArray(raw), width: size, height: size };
}

async function layersToPsd(layers, outPath, size) {
  const psdLayers = [];
  // ag-psd children order: first = top of layer stack in Photoshop
  for (const { name, svg } of [...layers].reverse()) {
    const imageData = await svgToImageData(svg, size);
    psdLayers.push({ name, top: 0, left: 0, bottom: size, right: size, imageData });
  }
  const psdBuf = writePsdBuffer({ width: size, height: size, children: psdLayers }, { generateThumbnail: false });
  writeFileSync(outPath, Buffer.from(psdBuf));
}

async function generate() {
  const font = await ensureFont();

  for (const { name, size, fill } of pwaOutputs) {
    const svg = makeSunSvg(size, fill);
    await sharp(Buffer.from(svg)).png().toFile(join(__dirname, `../public/${name}`));
    console.log(`Generated ${name} (${size}x${size})`);
  }

  const ig         = makeInstagramSvg('#c45d3e', '#faf6f1', font);
  const igInverted = makeInstagramSvg('#faf6f1', '#c45d3e', font);
  const ig2        = makeInstagramSvgTwoLines('#c45d3e', '#faf6f1', font);
  const ig2Inv     = makeInstagramSvgTwoLines('#faf6f1', '#c45d3e', font);
  const ig2Big     = makeInstagramSvgTwoLines('#c45d3e', '#faf6f1', font, 0.54);

  const pngs = [
    { variant: ig,         name: 'icon-instagram.png' },
    { variant: igInverted, name: 'icon-instagram-inverted.png' },
    { variant: ig2,        name: 'icon-instagram-2lines.png' },
    { variant: ig2Inv,     name: 'icon-instagram-2lines-inverted.png' },
    { variant: ig2Big,     name: 'icon-instagram-2lines-bigsun.png' },
  ];
  for (const { variant, name } of pngs) {
    await sharp(Buffer.from(variant.flatSvg)).png().toFile(join(__dirname, `../public/${name}`));
    console.log(`Generated ${name} (1080x1080)`);
  }

  const psds = [
    { variant: ig,         name: 'icon-instagram.psd' },
    { variant: igInverted, name: 'icon-instagram-inverted.psd' },
    { variant: ig2,        name: 'icon-instagram-2lines.psd' },
    { variant: ig2Inv,     name: 'icon-instagram-2lines-inverted.psd' },
    { variant: ig2Big,     name: 'icon-instagram-2lines-bigsun.psd' },
  ];
  for (const { variant, name } of psds) {
    await layersToPsd(variant.layers, join(__dirname, `../public/${name}`), 1080);
    console.log(`Generated ${name} (1080x1080, 3 layers)`);
  }
}

generate().catch(console.error);
