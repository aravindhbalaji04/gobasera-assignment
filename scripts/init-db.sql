-- Initialize database with extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the database if it doesn't exist
-- This will be handled by the POSTGRES_DB environment variable
