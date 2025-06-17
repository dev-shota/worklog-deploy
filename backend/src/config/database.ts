import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { createPostgreSQLDatabase, PostgreSQLDatabase } from './postgresql.js';

const { verbose } = sqlite3;
const sqlite = verbose();

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
      this.db.run(sql, params, function(err) {
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
      this.db.get(sql, params, (err, row) => {
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
      this.db.all(sql, params, (err, rows) => {
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
      this.db.close((err) => {
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
  
  if (databaseUrl) {
    // Use PostgreSQL if DATABASE_URL is provided
    console.log('Connecting to PostgreSQL database...');
    const pgDatabase = createPostgreSQLDatabase(databaseUrl);
    
    // Test connection
    try {
      await pgDatabase.query('SELECT 1');
      console.log('Connected to PostgreSQL database successfully');
      return pgDatabase;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      throw error;
    }
  } else {
    // Fallback to SQLite
    const databasePath = process.env.DATABASE_PATH || './data/worklog.sqlite';
    const dataDir = path.dirname(databasePath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const db = new sqlite.Database(databasePath, (err) => {
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
    // Read and execute migration file
    const migrationPath = path.join(process.cwd(), 'src/migrations/001_initial_schema.sql');
    
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the entire migration SQL as one statement
      // PostgreSQL can handle multiple statements in one execution
      await db.query(migrationSQL);
      
      console.log('PostgreSQL tables created successfully from migration');
    } else {
      throw new Error('Migration file not found: ' + migrationPath);
    }
  } catch (error) {
    console.error('Error creating PostgreSQL tables:', error);
    throw error;
  }
};

export type { Database };
export { PostgreSQLDatabase };