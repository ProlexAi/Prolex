# 🚀 Prolex n8n Workflows v2026 - Guide Complet

> **Version:** 2026 Ultra-Robust
> **Auteur:** Claude AI + Prolex Team
> **Date:** 2025-11-22

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Workflow 010: GitHub → n8n Sync](#workflow-010-github--n8n-sync)
3. [Workflow 020: RAG Embeddings Refresh](#workflow-020-rag-embeddings-refresh)
4. [Configuration](#configuration)
5. [Monitoring & Alertes](#monitoring--alertes)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

Cette suite de workflows automatise **100% de la synchronisation et maintenance** de votre infrastructure Prolex :

| Workflow | Déclencheur | Fonction | Fréquence |
|----------|------------|----------|-----------|
| `010_sync-github-to-n8n.json` | GitHub Webhook | Sync workflows GitHub → n8n | À chaque push |
| `020_refresh-rag-embeddings.json` | Schedule CRON | Rebuild RAG embeddings | Toutes les nuits (2am) |

### ✨ Améliorations v2026

Par rapport aux versions précédentes :

- ✅ **Retry automatique** avec exponential backoff
- ✅ **Multi-environnement** (dev/staging/prod) selon branche
- ✅ **HMAC signature validation** pour sécurité
- ✅ **Logs détaillés** dans Google Sheets
- ✅ **Notifications Slack** sur erreurs
- ✅ **Batch processing** pour éviter rate limits
- ✅ **Error recovery** intelligent

---

## 🔄 Workflow 010: GitHub → n8n Sync

### Description

Synchronise automatiquement tous les workflows du dossier `n8n-workflows/` depuis GitHub vers votre instance n8n.

### Architecture

```
GitHub Push → Webhook → Validate HMAC → Extract Files → Route by Type
                                                              │
                ┌─────────────────────────────────────────────┴─────────────┐
                │                                                           │
         Added/Modified                                               Removed
                │                                                           │
     Fetch from GitHub                                          Disable/Delete
                │                                                           │
      Parse & Validate                                                     │
                │                                                           │
      Upsert to n8n                                                        │
                │                                                           │
                └──────────────────┬────────────────────────────────────────┘
                                   │
                          Log to Sheets + Slack
```

### 📥 Webhook Setup

1. **URL du webhook:** `https://your-n8n.com/webhook/github-to-n8n-v2`

2. **Configuration GitHub:**
   ```bash
   # Aller dans Settings > Webhooks > Add webhook
   Payload URL: https://your-n8n.com/webhook/github-to-n8n-v2
   Content type: application/json
   Secret: [votre GITHUB_WEBHOOK_SECRET]
   Events: Push events
   ```

3. **Test:**
   ```bash
   curl -X POST https://your-n8n.com/webhook/github-to-n8n-v2 \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=xxx" \
     -d '{"ref":"refs/heads/main","repository":{"full_name":"ProlexAi/Prolex"}}'
   ```

### ⚙️ Variables d'environnement requises

```bash
# GitHub
GITHUB_TOKEN=ghp_xxxxx                    # Token GitHub avec accès repo
GITHUB_WEBHOOK_SECRET=your_secret_123     # Secret pour HMAC validation
ENABLE_SIGNATURE_VALIDATION=true          # Activer validation HMAC (recommandé)
GITHUB_MAX_RETRIES=3                      # Nombre de retry sur erreur
GITHUB_TIMEOUT_MS=10000                   # Timeout par requête

# n8n Multi-Env
N8N_API_KEY=n8n_api_xxxxx                 # Fallback si pas d'env spécifique

# n8n DEV (pour branche non-main)
N8N_DEV_URL=https://dev-n8n.prolex.ai
N8N_DEV_API_KEY=n8n_api_dev_xxxxx

# n8n STAGING (pour branche staging)
N8N_STAGING_URL=https://staging-n8n.prolex.ai
N8N_STAGING_API_KEY=n8n_api_staging_xxxxx

# n8n PROD (pour branche main/master)
N8N_PROD_URL=https://n8n.prolex.ai
N8N_PROD_API_KEY=n8n_api_prod_xxxxx

# Comportement
DELETE_WORKFLOWS_ON_REMOVE=false          # Si true, DELETE au lieu de DISABLE
N8N_MAX_RETRIES=3                         # Retry pour appels n8n API
N8N_TIMEOUT_MS=15000                      # Timeout pour n8n API

# Logging
GOOGLE_SHEETS_AUDIT_LOG_ID=1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
SLACK_ALERT_CHANNEL_ID=C12345ABCDE       # Channel Slack pour alertes
ERROR_WORKFLOW_ID=workflow_xxx            # Workflow d'erreur global (optionnel)
```

### 🎬 Fonctionnement détaillé

#### 1. **Validation & Parsing**
- Vérifie signature HMAC `x-hub-signature-256`
- Valide structure du payload GitHub
- Détermine environnement cible selon branche :
  - `main` / `master` → PROD
  - `staging` → STAGING
  - Autres → DEV

#### 2. **Extraction des fichiers**
- Parse tous les commits du push
- Filtre uniquement `n8n-workflows/*.json`
- Déduplique les fichiers
- Identifie type de changement : `added`, `modified`, `removed`

#### 3. **Traitement par type**

**Added/Modified:**
1. Fetch fichier depuis GitHub API (avec retry)
2. Décode base64 → parse JSON
3. Valide structure n8n (name, nodes, etc.)
4. Cherche workflow existant par nom
5. CREATE si nouveau, UPDATE si existant
6. Log résultat

**Removed:**
1. Devine nom du workflow depuis filename
2. Cherche workflow dans n8n
3. DISABLE (ou DELETE si `DELETE_WORKFLOWS_ON_REMOVE=true`)
4. Log résultat

#### 4. **Logging & Notifications**
- Chaque opération → Google Sheets (`github_sync_audit`)
- Erreurs uniquement → Slack avec détails

### 📊 Schema Google Sheets

Créez un onglet `github_sync_audit` avec ces colonnes :

```
timestamp_utc | event_id | execution_id | repo | branch | target_env | commit_sha |
commit_message | actor | file_path | change_type | action_taken | workflow_id |
workflow_name | workflow_url | sync_status | error | error_type | error_message
```

### 🔍 Exemple de log

```json
{
  "timestamp_utc": "2025-11-22T02:15:34.567Z",
  "event_id": "abc123-github-delivery",
  "execution_id": "n8n-exec-456",
  "repo": "ProlexAi/Prolex",
  "branch": "main",
  "target_env": "prod",
  "commit_sha": "7f3b2c1",
  "commit_message": "feat: add new automation workflow",
  "actor": "john_doe",
  "file_path": "n8n-workflows/030_new-automation.json",
  "change_type": "added",
  "action_taken": "created",
  "workflow_id": "42",
  "workflow_name": "New Automation Workflow",
  "workflow_url": "https://n8n.prolex.ai/workflow/42",
  "sync_status": "success",
  "error": false,
  "error_type": "",
  "error_message": ""
}
```

---

## 🧠 Workflow 020: RAG Embeddings Refresh

### Description

Rebuild complet des embeddings RAG chaque nuit pour maintenir la base de connaissances à jour.

### Architecture

```
Schedule (2am) → Init Job → Scan Repo → Batch Split → Process Batches
                                                              │
                                                     ┌────────┴────────┐
                                                     │                 │
                                              Fetch Content      Chunk Text
                                                     │                 │
                                              Generate Embeddings      │
                                                     │                 │
                                              Upsert Pinecone ─────────┘
                                                              │
                                                         Log Progress
                                                              │
                                                     Aggregate Results
                                                              │
                                                  Log Sheets + Notify Slack
```

### ⏰ Schedule

- **Heure:** 2am UTC (tous les jours)
- **CRON:** `0 2 * * *`
- **Durée estimée:** 5-30 minutes (selon taille repo)

### ⚙️ Variables d'environnement requises

```bash
# GitHub Source
GITHUB_REPO=ProlexAi/Prolex              # Repo à scanner
GITHUB_TOKEN=ghp_xxxxx                   # Token GitHub
RAG_SOURCE_BRANCH=main                   # Branche à indexer

# OpenAI Embeddings
OPENAI_API_KEY=sk-xxxxx                  # Clé OpenAI
EMBEDDING_MODEL=text-embedding-3-small   # Modèle (ou text-embedding-3-large)

# Pinecone Vector DB
PINECONE_API_KEY=xxxxx                   # Clé Pinecone
PINECONE_INDEX=prolex-rag                # Nom de l'index
PINECONE_ENVIRONMENT=us-east1-gcp        # Région Pinecone
RAG_NAMESPACE=prolex-main                # Namespace (pour multi-env)

# Processing
RAG_BATCH_SIZE=50                        # Fichiers par batch (50 recommandé)
RAG_CHUNK_SIZE=1000                      # Taille chunks en caractères
RAG_CHUNK_OVERLAP=200                    # Overlap entre chunks
RAG_MAX_FILE_SIZE=500000                 # Taille max fichier (500KB)
RAG_INCREMENTAL_MODE=false               # Incrémental ou full rebuild

# Notifications
GOOGLE_SHEETS_AUDIT_LOG_ID=1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
SLACK_RAG_CHANNEL_ID=C67890FGHIJ        # Channel Slack pour RAG
```

### 🎬 Fonctionnement détaillé

#### 1. **Initialisation**
- Vérifie toutes les configs (GitHub, OpenAI, Pinecone)
- Crée `run_id` unique
- Log début de job

#### 2. **Scan du repo**
- Récursion complète du repo GitHub
- Filtre extensions : `.md`, `.ts`, `.js`, `.py`, `.json`, `.yaml`, `.txt`, `.sh`
- Exclusions : `node_modules/`, `.git/`, `dist/`, `build/`, etc.
- Limite taille : 500KB par fichier

#### 3. **Batch processing**
- Découpe en lots de 50 fichiers (configurable)
- Traite chaque batch séquentiellement (évite rate limits)

#### 4. **Pour chaque batch:**

**a) Fetch Content**
- Télécharge contenu de tous les fichiers
- Retry 3x avec exponential backoff
- Continue si erreur sur certains fichiers

**b) Chunking**
- Découpe chaque fichier en chunks de ~1000 caractères
- Overlap de 200 caractères entre chunks
- Métadonnées attachées : `file_path`, `file_name`, `chunk_index`, etc.

**c) Generate Embeddings**
- Appel OpenAI Embeddings API
- Batch de tous les chunks du batch
- Retry 3x avec backoff 2s/4s/8s
- Rate limiting intelligent

**d) Upsert Pinecone**
- Upload vectors dans Pinecone
- Namespace pour isolation
- Métadonnées incluent texte original (max 40KB)
- Retry 3x

**e) Log Progress**
- Log chaque batch dans Sheets

#### 5. **Agrégation finale**
- Somme tous les batches
- Calcule métriques : durée, success rate, erreurs
- Log final + notification Slack

### 📊 Schema Google Sheets

Créez un onglet `rag_refresh_log` avec ces colonnes :

```
timestamp_start | timestamp_end | run_id | execution_id | duration_min |
total_batches | total_chunks | total_embeddings | total_upserted |
total_errors | success_rate | status
```

### 🔍 Exemple de résultat

**Notification Slack:**
```
✅ RAG Embeddings Refresh Complete

Duration: 12 minutes
Chunks: 3,456
Embeddings: 3,456
Vectors Upserted: 3,450
Errors: 6
Success Rate: 99%
Status: completed_with_errors

Run ID: `rag_rebuild_1732241400000`
```

### 🎯 Performances attendues

| Taille Repo | Fichiers | Chunks | Embeddings/min | Durée totale |
|-------------|----------|--------|----------------|--------------|
| Small (< 100 fichiers) | 50-100 | 500-1,000 | ~300 | 3-5 min |
| Medium (100-500) | 100-500 | 1,000-5,000 | ~300 | 5-15 min |
| Large (500-2000) | 500-2,000 | 5,000-20,000 | ~300 | 15-60 min |

---

## ⚙️ Configuration

### Ordre de setup

1. **Créer les credentials n8n:**
   - GitHub API (`githubApi`)
   - Google Sheets OAuth2 (`googleSheetsOAuth2Api`)
   - Slack Webhook (`slackWebhookApi`)
   - OpenAI API Key (dans env vars)
   - Pinecone API Key (dans env vars)

2. **Configurer environnement variables:**
   ```bash
   # Dans n8n > Settings > Environment
   # Copier toutes les variables listées ci-dessus
   ```

3. **Créer Google Sheets:**
   ```bash
   # Créer nouveau Sheet "Prolex Audit Logs"
   # Onglet 1: "github_sync_audit"
   # Onglet 2: "rag_refresh_log"
   # Partager avec service account Google Sheets
   ```

4. **Setup Pinecone:**
   ```bash
   # Créer index "prolex-rag"
   # Dimensions: 1536 (pour text-embedding-3-small)
   # Metric: cosine
   # Pods: 1 (starter)
   ```

5. **Importer workflows dans n8n:**
   ```bash
   # Option 1: Via UI
   Settings > Import from File > Sélectionner 010_*.json et 020_*.json

   # Option 2: Via ce workflow lui-même (bootstrap)
   # Pusher les workflows sur GitHub
   # Webhook se déclenchera automatiquement
   ```

6. **Configurer webhook GitHub:**
   ```bash
   # Repo > Settings > Webhooks > Add webhook
   # URL: https://your-n8n.com/webhook/github-to-n8n-v2
   # Secret: [même valeur que GITHUB_WEBHOOK_SECRET]
   # Events: Push
   ```

7. **Tester:**
   ```bash
   # Test 010: Push un fichier dans n8n-workflows/
   git add n8n-workflows/test.json
   git commit -m "test: workflow sync"
   git push

   # Test 020: Trigger manuel dans n8n
   # Ou attendre 2am UTC
   ```

---

## 📊 Monitoring & Alertes

### Dashboards recommandés

**Google Sheets:**
- Vue `github_sync_audit` : filtre sur dernières 24h, groupé par status
- Vue `rag_refresh_log` : trend du success_rate, durée moyenne

**Slack Channels:**
- `#prolex-sync-alerts` : erreurs GitHub sync
- `#prolex-rag-status` : résumés nightly RAG rebuild

### Métriques clés

| Métrique | Seuil OK | Seuil WARNING | Seuil CRITICAL |
|----------|----------|---------------|----------------|
| Sync success rate | > 95% | 90-95% | < 90% |
| RAG success rate | > 98% | 95-98% | < 95% |
| RAG duration | < 20 min | 20-45 min | > 45 min |
| Errors per day | < 5 | 5-20 | > 20 |

### Alertes à configurer

```javascript
// Dans n8n, créer workflow "999_alerting_rules.json"
// Exemple: Alerter si > 10 erreurs en 24h

SELECT COUNT(*) FROM github_sync_audit
WHERE error = true
  AND timestamp_utc > NOW() - INTERVAL '24 hours'
HAVING COUNT(*) > 10
→ Slack alert to @oncall
```

---

## 🔧 Troubleshooting

### Problème: GitHub sync échoue avec "Invalid signature"

**Cause:** HMAC signature mismatch

**Solution:**
```bash
# Vérifier que le secret est identique
echo $GITHUB_WEBHOOK_SECRET
# Dans GitHub webhook settings > Secret

# Désactiver temporairement la validation
ENABLE_SIGNATURE_VALIDATION=false

# Vérifier rawBody est activé dans webhook node
```

---

### Problème: Workflow n'est pas créé/updaté dans n8n

**Cause:** API key incorrecte ou permissions

**Solution:**
```bash
# Tester API key
curl https://your-n8n.com/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_PROD_API_KEY"

# Vérifier permissions du token
# Owner ou Admin requis

# Vérifier URL correcte
echo $N8N_PROD_URL  # Pas de trailing slash
```

---

### Problème: RAG embeddings timeout

**Cause:** Repo trop gros, batch size trop grand

**Solution:**
```bash
# Réduire batch size
RAG_BATCH_SIZE=25  # Au lieu de 50

# Augmenter timeout workflow
settings.executionTimeout=7200  # 2 heures

# Mode incrémental (seulement fichiers modifiés)
RAG_INCREMENTAL_MODE=true
```

---

### Problème: Rate limit OpenAI

**Cause:** Trop de requêtes embeddings

**Solution:**
```bash
# Réduire batch size
RAG_BATCH_SIZE=25

# Ou upgrade plan OpenAI
# Tier 1: 3,000 RPM
# Tier 2: 3,500 RPM
# Tier 3: 5,000 RPM

# Ou switch vers autre modèle
EMBEDDING_MODEL=text-embedding-ada-002  # Plus ancien, moins cher
```

---

### Problème: Pinecone upsert fails

**Cause:** Index plein, metadata trop grosse, dimension mismatch

**Solution:**
```bash
# Vérifier stats Pinecone
curl https://$PINECONE_INDEX-$PINECONE_ENVIRONMENT.svc.pinecone.io/describe_index_stats \
  -H "Api-Key: $PINECONE_API_KEY"

# Vérifier dimensions
# text-embedding-3-small: 1536
# text-embedding-3-large: 3072

# Limiter metadata size
# Code limite déjà à 40KB, mais peut réduire
```

---

## 🎓 Best Practices

### Pour GitHub Sync

1. **Toujours tester sur branche non-main d'abord**
   ```bash
   git checkout -b test-workflow
   # Push vers dev env
   # Vérifier logs
   # Merge vers main
   ```

2. **Utiliser tags sémantiques dans workflows**
   ```json
   {
     "tags": ["automation", "production", "v2.0"]
   }
   ```

3. **Commenter changements complexes**
   ```json
   {
     "nodes": [{
       "notes": "Cette node gère les retry avec backoff exponentiel"
     }]
   }
   ```

### Pour RAG Embeddings

1. **Commencer par mode manuel**
   ```bash
   # Désactiver schedule
   # Trigger manuel via UI
   # Vérifier résultats
   # Activer schedule après validation
   ```

2. **Monitorer coûts OpenAI**
   ```bash
   # text-embedding-3-small: $0.02 / 1M tokens
   # 1 token ≈ 4 caractères
   # 1000 chunks * 1000 chars = 250K tokens = $0.005
   ```

3. **Optimiser chunking**
   ```bash
   # Trop petit (< 500 chars): perte contexte
   # Trop gros (> 2000 chars): contexte dilué
   # Optimal: 800-1200 chars
   ```

---

## 📚 Ressources

### Documentation officielle

- [n8n Docs](https://docs.n8n.io/)
- [GitHub Webhooks](https://docs.github.com/webhooks)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Pinecone Docs](https://docs.pinecone.io/)

### Support Prolex

- **Issues GitHub:** https://github.com/ProlexAi/Prolex/issues
- **Slack:** #prolex-support
- **Email:** support@prolex.ai

---

## 🎉 Prochaines étapes

Workflows à créer ensuite :

- `030_github-issue-to-linear.json` : Sync GitHub Issues → Linear
- `040_slack-to-notion.json` : Archive Slack → Notion
- `050_weekly-metrics.json` : Rapport hebdomadaire KPIs
- `060_backup-all-data.json` : Backup complet (DB, Sheets, Pinecone)

---

**🚀 Happy Automating!**

*Prolex Team - Making AI Infrastructure Bulletproof*
