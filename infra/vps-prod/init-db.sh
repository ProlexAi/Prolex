#!/bin/bash
# Script d'initialisation PostgreSQL pour créer les bases de données
# Prolex v4 - n8n-core et n8n-sandbox

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- Base de données pour n8n-sandbox
    CREATE DATABASE n8n_sandbox;
    GRANT ALL PRIVILEGES ON DATABASE n8n_sandbox TO $POSTGRES_USER;
    
    -- Affichage des bases créées
    \l
EOSQL

echo "✅ Bases de données n8n_core et n8n_sandbox créées avec succès"
