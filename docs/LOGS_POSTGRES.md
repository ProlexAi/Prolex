# 📊 Logs PostgreSQL - Documentation Complète

> **Système de logging centralisé pour Prolex v4+**
> **Date**: 2025-11-23
> **Version**: 1.0
> **Status**: Production Ready

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Schéma de la table `app_logs`](#schéma-de-la-table-app_logs)
4. [Installation & Configuration](#installation--configuration)
5. [Utilisation](#utilisation)
6. [Client TypeScript (`dbClient.ts`)](#client-typescript-dbclientts)
7. [Outil MCP `log_event`](#outil-mcp-log_event)
8. [Requêtes SQL Utiles](#requêtes-sql-utiles)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Roadmap Future (LogRAG/AIOps)](#roadmap-future-logragiops)

---

## 🎯 Vue d'ensemble

### Objectif

Prolex utilise désormais **PostgreSQL comme système de logging centralisé** pour tous les composants du système :

- **n8n** (workflows, exécutions)
- **MCP Servers** (n8n, Google, Finance, Communication, etc.)
- **Prolex Agent** (raisonnement, décisions, actions)

### Priorité

⚠️ **IMPORTANT**: Les logs PostgreSQL sont maintenant **PRIORITAIRES** sur Google Sheets (SystemJournal).

**Pourquoi?**

- ✅ **Performance**: Écriture et lecture ultra-rapides
- ✅ **Requêtes puissantes**: SQL pour analyses complexes
- ✅ **Scalabilité**: Gestion de millions de logs sans problème
- ✅ **Indexation**: Recherche optimisée par source, niveau, date
- ✅ **Détails JSON**: Stockage flexible de métadonnées avec JSONB
- ✅ **Future RAG**: Préparation pour LogRAG et AIOps (prochaine phase)

---

## 🏗️ Architecture

### Flux de Logs

```
┌─────────────────────────────────────────────────────────────┐
│                    PROLEX ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐  │
│  │   n8n    │   │ MCP n8n  │   │ MCP Comm │   │ Prolex  │  │
│  │Workflows │   │  Server  │   │  Server  │   │  Agent  │  │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬────┘  │
│       │              │              │              │        │
│       └──────────────┴──────────────┴──────────────┘        │
│                           │                                 │
│                      logEvent()                             │
│                           │                                 │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │  dbClient.ts    │ ← TypeScript Pool      │
│                  │  (pg library)   │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │   PostgreSQL    │                        │
│                  │  (prolex-postgres)                      │
│                  │                 │                        │
│                  │  Table:         │                        │
│                  │  app_logs       │                        │
│                  └─────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Composants

| Composant | Rôle | Emplacement |
|-----------|------|-------------|
| **PostgreSQL 16** | Base de données centrale | `infra/vps-prod/docker-compose.yml` (service `postgres`) |
| **`app_logs` table** | Table de logs | Créée via `infra/db/migrations/0001_init_logs.sql` |
| **`dbClient.ts`** | Client TypeScript | `mcp/n8n-server/src/dbClient.ts` |
| **`log_event` tool** | Outil MCP | `mcp/n8n-server/src/tools/logEvent.ts` |
| **Migrations** | Scripts SQL | `infra/db/migrations/*.sql` |

---

## 📊 Schéma de la table `app_logs`

### Structure

```sql
CREATE TABLE app_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb
);
```

### Colonnes

| Colonne | Type | Description | Exemple |
|---------|------|-------------|---------|
| `id` | UUID | Identifiant unique | `a3f7e2c4-...` |
| `created_at` | TIMESTAMPTZ | Horodatage (timezone-aware) | `2025-11-23 14:32:15+00` |
| `source` | TEXT | Source du log | `"mcp_n8n"`, `"prolex_agent"`, `"n8n_workflow_123"` |
| `level` | TEXT | Niveau de log | `"debug"`, `"info"`, `"warn"`, `"error"` |
| `message` | TEXT | Message principal | `"Workflow executed successfully"` |
| `details` | JSONB | Détails additionnels (flexible) | `{"workflow_id": "abc123", "duration_ms": 1250}` |

### Index (Optimisation)

```sql
-- Index pour requêtes par date (DESC = plus récents en premier)
CREATE INDEX idx_app_logs_created_at ON app_logs (created_at DESC);

-- Index pour filtrer par source
CREATE INDEX idx_app_logs_source ON app_logs (source);

-- Index pour filtrer par niveau
CREATE INDEX idx_app_logs_level ON app_logs (level);

-- Index composés pour requêtes combinées
CREATE INDEX idx_app_logs_source_created_at ON app_logs (source, created_at DESC);
CREATE INDEX idx_app_logs_level_created_at ON app_logs (level, created_at DESC);

-- Index GIN pour recherche JSON dans details
CREATE INDEX idx_app_logs_details_gin ON app_logs USING GIN (details);
```

**Pourquoi ces index?**

- **Performance**: Requêtes 10-100x plus rapides
- **Requêtes fréquentes**: Filtrer par source, niveau, date
- **Recherche JSON**: Trouver des logs par champs dans `details`

---

## ⚙️ Installation & Configuration

### 1. Démarrer PostgreSQL

```bash
# Depuis le répertoire racine du projet
cd infra/vps-prod

# Démarrer uniquement PostgreSQL
docker-compose up -d postgres

# Vérifier que PostgreSQL est prêt
docker-compose logs -f postgres
# Attendre: "database system is ready to accept connections"
```

### 2. Configurer les variables d'environnement

Copier `.env.example` vers `.env` et configurer:

```bash
# PostgreSQL credentials
POSTGRES_USER=prolex_user
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
POSTGRES_DB=prolex_db

# URL de connexion (utilisée par les MCP servers)
DATABASE_URL=postgres://prolex_user:VOTRE_MOT_DE_PASSE@prolex-postgres:5432/prolex_db
```

⚠️ **IMPORTANT**:
- Ne JAMAIS committer le fichier `.env` (déjà dans `.gitignore`)
- Utiliser un mot de passe fort en production

### 3. Exécuter les migrations

```bash
# Se placer dans le répertoire des migrations
cd infra/db

# Rendre le script exécutable (une seule fois)
chmod +x migrate.sh

# Exécuter les migrations
./migrate.sh

# Ou avec une URL spécifique:
./migrate.sh "postgres://user:password@localhost:5432/dbname"
```

**Sortie attendue:**

```
🔍 Vérification de psql...
✅ psql installé

🔍 Vérification de DATABASE_URL...
✅ DATABASE_URL chargée depuis .env

🔌 Test de connexion à PostgreSQL...
✅ Connexion réussie

📦 Application des migrations SQL...
✅ Migration appliquée: 0001_init_logs.sql

✅ Toutes les migrations ont été appliquées avec succès!

📊 Vérification post-migration:
 schema_name | table_name
-------------+------------
 public      | app_logs
(1 row)
```

### 4. Vérifier la table

```bash
# Se connecter à PostgreSQL
docker exec -it prolex-postgres psql -U prolex_user -d prolex_db

# Lister les tables
\dt

# Voir le schéma de app_logs
\d app_logs

# Quitter
\q
```

---

## 💻 Utilisation

### Option 1: Via l'outil MCP `log_event` (Recommandé pour les agents IA)

**Depuis Claude Desktop** ou tout client MCP:

```typescript
// Appeler l'outil MCP log_event
{
  "source": "prolex_agent",
  "level": "info",
  "message": "Workflow design completed successfully",
  "details": {
    "workflow_id": "abc123",
    "duration_ms": 1250,
    "nodes_count": 15
  }
}
```

**Réponse:**

```json
{
  "success": true,
  "message": "✅ Log enregistré dans PostgreSQL",
  "source": "prolex_agent",
  "level": "info",
  "timestamp": "2025-11-23T14:32:15.123Z"
}
```

### Option 2: Via le client TypeScript (Pour développeurs)

**Dans un MCP server ou script Node.js:**

```typescript
import { logEvent, logError } from './dbClient.js';

// Exemple 1: Log simple
await logEvent({
  source: 'mcp_n8n',
  level: 'info',
  message: 'Workflow triggered successfully',
  details: {
    workflow_id: '123',
    execution_id: 'exec_456'
  }
});

// Exemple 2: Log d'erreur
try {
  await riskyOperation();
} catch (error) {
  await logError('mcp_n8n', error, {
    operation: 'riskyOperation',
    user_id: '789'
  });
}

// Exemple 3: Log de debug
await logEvent({
  source: 'prolex_agent',
  level: 'debug',
  message: 'RAG query executed',
  details: {
    query: 'How to create a workflow?',
    results_count: 5,
    latency_ms: 45
  }
});
```

### Option 3: SQL direct (Pour analyses)

```sql
-- Insérer un log manuellement
INSERT INTO app_logs (source, level, message, details)
VALUES (
  'manual_script',
  'info',
  'Database backup completed',
  '{"size_mb": 150, "duration_seconds": 30}'::jsonb
);
```

---

## 🔧 Client TypeScript (`dbClient.ts`)

### API

#### `logEvent(input: LogEventInput): Promise<void>`

Enregistre un événement dans PostgreSQL.

**Signature:**

```typescript
interface LogEventInput {
  source: string;         // Source du log (ex: "mcp_n8n")
  level: LogLevel;        // "debug" | "info" | "warn" | "error"
  message: string;        // Message principal
  details?: Record<string, unknown>; // Détails JSON (optionnel)
}
```

**Exemple:**

```typescript
await logEvent({
  source: 'mcp_google',
  level: 'info',
  message: 'Google Sheets updated',
  details: {
    spreadsheet_id: '1abc...',
    rows_updated: 42
  }
});
```

#### `logError(source: string, error: unknown, details?: Record<string, unknown>): Promise<void>`

Helper pour logger une erreur (niveau: `error`).

**Exemple:**

```typescript
try {
  await fetchDataFromAPI();
} catch (error) {
  await logError('mcp_communication', error, {
    api_endpoint: '/send_email',
    retry_count: 3
  });
}
```

#### `closePool(): Promise<void>`

Ferme proprement le pool de connexions (appelé lors du shutdown).

**Note:** Le shutdown est automatique via les gestionnaires `SIGINT` et `SIGTERM`.

### Gestion des erreurs

Le client `dbClient.ts` est conçu pour **ne jamais crasher le processus**:

- ❌ Si `DATABASE_URL` est absente → Logs désactivés (warning en console)
- ❌ Si PostgreSQL est inaccessible → Erreur loggée en console uniquement
- ❌ Si une requête échoue → Erreur loggée, processus continue

**Comportement de secours:**

```typescript
// Si PostgreSQL n'est pas disponible, dbClient.ts:
// 1. Affiche un warning en console
// 2. Retourne sans erreur (no-op)
// 3. Le processus continue normalement
```

---

## 🛠️ Outil MCP `log_event`

### Description

L'outil `log_event` permet aux agents IA (Prolex, Claude, etc.) de s'auto-logger dans PostgreSQL.

**Autonomy Level:** 0+ (disponible à tous les niveaux, même en read-only)

### Schéma MCP

```typescript
{
  name: 'log_event',
  description: '📝 [v5] Write a log event to PostgreSQL central database. Use for agent self-logging and traceability.',
  inputSchema: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'Source of the log (e.g., "mcp_n8n", "prolex")',
        minLength: 1,
        maxLength: 50
      },
      level: {
        type: 'string',
        enum: ['debug', 'info', 'warn', 'error'],
        description: 'Log level'
      },
      message: {
        type: 'string',
        description: 'Log message (max 500 characters)',
        minLength: 1,
        maxLength: 500
      },
      details: {
        type: 'object',
        description: 'Optional additional details as JSON'
      }
    },
    required: ['source', 'level', 'message']
  }
}
```

### Exemples d'utilisation

#### Exemple 1: Log d'information

```json
{
  "source": "prolex_agent",
  "level": "info",
  "message": "Task planning completed",
  "details": {
    "task_id": "task_789",
    "steps_count": 5,
    "estimated_duration_minutes": 15
  }
}
```

#### Exemple 2: Log de warning

```json
{
  "source": "mcp_n8n",
  "level": "warn",
  "message": "Workflow execution slow",
  "details": {
    "workflow_id": "wf_123",
    "execution_time_ms": 5000,
    "threshold_ms": 2000
  }
}
```

#### Exemple 3: Log d'erreur

```json
{
  "source": "mcp_communication",
  "level": "error",
  "message": "Email sending failed",
  "details": {
    "email": "user@example.com",
    "error_code": "SMTP_TIMEOUT",
    "retry_attempt": 3
  }
}
```

---

## 📈 Requêtes SQL Utiles

### 1. Voir les 50 derniers logs

```sql
SELECT
  created_at,
  source,
  level,
  message,
  details
FROM app_logs
ORDER BY created_at DESC
LIMIT 50;
```

### 2. Filtrer par source

```sql
SELECT *
FROM app_logs
WHERE source = 'mcp_n8n'
ORDER BY created_at DESC
LIMIT 100;
```

### 3. Filtrer par niveau (erreurs uniquement)

```sql
SELECT *
FROM app_logs
WHERE level = 'error'
ORDER BY created_at DESC;
```

### 4. Logs des dernières 24 heures

```sql
SELECT *
FROM app_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### 5. Recherche dans les détails JSON

```sql
-- Trouver tous les logs qui mentionnent un workflow_id spécifique
SELECT *
FROM app_logs
WHERE details->>'workflow_id' = 'abc123'
ORDER BY created_at DESC;

-- Trouver les exécutions lentes (> 2000ms)
SELECT *
FROM app_logs
WHERE (details->>'duration_ms')::int > 2000
ORDER BY created_at DESC;
```

### 6. Statistiques par source

```sql
SELECT
  source,
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE level = 'error') as errors,
  COUNT(*) FILTER (WHERE level = 'warn') as warnings,
  COUNT(*) FILTER (WHERE level = 'info') as infos,
  COUNT(*) FILTER (WHERE level = 'debug') as debugs
FROM app_logs
GROUP BY source
ORDER BY total_logs DESC;
```

### 7. Logs par heure (dernières 24h)

```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE level = 'error') as errors
FROM app_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### 8. Recherche plein texte dans message

```sql
SELECT *
FROM app_logs
WHERE message ILIKE '%workflow%'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 🔍 Monitoring & Maintenance

### Taille de la table

```sql
-- Voir la taille de la table app_logs
SELECT
  pg_size_pretty(pg_total_relation_size('app_logs')) AS total_size,
  pg_size_pretty(pg_relation_size('app_logs')) AS table_size,
  pg_size_pretty(pg_indexes_size('app_logs')) AS indexes_size;
```

### Nombre de logs

```sql
SELECT COUNT(*) as total_logs FROM app_logs;
```

### Purge des vieux logs (optionnel)

**⚠️ À utiliser avec précaution!**

```sql
-- Supprimer les logs de plus de 90 jours
DELETE FROM app_logs
WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum pour libérer l'espace disque
VACUUM ANALYZE app_logs;
```

**Recommandation:** Configurer une tâche cron ou n8n workflow pour purger automatiquement.

### Backup des logs

```bash
# Exporter la table app_logs
docker exec prolex-postgres pg_dump -U prolex_user -d prolex_db -t app_logs > backup_app_logs.sql

# Restaurer depuis le backup
docker exec -i prolex-postgres psql -U prolex_user -d prolex_db < backup_app_logs.sql
```

---

## 🚀 Roadmap Future (LogRAG/AIOps)

### Phase 2: LogRAG (Q2 2025)

**Objectif:** Permettre à Prolex de "raisonner" sur les logs avec RAG.

**Fonctionnalités:**

- ✅ **Vectorisation des logs**: Transformer les messages en embeddings
- ✅ **Recherche sémantique**: "Trouve les erreurs similaires à celle-ci"
- ✅ **Détection de patterns**: Identifier automatiquement les problèmes récurrents
- ✅ **Suggestions de fixes**: Prolex propose des solutions basées sur l'historique

**Stack technique:**

- **pgvector extension**: Stockage des embeddings dans PostgreSQL
- **OpenAI/Anthropic Embeddings**: Génération des vecteurs
- **AnythingLLM integration**: Interface RAG

### Phase 3: AIOps (Q3 2025)

**Objectif:** Auto-réparation proactive basée sur les logs.

**Fonctionnalités:**

- ✅ **Détection d'anomalies**: ML pour identifier les comportements anormaux
- ✅ **Alertes prédictives**: Anticiper les pannes avant qu'elles n'arrivent
- ✅ **Auto-healing avancé**: Corriger automatiquement les erreurs fréquentes
- ✅ **Rapports intelligents**: Résumés quotidiens des insights

---

## 📝 Notes Importantes

### Sécurité

- ✅ **Pas de secrets dans les logs**: Ne jamais logger des API keys, passwords, tokens
- ✅ **Sanitization**: Les données sensibles doivent être masquées
- ✅ **Accès restreint**: PostgreSQL accessible uniquement via réseau Docker (pas de port 5432 exposé en prod)

### Performance

- ✅ **Pool de connexions**: `dbClient.ts` utilise un Pool (max 10 connexions)
- ✅ **Timeout**: 5 secondes pour éviter les blocages
- ✅ **Index optimisés**: 6 index pour requêtes rapides
- ✅ **JSONB**: Stockage efficace avec recherche indexée

### Compatibilité

- ✅ **PostgreSQL 16**: Version utilisée (Alpine image)
- ✅ **pg library**: Version ^8.13.1
- ✅ **TypeScript**: Support natif avec types stricts
- ✅ **Docker**: Multi-architecture (amd64, arm64)

---

## 🆘 Support & Troubleshooting

### Problème: "DATABASE_URL non configurée"

**Solution:**

1. Vérifier que le fichier `.env` existe dans `infra/vps-prod/`
2. Vérifier que `DATABASE_URL` est définie
3. Redémarrer le MCP server

### Problème: "Erreur de connexion PostgreSQL"

**Solution:**

1. Vérifier que PostgreSQL est démarré: `docker-compose ps postgres`
2. Vérifier les logs: `docker-compose logs postgres`
3. Tester la connexion:
   ```bash
   docker exec -it prolex-postgres psql -U prolex_user -d prolex_db -c "SELECT 1;"
   ```

### Problème: "Table app_logs not found"

**Solution:**

1. Exécuter les migrations:
   ```bash
   cd infra/db && ./migrate.sh
   ```

---

## 📚 Références

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/16/
- **pg library**: https://node-postgres.com/
- **JSONB**: https://www.postgresql.org/docs/16/datatype-json.html
- **GIN Indexes**: https://www.postgresql.org/docs/16/gin-intro.html

---

**Document maintenu par:** Backend Team Prolex
**Dernière mise à jour:** 2025-11-23
**Version:** 1.0
**Status:** ✅ Production Ready
