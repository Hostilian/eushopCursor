/**
 * Validates claims/*.yaml: schema, touch overlaps between active claims,
 * and at most one active claim per hotspot sub-lane.
 *
 * Uses transitive hoisted deps at repo root: `yaml`, `picomatch` (no new root dependency).
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const repoRoot = process.cwd();

function loadOptionalMod(name) {
  try {
    return require(path.join(repoRoot, 'node_modules', name));
  } catch {
    return null;
  }
}

const YAML = loadOptionalMod('yaml');
const picomatch = loadOptionalMod('picomatch');

if (!YAML?.parse) {
  console.error(
    'claims:check: missing hoisted `yaml` in node_modules (run pnpm install from repo root).',
  );
  process.exit(1);
}
if (!picomatch?.isMatch) {
  console.error(
    'claims:check: missing hoisted `picomatch` in node_modules (run pnpm install from repo root).',
  );
  process.exit(1);
}

const PIC_OPTS = { dot: true };

const STATUSES = new Set(['queued', 'claimed', 'in_review', 'done']);
const LANES = new Set(['A', 'B', 'O']);
const HOTSPOT_IDS = new Set([
  'H1-router',
  'H2-context',
  'H3-schema',
  'H4-i18n',
  'H5-shell',
  'H6-deps',
]);

/** @type {{ id: string, patterns: string[] }[]} */
const HOTSPOTS = [
  { id: 'H1-router', patterns: ['packages/api-router/src/router.ts'] },
  { id: 'H2-context', patterns: ['packages/api-router/src/context.ts'] },
  { id: 'H3-schema', patterns: ['packages/db/src/schema/**'] },
  { id: 'H4-i18n', patterns: ['packages/i18n/src/messages/**'] },
  {
    id: 'H5-shell',
    patterns: [
      'apps/web/src/app/layout.tsx',
      'apps/web/src/app/**/error.tsx',
      'apps/web/src/app/**/loading.tsx',
    ],
  },
  {
    id: 'H6-deps',
    patterns: ['package.json', 'pnpm-lock.yaml', 'turbo.json'],
  },
];

const STALE_DAYS = Number(process.env.CLAIMS_STALE_WARN_DAYS ?? '14');

function norm(p) {
  return p
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, (m, off, s) => (off === s.length - 1 ? '' : m));
}

function isGlob(p) {
  return /[*?\[\]{}]/.test(p);
}

/** @param {string} filePath */
function touchHitsHotspot(touch, hotspot) {
  const t = norm(touch);
  for (const pat of hotspot.patterns) {
    const p = norm(pat);
    if (isGlob(p)) {
      if (picomatch.isMatch(t, p, PIC_OPTS)) return true;
    } else if (isGlob(t)) {
      if (picomatch.isMatch(p, t, PIC_OPTS)) return true;
    } else if (t === p || t.startsWith(p + '/')) return true;
  }
  return false;
}

/** @param {string} a @param {string} b */
function touchesOverlap(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const ga = isGlob(na);
  const gb = isGlob(nb);
  if (!ga && !gb) {
    return na.startsWith(nb + '/') || nb.startsWith(na + '/');
  }
  if (ga && !gb) return picomatch.isMatch(nb, na, PIC_OPTS);
  if (!ga && gb) return picomatch.isMatch(na, nb, PIC_OPTS);
  return picomatch.isMatch(na, nb, PIC_OPTS) || picomatch.isMatch(nb, na, PIC_OPTS);
}

/**
 * @param {unknown} v
 * @returns {string[]}
 */
function asStringArray(v, field, claimId) {
  if (!Array.isArray(v)) throw new Error(`${claimId}: "${field}" must be a YAML array of strings`);
  const out = [];
  for (const x of v) {
    if (typeof x !== 'string' || !x.trim())
      throw new Error(`${claimId}: "${field}" entries must be non-empty strings`);
    out.push(x.trim());
  }
  return out;
}

function expectedLaneFromId(id) {
  const m = /^EUSHOP-([ABO])-\d{3}$/.exec(id);
  return m ? m[1] : null;
}

function main() {
  const claimsDir = path.join(repoRoot, 'claims');
  if (!fs.existsSync(claimsDir)) {
    console.log('claims:check: no claims/ directory — ok');
    return;
  }

  const entries = fs.readdirSync(claimsDir, { withFileTypes: true });
  const yamlFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith('.yaml') && e.name !== '_template.yaml')
    .map((e) => path.join(claimsDir, e.name));

  if (yamlFiles.length === 0) {
    console.log('claims:check: no active claim YAML files — ok');
    return;
  }

  /** @type {{ file: string, id: string, lane: string, status: string, touches: string[], hotspot_sub_lane: string | null, branch: string }[]} */
  const claims = [];
  const errors = [];
  const warnings = [];

  for (const file of yamlFiles.sort()) {
    const base = path.basename(file, '.yaml');
    let doc;
    try {
      doc = YAML.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`${file}: YAML parse error: ${e?.message ?? e}`);
      continue;
    }
    if (!doc || typeof doc !== 'object') {
      errors.push(`${file}: root must be a mapping`);
      continue;
    }

    const id = doc.id;
    if (typeof id !== 'string' || !/^EUSHOP-[ABO]-\d{3}$/.test(id)) {
      errors.push(`${file}: id must match EUSHOP-<A|B|O>-<nnn>`);
      continue;
    }
    if (base !== id) {
      errors.push(`${file}: filename must match id (expected ${id}.yaml)`);
    }

    const lane = doc.lane;
    if (typeof lane !== 'string' || !LANES.has(lane)) {
      errors.push(`${id}: lane must be one of: A, B, O`);
    } else {
      const exp = expectedLaneFromId(id);
      if (exp && lane !== exp)
        errors.push(`${id}: lane "${lane}" does not match id (expected ${exp})`);
    }

    const status = doc.status;
    if (typeof status !== 'string' || !STATUSES.has(status)) {
      errors.push(`${id}: status must be one of: ${[...STATUSES].join(', ')}`);
    }

    for (const f of ['branch', 'owner', 'verify']) {
      if (typeof doc[f] !== 'string' || !doc[f].trim())
        errors.push(`${id}: "${f}" must be a non-empty string`);
    }

    let touches = [];
    try {
      touches = asStringArray(doc.touches, 'touches', id);
    } catch (e) {
      errors.push(e.message);
    }

    if (doc.depends_on !== undefined && doc.depends_on !== null) {
      try {
        asStringArray(doc.depends_on, 'depends_on', id);
      } catch (e) {
        errors.push(e.message);
      }
    }

    const hsl = doc.hotspot_sub_lane;
    let hotspot_sub_lane = null;
    if (hsl !== undefined && hsl !== null && hsl !== 'null') {
      if (typeof hsl !== 'string' || !HOTSPOT_IDS.has(hsl)) {
        errors.push(
          `${id}: hotspot_sub_lane must be null or one of: ${[...HOTSPOT_IDS].join(', ')}`,
        );
      } else {
        hotspot_sub_lane = hsl;
      }
    }

    if (status === 'done') {
      warnings.push(
        `${id}: status is "done" but file still exists — delete ${file} after merge (see claims/README.md)`,
      );
    }

    const st = fs.statSync(file);
    const ageDays = (Date.now() - st.mtimeMs) / (86400 * 1000);
    if ((status === 'claimed' || status === 'in_review') && ageDays > STALE_DAYS) {
      warnings.push(
        `${id}: claim file older than ~${STALE_DAYS} days (${Math.round(ageDays)}d) — still ${status}?`,
      );
    }

    claims.push({
      file,
      id,
      lane: lane ?? '',
      status: status ?? '',
      touches,
      hotspot_sub_lane,
      branch: doc.branch ?? '',
    });
  }

  const active = claims.filter((c) => c.status !== 'done');

  /** @type {Map<string, string[]>} */
  const hotspotToClaimIds = new Map();
  for (const h of HOTSPOTS) hotspotToClaimIds.set(h.id, []);

  for (const c of active) {
    const inferred = new Set();
    for (const touch of c.touches) {
      for (const h of HOTSPOTS) {
        if (touchHitsHotspot(touch, h)) inferred.add(h.id);
      }
    }
    if (c.hotspot_sub_lane) {
      if (!inferred.has(c.hotspot_sub_lane)) {
        errors.push(
          `${c.id}: hotspot_sub_lane "${c.hotspot_sub_lane}" does not match any touch (expand touches or fix hotspot_sub_lane)`,
        );
      }
    }
    for (const hid of inferred) {
      hotspotToClaimIds.get(hid)?.push(c.id);
    }
  }

  for (const h of HOTSPOTS) {
    const ids = [...new Set(hotspotToClaimIds.get(h.id) ?? [])];
    if (ids.length > 1) {
      errors.push(
        `Hotspot ${h.id}: multiple active claims (${ids.join(', ')}) — sequence merges or split work`,
      );
    }
  }

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      for (const ta of a.touches) {
        for (const tb of b.touches) {
          if (touchesOverlap(ta, tb)) {
            errors.push(`Touch overlap: ${a.id} ↔ ${b.id} on "${ta}" vs "${tb}"`);
          }
        }
      }
    }
  }

  for (const w of warnings) console.warn(`claims:check (warn): ${w}`);
  if (errors.length) {
    console.error('claims:check failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(`claims:check: ${yamlFiles.length} claim file(s) — ok`);
}

main();
