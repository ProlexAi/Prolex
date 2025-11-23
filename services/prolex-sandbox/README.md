# Prolex Sandbox

> **Service de test sécurisé pour Prolex - Simulation de workflows n8n et appels MCP sans risque**

## 📋 Vue d'ensemble

**Prolex Sandbox** est un environnement de test sécurisé qui permet de :
- Simuler des exécutions de workflows n8n
- Tester des appels MCP / API
- Valider des modifications "à blanc" (dry-run)

**SANS jamais toucher aux ressources de production** (n8n réel, vrai Drive, vrais clients).

### ⚠️ Rôle complémentaire aux garde-fous existants

Ce service complète les garde-fous de passage humain et les protections existantes (comme le Cash Workflow Guard) en permettant :
- L'expérimentation contrôlée avant toute validation humaine
- L'apprentissage sécurisé pour l'agent Prolex
- La détection préventive de risques avant d'atteindre les garde-fous critiques

Le Sandbox **N'EXÉCUTE JAMAIS** d'actions réelles en production. C'est un simulateur, pas un exécuteur.

---

## 🎯 Objectifs

1. **Expérimentation sécurisée** : Permettre à Prolex et aux humains de tester sans risque
2. **Apprentissage** : Analyser les workflows et détecter les patterns à risque
3. **Validation préalable** : Identifier les problèmes avant la vraie exécution
4. **Documentation** : Générer des rapports détaillés des simulations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                PROLEX SANDBOX                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Simulateur  │  │  Simulateur  │            │
│  │     n8n      │  │     MCP      │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │        Module Garde-fous                 │  │
│  │  - Détection d'actions critiques         │  │
│  │  - Évaluation des risques                │  │
│  │  - Mode strict / relaxed                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     API REST (Express)                   │  │
│  │  - POST /api/scenarios                   │  │
│  │  - POST /api/run                         │  │
│  │  - GET  /api/runs/:id                    │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     Base de données (SQLite/Postgres)    │  │
│  │  - Scénarios                             │  │
│  │  - Exécutions (runs)                     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn

### Étapes

```bash
# 1. Aller dans le répertoire du service
cd services/prolex-sandbox

# 2. Installer les dépendances
npm install

# 3. Copier le fichier de configuration
cp .env.example .env

# 4. (Optionnel) Modifier la configuration dans .env
vim .env

# 5. Compiler TypeScript
npm run build

# 6. Démarrer le serveur
npm run dev
```

Le serveur démarre sur `http://localhost:3001` par défaut.

---

## ⚙️ Configuration

Fichier `.env` :

```bash
# URLs n8n
URL_N8N_TEST=http://localhost:5678          # Instance de test (ou mock)
URL_N8N_PROD=https://n8n.automatt.ai        # NE JAMAIS APPELER (référence seulement)

# Mode Sandbox
MODE_SANDBOX=strict
# "strict" : Bloque les actions à risque élevé/critique
# "relaxed" : Simule tout mais alerte sur les risques

# Garde-fous
GARDES_FOUS_ACTIFS=true
MAX_ACTIONS_PAR_TEST=50

# Base de données
DB_TYPE=sqlite                              # "sqlite" ou "postgres"
DB_PATH=./sandbox/sandbox.db                # Chemin pour SQLite

# Serveur
PORT=3001
HOST=localhost

# Logging
LOG_LEVEL=info                              # "error", "warn", "info", "debug"
```

### Modes de fonctionnement

| Mode | Comportement |
|------|-------------|
| **strict** | Bloque la simulation si le risque est élevé ou critique. Sécurité maximale. |
| **relaxed** | Simule tout, mais ajoute des alertes détaillées. Permet l'apprentissage. |

---

## 📚 Utilisation

### 1. Créer un scénario

#### Via API

```bash
curl -X POST http://localhost:3001/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test workflow exemple",
    "description": "Test du workflow hello-world",
    "type": "workflow_n8n",
    "payload": {
      "name": "Hello World",
      "nodes": [
        {
          "id": "1",
          "name": "Start",
          "type": "n8n-nodes-base.start",
          "parameters": {},
          "position": [250, 300]
        }
      ],
      "connections": {}
    }
  }'
```

#### Via script utilitaire

```bash
npm run creer-scenario-workflow -- ../../n8n-workflows/020_example-hello-world.json
```

Le script :
1. Lit le fichier JSON du workflow
2. Crée automatiquement un scénario via l'API
3. Affiche l'ID du scénario créé

### 2. Lancer une simulation

```bash
curl -X POST http://localhost:3001/api/run \
  -H "Content-Type: application/json" \
  -d '{"scenarioId": "<ID-DU-SCENARIO>"}'
```

Réponse :

```json
{
  "status": "success",
  "data": {
    "scenarioId": "abc-123",
    "runId": "xyz-789",
    "statut": "ok",
    "resume": "Simulation de workflow n8n: 5 nœuds analysés, 4 connexions. Aucun risque majeur détecté.",
    "alertes": [],
    "details": {
      "nodesAnalysees": [...],
      "flowsSimules": [...],
      "logEtapes": [...]
    }
  }
}
```

### 3. Consulter les résultats

```bash
# Récupérer les détails d'une exécution
curl http://localhost:3001/api/runs/<RUN-ID>

# Lister tous les scénarios
curl http://localhost:3001/api/scenarios

# Récupérer un scénario spécifique
curl http://localhost:3001/api/scenarios/<SCENARIO-ID>
```

---

## 🔍 Types de scénarios supportés

### 1. Workflow n8n (`workflow_n8n`)

Simulation complète d'un workflow n8n :
- Analyse de chaque nœud
- Simulation des connexions
- Détection des actions critiques (DELETE, requêtes SQL destructives, etc.)
- Évaluation des risques par nœud

**Exemple** :

```json
{
  "nom": "Test workflow CRM",
  "type": "workflow_n8n",
  "payload": {
    "name": "Sync CRM",
    "nodes": [...],
    "connections": {...}
  }
}
```

### 2. Appel MCP (`appel_mcp`)

Simulation d'un appel à un serveur MCP :
- Mock de la réponse
- Détection de méthodes critiques (DELETE, PURGE)
- Détection d'endpoints sensibles

**Exemple** :

```json
{
  "nom": "Test appel MCP workflows",
  "type": "appel_mcp",
  "payload": {
    "endpoint": "/api/workflows",
    "method": "GET",
    "payload": {}
  }
}
```

### 3. Séquence mixte (`sequence_mixte`)

Enchaînement de plusieurs opérations (workflows + appels MCP) :
- Simulation étape par étape
- Accumulation des alertes
- Rapport détaillé par étape

**Exemple** :

```json
{
  "nom": "Test séquence complète",
  "type": "sequence_mixte",
  "payload": {
    "etapes": [
      {
        "type": "workflow_n8n",
        "nom": "Étape 1 : Collecte de données",
        "payload": {...}
      },
      {
        "type": "appel_mcp",
        "nom": "Étape 2 : Envoi API",
        "payload": {...}
      }
    ]
  }
}
```

---

## 🛡️ Garde-fous et détection des risques

### Détection automatique

Le Sandbox détecte automatiquement :

| Catégorie | Éléments détectés | Niveau de risque |
|-----------|-------------------|------------------|
| **Méthodes HTTP** | DELETE, PURGE, RESET | 🔴 Élevé |
| **Requêtes SQL** | DROP TABLE, TRUNCATE, DELETE FROM | 🔴 Critique |
| **Code JavaScript** | eval(), child_process, fs | 🔴 Élevé |
| **Endpoints sensibles** | /delete, /remove, /purge, /database/ | 🟠 Élevé |
| **Volume** | > MAX_ACTIONS_PAR_TEST | 🟡 Moyen |

### Niveaux de risque

- **Faible** 🟢 : Opérations de lecture, opérations simples
- **Moyen** 🟡 : Modifications non critiques, limites dépassées
- **Élevé** 🟠 : Actions potentiellement destructives (DELETE, requêtes sensibles)
- **Critique** 🔴 : Actions destructives confirmées (DROP TABLE, TRUNCATE)

### Comportement selon le mode

| Risque | Mode Strict | Mode Relaxed |
|--------|-------------|--------------|
| Faible | ✅ Simule | ✅ Simule |
| Moyen | ✅ Simule | ✅ Simule |
| Élevé | 🛑 Bloque | ⚠️ Simule + Alerte |
| Critique | 🛑 Bloque | ⚠️ Simule + Alerte |

---

## 📊 Exemple de rapport de simulation

```json
{
  "scenarioId": "abc-123",
  "runId": "xyz-789",
  "statut": "ok",
  "resume": "Simulation de workflow n8n: 8 nœuds analysés, 7 connexions. ⚠️ 1 nœud(s) à risque détecté(s).",
  "alertes": [
    {
      "type": "action_critique",
      "description": "Le nœud \"Delete User\" utilise une méthode HTTP dangereuse: DELETE",
      "niveauRisque": "élevé",
      "details": {
        "node": "Delete User",
        "method": "DELETE"
      }
    }
  ],
  "details": {
    "nodesAnalysees": [
      {
        "id": "1",
        "name": "Start",
        "type": "n8n-nodes-base.start",
        "logs": ["✓ Nœud de démarrage du workflow"],
        "risques": []
      },
      {
        "id": "5",
        "name": "Delete User",
        "type": "n8n-nodes-base.httpRequest",
        "logs": [
          "🌐 Requête HTTP DELETE vers: https://api.example.com/users/123",
          "   ⚠️  ATTENTION: Méthode DELETE détectée"
        ],
        "risques": [
          {
            "niveau": "élevé",
            "description": "Utilisation de la méthode DELETE"
          }
        ]
      }
    ],
    "flowsSimules": [
      {"from": "Start", "to": "HTTP Request", "outputIndex": 0, "inputIndex": 0}
    ],
    "logEtapes": [
      "🔄 Début de la simulation du workflow: My Workflow",
      "📍 Nœud 1/8: Start (n8n-nodes-base.start)",
      "  ✓ Nœud de démarrage du workflow",
      "..."
    ]
  }
}
```

---

## 🔧 API Reference

### Endpoints

#### `POST /api/scenarios`

Crée un nouveau scénario.

**Body** :

```json
{
  "nom": "string (requis)",
  "description": "string (optionnel)",
  "type": "workflow_n8n" | "appel_mcp" | "sequence_mixte" (requis),
  "payload": "object (requis)"
}
```

**Réponse** : `201 Created` avec le scénario créé

---

#### `GET /api/scenarios`

Liste tous les scénarios.

**Réponse** : `200 OK` avec un tableau de scénarios

---

#### `GET /api/scenarios/:id`

Récupère un scénario par ID.

**Réponse** : `200 OK` avec le scénario ou `404 Not Found`

---

#### `POST /api/run`

Lance la simulation d'un scénario.

**Body** :

```json
{
  "scenarioId": "string (requis)"
}
```

**Réponse** : `200 OK` avec les résultats de la simulation

---

#### `GET /api/runs/:runId`

Récupère les détails d'une exécution.

**Réponse** : `200 OK` avec les détails de l'exécution ou `404 Not Found`

---

#### `GET /health`

Health check du service.

**Réponse** :

```json
{
  "status": "healthy",
  "service": "prolex-sandbox",
  "version": "1.0.0",
  "timestamp": "2025-11-23T...",
  "config": {
    "mode": "strict",
    "gardesFousActifs": true
  }
}
```

---

## 🧪 Tests et validation

### Tester avec un workflow simple

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Dans un autre terminal, créer un scénario
npm run creer-scenario-workflow -- ../../n8n-workflows/020_example-hello-world.json

# 3. Copier l'ID du scénario retourné

# 4. Lancer la simulation
curl -X POST http://localhost:3001/api/run \
  -H "Content-Type: application/json" \
  -d '{"scenarioId": "<ID-COPIÉ>"}'
```

### Vérifier la détection de risques

Créez un scénario avec un workflow contenant une requête DELETE et vérifiez que :
- En mode `strict` : La simulation est bloquée
- En mode `relaxed` : La simulation s'exécute mais génère des alertes

---

## 📝 Limitations actuelles (v1)

### Ce que le Sandbox fait :

✅ Analyse la structure des workflows
✅ Détecte les actions critiques
✅ Simule les connexions entre nœuds
✅ Génère des mocks pour les appels MCP
✅ Évalue les risques
✅ Enregistre les exécutions

### Ce que le Sandbox ne fait PAS :

❌ N'exécute JAMAIS de workflows réels
❌ N'appelle JAMAIS les API de production
❌ N'évalue pas la logique métier complexe
❌ Ne simule pas les données réelles (utilise des mocks)
❌ Ne crée pas de backups (prévu pour v2)

---

## 🔮 Évolutions futures (v2+)

- [ ] Intégration avec AnythingLLM pour analyse sémantique
- [ ] Simulation de données réalistes (fake data generator)
- [ ] Backups automatiques avant simulation
- [ ] Interface web pour visualiser les simulations
- [ ] Comparaison de versions de workflows
- [ ] Détection de patterns de performance
- [ ] Intégration avec le SystemJournal
- [ ] Métriques et analytics des simulations

---

## 🤝 Support

Pour toute question ou problème :

- **Documentation principale** : Voir [INDEX_PROLEX.md](../../INDEX_PROLEX.md)
- **Issues GitHub** : Créer une issue sur le repo Prolex
- **Contact** : matthieu@automatt.ai

---

## 📄 Licence

MIT - Automatt.ai

---

**Dernière mise à jour** : 2025-11-23
**Version** : 1.0.0
**Statut** : ✅ Prêt pour utilisation
