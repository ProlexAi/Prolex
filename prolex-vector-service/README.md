# Prolex Vector Service

Service de vectorisation et mémoire long-terme pour l'agent IA Prolex.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
  - [Créer une collection](#créer-une-collection)
  - [Ajouter des documents](#ajouter-des-documents)
  - [Rechercher des documents](#rechercher-des-documents)
  - [Debug et statistiques](#debug-et-statistiques)
- [Cas d'usage](#cas-dusage)
- [API Reference](#api-reference)
- [Providers d'embeddings](#providers-dembed dings)
- [Développement](#développement)

---

## 🎯 Vue d'ensemble

**Prolex Vector Service** est un service backend qui fournit une mémoire long-terme sémantique à l'agent IA Prolex. Il permet de :

1. **Vectoriser** du texte technique (n8n, code, erreurs) et documentaire (procédures, documents clients)
2. **Stocker** les embeddings avec des métadonnées riches dans PostgreSQL + pgvector
3. **Rechercher** sémantiquement avec des filtres avancés (domaine, type, tags, client)
4. **Servir de base RAG** pour améliorer les réponses de Prolex

### Contexte

Prolex doit pouvoir comprendre profondément :

- **Partie TECHNIQUE** : n8n (nodes, patterns, workflows), code (JS/TS, API), erreurs globales
- **Documents** : procédures internes, documents clients, templates, notes de travail

Ce service centralise cette connaissance sous forme vectorielle pour des recherches sémantiques rapides et ciblées.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Prolex Agent                       │
│           (Claude 3.5 Sonnet + RAG)                 │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP API
                   ↓
┌─────────────────────────────────────────────────────┐
│           Prolex Vector Service                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Express API  │→ │ Preprocessor │→ │ Embedding │ │
│  └──────────────┘  └──────────────┘  │ Provider  │ │
│                                       └───────────┘ │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│         PostgreSQL + pgvector                       │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │ collections  │  │ documents (+ embeddings)     │ │
│  └──────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Collections & Documents

- **Collection** : groupe logique de documents (ex: `n8n_nodes_docs`, `internal_docs`, `error_guides`)
  - Attributs : `name`, `domain` (n8n/tech/docs/business), `type` (node_doc/error_guide/procedure...)
- **Document** : texte vectorisé avec embedding + métadonnées riches
  - Attributs : `content`, `metadata` (tags, client, source...), `embedding` (vector 1536)

---

## 🚀 Installation

### Prérequis

- **Node.js** >= 18
- **PostgreSQL** >= 14 avec extension **pgvector**
- **npm** ou **yarn**

### Étapes

1. **Cloner le projet**

```bash
git clone <repo-url>
cd prolex-vector-service
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer l'environnement**

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

4. **Créer la base de données PostgreSQL**

```bash
createdb prolex_vectors
```

5. **Installer pgvector**

```bash
# macOS (Homebrew)
brew install pgvector

# Ubuntu/Debian
sudo apt-get install postgresql-14-pgvector

# Ou via SQL dans psql
psql -d prolex_vectors -c "CREATE EXTENSION vector;"
```

6. **Exécuter les migrations**

```bash
npm run migrate
```

7. **Démarrer le serveur**

```bash
# Développement (avec hot-reload)
npm run dev

# Production
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000` par défaut.

---

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Base de données
DATABASE_URL=postgres://user:password@localhost:5432/prolex_vectors

# Serveur
PORT=3000
NODE_ENV=development

# Embeddings
EMBEDDING_MODEL=mock              # mock | claude | openai
# ANTHROPIC_API_KEY=sk-ant-xxx   # Pour Claude embeddings (quand disponible)

# CORS (optionnel)
# CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Modèles d'embeddings disponibles

| Modèle | Description | Dimension |
|--------|-------------|-----------|
| `mock` | Embeddings pseudo-aléatoires déterministes (dev) | 1536 |
| `claude` | Anthropic Claude (TODO: non implémenté) | 1536 |
| `openai` | OpenAI text-embedding-3-small (TODO) | 1536 |

> **Note** : Pour la production, remplacez `mock` par un vrai modèle d'embeddings (voir section [Providers d'embeddings](#providers-dembed dings)).

---

## 📚 Utilisation

### Créer une collection

Une collection regroupe des documents par domaine et type.

#### Exemple 1 : Collection pour la documentation n8n

```bash
curl -X POST http://localhost:3000/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "n8n_nodes_docs",
    "domain": "n8n",
    "type": "node_doc",
    "metadata": {
      "description": "Documentation officielle des nodes n8n",
      "source": "https://docs.n8n.io"
    }
  }'
```

#### Exemple 2 : Collection pour les procédures internes

```bash
curl -X POST http://localhost:3000/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "internal_docs",
    "domain": "docs",
    "type": "procedure",
    "metadata": {
      "description": "Procédures internes Automatt.ai",
      "owner": "Matthieu"
    }
  }'
```

#### Exemple 3 : Collection pour les guides d'erreurs

```bash
curl -X POST http://localhost:3000/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "global_error_guides",
    "domain": "tech",
    "type": "error_guide",
    "metadata": {
      "description": "Guides de résolution d'erreurs techniques et n8n"
    }
  }'
```

#### Lister toutes les collections

```bash
curl http://localhost:3000/collections
```

---

### Ajouter des documents

#### Exemple 1 : Ajouter des docs n8n (nodes, patterns, erreurs)

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "n8n_nodes_docs",
    "documents": [
      {
        "content": "HTTP Request Node: Permet de faire des requêtes HTTP GET, POST, PUT, DELETE. Supporte les retry automatiques et les timeouts configurables. Best practice: toujours activer les retry avec backoff exponentiel pour gérer les erreurs réseau.",
        "metadata": {
          "source": "official_docs",
          "tags": ["http", "retry", "timeout"],
          "importance": "high"
        }
      },
      {
        "content": "Webhook Node: Déclenche un workflow via une URL webhook. Modes disponibles: 'Webhook' (production) et 'Test Webhook' (dev). Attention aux timeouts: 120s max par défaut.",
        "metadata": {
          "source": "official_docs",
          "tags": ["webhook", "trigger", "timeout"]
        }
      }
    ]
  }'
```

#### Exemple 2 : Ajouter des procédures internes

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "internal_docs",
    "documents": [
      {
        "content": "Procédure d'onboarding client: 1) Audit initial, 2) Cahier des charges, 3) Validation budget, 4) Kick-off meeting, 5) Mise en place des outils, 6) Formation.",
        "metadata": {
          "type": "procedure",
          "tags": ["onboarding", "client", "process"],
          "author": "Matthieu"
        }
      }
    ]
  }'
```

#### Exemple 3 : Ajouter des guides d'erreurs

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "global_error_guides",
    "documents": [
      {
        "content": "Erreur 'Connection Timeout' dans n8n HTTP Request: Causes possibles: 1) API externe lente, 2) Firewall bloque la requête, 3) DNS resolution échoue. Solutions: 1) Augmenter timeout dans les settings du node, 2) Activer retry avec backoff, 3) Vérifier les credentials et permissions.",
        "metadata": {
          "error_code": "CONNECTION_TIMEOUT",
          "tags": ["timeout", "http", "retry", "n8n"],
          "severity": "medium"
        }
      }
    ]
  }'
```

> **Note** : Le preprocessor enrichit automatiquement les métadonnées en détectant le domaine, type et tags dans le contenu.

---

### Rechercher des documents

La recherche sémantique utilise la similarité cosinus entre l'embedding de la requête et ceux des documents.

#### Exemple 1 : Recherche dans la doc n8n

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "n8n_nodes_docs",
    "query": "Comment gérer les timeouts dans les requêtes HTTP ?",
    "topK": 3
  }'
```

#### Exemple 2 : Recherche dans les guides d'erreurs avec filtre

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "global_error_guides",
    "query": "erreur de timeout",
    "topK": 5,
    "filter": {
      "tags": ["timeout", "n8n"]
    }
  }'
```

#### Exemple 3 : Recherche filtrée par client

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "internal_docs",
    "query": "procédure onboarding",
    "topK": 3,
    "filter": {
      "client": "ClientX"
    }
  }'
```

#### Exemple de réponse

```json
{
  "collection": "n8n_nodes_docs",
  "query": "Comment gérer les timeouts dans les requêtes HTTP ?",
  "filter": null,
  "results_count": 2,
  "results": [
    {
      "id": "uuid-1",
      "content": "HTTP Request Node: Permet de faire des requêtes HTTP GET, POST, PUT, DELETE. Supporte les retry automatiques et les timeouts configurables...",
      "metadata": {
        "source": "official_docs",
        "tags": ["http", "retry", "timeout"],
        "importance": "high"
      },
      "score": 0.892
    },
    {
      "id": "uuid-2",
      "content": "Webhook Node: Déclenche un workflow via une URL webhook. Modes disponibles: 'Webhook' (production) et 'Test Webhook' (dev). Attention aux timeouts: 120s max par défaut.",
      "metadata": {
        "source": "official_docs",
        "tags": ["webhook", "trigger", "timeout"]
      },
      "score": 0.734
    }
  ]
}
```

---

### Debug et statistiques

#### Statistiques d'une collection

```bash
curl http://localhost:3000/debug/n8n_nodes_docs
```

Réponse :

```json
{
  "collection": "n8n_nodes_docs",
  "documents_count": 42,
  "last_insert_at": "2025-11-23T10:30:00Z",
  "domains_detected": ["n8n"],
  "types_detected": ["node_doc"],
  "top_tags": [
    "http",
    "webhook",
    "retry",
    "timeout",
    "trigger",
    "credentials",
    "expressions"
  ]
}
```

#### Lister les documents d'une collection

```bash
curl http://localhost:3000/debug/n8n_nodes_docs/documents?limit=5
```

---

## 🎯 Cas d'usage

### Cas 1 : Prolex cherche dans la doc n8n

**Scénario** : Prolex reçoit une question sur les erreurs de timeout dans n8n.

**Solution** :
1. Prolex formule une requête : `"timeout error in n8n http request"`
2. Appelle `/search` avec `collection=n8n_nodes_docs` et `filter={tags: ["timeout", "http"]}`
3. Récupère les 3 documents les plus pertinents
4. Utilise ces documents comme contexte RAG pour sa réponse

### Cas 2 : Prolex recherche une procédure client

**Scénario** : Prolex doit onboarder un nouveau client.

**Solution** :
1. Recherche dans `collection=internal_docs` avec `query="onboarding client"`
2. Filtre par `type=procedure`
3. Récupère la procédure étape par étape
4. Suit le process défini

### Cas 3 : Prolex débug une erreur globale

**Scénario** : Workflow n8n échoue avec `Connection Timeout`.

**Solution** :
1. Recherche dans `collection=global_error_guides` avec `query="connection timeout"`
2. Filtre par `error_code=CONNECTION_TIMEOUT` ou `tags=["timeout"]`
3. Récupère les causes et solutions connues
4. Applique les solutions proposées

---

## 📖 API Reference

### Collections

#### `POST /collections`

Crée une nouvelle collection.

**Body** :
```json
{
  "name": "string",          // Nom unique de la collection
  "domain": "string",        // n8n | tech | docs | business
  "type": "string",          // node_doc | error_guide | procedure | client_file | ...
  "metadata": { }            // (optionnel) Métadonnées libres
}
```

**Réponse** : `201 Created`
```json
{
  "id": "uuid",
  "name": "n8n_nodes_docs",
  "domain": "n8n",
  "type": "node_doc",
  "metadata": { },
  "created_at": "2025-11-23T10:00:00Z",
  "updated_at": "2025-11-23T10:00:00Z"
}
```

#### `GET /collections`

Liste toutes les collections.

**Réponse** : `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "n8n_nodes_docs",
    "domain": "n8n",
    "type": "node_doc",
    "metadata": { },
    "created_at": "2025-11-23T10:00:00Z",
    "updated_at": "2025-11-23T10:00:00Z"
  }
]
```

#### `GET /collections/:name`

Récupère une collection par son nom.

#### `DELETE /collections/:name`

Supprime une collection et tous ses documents.

---

### Documents

#### `POST /documents`

Ajoute des documents à une collection.

**Body** :
```json
{
  "collection": "string",    // Nom de la collection
  "documents": [
    {
      "content": "string",   // Texte du document
      "metadata": { }        // (optionnel) Métadonnées (tags, source, client...)
    }
  ]
}
```

**Réponse** : `201 Created`
```json
{
  "collection": "n8n_nodes_docs",
  "documents_created": 2,
  "documents": [
    {
      "id": "uuid",
      "content_preview": "HTTP Request Node: Permet de...",
      "metadata": { "tags": ["http", "retry"], "domain": "n8n" }
    }
  ]
}
```

#### `GET /documents/:id`

Récupère un document par son ID.

#### `DELETE /documents/:id`

Supprime un document.

---

### Search

#### `POST /search`

Recherche sémantique dans une collection.

**Body** :
```json
{
  "collection": "string",    // Nom de la collection
  "query": "string",         // Requête en langage naturel
  "topK": 5,                 // (optionnel) Nombre de résultats (défaut: 5)
  "filter": {                // (optionnel) Filtres
    "domain": "string",      // Filtre par domaine
    "type": "string",        // Filtre par type
    "tags": ["string"],      // Filtre par tags (union)
    "client": "string"       // Filtre par client
  }
}
```

**Réponse** : `200 OK`
```json
{
  "collection": "n8n_nodes_docs",
  "query": "timeout http",
  "filter": { "tags": ["timeout"] },
  "results_count": 2,
  "results": [
    {
      "id": "uuid",
      "content": "...",
      "metadata": { },
      "score": 0.892
    }
  ]
}
```

---

### Debug

#### `GET /debug/:collection`

Statistiques diagnostiques d'une collection.

**Réponse** : `200 OK`
```json
{
  "collection": "n8n_nodes_docs",
  "documents_count": 42,
  "last_insert_at": "2025-11-23T10:30:00Z",
  "domains_detected": ["n8n"],
  "types_detected": ["node_doc"],
  "top_tags": ["http", "webhook", "retry"]
}
```

#### `GET /debug/:collection/documents?limit=10`

Liste les documents d'une collection (pour debug).

---

## 🧠 Providers d'embeddings

### MockEmbeddingProvider (Développement)

Provider par défaut pour le développement. Génère des embeddings pseudo-aléatoires mais **déterministes** (même texte → même embedding).

- **Dimension** : 1536
- **Avantages** : Rapide, aucune API requise
- **Inconvénients** : Pas de vraie sémantique

### ClaudeEmbeddingProvider (TODO)

Provider pour Anthropic Claude.

**Note** : Anthropic ne propose pas encore d'API d'embeddings native. Options :

1. **Voyage AI** (recommandé par Anthropic)
   - API : https://docs.voyageai.com/
   - Modèle : `voyage-large-2` (1536 dim)
   - Intégration simple avec API REST

2. **OpenAI**
   - Modèle : `text-embedding-3-small` (1536 dim)
   - API : https://platform.openai.com/docs/guides/embeddings

#### Exemple d'intégration avec Voyage AI

1. **Installer le client HTTP** (déjà inclus dans Node.js)

2. **Éditer `src/embeddings/ClaudeEmbeddingProvider.ts`** :

```typescript
async getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'voyage-large-2',
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}
```

3. **Configurer `.env`** :

```env
EMBEDDING_MODEL=claude
ANTHROPIC_API_KEY=your-voyage-api-key
```

4. **Redémarrer le serveur**

---

## 🛠️ Développement

### Structure du projet

```
prolex-vector-service/
├── src/
│   ├── index.ts                    # Point d'entrée
│   ├── server.ts                   # Configuration Express
│   ├── db.ts                       # Connexion PostgreSQL
│   ├── types.ts                    # Types TypeScript + Zod schemas
│   ├── preprocessors.ts            # Nettoyage et enrichissement
│   ├── embeddings/
│   │   ├── EmbeddingProvider.ts    # Interface
│   │   ├── MockEmbeddingProvider.ts
│   │   ├── ClaudeEmbeddingProvider.ts
│   │   └── index.ts
│   ├── repositories/
│   │   ├── collectionsRepo.ts
│   │   └── documentsRepo.ts
│   └── routes/
│       ├── collectionsRoutes.ts
│       ├── documentsRoutes.ts
│       ├── searchRoutes.ts
│       └── debugRoutes.ts
├── migrations/
│   └── 001_init.sql                # Migration PostgreSQL
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Scripts NPM

```bash
npm run dev         # Développement avec hot-reload (tsx watch)
npm run build       # Compile TypeScript → dist/
npm start           # Lance le serveur compilé
npm run migrate     # Exécute les migrations SQL
npm run type-check  # Vérification TypeScript
npm run lint        # ESLint
```

### Tests

```bash
# Health check
curl http://localhost:3000/health

# Réponse attendue
{
  "status": "ok",
  "timestamp": "2025-11-23T10:00:00Z",
  "embedding_model": "mock-embedding-v1",
  "embedding_dimension": 1536
}
```

### Ajouter un nouveau provider d'embeddings

1. Créer `src/embeddings/MyEmbeddingProvider.ts` implémentant `EmbeddingProvider`
2. Ajouter le provider dans `src/embeddings/index.ts` (fonction `createEmbeddingProvider`)
3. Ajouter le type dans `src/types.ts` (`EmbeddingConfig.model`)
4. Configurer `.env` avec `EMBEDDING_MODEL=my_provider`

---

## 🔒 Sécurité

- **Validation** : Tous les inputs sont validés via Zod schemas
- **SQL Injection** : Protection via parameterized queries (pg)
- **CORS** : Configurable via `CORS_ORIGIN`
- **Helmet** : Headers de sécurité HTTP
- **Erreurs structurées** : Pas de leak d'infos sensibles (stack traces en dev seulement)

---

## 📝 Licence

MIT

---

## 🤝 Support

Pour toute question ou amélioration :

- **GitHub Issues** : <repo-url>/issues
- **Email** : matthieu@automatt.ai

---

**Développé avec ❤️ pour Prolex par Automatt.ai**
