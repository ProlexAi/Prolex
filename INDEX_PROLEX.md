# 📚 INDEX PROLEX v4 – NAVIGATION COMPLÈTE

> **Point d'entrée central** pour toute la documentation Prolex v4
> **Date** : 2025-11-22
> **Version** : 4.0

---

## 🎯 Démarrage rapide

### Pour comprendre le système en 5 minutes
1. Lire [Vue d'ensemble](#vue-densemble) (ci-dessous)
2. Lire [Architecture globale](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#2-architecture-cible-v4--vue-globale)
3. Consulter le [schéma Pipeline v4](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#21-pipeline-complet)

### Pour développer / modifier
1. Lire [Spécifications techniques](#spécifications-techniques)
2. Consulter [Catalogue d'outils](rag/tools/tools.yml)
3. Voir [Configuration système](config/system.yml)

### Pour déployer
1. Lire [Guide de déploiement](#déploiement-à-venir)
2. Vérifier [Checklist pré-déploiement](#checklist-pré-déploiement)

---

## 📖 Vue d'ensemble

### Qu'est-ce que Prolex ?

**Prolex** est le cerveau IA orchestrateur d'Automatt.ai, capable de :
- Comprendre les demandes en langage naturel
- Décider automatiquement des actions à entreprendre
- Designer, créer et modifier des workflows n8n de manière autonome
- Maintenir une traçabilité complète de toutes les opérations

### Architecture en 3 couches

```
┌──────────────────────────────────┐
│ KIMMY                            │  ← Filtre d'entrée
│ (LLM + n8n)                      │
└──────────┬───────────────────────┘
           ↓ KimmyPayload (JSON)
┌──────────────────────────────────┐
│ PROLEX                           │  ← Cerveau orchestrateur
│ (Claude 3.5 Sonnet + RAG)        │
└──────────┬───────────────────────┘
           ↓ ProlexOutput (JSON)
┌──────────────────────────────────┐
│ OPEX                             │  ← Bras exécutif
│ (n8n workflows + Proxy Master)   │
└──────────────────────────────────┘
```

### Nouveautés v4+

- ✨ Prolex peut **designer des workflows n8n** (`N8N_WORKFLOW_DESIGN`)
- ✨ Prolex peut **créer/modifier des workflows** en sandbox (`N8N_WORKFLOW_UPSERT`)
- ✨ Prolex peut **tester des workflows** avant déploiement (`N8N_WORKFLOW_TEST`)
- ✨ **4 niveaux d'autonomie** (0-3) pour contrôler les permissions
- ✨ **Garde-fous multiples** pour sécurité maximale

---

## 📂 Structure du repository

```
Prolex/
├── README.md                           # Point d'entrée GitHub
├── INDEX_PROLEX.md                     # Ce fichier (index central)
│
├── docs/                               # Documentation
│   ├── architecture/
│   │   └── ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md  # 📘 Doc maîtresse
│   ├── specifications/
│   │   ├── SPEC_KIMMY_V4.md            # Spec Kimmy
│   │   ├── SPEC_PROLEX_V4.md           # Spec Prolex
│   │   └── SPEC_OPEX_V4.md             # Spec Opex
│   └── guides/
│       ├── ANALYSE_CRITIQUE_V4.md      # Analyse experte
│       └── GUIDE_CLIENTS.md            # Guide pour clients
│
├── schemas/                            # Schémas JSON
│   ├── payloads/
│   │   ├── kimmy_payload.schema.json
│   │   └── prolex_output.schema.json
│   ├── logs/
│   │   └── systemjournal_entry.schema.json
│   └── tools/
│       └── tool_definition.schema.json
│
├── rag/                                # Base de connaissance Prolex
│   ├── tools/
│   │   └── tools.yml                   # 📋 Catalogue d'outils complet
│   ├── rules/
│   │   └── 01_REGLES_PRINCIPALES.md
│   ├── examples/
│   │   └── lead-example.json           # 📋 Exemple de lead pour offres
│   ├── offres/
│   │   └── proposition-v1.md           # 📝 Template offre commerciale v4.3
│   └── context/
│       └── 02_VARIABLES_ET_CONTEXTE.md
│
├── config/                             # Configuration système
│   ├── autonomy.yml                    # ⚙️ Niveaux d'autonomie
│   └── system.yml                      # ⚙️ Config globale
│
├── n8n-workflows/                      # Workflows n8n (source de vérité)
│   ├── 010_sync-github-to-n8n.json
│   ├── 020_example-hello-world.json
│   ├── 030_github-dev-log-to-sheets.json
│   ├── 250_proposal_auto.json          # 💰 Offre commerciale automatique
│   └── README.md
│
├── mcp/                                # Serveurs MCP
│   ├── n8n-server/                     # ✅ Existant
│   ├── google-sheets/                  # 🔜 À créer
│   ├── google-drive/                   # 🔜 À créer
│   └── systemjournal/                  # 🔜 À créer
│
├── infra/                              # Infrastructure
│   └── vps-prod/                       # 🔜 À compléter
│       ├── docker-compose.yml
│       ├── scripts/
│       └── docs/
│
└── cli/                                # CLI (futur)
    └── prolexctl/                      # 🔜 À créer
```

---

## 📘 Documentation architecture

### Document maître
| Document | Rôle | Quand le lire |
|----------|------|---------------|
| [ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md) | **Document principal** : vision complète du système | Premier doc à lire pour comprendre Prolex v4 |

### Sections clés du document maître
1. [Résumé exécutif](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#0-résumé-exécutif) - Vision 1000 pieds
2. [Pipeline complet](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#21-pipeline-complet) - Flux de bout en bout
3. [Kimmy v4](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#3-détails-v4--kimmy) - Filtre d'entrée
4. [Prolex v4](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#4-détails-v4--prolex-cerveau-orchestrateur) - Cerveau
5. [Opex v4](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#5-détails-v4--opex-n8n--proxy) - Exécution
6. [Autonomie](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#6-autonomie--variables-de-configuration-v4) - Niveaux 0-3
7. [Plan d'action](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md#8-plan-daction-v4-avec-workflows-éditables) - Roadmap

---

## 📋 Spécifications techniques

### Spécifications par composant
| Document | Composant | Contenu |
|----------|-----------|---------|
| [SPEC_KIMMY_V4.md](docs/specifications/SPEC_KIMMY_V4.md) | Kimmy | Filtre d'entrée, intents, KimmyPayload, modes safe/quick_actions |
| [SPEC_PROLEX_V4.md](docs/specifications/SPEC_PROLEX_V4.md) | Prolex | Cerveau orchestrateur, ProlexOutput, raisonnement, autonomie |
| [SPEC_OPEX_V4.md](docs/specifications/SPEC_OPEX_V4.md) | Opex | Workflows n8n, Proxy Master, gestion workflows, MCP |

### Points clés par spec

#### SPEC_KIMMY_V4
- 13 intents possibles (task_create, question_systeme, dev_workflow, etc.)
- Règles de routage vers Prolex
- Format KimmyPayload JSON
- Modes : `safe` vs `quick_actions`

#### SPEC_PROLEX_V4
- 4 types de sorties (answer, tool_call, multi_tool_plan, clarification)
- 4 niveaux d'autonomie (0-3)
- Variables de contexte
- Outils N8N_* pour gestion workflows

#### SPEC_OPEX_V4
- Catalogue de workflows (100+)
- Proxy Master (garde-fou)
- Bonnes pratiques développement workflows
- Sécurité et logging

---

## ⚙️ Configuration

### Fichiers de configuration

| Fichier | Rôle | Quand le modifier |
|---------|------|-------------------|
| [config/autonomy.yml](config/autonomy.yml) | Niveaux d'autonomie Prolex | Changer niveau, ajuster permissions |
| [config/system.yml](config/system.yml) | Config globale système | Changer limites, APIs, monitoring |
| [rag/tools/tools.yml](rag/tools/tools.yml) | Catalogue d'outils | Ajouter/modifier un outil |

### Variables clés

#### Autonomie
```yaml
# config/autonomy.yml
prolex_current_autonomy_level: 2  # 0, 1, 2, ou 3
```

#### Projet
```yaml
# config/system.yml
current_project: "Automatt.ai"
current_environment: "development"
```

#### Kimmy
```yaml
# config/system.yml
kimmy:
  mode: "quick_actions"  # ou "safe"
```

---

## 📁 Organisation des Fichiers (Context Orchestrator)

### Vue d'ensemble

**Principe** : **GitHub Prolex = Source de vérité unique**

Tous les fichiers de contexte (RAG, MCP, logs, configs) sont organisés dans une seule structure cohérente, versionnée dans Git et synchronisée sur tous les environnements.

### Document principal

| Document | Rôle |
|----------|------|
| [CONTEXT_ORCHESTRATOR.md](docs/CONTEXT_ORCHESTRATOR.md) | **Documentation complète** du système de routage des fichiers |

### Configuration

| Fichier | Rôle |
|---------|------|
| [config/context-routing.json](config/context-routing.json) | **Configuration de routage** : catégories, patterns, webhooks |

### Structure des dossiers

```
Prolex/
├── rag/
│   ├── sources/          # 📄 Documents sources pour RAG (versionnés)
│   ├── index/            # 🔍 Index vectoriels (générés, non versionnés)
│   ├── context/          # 📋 Contextes système (existant)
│   ├── rules/            # 📐 Règles Prolex (existant)
│   └── tools/            # 🛠️ Catalogue outils (existant)
│
├── docs/
│   └── contextes/        # 💬 Prompts & instructions Kimmy/Prolex/Opex
│
├── mcp/
│   ├── */src/            # Code source MCP (versionnés)
│   ├── build/            # 🔨 Builds compilés (non versionnés)
│   └── config/           # ⚙️ Configs MCP (.example versionnés, .env non)
│
├── logs/
│   ├── tech/             # 🐛 Logs techniques (non versionnés)
│   └── system/           # 💻 Logs infrastructure (non versionnés)
│
└── inbox/
    └── unknown/          # 📥 Fichiers non classifiés (buffer temporaire)
```

### Catégories principales

| Catégorie | Path | Git | Rôle |
|-----------|------|-----|------|
| `rag_source` | `rag/sources/` | ✅ | Documents sources pour RAG |
| `rag_index` | `rag/index/` | ❌ | Index vectoriels générés |
| `contexte_system` | `docs/contextes/` | ✅ | Prompts système LLM |
| `mcp_source` | `mcp/` | ✅ | Code TypeScript/JS |
| `mcp_build` | `mcp/build/` | ❌ | Fichiers compilés |
| `mcp_config` | `mcp/config/` | ⚠️ | Configs (secrets ignorés) |
| `logs_tech` | `logs/tech/` | ❌ | Logs applicatifs |
| `logs_system` | `logs/system/` | ❌ | Logs infrastructure |
| `unknown` | `inbox/unknown/` | ❌ | Non classifiés → notification |

### Workflow automatique

```
Fichier reçu → Classification (context-routing.json)
    ↓
Routage vers dossier approprié
    ↓
Si "unknown" → Notification webhook n8n
    ↓
(Optionnel) Trigger workflows downstream
    (ex: RAG indexing si rag_source)
```

### Commandes CLI (à venir)

```bash
# Classer un fichier
prolexctl context route /path/to/file.md

# Lister les catégories
prolexctl context categories

# Valider la config
prolexctl context validate-config
```

---

## 🔒 Sécurité et Restrictions

### 🚨 ZONE INTERDITE : Cash Workflows

**Date de verrouillage** : 2025-11-22

Prolex est **STRICTEMENT INTERDIT** de toucher aux workflows générateurs de revenus.

**Document principal** : [CASH_WORKFLOWS_LOCK.md](CASH_WORKFLOWS_LOCK.md)

**Workflows protégés** :
- `200_leadgen_li_mail.json` - Génération de leads
- `250_proposal_auto.json` - **CRITIQUE** - Propositions commerciales
- `300_content_machine.json` - Machine à contenu
- `400_invoice_stripe_auto.json` - **CRITIQUE** - Facturation Stripe
- `450_relances_impayes.json` - **CRITIQUE** - Relances impayés
- `999_master_tracker.json` - **CRITIQUE** - Tracker cash

**Actions interdites** :
- ❌ Créer (workflows avec patterns interdits)
- ❌ Modifier (workflows cash existants)
- ❌ Supprimer
- ❌ Déclencher manuellement
- ❌ Réparer
- ❌ Analyser
- ❌ Proposer des améliorations

**Verrou technique** :
- Code: `mcp/n8n-server/src/security/cashWorkflowGuard.ts`
- Config: `config/cash_workflows_forbidden.yml`
- Appliqué dans: `createWorkflow()`, `updateWorkflow()`, `triggerWorkflow()`

**En cas de violation** :
1. ⛔ Arrêt immédiat de l'opération
2. 📱 Alerte Telegram à Matthieu
3. 📝 Log SystemJournal (severity: CRITICAL)

**Seul autorisé** : Matthieu

---

## 🛠️ Outils disponibles

### Catalogue complet
Voir [rag/tools/tools.yml](rag/tools/tools.yml)

### Catégories d'outils

| Catégorie | Nombre | Exemples |
|-----------|--------|----------|
| **Productivité** | 5 | TASK_CREATE, CAL_EVENT_CREATE, DOC_CREATE_NOTE |
| **Documentation** | 3 | DOC_CREATE_NOTE, DOC_UPDATE, CREATE_GOOGLE_DOC |
| **Logging** | 1 | LOG_APPEND |
| **Recherche** | 1 | WEB_SEARCH |
| **DevOps** | 4 | GIT_CLONE, GIT_SYNC, GITHUB_OPEN_PR |
| **Client** | 3 | CLIENT_WORKFLOW_RUN, CLIENT_ONBOARDING |
| **Monitoring** | 2 | HEALTHCHECK_RUN, GLOBAL_ERROR_ALERT |
| **Backup** | 2 | BACKUP_RUN, RESTORE_BACKUP |
| **Reporting** | 3 | COST_REPORT_RUN, WEEKLY_SUMMARY |
| **N8N Management** | 5 | N8N_WORKFLOW_DESIGN, N8N_WORKFLOW_UPSERT, N8N_WORKFLOW_TEST |
| **Automation** | 1 | TRIGGER_WORKFLOW |
| **Communication** | 2 | SEND_EMAIL, SEND_TELEGRAM_MESSAGE |
| **Core** | 2 | PROXY_EXEC, TODO_CREATE |

**Total** : 34 outils

### Outils v4+ (nouveauté)

| Outil | Niveau requis | Rôle |
|-------|---------------|------|
| `N8N_WORKFLOW_DESIGN` | 2+ | Concevoir un workflow n8n |
| `N8N_WORKFLOW_UPSERT` | 3 | Créer/modifier workflow (sandbox) |
| `N8N_WORKFLOW_TEST` | 3 | Tester un workflow |
| `N8N_WORKFLOW_PROMOTE` | Manuel | Promouvoir vers production |

---

## 📊 Schémas JSON

### Schémas principaux

| Schéma | Fichier | Utilisé par |
|--------|---------|-------------|
| **KimmyPayload** | [schemas/payloads/kimmy_payload.schema.json](schemas/payloads/kimmy_payload.schema.json) | Kimmy → Prolex |
| **ProlexOutput** | [schemas/payloads/prolex_output.schema.json](schemas/payloads/prolex_output.schema.json) | Prolex → Proxy |
| **SystemJournalEntry** | [schemas/logs/systemjournal_entry.schema.json](schemas/logs/systemjournal_entry.schema.json) | Tous → SystemJournal |
| **ToolDefinition** | [schemas/tools/tool_definition.schema.json](schemas/tools/tool_definition.schema.json) | Définition d'outils |

---

## 🚀 Déploiement (à venir)

### Checklist pré-déploiement

#### Infrastructure
- [ ] VPS configuré
- [ ] Docker + Docker Compose installés
- [ ] Domaines configurés (n8n.automatt.ai, anythingllm.automatt.ai)
- [ ] Certificats SSL (Let's Encrypt)

#### Services
- [ ] Traefik déployé et testé
- [ ] n8n déployé et configuré
- [ ] AnythingLLM déployé et configuré
- [ ] PostgreSQL + Redis opérationnels

#### Configuration
- [ ] Credentials n8n configurées (Google, GitHub, etc.)
- [ ] RAG Prolex importé dans AnythingLLM
- [ ] Workflows n8n déployés depuis GitHub
- [ ] SystemJournal créé (Google Sheets)

#### Tests
- [ ] Test workflow sync GitHub → n8n
- [ ] Test Kimmy → Prolex → Opex (end-to-end)
- [ ] Test création workflow auto (N8N_WORKFLOW_DESIGN → UPSERT → TEST)
- [ ] Test logging SystemJournal

---

## 📚 Guides pratiques

### Pour développeurs

#### Ajouter un nouvel outil
1. Définir dans [rag/tools/tools.yml](rag/tools/tools.yml)
2. Créer schéma payload `schemas/payloads/<tool>.schema.json`
3. Créer workflow n8n `n8n-workflows/<num>_<tool>.json`
4. Mettre à jour Proxy Master pour router l'outil
5. Tester + documenter

#### Créer un nouveau workflow n8n
1. Designer dans n8n UI
2. Exporter JSON
3. Ajouter dans `n8n-workflows/` avec numéro approprié
4. Commit + push → sync auto via webhook GitHub

#### Modifier le niveau d'autonomie
1. Éditer `config/autonomy.yml`
2. Changer `prolex_current_autonomy_level`
3. Vérifier impacts sur outils autorisés

### Pour utilisateurs

#### Utiliser Prolex au quotidien
1. Envoyer demande via chat/WhatsApp/email
2. Kimmy filtre et structure
3. Prolex planifie et exécute (selon autonomie)
4. Vérifier résultat dans SystemJournal

#### Interpréter les logs
- Consulter Google Sheet `Automatt_Logs`, onglet `SystemJournal`
- Colonnes clés : `timestamp`, `agent`, `action_type`, `result.status`
- Filtrer par `request_id` pour tracer une demande

---

## 🔍 Analyse & amélioration

### Documents d'analyse

| Document | Rôle |
|----------|------|
| [ANALYSE_CRITIQUE_V4.md](docs/guides/ANALYSE_CRITIQUE_V4.md) | Analyse experte : forces, faiblesses, risques, recommandations |
| [GUIDE_CLIENTS.md](docs/guides/GUIDE_CLIENTS.md) | Documentation pour futurs clients Automatt.ai |

### Métriques à surveiller

- **Taux d'escalade Kimmy → Prolex** : 40-60% idéal
- **Taux de succès Prolex** : > 90%
- **Coût moyen par requête** : < $0.05
- **Latence moyenne** : < 5s

---

## 🆘 Aide & support

### Questions fréquentes

**Q: Comment changer le niveau d'autonomie de Prolex ?**
R: Éditer `config/autonomy.yml`, modifier `prolex_current_autonomy_level`.

**Q: Comment ajouter un nouvel outil ?**
R: Voir [Guides pratiques](#pour-développeurs) > Ajouter un nouvel outil.

**Q: Où voir les logs d'exécution ?**
R: Google Sheet `Automatt_Logs`, onglet `SystemJournal`.

**Q: Comment tester un workflow avant prod ?**
R: Utiliser `N8N_WORKFLOW_TEST` sur sandbox, puis `N8N_WORKFLOW_PROMOTE` avec confirmation.

### Contact

- **Matthieu** (Automatt.ai) : matthieu@automatt.ai
- **Repo GitHub** : [ProlexAi/Prolex](https://github.com/ProlexAi/Prolex)

---

## 📅 Changelog

### v4.0 (2025-11-22)
- ✨ Intégration Kimmy + Prolex + Opex
- ✨ Gestion autonome workflows n8n
- ✨ 4 niveaux d'autonomie
- ✨ 34 outils disponibles
- ✨ Documentation complète
- 💰 **Nouveau**: Workflow 250 - Offre commerciale automatique (lead → proposition → email)
- 💰 **Nouveau**: 4 outils Sales & Automation (TRIGGER_WORKFLOW, SEND_EMAIL, SEND_TELEGRAM_MESSAGE, CREATE_GOOGLE_DOC)
- 📝 **Nouveau**: Template offre Prolex v4.3 à 6 900 € HT

---

**Maintenu par** : Matthieu (Automatt.ai)
**Dernière mise à jour** : 2025-11-22
**Version** : 4.0
