#!/usr/bin/env node
/**
 * Version bump helper.
 *
 * Bumps `expo.version`, `expo.ios.buildNumber`, and `expo.android.versionCode`
 * in `app.json` in lockstep. Defaults to a patch bump.
 *
 * Usage:
 *   node scripts/version-bump.mjs          # patch (1.0.0 -> 1.0.1)
 *   node scripts/version-bump.mjs minor    # 1.0.0 -> 1.1.0
 *   node scripts/version-bump.mjs major    # 1.0.0 -> 2.0.0
 *
 * EAS profiles also `autoIncrement: true`, which will further bump
 * `buildNumber` / `versionCode` per build. This script is for source-of-truth
 * version bumps tied to release notes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appJsonPath = path.join(__dirname, '..', 'app.json');
const pkgPath = path.join(__dirname, '..', 'package.json');

const kind = (process.argv[2] ?? 'patch').toLowerCase();
if (!['patch', 'minor', 'major'].includes(kind)) {
  console.error(`Unknown bump kind: ${kind}. Use patch | minor | major.`);
  process.exit(1);
}

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const expo = appJson.expo ?? {};
const current = String(expo.version ?? '0.0.0');
const [maj, min, pat] = current.split('.').map((n) => Number.parseInt(n, 10) || 0);

let next;
if (kind === 'major') next = `${maj + 1}.0.0`;
else if (kind === 'minor') next = `${maj}.${min + 1}.0`;
else next = `${maj}.${min}.${pat + 1}`;

expo.version = next;
expo.ios = expo.ios ?? {};
expo.android = expo.android ?? {};
const nextBuildNumber = String((Number.parseInt(expo.ios.buildNumber ?? '0', 10) || 0) + 1);
const nextVersionCode = (expo.android.versionCode ?? 0) + 1;
expo.ios.buildNumber = nextBuildNumber;
expo.android.versionCode = nextVersionCode;
appJson.expo = expo;

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = next;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.info(
  `Bumped to ${next} (iOS buildNumber=${nextBuildNumber}, Android versionCode=${nextVersionCode}).`,
);
