import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import sqlite3 from 'sqlite3';
import { Database } from './database.js';

interface PostgreSQLConfig {
  connectionString: string;
  ssl?: boolean;
}

export class PostgreSQLDatabase implements Database {
  private pool: Pool;

  constructor(config: PostgreSQLConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      ssl: config.ssl !== false ? { rejectUnauthorized: false } : false,
      // Optimized for Vercel serverless
      max: 1, // Single connection for serverless
      min: 0, // Allow pool to scale to zero
      idleTimeoutMillis: 10000, // Shorter idle timeout
      connectionTimeoutMillis: 5000, // Faster timeout
      acquireTimeoutMillis: 5000, // Connection acquisition timeout
      createTimeoutMillis: 5000, // Connection creation timeout
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });

    // Log connection events for debugging
    this.pool.on('connect', (client) => {
      console.log('PostgreSQL client connected');
    });

    this.pool.on('remove', (client) => {
      console.log('PostgreSQL client removed');
    });
  }

  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult = await client.query(sql, params);
      // Create a RunResult-compatible object
      const runResult = {
        lastID: result.rows[0]?.id || result.rowCount || 0,
        changes: result.rowCount || 0,
        // Add required RunResult methods (not used in our implementation)
        bind: () => runResult,
        reset: () => runResult,
        finalize: () => {},
        run: () => {},
        get: () => {},
        all: () => {},
        each: () => {},
        prepare: () => {},
        close: () => {},
        configure: () => {},
        interrupt: () => {},
        stmt: null as any,
      };
      return runResult as unknown as sqlite3.RunResult;
    } finally {
      client.release();
    }
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult = await client.query(sql, params);
      return result.rows[0] as T | undefined;
    } finally {
      client.release();
    }
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // PostgreSQL specific utility methods
  async query<T extends QueryResultRow = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      return await client.query<T>(sql, params);
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const createPostgreSQLDatabase = (connectionString: string): PostgreSQLDatabase => {
  return new PostgreSQLDatabase({
    connectionString,
    ssl: process.env.NODE_ENV === 'production',
  });
};