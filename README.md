# Prolex

Prolex est le **cerveau IA orchestrateur** de l’entreprise Automatt.ai.

Son rôle :

- Comprendre les demandes en langage naturel.
- Décider quoi faire : répondre, lancer des automatisations, créer/modifier des workflows.
- Piloter des outils externes (n8n, GitHub, Google, etc.) via des serveurs MCP.
- Garder une trace claire de ce qui est déployé (logs dans Google Sheets).

Ce dépôt GitHub est la **source de vérité technique** pour :

- le serveur MCP connecté à n8n ;
- la définition versionnée des workflows n8n (`n8n-workflows/*.json`) ;
- l’architecture de l’orchestrateur Prolex.

---

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
