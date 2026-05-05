#!/usr/bin/env node
/**
 * Marketing screenshot generator.
 *
 * Reads SVG screen templates from `apps/mobile/assets/marketing/screens/`
 * and rasterizes each at every required device dimension. Outputs to the
 * exact paths `eas submit` (iOS) and the Play Developer API (Android)
 * expect:
 *
 *   fastlane/screenshots/ios/<apple-locale>/<device>/<index>-<screen>.png
 *   fastlane/screenshots/android/<play-locale>/phoneScreenshots/<index>-<screen>.png
 *   fastlane/metadata/android/<play-locale>/images/phoneScreenshots/<index>-<screen>.png
 *
 * Required device sizes (App Store Connect 2026):
 *   - iPhone 6.9" (iPhone 16 Pro Max)  — 1290 × 2796  (covers 6.7" too)
 *   - iPad 13" (iPad Pro M4)           — 2064 × 2752
 * Required device sizes (Play 2026):
 *   - Phone (portrait)                 — 1290 × 2796 (any 16:9 / 9:16 ≥ 320)
 *
 * Apple no longer requires the 6.5" + 5.5" sizes when the 6.9" is provided
 * (Apple uses the 6.9" for all newer devices), but we still output the 6.5"
 * size for back-compat with App Store Connect uploads that haven't migrated.
 *
 * Locales mirror the fastlane metadata tree; missing translations are fine
 * here because the marketing screens use the EN copy until a designer
 * authors locale-specific SVGs.
 *
 * Use `--live` to instead capture the running web app via Playwright
 * (requires `pnpm dev:web` to be up); the default deterministic mode runs
 * in CI without a server.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const screensDir = path.join(root, 'assets', 'marketing', 'screens');

const SCREENS = [
  { id: 'home', file: '01-home.svg' },
  { id: 'trip-detail', file: '02-trip-detail.svg' },
  { id: 'trip-new', file: '03-trip-new.svg' },
  { id: 'inbox', file: '04-inbox.svg' },
  { id: 'profile', file: '05-profile.svg' },
  { id: 'manifesto', file: '06-manifesto.svg' },
];

const IOS_DEVICES = [
  { id: 'iphone-6-9', width: 1290, height: 2796 }, // iPhone 16 Pro Max
  { id: 'iphone-6-5', width: 1242, height: 2688 }, // iPhone 11 Pro Max (back-compat)
  { id: 'ipad-13', width: 2064, height: 2752 }, // iPad Pro M4 13"
];
const ANDROID_DEVICES = [
  { id: 'phone', width: 1290, height: 2796 },
];

const LOCALES = [
  { apple: 'en-US', play: 'en-US' },
  { apple: 'de-DE', play: 'de-DE' },
  { apple: 'fr-FR', play: 'fr-FR' },
  { apple: 'pl-PL', play: 'pl-PL' },
  { apple: 'es-ES', play: 'es-ES' },
  { apple: 'it-IT', play: 'it-IT' },
];

async function rasterizeAll() {
  const sharp = (await import('sharp')).default;
  let n = 0;
  for (const screen of SCREENS) {
    const svgPath = path.join(screensDir, screen.file);
    if (!fs.existsSync(svgPath)) {
      console.warn(`[screenshots] missing ${screen.file}`);
      continue;
    }
    const svg = fs.readFileSync(svgPath);

    for (const loc of LOCALES) {
      // iOS — one PNG per device per screen
      for (const dev of IOS_DEVICES) {
        const out = path.join(
          root,
          'fastlane',
          'screenshots',
          'ios',
          loc.apple,
          dev.id,
          `${SCREENS.indexOf(screen) + 1}-${screen.id}.png`,
        );
        fs.mkdirSync(path.dirname(out), { recursive: true });
        await sharp(svg, { density: 384 })
          .resize(dev.width, dev.height, {
            fit: 'cover',
            background: { r: 250, g: 247, b: 242, alpha: 1 },
          })
          .png({ compressionLevel: 9 })
          .toFile(out);
        n++;
      }

      // Android — phone screenshots
      for (const dev of ANDROID_DEVICES) {
        const filename = `${SCREENS.indexOf(screen) + 1}-${screen.id}.png`;
        const fastlaneOut = path.join(
          root,
          'fastlane',
          'screenshots',
          'android',
          loc.play,
          'phoneScreenshots',
          filename,
        );
        const playMetadataOut = path.join(
          root,
          'fastlane',
          'metadata',
          'android',
          loc.play,
          'images',
          'phoneScreenshots',
          filename,
        );
        for (const target of [fastlaneOut, playMetadataOut]) {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          await sharp(svg, { density: 384 })
            .resize(dev.width, dev.height, {
              fit: 'cover',
              background: { r: 250, g: 247, b: 242, alpha: 1 },
            })
            .png({ compressionLevel: 9 })
            .toFile(target);
          n++;
        }
      }
    }
  }
  console.info(`[screenshots] wrote ${n} PNGs`);
}

async function captureLive() {
  let chromium;
  try {
    ({ chromium } = await import('@playwright/test'));
  } catch {
    console.error('[screenshots] @playwright/test not installed; run `pnpm install` first.');
    process.exit(1);
  }
  const baseUrl = process.env.SCREENSHOTS_BASE_URL ?? 'http://localhost:3000';
  const ROUTES = [
    { id: 'home', path: '/' },
    { id: 'trip-detail', path: '/trips' },
    { id: 'trip-new', path: '/trips/new' },
    { id: 'inbox', path: '/inbox' },
    { id: 'profile', path: '/profile' },
    { id: 'manifesto', path: '/manifesto' },
  ];
  const browser = await chromium.launch();
  for (const dev of IOS_DEVICES) {
    const ctx = await browser.newContext({
      viewport: { width: dev.width / 3, height: dev.height / 3 },
      deviceScaleFactor: 3,
      isMobile: true,
    });
    const page = await ctx.newPage();
    for (const r of ROUTES) {
      await page.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle' });
      const out = path.join(
        root,
        'fastlane',
        'screenshots',
        'ios',
        'en-US',
        dev.id,
        `${ROUTES.indexOf(r) + 1}-${r.id}-live.png`,
      );
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await page.screenshot({ path: out, fullPage: false });
    }
    await ctx.close();
  }
  await browser.close();
  console.info('[screenshots] live captures done — review, then commit overrides.');
}

const main = async () => {
  if (process.argv.includes('--live')) {
    await captureLive();
    return;
  }
  try {
    await rasterizeAll();
  } catch (err) {
    if (err instanceof Error && err.message.includes('Cannot find module')) {
      console.error(
        '[screenshots] sharp not installed — run `pnpm --filter @eushop/mobile install` first.',
      );
      process.exit(1);
    }
    throw err;
  }
};

await main();
