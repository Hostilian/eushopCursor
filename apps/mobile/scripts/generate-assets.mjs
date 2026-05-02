/**
 * Generates store-ready placeholder PNGs (icon, adaptive foreground, splash).
 * Replace with branded artwork before a public store launch.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const BG = { r: 250, g: 247, b: 242 };
const FG = { r: 45, g: 55, b: 72 }; // ~ #2D3748

function writePng(filename, width, height, draw) {
  const png = new PNG({ width, height });
  draw(png);
  return new Promise((resolve, reject) => {
    png
      .pack()
      .pipe(fs.createWriteStream(path.join(assetsDir, filename)))
      .on('finish', resolve)
      .on('error', reject);
  });
}

function fillSolid(png, rgba) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (png.width * y + x) << 2;
      png.data[i] = rgba.r;
      png.data[i + 1] = rgba.g;
      png.data[i + 2] = rgba.b;
      png.data[i + 3] = rgba.a;
    }
  }
}

function fillCircle(png, cx, cy, radius, rgba) {
  const r2 = radius * radius;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        const i = (png.width * y + x) << 2;
        png.data[i] = rgba.r;
        png.data[i + 1] = rgba.g;
        png.data[i + 2] = rgba.b;
        png.data[i + 3] = rgba.a;
      }
    }
  }
}

const w = 1024;
await writePng('icon.png', w, w, (png) => {
  fillSolid(png, { ...BG, a: 255 });
  fillCircle(png, w / 2, w / 2, w * 0.22, { ...FG, a: 255 });
});

await writePng('adaptive-icon.png', w, w, (png) => {
  fillSolid(png, { r: 0, g: 0, b: 0, a: 0 });
  fillCircle(png, w / 2, w / 2, w * 0.22, { ...FG, a: 255 });
});

const sw = 1242;
const sh = 2436;
await writePng('splash.png', sw, sh, (png) => {
  fillSolid(png, { ...BG, a: 255 });
  fillCircle(png, sw / 2, sh * 0.42, sw * 0.18, { ...FG, a: 255 });
});

console.info('Wrote assets to', assetsDir);
