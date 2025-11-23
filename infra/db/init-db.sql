-- ═══════════════════════════════════════════════════════════════════
-- 🚀 PROLEX - Script d'initialisation PostgreSQL
-- ═══════════════════════════════════════════════════════════════════
--
-- Ce script est exécuté automatiquement au premier démarrage du
-- conteneur PostgreSQL via docker-entrypoint-initdb.d/
--
-- Objectif :
--   - Activer les extensions nécessaires (pgcrypto pour UUID)
--   - Préparer la base pour les logs et le futur RAG
--
-- ⚠️ Ce script ne s'exécute QU'UNE SEULE FOIS lors du premier démarrage.
-- Si la base existe déjà, ce script n'est PAS réexécuté.
--
-- ═══════════════════════════════════════════════════════════════════

-- Activer l'extension pgcrypto pour générer des UUID
-- (compatible avec toutes les versions de PostgreSQL)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Note: On pourrait aussi utiliser uuid-ossp, mais pgcrypto est plus standard
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Extensions PostgreSQL activées avec succès';
  RAISE NOTICE '   - pgcrypto (UUID generation via gen_random_uuid())';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaine étape : Exécuter les migrations SQL';
  RAISE NOTICE '   → cd infra/db && bash migrate.sh';
END $$;
