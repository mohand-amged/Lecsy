import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

config({ path: ".env" }); // or .env.local

// Conditionally create database connection to prevent build-time errors
function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('DATABASE_URL not found - database operations will fail at runtime');
    // Return a mock database for build time
    return drizzle(neon('postgresql://mock:mock@localhost:5432/mock'), { schema });
  }
  
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export const db = createDatabase();
