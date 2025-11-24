# 🏗️ MASTER PLAN - ARCHITECTURE MODULAIRE PROLEX v4

> **Plan complet de restructuration de l'écosystème Prolex/Automatt.ai**
> **Date**: 2025-11-24
> **Version**: 1.0
> **Auteur**: Claude Code Assistant

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture GitHub (9 repositories)](#architecture-github-9-repositories)
3. [Architecture Bureau Windows](#architecture-bureau-windows)
4. [Architecture Google Drive](#architecture-google-drive)
5. [Plan de migration](#plan-de-migration)
6. [Optimisations pour IA développeurs](#optimisations-pour-ia-développeurs)
7. [Checklist d'implémentation](#checklist-dimplémentation)

---

## 🎯 VUE D'ENSEMBLE

### Objectifs de la restructuration

1. **Modularité**: Séparer le monolithe en 9 repositories indépendants et maintenables
2. **Clarté**: Chaque repo a un rôle unique et bien défini
3. **Scalabilité**: Architecture évolutive pour croissance future
4. **IA-friendly**: Optimisé pour développement par agents autonomes (Copilot, Claude Code, Prolex)
5. **Synchronisation**: Alignement 1:1 entre GitHub, Windows et Google Drive

### Principes directeurs

- **DRY** (Don't Repeat Yourself): Documentation centralisée, références croisées
- **Single Responsibility**: Chaque repo fait UNE chose, bien
- **Convention over Configuration**: Nomenclature stricte et cohérente
- **Documentation First**: READMEs complets avant le code
- **AI-First**: Tout doit être compréhensible par une IA sans question

---

## 🗂️ ARCHITECTURE GITHUB (9 REPOSITORIES)

### Vue d'ensemble de l'organisation

```
ProlexAi (GitHub Organization)
│
├── 01. prolex-core            [PRIVÉ]  ⭐ Cerveau orchestrateur
├── 02. prolex-kimmy           [PRIVÉ]  🧠 Filtre et classification
├── 03. prolex-opex            [PRIVÉ]  ⚙️ Workflows n8n et exécution
├── 04. prolex-mcp             [PUBLIC] 🔌 Serveurs MCP (intégrations)
├── 05. prolex-cli             [PUBLIC] 💻 Interface ligne de commande
├── 06. prolex-rag             [PRIVÉ]  📚 Base vectorielle et RAG
├── 07. prolex-apps            [PUBLIC] 🖥️ Applications Electron/Node
├── 08. prolex-infra           [PRIVÉ]  🏗️ Infrastructure (VPS, Docker, IaC)
└── 09. prolex-docs            [PUBLIC] 📖 Documentation technique globale
```

### Matrice de décision Public/Privé

| Repository | Visibilité | Raison |
|-----------|-----------|---------|
| `prolex-core` | PRIVÉ | Logique métier, secrets, orchestration |
| `prolex-kimmy` | PRIVÉ | Modèles, configs sensibles |
| `prolex-opex` | PRIVÉ | Workflows n8n avec données clients |
| `prolex-mcp` | PUBLIC | Serveurs MCP open-source réutilisables |
| `prolex-cli` | PUBLIC | Outil CLI partageable, pas de secrets |
| `prolex-rag` | PRIVÉ | Base de connaissance propriétaire |
| `prolex-apps` | PUBLIC | Applications desktop partageables |
| `prolex-infra` | PRIVÉ | Configs serveurs, IP, secrets |
| `prolex-docs` | PUBLIC | Documentation technique publique |

---

## 📦 DÉTAIL DES 9 REPOSITORIES

### 1️⃣ PROLEX-CORE (Cerveau orchestrateur)

**Rôle**: Logique centrale d'orchestration, gestion des contextes, décisions autonomes

**Structure**:
```
prolex-core/
├── README.md                    # Documentation principale
├── ARCHITECTURE.md              # Architecture interne
├── .env.example                 # Variables d'environnement
├── package.json / pyproject.toml
├── .github/
│   └── workflows/
│       ├── ci.yml               # Tests, linting
│       └── release.yml          # Publication versions
│
├── src/
│   ├── core/
│   │   ├── orchestrator.ts      # Orchestrateur principal
│   │   ├── decision-engine.ts   # Moteur de décision
│   │   ├── context-manager.ts   # Gestion contexte
│   │   └── autonomy-controller.ts # Niveaux autonomie
│   ├── integrations/
│   │   ├── kimmy-client.ts      # Client pour Kimmy
│   │   ├── opex-client.ts       # Client pour Opex
│   │   ├── rag-client.ts        # Client pour RAG
│   │   └── mcp-client.ts        # Client pour MCP servers
│   ├── api/
│   │   ├── routes/              # Routes API REST
│   │   └── webhooks/            # Webhooks entrants
│   ├── models/
│   │   ├── schemas/             # Schémas de données
│   │   └── types/               # Types TypeScript
│   └── utils/
│       ├── logger.ts            # Logging centralisé
│       ├── validators.ts        # Validateurs JSON Schema
│       └── helpers.ts
│
├── config/
│   ├── autonomy-levels.yml      # Définition niveaux autonomie
│   ├── system.yml               # Config système globale
│   └── tools-permissions.yml    # Permissions par outil
│
├── schemas/
│   ├── kimmy-payload.schema.json
│   ├── prolex-output.schema.json
│   └── context.schema.json
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/
    ├── API.md                   # Documentation API
    ├── DEPLOYMENT.md            # Guide déploiement
    └── CONTRIBUTING.md          # Guide contribution
```

**Dépendances**:
- `@modelcontextprotocol/sdk` (MCP)
- `anthropic` (Claude SDK)
- `express` (API)
- `ajv` (JSON Schema validation)
- `winston` (Logging)

**CI/CD**:
- Tests unitaires + integration
- Linting (ESLint/Prettier)
- Build Docker image
- Deploy sur VPS (production)

**Branches**:
- `main` (production)
- `develop` (dev)
- `feature/*` (features)
- `hotfix/*` (urgences)

**Ce que l'IA doit coder ici**:
- Logique d'orchestration entre Kimmy → Prolex → Opex
- Gestion des contextes et mémoire conversationnelle
- Moteur de décision (choix d'outils, planification)
- Contrôleur de niveaux d'autonomie
- API REST pour interactions externes
- Intégrations avec les autres modules

---

### 2️⃣ PROLEX-KIMMY (Filtre et classification)

**Rôle**: Pré-filtrage des requêtes, classification d'intent, actions rapides

**Structure**:
```
prolex-kimmy/
├── README.md
├── SPECIFICATION.md             # Spécification Kimmy v4
├── package.json
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
│
├── src/
│   ├── classifier/
│   │   ├── intent-classifier.ts  # Classification 13 intents
│   │   ├── complexity-evaluator.ts # Évaluation complexité
│   │   └── confidence-scorer.ts  # Scoring de confiance
│   ├── quick-actions/
│   │   ├── simple-responses.ts   # Réponses rapides
│   │   └── quick-tasks.ts        # Tâches simples
│   ├── models/
│   │   ├── kimmy-payload.ts      # Modèle KimmyPayload
│   │   └── intent-types.ts       # Types d'intents
│   ├── api/
│   │   └── webhook.ts            # Webhook d'entrée
│   └── utils/
│       ├── prompt-builder.ts     # Construction prompts
│       └── validators.ts
│
├── config/
│   ├── intents.yml               # Définition des 13 intents
│   ├── quick-actions.yml         # Actions rapides configurables
│   └── models.yml                # Config modèles LLM (GPT-4, Claude Haiku)
│
├── schemas/
│   ├── kimmy-input.schema.json
│   └── kimmy-payload.schema.json
│
├── prompts/
│   ├── system-prompt.md          # Prompt système Kimmy
│   ├── intent-classification.md  # Prompt classification
│   └── complexity-evaluation.md  # Prompt évaluation complexité
│
└── tests/
    ├── intents/                  # Tests par intent
    └── integration/
```

**Dépendances**:
- `openai` (GPT-4 Turbo)
- `anthropic` (Claude Haiku)
- `express` (API)
- `ajv` (Validation)

**CI/CD**:
- Tests classification (accuracy metrics)
- Validation schemas
- Deploy n8n workflow
- Mise à jour prompts

**Ce que l'IA doit coder ici**:
- Classification d'intent (13 catégories)
- Évaluation de complexité (simple/moyen/complexe)
- Actions rapides pour requêtes simples
- Génération de KimmyPayload
- Intégration avec n8n

---

### 3️⃣ PROLEX-OPEX (Workflows n8n et exécution)

**Rôle**: Bras exécutif, workflows n8n, Proxy Master, validation et exécution

**Structure**:
```
prolex-opex/
├── README.md
├── WORKFLOWS_CATALOG.md         # Catalogue complet des workflows
├── .github/workflows/
│   ├── sync-to-n8n.yml          # Sync GitHub → n8n
│   └── validate-workflows.yml   # Validation JSON workflows
│
├── workflows/
│   ├── 000-099-core/            # Workflows core
│   │   ├── 010_sync-github-to-n8n.json
│   │   ├── 020_proxy-master.json
│   │   └── 050_daily-maintenance.json
│   ├── 100-199-productivity/    # Productivité
│   │   ├── 100_task-create.json
│   │   ├── 110_calendar-event.json
│   │   └── 120_note-create.json
│   ├── 200-299-devops/          # Dev/DevOps
│   │   ├── 200_github-commit-analysis.json
│   │   └── 210_deploy-to-vps.json
│   ├── 300-399-clients/         # Workflows clients
│   │   └── 300_client-onboarding.json
│   ├── 400-499-monitoring/      # Monitoring
│   │   └── 400_health-check.json
│   ├── 500-599-reporting/       # Reporting
│   │   └── 500_weekly-report.json
│   ├── 600-699-n8n-admin/       # Admin n8n
│   │   ├── 600_workflow-backup.json
│   │   └── 610_workflow-test.json
│   └── 900-999-examples/        # Exemples/tests
│       └── 900_hello-world.json
│
├── proxy-master/
│   ├── routes.yml               # Routing des outils
│   ├── validation-rules.yml     # Règles de validation
│   └── guardrails.yml           # Garde-fous
│
├── schemas/
│   ├── workflow-metadata.schema.json
│   └── execution-result.schema.json
│
├── scripts/
│   ├── export-from-n8n.sh       # Export depuis n8n
│   ├── import-to-n8n.sh         # Import vers n8n
│   └── validate-all.sh          # Validation tous workflows
│
└── docs/
    ├── WORKFLOW_CONVENTIONS.md  # Conventions de nommage
    └── PROXY_MASTER.md          # Documentation Proxy Master
```

**Dépendances**:
- n8n API client
- JSON Schema validator
- GitHub API client

**CI/CD**:
- Validation JSON workflows
- Tests d'exécution (dry-run)
- Sync automatique GitHub → n8n
- Backup quotidien n8n → GitHub

**Ce que l'IA doit coder ici**:
- Workflows n8n (nodes, connections, logic)
- Proxy Master (routing, validation, guardrails)
- Scripts de synchronisation
- Tests d'exécution
- Documentation des workflows

**🚨 PROTECTION CASH WORKFLOWS**:
- INTERDICTION ABSOLUE de toucher workflows: `200_`, `250_`, `300_`, `400_`, `450_`, `999_master_*`
- Verrouillage technique automatique
- Alert Telegram immédiate en cas de violation

---

### 4️⃣ PROLEX-MCP (Serveurs MCP)

**Rôle**: Serveurs Model Context Protocol pour intégrations (n8n, Google Drive, GitHub, etc.)

**Structure**:
```
prolex-mcp/
├── README.md
├── LICENSE                      # MIT License
├── .github/workflows/
│   ├── test-all-servers.yml     # Tests tous serveurs
│   └── publish-npm.yml          # Publication NPM
│
├── packages/
│   ├── n8n-server/              # ✅ MCP n8n (existant)
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── n8nClient.ts
│   │   │   ├── tools/
│   │   │   └── types.ts
│   │   └── tests/
│   │
│   ├── google-drive-server/     # 🆕 MCP Google Drive
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── driveClient.ts
│   │   │   ├── tools/
│   │   │   │   ├── search.ts
│   │   │   │   ├── read.ts
│   │   │   │   ├── create.ts
│   │   │   │   └── update.ts
│   │   │   └── types.ts
│   │   └── tests/
│   │
│   ├── github-server/           # 🆕 MCP GitHub
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── githubClient.ts
│   │   │   ├── tools/
│   │   │   └── types.ts
│   │   └── tests/
│   │
│   ├── sheets-server/           # 🆕 MCP Google Sheets (SystemJournal)
│   │   └── ...
│   │
│   └── common/                  # Code partagé entre serveurs
│       ├── base-server.ts
│       ├── auth-helpers.ts
│       └── types.ts
│
├── docs/
│   ├── CREATING_NEW_SERVER.md   # Guide création serveur MCP
│   ├── TESTING.md               # Guide tests
│   └── DEPLOYMENT.md            # Publication NPM
│
└── examples/
    ├── claude-desktop-config.json # Config Claude Desktop
    └── usage-examples/
```

**Dépendances**:
- `@modelcontextprotocol/sdk`
- APIs spécifiques (Google Drive, GitHub, n8n, etc.)

**CI/CD**:
- Tests unitaires par serveur
- Tests d'intégration
- Publication NPM automatique
- Documentation auto-générée

**Ce que l'IA doit coder ici**:
- Nouveaux serveurs MCP pour intégrations tierces
- Tools MCP (search, read, create, update, etc.)
- Authentification OAuth2/API keys
- Tests et documentation
- Exemples d'utilisation

---

### 5️⃣ PROLEX-CLI (Interface ligne de commande)

**Rôle**: CLI pour interagir avec Prolex localement ou en production

**Structure**:
```
prolex-cli/
├── README.md
├── package.json
├── .github/workflows/
│   ├── test.yml
│   └── publish.yml              # NPM publication
│
├── src/
│   ├── index.ts                 # Entry point
│   ├── commands/
│   │   ├── init.ts              # prolex init
│   │   ├── chat.ts              # prolex chat
│   │   ├── workflow.ts          # prolex workflow [create|list|test]
│   │   ├── logs.ts              # prolex logs
│   │   ├── config.ts            # prolex config [get|set]
│   │   └── status.ts            # prolex status
│   ├── api/
│   │   └── client.ts            # API client Prolex Core
│   ├── ui/
│   │   ├── spinner.ts
│   │   ├── prompts.ts
│   │   └── formatters.ts
│   └── utils/
│       ├── config-manager.ts
│       └── auth.ts
│
├── config/
│   └── default-config.yml
│
└── docs/
    ├── COMMANDS.md              # Documentation commandes
    └── CONFIGURATION.md         # Configuration CLI
```

**Dépendances**:
- `commander` (CLI framework)
- `inquirer` (Prompts interactifs)
- `chalk` (Colors)
- `ora` (Spinners)
- `axios` (HTTP client)

**CI/CD**:
- Tests commandes
- Build binaires (pkg)
- Publication NPM
- Release GitHub

**Ce que l'IA doit coder ici**:
- Commandes CLI
- Interface utilisateur terminal
- Client API Prolex Core
- Configuration locale
- Documentation commandes

---

### 6️⃣ PROLEX-RAG (Base vectorielle et RAG)

**Rôle**: Base de connaissance vectorielle, ingestion documents, récupération contextuelle

**Structure**:
```
prolex-rag/
├── README.md
├── package.json / requirements.txt
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
│
├── src/
│   ├── vector-service/
│   │   ├── index.ts
│   │   ├── embeddings.ts        # Génération embeddings
│   │   ├── vector-store.ts      # ChromaDB/Pinecone
│   │   └── retriever.ts         # Récupération documents
│   ├── ingestion/
│   │   ├── google-drive-sync.ts # Sync depuis Drive
│   │   ├── document-parser.ts   # Parse MD, PDF, DOCX
│   │   ├── chunker.ts           # Chunking intelligent
│   │   └── metadata-extractor.ts
│   ├── api/
│   │   ├── query.ts             # API query
│   │   └── manage.ts            # API gestion docs
│   └── utils/
│       └── embeddings-cache.ts
│
├── knowledge-base/
│   ├── tools/
│   │   └── tools.yml            # Catalogue outils (source de vérité)
│   ├── rules/
│   │   ├── 01_REGLES_PRINCIPALES.md
│   │   └── 02_VARIABLES_ET_CONTEXTE.md
│   ├── examples/
│   │   └── lead-example.json
│   ├── prompts/
│   │   ├── system-prompts/
│   │   └── task-prompts/
│   └── contexts/
│       └── project-contexts/
│
├── config/
│   ├── vector-store.yml         # Config ChromaDB/Pinecone
│   ├── embeddings.yml           # Config OpenAI embeddings
│   └── ingestion-sources.yml    # Sources à indexer
│
└── scripts/
    ├── ingest-all.sh            # Ingestion complète
    ├── update-embeddings.sh     # Mise à jour embeddings
    └── backup-vectors.sh        # Backup vector store
```

**Dépendances**:
- `chromadb` ou `pinecone-client` (Vector store)
- `openai` (Embeddings)
- `langchain` (RAG orchestration)
- `pdfjs` / `mammoth` (Document parsing)

**CI/CD**:
- Tests RAG (retrieval accuracy)
- Ingestion automatique sur push
- Backup vector store
- Monitoring latence queries

**Ce que l'IA doit coder ici**:
- Service d'embeddings
- Ingestion de documents (Drive, GitHub, local)
- Retrieval augmented generation
- API de query
- Optimisation chunking
- Gestion metadata

---

### 7️⃣ PROLEX-APPS (Applications desktop)

**Rôle**: Applications Electron/Node pour Prolex (Atmtt Viewer, Dashboard, etc.)

**Structure**:
```
prolex-apps/
├── README.md
├── .github/workflows/
│   ├── build.yml                # Build multi-platform
│   └── release.yml              # Release binaires
│
├── packages/
│   ├── atmtt-viewer/            # ✅ Atmtt Viewer (existant)
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── electron/
│   │   │   ├── main.ts
│   │   │   └── preload.ts
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── public/
│   │   └── electron-builder.yml
│   │
│   ├── prolex-dashboard/        # 🆕 Dashboard Prolex
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── electron/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Workflows.tsx
│   │   │   │   ├── Logs.tsx
│   │   │   │   └── Config.tsx
│   │   │   └── components/
│   │   └── public/
│   │
│   └── prolex-tools-manager/    # 🆕 Gestionnaire outils Windows
│       └── ...
│
├── shared/                      # Code partagé
│   ├── components/              # Composants UI réutilisables
│   ├── hooks/
│   └── utils/
│
└── docs/
    ├── BUILDING.md              # Guide build
    └── PACKAGING.md             # Guide packaging
```

**Dépendances**:
- `electron`
- `react` / `vue`
- `electron-builder`
- `vite` (bundler)

**CI/CD**:
- Build Windows/Mac/Linux
- Tests E2E (Playwright)
- Release GitHub avec binaires
- Auto-update

**Ce que l'IA doit coder ici**:
- Applications Electron
- Interfaces utilisateur (React/Vue)
- Intégrations avec Prolex Core API
- Packaging multi-plateforme
- Auto-update

---

### 8️⃣ PROLEX-INFRA (Infrastructure)

**Rôle**: Infrastructure as Code, VPS, Docker, Traefik, scripts de déploiement

**Structure**:
```
prolex-infra/
├── README.md
├── .github/workflows/
│   ├── terraform-plan.yml
│   └── deploy-production.yml
│
├── terraform/                   # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/
│   │   ├── vps/
│   │   ├── network/
│   │   └── monitoring/
│   └── environments/
│       ├── production/
│       ├── staging/
│       └── development/
│
├── docker/
│   ├── docker-compose.production.yml
│   ├── docker-compose.staging.yml
│   ├── services/
│   │   ├── prolex-core/
│   │   │   └── Dockerfile
│   │   ├── n8n/
│   │   │   └── Dockerfile
│   │   ├── postgres/
│   │   ├── redis/
│   │   └── traefik/
│   └── volumes/
│
├── kubernetes/                  # 🔜 Futur K8s
│   ├── namespaces/
│   ├── deployments/
│   └── services/
│
├── scripts/
│   ├── bootstrap-vps.sh         # Init VPS from scratch
│   ├── deploy-prolex.sh         # Deploy Prolex stack
│   ├── backup-all.sh            # Backup complet
│   ├── restore-from-backup.sh
│   ├── update-ssl.sh            # Renouvellement SSL
│   └── monitoring-setup.sh
│
├── ansible/                     # Configuration management
│   ├── playbooks/
│   │   ├── setup-vps.yml
│   │   ├── deploy-app.yml
│   │   └── security-hardening.yml
│   ├── roles/
│   └── inventory/
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   └── dashboards/
│   └── alertmanager/
│       └── alerts.yml
│
└── docs/
    ├── VPS_SETUP.md             # Setup VPS complet
    ├── DEPLOYMENT.md            # Guide déploiement
    ├── BACKUP_RESTORE.md        # Backup/restore
    └── MONITORING.md            # Monitoring
```

**Dépendances**:
- Terraform
- Docker / Docker Compose
- Ansible
- Traefik
- Prometheus/Grafana

**CI/CD**:
- Terraform plan sur PR
- Deploy automatique production
- Tests infrastructure
- Backup automatique quotidien

**Ce que l'IA doit coder ici**:
- Infrastructure as Code (Terraform)
- Docker Compose pour tous services
- Scripts de déploiement
- Configuration Traefik (reverse proxy)
- Monitoring (Prometheus/Grafana)
- Ansible playbooks
- Documentation infrastructure

---

### 9️⃣ PROLEX-DOCS (Documentation globale)

**Rôle**: Documentation technique publique, guides, tutoriels, architecture

**Structure**:
```
prolex-docs/
├── README.md
├── .github/workflows/
│   ├── deploy-docs.yml          # Deploy sur GitHub Pages
│   └── check-links.yml          # Vérification liens
│
├── docs/
│   ├── index.md                 # Page d'accueil
│   │
│   ├── getting-started/
│   │   ├── introduction.md
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   └── first-workflow.md
│   │
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── kimmy.md
│   │   ├── prolex.md
│   │   ├── opex.md
│   │   ├── mcp-servers.md
│   │   └── data-flow.md
│   │
│   ├── guides/
│   │   ├── creating-workflows.md
│   │   ├── adding-tools.md
│   │   ├── autonomy-levels.md
│   │   ├── mcp-integration.md
│   │   └── troubleshooting.md
│   │
│   ├── api-reference/
│   │   ├── core-api.md
│   │   ├── kimmy-api.md
│   │   ├── opex-api.md
│   │   └── mcp-apis.md
│   │
│   ├── workflows/
│   │   ├── catalog.md
│   │   ├── conventions.md
│   │   └── examples/
│   │
│   ├── development/
│   │   ├── contributing.md
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   └── ci-cd.md
│   │
│   └── deployment/
│       ├── local-setup.md
│       ├── production.md
│       └── docker.md
│
├── static/
│   ├── images/
│   ├── diagrams/
│   └── videos/
│
├── blog/                        # Blog technique (optionnel)
│   └── 2025-11-24-prolex-v4.md
│
└── mkdocs.yml / docusaurus.config.js  # Config générateur docs
```

**Technologies**:
- MkDocs (Material theme) ou Docusaurus
- GitHub Pages
- Mermaid (diagrammes)

**CI/CD**:
- Build documentation
- Deploy GitHub Pages
- Vérification liens cassés
- Tests exemples de code

**Ce que l'IA doit coder ici**:
- Documentation technique complète
- Guides pas-à-pas
- API reference
- Tutoriels
- Diagrammes (Mermaid)
- Exemples de code

---

## 💻 ARCHITECTURE BUREAU WINDOWS

### Structure de dossiers recommandée

```
C:\Users\Matthieu\
│
├── 📁 Workspace\                           # Zone de développement
│   │
│   ├── 📁 Prolex\                          # Clones GitHub (9 repos)
│   │   ├── 📁 01-prolex-core\
│   │   ├── 📁 02-prolex-kimmy\
│   │   ├── 📁 03-prolex-opex\
│   │   ├── 📁 04-prolex-mcp\
│   │   ├── 📁 05-prolex-cli\
│   │   ├── 📁 06-prolex-rag\
│   │   ├── 📁 07-prolex-apps\
│   │   ├── 📁 08-prolex-infra\
│   │   └── 📁 09-prolex-docs\
│   │
│   └── 📁 Shared-Tools\                    # Outils partagés
│       ├── 📁 AI-Tools\                    # Outils pour IA
│       │   ├── copilot-configs\
│       │   ├── claude-configs\
│       │   └── prompts-library\
│       ├── 📁 Scripts\                     # Scripts utilitaires
│       │   ├── setup-dev-env.ps1
│       │   ├── sync-all-repos.ps1
│       │   └── backup-local.ps1
│       └── 📁 Configs\                     # Configs partagées
│           ├── .editorconfig
│           ├── .prettierrc
│           └── .eslintrc
│
├── 📁 Automatt\                            # Niveau business
│   │
│   ├── 📁 Docs\                            # Documentation interne
│   │   ├── 📁 Architecture\
│   │   ├── 📁 Processes\
│   │   └── 📁 Meetings\
│   │
│   ├── 📁 Clients\                         # Dossiers clients
│   │   ├── 📁 Client-A\
│   │   ├── 📁 Client-B\
│   │   └── 📁 Templates\                   # Templates clients
│   │
│   ├── 📁 Marketing\                       # Marketing Automatt
│   │   ├── 📁 Content\
│   │   ├── 📁 Campaigns\
│   │   └── 📁 Assets\
│   │
│   ├── 📁 Exports\                         # Exports n8n / outils
│   │   ├── 📁 Workflows\                   # Workflows exportés
│   │   ├── 📁 Reports\                     # Rapports générés
│   │   └── 📁 Backups\                     # Backups locaux
│   │
│   └── 📁 Templates\                       # Templates & boilerplates
│       ├── 📁 Workflow-Templates\
│       ├── 📁 Document-Templates\
│       └── 📁 Email-Templates\
│
├── 📁 Downloads\                           # Downloads (nettoyage auto)
│
├── 📁 Desktop\                             # Bureau (nettoyage auto)
│
└── 📁 Archive\                             # Archives
    ├── 📁 2024\
    ├── 📁 2025\
    └── 📁 Migration-Prolex-Monolithe\      # Ancien monolithe à trier
```

### Scripts d'automatisation Windows

**Voir section "Scripts Windows" ci-dessous pour les .bat, .ps1, .reg**

---

## ☁️ ARCHITECTURE GOOGLE DRIVE

### Structure alignée 1:1 avec GitHub

```
📁 Automatt - Prolex (Drive racine)/
│
├── 📁 01 - Prolex-Core/
│   ├── 📁 Docs/                            # Documentation Core
│   ├── 📁 Schemas/                         # Schémas JSON
│   ├── 📁 Configs/                         # Configs exportées
│   └── 📁 Logs/                            # Logs importants
│
├── 📁 02 - Prolex-Kimmy/
│   ├── 📁 Docs/
│   ├── 📁 Prompts/                         # Prompts système Kimmy
│   └── 📁 Training-Data/                   # Données d'entraînement
│
├── 📁 03 - Prolex-Opex/
│   ├── 📁 Workflows/                       # Workflows n8n (backup)
│   ├── 📁 Docs/
│   └── 📁 Execution-Logs/                  # Logs exécution
│
├── 📁 04 - Prolex-MCP/
│   ├── 📁 Docs/
│   └── 📁 Examples/                        # Exemples utilisation
│
├── 📁 05 - Prolex-CLI/
│   ├── 📁 Docs/
│   └── 📁 User-Guides/                     # Guides utilisateur
│
├── 📁 06 - Prolex-RAG/
│   ├── 📁 Knowledge-Base/                  # Base de connaissance
│   │   ├── 📁 Tools/
│   │   ├── 📁 Rules/
│   │   ├── 📁 Examples/
│   │   └── 📁 Contexts/
│   ├── 📁 Embeddings-Backups/              # Backups embeddings
│   └── 📁 Docs/
│
├── 📁 07 - Prolex-Apps/
│   ├── 📁 Docs/
│   └── 📁 Screenshots/                     # Screenshots apps
│
├── 📁 08 - Prolex-Infra/
│   ├── 📁 Docs/
│   ├── 📁 Architecture-Diagrams/
│   └── 📁 Deployment-Logs/                 # Logs déploiement
│
├── 📁 09 - Prolex-Docs/
│   ├── 📁 Public-Docs/                     # Docs publiques
│   └── 📁 Internal-Docs/                   # Docs internes
│
├── 📁 Contextes/                           # Contextes IA
│   ├── 📁 Contextes-Copilot/
│   ├── 📁 Contextes-Claude/
│   └── 📁 Contextes-Prolex/
│
├── 📁 Logs-Importants/                     # Logs critiques
│   ├── 📁 Incidents/
│   ├── 📁 Deployments/
│   └── 📁 Performance/
│
├── 📁 Schemas-Architecture/                # Schémas centralisés
│   ├── 📁 JSON-Schemas/
│   ├── 📁 Architecture-Diagrams/
│   └── 📁 Flow-Charts/
│
├── 📁 Prompts/                             # Bibliothèque prompts
│   ├── 📁 System-Prompts/
│   ├── 📁 Task-Prompts/
│   └── 📁 Templates/
│
└── 📁 Workflows-Backup/                    # Backup workflows n8n
    ├── 📁 Daily/
    ├── 📁 Weekly/
    └── 📁 Monthly/
```

### Synchronisation Drive ↔ GitHub

**Workflow n8n**: `sync-drive-github.json`

- **Déclencheur**: Modification fichier dans Drive
- **Actions**:
  1. Détection changement (Google Drive Watch)
  2. Download fichier
  3. Commit vers repo GitHub approprié
  4. Notification Telegram

---

## 🔄 PLAN DE MIGRATION

### Phase 1: Préparation (Jour 1-2)

**Objectifs**:
- Créer les 9 repositories sur GitHub
- Générer les READMEs initiaux
- Définir les structures de dossiers
- Créer les branches de base

**Actions**:
1. Créer organisation GitHub `ProlexAi` (si pas déjà fait)
2. Créer les 9 repositories (voir section GitHub ci-dessus)
3. Cloner tous les repos dans `C:\Users\Matthieu\Workspace\Prolex\`
4. Générer READMEs, .gitignore, LICENSE pour chaque repo
5. Commit initial "Initial commit - Repository structure"

**Commandes**:
```bash
# Création repos via GitHub CLI
gh repo create ProlexAi/prolex-core --private
gh repo create ProlexAi/prolex-kimmy --private
gh repo create ProlexAi/prolex-opex --private
gh repo create ProlexAi/prolex-mcp --public
gh repo create ProlexAi/prolex-cli --public
gh repo create ProlexAi/prolex-rag --private
gh repo create ProlexAi/prolex-apps --public
gh repo create ProlexAi/prolex-infra --private
gh repo create ProlexAi/prolex-docs --public

# Clone tous les repos
cd C:\Users\Matthieu\Workspace\Prolex
gh repo clone ProlexAi/prolex-core 01-prolex-core
gh repo clone ProlexAi/prolex-kimmy 02-prolex-kimmy
# ... etc pour les 9 repos
```

---

### Phase 2: Extraction et migration du code (Jour 3-5)

**Objectifs**:
- Extraire le code du monolithe actuel
- Dispatcher dans les 9 repos
- Maintenir l'historique Git important

**Mapping monolithe → repos modulaires**:

| Dossier actuel | Destination | Repo |
|----------------|-------------|------|
| `config/` | `config/` | `prolex-core` |
| `schemas/` | `schemas/` | `prolex-core` |
| `docs/specifications/SPEC_PROLEX_V4.md` | `docs/` | `prolex-core` |
| `docs/specifications/SPEC_KIMMY_V4.md` | `docs/` | `prolex-kimmy` |
| `docs/specifications/SPEC_OPEX_V4.md` | `docs/` | `prolex-opex` |
| `n8n-workflows/` | `workflows/` | `prolex-opex` |
| `mcp/` | `packages/` | `prolex-mcp` |
| `cli/` | `src/` | `prolex-cli` |
| `rag/` | `knowledge-base/` | `prolex-rag` |
| `prolex-vector-service/` | `src/vector-service/` | `prolex-rag` |
| `apps/` | `packages/` | `prolex-apps` |
| `infra/` | `./` | `prolex-infra` |
| `docs/architecture/`, `docs/guides/` | `docs/` | `prolex-docs` |

**Script de migration automatique**:
```bash
# Voir fichier: migration-modulaire/scripts-migration/migrate-monolith.sh
```

---

### Phase 3: Configuration CI/CD (Jour 6-7)

**Objectifs**:
- Configurer GitHub Actions pour chaque repo
- Tests automatisés
- Déploiement automatique

**Workflows GitHub Actions à créer**:

Pour chaque repo:
- `.github/workflows/ci.yml` (tests, linting)
- `.github/workflows/release.yml` (releases)
- `.github/workflows/deploy.yml` (déploiement)

---

### Phase 4: Synchronisation Drive (Jour 8)

**Objectifs**:
- Créer structure Drive alignée
- Configurer sync automatique
- Migrer documents existants

**Actions**:
1. Créer structure Drive (voir section Drive ci-dessus)
2. Créer workflow n8n `sync-drive-github.json`
3. Créer MCP Google Drive (`prolex-mcp/packages/google-drive-server`)
4. Migrer documents Drive existants dans nouvelle structure

---

### Phase 5: Nettoyage Windows (Jour 9)

**Objectifs**:
- Créer structure Windows propre
- Cloner les 9 repos localement
- Scripts d'automatisation
- Nettoyage dossiers inutiles

**Actions**:
1. Créer structure `Workspace\` et `Automatt\`
2. Cloner les 9 repos dans `Workspace\Prolex\`
3. Exécuter scripts de nettoyage Windows
4. Archiver ancien monolithe

---

### Phase 6: Tests et validation (Jour 10-12)

**Objectifs**:
- Tester chaque repo individuellement
- Tester intégrations inter-repos
- Valider CI/CD
- Documentation finale

---

### Phase 7: Production et communication (Jour 13-14)

**Objectifs**:
- Mettre en production
- Documentation utilisateur
- Communication aux stakeholders

---

## 🤖 OPTIMISATIONS POUR IA DÉVELOPPEURS

### 1. READMEs AI-First

Chaque README doit contenir:

```markdown
# [NOM DU REPO]

## 🎯 Rôle et responsabilité

[Description claire en 2-3 phrases de ce que fait ce repo]

## 🧠 Pour les IA développeurs

### Quoi coder ici
- [ ] Fonctionnalité A
- [ ] Fonctionnalité B
- [ ] Fonctionnalité C

### Où coder
- Code source: `src/`
- Tests: `tests/`
- Configuration: `config/`

### Comment coder
- Framework: [X]
- Langage: [Y]
- Style guide: [lien]
- Conventions: [lien]

### Dépendances
- Dépend de: `prolex-core`, `prolex-mcp`
- Utilisé par: `prolex-cli`, `prolex-apps`

## 📋 Schémas JSON
- Input: [`schema-input.json`](schemas/input.schema.json)
- Output: [`schema-output.json`](schemas/output.schema.json)

## 🔗 API interne
- Endpoint: `/api/v1/[...]`
- Docs: [API.md](docs/API.md)

## ✅ Tests
```bash
npm test              # Tests unitaires
npm run test:e2e      # Tests E2E
```

## 📦 Build & Deploy
```bash
npm run build
npm run deploy
```
```

### 2. Conventions de nommage strictes

**Fichiers**:
- `kebab-case.ts` pour fichiers
- `PascalCase.tsx` pour composants React
- `snake_case.yml` pour configs
- `SCREAMING_SNAKE_CASE.md` pour docs importantes

**Variables/Fonctions**:
- `camelCase` pour variables et fonctions
- `PascalCase` pour classes et types
- `SCREAMING_SNAKE_CASE` pour constantes

**Branches Git**:
- `feature/description-courte`
- `fix/bug-description`
- `docs/update-readme`
- `refactor/component-name`

### 3. Schémas JSON unifiés

Tous les schémas dans chaque repo doivent:
- Être au format JSON Schema Draft 07
- Contenir des `description` pour chaque propriété
- Inclure des `examples`
- Être validés en CI

### 4. Documentation centralisée des API

Chaque repo avec API doit avoir:
- `docs/API.md` avec tous les endpoints
- Exemples de requêtes/réponses
- Codes d'erreur
- Rate limits

Format OpenAPI 3.0 recommandé.

### 5. Prompts système pour Copilot/Claude

**Fichier**: `.github/copilot-instructions.md` dans chaque repo

```markdown
# Instructions Copilot pour [REPO]

## Contexte
Ce repository gère [description].

## Règles de code
- Utiliser TypeScript strict
- Toujours valider les entrées avec JSON Schema
- Logger toutes les erreurs
- Tests obligatoires pour nouvelles fonctionnalités

## Patterns à suivre
[Exemples de code à suivre]

## Patterns à éviter
[Anti-patterns]

## Dépendances approuvées
[Liste de dépendances autorisées]
```

### 6. Templates de code

Chaque repo doit avoir `templates/` avec:
- Template de nouvelle feature
- Template de test
- Template de documentation

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Checklist GitHub

- [ ] Créer organisation `ProlexAi`
- [ ] Créer 9 repositories
  - [ ] `prolex-core` (privé)
  - [ ] `prolex-kimmy` (privé)
  - [ ] `prolex-opex` (privé)
  - [ ] `prolex-mcp` (public)
  - [ ] `prolex-cli` (public)
  - [ ] `prolex-rag` (privé)
  - [ ] `prolex-apps` (public)
  - [ ] `prolex-infra` (privé)
  - [ ] `prolex-docs` (public)
- [ ] Générer READMEs initiaux pour chaque repo
- [ ] Créer structures de dossiers
- [ ] Configurer branch protection sur `main`
- [ ] Configurer GitHub Actions (CI/CD)
- [ ] Ajouter secrets GitHub (API keys, etc.)

### Checklist Windows

- [ ] Créer structure `Workspace\Prolex\`
- [ ] Cloner les 9 repos localement
- [ ] Créer structure `Automatt\`
- [ ] Créer dossier `Shared-Tools\`
- [ ] Exécuter scripts de nettoyage Windows
  - [ ] Script nettoyage dossiers par défaut (`.reg`)
  - [ ] Script organisation automatique (`.bat`)
- [ ] Archiver ancien monolithe dans `Archive\Migration-Prolex-Monolithe\`

### Checklist Google Drive

- [ ] Créer structure Drive (9 dossiers + contextes)
- [ ] Migrer documents existants
- [ ] Créer workflow n8n sync Drive ↔ GitHub
- [ ] Créer MCP Google Drive
- [ ] Tester synchronisation automatique

### Checklist Migration Code

- [ ] Mapper monolithe → repos modulaires
- [ ] Extraire et migrer code
- [ ] Vérifier historique Git conservé
- [ ] Mettre à jour imports/dépendances
- [ ] Tester builds de chaque repo

### Checklist Documentation

- [ ] READMEs AI-First pour chaque repo
- [ ] Documentation API centralisée
- [ ] Schémas JSON validés
- [ ] Diagrammes architecture
- [ ] Guides utilisateur

### Checklist Tests

- [ ] Tests unitaires pour chaque repo
- [ ] Tests d'intégration inter-repos
- [ ] CI/CD validé
- [ ] Déploiement staging testé
- [ ] Rollback plan validé

### Checklist Production

- [ ] Déploiement production
- [ ] Monitoring en place
- [ ] Alertes configurées
- [ ] Backups automatiques
- [ ] Documentation utilisateur finale

---

## 📊 MÉTRIQUES DE SUCCÈS

| Métrique | Objectif |
|----------|----------|
| Nombre de repos | 9 |
| Couverture tests | > 80% |
| CI/CD fonctionnel | 100% des repos |
| Documentation complète | 100% des repos |
| Temps build moyen | < 5 min |
| Déploiement production | 0 downtime |

---

## 🚀 PROCHAINES ÉTAPES

1. **Valider ce plan** avec l'équipe
2. **Créer les 9 repositories** (Phase 1)
3. **Générer tous les fichiers initiaux** (READMEs, structures)
4. **Migration progressive** (Phase 2-7)
5. **Tests et validation** continue
6. **Production** et communication

---

**Document créé le**: 2025-11-24
**Par**: Claude Code Assistant
**Pour**: Reconstruction modulaire Prolex v4
**Status**: 🚧 En attente de validation et implémentation
