-- Migration initiale pour prolex-vector-service
-- Active l'extension pgvector et crée les tables collections et documents

-- Activation de l'extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table collections
-- Stocke les collections de documents (ex: n8n_nodes_docs, internal_docs, error_guides)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,  -- ex: "n8n", "tech", "docs", "business"
    type TEXT NOT NULL,    -- ex: "node_doc", "workflow_pattern", "error_guide", "procedure", "client_file"
    metadata JSONB DEFAULT '{}'::jsonb,  -- métadonnées libres (description, owner, niveau_sensibilité, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index sur les champs de filtrage fréquents
CREATE INDEX idx_collections_name ON collections(name);
CREATE INDEX idx_collections_domain ON collections(domain);
CREATE INDEX idx_collections_type ON collections(type);
CREATE INDEX idx_collections_metadata ON collections USING GIN(metadata);

-- Table documents
-- Stocke les documents vectorisés avec leurs embeddings
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    content TEXT NOT NULL,  -- texte brut nettoyé (code, doc, etc.)
    metadata JSONB DEFAULT '{}'::jsonb,  -- ex: {source, tags[], client, importance, error_code}
    embedding vector(1536),  -- dimension 1536 (compatible avec OpenAI text-embedding-3-small et autres)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index sur collection_id pour les jointures
CREATE INDEX idx_documents_collection_id ON documents(collection_id);

-- Index GIN sur metadata pour recherche rapide
CREATE INDEX idx_documents_metadata ON documents USING GIN(metadata);

-- Index IVFFlat sur embedding pour recherche vectorielle rapide
-- Note: nécessite au moins 1000 rows pour être efficace, sinon utiliser un scan séquentiel
-- lists = rows / 1000 (recommandation PostgreSQL)
CREATE INDEX idx_documents_embedding ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vue pour statistiques rapides par collection
CREATE OR REPLACE VIEW collection_stats AS
SELECT
    c.id,
    c.name,
    c.domain,
    c.type,
    COUNT(d.id) as document_count,
    MAX(d.created_at) as last_document_at,
    c.created_at as collection_created_at
FROM collections c
LEFT JOIN documents d ON c.id = d.collection_id
GROUP BY c.id, c.name, c.domain, c.type, c.created_at;

-- Commentaires pour documentation
COMMENT ON TABLE collections IS 'Collections logiques de documents (ex: n8n_nodes_docs, internal_docs)';
COMMENT ON TABLE documents IS 'Documents vectorisés avec embeddings et métadonnées riches';
COMMENT ON COLUMN collections.domain IS 'Domaine: n8n, tech, docs, business';
COMMENT ON COLUMN collections.type IS 'Type: node_doc, workflow_pattern, error_guide, procedure, client_file';
COMMENT ON COLUMN documents.embedding IS 'Vecteur d''embedding (dimension 1536)';
COMMENT ON COLUMN documents.metadata IS 'Métadonnées: {source, tags[], client, importance, error_code}';

-- Exemple de données de test (optionnel, à décommenter si besoin)
-- INSERT INTO collections (name, domain, type, metadata) VALUES
-- ('n8n_nodes_docs', 'n8n', 'node_doc', '{"description": "Documentation officielle des nodes n8n"}'),
-- ('internal_docs', 'docs', 'procedure', '{"description": "Procédures internes Automatt.ai"}'),
-- ('global_error_guides', 'tech', 'error_guide', '{"description": "Guides de résolution d''erreurs"}');
