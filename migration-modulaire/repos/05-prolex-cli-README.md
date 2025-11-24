# 💻 Prolex CLI

> **Interface ligne de commande pour Prolex**
> **Repository**: `ProlexAi/prolex-cli`
> **Visibilité**: 🔓 PUBLIC
> **Langage principal**: TypeScript/Node.js

---

## 🎯 Vue d'ensemble

**Prolex CLI** est l'interface en ligne de commande pour:
- Interagir avec Prolex localement ou en production
- Gérer workflows n8n
- Consulter logs et status
- Configurer l'environnement
- Tester et débugger

**Installation**:
```bash
npm install -g @prolex/cli
# ou
pnpm install -g @prolex/cli
```

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Chat interface**: Chat avec Prolex via CLI
2. **Workflow management**: Créer, lister, tester workflows
3. **Logs**: Consulter SystemJournal depuis terminal
4. **Configuration**: Gérer config locale
5. **Status**: Monitoring état système

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Commandes CLI** (`src/commands/`)
  - `prolex chat` - Chat interactif
  - `prolex workflow [create|list|test|deploy]` - Gestion workflows
  - `prolex logs [tail|search]` - Consultation logs
  - `prolex config [get|set]` - Configuration
  - `prolex status` - État système
  - `prolex init` - Initialisation projet

- [x] **API Client** (`src/api/client.ts`)
  - Client HTTP pour Prolex Core API
  - Authentication (API key, token)
  - Retry logic et error handling

- [x] **UI Terminal** (`src/ui/`)
  - Spinners (ora)
  - Prompts (inquirer)
  - Formatters (chalk, table)
  - Progress bars

- [x] **Config Manager** (`src/utils/config-manager.ts`)
  - Lecture/écriture config locale (~/.prolexrc)
  - Gestion environnements (dev, staging, prod)
  - Secrets storage (keytar)

### Où coder

```
src/
├── index.ts           # Entry point
├── commands/          # Commandes CLI
│   ├── chat.ts
│   ├── workflow.ts
│   ├── logs.ts
│   ├── config.ts
│   ├── status.ts
│   └── init.ts
├── api/
│   └── client.ts      # API client Prolex Core
├── ui/                # UI terminal
│   ├── spinner.ts
│   ├── prompts.ts
│   └── formatters.ts
└── utils/
    ├── config-manager.ts
    └── auth.ts
```

### Comment coder

**Stack**:
- `commander` (CLI framework)
- `inquirer` (prompts interactifs)
- `chalk` (colors)
- `ora` (spinners)
- `axios` (HTTP client)
- `keytar` (secure storage)

**Pattern commande**:
```typescript
// src/commands/example.ts
import { Command } from 'commander';

export function registerExampleCommand(program: Command) {
  program
    .command('example <arg>')
    .description('Example command description')
    .option('-f, --flag', 'Example flag')
    .action(async (arg, options) => {
      try {
        // Logic here
        console.log(`Example: ${arg}, flag: ${options.flag}`);
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    });
}
```

---

## 📋 Commandes disponibles

### `prolex chat`

**Description**: Chat interactif avec Prolex

**Usage**:
```bash
$ prolex chat
✨ Prolex Chat (Ctrl+C pour quitter)

You: Crée une tâche "Faire X demain"
Prolex: ✅ Tâche créée: "Faire X demain" (due: 2025-11-25)

You: Liste mes tâches
Prolex: 📋 Tâches:
  1. Faire X demain (2025-11-25)
  2. Réunion client (2025-11-26)
```

**Options**:
- `--model <model>` - Modèle LLM (sonnet/opus/haiku)
- `--autonomy <level>` - Niveau autonomie (0-3)
- `--verbose` - Mode verbose

---

### `prolex workflow`

**Description**: Gestion workflows n8n

**Sous-commandes**:

#### `prolex workflow list`
Liste tous les workflows

```bash
$ prolex workflow list

📋 Workflows (32)
┌─────┬──────────────────────────┬────────┬────────┐
│ ID  │ Name                     │ Active │ Tags   │
├─────┼──────────────────────────┼────────┼────────┤
│ 010 │ sync-github-to-n8n       │ ✅     │ core   │
│ 100 │ task-create              │ ✅     │ prod   │
│ 200 │ github-commit-analysis   │ ❌     │ dev    │
└─────┴──────────────────────────┴────────┴────────┘
```

#### `prolex workflow create`
Créer nouveau workflow (assistant interactif)

```bash
$ prolex workflow create

📝 Création workflow n8n

? Nom du workflow: mon-workflow
? Catégorie: (Use arrow keys)
  ❯ productivity
    devops
    clients
    monitoring
? Description: Automatise l'envoi d'emails

✨ Workflow créé: workflows/100_mon-workflow.json
```

#### `prolex workflow test <id>`
Tester workflow avec payload

```bash
$ prolex workflow test 100_task-create \
  --payload '{"title":"Test task"}'

🧪 Test workflow 100_task-create

⏳ Exécution...
✅ Success (1.2s)

📤 Response:
{
  "taskId": "abc123",
  "title": "Test task"
}
```

#### `prolex workflow deploy <id>`
Déployer workflow vers production

```bash
$ prolex workflow deploy 100_task-create

🚀 Déploiement workflow 100_task-create

✅ Testé en sandbox
✅ Validé par Proxy Master
⏳ Import vers n8n production...
✅ Déployé!

URL: https://n8n.automatt.ai/workflow/100
```

---

### `prolex logs`

**Description**: Consulter logs SystemJournal

#### `prolex logs tail`
Suivre logs en temps réel

```bash
$ prolex logs tail

📊 SystemJournal (live)

[2025-11-24 10:30:15] prolex | TASK_CREATE | success | 0.05 USD
[2025-11-24 10:30:42] opex   | TASK_CREATE | executed | ...
[2025-11-24 10:31:03] kimmy  | INTENT_CLASS | success | ...
```

#### `prolex logs search <query>`
Rechercher dans logs

```bash
$ prolex logs search "error"

🔍 Recherche "error" dans SystemJournal

Found 3 results:
[2025-11-24 09:15:23] opex | WORKFLOW_EXEC | error | Timeout
[2025-11-24 09:42:11] core | API_CALL | error | 500 Internal
...
```

---

### `prolex config`

**Description**: Gestion configuration

#### `prolex config get <key>`
```bash
$ prolex config get autonomy_level
2
```

#### `prolex config set <key> <value>`
```bash
$ prolex config set autonomy_level 3
✅ Configuration updated: autonomy_level = 3
```

#### `prolex config list`
```bash
$ prolex config list

📋 Configuration (~/.prolexrc)
┌────────────────────┬───────────────────────────┐
│ Key                │ Value                     │
├────────────────────┼───────────────────────────┤
│ api_url            │ https://prolex.automatt.ai│
│ autonomy_level     │ 2                         │
│ environment        │ production                │
└────────────────────┴───────────────────────────┘
```

---

### `prolex status`

**Description**: État système Prolex

```bash
$ prolex status

🚦 Prolex Status

System:     ✅ Healthy
Version:    4.0.0
Autonomy:   Level 2 (Low-risk actions)
Uptime:     2d 14h 23m

Services:
  ✅ Prolex Core    (https://prolex.automatt.ai)
  ✅ Kimmy          (connected)
  ✅ Opex (n8n)     (32 workflows active)
  ✅ RAG            (vector store: 15.2k docs)
  ⚠️  MCP Servers   (3/4 connected)

Recent activity:
  - 142 requests today
  - 98% success rate
  - Avg response time: 1.2s
```

---

### `prolex init`

**Description**: Initialiser projet Prolex local

```bash
$ prolex init

🚀 Initialisation Prolex

✅ Création .prolexrc
✅ Création .env
✅ Création prolex.config.yml
✅ Clone workflows depuis GitHub

🎉 Prolex initialisé!

Next steps:
  1. Edit .env avec vos API keys
  2. Run: prolex status
  3. Run: prolex chat
```

---

## 📦 Installation

### Global (recommandé)

```bash
npm install -g @prolex/cli
# ou
pnpm add -g @prolex/cli
```

### Local (pour développement)

```bash
git clone git@github.com:ProlexAi/prolex-cli.git
cd prolex-cli
pnpm install
pnpm build
pnpm link --global

# Test
prolex --version
```

---

## ⚙️ Configuration

### Fichier `~/.prolexrc`

```yaml
api_url: https://prolex.automatt.ai
environment: production
autonomy_level: 2
api_key: your-api-key

# Optional
log_level: info
timeout: 30000
retry_attempts: 3
```

### Variables d'environnement

```bash
PROLEX_API_URL=https://prolex.automatt.ai
PROLEX_API_KEY=your-api-key
PROLEX_AUTONOMY_LEVEL=2
```

---

## 🧪 Tests

```bash
pnpm test
pnpm test:commands    # Tests commandes
pnpm test:api         # Tests API client
pnpm test:e2e         # Tests end-to-end
```

---

## 🚀 Build & Publish

```bash
# Build
pnpm build

# Test local
pnpm link --global
prolex --version

# Publish NPM
npm version patch
npm publish --access public
```

---

## 📚 Documentation

- [User Guide](docs/USER_GUIDE.md)
- [Commands Reference](docs/COMMANDS.md)
- [API Client](docs/API_CLIENT.md)

---

## 📄 License

MIT License - Open Source
