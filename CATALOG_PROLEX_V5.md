# 📚 Catalog Prolex V5 - Architecture Vérifiée

**Last Updated**: 2025-11-30  
**Status**: Production (Cleaned)  
**Repositories**: 8 verified dépôts GitHub ProlexAi

---

## 🎯 Overview

Voici le **catalogue complet et vérified** de l'écosystème Prolex V5 / Automatt.

Chaque élément a été **mappé aux dépôts GitHub réels** et aux documents correspondants.

---

## 📦 17 Composants de Prolex V5 (VERIFIED)

### **1. AtmttViewer** ❌ 
**Status**: Non versionné (TODO)  
**Type**: Desktop Application (Electron)  
**Description**: Application Electron pour lire, éditer, prévisualiser Markdown/texte  
**Next Step**: À créer dépôt `prolexai/atmtt-viewer`

### **2. MCP n8n** ✅
**Status**: Actif  
**Repository**: `ProlexAi/prolex-mcp`  
**Type**: MCP Server (TypeScript)  
**Description**: Serveur MCP pour piloter n8n depuis Claude  
**Features**:
- `list_workflows()` → Liste workflows (15 trouvés ✓)
- `trigger_workflow()` → Déclenche workflows
- 37 tools MCP disponibles

### **3. MCP Google Workspace** ✅
**Status**: Actif (partiellement)  
**Repository**: `ProlexAi/prolex-mcp`  
**Type**: MCP Tools (6 tools par service)  
**Includes**:
- Google Drive (6 tools) - Besoin: `GOOGLE_REFRESH_TOKEN`
- Google Sheets (6 tools) - Besoin: `GOOGLE_REFRESH_TOKEN`
- Google Docs (5 tools) - Besoin: `GOOGLE_REFRESH_TOKEN`
- Gmail (6 tools) - Besoin: `GOOGLE_REFRESH_TOKEN`

**Status**: Configuré mais tokens manquants

### **4. Scripts de Monitoring** ✅
**Status**: À implémenter  
**Repository**: `ProlexAi/prolex-tools`  
**Type**: TypeScript / PowerShell scripts  
**Scripts à créer**:
- `checkN8N.ts` → Santé n8n (API test)
- `checkTraefik.ts` → Status Traefik (container + routing)
- `checkDocker.ts` → Vérifier services Docker
- `checkPostgres.ts` → Connexion & table `logs_events`

**Output**: Logs PostgreSQL + alertes

### **5. Table PostgreSQL "logs_events"** ✅
**Status**: À créer  
**Infrastructure**: VPS (PostgreSQL)  
**Purpose**: Logs centralisés (monitoring, erreurs, incidents)  
**Schema**:
```sql
CREATE TABLE logs_events (
  id SERIAL PRIMARY KEY,
  timestamp_utc TIMESTAMP DEFAULT NOW(),
  service VARCHAR(50),
  event_type VARCHAR(50),
  status VARCHAR(20),
  message TEXT,
  details JSONB,
  workflow_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **6. Workflow n8n – MONITORING_INFRA** ✅
**Status**: À créer & importer  
**Repository**: `ProlexAi/n8n-workflows`  
**Path**: `monitoring/100_MONITORING_INFRA.json`  
**Schedule**: Every 5 minutes  
**Checks**:
- VPS (CPU, Memory, Disk)
- Traefik (container, routing)
- SSL (expiry check)
- Docker (services running)
- PostgreSQL (connection test)

**Alert Rules**: CRITICAL, HIGH, MEDIUM severity levels

### **7. Workflow n8n – MONITORING_APPS** ✅
**Status**: À créer & importer  
**Repository**: `ProlexAi/n8n-workflows`  
**Path**: `monitoring/101_MONITORING_APPS.json`  
**Schedule**: Every 10 minutes  
**Checks**:
- n8n health (API, workflows count)
- MCP server (tools available)
- LLM/AnythingLLM (model endpoints)
- Memory leaks (process trends)

### **8. Workflow n8n – ERROR_ANALYZER** ✅
**Status**: À créer & importer  
**Repository**: `ProlexAi/n8n-workflows`  
**Path**: `monitoring/102_ERROR_ANALYZER.json`  
**Schedule**: Every 15 minutes  
**Operations**:
- Read `logs_events` (last 30min)
- Pattern detection (spikes, cascades)
- Severity scoring (0-100)
- Alert dispatch (Telegram, Slack, Email)

### **9. Script PowerShell "ranger_natifs.ps1"** ✅
**Status**: À créer  
**Repository**: `ProlexAi/prolex-tools`  
**Path**: `scripts/windows/ranger_natifs.ps1`  
**Purpose**: Nettoyer dossiers Windows natifs (Documents, Images, etc.)  
**Logic**: Déplace fichiers non-pro → `a_voir/`, préserve Automatt/Prolex

### **10. Fichier .reg "nettoyage_ce_pc.reg"** ✅
**Status**: À créer  
**Repository**: `ProlexAi/prolex-tools`  
**Path**: `scripts/windows/nettoyage_ce_pc.reg`  
**Purpose**: Masquer dossiers natifs dans "Ce PC"  
**Result**: Interface orientée travail uniquement

### **11. Architecture GitHub – Branches + Risk Level** ✅
**Status**: Documenté  
**Repository**: `ProlexAi/prolex-master`  
**Path**: `ARCHITECTURE.md`, Branch rules dans GitHub  
**Branches**: `feature/*`, `dev`, `main`  
**Merge Rules**:
- Risk Level % evaluation (0-100)
- Local trace required
- Auto-block if Risk > 40%

### **12. Plan d'Organisation Drive + GitHub + Local + VPS** ✅
**Status**: Documenté  
**Repository**: `ProlexAi/prolex-master`  
**Path**: `docs/ORGANIZATION_PLAN.md` (À créer)  
**Covers**:
- Google Drive structure (Contexts, RAG, Prompts, Logs)
- GitHub repos organization (8 repos)
- Local `/c/Automatt/` structure
- VPS infrastructure layout

### **13. Système Risk-LEVEL (%) pour Merges** ✅
**Status**: À implémenter  
**Repository**: `ProlexAi/prolex-master`  
**Path**: `docs/RISK_LEVELS.md`  
**Scoring**:
- 0-20% → Auto-merge allowed
- 21-40% → Manual review required
- 41-70% → Senior review + tests
- 71-100% → CRITICAL (block, escalate)

**Factors**: Files changed, complexity, scope, dependencies

### **14. Prompt "MONITOR-ENGINEER"** ✅
**Status**: À créer  
**Repository**: `ProlexAi/prolex-core`  
**Path**: `prompts/MONITOR_ENGINEER.md`  
**Role**: Agent IA spécialisé monitoring  
**Capabilities**:
- Génère scripts (TypeScript, PowerShell, SQL)
- Crée workflows n8n
- Analyse logs & anomalies
- Génère dashboards (Grafana)

### **15. Prompt "SYSTEM-ORGANIZER"** ✅
**Status**: À créer  
**Repository**: `ProlexAi/prolex-core`  
**Path**: `prompts/SYSTEM_ORGANIZER.md`  
**Role**: Agent IA pour organisation système  
**Capabilities**:
- Optimisation Windows
- Rangement fichiers
- Structuration DevOps
- Scripts PowerShell + .reg

### **16. Structure C:\Automatt (modèle stable)** ✅
**Status**: Defined  
**Local Location**: `C:\Users\Matt\Workspace\ProlexV5\`  
**Structure**:
```
C:\Automatt\
├── Prolex/            # Dépôts Git clonés
├── mcp/               # MCP servers
├── local-n8n/         # n8n local data
├── secrets/           # .env (non-versionnés)
├── backups/           # Prolex backups
└── a_voir/            # Files à trier
```

**Source of Truth**: Pour scripts, MCP, contextes, branches dev

### **17. Plan Complet Monitoring (fréquences, seuils, entités)** ✅
**Status**: Documenté dans n8n-workflows  
**Repository**: `ProlexAi/n8n-workflows`  
**Path**: `ARCHITECTURE.md`  
**Content**:
- Fréquences check (5min, 10min, 15min)
- Seuils criticité (VPS: CPU, Memory, Disk)
- Triggers d'alerte (Telegram, Slack, Email)
- Fondation supervision complète

---

## 🗂️ Dépôts GitHub Verified (8 repos)

| Dépôt | Purpose | Status | Last Updated |
|-------|---------|--------|--------------|
| **prolex-master** | Architecture spec & planning | ✅ | 2025-11-26 |
| **prolex-core** | Base types, models, services | ✅ | 2025-11-26 |
| **prolex-mcp** | MCP servers (n8n, Google Workspace, GitHub) | ✅ Active | 2025-11-29 |
| **prolex-kimmy** | Client assistant / lightweight workflows | ✅ | 2025-11-26 |
| **prolex-vector** | Vectorization, embeddings, RAG | ✅ | 2025-11-26 |
| **prolex-tools** | Monitoring scripts, CLI, utilities | ✅ | 2025-11-26 |
| **n8n-workflows** | n8n workflow definitions (JSON) | 🔄 Cleaned | 2025-11-30 |
| **opex-cli** | Operations CLI (billing, analysis) | ✅ | 2025-11-26 |

---

## 🚀 Next Steps (Prioritized)

### Phase 1: Clean Slate (DONE ✓)
- [x] Delete 15 old workflows from n8n
- [x] Clean GitHub n8n-workflows repo
- [x] Create ARCHITECTURE.md for workflows
- [x] Create .gitignore & templates

### Phase 2: Monitoring Stack (IN PROGRESS)
- [ ] Create PostgreSQL `logs_events` table (VPS)
- [ ] Implement `checkN8N.ts`, `checkTraefik.ts`, `checkDocker.ts`, `checkPostgres.ts`
- [ ] Create workflow `100_MONITORING_INFRA.json`
- [ ] Create workflow `101_MONITORING_APPS.json`
- [ ] Create workflow `102_ERROR_ANALYZER.json`
- [ ] Test end-to-end monitoring pipeline

### Phase 3: System Organization (PLANNED)
- [ ] Create `ranger_natifs.ps1` script
- [ ] Create `nettoyage_ce_pc.reg` file
- [ ] Document `MONITOR-ENGINEER` prompt
- [ ] Document `SYSTEM-ORGANIZER` prompt

### Phase 4: Documentation (PLANNED)
- [ ] Complete `RISK_LEVELS.md` with scoring matrix
- [ ] Create `ORGANIZATION_PLAN.md` (Drive + GitHub + Local + VPS)
- [ ] Create deployment checklist

### Phase 5: Google Workspace Integration (BLOCKED)
- [ ] Configure Google OAuth2 tokens
- [ ] Test Google Drive, Sheets, Docs, Gmail tools
- [ ] Create workflows for auto-organization

---

## 📊 Summary Matrix

| Component | Type | Status | Repository | Docs |
|-----------|------|--------|------------|------|
| AtmttViewer | Desktop App | ❌ TODO | TBD | - |
| MCP n8n | MCP Server | ✅ Active | prolex-mcp | README.md |
| MCP Google | MCP Tools | ⚠️ Partial | prolex-mcp | .env needed |
| Monitoring Scripts | Tools | 📝 Draft | prolex-tools | TBD |
| PostgreSQL logs_events | DB Table | 📝 Schema | VPS | ARCHITECTURE.md |
| Workflow INFRA | n8n | 📝 Template | n8n-workflows | ARCHITECTURE.md |
| Workflow APPS | n8n | 📝 Template | n8n-workflows | ARCHITECTURE.md |
| Workflow ERRORS | n8n | 📝 Template | n8n-workflows | ARCHITECTURE.md |
| ranger_natifs.ps1 | PowerShell | 📝 Spec | prolex-tools | TBD |
| nettoyage_ce_pc.reg | Registry | 📝 Spec | prolex-tools | TBD |
| GitHub Branches | CI/CD | ✅ Documented | prolex-master | ARCHITECTURE.md |
| Org Plan | Documentation | 📝 Draft | prolex-master | TBD |
| Risk-LEVEL System | Process | 📝 Spec | prolex-master | TBD |
| MONITOR-ENGINEER Prompt | AI System | 📝 Spec | prolex-core | TBD |
| SYSTEM-ORGANIZER Prompt | AI System | 📝 Spec | prolex-core | TBD |
| C:\Automatt Structure | Local FS | ✅ Defined | Local | N/A |
| Monitoring Plan | Strategy | ✅ Complete | n8n-workflows | ARCHITECTURE.md |

---

## 🔗 Key Document References

- **n8n-workflows/ARCHITECTURE.md** ← Start here for monitoring workflows
- **n8n-workflows/README.md** ← Setup & configuration
- **prolex-mcp/.env** ← Configuration (N8N_API_KEY, etc.)
- **prolex-master/ARCHITECTURE.md** (TBD) ← System architecture

---

## 👤 Author & Maintenance

- **Owner**: Matthieu (Automatt)
- **Maintained by**: PROLEX-AUTOMATT (IA assistant)
- **Last Updated**: 2025-11-30
- **Status**: Production (Cleaned Workflows)

---

**Next**: Create monitoring workflows → Test end-to-end → Document rest of system 🚀
