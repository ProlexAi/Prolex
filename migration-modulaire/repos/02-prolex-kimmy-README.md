# 🧠 Prolex Kimmy

> **Filtre d'entrée et classification intelligente des requêtes**
> **Repository**: `ProlexAi/prolex-kimmy`
> **Visibilité**: 🔒 PRIVÉ
> **Langage principal**: TypeScript/Node.js

---

## 🎯 Vue d'ensemble

**Prolex Kimmy** est le filtre d'entrée qui:
- Reçoit toutes les requêtes utilisateurs (WhatsApp, chat, email)
- Classifie l'intent parmi 13 catégories
- Évalue la complexité (simple/moyen/complexe)
- Exécute des actions rapides pour requêtes simples
- Génère des `KimmyPayload` structurés pour Prolex Core

**Modèle**: GPT-4 Turbo ou Claude Haiku (selon mode)

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Classification d'intent**: 13 catégories (TASK, CALENDAR, NOTE, etc.)
2. **Évaluation de complexité**: simple (Kimmy gère) | moyen/complexe (→ Prolex)
3. **Actions rapides**: Réponses directes pour requêtes simples
4. **Génération KimmyPayload**: Structure JSON pour Prolex Core
5. **Extraction de données**: Parsing entités (dates, noms, etc.)

### Ne fait PAS

- ❌ Décisions complexes (→ `prolex-core`)
- ❌ Exécution workflows (→ `prolex-opex`)
- ❌ RAG queries (→ `prolex-rag`)

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Classificateur d'intent** (`src/classifier/intent-classifier.ts`)
  - 13 catégories: TASK, CALENDAR, NOTE, QUESTION, WORKFLOW_REQUEST, etc.
  - Utilise GPT-4 Turbo avec prompts optimisés
  - Confidence scoring (0-100%)

- [x] **Évaluateur de complexité** (`src/classifier/complexity-evaluator.ts`)
  - Simple: Kimmy peut répondre directement
  - Moyen: Escalade vers Prolex
  - Complexe: Escalade + flag haute priorité

- [x] **Actions rapides** (`src/quick-actions/`)
  - Réponses FAQ
  - Calculs simples
  - Conversions
  - Recherches rapides

- [x] **Générateur KimmyPayload** (`src/models/kimmy-payload.ts`)
  - Validation JSON Schema
  - Extraction entités (NER)
  - Enrichissement contexte

- [x] **API webhook** (`src/api/webhook.ts`)
  - POST `/webhook/message` (entrée WhatsApp/chat)
  - Authentification token
  - Rate limiting

### Où coder

```
src/
├── classifier/        ← Classification intent + complexité
├── quick-actions/     ← Actions rapides (FAQ, calculs, etc.)
├── models/            ← KimmyPayload, Intent types
├── api/               ← Webhook entrant
└── utils/             ← Prompt builder, NER, validators
```

### Comment coder

**Stack**:
- TypeScript 5+
- Express.js (API)
- OpenAI SDK (GPT-4 Turbo)
- Anthropic SDK (Claude Haiku)
- Zod (validation)

**Style**: Voir [Airbnb TypeScript Guide](https://github.com/airbnb/javascript)

### Dépendances

**Ce module dépend de**:
- Aucune dépendance Prolex (point d'entrée)

**Modules qui dépendent de lui**:
- `prolex-core` (reçoit KimmyPayload)

---

## 📋 Les 13 Intents

| Intent | Description | Exemples |
|--------|-------------|----------|
| `TASK_CREATE` | Créer une tâche | "Ajoute une tâche pour faire X" |
| `CALENDAR_EVENT` | Événement calendrier | "RDV demain 14h avec client" |
| `NOTE_CREATE` | Créer note/document | "Note: idée pour projet Y" |
| `QUESTION` | Question générale | "C'est quoi Python?" |
| `WORKFLOW_REQUEST` | Demande workflow | "Automatise l'envoi de mails" |
| `CLIENT_REQUEST` | Action client | "Envoie proposition client X" |
| `CODE_HELP` | Aide code/dev | "Debug mon code Python" |
| `SEARCH` | Recherche info | "Cherche articles sur IA" |
| `REPORTING` | Rapport/analytics | "Rapport des ventes" |
| `DEVOPS` | Action DevOps | "Deploy sur prod" |
| `N8N_WORKFLOW` | Gestion workflow n8n | "Crée workflow n8n pour X" |
| `CONVERSATION` | Chat général | "Bonjour, comment ça va?" |
| `UNKNOWN` | Intent non classifié | ... |

---

## 🔄 Flux de traitement

```
User message
     │
     ▼
┌─────────────────────┐
│ Webhook /message    │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Intent Classifier   │ (GPT-4 → 1 des 13 intents)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Complexity Eval     │ (simple/moyen/complexe)
└──────────┬──────────┘
           ▼
      ┌────┴─────┐
      │          │
  [Simple]   [Moyen/Complexe]
      │          │
      ▼          ▼
 Quick Action  Generate KimmyPayload
   Response      │
                 ▼
              Send to Prolex Core
```

---

## 📦 Installation

```bash
git clone git@github.com:ProlexAi/prolex-kimmy.git
cd prolex-kimmy
pnpm install
cp .env.example .env
pnpm dev
```

### Variables d'environnement

```bash
NODE_ENV=development
PORT=3001

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

KIMMY_MODE=safe  # safe | quick_actions
PROLEX_CORE_URL=http://localhost:3000

WEBHOOK_SECRET=your-secret-token
```

---

## 🧪 Tests

```bash
pnpm test              # Tous tests
pnpm test:intents      # Tests classification intent
pnpm test:complexity   # Tests évaluation complexité
pnpm test:coverage     # Coverage
```

**Métriques cibles**:
- Intent classification accuracy: > 95%
- Complexity evaluation accuracy: > 90%
- Code coverage: > 80%

---

## 🚀 Déploiement

Kimmy est déployé comme workflow n8n + service Node.js:
- **n8n workflow**: `020_kimmy_classifier.json` (dans `prolex-opex`)
- **Service Node.js**: Ce repo (pour logic complexe)

---

## 📚 Documentation

- [Spécification Kimmy v4](docs/SPEC_KIMMY_V4.md)
- [Prompts système](prompts/)
- [API Reference](docs/API.md)

---

## 📄 License

Propriétaire - Automatt.ai © 2025
