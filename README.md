# Prolex
Projet Multi-task AAI

## Serveurs MCP

Ce depot contient des serveurs MCP (Model Context Protocol) pour etendre les capacites de Claude Desktop.

### n8n MCP Server

Serveur MCP pour piloter votre instance n8n depuis Claude.

**Emplacement** : `mcp/n8n-server/`

**Fonctionnalites** :
- Liste tous vos workflows n8n
- Declenche l'execution de workflows avec payload personnalise

**Documentation complete** : [mcp/n8n-server/README.md](./mcp/n8n-server/README.md)

**Demarrage rapide** :
```bash
cd mcp/n8n-server
npm install
cp .env.example .env
# Editez .env avec vos credentials n8n
npm run dev
```
