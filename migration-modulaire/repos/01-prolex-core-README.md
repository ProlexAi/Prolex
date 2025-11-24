# 🧠 Prolex Core

> **Cerveau orchestrateur central du système Prolex**
> **Repository**: `ProlexAi/prolex-core`
> **Visibilité**: 🔒 PRIVÉ
> **Langage principal**: TypeScript/Node.js

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Rôle et responsabilités](#rôle-et-responsabilités)
- [Pour les IA développeurs](#pour-les-ia-développeurs)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API](#api)
- [Tests](#tests)
- [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

**Prolex Core** est le cerveau orchestrateur central qui:
- Reçoit les `KimmyPayload` depuis Kimmy
- Prend des décisions autonomes basées sur le contexte
- Sélectionne les outils appropriés selon les niveaux d'autonomie
- Génère des `ProlexOutput` pour Opex
- Maintient le contexte conversationnel et la mémoire

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Orchestration**: Coordination entre Kimmy (entrée) et Opex (exécution)
2. **Décision**: Analyse contexte + RAG → choix d'outils et actions
3. **Autonomie**: Contrôle des permissions selon niveaux 0-3
4. **Contexte**: Gestion mémoire conversationnelle et état système
5. **Validation**: Validation schémas JSON (entrée/sortie)

### Ne fait PAS partie de ce repo

- ❌ Classification d'intent (→ `prolex-kimmy`)
- ❌ Exécution de workflows (→ `prolex-opex`)
- ❌ Base vectorielle RAG (→ `prolex-rag`)
- ❌ Serveurs MCP (→ `prolex-mcp`)

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Orchestrateur principal** (`src/core/orchestrator.ts`)
  - Pipeline Kimmy → Prolex → Opex
  - Gestion des requêtes asynchrones
  - Error handling et retry logic

- [x] **Moteur de décision** (`src/core/decision-engine.ts`)
  - Analyse contexte + RAG + historique
  - Sélection d'outils selon intent et complexité
  - Planification multi-étapes

- [x] **Contrôleur d'autonomie** (`src/core/autonomy-controller.ts`)
  - Validation permissions par niveau (0-3)
  - Escalade vers humain si nécessaire
  - Logging des décisions d'autonomie

- [x] **Gestionnaire de contexte** (`src/core/context-manager.ts`)
  - Mémoire conversationnelle (court/moyen terme)
  - État du système (workflows actifs, tâches en cours)
  - Cache contexte pour performances

- [x] **API REST** (`src/api/routes/`)
  - POST `/api/v1/process` (Kimmy → Core)
  - GET `/api/v1/status` (État système)
  - GET `/api/v1/context/:userId` (Contexte utilisateur)
  - WebSocket `/ws/chat` (Chat temps réel)

- [x] **Clients intégrations** (`src/integrations/`)
  - `kimmy-client.ts` (Communication avec Kimmy)
  - `opex-client.ts` (Communication avec Opex)
  - `rag-client.ts` (Queries vers RAG)
  - `mcp-client.ts` (Appels MCP servers)

### Où coder

```
src/
├── core/              ← Logique orchestration et décision
├── integrations/      ← Clients pour autres modules
├── api/               ← API REST et WebSocket
├── models/            ← Schémas TypeScript + Zod
└── utils/             ← Helpers, logger, validators
```

### Comment coder

**Stack technique**:
- **Runtime**: Node.js 20+
- **Langage**: TypeScript 5+
- **Framework API**: Express.js
- **Validation**: Zod + AJV (JSON Schema)
- **Logging**: Winston
- **Tests**: Jest + Supertest
- **Database**: PostgreSQL (via Prisma)
- **Cache**: Redis

**Style guide**:
- Suivre [Airbnb TypeScript Style Guide](https://github.com/airbnb/javascript)
- ESLint + Prettier (configs dans `.eslintrc.json`)
- 100% des fonctions publiques documentées (JSDoc)
- Tests obligatoires (coverage > 80%)

**Conventions nommage**:
- Fichiers: `kebab-case.ts`
- Classes: `PascalCase`
- Fonctions: `camelCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Interfaces: préfixe `I` (ex: `IOrchestrator`)

### Dépendances

**Ce module dépend de**:
- `prolex-kimmy` (reçoit KimmyPayload)
- `prolex-rag` (queries RAG pour contexte)
- `prolex-mcp` (appels MCP servers si nécessaire)

**Modules qui dépendent de lui**:
- `prolex-opex` (reçoit ProlexOutput)
- `prolex-cli` (appels API)
- `prolex-apps` (dashboard, monitoring)

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────┐
│             PROLEX CORE                     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   API Layer (Express)               │   │
│  │   POST /api/v1/process              │   │
│  └───────────┬─────────────────────────┘   │
│              │                              │
│  ┌───────────▼─────────────────────────┐   │
│  │   Orchestrator                      │   │
│  │   - Receive KimmyPayload            │   │
│  │   - Coordinate processing           │   │
│  └───────────┬─────────────────────────┘   │
│              │                              │
│  ┌───────────▼─────────────────────────┐   │
│  │   Decision Engine                   │   │
│  │   - Analyze context                 │   │
│  │   - Query RAG                       │   │
│  │   - Select tools                    │   │
│  │   - Plan multi-step                 │   │
│  └───────────┬─────────────────────────┘   │
│              │                              │
│  ┌───────────▼─────────────────────────┐   │
│  │   Autonomy Controller               │   │
│  │   - Check level 0-3                 │   │
│  │   - Validate permissions            │   │
│  │   - Escalate if needed              │   │
│  └───────────┬─────────────────────────┘   │
│              │                              │
│  ┌───────────▼─────────────────────────┐   │
│  │   Generate ProlexOutput             │   │
│  │   - Format JSON                     │   │
│  │   - Validate schema                 │   │
│  └───────────┬─────────────────────────┘   │
│              │                              │
│  ┌───────────▼─────────────────────────┐   │
│  │   Opex Client                       │   │
│  │   - Send to Opex                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Flux de données

1. **Entrée**: `KimmyPayload` (JSON)
   ```json
   {
     "requestId": "uuid",
     "userId": "user123",
     "intent": "TASK_CREATE",
     "complexity": "simple",
     "context": {...},
     "extractedData": {...}
   }
   ```

2. **Traitement**:
   - Orchestrator reçoit payload
   - Decision Engine analyse + query RAG
   - Autonomy Controller valide permissions
   - Génération ProlexOutput

3. **Sortie**: `ProlexOutput` (JSON)
   ```json
   {
     "requestId": "uuid",
     "actions": [
       {
         "tool": "TASK_CREATE",
         "payload": {...},
         "validation": "pre_approved"
       }
     ],
     "reasoning": "...",
     "estimatedCost": 0.05
   }
   ```

---

## 📦 Installation

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm (gestionnaire de packages)

### Installation locale

```bash
# Clone
git clone git@github.com:ProlexAi/prolex-core.git
cd prolex-core

# Install dependencies
pnpm install

# Setup database
pnpm prisma migrate dev

# Copy env
cp .env.example .env
# Edit .env avec vos valeurs

# Start dev server
pnpm dev
```

### Variables d'environnement

```bash
# .env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/prolex

# Redis
REDIS_URL=redis://localhost:6379

# APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Services
KIMMY_URL=http://localhost:3001
OPEX_URL=http://localhost:3002
RAG_URL=http://localhost:3003

# Autonomy
PROLEX_AUTONOMY_LEVEL=2

# Logging
LOG_LEVEL=info
```

---

## ⚙️ Configuration

### Niveaux d'autonomie

Fichier: `config/autonomy-levels.yml`

```yaml
autonomy_levels:
  0:
    name: "Read-only"
    allowed_actions:
      - READ_DOCS
      - ANALYZE_LOGS
      - ANSWER_QUESTIONS
    requires_approval: []

  1:
    name: "Read + Logs"
    allowed_actions:
      - READ_DOCS
      - CREATE_LOGS
      - WEB_SEARCH
    requires_approval: []

  2:
    name: "Low-risk actions"
    allowed_actions:
      - TASK_CREATE
      - CALENDAR_EVENT
      - NOTE_CREATE
      - N8N_WORKFLOW_DESIGN
    requires_approval:
      - N8N_WORKFLOW_UPSERT

  3:
    name: "Advanced actions"
    allowed_actions:
      - N8N_WORKFLOW_UPSERT
      - CLIENT_WORKFLOWS
    requires_approval:
      - N8N_WORKFLOW_PROMOTE
      - RESTORE_BACKUP
```

### Outils disponibles

Fichier: `config/tools-permissions.yml`

Liste complète dans [`prolex-rag/knowledge-base/tools/tools.yml`](https://github.com/ProlexAi/prolex-rag)

---

## 🔌 API

### Endpoints

#### POST `/api/v1/process`

**Description**: Point d'entrée principal (reçoit KimmyPayload)

**Request**:
```json
{
  "requestId": "uuid",
  "userId": "user123",
  "intent": "TASK_CREATE",
  "complexity": "simple",
  "context": {
    "conversationHistory": []
  },
  "extractedData": {
    "taskTitle": "Faire X",
    "dueDate": "2025-12-01"
  }
}
```

**Response** (200 OK):
```json
{
  "requestId": "uuid",
  "status": "success",
  "actions": [
    {
      "tool": "TASK_CREATE",
      "payload": {
        "title": "Faire X",
        "dueDate": "2025-12-01"
      },
      "validation": "pre_approved"
    }
  ],
  "reasoning": "L'utilisateur demande la création d'une tâche simple.",
  "estimatedCost": 0.05
}
```

---

#### GET `/api/v1/status`

**Description**: État du système Prolex

**Response**:
```json
{
  "status": "healthy",
  "version": "4.0.0",
  "autonomyLevel": 2,
  "uptime": 86400,
  "services": {
    "kimmy": "connected",
    "opex": "connected",
    "rag": "connected"
  }
}
```

---

#### GET `/api/v1/context/:userId`

**Description**: Récupération contexte utilisateur

**Response**:
```json
{
  "userId": "user123",
  "conversationHistory": [...],
  "activeWorkflows": [],
  "preferences": {...}
}
```

---

### WebSocket

#### WS `/ws/chat`

**Description**: Chat temps réel avec Prolex

**Messages**:
- Client → Server: `{ type: "message", content: "..." }`
- Server → Client: `{ type: "response", content: "...", actions: [...] }`

---

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
pnpm test

# Tests unitaires uniquement
pnpm test:unit

# Tests d'intégration
pnpm test:integration

# Coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Structure des tests

```
tests/
├── unit/
│   ├── orchestrator.test.ts
│   ├── decision-engine.test.ts
│   └── autonomy-controller.test.ts
├── integration/
│   ├── api.test.ts
│   └── end-to-end.test.ts
└── fixtures/
    ├── kimmy-payloads/
    └── prolex-outputs/
```

### Couverture attendue

- **Objectif**: > 80% coverage
- **Critique**: orchestrator, decision-engine, autonomy-controller = 100%

---

## 🚀 Déploiement

### Docker

```bash
# Build image
docker build -t prolex-core:latest .

# Run container
docker run -d \
  --name prolex-core \
  -p 3000:3000 \
  --env-file .env \
  prolex-core:latest
```

### Docker Compose

Voir [`prolex-infra/docker/docker-compose.production.yml`](https://github.com/ProlexAi/prolex-infra)

### Production (VPS)

```bash
# Deploy via CI/CD (GitHub Actions)
# Ou manuellement:
cd /opt/prolex/prolex-core
git pull origin main
pnpm install --prod
pnpm build
pm2 restart prolex-core
```

---

## 📚 Documentation complète

- **Architecture système**: [`prolex-docs`](https://github.com/ProlexAi/prolex-docs)
- **API complète**: [`docs/API.md`](docs/API.md)
- **Guide contribution**: [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)
- **Guide déploiement**: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## 📝 Changelog

Voir [CHANGELOG.md](CHANGELOG.md)

---

## 📄 License

Propriétaire - Automatt.ai © 2025

---

## 👥 Contributeurs

- **Matthieu** - Architecte principal
- **Claude Code** - IA développeur

---

## 🔗 Liens utiles

- [Prolex Docs](https://github.com/ProlexAi/prolex-docs)
- [Kimmy](https://github.com/ProlexAi/prolex-kimmy)
- [Opex](https://github.com/ProlexAi/prolex-opex)
- [RAG](https://github.com/ProlexAi/prolex-rag)
- [MCP Servers](https://github.com/ProlexAi/prolex-mcp)
