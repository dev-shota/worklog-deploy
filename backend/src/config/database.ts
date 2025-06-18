import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { createPostgreSQLDatabase, PostgreSQLDatabase } from './postgresql.js';

// CommonJSでは__dirnameが自動で利用可能なため、ES Module用の定義を削除

const sqlite = sqlite3.verbose();

interface Database {
  run(sql: string, params?: any[]): Promise<sqlite3.RunResult>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
  close(): Promise<void>;
}

class DatabaseWrapper implements Database {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export const initializeDatabase = async (): Promise<Database> => {
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!databaseUrl,
    DATABASE_URL_PREFIX: databaseUrl?.substring(0, 20) + '...'
  });
  
  if (databaseUrl) {
    // Use PostgreSQL if DATABASE_URL is provided
    console.log('Initializing PostgreSQL database connection...');
    try {
      const pgDatabase = createPostgreSQLDatabase(databaseUrl);
      
      // Test connection with timeout
      console.log('Testing PostgreSQL connection...');
      await Promise.race([
        pgDatabase.query('SELECT 1 as test'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 8000)
        )
      ]);
      
      console.log('PostgreSQL database connection successful');
      return pgDatabase;
    } catch (error: unknown) {
      console.error('PostgreSQL connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Database connection failed: ${errorMessage}`);
    }
  } else {
    // Fallback to SQLite
    const databasePath = process.env.DATABASE_PATH || './data/worklog.sqlite';
    const dataDir = path.dirname(databasePath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return new Promise<Database>((resolve, reject) => {
      const db = new sqlite.Database(databasePath, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Connected to SQLite database at ${databasePath}`);
          resolve(new DatabaseWrapper(db));
        }
      });
    });
  }
};

export const createTables = async (db: Database): Promise<void> => {
  // Check if this is PostgreSQL or SQLite
  const isPostgreSQL = db instanceof PostgreSQLDatabase;
  
  if (isPostgreSQL) {
    console.log('Creating PostgreSQL tables...');
    await createPostgreSQLTables(db);
    return;
  }
  
  // SQLite table creation (existing logic)
  console.log('Creating SQLite tables...');
  const companyAccountsTable = `
    CREATE TABLE IF NOT EXISTS company_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      login_id TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const attendanceEntriesTable = `
    CREATE TABLE IF NOT EXISTS attendance_entries (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      site_name TEXT NOT NULL,
      work_description TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      total_hours TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES company_accounts(company_id)
    )
  `;

  const indexCompanyEntries = `
    CREATE INDEX IF NOT EXISTS idx_attendance_company_date
    ON attendance_entries(company_id, date)
  `;

  try {
    await db.run(companyAccountsTable);
    await db.run(attendanceEntriesTable);
    await db.run(indexCompanyEntries);
    console.log('SQLite tables created successfully');
  } catch (error) {
    console.error('Error creating SQLite tables:', error);
    throw error;
  }
};

// PostgreSQL table creation using migration SQL
const createPostgreSQLTables = async (db: PostgreSQLDatabase): Promise<void> => {
  try {
    // Multiple path attempts for different deployment environments
    const possiblePaths = [
      // Vercel serverless environment
      path.join(process.cwd(), 'backend/src/migrations/001_initial_schema.sql'),
      // Local development
      path.join(process.cwd(), 'src/migrations/001_initial_schema.sql'),
      // CommonJS環境では__dirnameが利用可能
      path.join(__dirname, '../migrations/001_initial_schema.sql'),
      path.resolve(__dirname, '../migrations/001_initial_schema.sql')
    ];
    
    let migrationPath: string | null = null;
    let migrationSQL: string | null = null;
    
    // Try each possible path
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        migrationPath = testPath;
        migrationSQL = fs.readFileSync(testPath, 'utf8');
        console.log('Migration file found at:', testPath);
        break;
      }
    }
    
    if (!migrationPath || !migrationSQL) {
      // If no file found, create tables inline as fallback
      console.log('Migration file not found, creating tables inline...');
      await createTablesInline(db);
      return;
    }
    
    // Execute the migration SQL
    await db.query(migrationSQL);
    console.log('PostgreSQL tables created successfully from migration file');
  } catch (error) {
    console.error('Error creating PostgreSQL tables:', error);
    // Fallback to inline table creation
    console.log('Attempting fallback inline table creation...');
    try {
      await createTablesInline(db);
      console.log('Fallback table creation successful');
    } catch (fallbackError) {
      console.error('Fallback table creation failed:', fallbackError);
      throw error;
    }
  }
};

// Fallback inline table creation
const createTablesInline = async (db: PostgreSQLDatabase): Promise<void> => {
  const createCompanyAccountsTable = `
    CREATE TABLE IF NOT EXISTS company_accounts (
      id SERIAL PRIMARY KEY,
      company_id VARCHAR(255) UNIQUE NOT NULL,
      company_name VARCHAR(255) NOT NULL,
      login_id VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createAttendanceEntriesTable = `
    CREATE TABLE IF NOT EXISTS attendance_entries (
      id TEXT PRIMARY KEY,
      company_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      day_of_week VARCHAR(20) NOT NULL,
      site_name VARCHAR(255) NOT NULL,
      work_description TEXT NOT NULL,
      start_time VARCHAR(20) NOT NULL,
      end_time VARCHAR(20) NOT NULL,
      total_hours VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_attendance_company
        FOREIGN KEY (company_id)
        REFERENCES company_accounts(company_id)
        ON DELETE CASCADE
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_attendance_company_date
      ON attendance_entries(company_id, date);
    CREATE INDEX IF NOT EXISTS idx_company_login_id
      ON company_accounts(login_id);
  `;

  const insertDemoAccount = `
    INSERT INTO company_accounts (company_id, company_name, login_id, password_hash)
    VALUES (
      'demo-company',
      'デモ会社',
      'admin',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeEvMCRcBkQLtFc0O'
    ) ON CONFLICT (company_id) DO NOTHING;
  `;

  await db.query(createCompanyAccountsTable);
  await db.query(createAttendanceEntriesTable);
  await db.query(createIndexes);
  await db.query(insertDemoAccount);
};

export type { Database };
export { PostgreSQLDatabase };