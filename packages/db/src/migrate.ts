import 'dotenv/config';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, sql } from './client';

const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), '..', 'drizzle');

async function run() {
  console.info('▸ Ensuring required Postgres extensions are present');
  await sql.unsafe(
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
     CREATE EXTENSION IF NOT EXISTS "pgcrypto";
     CREATE EXTENSION IF NOT EXISTS "postgis";
     CREATE EXTENSION IF NOT EXISTS "vector";
     CREATE EXTENSION IF NOT EXISTS "pg_trgm";
     CREATE EXTENSION IF NOT EXISTS "unaccent";`,
  );

  console.info('▸ Running drizzle migrations from', migrationsFolder);
  await migrate(db, { migrationsFolder });

  console.info('✓ Database is up to date');
  await sql.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
