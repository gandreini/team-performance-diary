import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:');

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: isLocal ? 'sqlite' : 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
