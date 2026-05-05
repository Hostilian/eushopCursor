#!/usr/bin/env node
/**
 * Mobile preflight gate.
 *
 * One pass over everything that has to be true before `eas build --profile
 * production` is allowed to run. Each check is independent and prints its
 * own line; any failure exits 1 and the CI job goes red.
 *
 * Steps:
 *   1. app.json schema sanity (version, bundleId, runtimeVersion, etc.)
 *   2. eas.json schema sanity (channels, submit profiles)
 *   3. assets exist + meet minimum dimensions (delegates to check-assets.mjs logic)
 *   4. fastlane metadata exists for every locale + length limits respected
 *   5. screenshots exist for every locale + device size
 *   6. compliance docs exist (data-safety, privacy-nutrition, app-review, age-rating)
 *   7. version monotonicity vs the last `mobile-v*` git tag (warning only locally)
 *   8. compatibility check: app.json bundle id matches eas.json submit profiles
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const monorepoRoot = path.resolve(root, '..', '..');

const errors = [];
const warnings = [];
const info = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}
function ok(msg) {
  info.push(msg);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail(`cannot parse ${path.relative(monorepoRoot, p)}: ${e.message}`);
    return null;
  }
}

// ---- 1. app.json -----------------------------------------------------------
const appJson = readJson(path.join(root, 'app.json'));
if (appJson) {
  const expo = appJson.expo ?? {};
  const required = [
    ['name', expo.name],
    ['slug', expo.slug],
    ['version', expo.version],
    ['ios.bundleIdentifier', expo.ios?.bundleIdentifier],
    ['ios.buildNumber', expo.ios?.buildNumber],
    ['ios.config.usesNonExemptEncryption', expo.ios?.config?.usesNonExemptEncryption],
    ['android.package', expo.android?.package],
    ['android.versionCode', expo.android?.versionCode],
    ['runtimeVersion.policy', expo.runtimeVersion?.policy],
    ['updates.url', expo.updates?.url],
  ];
  for (const [key, val] of required) {
    if (val === undefined || val === null || val === '') fail(`app.json missing ${key}`);
  }
  if (expo.ios?.bundleIdentifier !== expo.android?.package) {
    warn(
      `bundleIdentifier (${expo.ios?.bundleIdentifier}) != android.package (${expo.android?.package}) — usually they should match`,
    );
  }
  if (expo.runtimeVersion?.policy !== 'appVersion') {
    warn('runtimeVersion.policy should be "appVersion" for store-binary OTA compatibility');
  }
  if (expo.ios?.config?.usesNonExemptEncryption !== false) {
    fail(
      'ios.config.usesNonExemptEncryption must be `false` to skip per-release export-compliance review',
    );
  }
  if (
    !Array.isArray(expo.ios?.associatedDomains) ||
    !expo.ios.associatedDomains.some((d) => /^applinks:/.test(d))
  ) {
    warn('ios.associatedDomains has no `applinks:*` entry — Universal Links will not work');
  }
  if (!Array.isArray(expo.android?.intentFilters) || !expo.android.intentFilters.length) {
    warn('android.intentFilters empty — App Links will not auto-verify');
  }
  ok(`app.json checked (v${expo.version})`);
}

// ---- 2. eas.json -----------------------------------------------------------
const easJson = readJson(path.join(root, 'eas.json'));
if (easJson) {
  for (const profile of ['development', 'preview', 'production']) {
    if (!easJson.build?.[profile]) fail(`eas.json missing build.${profile}`);
  }
  for (const profile of ['internal', 'production']) {
    if (!easJson.submit?.[profile]?.android) fail(`eas.json missing submit.${profile}.android`);
    if (!easJson.submit?.[profile]?.ios) fail(`eas.json missing submit.${profile}.ios`);
  }
  // Check bundle id consistency
  for (const profile of ['internal', 'preview', 'production']) {
    const bid = easJson.submit?.[profile]?.ios?.bundleIdentifier;
    if (bid && bid !== appJson?.expo?.ios?.bundleIdentifier) {
      fail(
        `eas.json submit.${profile}.ios.bundleIdentifier (${bid}) != app.json (${appJson?.expo?.ios?.bundleIdentifier})`,
      );
    }
  }
  if (easJson.cli?.requireCommit !== true) {
    warn('eas.json cli.requireCommit should be true so builds always come from a clean commit');
  }
  ok('eas.json checked');
}

// ---- 3. assets -------------------------------------------------------------
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function pngDims(p) {
  const buf = fs.readFileSync(p);
  if (!PNG_SIG.equals(buf.subarray(0, 8))) throw new Error('not a PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
const ASSET_REQS = [
  { file: 'assets/icon.png', minW: 1024, minH: 1024 },
  { file: 'assets/adaptive-icon.png', minW: 1024, minH: 1024 },
  { file: 'assets/adaptive-monochrome.png', minW: 1024, minH: 1024 },
  { file: 'assets/splash.png', minW: 1242, minH: 2436 },
  { file: 'assets/notification-icon.png', minW: 96, minH: 96 },
  { file: 'assets/feature-graphic.png', minW: 1024, minH: 500 },
];
for (const r of ASSET_REQS) {
  const p = path.join(root, r.file);
  if (!fs.existsSync(p)) {
    fail(`missing asset ${r.file}`);
    continue;
  }
  try {
    const { width, height } = pngDims(p);
    if (width < r.minW || height < r.minH) {
      fail(`asset ${r.file} ${width}×${height} smaller than ${r.minW}×${r.minH}`);
    }
  } catch (e) {
    fail(`asset ${r.file}: ${e.message}`);
  }
}
ok(`${ASSET_REQS.length} assets checked`);

// ---- 4. fastlane metadata --------------------------------------------------
const META_LIMITS = {
  'name.txt': 30,
  'subtitle.txt': 30,
  'keywords.txt': 100,
  'promotional_text.txt': 170,
  'description.txt': 4000,
  'release_notes.txt': 4000,
};
const PLAY_LIMITS = {
  'title.txt': 50,
  'short_description.txt': 80,
  'full_description.txt': 4000,
};
const APPLE_LOCALES = ['en-US', 'de-DE', 'fr-FR', 'pl-PL', 'es-ES', 'it-IT'];
const PLAY_LOCALES = ['en-US', 'de-DE', 'fr-FR', 'pl-PL', 'es-ES', 'it-IT'];

let missingTranslations = 0;
for (const loc of APPLE_LOCALES) {
  const dir = path.join(root, 'fastlane', 'metadata', loc);
  for (const [f, limit] of Object.entries(META_LIMITS)) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) {
      fail(`fastlane/metadata/${loc}/${f} missing`);
      continue;
    }
    const content = fs.readFileSync(p, 'utf8');
    const trimmed = content.replace(/\r?\n+$/, '');
    if (!trimmed.includes('[needs translation') && trimmed.length > limit) {
      fail(`fastlane/metadata/${loc}/${f} exceeds ${limit} chars (got ${trimmed.length})`);
    }
    if (content.includes('[needs translation')) missingTranslations++;
  }
}
for (const loc of PLAY_LOCALES) {
  const dir = path.join(root, 'fastlane', 'metadata', 'android', loc);
  for (const [f, limit] of Object.entries(PLAY_LIMITS)) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) {
      fail(`fastlane/metadata/android/${loc}/${f} missing`);
      continue;
    }
    const content = fs.readFileSync(p, 'utf8').replace(/\r?\n+$/, '');
    if (!content.includes('[needs translation') && content.length > limit) {
      fail(`fastlane/metadata/android/${loc}/${f} exceeds ${limit} chars (got ${content.length})`);
    }
    if (content.includes('[needs translation')) missingTranslations++;
  }
}
if (missingTranslations) {
  warn(`${missingTranslations} fastlane files still marked [needs translation]`);
}
ok('fastlane metadata checked');

// ---- 5. screenshots --------------------------------------------------------
const SCREEN_DEVICES = ['iphone-6-9', 'iphone-6-5', 'ipad-13'];
let screenshotCount = 0;
for (const loc of APPLE_LOCALES) {
  for (const dev of SCREEN_DEVICES) {
    const dir = path.join(root, 'fastlane', 'screenshots', 'ios', loc, dev);
    if (!fs.existsSync(dir)) {
      fail(`screenshots missing for ios/${loc}/${dev}`);
      continue;
    }
    const pngs = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
    if (pngs.length < 3) fail(`ios/${loc}/${dev} has only ${pngs.length} screenshots (need ≥3)`);
    screenshotCount += pngs.length;
  }
}
for (const loc of PLAY_LOCALES) {
  const dir = path.join(root, 'fastlane', 'screenshots', 'android', loc, 'phoneScreenshots');
  if (!fs.existsSync(dir)) {
    fail(`screenshots missing for android/${loc}/phoneScreenshots`);
    continue;
  }
  const pngs = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
  if (pngs.length < 2)
    fail(`android/${loc}/phoneScreenshots has only ${pngs.length} screenshots (need ≥2)`);
  screenshotCount += pngs.length;
}
ok(`${screenshotCount} screenshots checked`);

// ---- 6. compliance docs ----------------------------------------------------
const COMPLIANCE_DOCS = [
  'docs/ops/mobile-data-safety.md',
  'docs/ops/mobile-privacy-nutrition.md',
  'docs/ops/mobile-app-review.md',
  'docs/ops/mobile-age-rating.md',
  'docs/ops/mobile-store-release.md',
];
for (const doc of COMPLIANCE_DOCS) {
  const p = path.join(monorepoRoot, doc);
  if (!fs.existsSync(p)) fail(`compliance doc missing: ${doc}`);
}
ok(`${COMPLIANCE_DOCS.length} compliance docs checked`);

// ---- 7. version monotonicity (best-effort) ---------------------------------
try {
  const lastTag = execSync('git describe --tags --match "mobile-v*" --abbrev=0', {
    cwd: monorepoRoot,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
  if (lastTag) {
    const taggedVersion = lastTag.replace(/^mobile-v/, '');
    const current = appJson?.expo?.version ?? '0.0.0';
    if (cmpVer(current, taggedVersion) <= 0) {
      warn(
        `app.json version (${current}) is not greater than last tag (${taggedVersion}). Run \`pnpm version:bump\`.`,
      );
    } else {
      ok(`version ${current} > last tag ${taggedVersion}`);
    }
  }
} catch {
  // No tags yet — first release.
}

function cmpVer(a, b) {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

// ---- summary ---------------------------------------------------------------
console.info('');
for (const m of info) console.info(`  ✓ ${m}`);
for (const m of warnings) console.warn(`  ! ${m}`);
for (const m of errors) console.error(`  ✗ ${m}`);
console.info('');
if (errors.length) {
  console.error(`[preflight] FAIL — ${errors.length} blocking issue(s), ${warnings.length} warnings`);
  process.exit(1);
}
console.info(`[preflight] ok — ${warnings.length} warnings`);
