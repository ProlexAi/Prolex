# Prolex

Prolex est le **cerveau IA** de l’entreprise Automatt.ai.  
Son rôle est d’orchestrer des agents et des automatisations (n8n, outils externes, workflows, services) à partir de requêtes naturelles.

Ce dépôt GitHub est la **source de vérité technique** de Prolex : code, intégrations MCP, CI/CD, et, le cas échéant, configuration d’infrastructure.

---

## Contexte & objectifs

- **Organisation GitHub** : `ProlexAi`  
- **Dépôt** : `Prolex` (privé)  
- **Branche par défaut** : `main`  
- **Branches de travail** :
  - `Claude-Mcp-branche` : travaux autour des MCP.
  - Branches temporaires générées par Claude / Copilot (`claude/...`)  
    → à **fusionner puis supprimer** une fois intégrées.

Prolex vise à :

- Centraliser la logique “cerveau” pour l’écosystème Automatt.ai.
- Décider, pour chaque demande :
  - s’il faut répondre directement via l’IA,
  - ou déclencher / adapter des workflows n8n,
  - ou utiliser d’autres outils (GitHub, Google, etc.).
- Offrir une base propre pour expérimenter et industrialiser des agents IA autonomes.

---

## Architecture globale (vue haute)

L’architecture cible de Prolex s’appuie sur plusieurs briques (certaines gérées dans ce repo, d’autres sur le VPS) :

- **Traefik** : reverse proxy + SSL (Let’s Encrypt).
- **n8n** : orchestrateur de workflows (actuellement en local sur `http://localhost:5678`).
- **AnythingLLM / Prolex** : couche agent IA.
- **Redis** : cache / états temporaires (si nécessaire).
- **Serveur MCP n8n** : pont entre Prolex / Claude et n8n.

Sur le VPS, ces composants peuvent être orchestrés via un `docker-compose.yml` et un `.env` dérivé de `.env.example` (si présents dans ce dépôt).

---

## Structure du dépôt

Structure de référence du dépôt `Prolex` :

```text
Prolex/
├─ .github/
│  └─ workflows/
│     ├─ ci.yml              # Build & vérification du projet (TypeScript, npm run build, etc.)
│     ├─ security.yml        # npm audit & vérifications de sécurité (push/PR + cron hebdo)
│     └─ pr-validation.yml   # Validation des PR (titre sémantique, checks basiques)
│
├─ mcp/
│  └─ n8n-server/
│     ├─ src/                # Code TypeScript du serveur MCP n8n
│     │  ├─ index.ts
│     │  ├─ n8nClient.ts
│     │  └─ types.ts
│     ├─ package.json        # Dépendances & scripts npm (build, start, etc.)
│     ├─ tsconfig.json       # Configuration TypeScript
│     └─ README.md           # Doc spécifique au serveur MCP n8n
│     # Non versionnés mais présents en local (ignorés par .gitignore) :
│     #   .env, .env.example, package-lock.json, dist/, node_modules/, .gitignore local
│
├─ .gitignore                # Ignore node_modules, dist, .env, fichiers MCP sensibles, etc.
├─ README.md                 # Ce fichier – description globale de Prolex
├─ docker-compose.yml        # (si présent) Stack Traefik + n8n + AnythingLLM + MCP
├─ .env.example              # (si présent) Modèle d’environnement pour la stack Docker
└─ ...                       # Autres fichiers / dossiers (code, docs spécifiques, etc.)
