export const runtime = 'nodejs';

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

export const db = drizzle({ client: pool, schema });
