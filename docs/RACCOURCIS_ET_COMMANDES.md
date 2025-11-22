# CHEMINS D'ACCÈS, RACCOURCIS ET COMMANDES UTILES

> Guide de référence rapide pour naviguer et gérer le projet Prolex v4+
> Dernière mise à jour : 22 novembre 2025

---

## 📋 TABLE DES MATIÈRES

1. [Chemins d'accès clés](#chemins-daccès-clés)
2. [Commandes Git](#commandes-git)
3. [Commandes Docker/n8n](#commandes-dockern8n)
4. [Commandes MCP](#commandes-mcp)
5. [Commandes de développement](#commandes-de-développement)
6. [URLs et webhooks](#urls-et-webhooks)
7. [Variables d'environnement](#variables-denvironnement)
8. [Commandes de monitoring](#commandes-de-monitoring)

---

## CHEMINS D'ACCÈS CLÉS

### Répertoire racine
```bash
/home/user/Prolex/
```

### Fichiers de configuration

| Fichier | Chemin complet | Rôle |
|---------|----------------|------|
| **Config système** | `/home/user/Prolex/config/system.yml` | Configuration globale (APIs, limites, monitoring) |
| **Config autonomie** | `/home/user/Prolex/config/autonomy.yml` | Niveaux d'autonomie Prolex (0-3) |
| **Config Kimmy** | `/home/user/Prolex/config/kimmy_config.yml` | Filtre d'entrée (intents, seuils) |
| **Config Prolex** | `/home/user/Prolex/config/prolex_config.yml` | Cerveau orchestrateur (mode, sécurité) |

### Documentation

| Document | Chemin complet | Description |
|----------|----------------|-------------|
| **README principal** | `/home/user/Prolex/README.md` | Vue d'ensemble projet |
| **Index Prolex** | `/home/user/Prolex/INDEX_PROLEX.md` | Point d'entrée central |
| **Architecture système** | `/home/user/Prolex/docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md` | Architecture complète v4+ |
| **Architecture (ce doc)** | `/home/user/Prolex/docs/ARCHITECTURE.md` | Structure détaillée projet |
| **Raccourcis (ce doc)** | `/home/user/Prolex/docs/RACCOURCIS_ET_COMMANDES.md` | Guide commandes |
| **Historique travaux** | `/home/user/Prolex/docs/HISTORIQUE_TRAVAUX.md` | Historique complet |
| **Spec Kimmy** | `/home/user/Prolex/docs/specifications/SPEC_KIMMY_V4.md` | Spécification Kimmy |
| **Spec Prolex** | `/home/user/Prolex/docs/specifications/SPEC_PROLEX_V4.md` | Spécification Prolex |
| **Spec Opex** | `/home/user/Prolex/docs/specifications/SPEC_OPEX_V4.md` | Spécification Opex |
| **Analyse critique** | `/home/user/Prolex/docs/guides/ANALYSE_CRITIQUE_V4.md` | Analyse experte système |
| **Guide clients** | `/home/user/Prolex/docs/guides/GUIDE_CLIENTS.md` | Documentation clients |

### Schémas JSON

| Schéma | Chemin complet | Usage |
|--------|----------------|-------|
| **Kimmy Payload** | `/home/user/Prolex/schemas/payloads/kimmy_payload.schema.json` | Format Kimmy → Prolex |
| **Prolex Output** | `/home/user/Prolex/schemas/payloads/prolex_output.schema.json` | Format Prolex → Opex |
| **SystemJournal Entry** | `/home/user/Prolex/schemas/logs/systemjournal_entry.schema.json` | Format logs |
| **Tool Definition** | `/home/user/Prolex/schemas/tools/tool_definition.schema.json` | Définition outils |

### Base de connaissance RAG

| Fichier | Chemin complet | Contenu |
|---------|----------------|---------|
| **Catalogue outils** | `/home/user/Prolex/rag/tools/tools.yml` | 30+ outils disponibles |
| **Règles principales** | `/home/user/Prolex/rag/rules/01_REGLES_PRINCIPALES.md` | Règles métier système |
| **Variables et contexte** | `/home/user/Prolex/rag/context/02_VARIABLES_ET_CONTEXTE.md` | Variables système |
| **Exemples** | `/home/user/Prolex/rag/examples/` | Exemples de résolution |

### Workflows n8n

| Workflow | Chemin complet | Rôle |
|----------|----------------|------|
| **Sync GitHub→n8n** | `/home/user/Prolex/n8n-workflows/010_sync-github-to-n8n.json` | Synchronisation automatique |
| **Hello World** | `/home/user/Prolex/n8n-workflows/020_example-hello-world.json` | Exemple de base |
| **GitHub Dev Log** | `/home/user/Prolex/n8n-workflows/030_github-dev-log-to-sheets.json` | Logs dev → Sheets |
| **README workflows** | `/home/user/Prolex/n8n-workflows/README.md` | Documentation sync |
| **Quick Start** | `/home/user/Prolex/n8n-workflows/QUICK_START.md` | Démarrage rapide 15min |
| **Setup Dev Log** | `/home/user/Prolex/n8n-workflows/GITHUB_DEV_LOG_SETUP.md` | Configuration Dev Log |

### MCP Servers

| Serveur | Chemin complet | Description |
|---------|----------------|-------------|
| **n8n Server** | `/home/user/Prolex/mcp/n8n-server/` | MCP pour piloter n8n |
| **Index principal** | `/home/user/Prolex/mcp/n8n-server/src/index.ts` | Serveur MCP |
| **Client n8n** | `/home/user/Prolex/mcp/n8n-server/src/n8nClient.ts` | Client HTTP n8n API |
| **Types** | `/home/user/Prolex/mcp/n8n-server/src/types.ts` | Types TypeScript |
| **Package** | `/home/user/Prolex/mcp/n8n-server/package.json` | Dépendances npm |
| **Config TS** | `/home/user/Prolex/mcp/n8n-server/tsconfig.json` | Config TypeScript |

### GitHub Actions

| Workflow | Chemin complet | Rôle |
|----------|----------------|------|
| **CI** | `/home/user/Prolex/.github/workflows/ci.yml` | Pipeline CI/CD |
| **PR Validation** | `/home/user/Prolex/.github/workflows/pr-validation.yml` | Validation PRs |
| **Security** | `/home/user/Prolex/.github/workflows/security.yml` | Scan sécurité |

---

## COMMANDES GIT

### Navigation et statut

| Commande | Description | Exemple |
|----------|-------------|---------|
| `git status` | Afficher l'état du repo | `git status` |
| `git branch` | Lister les branches | `git branch -a` |
| `git log` | Historique commits | `git log --oneline --graph --all -20` |
| `git diff` | Voir les différences | `git diff` |
| `git show` | Détails d'un commit | `git show fc55ecb` |

### Branches

| Commande | Description | Exemple |
|----------|-------------|---------|
| `git checkout` | Changer de branche | `git checkout main` |
| `git checkout -b` | Créer nouvelle branche | `git checkout -b feature/nouvelle-feature` |
| `git branch -d` | Supprimer branche locale | `git branch -d old-branch` |
| `git branch -D` | Forcer suppression branche | `git branch -D old-branch` |

### Synchronisation

| Commande | Description | Exemple |
|----------|-------------|---------|
| `git fetch` | Récupérer changements distants | `git fetch origin` |
| `git pull` | Récupérer et fusionner | `git pull origin main` |
| `git push` | Envoyer commits | `git push -u origin claude/branch-name` |
| `git push --force` | Forcer push (DANGER) | `git push --force origin branch` ⚠️ |

### Commits

| Commande | Description | Exemple |
|----------|-------------|---------|
| `git add` | Ajouter fichiers au staging | `git add .` |
| `git commit` | Créer un commit | `git commit -m "feat: description"` |
| `git commit --amend` | Modifier dernier commit | `git commit --amend --no-edit` |
| `git reset` | Annuler commits | `git reset --soft HEAD~1` |

### Branches de travail actuelles

| Branche | Usage | Commande checkout |
|---------|-------|-------------------|
| `claude/project-documentation-01LC9YP1cHgpVBwkxw1oByUe` | Documentation projet | `git checkout claude/project-documentation-01LC9YP1cHgpVBwkxw1oByUe` |
| `main` | Branche principale (stable) | `git checkout main` |

### Workflow Git recommandé

```bash
# 1. Vérifier branche actuelle
git status

# 2. Créer/passer sur branche de travail
git checkout -b claude/feature-name-<session-id>

# 3. Faire modifications...

# 4. Ajouter et commiter
git add .
git commit -m "feat(module): description claire"

# 5. Pousser vers remote
git push -u origin claude/feature-name-<session-id>

# 6. Créer PR via GitHub UI
```

---

## COMMANDES DOCKER/n8n

### Docker général

| Commande | Description | Exemple |
|----------|-------------|---------|
| `docker ps` | Lister conteneurs actifs | `docker ps` |
| `docker ps -a` | Lister tous conteneurs | `docker ps -a` |
| `docker logs` | Voir logs conteneur | `docker logs n8n` |
| `docker exec` | Exécuter commande dans conteneur | `docker exec -it n8n sh` |
| `docker restart` | Redémarrer conteneur | `docker restart n8n` |
| `docker stop` | Arrêter conteneur | `docker stop n8n` |
| `docker start` | Démarrer conteneur | `docker start n8n` |

### Docker Compose

| Commande | Description | Exemple |
|----------|-------------|---------|
| `docker-compose up` | Démarrer services | `docker-compose up -d` |
| `docker-compose down` | Arrêter services | `docker-compose down` |
| `docker-compose restart` | Redémarrer services | `docker-compose restart n8n` |
| `docker-compose logs` | Voir logs services | `docker-compose logs -f n8n` |
| `docker-compose ps` | Statut services | `docker-compose ps` |

### n8n spécifique

| Commande | Description | Chemin/Usage |
|----------|-------------|--------------|
| **Accès UI n8n** | Interface web | `http://localhost:5678` ou `https://n8n.automatt.ai` |
| **Logs n8n** | Voir logs temps réel | `docker logs -f n8n` |
| **Redémarrer n8n** | Après modif config | `docker restart n8n` |
| **Shell n8n** | Accès shell conteneur | `docker exec -it n8n sh` |
| **Backup n8n** | Exporter workflows | Via UI ou API REST |

### Commandes n8n CLI (dans conteneur)

```bash
# Entrer dans conteneur n8n
docker exec -it n8n sh

# Exporter workflows
n8n export:workflow --all --output=/backup/

# Importer workflows
n8n import:workflow --input=/backup/workflow.json

# Lister credentials
n8n export:credentials --all

# Exécuter workflow
n8n execute --id <workflow-id>
```

---

## COMMANDES MCP

### MCP n8n Server

| Commande | Description | Chemin |
|----------|-------------|--------|
| **Installation** | Installer dépendances | `cd /home/user/Prolex/mcp/n8n-server && npm install` |
| **Build** | Compiler TypeScript | `cd /home/user/Prolex/mcp/n8n-server && npm run build` |
| **Développement** | Mode watch | `cd /home/user/Prolex/mcp/n8n-server && npm run dev` |
| **Tests** | Lancer tests | `cd /home/user/Prolex/mcp/n8n-server && npm test` |
| **Start** | Démarrer serveur MCP | `cd /home/user/Prolex/mcp/n8n-server && npm start` |

### Configuration MCP

| Variable | Valeur par défaut | Chemin config |
|----------|-------------------|---------------|
| `N8N_BASE_URL` | `http://localhost:5678` | Variable d'environnement |
| `N8N_API_KEY` | `<your-api-key>` | Variable d'environnement |

### Tester MCP

```bash
# 1. Se placer dans le dossier MCP
cd /home/user/Prolex/mcp/n8n-server

# 2. Installer dépendances
npm install

# 3. Configurer variables d'environnement
export N8N_BASE_URL="http://localhost:5678"
export N8N_API_KEY="your-api-key-here"

# 4. Compiler
npm run build

# 5. Démarrer serveur
npm start
```

---

## COMMANDES DE DÉVELOPPEMENT

### npm/Node.js

| Commande | Description | Exemple |
|----------|-------------|---------|
| `npm install` | Installer dépendances | `npm install` |
| `npm run build` | Build projet | `npm run build` |
| `npm run dev` | Mode développement | `npm run dev` |
| `npm run test` | Lancer tests | `npm test` |
| `npm run lint` | Linter code | `npm run lint` |

### Validation schémas JSON

```bash
# Valider un schéma JSON (nécessite ajv-cli)
npm install -g ajv-cli

# Valider Kimmy Payload
ajv validate -s schemas/payloads/kimmy_payload.schema.json -d <fichier-data.json>

# Valider Prolex Output
ajv validate -s schemas/payloads/prolex_output.schema.json -d <fichier-data.json>

# Valider SystemJournal Entry
ajv validate -s schemas/logs/systemjournal_entry.schema.json -d <fichier-data.json>
```

### Édition fichiers YAML

```bash
# Éditer config système
nano /home/user/Prolex/config/system.yml

# Éditer config autonomie (changer niveau actuel)
nano /home/user/Prolex/config/autonomy.yml

# Éditer config Kimmy
nano /home/user/Prolex/config/kimmy_config.yml

# Éditer config Prolex
nano /home/user/Prolex/config/prolex_config.yml
```

### Recherche dans le projet

| Commande | Description | Exemple |
|----------|-------------|---------|
| `grep -r "texte"` | Rechercher texte | `grep -r "N8N_WORKFLOW" config/` |
| `find . -name` | Trouver fichiers | `find . -name "*.yml"` |
| `find . -type d` | Trouver dossiers | `find . -type d -name "config"` |
| `tree` | Arborescence | `tree -L 2` |

---

## URLS ET WEBHOOKS

### URLs principales

| Service | URL | Description |
|---------|-----|-------------|
| **n8n UI Local** | `http://localhost:5678` | Interface n8n locale |
| **n8n UI Production** | `https://n8n.automatt.ai` | Interface n8n production |
| **GitHub Repo** | `https://github.com/ProlexAi/Prolex` | Repository GitHub |

### Webhooks n8n

| Webhook | URL complète | Input | Output |
|---------|--------------|-------|--------|
| **Kimmy Intake** | `http://localhost:5678/webhook/kimmy-intake` | Texte brut | KimmyPayload JSON |
| **Prolex Intake** | `http://localhost:5678/webhook/prolex-intake` | KimmyPayload JSON | ProlexOutput JSON |
| **Proxy Exec** | `http://localhost:5678/webhook/proxy-exec` | ProlexOutput JSON | Routage workflows |
| **GitHub to n8n** | `http://localhost:5678/webhook/github-to-n8n` | GitHub push event | Création/MAJ workflows n8n |
| **Prolex Git Pull** | `http://localhost:5678/webhook/prolex-git-pull` | Repo path + branch | Git pull status |

### API n8n REST

| Endpoint | Méthode | Description | Exemple |
|----------|---------|-------------|---------|
| `/api/v1/workflows` | GET | Lister workflows | `curl http://localhost:5678/api/v1/workflows -H "X-N8N-API-KEY: <key>"` |
| `/api/v1/workflows/{id}` | GET | Détails workflow | `curl http://localhost:5678/api/v1/workflows/1 -H "X-N8N-API-KEY: <key>"` |
| `/api/v1/workflows/{id}/execute` | POST | Exécuter workflow | `curl -X POST http://localhost:5678/api/v1/workflows/1/execute -H "X-N8N-API-KEY: <key>"` |
| `/api/v1/workflows` | POST | Créer workflow | Voir doc n8n API |
| `/api/v1/workflows/{id}` | PUT | Modifier workflow | Voir doc n8n API |

### Tester webhooks

```bash
# Tester Kimmy Intake
curl -X POST http://localhost:5678/webhook/kimmy-intake \
  -H "Content-Type: application/json" \
  -d '{"message": "Crée une tâche pour appeler Jean demain"}'

# Tester Prolex Intake
curl -X POST http://localhost:5678/webhook/prolex-intake \
  -H "Content-Type: application/json" \
  -d @schemas/payloads/kimmy_payload.example.json

# Lister workflows via API
curl http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: your-api-key"
```

---

## VARIABLES D'ENVIRONNEMENT

### Variables système

| Variable | Valeur | Description |
|----------|--------|-------------|
| `PROLEX_ROOT` | `/home/user/Prolex` | Racine projet |
| `PROLEX_ENV` | `development` | Environnement (dev/staging/prod) |

### Variables n8n

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `N8N_BASE_URL` | `http://localhost:5678` | URL base n8n |
| `N8N_API_KEY` | `<your-key>` | Clé API n8n |
| `N8N_PORT` | `5678` | Port n8n |
| `N8N_PROTOCOL` | `http` | Protocole (http/https) |
| `N8N_HOST` | `localhost` | Hôte n8n |

### Variables APIs externes

| Variable | Service | Obtention |
|----------|---------|-----------|
| `GOOGLE_API_KEY` | Google Workspace | Google Cloud Console |
| `GITHUB_TOKEN` | GitHub | Settings > Developer > Personal Tokens |
| `OPENAI_API_KEY` | OpenAI | platform.openai.com |
| `ANTHROPIC_API_KEY` | Anthropic | console.anthropic.com |

### Fichier .env (exemple)

```bash
# n8n
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# GitHub
GITHUB_TOKEN=ghp_...

# Google
GOOGLE_API_KEY=AIza...
```

---

## COMMANDES DE MONITORING

### Logs système

| Commande | Description | Chemin |
|----------|-------------|--------|
| **Logs Docker** | Tous conteneurs | `docker-compose logs -f` |
| **Logs n8n** | n8n uniquement | `docker logs -f n8n` |
| **Logs PostgreSQL** | Base de données n8n | `docker logs -f n8n-postgres` |
| **Logs Redis** | Cache | `docker logs -f n8n-redis` |

### Monitoring n8n

| Action | Commande | Description |
|--------|----------|-------------|
| **Workflows actifs** | Via UI n8n | `http://localhost:5678/workflows` |
| **Executions** | Via UI n8n | `http://localhost:5678/executions` |
| **Healthcheck** | API REST | `curl http://localhost:5678/healthz` |

### SystemJournal (Google Sheets)

| Action | Outil | URL |
|--------|-------|-----|
| **Voir logs** | Google Sheets | Ouvrir sheet "Automatt_Logs" |
| **Filtrer par agent** | Filtres Sheets | Colonne "agent" |
| **Filtrer par date** | Filtres Sheets | Colonne "timestamp" |
| **Analyser coûts** | Pivot Table | Colonne "metadata.cost_usd" |

### Métriques

```bash
# Compter commits
git log --oneline | wc -l

# Taille du repo
du -sh /home/user/Prolex

# Nombre de fichiers
find /home/user/Prolex -type f | wc -l

# Lignes de code (excluant node_modules)
find . -name "*.ts" -o -name "*.js" -o -name "*.yml" -o -name "*.json" | \
  grep -v node_modules | xargs wc -l
```

---

## RACCOURCIS UTILES

### Alias recommandés (à ajouter dans ~/.bashrc)

```bash
# Navigation projet
alias pcd='cd /home/user/Prolex'
alias pconfig='cd /home/user/Prolex/config'
alias pdocs='cd /home/user/Prolex/docs'
alias prag='cd /home/user/Prolex/rag'
alias pn8n='cd /home/user/Prolex/n8n-workflows'
alias pmcp='cd /home/user/Prolex/mcp'

# Git
alias gs='git status'
alias gl='git log --oneline --graph --all -20'
alias gd='git diff'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'

# Docker
alias dps='docker ps'
alias dlogs='docker-compose logs -f'
alias dn8n='docker logs -f n8n'
alias drestart='docker-compose restart'

# n8n
alias n8n-ui='xdg-open http://localhost:5678'
alias n8n-logs='docker logs -f n8n'
alias n8n-restart='docker restart n8n'

# Édition rapide
alias edit-system='nano /home/user/Prolex/config/system.yml'
alias edit-autonomy='nano /home/user/Prolex/config/autonomy.yml'
alias edit-kimmy='nano /home/user/Prolex/config/kimmy_config.yml'
alias edit-prolex='nano /home/user/Prolex/config/prolex_config.yml'
```

### Scripts utiles

```bash
# Script : check-prolex-status.sh
#!/bin/bash
echo "=== Prolex Status ==="
echo "Git branch:"
git branch --show-current
echo ""
echo "Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Recent commits:"
git log --oneline -5
```

---

## COMMANDES DE BACKUP

### Backup manuel

```bash
# Backup complet projet
tar -czf prolex-backup-$(date +%Y%m%d).tar.gz /home/user/Prolex

# Backup config uniquement
tar -czf prolex-config-$(date +%Y%m%d).tar.gz /home/user/Prolex/config

# Backup workflows n8n
tar -czf prolex-n8n-$(date +%Y%m%d).tar.gz /home/user/Prolex/n8n-workflows
```

### Restore

```bash
# Restaurer backup complet
tar -xzf prolex-backup-20251122.tar.gz -C /

# Restaurer config
tar -xzf prolex-config-20251122.tar.gz -C /home/user/Prolex
```

---

## DÉPANNAGE RAPIDE

### Problèmes courants

| Problème | Solution | Commande |
|----------|----------|----------|
| n8n ne démarre pas | Vérifier Docker | `docker ps` puis `docker logs n8n` |
| Workflows non synchro | Relancer sync GitHub | Trigger webhook `/webhook/github-to-n8n` |
| MCP n8n erreur | Vérifier API key | `echo $N8N_API_KEY` |
| Git push refuse | Vérifier branche | `git branch` (doit commencer par `claude/`) |
| Config non prise en compte | Redémarrer n8n | `docker restart n8n` |

### Commandes diagnostic

```bash
# Vérifier environnement
echo "Node version:" && node --version
echo "npm version:" && npm --version
echo "Docker version:" && docker --version
echo "Git version:" && git --version

# Vérifier ports utilisés
netstat -tuln | grep 5678

# Vérifier espace disque
df -h

# Vérifier processus
ps aux | grep n8n
```

---

## RESSOURCES EXTERNES

| Ressource | URL | Description |
|-----------|-----|-------------|
| **n8n Documentation** | https://docs.n8n.io | Documentation officielle n8n |
| **n8n API Docs** | https://docs.n8n.io/api/ | API REST n8n |
| **MCP Protocol** | https://modelcontextprotocol.io | Spécification MCP |
| **GitHub Prolex** | https://github.com/ProlexAi/Prolex | Repository GitHub |
| **Anthropic Docs** | https://docs.anthropic.com | Documentation Claude |
| **OpenAI Docs** | https://platform.openai.com/docs | Documentation GPT |

---

**Ce guide contient tous les chemins d'accès, raccourcis et commandes essentiels pour travailler efficacement sur le projet Prolex v4+.**
