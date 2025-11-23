# Context Orchestrator - Prolex v4

> **Système de routage intelligent des fichiers de contexte**
> **Version**: 1.0.0
> **Date**: 2025-11-23
> **Statut**: Spécification

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Catégories de fichiers](#catégories-de-fichiers)
5. [Workflow](#workflow)
6. [Intégration](#intégration)
7. [Maintenance](#maintenance)

---

## 🎯 Vue d'ensemble

### Problème Résolu

**Avant** : Les fichiers de contexte (RAG, MCP, logs, configs) étaient éparpillés dans différentes structures parallèles (PC local, VPS, dossiers MCP séparés).

**Maintenant** : **GitHub Prolex = Source de vérité unique**
- Tous les fichiers sont organisés dans le repo Prolex
- Structure cohérente sur tous les environnements
- Routage automatique basé sur des règles
- Versioning Git de toute la configuration

### Principe Fondamental

```
┌─────────────────────────────────────────────┐
│  GitHub Prolex Repository                   │
│  = Source de Vérité Unique                  │
├─────────────────────────────────────────────┤
│  - PC Local: C:/Users/Matth/.../Prolex/    │
│  - VPS Prod: /opt/automatt/Prolex/          │
│  - Dev Env:  /home/user/Prolex/             │
└─────────────────────────────────────────────┘
         ↓ Même structure sur tous environnements
```

---

## 🏗️ Architecture

### Structure du Repository

```
Prolex/
├── config/
│   └── context-routing.json         # ⚙️ Configuration du routage
│
├── rag/
│   ├── sources/                     # 📄 Documents sources pour RAG
│   ├── index/                       # 🔍 Index vectoriels (gitignored)
│   ├── context/                     # 📋 Contextes système (existant)
│   ├── rules/                       # 📐 Règles Prolex (existant)
│   └── tools/                       # 🛠️ Catalogue outils (existant)
│
├── docs/
│   └── contextes/                   # 💬 Prompts & instructions système
│
├── mcp/
│   ├── n8n-server/                  # Serveur MCP n8n (existant)
│   ├── google-workspace-server/     # Serveur MCP Google (existant)
│   ├── build/                       # 🔨 Builds compilés (gitignored)
│   └── config/                      # ⚙️ Configs MCP (secrets gitignored)
│
├── logs/
│   ├── tech/                        # 🐛 Logs techniques (gitignored)
│   └── system/                      # 💻 Logs système (gitignored)
│
└── inbox/
    └── unknown/                     # 📥 Fichiers non classifiés (gitignored)
```

### Composants du Système

```
┌─────────────────────────────────────────────────────────────┐
│  1. DÉTECTION                                               │
│     - Fichier reçu (WhatsApp, email, upload, etc.)         │
│     - Webhook vers n8n                                      │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  2. CLASSIFICATION                                          │
│     - Lecture context-routing.json                          │
│     - Analyse nom, extension, contenu                       │
│     - Match contre catégories (ordre de priorité)           │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  3. ROUTAGE                                                 │
│     - Déplacement vers dossier approprié                    │
│     - Création dossier si nécessaire                        │
│     - Logging de l'opération                                │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  4. POST-PROCESSING                                         │
│     - Notification si fichier unknown                       │
│     - Git commit (optionnel)                                │
│     - Trigger de workflows downstream (RAG indexing, etc.)  │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Fichier Principal : `config/context-routing.json`

Le fichier de configuration est **versionné dans Git** et définit :

1. **Roots** - Chemins racine du repo sur chaque environnement
2. **Webhooks** - URLs des webhooks n8n
3. **Categories** - Règles de classification des fichiers
4. **Rules** - Comportement global du système

### Structure de Base

```json
{
  "roots": {
    "local": {
      "windows": "C:/Users/Matth/OneDrive/Documents/GitHub/Prolex/",
      "linux": "/home/user/Prolex/"
    },
    "vps": {
      "path": "/opt/automatt/Prolex/"
    }
  },

  "webhooks": {
    "unknownFile": {
      "url": "https://n8n.automatt.ai/webhook/automatt_unknown_file"
    }
  },

  "categories": {
    "rag_source": {
      "localPath": "rag/sources/",
      "match": {
        "extensions": [".txt", ".md", ".pdf"],
        "nameContains": ["rag_", "source_rag_"]
      }
    }
  },

  "rules": {
    "priorityOrder": ["rag_source", "..."],
    "createMissingDirs": true,
    "notifyOnUnknown": true
  }
}
```

### Définition d'une Catégorie

Chaque catégorie définit :

```json
{
  "category_name": {
    "localPath": "chemin/relatif/",
    "description": "Description de la catégorie",
    "createIfMissing": true,
    "readOnly": false,
    "match": {
      "extensions": [".txt", ".md"],
      "nameContains": ["pattern_"],
      "namePatterns": ["^regex_pattern$"],
      "excludePaths": ["node_modules/"]
    },
    "examples": [
      "exemple_fichier_1.txt",
      "exemple_fichier_2.md"
    ]
  }
}
```

**Champs** :
- `localPath` : Chemin relatif depuis la racine du repo
- `description` : Explication du rôle de la catégorie
- `createIfMissing` : Créer le dossier s'il n'existe pas
- `readOnly` : Empêcher les modifications automatiques
- `match.extensions` : Extensions de fichiers acceptées
- `match.nameContains` : Patterns dans le nom (substring)
- `match.namePatterns` : Regex complètes
- `match.excludePaths` : Chemins à exclure
- `examples` : Exemples de noms de fichiers

---

## 📂 Catégories de Fichiers

### RAG (Retrieval-Augmented Generation)

#### `rag_source` - Sources RAG
- **Path** : `rag/sources/`
- **Usage** : Documents bruts à indexer pour le RAG Prolex
- **Extensions** : `.txt`, `.md`, `.pdf`, `.docx`
- **Patterns** : `rag_*`, `source_rag_*`, `knowledge_*`
- **Git** : ✅ Versionné
- **Exemples** :
  ```
  rag_rules_prolex_v4.md
  source_rag_n8n_workflows.txt
  knowledge_client_automatt.pdf
  ```

#### `rag_index` - Index Vectoriels
- **Path** : `rag/index/`
- **Usage** : Embeddings et index FAISS générés automatiquement
- **Extensions** : `.faiss`, `.jsonl`, `.bin`, `.npy`
- **Patterns** : `index_*`, `embeddings_*`, `vector_store_*`
- **Git** : ❌ Ignoré (fichiers binaires générés)
- **Exemples** :
  ```
  index_prolex_20251123.faiss
  embeddings_tools.jsonl
  vector_store.bin
  ```

#### `rag_context` - Contextes Système
- **Path** : `rag/context/`
- **Usage** : Variables et contextes système Prolex (existant)
- **Git** : ✅ Versionné
- **Fichiers** : `02_VARIABLES_ET_CONTEXTE.md`

#### `rag_rules` - Règles
- **Path** : `rag/rules/`
- **Usage** : Règles de raisonnement Prolex (existant)
- **Git** : ✅ Versionné
- **Fichiers** : `01_REGLES_PRINCIPALES.md`

#### `rag_tools` - Catalogue Outils
- **Path** : `rag/tools/`
- **Usage** : Définition des 30+ outils Prolex (existant)
- **Git** : ✅ Versionné
- **Fichiers** : `tools.yml`

### MCP (Model Context Protocol)

#### `mcp_source` - Code Source
- **Path** : `mcp/`
- **Usage** : Code TypeScript/JavaScript des serveurs MCP
- **Extensions** : `.ts`, `.js`, `.json`
- **Exclude** : `node_modules/`, `dist/`, `build/`
- **Git** : ✅ Versionné
- **Exemples** :
  ```
  mcp/n8n-server/src/index.ts
  mcp/google-workspace-server/src/tools/calendar.ts
  ```

#### `mcp_build` - Builds Compilés
- **Path** : `mcp/build/`
- **Usage** : Fichiers JavaScript compilés depuis TypeScript
- **Extensions** : `.js`, `.mjs`, `.cjs`
- **Git** : ❌ Ignoré (générés automatiquement)
- **Exemples** :
  ```
  mcp/build/n8n-server/dist/index.js
  mcp/build/google/dist/index.js
  ```

#### `mcp_config` - Configurations
- **Path** : `mcp/config/`
- **Usage** : Configs JSON/YAML pour les MCPs
- **Extensions** : `.json`, `.yml`, `.env.example`
- **Git** : ✅ `.example` versionnés, ❌ `.env` ignorés
- **Exemples** :
  ```
  config_mcp_n8n.json          (✅ Git)
  settings_google_workspace.yml (✅ Git)
  .env.n8n                      (❌ Git ignored)
  .env.n8n.example              (✅ Git)
  ```

### Contextes Système

#### `contexte_system` - Prompts & Instructions
- **Path** : `docs/contextes/`
- **Usage** : Prompts système pour Kimmy/Prolex/Opex
- **Extensions** : `.md`, `.txt`, `.json`
- **Patterns** : `contexte_*`, `system_prompt_*`, `instruction_*`
- **Git** : ✅ Versionné
- **Exemples** :
  ```
  contexte_prolex_v4.md
  system_prompt_kimmy_filter.txt
  instruction_opex_validation.json
  ```

### Logs

#### `logs_tech` - Logs Techniques
- **Path** : `logs/tech/`
- **Usage** : Logs d'exécution, erreurs, debug
- **Extensions** : `.log`, `.jsonl`, `.txt`
- **Patterns** : `YYYYMMDD_*.log`, `*_error.log`, `*_debug.jsonl`
- **Git** : ❌ Ignoré (données volatiles)
- **Exemples** :
  ```
  20251123_prolex_execution.log
  kimmy_error.log
  mcp_n8n_debug.jsonl
  ```

#### `logs_system` - Logs Système
- **Path** : `logs/system/`
- **Usage** : Logs infrastructure, health checks
- **Extensions** : `.log`, `.jsonl`
- **Patterns** : `system_*`, `infra_*`, `health_check_*`
- **Git** : ❌ Ignoré
- **Exemples** :
  ```
  system_startup_20251123.log
  health_check_n8n.jsonl
  deployment_20251123_100000.log
  ```

### Autres

#### `schemas` - Schémas JSON
- **Path** : `schemas/`
- **Usage** : Validation de données (existant)
- **Git** : ✅ Versionné
- **Read-Only** : Modification via processus standard

#### `n8n_workflows` - Workflows n8n
- **Path** : `n8n-workflows/`
- **Usage** : Workflows n8n exportés (existant)
- **Git** : ✅ Versionné
- **Read-Only** : ⚠️ Modifier via UI n8n puis exporter

#### `config` - Configurations Système
- **Path** : `config/`
- **Usage** : Configs globales Prolex (existant)
- **Git** : ✅ Versionné

#### `unknown` - Non Classifiés
- **Path** : `inbox/unknown/`
- **Usage** : Fallback pour fichiers non reconnus
- **Git** : ❌ Ignoré (buffer temporaire)
- **Webhook** : Notification automatique

---

## 🔄 Workflow

### Scénario 1 : Fichier RAG reçu

```
1. Utilisateur envoie "rag_new_feature.md" via WhatsApp
   ↓
2. n8n reçoit le fichier → webhook context_orchestrator
   ↓
3. Orchestrateur analyse :
   - Extension : .md ✅
   - Nom contient "rag_" ✅
   - Match catégorie "rag_source" ✅
   ↓
4. Routage :
   - Destination : rootLocal + "rag/sources/"
   - Déplacement : rag/sources/rag_new_feature.md
   ↓
5. Post-processing :
   - Log opération
   - (Optionnel) Trigger workflow RAG indexing
   - (Optionnel) Git commit
```

### Scénario 2 : Fichier Unknown

```
1. Utilisateur envoie "mystery_file.xyz"
   ↓
2. n8n reçoit le fichier → webhook context_orchestrator
   ↓
3. Orchestrateur analyse :
   - Aucune catégorie ne match ❌
   ↓
4. Fallback :
   - Destination : inbox/unknown/
   - Déplacement : inbox/unknown/mystery_file.xyz
   ↓
5. Notification :
   - Webhook "unknownFile" → n8n
   - Payload : {fileName, reason, metadata}
   ↓
6. Action humaine :
   - Examiner le fichier
   - Décider de la catégorie
   - Mettre à jour routing.json si pattern récurrent
```

### Scénario 3 : Fichier MCP Config

```
1. Développeur crée ".env.n8n" (secrets)
   ↓
2. Orchestrateur détecte :
   - Extension : .env
   - Pattern : config MCP ✅
   - Contient secrets ⚠️
   ↓
3. Routage :
   - Destination : mcp/config/.env.n8n
   - Git ignore vérifié ✅
   ↓
4. Vérification :
   - .gitignore contient "*.env" ✅
   - README rappelle de créer .env.example ✅
```

---

## 🔌 Intégration

### Workflow n8n Principal

**Nom** : `Context Orchestrator`
**Webhook** : `/webhook/automatt_context_orchestrator`

**Nœuds** :

```
1. Webhook Trigger
   ↓
2. Read context-routing.json
   ↓
3. Classify File (Function)
   - Match extensions
   - Match name patterns
   - Priority order
   ↓
4. Route Decision (Switch)
   ├─→ rag_source → Move to rag/sources/
   ├─→ rag_index → Move to rag/index/
   ├─→ mcp_config → Move to mcp/config/
   ├─→ logs_tech → Move to logs/tech/
   └─→ unknown → Move to inbox/unknown/ + Notify
   ↓
5. Move File (File Operation)
   ↓
6. Log Operation
   - SystemJournal
   - Local log file
   ↓
7. Post-Process (Conditional)
   - Trigger RAG indexing if rag_source
   - Git commit if enabled
   - Downstream notifications
```

### API / MCP Tool

**Nom** : `CONTEXT_ROUTER_CLASSIFY`

**Description** : Classifie et route un fichier selon les règles

**Payload** :
```json
{
  "fileName": "rag_new_doc.md",
  "filePath": "/tmp/upload/rag_new_doc.md",
  "metadata": {
    "source": "whatsapp",
    "userId": "user_123"
  }
}
```

**Réponse** :
```json
{
  "status": "success",
  "classification": {
    "category": "rag_source",
    "confidence": "high",
    "matchedRule": "nameContains: 'rag_'"
  },
  "routing": {
    "destination": "rag/sources/rag_new_doc.md",
    "action": "moved"
  }
}
```

### CLI Command

```bash
# Classer un fichier
prolexctl context route /path/to/file.md

# Dry-run (simulation)
prolexctl context route /path/to/file.md --dry-run

# Forcer une catégorie
prolexctl context route /path/to/file.md --category rag_source

# Lister les catégories
prolexctl context categories

# Valider la config
prolexctl context validate-config
```

---

## 🔧 Maintenance

### Mise à Jour du Routing

**Étapes** :

1. **Éditer** `config/context-routing.json`
   ```bash
   vim config/context-routing.json
   ```

2. **Valider** la syntaxe JSON
   ```bash
   jq . config/context-routing.json
   ```

3. **Tester** en dry-run
   ```bash
   prolexctl context route test_file.md --dry-run
   ```

4. **Commit** et push
   ```bash
   git add config/context-routing.json
   git commit -m "config(routing): add new category XYZ"
   git push
   ```

5. **Sync** vers VPS (automatique via GitHub webhook)

### Ajouter une Nouvelle Catégorie

1. **Définir** dans `context-routing.json` :
   ```json
   {
     "categories": {
       "ma_nouvelle_categorie": {
         "localPath": "nouveau/dossier/",
         "description": "Description claire",
         "createIfMissing": true,
         "match": {
           "extensions": [".ext"],
           "nameContains": ["pattern_"]
         },
         "examples": ["exemple.ext"]
       }
     }
   }
   ```

2. **Créer** le dossier et README
   ```bash
   mkdir -p nouveau/dossier
   vim nouveau/dossier/README.md
   ```

3. **Ajouter** à `priorityOrder`
   ```json
   {
     "rules": {
       "priorityOrder": [
         "ma_nouvelle_categorie",
         "..."
       ]
     }
   }
   ```

4. **Tester** avec un fichier test

### Nettoyer `inbox/unknown/`

**Manuel** :
```bash
# Lister les fichiers unknown
ls -lh inbox/unknown/

# Examiner un fichier
cat inbox/unknown/mystery_file.txt

# Déplacer vers la bonne catégorie
mv inbox/unknown/mystery_file.txt rag/sources/
```

**Automatique** (workflow n8n recommandé) :
- Cron : Quotidien à 2h
- Archiver > 7 jours
- Supprimer > 30 jours
- Notifier si > 10 fichiers unknown/jour

### Monitoring

**Métriques à surveiller** :
- Nombre de fichiers unknown/jour (objectif : < 5)
- Temps de routage moyen
- Erreurs de classification
- Taille des dossiers logs/ et rag/index/

**Alertes** :
- ⚠️ > 10 fichiers unknown/jour → Revoir règles
- ⚠️ Erreur de déplacement → Permissions/espace disque
- ⚠️ Config JSON invalide → Rollback

---

## 📚 Voir Aussi

- [CLAUDE.md](../CLAUDE.md) - Guide complet Prolex
- [INDEX_PROLEX.md](../INDEX_PROLEX.md) - Navigation centrale
- [config/context-routing.json](../config/context-routing.json) - Config de routage
- [rag/](../rag/) - Dossiers RAG
- [mcp/](../mcp/) - Serveurs MCP
- [logs/](../logs/) - Logs système

---

**Maintainers** : Matthieu @ Automatt.ai
**Dernière mise à jour** : 2025-11-23
**Version** : 1.0.0
**Statut** : Spécification → Implémentation en cours
