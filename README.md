# Index-Prolex v5 📚

> **Index public et bibliothèque vivante** pour l'écosystème Prolex V5 (Automatt.ai)

---

## 🎯 Vue d'ensemble

**Index-Prolex** est le référentiel public de documentation, configuration et architecture pour l'écosystème Prolex V5. Il contient toute la connaissance système publique nécessaire au fonctionnement de l'infrastructure multi-dépôts.

> 📝 **Note historique** : Ce dépôt s'appelait auparavant `prolex-master`. Il a été renommé `index-prolex` pour mieux refléter son rôle d'index public et de bibliothèque vivante du projet.

### Architecture V5 - Multi-dépôts

Prolex V5 est organisé en **8 dépôts spécialisés** :

| Dépôt | Rôle | Statut |
|-------|------|--------|
| **index-prolex** | Index public, bibliothèque vivante | ✅ Actif |
| **prolex-systeme** | Index privé, orchestrateur runtime | 🔧 En création |
| **prolex-mcp** | Serveur MCP principal (42 outils : n8n, Google, GitHub) | ✅ Production v5.1.0 |
| **prolex-core** | Modules communs, libs transversales, types | 🔧 En activation |
| **prolex-tools** | Scripts CLI, helpers, utilitaires | 🔧 En activation |
| **prolex-vector** | Moteur RAG / Vectorisation (AnythingLLM) | 🔧 En activation |
| **prolex-kimmy** | Agent Kimmy (secrétaire/client-facing) | 🔧 En activation |
| **n8n-workflows** | Workflows n8n (source de vérité) | ✅ Actif |
| **opex-cli** | Outils Opex (opérations, finance, reporting) | 🔧 En activation |

---

## 📂 Structure index-prolex

```
index-prolex/
├── docs/                      # Documentation complète V5
│   ├── architecture/          # Architecture système
│   ├── specifications/        # Specs par composant
│   └── guides/                # Guides pratiques
│
├── schemas/                   # Schémas JSON (Draft 07)
│   ├── payloads/              # Schémas de payloads
│   ├── logs/                  # Schémas de logs
│   └── tools/                 # Schémas d'outils
│
├── config/                    # Configuration système
│   ├── autonomy.yml           # Niveaux d'autonomie
│   ├── system.yml             # Config globale
│   └── opex_workflows.yml     # Catalogue workflows
│
├── rag/                       # Base de connaissance RAG
│   ├── tools/tools.yml        # Catalogue d'outils
│   ├── rules/                 # Règles système
│   ├── examples/              # Exemples d'usage
│   └── context/               # Variables de contexte
│
├── scripts/                   # Scripts utilitaires
├── infra/                     # Infrastructure (Docker, VPS)
└── INDEX_PROLEX_V5.md         # Point d'entrée central
```

---

## 🚀 Démarrage rapide

### Pour comprendre l'écosystème V5
1. Lire **[INDEX_PROLEX_V5.md](INDEX_PROLEX_V5.md)** (point d'entrée)
2. Consulter **[docs/architecture/](docs/architecture/)** (architecture globale)
3. Voir le **[catalogue d'outils](rag/tools/tools.yml)** (30+ outils)

### Pour développer
1. Cloner tous les dépôts V5 dans le même workspace
2. Installer les dépendances : `npm install` dans chaque dépôt
3. Consulter les README spécifiques à chaque dépôt

### Pour configurer
- **Autonomie** : `config/autonomy.yml`
- **Système** : `config/system.yml`
- **Workflows** : `config/opex_workflows.yml`

---

## 🛠️ Composants clés V5

### Prolex MCP (Serveur principal)
- **42 outils MCP** : n8n (6), Google Workspace (23), GitHub (8), System (5)
- **Production ready v5.1.0** : Cache, retry, rate limiting, streaming
- **Repo** : `prolex-mcp/`
- **Architecture** : TypeScript + MCP SDK 1.0.4

### n8n Workflows
- **Source de vérité** pour tous les workflows
- **Auto-sync** : GitHub → n8n via webhook
- **Repo** : `n8n-workflows/`

### Prolex Core
- **Bibliothèques partagées** : Types, utils, interfaces
- **Modules communs** utilisés par tous les dépôts
- **Repo** : `prolex-core/`

---

## 📋 Documentation

### Index principal
- **[INDEX_PROLEX_V5.md](INDEX_PROLEX_V5.md)** - Navigation centrale
- **[ARCHITECTURE_COMPLETE_V5.md](ARCHITECTURE_COMPLETE_V5.md)** - Architecture complète analysée

### Architecture
- **[ARCHITECTURE_V5.md](docs/architecture/ARCHITECTURE_V5.md)** - Document maître
- **[ARCHITECTURE_COMPLETE_V5.md](ARCHITECTURE_COMPLETE_V5.md)** - Analyse détaillée complète
- **[MULTI_REPOS.md](docs/architecture/MULTI_REPOS.md)** - Stratégie multi-dépôts

### Configuration
- **[autonomy.yml](config/autonomy.yml)** - Niveaux d'autonomie (0-3)
- **[system.yml](config/system.yml)** - Configuration globale
- **[tools.yml](rag/tools/tools.yml)** - Catalogue d'outils

### Guides
- **[CLAUDE.md](CLAUDE.md)** - Guide pour assistants IA
- **[INSTALLATION.md](INSTALLATION.md)** - Guide d'installation

---

## 🔧 Différences V4 → V5

| Aspect | V4 | V5 |
|--------|----|----|
| **Architecture** | Monorepo unique | Multi-dépôts spécialisés |
| **MCP** | 6 outils n8n seulement | 37 outils (n8n + Google + GitHub) |
| **Core** | Intégré au monorepo | Dépôt séparé réutilisable |
| **Déploiement** | Stack unique | Déploiement indépendant par dépôt |
| **Maintenance** | Complexe (tout couplé) | Simple (séparation des préoccupations) |

**Migration V4 → V5** : La V4 sert de **référence documentaire uniquement**. Ne plus modifier.

---

## 🌐 Environnements

### Local (Development)
- Windows + Docker Desktop
- n8n local : `http://localhost:5678`
- MCP local : stdio mode

### Production (VPS)
- Ubuntu + Docker + Traefik
- n8n prod : `https://n8n.automatt.ai`
- AnythingLLM : `https://anythingllm.automatt.ai`

---

## 📦 Installation complète

```bash
# 1. Cloner tous les dépôts V5
cd C:\Users\Matth\Workspace\ProlexV5
git clone https://github.com/ProlexAi/index-prolex.git
git clone https://github.com/ProlexAi/prolex-mcp.git
git clone https://github.com/ProlexAi/prolex-core.git
# ... (autres dépôts)

# 2. Installer les dépendances
cd prolex-mcp && npm install
cd ../prolex-core && npm install
# ... (autres dépôts)

# 3. Builder les projets TypeScript
npm run build  # dans chaque dépôt

# 4. Configurer Claude Desktop (voir prolex-mcp/README.md)
```

---

## 🤝 Contribution

### Workflow Git
- Branche principale : `main`
- Branches feature : `feature/*`
- Branches Claude : `claude/*` (auto-générées)
- Branches fix : `fix/*`

### Commit messages
Format : `<type>(<scope>): <subject>`
- Types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Exemples :
  - `feat(mcp): add Gmail tools`
  - `docs(architecture): update V5 specs`
  - `fix(core): resolve validation error`

---

## 📄 Licence

MIT - Automatt.ai

---

## 📞 Contact

- **Mainteneur** : Matthieu (Automatt.ai)
- **Email** : matthieu@automatt.ai
- **Repo GitHub** : [ProlexAi/index-prolex](https://github.com/ProlexAi/index-prolex)

---

**Version** : 5.1.0
**Dernière mise à jour** : 2025-12-01
**Statut** : Production Ready
**Taille totale écosystème** : ~284 MB (8 dépôts)
