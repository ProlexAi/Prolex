# ARCHITECTURE DU PROJET PROLEX v5
> Documentation de la structure complète du système Automatt.ai
> Dernière mise à jour : 22 novembre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Structure des dossiers](#structure-des-dossiers)
3. [Architecture 3 couches](#architecture-3-couches)
4. [Modules et composants](#modules-et-composants)
5. [Technologies utilisées](#technologies-utilisées)
6. [Flux de données](#flux-de-données)
7. [Sécurité et autonomie](#sécurité-et-autonomie)

---

## VUE D'ENSEMBLE

### Concept général

**Prolex v5** est un système d'orchestration IA multi-couches conçu pour automatiser les tâches de productivité, développement et gestion client.

### Architecture 3 couches

```
┌─────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  KIMMY - Filtre d'entrée intelligent                        │
│  • Analyse et classification des demandes                   │
│  • Détection de langue et intent                            │
│  • Actions simples ou escalade vers Prolex                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  PROLEX - Cerveau orchestrateur                             │
│  • Planification stratégique                                │
│  • Design de workflows n8n                                  │
│  • Orchestration multi-outils                               │
│  • Auto-amélioration via SystemJournal                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  OPEX - Couche d'exécution                                  │
│  • opex-cli (CLI opérationnelle)                            │
│  • Opex Deployer (GUI DevOps)                               │
│  • Proxy Master (garde-fou)                                 │
│  • Workflows n8n (30+ workflows métier)                     │
│  • MCP Servers (connecteurs externes)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  SYSTEMJOURNAL - Mémoire et traçabilité                     │
│  • Google Sheets : logs complets                            │
│  • Analyse patterns et coûts                                │
│  • Audit et conformité                                      │
└─────────────────────────────────────────────────────────────┘
```

### Séparation des responsabilités

| Couche | Rôle | Verbe |
|--------|------|-------|
| **Kimmy** | Filtre d'entrée | Comprend |
| **Prolex** | Cerveau orchestrateur | Pense |
| **Opex** | Exécution | Fait |
| **SystemJournal** | Traçabilité | Mémorise |
| **RAG** | Contextualisation | Informe |

---

## STRUCTURE DES DOSSIERS

### Arborescence complète

```
/home/user/Prolex/
│
├── 📁 config/                          # Configuration système
│   ├── autonomy.yml                    # Niveaux d'autonomie 0-3
│   ├── kimmy_config.yml               # Config filtre d'entrée
│   ├── prolex_config.yml              # Config cerveau orchestrateur
│   ├── system.yml                     # Config globale
│   └── README.md
│
├── 📁 docs/                            # Documentation complète
│   ├── architecture/
│   │   └── ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md
│   ├── specifications/
│   │   ├── SPEC_KIMMY_V4.md           # Spécification Kimmy
│   │   ├── SPEC_PROLEX_V4.md          # Spécification Prolex
│   │   └── SPEC_OPEX_V4.md            # Spécification Opex
│   ├── guides/
│   │   ├── ANALYSE_CRITIQUE_V4.md     # Analyse experte système
│   │   └── GUIDE_CLIENTS.md           # Documentation clients
│   ├── ARCHITECTURE.md                # Ce fichier
│   ├── RACCOURCIS_ET_COMMANDES.md     # Chemins et commandes utiles
│   └── HISTORIQUE_TRAVAUX.md          # Historique complet travaux
│
├── 📁 schemas/                         # Schémas JSON (Draft 07)
│   ├── payloads/
│   │   ├── kimmy_payload.schema.json  # Kimmy → Prolex
│   │   └── prolex_output.schema.json  # Prolex → Opex
│   ├── logs/
│   │   └── systemjournal_entry.schema.json
│   └── tools/
│       └── tool_definition.schema.json
│
├── 📁 rag/                             # Base de connaissance Prolex
│   ├── tools/
│   │   └── tools.yml                  # Catalogue 30+ outils
│   ├── rules/
│   │   └── 01_REGLES_PRINCIPALES.md   # Règles métier
│   ├── context/
│   │   └── 02_VARIABLES_ET_CONTEXTE.md
│   └── examples/                       # Exemples de résolution
│
├── 📁 n8n-workflows/                   # Workflows n8n (source de vérité)
│   ├── 010_sync-github-to-n8n.json    # Sync auto GitHub → n8n
│   ├── 020_example-hello-world.json
│   ├── 030_github-dev-log-to-sheets.json
│   ├── README.md                       # Documentation sync
│   ├── QUICK_START.md                 # Démarrage rapide 15min
│   └── GITHUB_DEV_LOG_SETUP.md
│
├── 📁 mcp/                             # Serveurs MCP
│   └── n8n-server/                    # MCP pour piloter n8n
│       ├── src/
│       │   ├── index.ts               # Serveur MCP principal
│       │   ├── n8nClient.ts           # Client HTTP n8n API
│       │   └── types.ts               # Types TypeScript
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── 📁 .github/
│   └── workflows/
│       ├── ci.yml                     # CI/CD pipeline
│       ├── pr-validation.yml
│       └── security.yml
│
├── INDEX_PROLEX.md                    # Point d'entrée central
└── README.md                          # Documentation principale
```

### Dossiers clés

| Dossier | Rôle | Contenu principal |
|---------|------|-------------------|
| `config/` | Configuration | YAML de config système, autonomie, Kimmy, Prolex |
| `docs/` | Documentation | Spécifications, architecture, guides |
| `schemas/` | Validation | Schémas JSON pour payloads et logs |
| `rag/` | Connaissance | Outils, règles, contexte pour RAG Prolex |
| `n8n-workflows/` | Workflows | Fichiers JSON n8n, sync GitHub |
| `mcp/` | Connecteurs | Serveurs MCP (n8n, futurs) |

---

## ARCHITECTURE 3 COUCHES

### 1. KIMMY - Filtre d'entrée intelligent

#### Responsabilités
- Premier point de contact avec l'utilisateur
- Analyse et classification des demandes
- Détection de langue (toujours français)
- Classification en 13 intents possibles
- Évaluation de complexité (simple/complex/unclear)
- Extraction de paramètres structurés
- **Décision** : traitement direct ou escalade vers Prolex

#### Technologies
- **LLM** : GPT-4 Turbo (OpenAI) ou Claude Haiku (Anthropic)
- **Runtime** : n8n workflow

#### Modes de fonctionnement
- `safe` : Analyse uniquement, pas d'exécution
- `quick_actions` : Peut exécuter des actions simples (niveau 2)

#### Intents supportés (13 types)
1. `task_create` : Création tâche simple
2. `search_info` : Recherche web
3. `schedule_event` : Ajout calendrier
4. `doc_request` : Création note/doc
5. `status_check` : Vérification statut
6. `dev_workflow` : Workflows développement (GitHub, CI/CD)
7. `client_workflow` : Workflows clients (sensible)
8. `monitoring` : Monitoring/alertes
9. `backup_restore` : Backup/restauration (sensible)
10. `config_change` : Changement config (sensible)
11. `cost_analysis` : Analyse coûts
12. `n8n_workflow` : Gestion workflows n8n (v4+, sensible)
13. `clarification` : Demande clarification

#### Output
**KimmyPayload** (JSON structuré) :
```json
{
  "request_id": "uuid",
  "source": "chat|whatsapp|email|api",
  "raw_input": "texte original",
  "language": "fr",
  "kimmy_summary": "résumé 10-500 chars",
  "intent": "task_create",
  "complexity": "simple|complex|unclear",
  "confidence": 0.95,
  "requires_prolex": false,
  "suggested_tools": ["TASK_CREATE"],
  "parameters": {...},
  "constraints": {...}
}
```

---

### 2. PROLEX - Cerveau orchestrateur

#### Responsabilités
- Raisonnement stratégique et planification
- Orchestration multi-outils
- **Design de workflows n8n** (v4+)
- Auto-amélioration via analyse SystemJournal
- Gestion contexte via RAG (AnythingLLM)

#### Technologies
- **LLM** : Claude 3.5 Sonnet (Anthropic)
- **RAG** : AnythingLLM + Google Drive
- **Runtime** : n8n workflow + appels API

#### Niveaux d'autonomie (0-3)

| Niveau | Nom | Permissions | Usage recommandé |
|--------|-----|-------------|------------------|
| **0** | Lecture seule | READ, ANALYZE, PROPOSE_TODOS | Tests, démonstrations |
| **1** | Logs + Lecture | +LOG_APPEND, DOC_CREATE_NOTE, WEB_SEARCH | Découverte système |
| **2** | Actions low-risk | +TASK_CREATE, CAL_EVENT_CREATE, N8N_WORKFLOW_DESIGN | **Usage quotidien** ⭐ |
| **3** | Actions avancées | +CLIENT_WORKFLOW_RUN, N8N_WORKFLOW_UPSERT/TEST | DevOps, workflows clients |

**Niveau actuel** : **2** (configurable dans `config/autonomy.yml`)

#### Outils disponibles (30+)

**Catégories** :
- **Productivité** : TASK_CREATE, CAL_EVENT_CREATE, DOC_CREATE_NOTE
- **Documentation** : DOC_UPDATE
- **Logging** : LOG_APPEND
- **Recherche** : WEB_SEARCH
- **DevOps** : GIT_CLONE, GIT_SYNC, GITHUB_OPEN_PR
- **Clients** : CLIENT_WORKFLOW_RUN, CLIENT_ONBOARDING
- **Monitoring** : HEALTHCHECK_RUN, GLOBAL_ERROR_ALERT
- **Backup** : BACKUP_RUN, RESTORE_BACKUP
- **Reporting** : COST_REPORT_RUN, WEEKLY_SUMMARY
- **N8N Management (v4+)** : N8N_WORKFLOW_DESIGN, N8N_WORKFLOW_UPSERT, N8N_WORKFLOW_TEST, N8N_WORKFLOW_PROMOTE

Voir fichier complet : `rag/tools/tools.yml`

#### Types de réponse (ProlexOutput)

1. **answer** : Réponse textuelle directe
```json
{
  "type": "answer",
  "response_text": "Voici votre réponse...",
  "metadata": {...}
}
```

2. **tool_call** : Appel outil unique
```json
{
  "type": "tool_call",
  "tool": "TASK_CREATE",
  "payload": {...},
  "reasoning": "Pourquoi cet outil"
}
```

3. **multi_tool_plan** : Plan multi-étapes
```json
{
  "type": "multi_tool_plan",
  "steps": [
    {"step_id": 1, "tool": "WEB_SEARCH", "depends_on": []},
    {"step_id": 2, "tool": "DOC_CREATE_NOTE", "depends_on": [1]}
  ],
  "plan_summary": "Description du plan"
}
```

4. **clarification** : Questions (1-3 max)
```json
{
  "type": "clarification",
  "questions": ["Question 1?", "Question 2?"],
  "context": "Contexte de la demande"
}
```

---

### 3. OPEX - Couche d'exécution

#### Responsabilités
- Exécution concrète des actions
- Validation via Proxy Master (garde-fou)
- Routage vers workflows n8n appropriés
- Gestion des MCP Servers

#### Composants

##### A. Proxy Master (garde-fou)
- Point d'entrée unique pour toutes les exécutions
- Validation de sécurité
- Vérification autonomie
- Routage intelligent
- Logging SystemJournal

##### B. Workflows n8n (30+ workflows)

**Nommage** : `<catégorie>_<nom>.json`

**Catégories** :
- `000-099` : Core/Proxy
- `100-199` : Productivité (Tasks, Calendar, Docs)
- `200-299` : DevOps/GitHub
- `300-399` : Clients
- `400-499` : Monitoring/Backup
- `500-599` : Reporting
- `600-699` : Gestion n8n (v4+)

**Workflows clés** :
- `010_sync-github-to-n8n.json` : Sync auto GitHub → n8n
- `030_github-dev-log-to-sheets.json` : Logs dev → Google Sheets
- Workflows AUTO_PROLEX_* : Générés automatiquement par Prolex

##### C. MCP Servers

**MCP n8n Server** (`mcp/n8n-server/`)
- **Outils exposés** :
  - `list_workflows` : Liste tous workflows n8n
  - `trigger_workflow` : Déclenche un workflow spécifique
- **API utilisée** : n8n REST API v1
- **Technologies** : TypeScript, Node.js 18+, MCP SDK 1.0.4

---

## MODULES ET COMPOSANTS

### SystemJournal - Mémoire du système

#### Description
Google Sheets servant de log central et mémoire d'exécution.

#### Structure
- **Sheet** : "Automatt_Logs"
- **Colonnes** :
  - `timestamp` : Date/heure ISO 8601
  - `agent` : kimmy/prolex/opex/proxy/system
  - `action_type` : classification/execution/planning/error/workflow_*/backup/...
  - `request_id` : UUID de traçabilité
  - `user_id` : Identifiant utilisateur
  - `intent` : Intent Kimmy
  - `tool_used` : Outil appelé
  - `payload_snapshot` : Payload JSON
  - `result` : {status, data, error}
  - `metadata` : {execution_time_ms, tokens_used, cost_usd, autonomy_level, model}
  - `tags` : Tags de catégorisation
  - `notes` : Notes libres

#### Usages
- Traçabilité complète
- Audit et conformité
- Analyse patterns et erreurs
- Calcul coûts et performance
- Auto-amélioration Prolex

---

### RAG (Retrieval Augmented Generation)

#### Description
Base de connaissance enrichissant le contexte de Prolex.

#### Contenu

##### 1. Catalogue outils (`rag/tools/tools.yml`)
30+ outils définis avec :
- id, name, description
- category, risk_level
- auto_allowed_levels (quels niveaux autonomie)
- target (webhook URL ou MCP)
- payload_schema
- constraints, examples

##### 2. Règles métier (`rag/rules/01_REGLES_PRINCIPALES.md`)
- Règles de sécurité
- Règles de planification
- Règles de logging
- Règles de communication
- Règles d'auto-amélioration
- Règles de gestion erreurs
- Règles n8n (nommage, tags, validation)

##### 3. Variables et contexte (`rag/context/02_VARIABLES_ET_CONTEXTE.md`)
- Projet : Automatt.ai, environment
- Modèles : kimmy, prolex
- Autonomie : niveau actuel, mode
- Style : Architecte, Autonomous, Concise-Technical
- Infrastructure : VPS, n8n
- Limites : coûts, temps, rate limits
- Priorités : Sécurité > Traçabilité > Qualité > Clarification

##### 4. Exemples de résolution (`rag/examples/`)
Cas d'usage résolus pour apprentissage.

#### Technologies
- **Stockage** : Google Drive
- **Plateforme RAG** : AnythingLLM
- **Format** : Markdown, YAML

---

## TECHNOLOGIES UTILISÉES

### Stack Backend / Orchestration

| Technologie | Rôle | Version |
|-------------|------|---------|
| **n8n** | Workflow automation | Latest |
| **AnythingLLM** | Plateforme RAG | Latest |
| **PostgreSQL** | Base de données n8n | 15+ |
| **Redis** | Cache et sessions | 7+ |
| **Docker** | Containerisation | 24+ |
| **Traefik** | Reverse proxy + SSL | 2.10+ |

### Stack LLM / IA

| Modèle | Usage | Provider |
|--------|-------|----------|
| **Claude 3.5 Sonnet** | Cerveau Prolex | Anthropic |
| **GPT-4 Turbo** | Filtre Kimmy | OpenAI |
| **Claude Haiku** | Alternative Kimmy (légère) | Anthropic |

### Stack MCP / Intégrations

| Technologie | Rôle | Version |
|-------------|------|---------|
| **TypeScript** | Développement MCP | 5.7+ |
| **Node.js** | Runtime MCP | 18+ |
| **@modelcontextprotocol/sdk** | SDK officiel MCP | 1.0.4 |
| **axios** | Client HTTP APIs | 1.7.9 |
| **zod** | Validation schémas | 3.24.1 |

### APIs externes intégrées

| Service | Usage | Outils associés |
|---------|-------|-----------------|
| **Google Workspace** | Tasks, Calendar, Docs, Sheets, Drive | TASK_CREATE, CAL_EVENT_CREATE, DOC_CREATE_NOTE, LOG_APPEND, BACKUP_RUN |
| **GitHub** | Repos, Issues, PRs, Webhooks | GIT_CLONE, GIT_SYNC, GITHUB_OPEN_PR, sync auto workflows |
| **n8n API** | Gestion workflows | N8N_LIST_WORKFLOWS, N8N_WORKFLOW_UPSERT, N8N_WORKFLOW_TEST |

### Langages et formats

- **TypeScript** : MCP servers, types
- **JavaScript/Node.js** : Runtime MCP
- **JSON** : Schémas (Draft 07), workflows, payloads
- **YAML** : Configuration système
- **Markdown** : Documentation

---

## FLUX DE DONNÉES

### Pipeline complet

```
┌─────────────┐
│ Utilisateur │
└──────┬──────┘
       │ Texte brut
       ▼
┌─────────────────────────────────────────┐
│ KIMMY (n8n webhook)                     │
│ /webhook/kimmy-intake                   │
│                                         │
│ 1. Analyse langue                       │
│ 2. Classification intent                │
│ 3. Évaluation complexité                │
│ 4. Extraction paramètres                │
└──────┬──────────────────────┬───────────┘
       │                      │
       │ Simple               │ Complexe / Sensible
       │                      │
       ▼                      ▼
┌──────────────┐      ┌─────────────────────────────┐
│ Action       │      │ PROLEX (n8n webhook)        │
│ directe      │      │ /webhook/prolex-intake      │
│ (optionnel)  │      │                             │
└──────┬───────┘      │ 1. Enrichissement RAG       │
       │              │ 2. Raisonnement stratégique │
       │              │ 3. Planification            │
       │              │ 4. Vérification autonomie   │
       │              └──────┬──────────────────────┘
       │                     │ ProlexOutput
       │                     │
       └──────────┬──────────┘
                  ▼
         ┌─────────────────────────────────┐
         │ PROXY MASTER (n8n)              │
         │ /webhook/proxy-exec             │
         │                                 │
         │ 1. Validation sécurité          │
         │ 2. Vérification autonomie       │
         │ 3. Routage workflow             │
         └──────┬──────────────────────────┘
                │
                ▼
         ┌─────────────────────────────────┐
         │ Workflows n8n spécialisés       │
         │ (productivité, devops, clients) │
         │                                 │
         │ ou                              │
         │                                 │
         │ MCP Servers                     │
         └──────┬──────────────────────────┘
                │
                ▼
         ┌─────────────────────────────────┐
         │ APIs Externes                   │
         │ (Google, GitHub, n8n...)        │
         └──────┬──────────────────────────┘
                │
                ▼
         ┌─────────────────────────────────┐
         │ SYSTEMJOURNAL (Google Sheets)   │
         │ Automatt_Logs                   │
         │                                 │
         │ Toutes actions loggées          │
         └─────────────────────────────────┘
```

### Webhooks n8n

| Webhook | Input | Output | Rôle |
|---------|-------|--------|------|
| `/webhook/kimmy-intake` | Texte brut utilisateur | KimmyPayload JSON ou réponse directe | Analyse et classification |
| `/webhook/prolex-intake` | KimmyPayload JSON | ProlexOutput JSON | Planification stratégique |
| `/webhook/proxy-exec` | ProlexOutput JSON | Routage vers workflows | Validation et exécution |
| `/webhook/github-sync` | GitHub push event | Création/MAJ workflows n8n | Sync automatique |

---

## SÉCURITÉ ET AUTONOMIE

### Principes de sécurité

1. **Principe du moindre privilège**
   - Chaque agent a uniquement les permissions nécessaires
   - Niveaux d'autonomie progressifs (0→3)

2. **Validation multi-niveaux**
   - Validation schémas JSON (Draft 07)
   - Proxy Master : garde-fou systématique
   - Confirmation explicite pour actions high-risk

3. **Sandbox pour n8n**
   - Workflows générés par Prolex créés en mode inactif
   - Tests obligatoires avant activation
   - Promotion manuelle vers production

4. **Pas de secrets dans le code**
   - Credentials n8n (UI uniquement)
   - Variables d'environnement
   - Pas de commit de secrets GitHub

5. **Traçabilité complète**
   - Toutes actions loggées dans SystemJournal
   - Masquage données sensibles
   - Audit trail complet

6. **Escalade humaine**
   - Si ambiguïté ou risque élevé
   - Notifications via canal défini
   - Approbation explicite requise

### Niveaux d'autonomie détaillés

Voir fichier : `config/autonomy.yml`

#### Niveau 0 : Lecture seule
- **Actions autorisées** : READ, ANALYZE, PROPOSE_TODOS, ANSWER_QUESTIONS
- **Usage** : Tests, démonstrations, découverte
- **Coût max** : $0.05/requête

#### Niveau 1 : Lecture + Logs
- **Actions autorisées** : +LOG_APPEND, DOC_CREATE_NOTE, WEB_SEARCH, HEALTHCHECK_RUN
- **Usage** : Découverte système, apprentissage
- **Coût max** : $0.10/requête

#### Niveau 2 : Actions low-risk (RECOMMANDÉ) ⭐
- **Actions autorisées** : +TASK_CREATE, CAL_EVENT_CREATE, N8N_WORKFLOW_DESIGN
- **Usage** : Usage quotidien, productivité
- **Coût max** : $0.50/requête
- **Max outils/plan** : 5

#### Niveau 3 : Actions avancées
- **Actions autorisées** : +CLIENT_WORKFLOW_RUN, GIT_SYNC, N8N_WORKFLOW_UPSERT, N8N_WORKFLOW_TEST, BACKUP_RUN
- **Usage** : DevOps, workflows clients, administration
- **Coût max** : $2.00/requête
- **Max outils/plan** : 10
- **Contraintes** : Sandbox only pour n8n

### Garde-fous globaux (tous niveaux)

**Actions nécessitant TOUJOURS confirmation humaine** :
- `N8N_WORKFLOW_PROMOTE` : Passage sandbox → production
- `RESTORE_BACKUP` : Restauration backup
- `GIT_OPERATIONS_ON_MAIN` : Opérations sur branche main

---

## INNOVATIONS v5

### 1. Gestion autonome workflows n8n
- Prolex peut **designer** des workflows n8n à partir d'une description naturelle
- Création/modification en **sandbox** (workflows inactifs)
- **Tests automatisés** avant activation
- **Promotion manuelle** vers production (garde-fou)
- **Traçabilité complète** : tag AUTO_PROLEX, logs SystemJournal

### 2. Autonomie à 4 niveaux
- Contrôle fin des permissions Prolex
- Évolution progressive selon besoin
- Niveau 2 recommandé pour usage quotidien

### 3. Auto-amélioration
- Analyse SystemJournal pour détecter patterns
- Génération TODO pour optimisations RAG
- Pas de modification directe du code/config (sécurité)

### 4. Sync automatique GitHub ↔ n8n
- Push GitHub → création/MAJ automatique workflows n8n
- Fichiers `.json` dans `n8n-workflows/`
- Workflow dédié : `010_sync-github-to-n8n.json`

### 5. Multi-sources de vérité
- **Code/Config** : GitHub repo ProlexAi/Prolex
- **Workflows n8n** : n8n-workflows/*.json (sync auto)
- **Logs** : Google Sheets Automatt_Logs
- **Documentation** : docs/ dans repo

---

## MÉTRIQUES ET OBJECTIFS v5

### Objectifs de performance

| Métrique | Objectif |
|----------|----------|
| Taux de succès Prolex | > 90% |
| Coût moyen/requête | < $0.05 |
| Latence moyenne | < 5s |
| Taux escalade Kimmy→Prolex | 40-60% |
| Satisfaction utilisateur | > 4.5/5 |

### Limites système

| Limite | Valeur | Configurable dans |
|--------|--------|-------------------|
| Coût max/requête (niveau 2) | $0.50 | `config/autonomy.yml` |
| Coût max/jour | $20.00 | `config/system.yml` |
| Coût max/mois | $500.00 | `config/system.yml` |
| Temps max exécution | 10 minutes | `config/system.yml` |
| Rate limit API | 30 req/min | `config/system.yml` |
| Max outils/plan (niveau 2) | 5 | `config/autonomy.yml` |
| Max questions clarification | 3 | `config/prolex_config.yml` |

### Monitoring (SystemJournal)

**Données loggées** :
- Toutes actions (classification, execution, planning, errors)
- Métriques : temps exécution, tokens, coûts
- Métadonnées : autonomie, modèle, résultat

**Alertes** :
- Erreurs répétées
- Dépassement seuils coûts
- Échecs workflows critiques

**Rapports** :
- Quotidiens : résumé activité
- Hebdomadaires : analyse patterns
- Mensuels : coûts et ROI

---

## SOURCES DE VÉRITÉ

| Élément | Source | Emplacement |
|---------|--------|-------------|
| Code source | GitHub | `github.com/ProlexAi/index-prolex` |
| Configuration | GitHub | `config/*.yml` |
| Workflows n8n | GitHub + n8n | `n8n-workflows/*.json` (sync auto) |
| Logs exécution | Google Sheets | SystemJournal > Automatt_Logs |
| Documentation | GitHub | `docs/**/*.md` |
| Base de connaissance RAG | GitHub + Google Drive | `rag/**/*` |
| Schémas JSON | GitHub | `schemas/**/*.schema.json` |

---

## CONTACT ET RESSOURCES

**Projet** : Automatt.ai
**Version** : v4+ (avec gestion autonome workflows n8n)
**Repository** : https://github.com/ProlexAi/index-prolex
**Documentation complète** : `/docs/`

**Fichiers clés** :
- Point d'entrée : `INDEX_PROLEX.md`
- README principal : `README.md`
- Architecture système : `docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md`
- Spécifications : `docs/specifications/SPEC_*.md`

---

**Cette architecture représente un système d'orchestration IA complet, modulaire et évolutif, avec une séparation claire des responsabilités et une traçabilité totale des opérations.**
