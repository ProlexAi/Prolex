# n8n MCP Server

Serveur MCP (Model Context Protocol) pour piloter votre instance n8n depuis Claude Desktop ou toute application compatible MCP.

## Fonctionnalites

Ce serveur expose deux outils principaux :

### 1. `list_workflows`
Liste tous les workflows n8n disponibles avec leurs informations :
- ID du workflow
- Nom
- Statut actif/inactif
- Dates de creation et modification
- Tags associes

### 2. `trigger_workflow`
Lance l'execution d'un workflow specifique :
- **Parametres requis** : `workflowId` (string)
- **Parametres optionnels** : `payload` (objet JSON)
- **Retour** : ID d'execution, statut, dates

## Installation

### 1. Pre-requis

- Node.js >= 18.0.0
- npm ou pnpm
- Une instance n8n accessible
- Une cle API n8n valide

### 2. Installation des dependances

```bash
cd mcp/n8n-server
npm install
```

### 3. Configuration

Copiez `.env.example` vers `.env` et remplissez vos valeurs :

```bash
cp .env.example .env
```

Editez `.env` :
```bash
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=```YOUR_N8N_API_KEY
## Utilisation

### Mode developpement

```bash
npm run dev
```

### Build et production

```bash
npm run build
npm start
```

### Mode watch (auto-reload)

```bash
npm run watch
```

## Configuration dans Claude Desktop

Ajoutez cette configuration dans votre fichier de configuration MCP de Claude Desktop :

**Sur macOS** : `~/Library/Application Support/Claude/claude_desktop_config.json`

**Sur Windows** : `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": [
        "/chemin/absolu/vers/Prolex/mcp/n8n-server/dist/index.js"
      ],
      "env": {
        "N8N_BASE_URL": "https://votre-instance-n8n.com",
        "N8N_API_KEY": "votre-cle-api"
      }
    }
  }
}
```

**Important** :
- Utilisez le chemin **absolu** vers `dist/index.js`
- Assurez-vous d'avoir lance `npm run build` avant
- Redemarrez Claude Desktop apres modification de la config

### Alternative : Mode developpement avec tsx

Pour eviter le build, vous pouvez utiliser directement `tsx` :

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/chemin/absolu/vers/Prolex/mcp/n8n-server/src/index.ts"
      ],
      "env": {
        "N8N_BASE_URL": "https://votre-instance-n8n.com",
        "N8N_API_KEY": "votre-cle-api"
      }
    }
  }
}
```

## Test du serveur

Une fois configure dans Claude Desktop, vous pouvez tester avec :

```
Liste-moi tous mes workflows n8n
```

ou

```
Declenche le workflow n8n avec l'ID abc123 et envoie-lui ce payload : {"message": "Hello"}
```

## Architecture technique

```
mcp/n8n-server/
├── src/
│   ├── index.ts          # Serveur MCP principal
│   ├── n8nClient.ts      # Client HTTP pour API n8n
│   └── types.ts          # Types TypeScript
├── package.json          # Dependances
├── tsconfig.json         # Config TypeScript
└── .env                  # Variables d'environnement (a creer)
```

### Technologies utilisees

- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)** : SDK MCP officiel
- **axios** : Client HTTP pour l'API n8n
- **zod** : Validation des schemas de donnees
- **TypeScript** : Type safety

## Gestion des erreurs

Le serveur gere automatiquement :
- Erreurs de connexion (URL invalide, timeout)
- Erreurs d'authentification (cle API invalide)
- Erreurs HTTP (404, 500, etc.)
- Validation des parametres (Zod)

Les messages d'erreur sont clairs et retournes directement a Claude.

## API n8n supportee

Ce serveur utilise l'API REST officielle de n8n :
- `GET /api/v1/workflows` - Liste des workflows
- `POST /api/v1/workflows/{id}/execute` - Execution d'un workflow

Documentation n8n : https://docs.n8n.io/api/

## Contributions

Ce serveur fait partie du projet **Prolex** par ProlexAi.

## License

MIT
