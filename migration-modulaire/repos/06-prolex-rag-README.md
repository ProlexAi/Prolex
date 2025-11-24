# 📚 Prolex RAG

> **Base vectorielle et Retrieval Augmented Generation**
> **Repository**: `ProlexAi/prolex-rag`
> **Visibilité**: 🔒 PRIVÉ
> **Langage principal**: TypeScript/Python

---

## 🎯 Vue d'ensemble

**Prolex RAG** gère la base de connaissance vectorielle:
- Ingestion documents (Google Drive, GitHub, local)
- Génération embeddings (OpenAI, Cohere)
- Stockage vectoriel (ChromaDB, Pinecone)
- Retrieval contextuel pour Prolex Core
- Synchronisation automatique avec sources

**Stack**: TypeScript/Python + ChromaDB/Pinecone + OpenAI Embeddings

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Ingestion**: Documents Drive, GitHub, local → parsing → chunking
2. **Embeddings**: Génération via OpenAI/Cohere
3. **Vector store**: Stockage ChromaDB ou Pinecone
4. **Retrieval**: Query → embeddings → top-k documents
5. **Sync**: Mise à jour automatique knowledge base

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Vector Service** (`src/vector-service/`)
  - Génération embeddings
  - CRUD vector store
  - Query avec filtres metadata

- [x] **Ingestion Pipeline** (`src/ingestion/`)
  - Google Drive sync (watch changes)
  - GitHub sync (webhooks)
  - Document parsing (MD, PDF, DOCX, JSON)
  - Chunking intelligent (semantic, overlap)
  - Metadata extraction

- [x] **Retrieval API** (`src/api/`)
  - POST `/api/v1/query` (retrieve docs)
  - POST `/api/v1/ingest` (add docs)
  - DELETE `/api/v1/delete` (remove docs)
  - GET `/api/v1/stats` (stats vector store)

- [x] **Knowledge Base** (`knowledge-base/`)
  - Catalogue outils (`tools/tools.yml`)
  - Règles Prolex (`rules/`)
  - Exemples (`examples/`)
  - Prompts système (`prompts/`)
  - Contextes projet (`contexts/`)

### Où coder

```
src/
├── vector-service/
│   ├── embeddings.ts      # Génération embeddings
│   ├── vector-store.ts    # CRUD ChromaDB/Pinecone
│   └── retriever.ts       # Retrieval + reranking
├── ingestion/
│   ├── google-drive-sync.ts
│   ├── github-sync.ts
│   ├── document-parser.ts # MD, PDF, DOCX
│   ├── chunker.ts         # Semantic chunking
│   └── metadata-extractor.ts
├── api/
│   ├── query.ts           # Query API
│   └── manage.ts          # Management API
└── utils/
    ├── embeddings-cache.ts
    └── logger.ts

knowledge-base/
├── tools/
│   └── tools.yml          # 30+ outils Prolex
├── rules/
│   ├── 01_REGLES_PRINCIPALES.md
│   └── 02_VARIABLES_ET_CONTEXTE.md
├── examples/
│   └── lead-example.json
├── prompts/
│   ├── system-prompts/
│   └── task-prompts/
└── contexts/
    └── project-contexts/
```

### Comment coder

**Stack**:
- **TypeScript**: Service principal, API
- **Python**: Parsing documents complexes (option)
- **ChromaDB** ou **Pinecone**: Vector store
- **OpenAI Embeddings**: text-embedding-3-small
- **LangChain**: Orchestration RAG

**Chunking strategy**:
```typescript
// Semantic chunking with overlap
const chunks = await semanticChunker.chunk(document, {
  maxTokens: 512,
  overlap: 50,
  separator: '\n\n'
});

// Add metadata
chunks.forEach(chunk => {
  chunk.metadata = {
    source: document.source,
    timestamp: Date.now(),
    type: document.type,
    category: detectCategory(chunk.content)
  };
});
```

**Retrieval**:
```typescript
// Query with filters
const results = await retriever.query({
  query: "Comment créer une tâche?",
  topK: 5,
  filter: {
    type: "tool",
    category: "productivity"
  }
});

// Rerank
const reranked = await reranker.rerank(results, query);
```

---

## 📦 Installation

```bash
git clone git@github.com:ProlexAi/prolex-rag.git
cd prolex-rag
pnpm install

# Setup vector store
docker run -d \
  --name chromadb \
  -p 8000:8000 \
  -v chroma-data:/chroma/chroma \
  chromadb/chroma:latest

# Ingest knowledge base
pnpm run ingest:all
```

### Variables d'environnement

```bash
OPENAI_API_KEY=sk-...
VECTOR_STORE=chromadb  # ou pinecone
CHROMADB_URL=http://localhost:8000
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=prolex-rag

GOOGLE_DRIVE_FOLDER_ID=...
GITHUB_REPO=ProlexAi/Prolex
```

---

## 🗂️ Knowledge Base

### Structure

```
knowledge-base/
├── tools/
│   └── tools.yml          # Catalogue complet (30+ outils)
│
├── rules/
│   ├── 01_REGLES_PRINCIPALES.md
│   │   - Règles comportement Prolex
│   │   - Garde-fous
│   │   - Niveaux autonomie
│   │
│   └── 02_VARIABLES_ET_CONTEXTE.md
│       - Variables système
│       - Contexte utilisateur
│       - Historique
│
├── examples/
│   ├── lead-example.json
│   ├── task-examples.json
│   └── workflow-examples.json
│
├── prompts/
│   ├── system-prompts/
│   │   ├── prolex-system.md
│   │   ├── kimmy-system.md
│   │   └── opex-system.md
│   │
│   └── task-prompts/
│       ├── task-create.md
│       ├── workflow-design.md
│       └── code-help.md
│
└── contexts/
    ├── project-automatt.md
    ├── client-contexts/
    └── technical-specs/
```

### Catalogue d'outils (tools.yml)

Extrait:
```yaml
tools:
  - id: TASK_CREATE
    name: "Créer une tâche"
    description: "Crée une tâche dans Todoist/Notion"
    category: productivity
    risk_level: low
    auto_allowed_levels: [1, 2, 3]
    payload_schema: "schemas/payloads/task_create.schema.json"
    examples:
      - input: "Crée une tâche 'Faire X demain'"
        output: {"taskId": "123", "title": "Faire X", "due": "2025-11-25"}

  - id: N8N_WORKFLOW_DESIGN
    name: "Designer un workflow n8n"
    description: "Prolex conçoit un workflow n8n"
    category: devops
    risk_level: medium
    auto_allowed_levels: [2, 3]
    # ...
```

---

## 🔄 Ingestion automatique

### Google Drive Watch

```typescript
// Watch dossier Drive pour nouveaux docs
const watcher = new DriveWatcher({
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  pollInterval: 60000 // 1 minute
});

watcher.on('file_created', async (file) => {
  console.log(`Nouveau fichier: ${file.name}`);
  await ingestDocument(file);
});

watcher.on('file_updated', async (file) => {
  console.log(`Fichier modifié: ${file.name}`);
  await updateDocument(file);
});

watcher.start();
```

### GitHub Sync

```bash
# Webhook GitHub → n8n → ingestion API
# Déclenché à chaque push sur prolex-docs, prolex-opex, etc.

POST /api/v1/ingest/github
{
  "repo": "ProlexAi/prolex-docs",
  "branch": "main",
  "files": ["docs/new-doc.md"]
}
```

---

## 🔍 API Retrieval

### POST `/api/v1/query`

**Description**: Retrieve documents pertinents

**Request**:
```json
{
  "query": "Comment créer une tâche avec Prolex?",
  "topK": 5,
  "filter": {
    "category": "productivity"
  }
}
```

**Response**:
```json
{
  "results": [
    {
      "content": "Pour créer une tâche, utilisez l'outil TASK_CREATE...",
      "metadata": {
        "source": "tools.yml",
        "type": "tool",
        "category": "productivity"
      },
      "score": 0.92
    },
    // ...
  ],
  "query_time_ms": 145
}
```

---

### POST `/api/v1/ingest`

**Description**: Ajouter documents à la knowledge base

**Request**:
```json
{
  "documents": [
    {
      "content": "Guide d'utilisation de...",
      "metadata": {
        "source": "guide.md",
        "type": "doc",
        "category": "guide"
      }
    }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "documents_added": 1,
  "embeddings_generated": 15
}
```

---

## 🧪 Tests

```bash
pnpm test
pnpm test:retrieval   # Tests retrieval accuracy
pnpm test:ingestion   # Tests ingestion pipeline
pnpm test:embeddings  # Tests embeddings generation
```

**Métriques**:
- Retrieval accuracy: > 90%
- Ingestion speed: < 5s par document
- Query latency: < 200ms

---

## 📊 Monitoring

### Stats vector store

```bash
GET /api/v1/stats

{
  "total_documents": 15234,
  "total_chunks": 48721,
  "categories": {
    "tools": 32,
    "rules": 15,
    "examples": 102,
    "docs": 14085
  },
  "storage_size_mb": 1250,
  "last_updated": "2025-11-24T10:30:00Z"
}
```

---

## 🚀 Déploiement

### Docker

```bash
docker-compose up -d

# Services:
# - prolex-rag (API)
# - chromadb (vector store)
# - redis (cache)
```

Voir: `prolex-infra/docker/docker-compose.yml`

---

## 📚 Documentation

- [Ingestion Pipeline](docs/INGESTION.md)
- [Retrieval Strategies](docs/RETRIEVAL.md)
- [Knowledge Base Structure](docs/KNOWLEDGE_BASE.md)

---

## 📄 License

Propriétaire - Automatt.ai © 2025
