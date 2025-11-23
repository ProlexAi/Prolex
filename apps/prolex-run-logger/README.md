# Prolex Run Logger

Module TypeScript pour standardiser le logging des exécutions d'agents et workflows dans l'écosystème Prolex.

## 🎯 Objectif

Capturer systématiquement toutes les exécutions (Prolex, Kimmy, n8n workflows, etc.) en enregistrant :

- **Données d'entrée** (input)
- **Contexte d'exécution** (nom agent, type, métadonnées)
- **Sortie** (output)
- **Erreurs éventuelles** avec détails complets

## 📦 Installation

```bash
cd apps/prolex-run-logger
npm install
npm run build
```

## 🚀 Utilisation

### Exemple basique

```typescript
import { runWithProlexLogger } from "./src/runWithProlexLogger";

const result = await runWithProlexLogger({
  context: {
    nomAgent: "kimmy_n8n",
    typeCible: "workflow_n8n",
    flowId: "1234",
    meta: { scenario: "test_sandbox" }
  },
  input: {
    message: "Bonjour Prolex",
    userId: "user_123"
  },
  execute: async (input) => {
    // Votre logique d'exécution
    const response = await callN8nWorkflow(input);
    return response.data;
  }
});

console.log("Run ID:", result.runId);
console.log("Durée:", result.dureeMs, "ms");
console.log("Erreur:", result.error ? "Oui" : "Non");
```

### Exemple avec workflow n8n

```typescript
import axios from "axios";
import { runWithProlexLogger } from "./src/runWithProlexLogger";

const result = await runWithProlexLogger({
  context: {
    nomAgent: "kimmy_n8n",
    typeCible: "workflow_n8n",
    flowId: "workflow-lead-gen",
    meta: {
      clientId: "client_456",
      environment: "production"
    }
  },
  input: {
    name: "John Doe",
    email: "john@example.com"
  },
  execute: async (input) => {
    const response = await axios.post(
      "http://localhost:5678/webhook/lead-gen",
      input
    );
    return response.data;
  }
});
```

## 📁 Fichiers de logs

Le module génère deux fichiers au format **JSONL** (JSON Lines) :

### 1. `prolex_runs.jsonl`

Contient **tous les runs** (succès et erreurs) avec :

- Log d'entrée (avant exécution)
- Log de sortie (après exécution)

**Exemple de lignes :**

```jsonl
{"type":"entree","runId":"a1b2c3d4","timestamp":"2025-11-23T10:00:00.000Z","context":{"nomAgent":"kimmy_n8n","typeCible":"workflow_n8n"},"inputPreview":"{\"message\":\"test\"}","tailleInput":18}
{"type":"sortie","runId":"a1b2c3d4","timestamp":"2025-11-23T10:00:01.234Z","context":{"nomAgent":"kimmy_n8n","typeCible":"workflow_n8n"},"dureeMs":1234,"outputPreview":"{\"success\":true}","tailleOutput":16,"hasError":false}
```

### 2. `prolex_errors.jsonl`

Contient **uniquement les erreurs** avec détails complets :

- Message d'erreur
- Stack trace
- Input/output au moment de l'erreur

**Exemple de ligne :**

```jsonl
{"runId":"x9y8z7w6","timestamp":"2025-11-23T10:05:00.000Z","nomAgent":"prolex_principal","typeCible":"agent","inputPreview":"{\"query\":\"test\"}","outputPreview":"","errorMessage":"Network timeout","errorStack":"Error: Network timeout\n    at ...","errorType":"Error","dureeMs":5000}
```

## ⚙️ Configuration

Trois méthodes de configuration (par ordre de priorité) :

### 1. Variables d'environnement

```bash
export PROLEX_RUNS_LOG_FILE="./logs/prolex_runs.jsonl"
export PROLEX_ERRORS_LOG_FILE="./logs/prolex_errors.jsonl"
export MAX_PREVIEW_CHARS="2000"
```

### 2. Fichier `config/logger.config.json`

```json
{
  "runsLogFile": "./logs/prolex_runs.jsonl",
  "errorsLogFile": "./logs/prolex_errors.jsonl",
  "maxPreviewChars": 2000
}
```

### 3. Valeurs par défaut

Les valeurs par défaut sont définies dans `src/config.ts`.

## 📊 Structure du projet

```
prolex-run-logger/
├── README.md                    # Ce fichier
├── package.json                 # Configuration npm
├── tsconfig.json                # Configuration TypeScript
├── .gitignore                   # Fichiers ignorés par git
│
├── src/                         # Code source
│   ├── index.ts                 # Point d'entrée (exports publics)
│   ├── types.ts                 # Interfaces TypeScript
│   ├── config.ts                # Chargement de la configuration
│   ├── runWithProlexLogger.ts   # Fonction principale
│   └── utils/
│       └── fileLogger.ts        # Gestion des fichiers JSONL
│
├── config/                      # Configuration
│   └── logger.config.json       # Config par défaut
│
├── scripts/                     # Scripts d'exemple
│   └── example-n8n-run.ts       # Exemple d'utilisation
│
└── logs/                        # Fichiers de logs (générés)
    ├── prolex_runs.jsonl
    └── prolex_errors.jsonl
```

## 🧪 Tester le module

### 1. Compiler le projet

```bash
npm run build
```

### 2. Exécuter l'exemple

```bash
npm run example
```

Cela exécute le script `scripts/example-n8n-run.ts` qui montre :

- Un run réussi
- Un run avec erreur simulée
- La génération des fichiers logs

### 3. Vérifier les logs

```bash
# Voir tous les runs
cat logs/prolex_runs.jsonl | jq .

# Voir uniquement les erreurs
cat logs/prolex_errors.jsonl | jq .
```

## 🔌 Intégration avec Prolex

Ce module est utilisé par :

1. **Prolex** : Analyse des runs et optimisation
2. **Agent Erreurs** : Lecture exclusive de `prolex_errors.jsonl`
3. **Processus de vectorisation** : RAG sur les erreurs

### Exemple d'intégration dans un MCP Server

```typescript
import { runWithProlexLogger } from "prolex-run-logger";
import { executeN8nWorkflow } from "./n8nClient";

// Dans votre handler MCP
async function handleToolCall(toolName: string, params: any) {
  return await runWithProlexLogger({
    context: {
      nomAgent: "mcp_n8n_server",
      typeCible: "workflow_n8n",
      flowId: params.workflowId,
      meta: { tool: toolName }
    },
    input: params,
    execute: async (input) => {
      return await executeN8nWorkflow(input.workflowId, input.data);
    }
  });
}
```

## 📋 API Reference

### `runWithProlexLogger<TInput, TOutput>(options)`

Fonction principale pour exécuter un agent/workflow avec logging.

**Paramètres :**

- `options.context` : Contexte d'exécution
  - `nomAgent` : Nom de l'agent (ex: "prolex_principal")
  - `typeCible` : Type ("workflow_n8n" | "agent")
  - `flowId?` : ID du workflow n8n (optionnel)
  - `meta?` : Métadonnées libres (optionnel)
- `options.input` : Données d'entrée (type générique `TInput`)
- `options.execute` : Fonction async à exécuter

**Retour :**

```typescript
{
  output: TOutput,      // Résultat de l'exécution
  error?: any,          // Erreur éventuelle
  runId: string,        // UUID unique du run
  dureeMs: number       // Durée en millisecondes
}
```

### Types disponibles

```typescript
// Contexte d'exécution
interface ProlexRunContext {
  nomAgent: string;
  typeCible: "workflow_n8n" | "agent";
  flowId?: string;
  meta?: Record<string, any>;
}

// Résultat de l'exécution
interface ProlexRunResult {
  output: any;
  error?: any;
  runId: string;
  dureeMs: number;
}

// Configuration
interface LoggerConfig {
  runsLogFile: string;
  errorsLogFile: string;
  maxPreviewChars: number;
}
```

## 🛠️ Utilitaires avancés

Le module expose également des fonctions utilitaires :

```typescript
import {
  appendJsonLine,
  readJsonLines,
  createPreview,
  calculateSize
} from "prolex-run-logger";

// Écrire une ligne dans un fichier JSONL
appendJsonLine("./custom.jsonl", { foo: "bar" });

// Lire toutes les lignes d'un fichier JSONL
const logs = readJsonLines("./logs/prolex_runs.jsonl");

// Créer un preview tronqué
const preview = createPreview(largeObject, 500);

// Calculer la taille d'un objet en JSON
const size = calculateSize(myObject);
```

## 🔍 Cas d'usage

### 1. Analyse des performances

```bash
# Durée moyenne des runs par agent
cat logs/prolex_runs.jsonl | jq -r 'select(.type=="sortie") | "\(.context.nomAgent): \(.dureeMs)ms"'
```

### 2. Détection des erreurs fréquentes

```bash
# Top 5 des erreurs les plus fréquentes
cat logs/prolex_errors.jsonl | jq -r '.errorMessage' | sort | uniq -c | sort -rn | head -5
```

### 3. Monitoring d'un workflow spécifique

```bash
# Tous les runs d'un workflow donné
cat logs/prolex_runs.jsonl | jq 'select(.context.flowId=="workflow-123")'
```

## 📄 Licence

MIT - Automatt.ai

## 🤝 Contribution

Ce module fait partie du projet Prolex. Pour toute question ou suggestion :

- Consulter la documentation principale : `/docs`
- Vérifier `INDEX_PROLEX.md` pour la navigation
- Suivre les conventions du projet définies dans `CLAUDE.md`

## 🔗 Ressources

- [Documentation Prolex](../../README.md)
- [Architecture v4](../../docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)
- [Guide des outils](../../rag/tools/tools.yml)
