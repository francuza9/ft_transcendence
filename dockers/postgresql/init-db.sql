-- Create the database
-- CREATE DATABASE transcend_db;

-- Create the user with a password
-- CREATE USER db_user WITH PASSWORD 'He11oWorld';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE transcend_db TO db_user;

-- Connect to the transcend_db database
\c transcend_db

-- Grant all privileges on the public schema to the user
GRANT ALL PRIVILEGES ON SCHEMA public TO db_user;

-- Grant all privileges on all existing tables in the public schema to the user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_user;

-- Grant all privileges on all future tables in the public schema to the user
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO db_user;
