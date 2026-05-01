import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, sql } from './client.js';

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

  console.info('▸ Running drizzle migrations');
  await migrate(db, { migrationsFolder: './drizzle' });

  console.info('✓ Database is up to date');
  await sql.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
