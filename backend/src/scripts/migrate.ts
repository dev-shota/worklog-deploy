#!/usr/bin/env tsx
/**
 * Database migration script for WorkLog
 * Applies PostgreSQL schema migrations
 */

import dotenv from 'dotenv';
import { createPostgreSQLDatabase } from '../config/postgresql.js';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required for migrations');
    process.exit(1);
  }

  console.log('🚀 Starting database migration...');
  
  try {
    const db = createPostgreSQLDatabase(databaseUrl);
    
    // Test connection
    await db.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');
    
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'src/migrations/001_initial_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Reading migration file...');
    
    // Execute migration
    await db.query(migrationSQL);
    console.log('✅ Migration executed successfully');
    
    // Verify tables exist
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('company_accounts', 'attendance_entries')
    `);
    
    console.log(`✅ Verified tables: ${tables.rows.map(r => r.table_name).join(', ')}`);
    
    // Check demo account
    const demoAccount = await db.get(
      'SELECT login_id, company_name FROM company_accounts WHERE company_id = $1',
      ['demo-company']
    );
    
    if (demoAccount) {
      console.log(`✅ Demo account created: ${demoAccount.login_id} (${demoAccount.company_name})`);
    }
    
    await db.close();
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };