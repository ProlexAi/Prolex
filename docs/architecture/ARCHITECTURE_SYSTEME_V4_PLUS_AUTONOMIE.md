# 🏗️ PROLEX v4 – ARCHITECTURE SYSTÈME COMPLÈTE

> **Version**: 4.0+ (avec autonomie étendue et gestion n8n)
> **Date**: 2025-11-22
> **Entreprise**: Automatt.ai
> **Repo**: [ProlexAi/Prolex](https://github.com/ProlexAi/Prolex)

---

## 0. Résumé exécutif

### Vision globale

**Prolex** est le cerveau IA orchestrateur d'Automatt.ai, capable de :
- Comprendre les demandes en langage naturel
- Décider automatiquement des actions à entreprendre
- Designer, créer et modifier des workflows n8n de manière autonome
- Maintenir une traçabilité complète de toutes les opérations

### Composants clés

| Composant | Rôle | Technologie |
|-----------|------|-------------|
| **Kimmy** | Filtre d'entrée intelligent | LLM + n8n |
| **Prolex** | Cerveau orchestrateur | Claude 3.5 Sonnet (AnythingLLM) |
| **Opex** | Bras exécutif | n8n workflows + Proxy Master |
| **SystemJournal** | Mémoire d'exécution | Google Sheets + MCP |
| **RAG** | Base de connaissance | Google Drive + docs structurés |

### Sources de vérité

- **Technique** : Repo GitHub `ProlexAi/Prolex`, dossier `infra/vps-prod/`
- **Workflows** : Package n8n versionnés dans `n8n-workflows/`
- **Configuration** : Fichiers YAML dans `config/` et `rag/`
- **Logs** : Google Sheet `Automatt_Logs`, onglet `SystemJournal`

### 💥 Nouveautés v4+

À partir d'un niveau d'autonomie suffisant, Prolex peut :
- **Designer** des workflows n8n à partir de descriptions en langage naturel
- **Créer** des workflows en sandbox avec tag `AUTO_PROLEX`
- **Modifier** des workflows existants de manière contrôlée
- **Tester** les workflows avant promotion en production
- **S'auto-améliorer** en proposant des optimisations

---

## 1. Situation actuelle

### 1.1 Infrastructure technique

```
Repo GitHub: ProlexAi/Prolex
├── infra/vps-prod/
│   ├── docker-compose.yml      # Stack Traefik + n8n + AnythingLLM + PostgreSQL + Redis
│   ├── .env.example
│   ├── traefik/
│   │   └── traefik.yml
│   ├── scripts/
│   │   ├── bootstrap_vps.sh
│   │   ├── backup_prolex.sh
│   │   └── restore_prolex.sh
│   └── docs/
│       ├── ARCHITECTURE.md
│       ├── DEPLOY.md
│       └── SECURITY.md
├── mcp/
│   ├── n8n-server/             # MCP pour piloter n8n
│   ├── google-sheets/          # (à créer)
│   ├── google-drive/           # (à créer)
│   └── systemjournal/          # (à créer)
├── n8n-workflows/
│   ├── 010_sync-github-to-n8n.json
│   ├── 020_example-hello-world.json
│   └── 030_github-dev-log-to-sheets.json
├── schemas/
│   ├── payloads/
│   ├── tools/
│   └── logs/
├── rag/
│   ├── tools/
│   ├── rules/
│   ├── examples/
│   └── context/
└── config/
```

### 1.2 État des briques existantes

✅ **Déjà opérationnel** :
- Infrastructure VPS (Traefik + n8n + AnythingLLM)
- MCP n8n pour lister et déclencher des workflows
- Workflows de base (sync GitHub, logs, hello-world)
- SystemJournal dans Google Sheets

🚧 **À développer** :
- Kimmy (workflow maître + logique de filtrage)
- Prolex (configuration RAG + AnythingLLM)
- Proxy Master (validation et routage)
- Workflows de gestion n8n (design, upsert, test)
- MCP additionnels (Google Sheets, Drive, SystemJournal)

---

## 2. Architecture cible v4 – Vue globale

### 2.1 Pipeline complet

```
┌─────────────┐
│ Utilisateur │ (Matthieu, clients, bots, sites web...)
└──────┬──────┘
       ↓
┌──────────────────────────────────────────────────┐
│ KIMMY (Filtre d'entrée)                          │
│ - Détection langue                               │
│ - Classification intent                          │
│ - Évaluation complexité                          │
│ - Production KimmyPayload                        │
└──────┬──────────────────────────────────────────┘
       ↓ KimmyPayload (JSON)
┌──────────────────────────────────────────────────┐
│ PROLEX (Cerveau orchestrateur)                   │
│ - Raisonnement + planification                   │
│ - Choix des outils                               │
│ - Design de workflows (v4+)                      │
│ - Auto-amélioration                              │
└──────┬──────────────────────────────────────────┘
       ↓ ProlexOutput (tool_call | answer | plan | clarification)
┌──────────────────────────────────────────────────┐
│ PROXY MASTER (Garde-fou)                         │
│ - Validation des payloads                        │
│ - Vérification niveau d'autonomie                │
│ - Routage vers workflows n8n                     │
└──────┬──────────────────────────────────────────┘
       ↓ Appels validés
┌──────────────────────────────────────────────────┐
│ OPEX / n8n (Exécution)                           │
│ - Workflows Google (Tasks, Calendar, Docs)       │
│ - Workflows GitHub (clone, sync, PR)             │
│ - Workflows clients                              │
│ - Workflows système (backup, monitoring)         │
│ - Workflows gestion n8n (design, upsert, test)   │
└──────┬──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ APIs EXTERNES                                     │
│ - Google Workspace                               │
│ - GitHub                                         │
│ - Autres services                                │
└──────┬──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ SYSTEMJOURNAL + LOGS                             │
│ - Google Sheets (Automatt_Logs)                  │
│ - Métriques + coûts + erreurs                    │
│ - Historique complet                             │
└──────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│ RAG & TODO (Amélioration continue)               │
│ - Analyse des patterns                           │
│ - Proposition d'optimisations                    │
│ - Mise à jour documentation                      │
└──────────────────────────────────────────────────┘
```

### 2.2 Tableau de synthèse des rôles v4

| Composant | Où ça tourne | Rôle principal | Ne fait PAS |
|-----------|--------------|----------------|-------------|
| **Kimmy** | n8n (workflow maître) / LLM | Filtre l'entrée, comprend l'intention, estime complexité, construit KimmyPayload | Ne touche pas aux workflows, ne gère pas l'infra |
| **Prolex** | AnythingLLM sur VPS | Cerveau : raisonnement, choix d'outils, conception de workflows, auto-amélioration | Ne touche pas directement à Docker/Traefik, ne manipule pas n8n hors outils autorisés |
| **Proxy Master** | n8n | Garde-fou : valide les payloads Prolex, route vers les bons workflows / outils n8n | Ne raisonne pas, ne crée pas de stratégies |
| **n8n** | VPS/local | Exécute les workflows (Google, GitHub, SystemJournal, N8N_WORKFLOW_UPSERT, etc.) | Ne décide pas des plans, ne fait pas de stratégie |
| **SystemJournal** | Google Sheet | Journal d'exécution : actions, erreurs, coûts | Ne stocke pas la configuration métier ou l'archi |
| **RAG Prolex** | Drive + AnythingLLM | Base documentaire : archi, règles, outils, payloads, exemples | Ne doit pas être modifié directement par Prolex (il crée des TODO de mise à jour) |

---

## 3. Détails v4 – Kimmy

### 3.1 Identité & mission

- **Nom** : Kimmy
- **Rôle** : Filtre d'entrée & pré-cerveau
- **Langue** : Répond toujours en **français**, ton poli et pédagogique
- **Objectif** :
  - Protéger Prolex des demandes triviales ou mal formulées
  - Structurer les demandes complexes en JSON propre (`KimmyPayload`)
  - Optionnellement exécuter des Quick Actions simples

### 3.2 Étapes internes

1. **Analyse** :
   - Détection de langue
   - Résumé court (`kimmy_summary`)
   - Classification de l'intent
   - Évaluation de la complexité (`simple` | `complex` | `unclear`)
   - Calcul de la confiance (0-1)

2. **Extraction de paramètres** :
   - `title`, `description`, `due_date`, `client_name`, etc.
   - **Règle d'or** : pas d'invention, si doute → `null`

3. **Décision simple/complexe** :
   - Si simple + safe + confiance forte → Kimmy peut répondre / quick action
   - Sinon → JSON complet pour Prolex

### 3.3 Liste d'intents v4 (complète, non réduite)

| Intent | Description |
|--------|-------------|
| `task_create` | Créer / organiser une tâche perso, interne, ou technique |
| `task_update` | Modifier une tâche existante |
| `calendar_event` | Créer / modifier un événement calendrier |
| `doc_note` | Créer une note / mémo / idée dans un doc |
| `doc_structuring` | Organiser / restructurer un document existant |
| `question_simple` | Question de définition / explication courte |
| `question_systeme` | Question sur Prolex, Opex, architecture, sécurité |
| `debug_infra` | Problème sur VPS, Docker, n8n, AnythingLLM, domaine |
| `client_workflow` | Demande liée à un client / pack / besoin métier |
| `dev_workflow` | Demande liée au code, GitHub, MCP, workflows n8n |
| `reporting` | Demande de rapport (coûts, erreurs, suivi, performance) |
| `config_change` | Modification d'un paramètre de configuration système |
| `other` | Ne rentre dans rien, ou trop flou |

### 3.4 KimmyPayload (contrat JSON v4)

**Schéma** : `schemas/payloads/kimmy_payload.schema.json`

**Exemple** :
```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "source": "chat",
  "raw_input": "Créer une tâche pour réviser l'architecture Prolex avant vendredi",
  "language": "fr",
  "kimmy_summary": "Créer une tâche de révision de l'architecture Prolex avec échéance vendredi",
  "intent": "task_create",
  "complexity": "simple",
  "confidence": 0.95,
  "requires_prolex": false,
  "suggested_tools": ["TASK_CREATE_PERSO"],
  "parameters": {
    "title": "Réviser l'architecture Prolex",
    "description": "Mettre à jour le RAG et valider les workflows n8n",
    "due_date": "2025-11-25",
    "client_name": null,
    "priority": "high",
    "tags": ["architecture", "prolex", "urgent"]
  },
  "constraints": {
    "max_cost_usd": 0.02,
    "can_use_web": true,
    "sensitivity": "low"
  },
  "history_refs": []
}
```

### 3.5 Règles de routage v4

**Escalade obligatoire vers Prolex** si au moins UNE condition est vraie :
- `complexity = "complex"`
- OU `confidence < 0.80`
- OU `intent ∈ { question_systeme, debug_infra, client_workflow, dev_workflow, reporting, config_change, other }`
- OU présence de mots-clés sensibles (infra, sécurité, clients, argent, architecture, "plan complet", etc.)

**Traitement direct par Kimmy** possible si TOUT est vrai :
- `intent ∈ { task_create, doc_note, question_simple }`
- `complexity = "simple"`
- `confidence ≥ 0.85`
- Pas de mot-clé sensible
- Action réversible (tâche perso, note, log simple)

---

## 4. Détails v4 – Prolex

### 4.1 Identité & variables principales

- **Nom** : Prolex
- **Rôle** : Architecte système & orchestrateur d'automatisations
- **Modèle** : Claude 3.5 Sonnet via AnythingLLM
- **Variables de contexte** (dans `rag/context/02_VARIABLES_ET_CONTEXTE.md`) :

| Variable | Valeur v4 | Description |
|----------|-----------|-------------|
| `agent_role` | Architecte & Stratège | Ne fait pas de bricolage au hasard, construit des solutions |
| `execution_mode` | Autonomous | Peut agir seul selon les niveaux d'autonomie |
| `security_level` | High-Check | Sévère sur actions irréversibles |
| `memory_scope` | Project-Centric | Priorise le projet Automatt / client actif |
| `tool_usage` | Proxy-Only | Passe uniquement via Proxy Master pour toucher n8n |
| `response_style` | Concise-Technical | Format : État → Actions prévues → Résultat / suite |
| `fallback_model` | Claude Sonnet | Si changement de modèle, rester au même niveau de qualité |
| `autonomy_level` | 2 ou 3 (v4 opti) | Niveau d'autonomie courant (0–3) |

### 4.2 Entrée : KimmyPayload

Prolex part du principe qu'il reçoit toujours un objet compatible avec `KimmyPayload`.

Si le JSON est invalide / incomplet :
- Soit il génère une sortie `clarification`
- Soit il refuse d'agir et explique clairement le problème

### 4.3 Sorties autorisées (ProlexOutput v4)

**Schéma** : `schemas/payloads/prolex_output.schema.json`

Prolex ne produit que **4 types** d'objets :

#### Type 1 : `answer`
Réponse directe à l'utilisateur, sans exécuter d'action.

```json
{
  "type": "answer",
  "content": "L'architecture Prolex v4 repose sur trois piliers : Kimmy (filtre), Prolex (cerveau), et Opex (exécution n8n)."
}
```

#### Type 2 : `tool_call`
Appel d'un outil unique.

```json
{
  "type": "tool_call",
  "tool": "TASK_CREATE_PERSO",
  "payload": {
    "title": "Réviser l'architecture Prolex",
    "description": "Mettre à jour le RAG et valider les workflows n8n",
    "due_date": "2025-11-25"
  }
}
```

#### Type 3 : `multi_tool_plan`
Plan séquentiel d'appels d'outils (pour actions complexes).

```json
{
  "type": "multi_tool_plan",
  "plan": [
    {
      "step": 1,
      "tool": "N8N_WORKFLOW_DESIGN",
      "payload": {
        "goal": "Automatiser la création d'une tâche Google Tasks à partir d'un message WhatsApp",
        "inputs": ["texte du message", "numéro WhatsApp"],
        "outputs": ["id_tache_google", "lien_tache"]
      }
    },
    {
      "step": 2,
      "tool": "N8N_WORKFLOW_UPSERT",
      "payload": {
        "target": "sandbox",
        "workflow_name": "AUTO_PROLEX_WhatsApp_To_GTask",
        "mode": "create_or_update",
        "tags": ["AUTO_PROLEX", "sandbox"]
      },
      "depends_on": [1]
    },
    {
      "step": 3,
      "tool": "N8N_WORKFLOW_TEST",
      "payload": {
        "workflow_name": "AUTO_PROLEX_WhatsApp_To_GTask"
      },
      "depends_on": [2]
    }
  ]
}
```

#### Type 4 : `clarification`
Questions pour obtenir des informations manquantes (1 à 3 questions max).

```json
{
  "type": "clarification",
  "questions": [
    "Peux-tu préciser si ce workflow est pour un usage perso ou pour un client ?",
    "Souhaites-tu que le workflow soit déployé directement en production ou testé d'abord en sandbox ?"
  ]
}
```

### 4.4 Rôle élargi de Prolex v4+

Prolex peut maintenant :
- Exploiter le RAG, SystemJournal, et la connaissance de l'infra pour proposer :
  - Du texte (réponses)
  - Des scripts d'actions (`tool_call`)
  - Des designs de workflows n8n
  - Des modifications de workflows existants

- Utiliser les tools `N8N_*` pour :
  - Générer un plan de workflow (`N8N_WORKFLOW_DESIGN`)
  - Créer/mettre à jour un workflow dans sandbox (`N8N_WORKFLOW_UPSERT`)
  - Tester un workflow (`N8N_WORKFLOW_TEST`)
  - Demander explicitement une promotion en prod (via un TODO ou un outil dédié)

### 4.5 Garde-fous importants

- Prolex ne touche **jamais** directement à Docker, Traefik, ni aux fichiers du repo → il passe par des outils n8n/MCP
- Pour les workflows n8n :
  - Il travaille d'abord dans un environnement **sandbox** (tag/tagging spécifique)
  - Il marque clairement dans la description que le workflow est `"AUTO_PROLEX"`
  - La promotion en prod est **manuelle** ou via un outil `N8N_WORKFLOW_PROMOTE` qui nécessite une confirmation explicite

---

## 5. Détails v4 – Opex (n8n + Proxy)

### 5.1 Vision d'ensemble d'Opex

**Opex** = l'ensemble de tes workflows n8n + le Proxy Master.

**Rôles** :
- Exécuter les ordres de Prolex
- Gérer la connexion aux APIs (Google, GitHub, Sheets, Drive, etc.)
- Surveiller l'infra (healthchecks, alertes)
- Faire les backups
- Gérer les logs et coûts

### 5.2 Catalogue d'outils v4 (logiques) – Complet

Ce catalogue (fichier `rag/tools/tools.yml`) **n'est pas réduit** : on garde un vrai set riche.

| ID Outil | Catégorie | Rôle |
|----------|-----------|------|
| `TASK_CREATE` | Productivité | Créer tâche perso / interne |
| `TASK_UPDATE` | Productivité | Mettre à jour une tâche |
| `CAL_EVENT_CREATE` | Productivité | Créer un événement calendrier |
| `DOC_CREATE_NOTE` | Documentation | Créer une note / doc simple |
| `DOC_UPDATE` | Documentation | Mettre à jour / structurer un doc |
| `LOG_APPEND` | Logging | Ajouter une entrée SystemJournal / GSheet |
| `WEB_SEARCH` | Recherche | Recherche technique / business |
| `GIT_CLONE` | DevOps | Cloner un repo GitHub |
| `GIT_SYNC` | DevOps | Pull sur un repo existant |
| `CLIENT_WORKFLOW_RUN` | Client | Lancer un workflow client spécifique |
| `HEALTHCHECK_RUN` | Monitoring | Vérifier état des services |
| `BACKUP_RUN` | Backup | Lancer un backup n8n / repos / DB |
| `COST_REPORT_RUN` | Reporting | Générer un rapport coûts / usage API |
| `N8N_WORKFLOW_DESIGN` | N8N Management | Proposer/structurer un workflow (objectif, entrées, sorties, nodes) |
| `N8N_WORKFLOW_UPSERT` | N8N Management | Créer ou modifier un workflow n8n dans un espace sandbox |
| `N8N_WORKFLOW_TEST` | N8N Management | Lancer un test d'exécution sur un workflow sandbox |
| `N8N_WORKFLOW_PROMOTE` | N8N Management | Promouvoir un workflow sandbox vers prod (manuel) |
| `PROXY_EXEC` | Core / Proxy | Point d'entrée global pour exécuter un tool logique |

**Détails de chaque outil** dans `rag/tools/tools.yml` :
- `id`, `name`, `description`
- `risk_level` (low | medium | high)
- `auto_allowed_levels` (ex. `[1,2,3]`)
- `webhook` ou `mcp_tool` cible
- `payload_schema` (chemin vers `schemas/payloads/*.schema.json`)

### 5.3 Workflows n8n v4 (exemples non réduits)

#### Catégories de workflows :

**Core / Proxy**
- `proxy_master_exec` : reçoit les tool_call / multi_tool_plan, valide les payloads, appelle les autres workflows

**Productivité**
- `task_create`
- `task_update`
- `calendar_event_create`
- `doc_create_note`
- `doc_update`

**Dev / GitHub**
- `github_clone_repo`
- `github_sync_repo`
- `github_open_pr_from_patch`
- `github_list_repos_for_client`

**Client Workflows**
- `client_onboarding_standard`
- `client_monthly_report`
- `client_automation_pack_X` (une par pack important)

**Monitoring / Sécurité**
- `healthcheck_services`
- `global_error_alert`
- `security_alerts`

**Backup / Restauration**
- `backup_all_to_drive`
- `restore_from_backup`

**Reporting**
- `api_cost_tracker`
- `weekly_summary_to_sheet`
- `systemjournal_entry`

**Gestion n8n (nouveauté v4+)**
- `n8n_workflow_design` : analyse une demande et produit un plan de workflow
- `n8n_workflow_upsert` : crée ou modifie un workflow via API n8n
- `n8n_workflow_test` : teste un workflow avec des données de test
- `n8n_workflow_promote` : promeut un workflow sandbox vers production (avec validation)

**L'idée v4** : rien ne t'empêche d'avoir beaucoup de workflows, Prolex les voit comme des outils via `PROXY_EXEC`.

---

## 6. Autonomie & variables de configuration v4

### 6.1 Niveaux d'autonomie (Prolex)

| Niveau | Capacité principale |
|--------|---------------------|
| **0** | Lecture / conseil uniquement (aucun tool_call exécuté) |
| **1** | Lecture + logs automatiques (`LOG_APPEND`, `DOC_CREATE_NOTE`) |
| **2** | + Tâches perso & outils low-risk (`TASK_CREATE`, `WEB_SEARCH`, `N8N_WORKFLOW_DESIGN`) |
| **3** | + Workflows client packagés / Git safe / Gestion n8n (`CLIENT_WORKFLOW_RUN`, `GIT_SYNC`, `N8N_WORKFLOW_UPSERT`, `N8N_WORKFLOW_TEST`) |

**Variable** dans `rag/autonomy.yml` :
```yaml
prolex_current_autonomy_level: 2   # ou 3 en v4
```

### 6.2 Mode de Kimmy

```yaml
kimmy_mode: "quick_actions"   # v4 opti (sinon "safe")
```

### 6.3 Autres variables RAG importantes

Dans `config/system.yml` ou `rag/context/02_VARIABLES_ET_CONTEXTE.md` :

```yaml
current_project: "Automatt.ai"  # ou nom du client actif
default_log_sheet: "SystemJournal"
sensitive_intents:
  - question_systeme
  - debug_infra
  - client_workflow
  - dev_workflow
  - config_change
high_risk_tools:
  - N8N_WORKFLOW_PROMOTE
  - BACKUP_RUN
  - GIT_CLONE  # sur repos non-test
```

---

## 7. Contrats de logs – SystemJournal v4

### 7.1 Structure type d'une entrée SystemJournal

**Schéma** : `schemas/logs/systemjournal_entry.schema.json`

**Exemple** :
```json
{
  "timestamp": "2025-11-22T10:00:00Z",
  "agent": "prolex",
  "action_type": "execution",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "matthieu",
  "intent": "task_create",
  "tool_used": "TASK_CREATE",
  "payload_snapshot": {
    "title": "Réviser l'architecture Prolex",
    "due_date": "2025-11-25"
  },
  "result": {
    "status": "success",
    "data": {
      "task_id": "abc123",
      "task_url": "https://tasks.google.com/..."
    },
    "error": null
  },
  "metadata": {
    "execution_time_ms": 250,
    "tokens_used": 150,
    "cost_usd": 0.002,
    "autonomy_level": 2
  }
}
```

### 7.2 Utilisation du SystemJournal

Le SystemJournal sert de base à :
- `api_cost_tracker` (rapports de coûts)
- `healthcheck_services` (détection d'anomalies)
- Auto-amélioration (Prolex qui propose des TODO / notes)
- Audit et conformité

---

## 8. Plan d'action v4+ (avec workflows éditables)

### Phase 1 : RAG & AnythingLLM
- [ ] Mettre à jour les fichiers RAG (outils + payloads + contraintes) pour inclure les outils `N8N_*`
- [ ] Ajouter une section "Autonomie Prolex et gestion des workflows n8n"
- [ ] Configurer AnythingLLM avec les documents RAG

### Phase 2 : n8n
- [ ] Créer les workflows n8n correspondants aux outils :
  - `N8N_WORKFLOW_DESIGN` (peut se limiter à log + TODO)
  - `N8N_WORKFLOW_UPSERT` (appelle l'API n8n pour créer/modifier des workflows dans un espace taggué)
  - `N8N_WORKFLOW_TEST`
- [ ] Ajouter du logging SystemJournal dans tous ces workflows

### Phase 3 : Proxy Master / MCP
- [ ] Étendre le Proxy pour accepter les tools `N8N_*` et les router vers les bons workflows
- [ ] Créer les MCP additionnels (Google Sheets, Drive, SystemJournal)

### Phase 4 : VPS & déploiement
- [ ] Déployer cette nouvelle couche (Proxy + workflows `N8N_*`) sur le VPS quand la stack sera en route

### Phase 5 : Validation
- [ ] Tester un cas simple : "crée-moi un workflow qui prend un message WhatsApp et crée une tâche Google"
- [ ] Prolex doit :
  1. Design → `N8N_WORKFLOW_DESIGN`
  2. Upsert sandbox → `N8N_WORKFLOW_UPSERT`
  3. Test → `N8N_WORKFLOW_TEST`
  4. Log dans SystemJournal

---

## 9. Références

### Documentation
- [SPEC_KIMMY_V4.md](../specifications/SPEC_KIMMY_V4.md)
- [SPEC_PROLEX_V4.md](../specifications/SPEC_PROLEX_V4.md)
- [SPEC_OPEX_V4.md](../specifications/SPEC_OPEX_V4.md)

### Schémas JSON
- [schemas/payloads/kimmy_payload.schema.json](../../schemas/payloads/kimmy_payload.schema.json)
- [schemas/payloads/prolex_output.schema.json](../../schemas/payloads/prolex_output.schema.json)
- [schemas/logs/systemjournal_entry.schema.json](../../schemas/logs/systemjournal_entry.schema.json)
- [schemas/tools/tool_definition.schema.json](../../schemas/tools/tool_definition.schema.json)

### Configuration
- [config/system.yml](../../config/system.yml)
- [rag/autonomy.yml](../../rag/autonomy.yml)
- [rag/tools/tools.yml](../../rag/tools/tools.yml)

---

**Document maintenu par** : Matthieu (Automatt.ai)
**Dernière mise à jour** : 2025-11-22
**Version** : 4.0+
