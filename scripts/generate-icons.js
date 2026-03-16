import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sizes = [192, 512];

async function generate() {
  for (const size of sizes) {
    // Warm earthy background (#c45d3e) with a lighter inner circle
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" fill="#c45d3e"/>
        <text
          x="50%"
          y="54%"
          dominant-baseline="middle"
          text-anchor="middle"
          font-family="Georgia, serif"
          font-size="${Math.round(size * 0.55)}"
          font-weight="bold"
          fill="#faf6f1"
          letter-spacing="-2"
        >T</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(join(__dirname, `../public/icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generate().catch(console.error);
