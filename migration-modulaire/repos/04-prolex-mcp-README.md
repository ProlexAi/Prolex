# 🔌 Prolex MCP

> **Serveurs Model Context Protocol pour intégrations tierces**
> **Repository**: `ProlexAi/prolex-mcp`
> **Visibilité**: 🔓 PUBLIC
> **Langage principal**: TypeScript/Node.js

---

## 🎯 Vue d'ensemble

**Prolex MCP** fournit des serveurs Model Context Protocol pour:
- n8n (gestion workflows)
- Google Drive (documents, synchronisation)
- GitHub (repos, issues, PRs)
- Google Sheets (SystemJournal, données)
- Et autres intégrations tierces

**But**: Permettre aux IA (Claude Desktop, Copilot, Prolex) d'interagir avec services externes via MCP

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Serveurs MCP**: Implémentation protocole MCP pour chaque service
2. **Tools**: Définition tools MCP (search, read, create, update, delete)
3. **Authentication**: OAuth2, API keys, tokens
4. **Documentation**: Guides utilisation et exemples
5. **Publication**: Packages NPM publics

### Ne fait PAS

- ❌ Logique métier (→ `prolex-core`)
- ❌ Décisions (→ `prolex-core`)
- ❌ Stockage (→ services tiers via API)

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Serveur n8n MCP** (`packages/n8n-server/`) ✅ EXISTANT
  - Tools: list_workflows, get_workflow, create_workflow, update_workflow, execute_workflow
  - Auth: API key n8n
  - Tests: Jest + mocks

- [x] **Serveur Google Drive MCP** (`packages/google-drive-server/`) 🆕
  - Tools: search, read_file, create_file, update_file, list_files
  - Auth: OAuth2 Google
  - Sync: Watch changements Drive

- [x] **Serveur GitHub MCP** (`packages/github-server/`) 🆕
  - Tools: list_repos, get_file, create_pr, create_issue, commit
  - Auth: GitHub token

- [x] **Serveur Google Sheets MCP** (`packages/sheets-server/`) 🆕
  - Tools: read_sheet, append_row, update_cell, query
  - Auth: OAuth2 Google
  - Use case: SystemJournal logging

- [x] **Code commun** (`packages/common/`)
  - Base server class
  - Auth helpers (OAuth2, API keys)
  - Types partagés

### Où coder

```
packages/
├── n8n-server/              ✅ Existant
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── n8nClient.ts     # n8n API client
│   │   ├── tools/           # MCP tools
│   │   └── types.ts
│   └── tests/
│
├── google-drive-server/     🆕 À créer
│   ├── src/
│   │   ├── index.ts
│   │   ├── driveClient.ts
│   │   ├── tools/
│   │   │   ├── search.ts
│   │   │   ├── read.ts
│   │   │   ├── create.ts
│   │   │   └── update.ts
│   │   └── types.ts
│   └── tests/
│
├── github-server/           🆕 À créer
├── sheets-server/           🆕 À créer
│
└── common/                  🆕 À créer
    ├── base-server.ts       # MCP base class
    ├── auth-helpers.ts      # OAuth2, API keys
    └── types.ts             # Types partagés
```

### Comment coder

**Stack**:
- `@modelcontextprotocol/sdk` (MCP SDK officiel)
- TypeScript 5+
- APIs spécifiques (Google Drive API, GitHub API, etc.)
- OAuth2 (google-auth-library, passport)

**Structure d'un serveur MCP**:
```typescript
// packages/example-server/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Définir tools
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "search_example",
        description: "Search for examples",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" }
          }
        }
      }
    ]
  };
});

server.setRequestHandler("tools/call", async (request) => {
  // Logique tool
  const { name, arguments: args } = request.params;

  if (name === "search_example") {
    const results = await exampleClient.search(args.query);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Dépendances

**Ce module dépend de**:
- APIs tierces (n8n, Google, GitHub, etc.)

**Modules qui dépendent de lui**:
- `prolex-core` (appels MCP tools)
- Claude Desktop (utilisation directe)
- Copilot (utilisation directe)

---

## 📦 Serveurs disponibles

### 1. n8n Server ✅

**Package**: `@prolex/n8n-mcp-server`
**Status**: Opérationnel

**Tools**:
- `list_workflows` - Liste tous workflows
- `get_workflow` - Détails workflow
- `create_workflow` - Créer workflow
- `update_workflow` - Modifier workflow
- `execute_workflow` - Exécuter workflow
- `get_execution` - Statut exécution

**Installation**:
```bash
npm install @prolex/n8n-mcp-server
```

**Configuration Claude Desktop**:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@prolex/n8n-mcp-server"],
      "env": {
        "N8N_API_URL": "https://n8n.automatt.ai/api/v1",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

---

### 2. Google Drive Server 🆕

**Package**: `@prolex/google-drive-mcp-server` (à publier)

**Tools**:
- `search_files` - Recherche fichiers
- `read_file` - Lire contenu fichier
- `create_file` - Créer fichier
- `update_file` - Modifier fichier
- `list_folder` - Lister dossier
- `watch_changes` - Watch changements

**Auth**: OAuth2 Google

---

### 3. GitHub Server 🆕

**Package**: `@prolex/github-mcp-server`

**Tools**:
- `list_repos` - Liste repositories
- `get_file` - Lire fichier
- `create_pr` - Créer pull request
- `create_issue` - Créer issue
- `commit_file` - Commit fichier
- `search_code` - Recherche code

**Auth**: GitHub personal access token

---

### 4. Google Sheets Server 🆕

**Package**: `@prolex/sheets-mcp-server`

**Tools**:
- `read_sheet` - Lire sheet
- `append_row` - Ajouter ligne
- `update_cell` - Modifier cellule
- `query` - Query SQL-like
- `create_sheet` - Créer sheet

**Auth**: OAuth2 Google

**Use case**: SystemJournal logging

---

## 🛠️ Développement

### Créer un nouveau serveur MCP

```bash
# Clone repo
git clone git@github.com:ProlexAi/prolex-mcp.git
cd prolex-mcp

# Créer nouveau serveur depuis template
pnpm run create:server my-service

# Structure créée:
# packages/my-service-server/
#   ├── src/
#   ├── tests/
#   ├── package.json
#   └── README.md

# Développer
cd packages/my-service-server
pnpm install
pnpm dev

# Tester
pnpm test

# Build
pnpm build

# Publish NPM
pnpm publish --access public
```

---

## 🧪 Tests

```bash
# Tous serveurs
pnpm test

# Serveur spécifique
pnpm --filter @prolex/n8n-mcp-server test

# Watch mode
pnpm --filter @prolex/n8n-mcp-server test:watch

# Coverage
pnpm test:coverage
```

---

## 📚 Documentation

- [Guide création serveur MCP](docs/CREATING_NEW_SERVER.md)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Exemples utilisation](examples/)

---

## 🚀 Publication NPM

```bash
# Build tous packages
pnpm build

# Publish (nécessite npm login)
pnpm publish -r --access public
```

**Packages publiés**:
- `@prolex/n8n-mcp-server`
- `@prolex/google-drive-mcp-server`
- `@prolex/github-mcp-server`
- `@prolex/sheets-mcp-server`

---

## 📄 License

MIT License - Open Source

Voir [LICENSE](LICENSE)
