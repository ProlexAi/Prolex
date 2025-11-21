```` markdown
# Prolex

Prolex est le **cerveau IA orchestrateur** de l’entreprise Automatt.ai.

Son rôle est de :

- Comprendre les demandes en langage naturel.
- Décider quoi faire : répondre, lancer des automatisations, créer/modifier des workflows.
- Piloter des outils externes (n8n, GitHub, Google, etc.) via des serveurs MCP.

Ce dépôt GitHub constitue la **source de vérité technique** pour :

- le serveur MCP connecté à n8n ;
- la définition versionnée des workflows n8n (dossier `n8n-workflows/`) ;
- la future orchestration globale Prolex.

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
   │    └─ n8n-workflows/        → JSON source de vérité des workflows n8n
   │
   └─ n8n (local, Docker – http://localhost:5678)
        └─ exécute les workflows déployés depuis GitHub

GitHub = source de vérité des workflows (n8n-workflows/*.json).
n8n = moteur d’exécution des workflows.
MCP n8n = “muscle” pour que Claude puisse lister / déclencher des workflows.
Claude Desktop = interface principale pour piloter Prolex et faire coder/modifier les workflows via MCP GitHub.

````

## 2\. Structure du dépôt

Structure cible du repo Prolex :

``` text
Prolex/
├─ README.md                 # Ce fichier : vision globale & démarrage
│
├─ docs/                     # (optionnel) Documentation interne simple
│
├─ mcp/
│   └─ n8n-server/           # Serveur MCP pour piloter n8n
│       ├─ src/              # Code TypeScript
│       │   ├─ index.ts      # Entrée MCP (tools list_workflows / trigger_workflow)
│       │   ├─ n8nClient.ts  # Client HTTP n8n (API)
│       │   └─ types.ts      # Types partagés
│       ├─ dist/             # Code compilé (TS → JS) – NON versionné
│       ├─ package.json      # Scripts NPM du serveur MCP
│       ├─ tsconfig.json     # Config TypeScript
│       └─ README.md         # Doc spécifique du serveur MCP
│
├─ n8n-workflows/            # Source de vérité des workflows n8n (JSON)
│   ├─ README.md             # Convention & règles de synchro
│   └─ *.json                # 1 fichier = 1 workflow n8n (export JSON)
│
└─ .github/
    └─ workflows/            # (à terme) CI simple pour mcp/n8n-server & synchro

```

Fichiers/Dossiers non versionnés (gérés par `.gitignore`) :

  - `node_modules/`
  - `dist/`
  - `.env`, `.env.local`, etc.
  - certains fichiers spécifiques à `mcp/n8n-server` (package-lock, .env, .gitignore interne…).

## 3\. Stack actuelle

### 3.1 n8n (local, Docker)

n8n tourne en local via Docker.

URL : `http://localhost:5678`

Authentification :

  - Clé API générée dans n8n.
  - Stockée dans un fichier `.env` local (non commité).

### 3.2 Serveur MCP n8n (mcp/n8n-server)

Langage : TypeScript / Node.js

Build : `npm run build` → génère `dist/index.js`

Outils exposés à Claude (MCP tools) :

  - `list_workflows`
    → liste les workflows n8n (id, nom, actif, dates, tags…)
  - `trigger_workflow`
    → déclenche un workflow par ID avec un payload JSON optionnel.

Ce serveur est utilisé par Claude Desktop pour interagir avec n8n.

### 3.3 Claude Desktop

Connecté au MCP GitHub officiel :
`@modelcontextprotocol/server-github`
Permet à Claude de lire / modifier le code dans ce repo (ProlexAi/Prolex).

Connecté au MCP n8n custom :

Commande lancée : `node dist/index.js` dans `mcp/n8n-server`

Variables d’environnement :

  - `N8N_BASE_URL` (ex: `http://localhost:5678`)
  - `N8N_API_KEY` (clé API n8n)

Résultat : Claude peut voir les workflows n8n (`list_workflows`) et les déclencher (`trigger_workflow`).

## 4\. GitHub comme source de vérité des workflows n8n

### 4.1 Convention

Le dossier `n8n-workflows/` contient les workflows n8n versionnés.

Règle simple :
→ 1 fichier JSON = 1 workflow n8n.

Exemples de noms de fichiers :

``` text
n8n-workflows/
  001_hello-world.json
  010_sync-github-to-n8n.json
  020_monitor-costs.json

```

Ces fichiers sont :

  - soit des exports natifs de workflows n8n (JSON),
  - soit des versions générées/éditées par Claude via MCP GitHub.

### 4.2 Rôle fonctionnel

Tu conçois / modifies les workflows sur GitHub (avec l’aide de Claude).

Tu commits & push sur `main`.

Un workflow n8n de synchronisation GitHub → n8n (en cours de design) se chargera de :

  - détecter les fichiers ajoutés / modifiés / supprimés dans `n8n-workflows/`,
  - créer ou mettre à jour les workflows dans n8n via l’API,
  - désactiver ceux dont le fichier a été supprimé.

Ainsi :

  - GitHub (`n8n-workflows/*.json`) = vérité
  - n8n = “copie exécutable” de cette vérité.

## 5\. Observabilité & logs (Google Sheets)

Les événements importants liés à la synchro GitHub → n8n seront loggés dans un Google Sheet dédié.

Fichier : “Logs github/workflow”

URL : <https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk/edit?usp=sharing>

Onglet principal : `events`

Chaque fichier JSON traité (créé, mis à jour, désactivé, ou en erreur) générera une ligne avec :

  - `timestamp`,
  - `repo`, `branche`, `commit`,
  - `file_path`, `change_type` (added/modified/removed),
  - `action_taken` (create/update/disable/skip),
  - `workflow_id` / `workflow_name`,
  - `status` (success/failed),
  - `error_message` éventuel.

Cela permet de :

  - tracer les déploiements,
  - auditer les erreurs,
  - comprendre “qui a poussé quoi, quand, et ce que n8n en a fait”.

## 6\. Démarrage rapide

### 6.1 Cloner le dépôt

``` bash
git clone [https://github.com/ProlexAi/Prolex.git](https://github.com/ProlexAi/Prolex.git)
cd Prolex

```

### 6.2 Préparer n8n

Lancer n8n en local (Docker) sur `http://localhost:5678`.

Créer une clé API n8n.

Noter l’URL : `http://localhost:5678`.

### 6.3 Configurer le serveur MCP n8n

Dans `mcp/n8n-server` :

``` bash
cd mcp/n8n-server

# Installation des dépendances
npm install

# Build TypeScript → JS
npm run build

```

Créer un fichier `.env` (non versionné) à partir de `.env.example` (ou manuellement) :

``` env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=VOTRE_CLE_API_N8N

```

### 6.4 Lancer le serveur MCP n8n en local

``` bash
cd mcp/n8n-server

# Mode développement TypeScript
npm run dev

# OU mode “prod” après build :
node dist/index.js

```

Tu dois voir :

``` text
n8n MCP Server running on stdio

```

### 6.5 Connecter le MCP n8n à Claude Desktop

Dans le fichier de config de Claude Desktop, ajouter une entrée du type :

``` json
"n8n": {
  "command": "node",
  "args": [
    "C:\\Users\\Matth\\OneDrive\\Documents\\GitHub\\Prolex\\mcp\\n8n-server\\dist\\index.js"
  ],
  "env": {
    "N8N_BASE_URL": "http://localhost:5678",
    "N8N_API_KEY": "TA_CLE_API_N8N_ICI"
  }
}

```

Redémarrer Claude Desktop.

``` 
 
```
