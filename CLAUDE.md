# CLAUDE.md - Guide pour Assistants IA travaillant sur le codebase Prolex V5

> **Guide complet pour les assistants IA travaillant sur le codebase Prolex**
> **Dernière mise à jour**: 2025-12-01
> **Version**: 5.1.0

---

## 📋 Table des matières

1. [Démarrage rapide](#démarrage-rapide)
2. [Vue d'ensemble du projet](#vue-densemble-du-projet)
3. [Architecture](#architecture)
4. [Structure du dépôt](#structure-du-dépôt)
5. [Workflows de développement](#workflows-de-développement)
6. [Conventions principales](#conventions-principales)
7. [Principes d'organisation des fichiers](#principes-dorganisation-des-fichiers)
8. [Tâches courantes](#tâches-courantes)
9. [Référence des fichiers importants](#référence-des-fichiers-importants)
10. [Sécurité & Sûreté](#sécurité--sûreté)
11. [Tests & Validation](#tests--validation)
12. [Conseils pour un travail efficace](#conseils-pour-un-travail-efficace)

---

## 🚀 Démarrage rapide

### Première visite ?

1. **Lisez cette section en premier** pour comprendre le contexte du projet
2. **Consultez [INDEX_PROLEX.md](INDEX_PROLEX.md)** - Document de navigation central
3. **Vérifiez [README.md](README.md)** - Vue d'ensemble du projet et documentation publique
4. **Comprenez l'architecture** depuis [ARCHITECTURE_COMPLETE_V5.md](ARCHITECTURE_COMPLETE_V5.md) - Analyse complète V5

### Contexte essentiel

**Prolex** est un cerveau orchestrateur IA pour Automatt.ai qui :
- Traite les requêtes en langage naturel via une architecture 3 tiers (Kimmy → Prolex → Opex)
- Conçoit, crée et modifie de manière autonome des workflows n8n
- Maintient une traçabilité complète de toutes les opérations via SystemJournal (Google Sheets)
- Opère avec 4 niveaux d'autonomie (0-3) pour un contrôle granulaire

**État actuel**: v5.1.0 - Architecture production-ready multi-dépôts avec 42 outils MCP

---

## 🎯 Vue d'ensemble du projet

### Qu'est-ce que Prolex ?

Prolex est le **cerveau orchestrateur IA** pour Automatt.ai avec trois composants principaux :

```
┌──────────────────────────────────┐
│ KIMMY (Filtre d'entrée)          │
│ - Classifie l'intention          │  ← LLM + n8n
│ - Évalue la complexité           │
│ - Produit KimmyPayload           │
└──────────┬───────────────────────┘
           ↓ KimmyPayload (JSON)
┌──────────────────────────────────┐
│ PROLEX (Cerveau orchestrateur)   │
│ - Raisonne & planifie            │  ← Claude 3.5 Sonnet + RAG
│ - Sélectionne les outils         │
│ - Produit ProlexOutput           │
└──────────┬───────────────────────┘
           ↓ ProlexOutput (JSON)
┌──────────────────────────────────┐
│ OPEX (Bras d'exécution)          │
│ - Valide (Proxy Master)          │  ← workflows n8n
│ - Exécute les workflows          │
│ - Journalise dans SystemJournal  │
└──────────────────────────────────┘
```

### Technologies principales

- **LLMs**: Claude 3.5 Sonnet (Prolex), GPT-4 Turbo/Claude Haiku (Kimmy)
- **Moteur de workflow**: n8n (auto-hébergé)
- **RAG**: AnythingLLM avec intégration Google Drive
- **Journalisation**: Google Sheets (SystemJournal)
- **Infrastructure**: Docker, Traefik, PostgreSQL, Redis
- **Contrôle de version**: GitHub (source de vérité pour les workflows)
- **Serveurs MCP**: Serveurs Model Context Protocol personnalisés pour les intégrations

### Capacités principales (V5)

- ✨ **42 outils MCP**: n8n (6), Google Workspace (23), GitHub (8), System (5)
- ✨ **Architecture multi-dépôts**: 8 dépôts spécialisés pour séparation des responsabilités
- ✨ **4 niveaux d'autonomie**: Contrôle de permissions granulaire (0-3)
- ✨ **Production Ready**: Cache, retry, rate limiting, streaming logs
- ✨ **Intégration Claude Desktop**: Via protocole MCP 1.0.4
- ✨ **Traçabilité complète**: Chaque action journalisée dans SystemJournal

---

## 🏗️ Architecture

### Pipeline à trois tiers

#### 1. Kimmy (Filtre d'entrée)
- **Rôle**: Filtrer et structurer les requêtes entrantes
- **Technologie**: LLM + workflow n8n
- **Entrée**: Langage naturel (toujours en français)
- **Sortie**: `KimmyPayload` (JSON)
- **Fonctions principales**:
  - Classification d'intention (13 types)
  - Évaluation de complexité
  - Actions rapides pour tâches simples
  - Escalade vers Prolex pour tâches complexes

#### 2. Prolex (Cerveau orchestrateur)
- **Rôle**: Raisonnement, planification et sélection d'outils
- **Technologie**: Claude 3.5 Sonnet + AnythingLLM RAG
- **Entrée**: `KimmyPayload` (JSON)
- **Sortie**: `ProlexOutput` (JSON)
- **Fonctions principales**:
  - Planification multi-étapes
  - Sélection d'outils parmi 30+ outils disponibles
  - Application des niveaux d'autonomie
  - Prise de décision contextuelle

#### 3. Opex (Bras d'exécution)
- **Rôle**: Valider et exécuter les actions
- **Technologie**: workflows n8n + Proxy Master
- **Entrée**: `ProlexOutput` (JSON)
- **Sortie**: Résultats d'exécution → SystemJournal
- **Fonctions principales**:
  - Validation via Proxy Master (garde-fous)
  - Exécution de workflows
  - Journalisation dans SystemJournal
  - Gestion d'erreurs et alertes

### Niveaux d'autonomie

| Niveau | Nom | Capacités | Cas d'usage |
|-------|------|-----------|-------------|
| **0** | Lecture seule | Lire docs, analyser logs, répondre aux questions | Validation initiale, audit |
| **1** | Lecture + Logs | Niveau 0 + journalisation, notes, recherche web | Staging, formation |
| **2** | Actions à faible risque | Niveau 1 + tâches, calendrier, conception de workflows | Utilisation personnelle quotidienne |
| **3** | Actions avancées | Niveau 2 + workflows clients, gestion n8n | Production avec workflows validés |

**Niveau actuel**: 2 (configurable dans `config/autonomy.yml`)

### Flux de données

1. **Requête utilisateur** → Kimmy (via chat/WhatsApp/email)
2. **KimmyPayload** → Prolex (via webhook n8n)
3. **ProlexOutput** → Proxy Master (validation)
4. **Action validée** → Exécution de workflow n8n
5. **Résultats** → SystemJournal (Google Sheets)
6. **Réponse** → Utilisateur

---

## 📂 Structure du dépôt

**Note**: Prolex V5 utilise une architecture multi-dépôts. Ce dépôt (prolex-master) est le hub central de documentation.

```
ProlexV5/ (Workspace racine)
├── prolex-master/                          # Ce dépôt - Hub central
│   ├── README.md                           # Vue d'ensemble publique
│   ├── INDEX_PROLEX.md                     # Navigation centrale (COMMENCEZ ICI)
│   ├── CLAUDE.md                           # Ce fichier (guide pour assistant IA)
│   ├── ARCHITECTURE_COMPLETE_V5.md         # Architecture complète analysée
│
├── docs/                                   # Toute la documentation
│   ├── architecture/
│   │   └── ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md  # Document d'architecture maître
│   ├── specifications/
│   │   ├── SPEC_KIMMY_V4.md               # Spécification Kimmy
│   │   ├── SPEC_PROLEX_V4.md              # Spécification Prolex
│   │   └── SPEC_OPEX_V4.md                # Spécification Opex
│   └── guides/
│       ├── ANALYSE_CRITIQUE_V4.md         # Analyse d'expert
│       └── GUIDE_CLIENTS.md               # Guide destiné aux clients
│
├── schemas/                                # Définitions de schémas JSON
│   ├── kimmy_payload.schema.json          # Payload Kimmy → Prolex
│   ├── prolex_output.schema.json          # Sortie Prolex → Opex
│   ├── system_journal.schema.json         # Format de log SystemJournal
│   ├── autonomy_levels.yml                # Définitions des niveaux d'autonomie
│   ├── payloads/                          # Schémas de payloads d'outils
│   ├── logs/                              # Schémas de journalisation
│   └── tools/                             # Schémas de définition d'outils
│
├── config/                                 # Configuration système
│   ├── autonomy.yml                       # ⚙️ Niveaux d'autonomie & permissions
│   ├── system.yml                         # ⚙️ Configuration système globale
│   ├── kimmy_config.yml                   # Configuration spécifique Kimmy
│   ├── prolex_config.yml                  # Configuration spécifique Prolex
│   └── opex_workflows.yml                 # Catalogue de workflows (source de vérité)
│
├── rag/                                    # Base de connaissances pour RAG Prolex
│   ├── tools/
│   │   └── tools.yml                      # 📋 Catalogue complet d'outils (30+)
│   ├── rules/
│   │   └── 01_REGLES_PRINCIPALES.md       # Règles principales
│   ├── examples/                          # Exemples d'utilisation
│   └── context/
│       └── 02_VARIABLES_ET_CONTEXTE.md    # Variables de contexte
│
├── n8n-workflows/                          # Définitions de workflows n8n (JSON)
│   ├── 010_sync-github-to-n8n.json        # Workflow de sync GitHub → n8n
│   ├── 020_example-hello-world.json       # Workflow d'exemple
│   ├── 030_github-dev-log-to-sheets.json  # Workflow de log dev
│   ├── 050_daily_full_maintenance_prolex_v4.json  # Maintenance
│   └── README.md                          # Documentation de sync des workflows
│
├── mcp/                                    # Serveurs MCP (Model Context Protocol)
│   └── n8n-server/                        # ✅ Serveur MCP n8n (existant)
│       ├── src/
│       │   ├── index.ts                   # Point d'entrée du serveur MCP
│       │   ├── n8nClient.ts               # Client API n8n
│       │   ├── tools/                     # Définitions d'outils MCP
│       │   └── types.ts                   # Types TypeScript
│       ├── scripts/                       # Scripts utilitaires
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── services/                               # Services backend
│   └── prolex-sandbox/                    # ✅ Prolex Sandbox (environnement de test)
│       ├── src/
│       │   ├── index.ts                   # Point d'entrée du service
│       │   ├── server.ts                  # Serveur Express
│       │   ├── config.ts                  # Configuration
│       │   ├── db.ts                      # Couche base de données
│       │   ├── services/                  # Services principaux
│       │   │   ├── sandboxService.ts      # Orchestrateur sandbox principal
│       │   │   ├── n8nSimulator.ts        # Simulateur de workflow n8n
│       │   │   ├── mcpSimulator.ts        # Simulateur d'appels MCP
│       │   │   └── gardeFousSandbox.ts    # Évaluation des risques
│       │   ├── routes/                    # Routes API
│       │   │   ├── scenariosRoutes.ts     # Endpoints de scénarios
│       │   │   └── runsRoutes.ts          # Endpoints d'exécution
│       │   └── types/                     # Types TypeScript
│       ├── scripts/                       # Scripts utilitaires
│       │   └── creer-scenario-workflow-n8n.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md                      # Documentation complète
│
├── infra/                                  # Infrastructure as code
│   └── vps-prod/                          # Configuration VPS production
│       ├── docker-compose.yml             # Définition de stack Docker
│       ├── scripts/
│       │   ├── bootstrap_vps.sh           # Configuration initiale VPS
│       │   └── rebuild-n8n.sh             # Script de rebuild n8n
│       └── docs/
│
├── tools/                                  # Outils utilitaires
│   └── filter_workflows.py                # Filtrage du catalogue de workflows
│
├── .github/                                # Workflows GitHub
│   └── workflows/
│       ├── ci.yml                         # Pipeline CI principal
│       ├── pr-validation.yml              # Validation des PR
│       ├── security.yml                   # Analyse de sécurité
│       └── yamllint.yml                   # Linting YAML
│
└── .markdownlint.json                      # Configuration de linting Markdown
└── .yamllint.yml                           # Configuration de linting YAML
```

### Objectifs des répertoires principaux

| Répertoire | Objectif | Quand le modifier |
|-----------|---------|------------------|
| `docs/` | Toute la documentation | Ajout/mise à jour de docs |
| `schemas/` | Définitions de schémas JSON | Changement de structures de données |
| `config/` | Configuration système | Changement de comportement/paramètres |
| `rag/` | Base de connaissances Prolex | Ajout d'outils, règles, contexte |
| `n8n-workflows/` | Définitions de workflows | Création/modification de workflows |
| `mcp/` | Serveurs MCP | Ajout d'intégrations |
| `services/` | Services backend | Ajout/modification de services |
| `infra/` | Code d'infrastructure | Changements de déploiement |

---

## 🔄 Workflows de développement

### 1. Travailler avec les workflows n8n

#### Cycle de vie d'un workflow

```
Conception dans UI n8n → Export JSON → Ajout dans n8n-workflows/ →
Git commit + push → Webhook GitHub → Auto-sync vers n8n
```

#### Créer un nouveau workflow

1. **Concevoir** dans l'UI n8n (http://localhost:5678)
2. **Exporter** en JSON
3. **Nommer** selon la convention : `<num>_<nom-descriptif>.json`
   - `000-099`: workflows principaux
   - `100-199`: productivité
   - `200-299`: dev/DevOps
   - `300-399`: clients
   - `400-499`: surveillance
   - `500-599`: reporting
   - `600-699`: admin n8n
   - `900-999`: exemples/tests
4. **Ajouter** au répertoire `n8n-workflows/`
5. **Mettre à jour** `config/opex_workflows.yml` avec les métadonnées
6. **Commiter** et pusher sur GitHub
7. **Vérifier** l'auto-sync via le workflow `010_sync-github-to-n8n.json`

#### Modifier un workflow existant

1. **Lire** le JSON actuel depuis `n8n-workflows/`
2. **Éditer** le JSON directement OU modifier dans l'UI n8n et ré-exporter
3. **Mettre à jour** version/timestamps dans les métadonnées
4. **Commiter** les changements
5. **L'auto-sync** mettra à jour l'instance n8n

### 2. Ajouter un nouvel outil

#### Processus étape par étape

1. **Définir dans le catalogue d'outils** (`rag/tools/tools.yml`) :
   ```yaml
   - id: NEW_TOOL_ID
     name: "Tool Name"
     description: "What it does"
     category: productivity|devops|client|monitoring|etc
     risk_level: low|medium|high
     auto_allowed_levels: [1, 2, 3]  # Which autonomy levels can use
     target:
       type: webhook
       url: "https://n8n.automatt.ai/webhook/tool-endpoint"
       method: POST
     payload_schema: "schemas/payloads/new_tool.schema.json"
   ```

2. **Créer le schéma de payload** (`schemas/payloads/new_tool.schema.json`) :
   ```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "type": "object",
     "properties": {
       "param1": {"type": "string"},
       "param2": {"type": "number"}
     },
     "required": ["param1"]
   }
   ```

3. **Créer le workflow n8n** (nom : `<num>_new_tool.json`)
   - Déclencheur webhook
   - Logique de validation
   - Appels API externes
   - Formatage de réponse
   - Journalisation SystemJournal

4. **Mettre à jour Proxy Master** pour router le nouvel outil

5. **Tester minutieusement** :
   - Validation de schéma
   - Exécution de workflow
   - Gestion d'erreurs
   - Journalisation

6. **Documenter** dans les docs de spécification pertinentes

### 3. Modifier la configuration

#### Changements de niveau d'autonomie

**Fichier** : `config/autonomy.yml`

```yaml
# Changer le niveau actuel (0-3)
prolex_current_autonomy_level: 2

# Modifier les permissions pour un niveau
autonomy_levels:
  2:
    allowed_actions:
      - TASK_CREATE
      - NEW_TOOL_ID  # Add new tool
```

**Impact** : Affecte quels outils Prolex peut auto-exécuter

#### Changements de configuration système

**Fichier** : `config/system.yml`

Modifications courantes :
- Changer l'environnement (`development` → `staging` → `production`)
- Ajuster les limites de coûts
- Modifier les limites de taux d'API
- Mettre à jour les paramètres de surveillance
- Changer le mode Kimmy (`safe` vs `quick_actions`)

### 4. Workflow Git

#### Convention de nommage des branches

- `main` - Code prêt pour la production
- `feature/**` - Nouvelles fonctionnalités
- `claude/**` - Branches générées par Claude (auto-créées)
- `fix/**` - Corrections de bugs
- `docs/**` - Mises à jour de documentation

#### Format des messages de commit

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types** : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Exemples** :
```
feat(n8n): add client onboarding workflow

docs(architecture): update v4 specification

fix(mcp): resolve n8n connection timeout issue
```

#### Processus de Pull Request

1. **Créer une branche** depuis `main`
2. **Faire les changements** en suivant les conventions
3. **Tester localement** (voir section Tests)
4. **Commiter** avec des messages descriptifs
5. **Pusher** vers GitHub
6. **Créer une PR** avec :
   - Titre et description clairs
   - Référence aux issues si applicable
   - Résultats de tests
   - Captures d'écran si changements d'UI
7. **La validation CI** doit passer :
   - Validation de schémas JSON
   - Validation YAML
   - Linting Markdown
   - Vérification des références
   - Validation JSON des workflows
8. **Merger** après revue

---

## 🎨 Conventions principales

### 1. Conventions de nommage

#### Fichiers

- **Workflows** : `<num>_<descriptif-kebab-case>.json`
  - Exemple : `010_sync-github-to-n8n.json`
- **Documentation** : `SCREAMING_SNAKE_CASE.md` pour les docs importants
  - Exemple : `SPEC_PROLEX_V4.md`, `INDEX_PROLEX.md`
- **Fichiers de config** : `lowercase_snake_case.yml`
  - Exemple : `autonomy.yml`, `system.yml`
- **Schémas** : `lowercase_snake_case.schema.json`
  - Exemple : `kimmy_payload.schema.json`

#### Outils

- **IDs d'outils** : `SCREAMING_SNAKE_CASE`
  - Exemple : `TASK_CREATE`, `N8N_WORKFLOW_DESIGN`
- **Catégories** : `lowercase` mot unique
  - Exemple : `productivity`, `devops`, `monitoring`

#### Variables

- **Config YAML** : `snake_case`
  - Exemple : `prolex_current_autonomy_level`
- **Schéma JSON** : `camelCase`
  - Exemple : `requestId`, `userId`

### 2. Conventions de documentation

#### Structure Markdown

```markdown
# Titre (H1 - un seul par document)

## Section (H2)

### Sous-section (H3)

#### Détail (H4)
```

#### Liens

- **Internes** : Utiliser des chemins relatifs
  - `[Link](./docs/file.md)` ou `[Link](docs/file.md)`
- **Externes** : Utiliser des URLs complètes
  - `[Link](https://example.com)`

#### Blocs de code

Toujours spécifier le langage :
```yaml
# config.yml
key: value
```

```json
{
  "key": "value"
}
```

```typescript
const example = "value";
```

### 3. Conventions de schémas

- **Version JSON Schema** : Draft 07
- **Champs requis** : Toujours spécifier
- **Descriptions** : Obligatoires pour toutes les propriétés
- **Exemples** : Inclure quand c'est utile
- **Validation** : Utiliser `pattern`, `enum`, `minimum`, etc.

Exemple :
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TaskCreate",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title",
      "minLength": 1,
      "maxLength": 200
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Task priority level"
    }
  },
  "required": ["title"]
}
```

### 4. Conventions de workflows

#### Structure de workflow n8n

1. **Déclencheur webhook** (toujours le premier nœud)
2. **Validation** (valider le payload contre le schéma)
3. **Logique métier** (opérations principales du workflow)
4. **Gestion d'erreurs** (capturer et journaliser les erreurs)
5. **Formatage de réponse** (réponse standardisée)
6. **Journalisation SystemJournal** (toujours journaliser l'exécution)

#### Métadonnées de workflow

Inclure dans le JSON du workflow :
- `name` : Nom descriptif
- `tags` : Tags de catégorie (ex : `["productivity", "tasks"]`)
- `active` : Booléen (true/false)
- `settings` : Paramètres d'exécution

### 5. Gestion d'erreurs

#### Format de réponse d'erreur standard

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "timestamp": "2025-11-22T10:00:00Z"
  }
}
```

#### Codes d'erreur

- `VALIDATION_ERROR` : Échec de validation de schéma/entrée
- `PERMISSION_ERROR` : Niveau d'autonomie insuffisant
- `EXECUTION_ERROR` : Échec d'exécution de workflow
- `EXTERNAL_API_ERROR` : Erreur de service externe
- `TIMEOUT_ERROR` : Délai d'opération expiré

---

## 📁 Principes d'organisation des fichiers

### 1. Fichiers de configuration

**Emplacement** : `config/`

- ✅ **À FAIRE** : Séparer les configs spécifiques à l'environnement
- ✅ **À FAIRE** : Utiliser YAML pour les configs éditables par humains
- ✅ **À FAIRE** : Inclure des commentaires expliquant chaque paramètre
- ❌ **NE PAS FAIRE** : Commiter des secrets ou clés API
- ❌ **NE PAS FAIRE** : Utiliser des valeurs codées en dur qui devraient être configurables

### 2. Documentation

**Emplacement** : `docs/`

- ✅ **À FAIRE** : Organiser par type (architecture, spécifications, guides)
- ✅ **À FAIRE** : Inclure une hiérarchie claire
- ✅ **À FAIRE** : Croiser les références entre documents liés
- ❌ **NE PAS FAIRE** : Dupliquer du contenu (faire des liens à la place)
- ❌ **NE PAS FAIRE** : Laisser les docs devenir obsolètes (mettre à jour avec les changements de code)

### 3. Schémas

**Emplacement** : `schemas/`

- ✅ **À FAIRE** : Valider tous les schémas en CI
- ✅ **À FAIRE** : Versionner les schémas lors de changements cassants
- ✅ **À FAIRE** : Inclure des exemples dans les docs de schémas
- ❌ **NE PAS FAIRE** : Faire des changements cassants sans plan de migration
- ❌ **NE PAS FAIRE** : Sauter la documentation des champs requis

### 4. Workflows

**Emplacement** : `n8n-workflows/`

- ✅ **À FAIRE** : Exporter depuis n8n avec formatage propre
- ✅ **À FAIRE** : Suivre la convention de nommage numérique
- ✅ **À FAIRE** : Inclure un README expliquant le processus de sync
- ❌ **NE PAS FAIRE** : Éditer manuellement les structures de nœuds complexes
- ❌ **NE PAS FAIRE** : Commiter sans tester dans n8n d'abord

---

## ✅ Tâches courantes

### Tâche 1 : Ajouter un nouvel outil à Prolex

```bash
# 1. Définir l'outil dans le catalogue
vim rag/tools/tools.yml
# Ajouter la définition de l'outil avec ID, category, risk_level, etc.

# 2. Créer le schéma de payload
vim schemas/payloads/my_new_tool.schema.json
# Définir le schéma JSON pour l'entrée de l'outil

# 3. Créer le workflow n8n
# - Concevoir dans l'UI n8n
# - Exporter en JSON
# - Sauvegarder dans n8n-workflows/XXX_my_new_tool.json

# 4. Mettre à jour le catalogue de workflows
vim config/opex_workflows.yml
# Ajouter les métadonnées du workflow

# 5. Tester et valider
npm install -g ajv-cli
ajv compile -s schemas/payloads/my_new_tool.schema.json

# 6. Commiter les changements
git add .
git commit -m "feat(tools): add MY_NEW_TOOL for <purpose>"
git push
```

### Tâche 2 : Changer le niveau d'autonomie de Prolex

```bash
# 1. Éditer la configuration d'autonomie
vim config/autonomy.yml

# Changer la ligne :
# prolex_current_autonomy_level: 2  # Changer au niveau désiré (0-3)

# 2. Vérifier ce que ce changement active
# Vérifier allowed_actions pour le nouveau niveau

# 3. Commiter le changement
git add config/autonomy.yml
git commit -m "config(autonomy): change level to <X> for <reason>"
git push

# 4. Vérifier le comportement de Prolex
# Tester que les outils sont correctement autorisés/bloqués
```

### Tâche 3 : Créer un nouveau workflow n8n

```bash
# 1. Concevoir le workflow dans l'UI n8n (http://localhost:5678)

# 2. Tester l'exécution du workflow

# 3. Exporter le workflow en JSON depuis n8n

# 4. Déterminer le numéro du workflow
ls n8n-workflows/*.json | tail -5
# Trouver le prochain numéro disponible dans la plage appropriée

# 5. Sauvegarder le workflow
mv ~/Downloads/My_Workflow.json n8n-workflows/350_my_workflow.json

# 6. Mettre à jour le catalogue de workflows
vim config/opex_workflows.yml
# Ajouter l'entrée du workflow avec métadonnées

# 7. Commiter et pusher
git add n8n-workflows/350_my_workflow.json config/opex_workflows.yml
git commit -m "feat(n8n): add workflow for <purpose>"
git push

# 8. Vérifier l'auto-sync
# Vérifier l'instance n8n pour confirmer que le workflow apparaît
```

### Tâche 4 : Mettre à jour la documentation

```bash
# 1. Identifier le document à mettre à jour
# Vérifier INDEX_PROLEX.md pour l'emplacement du document

# 2. Lire la version actuelle
cat docs/specifications/SPEC_PROLEX_V4.md

# 3. Faire les changements
vim docs/specifications/SPEC_PROLEX_V4.md

# 4. Valider le markdown
npm install -g markdownlint-cli
markdownlint docs/specifications/SPEC_PROLEX_V4.md

# 5. Mettre à jour l'index si nécessaire
vim INDEX_PROLEX.md

# 6. Commiter les changements
git add docs/specifications/SPEC_PROLEX_V4.md
git commit -m "docs(spec): update Prolex specification for <change>"
git push
```

### Tâche 5 : Déboguer un problème de workflow

```bash
# 1. Vérifier les logs SystemJournal
# Ouvrir : https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
# Onglet : SystemJournal
# Filtrer par workflow_id ou request_id

# 2. Vérifier la définition du workflow
cat n8n-workflows/<workflow_file>.json | jq .

# 3. Tester le workflow dans l'UI n8n
# Exécution manuelle avec payload de test

# 4. Vérifier les logs d'exécution n8n
# UI n8n → Executions → Trouver l'exécution échouée

# 5. Corriger le problème (dans l'UI n8n ou JSON)

# 6. Ré-exporter et mettre à jour si nécessaire
# Suivre les étapes "Créer un nouveau workflow n8n" ci-dessus

# 7. Re-tester et vérifier
```

### Tâche 6 : Ajouter un nouveau serveur MCP

```bash
# 1. Créer le répertoire du serveur MCP
mkdir -p mcp/my-new-server/src

# 2. Initialiser le projet Node.js
cd mcp/my-new-server
npm init -y

# 3. Installer le SDK MCP
npm install @modelcontextprotocol/sdk

# 4. Créer l'implémentation du serveur
# Voir mcp/n8n-server/src/index.ts comme référence

# 5. Ajouter la config TypeScript
cp ../n8n-server/tsconfig.json .

# 6. Builder et tester
npm run build
node dist/index.js

# 7. Mettre à jour le README principal
vim ../../README.md
# Ajouter la section du nouveau serveur MCP

# 8. Commiter
git add mcp/my-new-server
git commit -m "feat(mcp): add my-new-server for <integration>"
git push
```

---

## 📚 Référence des fichiers importants

### Documents à lire absolument (par ordre de priorité)

1. **[INDEX_PROLEX.md](INDEX_PROLEX.md)** - Navigation centrale, commencez ici
2. **[README.md](README.md)** - Vue d'ensemble du projet
3. **[docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)** - Document d'architecture maître (824 lignes)
4. **[CLAUDE.md](CLAUDE.md)** - Ce fichier (guide pour assistant IA)

### Spécifications (niveau de détail)

1. **[docs/specifications/SPEC_KIMMY_V4.md](docs/specifications/SPEC_KIMMY_V4.md)** - Spécification du composant Kimmy
2. **[docs/specifications/SPEC_PROLEX_V4.md](docs/specifications/SPEC_PROLEX_V4.md)** - Spécification du composant Prolex
3. **[docs/specifications/SPEC_OPEX_V4.md](docs/specifications/SPEC_OPEX_V4.md)** - Spécification du composant Opex

### Configuration (comportement à l'exécution)

1. **[config/autonomy.yml](config/autonomy.yml)** - Niveaux d'autonomie et permissions
2. **[config/system.yml](config/system.yml)** - Configuration système globale
3. **[config/opex_workflows.yml](config/opex_workflows.yml)** - Catalogue de workflows
4. **[rag/tools/tools.yml](rag/tools/tools.yml)** - Catalogue complet d'outils

### Schémas (structures de données)

1. **[schemas/kimmy_payload.schema.json](schemas/kimmy_payload.schema.json)** - Kimmy → Prolex
2. **[schemas/prolex_output.schema.json](schemas/prolex_output.schema.json)** - Prolex → Opex
3. **[schemas/system_journal.schema.json](schemas/system_journal.schema.json)** - Format de journalisation
4. **[schemas/tools/tool_definition.schema.json](schemas/tools/tool_definition.schema.json)** - Schéma d'outil

### Workflows (exemples clés)

1. **[n8n-workflows/010_sync-github-to-n8n.json](n8n-workflows/010_sync-github-to-n8n.json)** - Sync GitHub
2. **[n8n-workflows/020_example-hello-world.json](n8n-workflows/020_example-hello-world.json)** - Exemple simple
3. **[n8n-workflows/050_daily_full_maintenance_prolex_v4.json](n8n-workflows/050_daily_full_maintenance_prolex_v4.json)** - Maintenance

### Tableaux de référence rapide

#### Quand lire quoi

| Tâche | Lire ces fichiers |
|------|------------------|
| Comprendre le projet | INDEX_PROLEX.md, README.md, ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md |
| Ajouter un outil | rag/tools/tools.yml, SPEC_OPEX_V4.md, exemples de schémas d'outils |
| Créer un workflow | n8n-workflows/README.md, SPEC_OPEX_V4.md, workflows d'exemple |
| Changer l'autonomie | config/autonomy.yml, SPEC_PROLEX_V4.md |
| Déboguer | SystemJournal (Google Sheets), JSON du workflow pertinent, system.yml |
| Comprendre le flux de données | Tous les trois fichiers SPEC_*.md, fichiers de schémas |

#### Fréquence de modification des fichiers

| Fichiers | Fréquence de modification | Contrôle de version |
|-------|------------------------|-----------------|
| `config/*.yml` | Moyenne | Suivre les changements avec soin |
| `rag/tools/tools.yml` | Moyenne | Mettre à jour lors de l'ajout d'outils |
| `n8n-workflows/*.json` | Élevée | Auto-sync depuis n8n |
| `docs/*.md` | Faible-Moyenne | Garder en sync avec le code |
| `schemas/*.json` | Faible | Versionner les changements cassants |

---

## 🔒 Sécurité & Sûreté

### Règles de sécurité critiques

1. **NE JAMAIS commiter de secrets**
   - ❌ Clés API
   - ❌ Mots de passe
   - ❌ Tokens
   - ❌ Identifiants
   - ✅ Utiliser des variables d'environnement
   - ✅ Utiliser des fichiers `.env` (gitignorés)

2. **TOUJOURS valider les entrées**
   - Chaque webhook doit valider contre le schéma
   - Utiliser la validation JSON Schema
   - Assainir les entrées utilisateur
   - Vérifier les niveaux d'autonomie avant exécution

3. **NE JAMAIS contourner Proxy Master**
   - Toutes les exécutions d'outils passent par Proxy Master
   - Pas de déclenchements directs de workflows n8n depuis des sources externes
   - Proxy valide les niveaux d'autonomie et permissions

4. **TOUJOURS journaliser dans SystemJournal**
   - Chaque action doit être journalisée
   - Inclure : timestamp, agent, action, résultat, coût
   - Journaliser les erreurs avec contexte complet

5. **🚨 NE JAMAIS toucher aux workflows CASH 🚨**
   - ❌ INTERDIT de créer, modifier, supprimer, déclencher, réparer ou analyser
   - ❌ Workflows : `200_`, `250_`, `300_`, `400_`, `450_`, `999_master_*`
   - ❌ Mots-clés : `leadgen`, `proposal`, `invoice`, `stripe`, `relance`, `cash`
   - ✅ Verrouillage technique bloque automatiquement ces opérations
   - ✅ Violation déclenche une alerte immédiate à Matthieu
   - 📖 Voir : [CASH_WORKFLOWS_LOCK.md](CASH_WORKFLOWS_LOCK.md) pour les détails complets

### Protection des workflows Cash (CRITIQUE)

**⚠️ ZONE INTERDITE — Date de verrouillage: 2025-11-22**

Prolex est **ABSOLUMENT INTERDIT** de :
- Créer des workflows avec des patterns interdits
- Modifier des workflows cash existants
- Déclencher manuellement des workflows cash
- Analyser ou proposer des améliorations aux workflows cash

**Workflows protégés :**
- `200_leadgen_li_mail.json` - Génération de leads
- `250_proposal_auto.json` - **CRITIQUE** - Propositions commerciales
- `300_content_machine.json` - Automatisation de contenu
- `400_invoice_stripe_auto.json` - **CRITIQUE** - Facturation & Stripe
- `450_relances_impayes.json` - **CRITIQUE** - Relances de paiement
- `999_master_tracker.json` - **CRITIQUE** - Suivi des métriques cash

**Application technique :**
- Emplacement : `mcp/n8n-server/src/security/cashWorkflowGuard.ts`
- Appliqué dans : `createWorkflow()`, `updateWorkflow()`, `triggerWorkflow()`
- Violation : Erreur immédiate + alerte Telegram à Matthieu + log SystemJournal

**Si vous détectez un workflow cash :**
1. **STOP** immédiatement ✋
2. **REFUSER** l'opération avec message d'erreur
3. **ALERTER** Matthieu via Telegram 📱
4. **JOURNALISER** l'incident dans SystemJournal (severity: CRITICAL)
5. **PASSER** aux autres tâches ➡️

**Documentation complète :** [CASH_WORKFLOWS_LOCK.md](CASH_WORKFLOWS_LOCK.md)

### Prolex Sandbox - Environnement de test sécurisé

**⚙️ SERVICE COMPLÉMENTAIRE - Disponible depuis: 2025-11-23**

Le **Prolex Sandbox** est un service complémentaire aux garde-fous existants qui permet :
- ✅ **Expérimentation sécurisée** : Tester workflows et appels MCP sans toucher à la production
- ✅ **Apprentissage** : Analyser et détecter les patterns à risque avant exécution
- ✅ **Validation préventive** : Identifier les problèmes en amont des garde-fous critiques

**Caractéristiques** :
- **Simulation complète** : Analyse workflows n8n, appels MCP, séquences mixtes
- **Détection de risques** : Identifie actions critiques (DELETE, DROP TABLE, etc.)
- **2 modes** :
  - `strict` : Bloque les actions à risque élevé/critique
  - `relaxed` : Simule tout mais génère des alertes détaillées
- **Aucune exécution réelle** : N'appelle JAMAIS les API de production

**Utilisation** :
```bash
# Démarrer le service
cd services/prolex-sandbox
npm install && npm run dev

# Créer un scénario depuis un workflow
npm run creer-scenario-workflow -- ../../n8n-workflows/020_example-hello-world.json

# Lancer une simulation
curl -X POST http://localhost:3001/api/run \
  -H "Content-Type: application/json" \
  -d '{"scenarioId": "<ID>"}'
```

**Relation avec les garde-fous** :
- Le Sandbox **complète** (ne remplace pas) les garde-fous de passage humain
- Permet de détecter les risques **avant** d'atteindre les protections critiques
- Offre un environnement d'apprentissage **sans danger** pour Prolex

**Documentation complète** : [services/prolex-sandbox/README.md](services/prolex-sandbox/README.md)

### Sécurité des niveaux d'autonomie

| Niveau | Mesures de sécurité |
|-------|----------------|
| **0** | Lecture seule, aucune action possible |
| **1** | Journalisation uniquement, pas de modifications externes |
| **2** | Personnel/faible risque uniquement, limites de coûts appliquées |
| **3** | Avancé, sandbox uniquement pour workflows n8n |

### Opérations à haut risque

**Nécessitent toujours une confirmation manuelle** (même au niveau 3) :
- `N8N_WORKFLOW_PROMOTE` (sandbox → production)
- `RESTORE_BACKUP` (restauration de données)
- `GIT_OPERATIONS_ON_MAIN_BRANCH` (code de production)

### Sensibilité des données

**Niveaux de sensibilité** (définis dans les définitions d'outils) :
- `low` : Information publique, logs
- `medium` : Données internes, non-PII
- `high` : Données clients, PII, identifiants

**Règles** :
- Sensibilité `high` → Toujours escalader vers un humain
- Journaliser uniquement `low` et `medium`
- NE JAMAIS journaliser les identifiants sensibles

### Restrictions d'environnement

| Environnement | Opérations autorisées |
|-------------|-------------------|
| `development` | Toutes, y compris expérimentales |
| `staging` | Workflows validés uniquement |
| `production` | Workflows approuvés, haut risque nécessite confirmation |

### Checklist de sécurité pour nouveau code

- [ ] Pas d'identifiants codés en dur
- [ ] Validation d'entrée présente
- [ ] Validation de schéma implémentée
- [ ] Gestion d'erreurs robuste
- [ ] Journalisation dans SystemJournal
- [ ] Vérifications de niveau d'autonomie
- [ ] Limitation de taux considérée
- [ ] Gestion de timeout
- [ ] Entrées utilisateur assainies
- [ ] Pas de vecteurs d'injection SQL
- [ ] Pas de vecteurs d'injection de commandes
- [ ] Clés API dans variables d'environnement

---

## 🧪 Tests & Validation

### Tests automatisés (CI/CD)

**GitHub Actions** (`.github/workflows/`) :

1. **ci.yml** - Pipeline CI principal
   - Validation de schémas JSON
   - Validation YAML (yamllint)
   - Linting Markdown (markdownlint)
   - Vérification de références (liens cassés)
   - Validation JSON des workflows

2. **pr-validation.yml** - Validation des pull requests
   - Conformité aux schémas
   - Conventions de nommage
   - Mises à jour de documentation

3. **security.yml** - Analyse de sécurité
   - Vulnérabilités de dépendances
   - Détection de secrets

4. **yamllint.yml** - Validation spécifique YAML

### Workflows de tests manuels

#### Tester un nouvel outil

```bash
# 1. Valider le schéma
ajv compile -s schemas/payloads/my_tool.schema.json

# 2. Tester le workflow dans l'UI n8n
# - Utiliser un payload de test
# - Vérifier les logs d'exécution
# - Vérifier le format de réponse

# 3. Tester via MCP (si applicable)
# - Utiliser Claude Desktop
# - Déclencher l'outil
# - Vérifier les résultats

# 4. Vérifier SystemJournal
# - Confirmer que l'entrée de log a été créée
# - Vérifier que tous les champs sont remplis

# 5. Tester les cas d'erreur
# - Payload invalide
# - Champs requis manquants
# - Échecs d'API externe
```

#### Tester les changements de niveau d'autonomie

```bash
# 1. Changer le niveau dans config/autonomy.yml
prolex_current_autonomy_level: 1

# 2. Tester les actions autorisées
# Essayer un outil qui devrait fonctionner au niveau 1

# 3. Tester les actions interdites
# Essayer un outil qui nécessite le niveau 2+
# Devrait recevoir une erreur de permission

# 4. Vérifier la journalisation
# Vérifier que les erreurs de permission sont journalisées dans SystemJournal
```

#### Tester la synchronisation de workflow

```bash
# 1. Créer/modifier un workflow dans n8n-workflows/
echo '{"name": "test"}' > n8n-workflows/999_test.json

# 2. Commiter et pusher
git add n8n-workflows/999_test.json
git commit -m "test: workflow sync"
git push

# 3. Vérifier la livraison du webhook GitHub
# GitHub → Settings → Webhooks → Recent Deliveries

# 4. Vérifier l'exécution n8n
# UI n8n → Workflow "GitHub to n8n Sync" → Executions

# 5. Vérifier dans n8n
# UI n8n → Workflows → Trouver "test"

# 6. Vérifier les logs SystemJournal
# Google Sheets → onglet events

# 7. Nettoyer
git revert HEAD
git push
```

### Commandes de validation

```bash
# Valider tous les schémas JSON
for schema in schemas/**/*.schema.json; do
  ajv compile -s "$schema" --strict=false
done

# Valider les fichiers YAML
yamllint config/
yamllint schemas/

# Linter le markdown
markdownlint docs/**/*.md --config .markdownlint.json

# Valider les fichiers JSON (workflows)
for workflow in n8n-workflows/*.json; do
  jq empty "$workflow" || echo "Invalid: $workflow"
done

# Vérifier les références cassées
grep -r "schemas/" docs/ | grep -oP 'schemas/[a-zA-Z0-9_/\.]+' | while read ref; do
  [ ! -f "$ref" ] && echo "Broken: $ref"
done
```

### Attentes de couverture de tests

| Composant | Couverture de tests |
|-----------|---------------|
| Schémas | 100% - Tous les schémas doivent être valides |
| Workflows | Manuel - Tester dans l'UI n8n |
| Outils | Manuel - Tester chaque endpoint d'outil |
| Documentation | Lint - Pas de liens cassés |
| Configuration | Validation - Syntaxe YAML |

---

## 💡 Conseils pour un travail efficace

### Pour les assistants Claude Code

1. **Toujours commencer par le contexte**
   - Lire INDEX_PROLEX.md en premier
   - Vérifier le niveau d'autonomie actuel dans config/autonomy.yml
   - Consulter les docs de spécification pertinentes

2. **Suivre l'architecture**
   - Ne pas contourner le pipeline 3 tiers (Kimmy → Prolex → Opex)
   - Ne pas sauter la validation Proxy Master
   - Respecter les restrictions de niveau d'autonomie

3. **Maintenir la cohérence**
   - Suivre exactement les conventions de nommage
   - Utiliser les patterns existants de fichiers similaires
   - Respecter le style de code dans le code existant

4. **Tout documenter**
   - Mettre à jour les docs pertinentes lors de changements de code
   - Ajouter des commentaires pour la logique complexe
   - Inclure des exemples dans les schémas

5. **Penser à la sécurité**
   - Valider toutes les entrées
   - Gérer les erreurs avec élégance
   - Journaliser toutes les actions significatives
   - Ne jamais coder en dur les secrets

6. **Tester avant de commiter**
   - Exécuter les commandes de validation
   - Tester dans l'instance n8n locale
   - Vérifier la conformité aux schémas
   - Vérifier que la CI passera

### Pièges courants à éviter

❌ **Ne pas** :
- Modifier les workflows directement dans n8n sans exporter vers Git
- Sauter la validation de schéma
- Coder en dur les valeurs de configuration
- Créer des outils sans évaluation de risque appropriée
- Contourner les vérifications de niveau d'autonomie
- Ignorer la gestion d'erreurs
- Oublier de journaliser dans SystemJournal
- Faire des changements cassants aux schémas sans migration
- Commiter des secrets ou clés API
- Utiliser des conventions de nommage incohérentes

✅ **Faire** :
- Exporter les workflows depuis n8n après test
- Valider les schémas en CI
- Utiliser des fichiers de config pour tous les paramètres
- Évaluer le niveau de risque pour les nouveaux outils
- Appliquer les niveaux d'autonomie via Proxy Master
- Implémenter une gestion d'erreurs robuste
- Journaliser toutes les actions dans SystemJournal
- Versionner les schémas et fournir des chemins de migration
- Utiliser des variables d'environnement pour les secrets
- Suivre les conventions de nommage établies

### Stratégie de débogage

1. **Vérifier SystemJournal en premier**
   - Google Sheets : Automatt_Logs
   - Filtrer par `request_id` ou `workflow_id`
   - Chercher les messages d'erreur

2. **Consulter l'exécution du workflow dans n8n**
   - UI n8n → Executions
   - Trouver l'exécution échouée
   - Inspecter les sorties de nœuds

3. **Valider les structures de données**
   - Vérifier le payload contre le schéma
   - Vérifier que tous les champs requis sont présents
   - S'assurer que les types correspondent

4. **Vérifier les permissions d'autonomie**
   - Vérifier le niveau actuel dans config/autonomy.yml
   - Vérifier si l'outil est autorisé au niveau actuel
   - Consulter les logs Proxy Master

5. **Tester de manière incrémentale**
   - Isoler le composant défaillant
   - Tester avec un payload minimal
   - Ajouter de la complexité graduellement

### Considérations de performance

1. **Optimisation des coûts**
   - Utiliser Haiku pour les tâches Kimmy simples
   - Mettre en cache les requêtes RAG fréquentes
   - Limiter les requêtes de recherche web
   - Surveiller les limites de coûts quotidiens

2. **Optimisation de latence**
   - Minimiser les étapes de workflow
   - Utiliser async où possible
   - Mettre en cache les réponses d'API externes
   - Optimiser les configurations de nœuds n8n

3. **Limitation de taux**
   - Respecter les limites d'API externes
   - Implémenter des stratégies de backoff
   - Surveiller les en-têtes de limite de taux
   - Journaliser les erreurs de limite de taux

### Résumé des bonnes pratiques

| Domaine | Bonne pratique |
|------|---------------|
| **Code** | Suivre les patterns existants, valider les entrées, gérer les erreurs |
| **Configuration** | Utiliser YAML, inclure des commentaires, contrôle de version |
| **Documentation** | Garder en sync avec le code, croiser les références, inclure des exemples |
| **Workflows** | Tester dans UI, exporter vers Git, journaliser les exécutions |
| **Sécurité** | Valider les entrées, vérifier les permissions, journaliser les actions, pas de secrets |
| **Tests** | Valider les schémas, tester les workflows, vérifier les logs, vérifier la CI |
| **Git** | Commits descriptifs, tester avant push, suivre les conventions |

---

## 📝 Ressources additionnelles

### Documentation externe

- **n8n** : https://docs.n8n.io/
- **Protocole MCP** : https://modelcontextprotocol.io/
- **JSON Schema** : https://json-schema.org/
- **AnythingLLM** : https://docs.anythingllm.com/

### Ressources internes

- **SystemJournal** : https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
- **Instance n8n** : https://n8n.automatt.ai (production)
- **n8n Local** : http://localhost:5678 (développement)

### Contacts support

- **Mainteneur** : Matthieu (Automatt.ai)
- **Email** : matthieu@automatt.ai
- **GitHub** : https://github.com/ProlexAi/Prolex

---

## 🔄 Changelog

### v5.1.0 (2025-12-01)
- 🚀 Mise à jour pour Prolex V5 (architecture multi-dépôts)
- 📦 42 outils MCP (n8n, Google Workspace, GitHub, System)
- 🏗️ Documentation de l'architecture V5 complète
- 📋 Structure 8 dépôts spécialisés
- ✅ Production Ready avec cache, retry, rate limiting

### v4.0 (2025-11-22)
- ✨ Création initiale de CLAUDE.md
- 📚 Guide complet pour les assistants IA
- 🏗️ Documentation de l'architecture v4 complète
- 📋 Ajout des workflows de développement et conventions
- 🔒 Inclusion des directives de sécurité et sûreté
- ✅ Documentation des procédures de tests et validation

---

**Document maintenu par** : Assistants IA + Matthieu
**Dernière mise à jour** : 2025-12-01
**Version** : 5.1.0
**Statut** : Document vivant (mettre à jour au fur et à mesure de l'évolution de l'architecture)

---

## Carte de référence rapide

```
┌─────────────────────────────────────────────────────────────┐
│ RÉFÉRENCE RAPIDE - PROLEX V5.1.0                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ COMMENCEZ ICI : INDEX_PROLEX.md                             │
│                                                              │
│ ARCHITECTURE :                                              │
│   Kimmy (Filtre) → Prolex (Cerveau) → Opex (Exécution)     │
│                                                              │
│ FICHIERS CLÉS :                                             │
│   • config/autonomy.yml    - Niveaux d'autonomie            │
│   • config/system.yml      - Config système                 │
│   • rag/tools/tools.yml    - Catalogue d'outils             │
│                                                              │
│ WORKFLOWS :                                                 │
│   • Concevoir dans UI n8n                                   │
│   • Exporter JSON                                           │
│   • Ajouter dans n8n-workflows/                             │
│   • Commit → Auto-sync                                      │
│                                                              │
│ TESTS :                                                     │
│   ajv compile -s schemas/*.schema.json                      │
│   yamllint config/                                          │
│   markdownlint docs/**/*.md                                 │
│                                                              │
│ DÉBOGAGE :                                                  │
│   1. Vérifier SystemJournal (Google Sheets)                 │
│   2. Vérifier exécutions n8n                                │
│   3. Valider schémas                                        │
│   4. Vérifier permissions d'autonomie                       │
│                                                              │
│ NIVEAUX D'AUTONOMIE :                                       │
│   0 = Lecture seule                                         │
│   1 = Lecture + Logs                                        │
│   2 = Actions à faible risque (actuel)                      │
│   3 = Actions avancées                                      │
│                                                              │
│ RÈGLES DE SÉCURITÉ :                                        │
│   ✓ Valider toutes les entrées                             │
│   ✓ Journaliser dans SystemJournal                         │
│   ✓ Respecter les niveaux d'autonomie                      │
│   ✗ Ne jamais commiter de secrets                          │
│   ✗ Ne jamais contourner Proxy Master                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
