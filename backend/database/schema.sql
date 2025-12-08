-- Millionaires Club Database Schema
-- PostgreSQL Database Setup

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS yearly_contributions CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (Admin and Members authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table (Profile information)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    account_status VARCHAR(50) DEFAULT 'Active' CHECK (account_status IN ('Active', 'Inactive', 'Suspended')),
    total_contributions DECIMAL(10, 2) DEFAULT 0,
    active_loan_id UUID,
    last_loan_paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yearly Contributions
CREATE TABLE yearly_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, year)
);

-- Loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID REFERENCES members(id) ON DELETE CASCADE,
    cosigner_id UUID REFERENCES members(id),
    original_amount DECIMAL(10, 2) NOT NULL,
    remaining_balance DECIMAL(10, 2) NOT NULL,
    term_months INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'PAID', 'DEFAULTED')),
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_payment_due TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CONTRIBUTION', 'LOAN_DISBURSAL', 'LOAN_REPAYMENT', 'FEE', 'OTHER')),
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    payment_method VARCHAR(50),
    received_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for tracking changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    changes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_status ON members(account_status);
CREATE INDEX idx_members_email ON members(email);

CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_cosigner ON loans(cosigner_id);
CREATE INDEX idx_loans_status ON loans(status);

CREATE INDEX idx_transactions_member ON transactions(member_id);
CREATE INDEX idx_transactions_loan ON transactions(loan_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

CREATE INDEX idx_yearly_contributions_member ON yearly_contributions(member_id);
CREATE INDEX idx_yearly_contributions_year ON yearly_contributions(year);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

-- Insert default admin user (password: admin123)
-- Hash generated with: bcrypt.hash('admin123', 10)
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@millionairesclub.com', '$2b$10$rXVFpXUZxrh5YL8.fPH6kuqKq7PK0EBXrVQKVLX8qpqrKqVPqKqKq', 'admin');

-- Sample data (optional - comment out in production)
-- INSERT INTO members (name, email, phone, join_date) VALUES
-- ('John Doe', 'john@example.com', '555-0001', '2024-01-15'),
-- ('Jane Smith', 'jane@example.com', '555-0002', '2024-02-20');

COMMENT ON TABLE users IS 'User authentication and authorization';
COMMENT ON TABLE members IS 'Member profile information';
COMMENT ON TABLE yearly_contributions IS 'Annual contribution tracking per member';
COMMENT ON TABLE loans IS 'Loan records with borrower and cosigner';
COMMENT ON TABLE transactions IS 'All financial transactions';
COMMENT ON TABLE audit_logs IS 'Activity logging for compliance and debugging';
