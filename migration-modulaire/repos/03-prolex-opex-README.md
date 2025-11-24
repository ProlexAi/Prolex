# ⚙️ Prolex Opex

> **Bras exécutif - Workflows n8n et exécution autonome**
> **Repository**: `ProlexAi/prolex-opex`
> **Visibilité**: 🔒 PRIVÉ
> **Langage principal**: JSON (n8n workflows) + TypeScript

---

## 🎯 Vue d'ensemble

**Prolex Opex** est le bras exécutif qui:
- Stocke tous les workflows n8n (source de vérité = GitHub)
- Exécute les actions décidées par Prolex Core
- Valide via Proxy Master (garde-fous)
- Log toutes exécutions vers SystemJournal (Google Sheets)
- Synchronise automatiquement GitHub ↔ n8n

**Stack**: n8n (workflow engine) + Node.js (scripts)

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Workflows n8n**: Bibliothèque complète (30+ workflows)
2. **Proxy Master**: Routage, validation, garde-fous
3. **Exécution**: Exécuter actions depuis ProlexOutput
4. **Logging**: Tout log vers SystemJournal
5. **Synchronisation**: GitHub (source) → n8n (runtime)

### Ne fait PAS

- ❌ Décisions (→ `prolex-core`)
- ❌ Classification (→ `prolex-kimmy`)
- ❌ Stockage vectoriel (→ `prolex-rag`)

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Workflows n8n** (`workflows/`)
  - JSON exports depuis n8n UI
  - Convention de nommage stricte
  - Tests d'exécution
  - Documentation inline

- [x] **Proxy Master** (`proxy-master/`)
  - Routage: tool ID → workflow URL
  - Validation: JSON Schema des payloads
  - Garde-fous: règles de sécurité
  - Escalade humaine si nécessaire

- [x] **Scripts sync** (`scripts/`)
  - `export-from-n8n.sh`: Export n8n → GitHub
  - `import-to-n8n.sh`: Import GitHub → n8n
  - `validate-all.sh`: Validation JSON workflows

- [x] **Workflows de monitoring** (`workflows/400-499-monitoring/`)
  - Health checks
  - Performance monitoring
  - Error alerting

### Où coder

```
workflows/
├── 000-099-core/          ← Workflows système (sync, proxy, maintenance)
├── 100-199-productivity/  ← Productivité (tasks, calendar, notes)
├── 200-299-devops/        ← Dev/DevOps (git, deploy, monitoring)
├── 300-399-clients/       ← Workflows clients
├── 400-499-monitoring/    ← Monitoring et alertes
├── 500-599-reporting/     ← Rapports et analytics
├── 600-699-n8n-admin/     ← Admin n8n (backup, test, debug)
└── 900-999-examples/      ← Exemples et tests

proxy-master/
├── routes.yml             ← Routage tool → workflow
├── validation-rules.yml   ← Règles validation
└── guardrails.yml         ← Garde-fous sécurité
```

### Comment coder

**Workflows n8n**:
1. Designer dans n8n UI (http://localhost:5678)
2. Tester exécution manuellement
3. Exporter JSON via UI
4. Nommer selon convention: `<num>_<descriptive-name>.json`
5. Placer dans bon dossier (000-999)
6. Commit + push → auto-sync vers n8n

**Convention de nommage**:
- `010_sync-github-to-n8n.json` (core)
- `100_task-create.json` (productivity)
- `200_github-commit-analysis.json` (devops)
- `300_client-onboarding.json` (clients)
- `900_hello-world-example.json` (examples)

**Validation**:
```bash
# Valider JSON
jq empty workflows/**/*.json

# Valider structure
pnpm run validate:workflows
```

### Dépendances

**Ce module dépend de**:
- `prolex-core` (reçoit ProlexOutput)
- n8n instance (runtime)
- SystemJournal (Google Sheets)

**Modules qui dépendent de lui**:
- Aucun (point final d'exécution)

---

## 📂 Catalogue des workflows

### Core (000-099)

| ID | Nom | Description |
|----|-----|-------------|
| `010` | sync-github-to-n8n | Sync auto GitHub → n8n |
| `020` | proxy-master | Routage et validation |
| `050` | daily-maintenance | Maintenance quotidienne |

### Productivity (100-199)

| ID | Nom | Description |
|----|-----|-------------|
| `100` | task-create | Créer tâche (Todoist, Notion, etc.) |
| `110` | calendar-event | Créer événement calendrier |
| `120` | note-create | Créer note/document |

### DevOps (200-299)

| ID | Nom | Description |
|----|-----|-------------|
| `200` | github-commit-analysis | Analyse commits GitHub |
| `210` | deploy-to-vps | Déploiement VPS |

### 🚨 CASH WORKFLOWS (PROTÉGÉS)

**⚠️ INTERDICTION ABSOLUE de modifier ces workflows**:

- `200_leadgen_li_mail.json` - Lead generation
- `250_proposal_auto.json` - **CRITIQUE** - Propositions commerciales
- `300_content_machine.json` - Automatisation contenu
- `400_invoice_stripe_auto.json` - **CRITIQUE** - Facturation Stripe
- `450_relances_impayes.json` - **CRITIQUE** - Relances impayés
- `999_master_tracker.json` - **CRITIQUE** - Métriques cash

**Protection technique**: `cashWorkflowGuard.ts` bloque toute modification
**Violation**: Alert Telegram immédiate + log SystemJournal

Voir: [CASH_WORKFLOWS_LOCK.md](docs/CASH_WORKFLOWS_LOCK.md)

---

## 🔄 Synchronisation GitHub ↔ n8n

### Workflow: `010_sync-github-to-n8n.json`

**Déclencheur**: Webhook GitHub (push sur `main`)

**Actions**:
1. Détecte fichiers .json modifiés dans `workflows/`
2. Télécharge fichiers depuis GitHub
3. Import/update dans n8n via API
4. Log dans SystemJournal
5. Notification Telegram si erreur

**Activation**:
```bash
# Configure webhook GitHub
# URL: https://n8n.automatt.ai/webhook/github-sync
# Events: push
# Branch: main
```

---

## ⚠️ Proxy Master

### Fonctionnement

1. **Réception ProlexOutput**:
   ```json
   {
     "actions": [
       {
         "tool": "TASK_CREATE",
         "payload": {"title": "Faire X"}
       }
     ]
   }
   ```

2. **Routage** (via `routes.yml`):
   ```yaml
   TASK_CREATE:
     workflow_id: "100_task-create"
     webhook_url: "https://n8n.automatt.ai/webhook/task-create"
   ```

3. **Validation** (via `validation-rules.yml`):
   - JSON Schema validation
   - Autonomy level check
   - Cost estimation

4. **Garde-fous** (via `guardrails.yml`):
   - Blacklist (mots interdits)
   - Rate limiting (max X actions/minute)
   - Dry-run mode (test sans exécution)

5. **Exécution**:
   - Appel webhook n8n
   - Récupération résultat
   - Log SystemJournal

6. **Réponse**:
   ```json
   {
     "status": "success",
     "executionId": "abc123",
     "result": {...}
   }
   ```

---

## 📦 Installation

```bash
git clone git@github.com:ProlexAi/prolex-opex.git
cd prolex-opex
pnpm install
```

### Import workflows vers n8n

```bash
# Import tous workflows
pnpm run import:all

# Import workflow spécifique
pnpm run import:single workflows/100_task-create.json

# Validate avant import
pnpm run validate:workflows
```

---

## 🧪 Tests

### Test workflow localement

```bash
# Test avec payload exemple
pnpm run test:workflow 100_task-create \
  --payload '{"title":"Test task"}'

# Dry-run (pas d'exécution réelle)
pnpm run test:workflow 100_task-create --dry-run
```

### Validation workflows

```bash
# Valider tous JSON
pnpm run validate:json

# Vérifier naming convention
pnpm run validate:naming

# Vérifier metadata
pnpm run validate:metadata
```

---

## 🚀 Déploiement

### n8n Production

**URL**: https://n8n.automatt.ai

**Setup**:
```bash
cd prolex-infra/docker
docker-compose up -d n8n

# Import workflows
cd ../../prolex-opex
pnpm run import:all --env production
```

### Webhook GitHub

**Configuration**:
- URL: `https://n8n.automatt.ai/webhook/github-sync`
- Secret: `$GITHUB_WEBHOOK_SECRET`
- Events: `push`
- Branch: `main`

---

## 📊 Logging (SystemJournal)

Chaque exécution log vers Google Sheets:

| Colonne | Valeur |
|---------|--------|
| `timestamp` | ISO 8601 |
| `requestId` | UUID |
| `agent` | "prolex" / "kimmy" / "opex" |
| `action` | Tool ID |
| `status` | "success" / "error" |
| `details` | JSON |
| `cost` | USD |

**Google Sheets**: [SystemJournal](https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk)

---

## 📚 Documentation

- [Workflow conventions](docs/WORKFLOW_CONVENTIONS.md)
- [Proxy Master](docs/PROXY_MASTER.md)
- [Cash workflows lock](docs/CASH_WORKFLOWS_LOCK.md)
- [Catalog complet](WORKFLOWS_CATALOG.md)

---

## 📄 License

Propriétaire - Automatt.ai © 2025
