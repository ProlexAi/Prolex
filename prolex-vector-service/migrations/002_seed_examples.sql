-- Migration optionnelle: Exemples de données pour démarrer rapidement
-- Exécuter avec: psql $DATABASE_URL -f migrations/002_seed_examples.sql

-- Collection pour la documentation n8n
INSERT INTO collections (name, domain, type, metadata) VALUES
('n8n_nodes_docs', 'n8n', 'node_doc', '{"description": "Documentation officielle des nodes n8n", "source": "https://docs.n8n.io"}'),
('n8n_patterns', 'n8n', 'workflow_pattern', '{"description": "Patterns et best practices n8n"}'),
('n8n_errors', 'n8n', 'error_guide', '{"description": "Guides de résolution d''erreurs n8n"}');

-- Collection pour les docs internes
INSERT INTO collections (name, domain, type, metadata) VALUES
('internal_procedures', 'docs', 'procedure', '{"description": "Procédures internes Automatt.ai", "owner": "Matthieu"}'),
('internal_templates', 'docs', 'template', '{"description": "Templates de documents (mails, offres, rapports)"}');

-- Collection pour les erreurs globales
INSERT INTO collections (name, domain, type, metadata) VALUES
('global_error_guides', 'tech', 'error_guide', '{"description": "Guides de résolution d''erreurs techniques globales"}');

-- Collection pour les documents clients
INSERT INTO collections (name, domain, type, metadata) VALUES
('client_docs', 'business', 'client_file', '{"description": "Documents clients (audits, specs, comptes-rendus)"}');

-- Afficher les collections créées
SELECT
    name,
    domain,
    type,
    metadata->>'description' as description
FROM collections
ORDER BY created_at;

-- Note: Les documents seront ajoutés via l'API pour générer les embeddings automatiquement
