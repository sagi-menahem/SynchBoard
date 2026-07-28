-- SynchBoard Database Initialization Script
-- Runs once, when the PostgreSQL container first creates its data directory.
--
-- This script does NOT create tables. The schema is owned by Flyway; the migrations
-- live in backend/src/main/resources/db/migration and are applied by the backend on
-- startup. See docs/DATABASE_SCHEMA.md.
--
-- Keep this file for database-level setup that must exist before the application
-- connects: extensions, roles, custom functions. Anything table-shaped belongs in a
-- Flyway migration instead.

-- Connect to the synchboard database
\c synchboard_db;

-- Extensions would go here, e.g.:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log that initialization completed
SELECT 'SynchBoard database initialization completed successfully' AS status;
