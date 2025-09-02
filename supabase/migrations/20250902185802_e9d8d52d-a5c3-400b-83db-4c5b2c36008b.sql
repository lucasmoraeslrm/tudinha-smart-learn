-- Ensure pgcrypto is available for digest/crypt functions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;