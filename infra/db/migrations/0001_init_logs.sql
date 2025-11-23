-- ═══════════════════════════════════════════════════════════════════
-- 📋 MIGRATION 0001 - Création de la table app_logs
-- ═══════════════════════════════════════════════════════════════════
--
-- Date: 2025-11-23
-- Auteur: Claude (Prolex Engineering)
--
-- Description:
--   Création de la table centrale app_logs pour stocker tous les logs
--   de Prolex, n8n, et des MCP servers.
--
--   Cette table servira à :
--     - Debugging et monitoring en temps réel
--     - AIOps (analyse des patterns d'erreurs)
--     - Futur RAG sur les logs (LogRAG)
--     - Audit trail complet de toutes les actions
--
-- Usage:
--   psql $DATABASE_URL < 0001_init_logs.sql
--
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- Vérification des extensions requises
-- ───────────────────────────────────────────────────────────────────

-- L'extension pgcrypto doit être installée (via init-db.sql)
-- Si ce n'est pas le cas, la créer maintenant
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ───────────────────────────────────────────────────────────────────
-- Création de la table app_logs
-- ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS app_logs (
  -- Identifiant unique du log (UUID v4)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Timestamp de création (avec timezone)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Source du log (identifie d'où vient le log)
  -- Exemples: "n8n", "mcp_n8n", "mcp_google", "prolex_core", "traefik", etc.
  source TEXT NOT NULL,

  -- Niveau de log (debug, info, warn, error)
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),

  -- Message principal du log
  message TEXT NOT NULL,

  -- Détails supplémentaires au format JSON
  -- Peut contenir: stack trace, context, metadata, etc.
  details JSONB DEFAULT '{}'::jsonb,

  -- Index créés automatiquement :
  -- - PRIMARY KEY sur id
  -- Indexes supplémentaires ci-dessous pour optimiser les requêtes
  CONSTRAINT valid_level CHECK (level IN ('debug', 'info', 'warn', 'error'))
);

-- ───────────────────────────────────────────────────────────────────
-- Index pour optimiser les requêtes fréquentes
-- ───────────────────────────────────────────────────────────────────

-- Index sur created_at (DESC) pour les requêtes temporelles
-- Permet de récupérer rapidement les logs récents
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at
  ON app_logs (created_at DESC);

-- Index sur source pour filtrer par origine
-- Permet de filtrer rapidement par source (ex: tous les logs de "n8n")
CREATE INDEX IF NOT EXISTS idx_app_logs_source
  ON app_logs (source);

-- Index sur level pour filtrer par gravité
-- Permet de filtrer rapidement les erreurs, warnings, etc.
CREATE INDEX IF NOT EXISTS idx_app_logs_level
  ON app_logs (level);

-- Index composite source + created_at pour requêtes combinées
-- Permet de récupérer rapidement les logs d'une source spécifique par date
CREATE INDEX IF NOT EXISTS idx_app_logs_source_created_at
  ON app_logs (source, created_at DESC);

-- Index composite level + created_at pour requêtes combinées
-- Permet de récupérer rapidement les logs d'un niveau spécifique par date
CREATE INDEX IF NOT EXISTS idx_app_logs_level_created_at
  ON app_logs (level, created_at DESC);

-- Index GIN sur details (JSONB) pour recherche dans le JSON
-- Permet de faire des requêtes sur le contenu du champ details
-- Ex: WHERE details @> '{"workflowId": "123"}'
CREATE INDEX IF NOT EXISTS idx_app_logs_details_gin
  ON app_logs USING GIN (details);

-- ───────────────────────────────────────────────────────────────────
-- Commentaires sur la table et les colonnes
-- ───────────────────────────────────────────────────────────────────

COMMENT ON TABLE app_logs IS
  'Table centrale de logs pour Prolex, n8n et MCP servers. ' ||
  'Utilisée pour debugging, monitoring, AIOps et futur RAG.';

COMMENT ON COLUMN app_logs.id IS
  'Identifiant unique du log (UUID v4)';

COMMENT ON COLUMN app_logs.created_at IS
  'Timestamp de création du log (avec timezone)';

COMMENT ON COLUMN app_logs.source IS
  'Source du log (ex: n8n, mcp_n8n, mcp_google, prolex_core)';

COMMENT ON COLUMN app_logs.level IS
  'Niveau de gravité: debug, info, warn, error';

COMMENT ON COLUMN app_logs.message IS
  'Message principal du log (texte libre)';

COMMENT ON COLUMN app_logs.details IS
  'Détails supplémentaires au format JSONB (stack trace, context, metadata)';

-- ───────────────────────────────────────────────────────────────────
-- Message de confirmation
-- ───────────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migration 0001 - Table app_logs créée avec succès';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Table créée: app_logs';
  RAISE NOTICE '  → Colonnes: id, created_at, source, level, message, details';
  RAISE NOTICE '  → Index: 6 index créés pour optimiser les performances';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes:';
  RAISE NOTICE '  1. Vérifier la table: \d app_logs';
  RAISE NOTICE '  2. Tester un INSERT:';
  RAISE NOTICE '     INSERT INTO app_logs (source, level, message, details)';
  RAISE NOTICE '     VALUES (''test'', ''info'', ''Test log'', ''{}''::jsonb);';
  RAISE NOTICE '  3. Vérifier les logs: SELECT * FROM app_logs ORDER BY created_at DESC LIMIT 10;';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════════';
END $$;
