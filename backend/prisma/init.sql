-- Script d'initialisation PostgreSQL
-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Permissions (optionnel)
GRANT ALL PRIVILEGES ON DATABASE zaphir TO zaphir;
