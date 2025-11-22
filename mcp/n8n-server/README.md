# n8n MCP Server
Serveur MCP (Model Context Protocol) pour piloter votre instance n8n depuis Claude Desktop ou toute application compatible MCP.

## Fonctionnalités
Ce serveur expose deux outils principaux :

### 1. `list_workflows`
Liste tous les workflows n8n disponibles avec leurs informations :
- ID du workflow
- Nom
- Statut actif/inactif
- Dates de création et modification
- Tags associés

### 2. `trigger_workflow`
Lance l’exécution d’un workflow spécifique :
- **Paramètres requis** : `workflowId` (string)
- **Paramètres optionnels** : `payload` (objet JSON)
- **Retour** : ID d’exécution, statut, dates

## Installation

### 1. Pré-requis
- Node.js ≥ 18.0.0
- npm ou pnpm
- Une instance n8n accessible
- Une clé API n8n valide

### 2. Installation des dépendances
```bash
cd mcp/n8n-server
npm install