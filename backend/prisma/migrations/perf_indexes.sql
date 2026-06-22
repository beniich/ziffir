-- Index composites pour les requêtes fréquentes

-- Audits : recherche par user + date
CREATE INDEX IF NOT EXISTS idx_audits_user_timestamp
  ON audits("user", "timestamp" DESC);

-- Room Orders : commandes actives par chambre
CREATE INDEX IF NOT EXISTS idx_room_orders_active
  ON room_orders(status, room_number)
  WHERE status != 'Delivered';

-- Users : recherche rapide par email (login)
-- Déjà créé par @unique, mais on peut ajouter un partial index
CREATE INDEX IF NOT EXISTS idx_users_active
  ON users(email)
  WHERE is_active = true;

-- Vault : documents non retirés
CREATE INDEX IF NOT EXISTS idx_vault_active
  ON vault_documents(deposit_date DESC)
  WHERE withdrawn_at IS NULL;

-- Statistiques : laisser PostgreSQL optimiser
ANALYZE;
