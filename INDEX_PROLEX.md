# 📚 INDEX PROLEX V5 – Bibliothèque vivante du projet

> **Point d'entrée central** pour toute la documentation publique Prolex V5  
> **Date** : 2025-12-04  
> **Version** : 5.1.0  
> **Statut** : Index Public (bibliothèque vivante)

---

## 🎯 À propos de cet index

**Index-Prolex** est le **référentiel public** de documentation, d'architecture et de procédures pour l'écosystème Prolex V5. Il sert de bibliothèque vivante accessible aux développeurs, aux contributeurs et aux utilisateurs du système.

### Rôle d'Index-Prolex

- 📖 **Documentation centrale** : architecture, spécifications, guides
- 🗺️ **Cartographie** : organisation des 8 repos de l'écosystème V5
- 📋 **Procédures** : workflows de développement, déploiement, contribution
- 📐 **Règles** : conventions, standards, bonnes pratiques
- 🔍 **Navigation** : point d'entrée pour comprendre le système

> ⚠️ **Note** : Les détails d'implémentation avancés, configurations sensibles et logiques internes sont documentés dans **Prolex-Système** (référentiel privé).

---

## 🏗️ Architecture Prolex V5

### Vue d'ensemble

**Prolex V5** est une plateforme sophistiquée d'automatisation intelligente et d'orchestration multi-repos, construite sur TypeScript/Node.js et intégrée avec Claude Desktop via le Model Context Protocol (MCP).

```
┌────────────────────────────────────────────────────────────┐
│             CLAUDE DESKTOP                                  │
│          (Interface chat & Entrée utilisateur)              │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ Model Context Protocol (MCP)
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  GitHub MCP      │          │  prolex-mcp v5.1 │ ⭐ NOYAU
│  (Officiel)      │          │  (42 outils)     │
└──────────────────┘          └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
            ┌──────────┐        ┌──────────┐     ┌──────────┐
            │   n8n    │        │  Google  │     │  GitHub  │
            │Workflows │        │ Workspace│     │   APIs   │
            └──────────┘        └──────────┘     └──────────┘
```

### Organisation multi-repos

Prolex V5 est organisé en **8 dépôts spécialisés** :

| Dépôt | Rôle | Statut | GitHub |
|-------|------|--------|--------|
| **index-prolex** | Index public, bibliothèque vivante | ✅ Actif | ProlexAi/index-prolex |
| **prolex-systeme** | Index privé, orchestrateur runtime | 🔧 En création | ProlexAi/prolex-systeme |
| **prolex-mcp** | Serveur MCP principal (42 outils) | ✅ Production v5.1.0 | ProlexAi/prolex-mcp |
| **prolex-core** | Modules communs, libs transversales | 🔧 En activation | ProlexAi/prolex-core |
| **prolex-tools** | Scripts CLI, helpers, utilitaires | 🔧 En activation | ProlexAi/prolex-tools |
| **prolex-vector** | Moteur RAG / Vectorisation | 🔧 En activation | ProlexAi/prolex-vector |
| **n8n-workflows** | Workflows n8n (source de vérité) | ✅ Actif | ProlexAi/n8n-workflows |
| **opex-cli** | Outils Opex (opérations, finance) | 🔧 En activation | ProlexAi/opex-cli |

> 📝 **Note historique** : Ce dépôt s'appelait auparavant `prolex-master`. Il a été renommé `index-prolex` pour mieux refléter son rôle d'index public et de bibliothèque vivante du projet.

---

## 📂 Structure de cet index

### Organisation des dossiers

```
index-prolex/
├── ARCHITECTURE/           # Documentation architecture système
│   └── README.md
├── PROCEDURES/             # Procédures de développement et déploiement
│   └── README.md
├── RULES/                  # Règles, conventions, standards
│   └── README.md
├── docs/                   # Documentation détaillée
│   ├── architecture/
│   ├── specifications/
│   ├── guides/
│   └── contextes/
├── schemas/                # Schémas JSON
├── config/                 # Configuration système (publique)
├── rag/                    # Base de connaissance RAG
├── scripts/                # Scripts utilitaires
└── INDEX_PROLEX.md         # Ce fichier
```

### Documents clés

| Document | Rôle |
|----------|------|
| **INDEX_PROLEX.md** | Point d'entrée central |
| **README.md** | Vue d'ensemble du projet |
| **ARCHITECTURE_COMPLETE_V5.md** | Architecture complète analysée |
| **CATALOG_PROLEX_V5.md** | Catalogue des composants |
| **CLAUDE.md** | Guide pour assistants IA |
| **INSTALLATION.md** | Guide d'installation |

---

## 🚀 Démarrage rapide

### Pour comprendre Prolex V5

1. **Lire** : README.md - Vue d'ensemble
2. **Consulter** : ARCHITECTURE/ - Architecture système
3. **Explorer** : docs/architecture/ - Documentation détaillée

### Pour développer

1. **Cloner** : Tous les repos V5 dans le même workspace
2. **Installer** : Suivre INSTALLATION.md
3. **Configurer** : Consulter config/

### Pour contribuer

1. **Lire** : PROCEDURES/ - Workflows de contribution
2. **Suivre** : RULES/ - Conventions et standards
3. **Référencer** : docs/guides/ - Guides pratiques

---

## 🛠️ Technologies principales

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Runtime** | Node.js | ≥18.0.0 |
| **Langage** | TypeScript | 5.6.0 - 5.7.2 |
| **Protocole** | MCP | 1.0.4 |
| **Automatisation** | n8n | Latest |
| **Infrastructure** | Docker | Latest |

---

## 🔗 Liens vers les autres repos

- **prolex-mcp** - Serveur MCP principal (42 outils)
- **prolex-core** - Bibliothèques partagées
- **prolex-tools** - Outils CLI & GUI
- **prolex-vector** - Moteur RAG
- **n8n-workflows** - Workflows n8n
- **opex-cli** - Outils opérationnels

### Relation avec Prolex-Système

**Prolex-Système** (référentiel privé) contient :
- L'index privé du projet
- Les détails d'implémentation avancés
- Les configurations sensibles
- La logique d'orchestration runtime

> 📋 **Index-Prolex** (ce repo) ↔️ **Prolex-Système** (privé)  
> Documentation publique ↔️ Implémentation privée

---

## 📅 Changelog

### v5.1.0 (2025-12-04)
- 🏗️ Restructuration : prolex-master → index-prolex
- 📂 Création des dossiers ARCHITECTURE/, PROCEDURES/, RULES/
- 📝 Mise à jour de l'index pour le rôle public
- 🔐 Séparation public/privé (index-prolex / prolex-systeme)

---

**Maintenu par** : Organisation ProlexAi  
**Dernière mise à jour** : 2025-12-04  
**Version** : 5.1.0  
**Statut** : Index Public - Bibliothèque vivante
