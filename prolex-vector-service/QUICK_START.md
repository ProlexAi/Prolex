# Quick Start Guide

Guide de démarrage rapide pour Prolex Vector Service.

## Installation rapide (5 minutes)

### 1. Prérequis

```bash
# Vérifier Node.js >= 18
node --version

# Vérifier PostgreSQL >= 14
psql --version
```

### 2. Installation

```bash
# Cloner et installer
git clone <repo-url>
cd prolex-vector-service
npm install

# Créer la base de données
createdb prolex_vectors

# Installer pgvector (macOS)
brew install pgvector
# OU (Ubuntu/Debian)
# sudo apt-get install postgresql-14-pgvector

# Configurer l'environnement
cp .env.example .env
# Éditer .env si besoin

# Exécuter les migrations
npm run migrate

# Démarrer le serveur
npm run dev
```

Le serveur est prêt sur `http://localhost:3000` !

### 3. Test rapide

```bash
# Health check
curl http://localhost:3000/health

# Créer une collection de test
curl -X POST http://localhost:3000/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_collection",
    "domain": "tech",
    "type": "test",
    "metadata": {"description": "Collection de test"}
  }'

# Ajouter un document
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "test_collection",
    "documents": [
      {
        "content": "Ceci est un document de test pour la vectorisation.",
        "metadata": {"tags": ["test", "demo"]}
      }
    ]
  }'

# Rechercher
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "test_collection",
    "query": "document de test",
    "topK": 5
  }'
```

## Workflow complet : Documentation n8n

### Étape 1 : Créer une collection pour n8n

```bash
curl -X POST http://localhost:3000/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "n8n_knowledge",
    "domain": "n8n",
    "type": "mixed",
    "metadata": {
      "description": "Base de connaissance n8n (nodes, patterns, erreurs)"
    }
  }'
```

### Étape 2 : Ajouter des documents n8n

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "n8n_knowledge",
    "documents": [
      {
        "content": "HTTP Request Node permet de faire des requêtes HTTP. Options: GET, POST, PUT, DELETE, PATCH. Supporte retry automatique, timeout configurable, et authentication (Basic, OAuth2, Bearer). Best practice: toujours activer retry pour gérer les erreurs réseau transitoires.",
        "metadata": {
          "type": "node_doc",
          "tags": ["http", "retry", "authentication"]
        }
      },
      {
        "content": "Erreur Connection Timeout dans HTTP Request: Causes: 1) API externe lente ou down, 2) Firewall bloque, 3) Timeout trop court. Solutions: 1) Augmenter timeout (Settings > Timeout), 2) Activer retry avec backoff exponentiel, 3) Vérifier connectivity avec test simple.",
        "metadata": {
          "type": "error_guide",
          "error_code": "CONNECTION_TIMEOUT",
          "tags": ["timeout", "http", "troubleshooting"]
        }
      },
      {
        "content": "Pattern: Retry avec backoff exponentiel. Pour API externes instables, configurer: 1) Retry on Fail (3-5 fois), 2) Wait Between Tries: exponential backoff (2s, 4s, 8s), 3) Continue On Fail pour logger et notifier. Évite de surcharger l'API et améliore la résilience.",
        "metadata": {
          "type": "workflow_pattern",
          "tags": ["retry", "backoff", "resilience", "best-practice"]
        }
      }
    ]
  }'
```

### Étape 3 : Rechercher dans la base de connaissance

```bash
# Recherche générale
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "n8n_knowledge",
    "query": "comment gérer les timeouts http",
    "topK": 3
  }'

# Recherche filtrée par type
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "n8n_knowledge",
    "query": "timeout",
    "topK": 3,
    "filter": {
      "type": "error_guide"
    }
  }'

# Recherche filtrée par tags
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "n8n_knowledge",
    "query": "retry strategy",
    "topK": 3,
    "filter": {
      "tags": ["retry", "best-practice"]
    }
  }'
```

### Étape 4 : Statistiques

```bash
curl http://localhost:3000/debug/n8n_knowledge
```

## Intégration avec Prolex (RAG)

### Exemple de flow Prolex → Vector Service

```typescript
// Prolex reçoit une question
const userQuestion = "Comment résoudre un timeout dans n8n ?";

// 1. Prolex interroge le vector service
const searchResponse = await fetch('http://localhost:3000/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    collection: 'n8n_knowledge',
    query: userQuestion,
    topK: 3,
    filter: { tags: ['timeout'] }
  })
});

const { results } = await searchResponse.json();

// 2. Prolex utilise les résultats comme contexte RAG
const context = results.map(r => r.content).join('\n\n');

const prompt = `
Contexte (base de connaissance n8n):
${context}

Question utilisateur:
${userQuestion}

Réponds en te basant sur le contexte fourni.
`;

// 3. Prolex envoie à Claude avec le contexte enrichi
const answer = await claude.complete(prompt);
```

## Prochaines étapes

1. **Importer votre documentation** : scripts d'import bulk depuis Markdown, Google Docs, etc.
2. **Remplacer MockEmbeddingProvider** : intégrer Voyage AI ou OpenAI pour de vrais embeddings sémantiques
3. **Monitorer** : ajouter des métriques (nombre de requêtes, latence, coût embeddings)
4. **Sécuriser** : ajouter authentication (API key, JWT) si exposé publiquement

## Dépannage

### Erreur "pgvector extension not found"

```bash
# Installer pgvector
brew install pgvector  # macOS
# OU
sudo apt-get install postgresql-14-pgvector  # Ubuntu

# Puis réexécuter les migrations
npm run migrate
```

### Erreur "Database not initialized"

Vérifier que `DATABASE_URL` dans `.env` est correct :

```bash
# Test de connexion
psql $DATABASE_URL -c "SELECT 1;"
```

### Port 3000 déjà utilisé

Changer `PORT` dans `.env` :

```env
PORT=3001
```

---

**Besoin d'aide ?** Consultez le [README.md](README.md) complet ou ouvrez une issue.
