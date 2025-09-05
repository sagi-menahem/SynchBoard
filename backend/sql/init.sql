-- SynchBoard Database Initialization Script
-- This script runs when the PostgreSQL container first starts

-- Ensure the database exists (this is typically already handled by Docker environment variables)
-- The database 'synchboard_db' and user 'synchboard_user' should already be created by Docker

-- Connect to the synchboard database
\c synchboard_db;

-- Create any additional extensions if needed
-- (JPA/Hibernate will handle table creation automatically)

-- Optional: Create any custom database functions or triggers here
-- For now, this file ensures the init process completes successfully

-- Log that initialization completed
SELECT 'SynchBoard database initialization completed successfully' AS status;