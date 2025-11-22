# Prolex v4 🧠

> **Cerveau IA orchestrateur** d'Automatt.ai avec autonomie étendue et gestion de workflows n8n

Prolex est le **cerveau IA orchestrateur** de l'entreprise Automatt.ai.

## 🎯 Nouveautés v4+

✨ **Architecture complète Kimmy + Prolex + Opex**
✨ **Prolex peut designer, créer et modifier des workflows n8n** de manière autonome
✨ **4 niveaux d'autonomie** (0-3) pour contrôle fin des permissions
✨ **30+ outils** disponibles (productivité, DevOps, clients, monitoring, etc.)
✨ **Traçabilité complète** via SystemJournal (Google Sheets)

---

## 📚 Documentation v4

### 🚀 Démarrage rapide
1. **[INDEX_PROLEX.md](INDEX_PROLEX.md)** → Point d'entrée central (COMMENCEZ ICI)
2. **[Architecture v4+](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)** → Document maître complet
3. **[Analyse Critique](docs/guides/ANALYSE_CRITIQUE_V4.md)** → Forces, faiblesses, recommandations

### 📋 Spécifications techniques
- **[SPEC_KIMMY_V4.md](docs/specifications/SPEC_KIMMY_V4.md)** → Filtre d'entrée intelligent
- **[SPEC_PROLEX_V4.md](docs/specifications/SPEC_PROLEX_V4.md)** → Cerveau orchestrateur
- **[SPEC_OPEX_V4.md](docs/specifications/SPEC_OPEX_V4.md)** → Workflows n8n + Proxy Master

### ⚙️ Configuration
- **[config/autonomy.yml](config/autonomy.yml)** → Niveaux d'autonomie
- **[config/system.yml](config/system.yml)** → Configuration système
- **[rag/tools/tools.yml](rag/tools/tools.yml)** → Catalogue d'outils (30+)

### 📊 Schémas JSON
- **[KimmyPayload](schemas/payloads/kimmy_payload.schema.json)** → Format Kimmy → Prolex
- **[ProlexOutput](schemas/payloads/prolex_output.schema.json)** → Format Prolex → Opex
- **[SystemJournal](schemas/logs/systemjournal_entry.schema.json)** → Format logs

### 🎁 Pour clients
- **[GUIDE_CLIENTS.md](docs/guides/GUIDE_CLIENTS.md)** → Documentation futurs clients

---

## 🏗️ Architecture v4 (résumé)

```
┌──────────────────────────────────┐
│ KIMMY                            │  ← Filtre d'entrée
│ (LLM + n8n)                      │     - Classifie intention
│ - Français toujours              │     - Évalue complexité
└──────────┬───────────────────────┘     - Produit KimmyPayload
           ↓ KimmyPayload (JSON)
┌──────────────────────────────────┐
│ PROLEX                           │  ← Cerveau orchestrateur
│ (Claude 3.5 Sonnet + RAG)        │     - Raisonne
│ - Autonomie niveaux 0-3          │     - Planifie
└──────────┬───────────────────────┘     - Produit ProlexOutput
           ↓ ProlexOutput (JSON)
┌──────────────────────────────────┐
│ OPEX                             │  ← Bras exécutif
│ (n8n workflows + Proxy Master)   │     - Valide (Proxy)
│ - 30+ outils disponibles         │     - Exécute (n8n)
└──────────────────────────────────┘     - Logue (SystemJournal)
```

### Composants clés
| Composant | Rôle | Technologie |
|-----------|------|-------------|
| **Kimmy** | Filtre d'entrée | GPT-4 Turbo / Claude Haiku + n8n |
| **Prolex** | Cerveau orchestrateur | Claude 3.5 Sonnet + AnythingLLM |
| **Opex** | Bras exécutif | n8n workflows + Proxy Master |
| **SystemJournal** | Mémoire d'exécution | Google Sheets |
| **RAG** | Base de connaissance | Google Drive + docs structurés |

---

## 📂 Structure du repository v4

```
Prolex/
├── README.md                               # Ce fichier
├── INDEX_PROLEX.md                         # 📘 Index central (COMMENCEZ ICI)
│
├── docs/                                   # Documentation
│   ├── architecture/
│   │   └── ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md  # Document maître
│   ├── specifications/
│   │   ├── SPEC_KIMMY_V4.md
│   │   ├── SPEC_PROLEX_V4.md
│   │   └── SPEC_OPEX_V4.md
│   └── guides/
│       ├── ANALYSE_CRITIQUE_V4.md
│       └── GUIDE_CLIENTS.md
│
├── schemas/                                # Schémas JSON (JSON Schema Draft 07)
│   ├── payloads/
│   ├── logs/
│   └── tools/
│
├── rag/                                    # Base de connaissance Prolex
│   ├── tools/tools.yml                     # Catalogue d'outils
│   ├── rules/
│   ├── examples/
│   └── context/
│
├── config/                                 # Configuration système
│   ├── autonomy.yml                        # Niveaux d'autonomie
│   └── system.yml                          # Config globale
│
├── n8n-workflows/                          # Workflows n8n (source de vérité)
│   ├── 010_sync-github-to-n8n.json
│   ├── 020_example-hello-world.json
│   └── 030_github-dev-log-to-sheets.json
│
├── mcp/                                    # Serveurs MCP
│   └── n8n-server/                         # MCP pour piloter n8n
│
├── infra/                                  # Infrastructure (VPS à déployer)
│   └── vps-prod/
│
└── cli/                                    # CLI (futur)
    └── prolexctl/
```

---

## 📊 Catalogue Opex (workflows n8n / Prolex)

### Vue d'ensemble

Le fichier **`config/opex_workflows.yml`** est la **source de vérité** pour tous les workflows Opex (workflows n8n pilotés par Prolex). Il offre deux vues complémentaires sur les workflows :

- **Vue technique** (`categories`) : Organisation système par domaine fonctionnel (core, productivity, dev, clients, monitoring, reporting, n8n_admin, examples)
- **Vue métier** (`biz_areas`) : Pilotage business par domaine d'activité (GE, PROD, MKT, GP, SYS, MULTI)

### Structure du catalogue

Le fichier `config/opex_workflows.yml` contient :

1. **Header** : Version, date de mise à jour, mainteneur, contact
2. **Categories** (vue technique) : Plages d'IDs et labels pour organiser les workflows par domaine fonctionnel
3. **Biz_areas** (vue métier) : Codes et descriptions des domaines métier
4. **Workflows** : Liste exhaustive avec métadonnées complètes pour chaque workflow

#### Catégories techniques (categories)

Les workflows sont organisés par **plages d'IDs** selon leur domaine fonctionnel :

| Plage | Category | Description |
|-------|----------|-------------|
| 000-099 | `core` | Workflows fondamentaux, points d'entrée système, proxy master |
| 100-199 | `productivity` | Gestion de tâches, calendrier, productivité personnelle |
| 200-299 | `dev` | Développement, contrôle de version, intégration continue |
| 300-399 | `clients` | Gestion des clients, projets clients, onboarding |
| 400-499 | `monitoring` | Surveillance système, sauvegardes, alertes |
| 500-599 | `reporting` | Tableaux de bord, rapports, KPIs, analytics |
| 600-699 | `n8n_admin` | Workflows de gestion de n8n lui-même, méta-orchestration |
| 900-999 | `examples` | Workflows de test, prototypes, exemples pédagogiques |

#### Domaines métier (biz_areas)

Classification métier pour pilotage business des workflows :

| Code | Domaine | Description |
|------|---------|-------------|
| **GE** | Gestion Entreprise | Pilotage global, finances, reporting stratégique, décisions business |
| **PROD** | Production / Opérations | Livraison clients, exécution des services, opérations quotidiennes |
| **MKT** | Marketing / Acquisition | Prospects, communication, contenus, génération de leads |
| **GP** | Gestion Personnelle | Organisation personnelle de Matthieu, tâches perso, productivité individuelle |
| **SYS** | Système / Infrastructure | Maintenance technique, sécurité, déploiement, infrastructure |
| **MULTI** | Multi-domaines | Workflows hybrides touchant plusieurs domaines (à utiliser rarement) |

**Note** : Le code `MULTI` doit être utilisé rarement et uniquement pour les workflows vraiment hybrides. Quand utilisé, préciser les domaines concernés dans le champ `notes`.

### Outil de filtrage : `tools/filter_workflows.py`

Un script Python permet de filtrer et trier les workflows selon différents critères.

#### Installation

```bash
# Installer la dépendance PyYAML
pip install pyyaml
```

#### Utilisation

```bash
# Lister tous les workflows
python tools/filter_workflows.py

# Voir les workflows de production (PROD) en status MVP
python tools/filter_workflows.py --biz_area=PROD --status=mvp

# Voir les workflows de monitoring système
python tools/filter_workflows.py --category=monitoring --biz_area=SYS

# Trier par priorité (importance / usage estimé)
python tools/filter_workflows.py --sort=priority

# Workflows clients en production
python tools/filter_workflows.py --category=clients --status=prod

# Workflows en statut "planned" (planifiés)
python tools/filter_workflows.py --status=planned

# Workflows internes seulement
python tools/filter_workflows.py --scope=internal
```

#### Options de filtrage

- `--biz_area` : Filtrer par domaine métier (GE, PROD, MKT, GP, SYS, MULTI)
- `--category` : Filtrer par catégorie technique (core, productivity, dev, clients, monitoring, reporting, n8n_admin, examples)
- `--status` : Filtrer par statut (planned, mvp, prod, deprecated)
- `--scope` : Filtrer par portée (internal, client)

#### Options de tri

- `--sort=id` (défaut) : Tri par ID croissant
- `--sort=priority` : Tri par priorité décroissante (workflows sans priority en dernier)
- `--sort=calls_7d` : Tri par fréquence d'utilisation (7 derniers jours) - **futur**
- `--sort=calls_30d` : Tri par fréquence d'utilisation (30 derniers jours) - **futur**

#### Format de sortie

Le script affiche chaque workflow sur une ligne avec :

```
ID: 310 | Name: Client Onboarding | Cat: clients | Biz: PROD | Status: planned | Scope: client | Priority: 4
```

Les champs manquants affichent `N/A`. Le script génère des warnings pour les `biz_area` inconnus.

### Vision future : Métriques d'utilisation

À l'avenir, un fichier `config/opex_usage_cache.yml` sera alimenté automatiquement par les logs / SystemJournal pour fournir des **métriques réelles d'utilisation** :

```yaml
usage_stats:
  "10":
    total_calls: 132
    calls_last_7d: 18
    calls_last_30d: 64
  "100":
    total_calls: 45
    calls_last_7d: 5
    calls_last_30d: 22
```

Ces métriques permettront de trier les workflows par **fréquence d'utilisation réelle** plutôt que par priorité estimée, offrant ainsi une vision data-driven de l'importance des workflows.

---

## 🚀 Démarrage rapide v4

### Pour comprendre le système
1. Lire **[INDEX_PROLEX.md](INDEX_PROLEX.md)**
2. Consulter **[Architecture v4+](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)**

### Pour développer
1. Vérifier **[SPEC_KIMMY_V4](docs/specifications/SPEC_KIMMY_V4.md)**, **[SPEC_PROLEX_V4](docs/specifications/SPEC_PROLEX_V4.md)**, **[SPEC_OPEX_V4](docs/specifications/SPEC_OPEX_V4.md)**
2. Consulter **[Catalogue d'outils](rag/tools/tools.yml)**
3. Configurer **[config/autonomy.yml](config/autonomy.yml)** et **[config/system.yml](config/system.yml)**

### Pour déployer
1. (À venir) Suivre guide de déploiement VPS
2. Vérifier checklist pré-déploiement dans INDEX_PROLEX.md

---

## 💡 Exemples d'utilisation

### Exemple 1 : Créer une tâche
**Entrée utilisateur** : "Créer une tâche pour réviser l'architecture Prolex avant vendredi"

**Pipeline** :
1. **Kimmy** → Classifie `intent: task_create`, `complexity: simple`
2. **Prolex** → Génère `tool_call: TASK_CREATE` avec payload
3. **Opex** → Exécute workflow n8n `task_create`
4. **Résultat** : Tâche créée dans Google Tasks

### Exemple 2 : Designer un workflow n8n
**Entrée utilisateur** : "Crée un workflow qui envoie un email quand une PR est mergée"

**Pipeline** :
1. **Kimmy** → Classifie `intent: dev_workflow`, `complexity: complex`
2. **Prolex** → Génère `multi_tool_plan` :
   - Step 1: `N8N_WORKFLOW_DESIGN`
   - Step 2: `N8N_WORKFLOW_UPSERT` (sandbox)
   - Step 3: `N8N_WORKFLOW_TEST`
3. **Opex** → Exécute séquentiellement
4. **Résultat** : Workflow créé et testé en sandbox, prêt pour review

---

Ce dépôt GitHub est la **source de vérité technique** pour :

- l'architecture complète Kimmy + Prolex + Opex (v4+)
- le serveur MCP connecté à n8n
- la définition versionnée des workflows n8n (`n8n-workflows/*.json`)
- la configuration système (autonomie, outils, règles)

---

# Architecture héritée (pré-v4)

> **Note** : Section conservée pour historique. Voir documentation v4 ci-dessus pour architecture actuelle.

## 1. Architecture globale (vue simple)

```text
Client (Matthieu)
   │
   ├─ Claude Desktop
   │    ├─ MCP GitHub (@modelcontextprotocol/server-github)
   │    └─ MCP n8n (serveur custom dans ce repo)
   │
   ├─ Repo GitHub Prolex (ce dépôt)
   │    ├─ mcp/n8n-server        → serveur MCP pour piloter n8n
   │    └─ n8n-workflows/        → source de vérité des workflows n8n (JSON)
   │
   └─ n8n (local, Docker – http://localhost:5678)
        └─ exécute les workflows déployés depuis GitHub
GitHub = source de vérité des workflows (n8n-workflows/*.json).

n8n = moteur d’exécution de ces workflows.

MCP n8n = “muscle” pour que Claude puisse lister / déclencher des workflows.

Claude Desktop = interface principale pour piloter Prolex et faire coder/modifier les workflows via MCP GitHub.

2. Structure du dépôt
Structure actuelle du repo Prolex :

text
Copier le code
Prolex/
├─ README.md                    # Ce fichier : vision globale & démarrage
│
├─ docs/                        # (optionnel) Documentation interne
│
├─ mcp/
│   └─ n8n-server/              # Serveur MCP pour piloter n8n
│       ├─ src/
│       │   ├─ index.ts         # Entrée MCP (tools list_workflows / trigger_workflow)
│       │   ├─ n8nClient.ts     # Client HTTP n8n (API)
│       │   └─ types.ts         # Types partagés
│       ├─ dist/                # Code compilé (TS → JS) – NON versionné
│       ├─ package.json         # Scripts NPM du serveur MCP
│       ├─ tsconfig.json        # Config TypeScript
│       └─ README.md            # Doc spécifique du serveur MCP
│
├─ n8n-workflows/               # Source de vérité des workflows n8n (JSON)
│   ├─ README.md                # Doc complète de la synchro GitHub → n8n
│   ├─ QUICK_START.md           # Démarrage rapide (15 minutes)
│   ├─ 010_sync-github-to-n8n.json   # Workflow principal de synchro GitHub → n8n
│   ├─ 020_example-hello-world.json  # Workflow d’exemple
│   └─ *.json                   # 1 fichier = 1 workflow n8n (export JSON)
│
└─ .github/
    └─ workflows/               # CI pour build / tests / audit (Node 18.x & 20.x)
Fichiers/dossiers non versionnés (via .gitignore) :

node_modules/

dist/

.env, .env.local, etc.

certains fichiers spécifiques à mcp/n8n-server (ex. ancien package-lock.json, .env.example, .gitignore interne).

3. Composants principaux
3.1 n8n (local, Docker)
n8n tourne en local via Docker.

URL : http://localhost:5678

Authentification :

Clé API générée dans n8n.

Stockée dans un fichier .env local (non commité).

3.2 Serveur MCP n8n (mcp/n8n-server/)
Langage : TypeScript / Node.js

Build : npm run build → génère dist/index.js

Outils MCP exposés à Claude :

list_workflows → lister les workflows n8n (id, nom, actif, dates, tags…)

trigger_workflow → déclencher un workflow par ID avec payload JSON optionnel

Ce serveur est utilisé par Claude Desktop pour interagir directement avec n8n.

3.3 Claude Desktop
Connecté au MCP GitHub officiel : @modelcontextprotocol/server-github

Permet à Claude de lire / modifier le code de ce repo (ProlexAi/Prolex).

Connecté au MCP n8n custom :

Commande : node dist/index.js (dans mcp/n8n-server)

Variables d’environnement :

N8N_BASE_URL (ex : http://localhost:5678)

N8N_API_KEY (clé API n8n)

Résultat : Claude peut voir les workflows (tool list_workflows) et les déclencher (trigger_workflow).

4. GitHub comme source de vérité des workflows n8n
4.1 Convention
Le dossier n8n-workflows/ contient les workflows n8n versionnés.

Règle : 1 fichier JSON = 1 workflow n8n.

Exemples de noms :

text
Copier le code
n8n-workflows/
  001_hello-world.json
  010_sync-github-to-n8n.json
  020_monitor-costs.json
Ces fichiers peuvent être :

des exports natifs de workflows n8n (JSON),

ou des versions générées/éditées par Claude via MCP GitHub.

4.2 Workflow de synchro GitHub → n8n
Le fichier n8n-workflows/010_sync-github-to-n8n.json contient le workflow :

GitHub to n8n Sync

Fonctionnement :

GitHub envoie un webhook push vers n8n (/webhook/github-sync).

Le workflow GitHub to n8n Sync :

extrait les fichiers modifiés dans n8n-workflows/,

identifie pour chaque fichier s’il est added, modified ou removed.

Pour chaque fichier .json :

added → création du workflow dans n8n (API POST /workflows),

modified → mise à jour du workflow (API PUT /workflows/:id),

removed → désactivation du workflow correspondant (pas de suppression dure).

Chaque action est loggée dans Google Sheets (voir section 5).

Conclusion :

GitHub (n8n-workflows/*.json) = source de vérité.

n8n = copie exécutable de cette vérité.

Tous les détails (architecture des nœuds, tests, dépannage…) sont dans n8n-workflows/README.md.
Pour une mise en route rapide, utiliser n8n-workflows/QUICK_START.md.

5. Observabilité & logs (Google Sheets)
Les événements liés à la synchro GitHub → n8n sont enregistrés dans un Google Sheet dédié.

Nom du document : Logs github/workflow

URL :
https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk/edit

Onglet utilisé : events

Pour chaque fichier JSON traité (créé, mis à jour, désactivé, ignoré, erreur), le workflow ajoute une ligne avec, par exemple :

timestamp_utc

repo, branch, commit_sha

actor (qui a poussé)

file_path, change_type (added / modified / removed)

action_taken (create / update / disable / skip)

workflow_id, workflow_name

status (success / failed)

error_message (en cas d’échec)

source_file_version (facultatif)

Utilisation :

Tracer tous les déploiements de workflows.

Auditer les erreurs sans ouvrir n8n.

Comprendre qui a poussé quoi, quand, et ce que n8n en a fait.

6. Démarrage rapide (local)
6.1 Cloner le dépôt
bash
Copier le code
git clone https://github.com/ProlexAi/Prolex.git
cd Prolex
6.2 Démarrer n8n
Lancer n8n en local (exemple Docker simple) :

bash
Copier le code
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_API_KEY=change-me-secret-key \
  -e N8N_BASE_URL=http://localhost:5678 \
  -e WEBHOOK_URL=http://localhost:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
6.3 Configurer le serveur MCP n8n
bash
Copier le code
cd mcp/n8n-server

# Installer les dépendances
npm install

# Build TypeScript → JS
npm run build
Créer un fichier .env (non versionné) :

bash
Copier le code
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=VOTRE_CLE_API_N8N
Lancer le serveur MCP :

bash
Copier le code
# Mode développement
npm run dev

# OU mode “prod” après build :
node dist/index.js
Tu dois voir dans le terminal :

text
Copier le code
n8n MCP Server running on stdio
6.4 Connecter le MCP n8n à Claude Desktop
Dans le fichier de configuration de Claude Desktop (claude_desktop_config.json) :

json
Copier le code
{
  "mcpServers": {
    "n8n": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "C:\\Users\\Matth\\OneDrive\\Documents\\GitHub\\Prolex\\mcp\\n8n-server",
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "TA_CLE_API_N8N_ICI"
      }
    }
  }
}
Redémarrer Claude Desktop.
Claude pourra alors utiliser les tools list_workflows et trigger_workflow.

Architecture final organisation :

# Infra Vps visée :

| Zone           | Fichier / dossier                         | Contenu / rôle                            | Statut |
|----------------|-------------------------------------------|-------------------------------------------|--------|
| Infra VPS      | infra/vps-prod/docker-compose.yml         | Stack Traefik + n8n + AnythingLLM + MCP   | OK     |
| Infra VPS      | infra/vps-prod/scripts/bootstrap_vps.sh   | Install complète d’un VPS vierge          | À faire|
| MCP            | mcp/google-sheets/                        | MCP Google Sheets                         | À faire|
| Workflows n8n  | workflows/n8n/global_error_alert.json     | Alerte globale erreurs n8n                | À faire|
...

# Architecture Github final :

Prolex/
  README.md
  infra/
    vps-prod/
      docker-compose.yml
      .env.example
      traefik/
        traefik.yml
        acme.example.json
      scripts/
        bootstrap_vps.sh
        deploy_stack.sh
        backup_prolex.sh
        restore_prolex.sh
      docs/
        VPS_RUNBOOK.md
        DEPLOY_GUIDE.md
  mcp/
    n8n-server/
      ...
    google-sheets/
      ...
    google-drive/
      ...
    systemjournal/
      ...
  workflows/
    n8n/
      global_error_alert.json
      healthcheck_services.json
      systemjournal_entry.json
      backup_to_drive.json
      api_cost_tracker.json
  cli/
    prolexctl/
      ...
  docs/
    SYSTEMJOURNAL_MODELE.md
    CLIENT_TEMPLATE_AUTOMATT.md
  INDEX_PROLEX.md   <- fichier index central



