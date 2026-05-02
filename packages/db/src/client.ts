import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://eushop:eushop@localhost:5432/eushop';

export const sql = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 20 : 5,
  prepare: false,
});

export const db = drizzle(sql, { schema, casing: 'snake_case' });

export type DB = typeof db;
export { schema };
