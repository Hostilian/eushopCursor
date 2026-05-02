import * as SQLite from 'expo-sqlite';

/**
 * Tiny offline cache for the catalog. Lets the discover and country screens
 * render instantly on cold starts and fully offline (e.g. on a plane home).
 *
 * Schema is intentionally small — three tables mirroring the most-read parts
 * of the catalog. We re-fetch and merge when the app comes online.
 */
const dbPromise = SQLite.openDatabaseAsync('eushop.db');

export async function ensureSchema() {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS countries (
      iso2 TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      flag TEXT NOT NULL,
      blurb TEXT
    );
    CREATE TABLE IF NOT EXISTS food_items (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country_iso2 TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      description TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS recent_listings (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      cached_at INTEGER NOT NULL
    );
  `);
}

export async function cacheCountries(
  rows: { iso2: string; name: string; flagEmoji: string; blurb?: string | null }[],
) {
  const db = await dbPromise;
  await db.withTransactionAsync(async () => {
    for (const r of rows) {
      await db.runAsync(
        'INSERT OR REPLACE INTO countries (iso2, name, flag, blurb) VALUES (?, ?, ?, ?)',
        [r.iso2, r.name, r.flagEmoji, r.blurb ?? null],
      );
    }
  });
}

export async function getCachedCountries() {
  const db = await dbPromise;
  return db.getAllAsync<{ iso2: string; name: string; flag: string; blurb: string | null }>(
    'SELECT * FROM countries ORDER BY name ASC',
  );
}

export async function cacheRecentListings(rows: { id: string; [k: string]: unknown }[]) {
  const db = await dbPromise;
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const r of rows) {
      await db.runAsync(
        'INSERT OR REPLACE INTO recent_listings (id, payload, cached_at) VALUES (?, ?, ?)',
        [r.id, JSON.stringify(r), now],
      );
    }
  });
}

export async function getCachedRecentListings(maxAgeMs = 1000 * 60 * 60 * 6) {
  const db = await dbPromise;
  const cutoff = Date.now() - maxAgeMs;
  const rows = await db.getAllAsync<{ payload: string; cached_at: number }>(
    'SELECT payload, cached_at FROM recent_listings WHERE cached_at > ? ORDER BY cached_at DESC LIMIT 50',
    [cutoff],
  );
  return rows.map((r) => JSON.parse(r.payload) as Record<string, unknown>);
}
