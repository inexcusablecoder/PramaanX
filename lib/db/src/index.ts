import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

try {
  process.loadEnvFile?.();
} catch {}

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/pramaanx";
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
