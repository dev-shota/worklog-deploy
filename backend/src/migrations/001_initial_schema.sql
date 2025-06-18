-- Initial schema migration for WorkLog PostgreSQL database
-- Migration: 001_initial_schema
-- Date: 2025-01-17

-- Enable UUID extension for better primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Company accounts table
CREATE TABLE IF NOT EXISTS company_accounts (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    login_id VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance entries table
CREATE TABLE IF NOT EXISTS attendance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    work_description TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_attendance_company
        FOREIGN KEY (company_id)
        REFERENCES company_accounts(company_id)
        ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_attendance_company_date
    ON attendance_entries(company_id, date);

CREATE INDEX IF NOT EXISTS idx_attendance_company_name
    ON attendance_entries(company_id, name);

CREATE INDEX IF NOT EXISTS idx_company_login_id
    ON company_accounts(login_id);

-- Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to company_accounts
DROP TRIGGER IF EXISTS update_company_accounts_updated_at ON company_accounts;
CREATE TRIGGER update_company_accounts_updated_at
    BEFORE UPDATE ON company_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to attendance_entries
DROP TRIGGER IF EXISTS update_attendance_entries_updated_at ON attendance_entries;
CREATE TRIGGER update_attendance_entries_updated_at
    BEFORE UPDATE ON attendance_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo company account (equivalent to SQLite seed data)
-- Password: 'password' (bcrypt hashed with rounds=12)
INSERT INTO company_accounts (company_id, company_name, login_id, password_hash)
VALUES (
    'demo-company',
    'デモ会社',
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeEvMCRcBkQLtFc0O'
) ON CONFLICT (company_id) DO NOTHING;

-- Verify installation
DO $$
BEGIN
    RAISE NOTICE 'WorkLog PostgreSQL schema migration completed successfully';
    RAISE NOTICE 'Tables created: company_accounts, attendance_entries';
    RAISE NOTICE 'Demo account: admin/password (company_id: demo-company)';
END $$;