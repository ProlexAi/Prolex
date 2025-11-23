# CLAUDE.md - AI Assistant Guide for Prolex v4

> **Comprehensive guide for AI assistants working on the Prolex codebase**
> **Last Updated**: 2025-11-22
> **Version**: 4.0

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Architecture](#architecture)
4. [Repository Structure](#repository-structure)
5. [Development Workflows](#development-workflows)
6. [Key Conventions](#key-conventions)
7. [File Organization Principles](#file-organization-principles)
8. [Common Tasks](#common-tasks)
9. [Important Files Reference](#important-files-reference)
10. [Safety & Security](#safety--security)
11. [Testing & Validation](#testing--validation)
12. [Tips for Effective Work](#tips-for-effective-work)

---

## 🚀 Quick Start

### First Time Here?

1. **Read this section first** to understand the project context
2. **Review [INDEX_PROLEX.md](INDEX_PROLEX.md)** - Central navigation document
3. **Check [README.md](README.md)** - Project overview and public-facing documentation
4. **Understand the architecture** from [docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)

### Essential Context

**Prolex** is an AI orchestrator brain for Automatt.ai that:
- Processes natural language requests through a 3-tier architecture (Kimmy → Prolex → Opex)
- Autonomously designs, creates, and modifies n8n workflows
- Maintains complete traceability of all operations via SystemJournal (Google Sheets)
- Operates with 4 levels of autonomy (0-3) for granular control

**Current State**: v4.0 - Production-ready architecture with autonomous workflow management

---

## 🎯 Project Overview

### What is Prolex?

Prolex is the **orchestrator AI brain** for Automatt.ai with three main components:

```
┌──────────────────────────────────┐
│ KIMMY (Entry Filter)             │
│ - Classifies intent              │  ← LLM + n8n
│ - Evaluates complexity           │
│ - Produces KimmyPayload          │
└──────────┬───────────────────────┘
           ↓ KimmyPayload (JSON)
┌──────────────────────────────────┐
│ PROLEX (Orchestrator Brain)      │
│ - Reasons & plans                │  ← Claude 3.5 Sonnet + RAG
│ - Selects tools                  │
│ - Produces ProlexOutput          │
└──────────┬───────────────────────┘
           ↓ ProlexOutput (JSON)
┌──────────────────────────────────┐
│ OPEX (Execution Arm)             │
│ - Validates (Proxy Master)       │  ← n8n workflows
│ - Executes workflows             │
│ - Logs to SystemJournal          │
└──────────────────────────────────┘
```

### Key Technologies

- **LLMs**: Claude 3.5 Sonnet (Prolex), GPT-4 Turbo/Claude Haiku (Kimmy)
- **Workflow Engine**: n8n (self-hosted)
- **RAG**: AnythingLLM with Google Drive integration
- **Logging**: Google Sheets (SystemJournal)
- **Infrastructure**: Docker, Traefik, PostgreSQL, Redis
- **Version Control**: GitHub (source of truth for workflows)
- **MCP Servers**: Custom Model Context Protocol servers for integrations

### Core Capabilities (v4+)

- ✨ **Autonomous workflow design**: `N8N_WORKFLOW_DESIGN`
- ✨ **Workflow creation/modification**: `N8N_WORKFLOW_UPSERT` (sandbox)
- ✨ **Workflow testing**: `N8N_WORKFLOW_TEST`
- ✨ **4 autonomy levels**: Fine-grained permission control (0-3)
- ✨ **30+ tools**: Productivity, DevOps, clients, monitoring, etc.
- ✨ **Complete traceability**: Every action logged to SystemJournal

---

## 🏗️ Architecture

### Three-Tier Pipeline

#### 1. Kimmy (Entry Filter)
- **Role**: Filter and structure incoming requests
- **Technology**: LLM + n8n workflow
- **Input**: Natural language (always French)
- **Output**: `KimmyPayload` (JSON)
- **Key Functions**:
  - Intent classification (13 types)
  - Complexity evaluation
  - Quick actions for simple tasks
  - Escalation to Prolex for complex tasks

#### 2. Prolex (Orchestrator Brain)
- **Role**: Reasoning, planning, and tool selection
- **Technology**: Claude 3.5 Sonnet + AnythingLLM RAG
- **Input**: `KimmyPayload` (JSON)
- **Output**: `ProlexOutput` (JSON)
- **Key Functions**:
  - Multi-step planning
  - Tool selection from 30+ available tools
  - Autonomy level enforcement
  - Context-aware decision making

#### 3. Opex (Execution Arm)
- **Role**: Validate and execute actions
- **Technology**: n8n workflows + Proxy Master
- **Input**: `ProlexOutput` (JSON)
- **Output**: Execution results → SystemJournal
- **Key Functions**:
  - Validation via Proxy Master (guard rails)
  - Workflow execution
  - Logging to SystemJournal
  - Error handling and alerts

### Autonomy Levels

| Level | Name | Capabilities | Use Case |
|-------|------|--------------|----------|
| **0** | Read-only | Read docs, analyze logs, answer questions | Initial validation, audit |
| **1** | Read + Logs | Level 0 + logging, notes, web search | Staging, training |
| **2** | Low-risk actions | Level 1 + tasks, calendar, workflow design | Daily personal use |
| **3** | Advanced actions | Level 2 + client workflows, n8n management | Production with validated workflows |

**Current Level**: 2 (configurable in `config/autonomy.yml`)

### Data Flow

1. **User Request** → Kimmy (via chat/WhatsApp/email)
2. **KimmyPayload** → Prolex (via n8n webhook)
3. **ProlexOutput** → Proxy Master (validation)
4. **Validated Action** → n8n Workflow Execution
5. **Results** → SystemJournal (Google Sheets)
6. **Response** → User

---

## 📂 Repository Structure

```
Prolex/
├── README.md                               # Public-facing overview
├── INDEX_PROLEX.md                         # Central navigation (START HERE)
├── CLAUDE.md                               # This file (AI assistant guide)
│
├── docs/                                   # All documentation
│   ├── architecture/
│   │   └── ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md  # Master architecture doc
│   ├── specifications/
│   │   ├── SPEC_KIMMY_V4.md               # Kimmy specification
│   │   ├── SPEC_PROLEX_V4.md              # Prolex specification
│   │   └── SPEC_OPEX_V4.md                # Opex specification
│   └── guides/
│       ├── ANALYSE_CRITIQUE_V4.md         # Expert analysis
│       └── GUIDE_CLIENTS.md               # Client-facing guide
│
├── schemas/                                # JSON Schema definitions
│   ├── kimmy_payload.schema.json          # Kimmy → Prolex payload
│   ├── prolex_output.schema.json          # Prolex → Opex output
│   ├── system_journal.schema.json         # SystemJournal log format
│   ├── autonomy_levels.yml                # Autonomy level definitions
│   ├── payloads/                          # Tool payload schemas
│   ├── logs/                              # Logging schemas
│   └── tools/                             # Tool definition schemas
│
├── config/                                 # System configuration
│   ├── autonomy.yml                       # ⚙️ Autonomy levels & permissions
│   ├── system.yml                         # ⚙️ Global system config
│   ├── kimmy_config.yml                   # Kimmy-specific config
│   ├── prolex_config.yml                  # Prolex-specific config
│   └── opex_workflows.yml                 # Workflow catalog (source of truth)
│
├── rag/                                    # Knowledge base for Prolex RAG
│   ├── tools/
│   │   └── tools.yml                      # 📋 Complete tool catalog (30+)
│   ├── rules/
│   │   └── 01_REGLES_PRINCIPALES.md       # Core rules
│   ├── examples/                          # Usage examples
│   └── context/
│       └── 02_VARIABLES_ET_CONTEXTE.md    # Context variables
│
├── n8n-workflows/                          # n8n workflow definitions (JSON)
│   ├── 010_sync-github-to-n8n.json        # GitHub → n8n sync workflow
│   ├── 020_example-hello-world.json       # Example workflow
│   ├── 030_github-dev-log-to-sheets.json  # Dev log workflow
│   ├── 050_daily_full_maintenance_prolex_v4.json  # Maintenance
│   └── README.md                          # Workflow sync documentation
│
├── mcp/                                    # MCP (Model Context Protocol) servers
│   └── n8n-server/                        # ✅ n8n MCP server (existing)
│       ├── src/
│       │   ├── index.ts                   # MCP server entry point
│       │   ├── n8nClient.ts               # n8n API client
│       │   ├── tools/                     # MCP tool definitions
│       │   └── types.ts                   # TypeScript types
│       ├── scripts/                       # Utility scripts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── services/                               # Backend services
│   └── prolex-sandbox/                    # ✅ Prolex Sandbox (test environment)
│       ├── src/
│       │   ├── index.ts                   # Service entry point
│       │   ├── server.ts                  # Express server
│       │   ├── config.ts                  # Configuration
│       │   ├── db.ts                      # Database layer
│       │   ├── services/                  # Core services
│       │   │   ├── sandboxService.ts      # Main sandbox orchestrator
│       │   │   ├── n8nSimulator.ts        # n8n workflow simulator
│       │   │   ├── mcpSimulator.ts        # MCP call simulator
│       │   │   └── gardeFousSandbox.ts    # Risk evaluation
│       │   ├── routes/                    # API routes
│       │   │   ├── scenariosRoutes.ts     # Scenario endpoints
│       │   │   └── runsRoutes.ts          # Run endpoints
│       │   └── types/                     # TypeScript types
│       ├── scripts/                       # Utility scripts
│       │   └── creer-scenario-workflow-n8n.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md                      # Complete documentation
│
├── infra/                                  # Infrastructure as code
│   └── vps-prod/                          # Production VPS config
│       ├── docker-compose.yml             # Docker stack definition
│       ├── scripts/
│       │   ├── bootstrap_vps.sh           # VPS initial setup
│       │   └── rebuild-n8n.sh             # n8n rebuild script
│       └── docs/
│
├── tools/                                  # Utility tools
│   └── filter_workflows.py                # Workflow catalog filtering
│
├── .github/                                # GitHub workflows
│   └── workflows/
│       ├── ci.yml                         # Main CI pipeline
│       ├── pr-validation.yml              # PR validation
│       ├── security.yml                   # Security scanning
│       └── yamllint.yml                   # YAML linting
│
└── .markdownlint.json                      # Markdown linting config
└── .yamllint.yml                           # YAML linting config
```

### Key Directory Purposes

| Directory | Purpose | When to Modify |
|-----------|---------|----------------|
| `docs/` | All documentation | Adding/updating docs |
| `schemas/` | JSON Schema definitions | Changing data structures |
| `config/` | System configuration | Changing behavior/settings |
| `rag/` | Prolex knowledge base | Adding tools, rules, context |
| `n8n-workflows/` | Workflow definitions | Creating/modifying workflows |
| `mcp/` | MCP servers | Adding integrations |
| `services/` | Backend services | Adding/modifying services |
| `infra/` | Infrastructure code | Deployment changes |

---

## 🔄 Development Workflows

### 1. Working with n8n Workflows

#### Workflow Lifecycle

```
Design in n8n UI → Export JSON → Add to n8n-workflows/ →
Git commit + push → GitHub webhook → Auto-sync to n8n
```

#### Creating a New Workflow

1. **Design** in n8n UI (http://localhost:5678)
2. **Export** as JSON
3. **Name** following convention: `<num>_<descriptive-name>.json`
   - `000-099`: core workflows
   - `100-199`: productivity
   - `200-299`: dev/DevOps
   - `300-399`: clients
   - `400-499`: monitoring
   - `500-599`: reporting
   - `600-699`: n8n admin
   - `900-999`: examples/tests
4. **Add** to `n8n-workflows/` directory
5. **Update** `config/opex_workflows.yml` with metadata
6. **Commit** and push to GitHub
7. **Verify** auto-sync via `010_sync-github-to-n8n.json` workflow

#### Modifying an Existing Workflow

1. **Read** current JSON from `n8n-workflows/`
2. **Edit** JSON directly OR modify in n8n UI and re-export
3. **Update** version/timestamps in metadata
4. **Commit** changes
5. **Auto-sync** will update n8n instance

### 2. Adding a New Tool

#### Step-by-Step Process

1. **Define in tools catalog** (`rag/tools/tools.yml`):
   ```yaml
   - id: NEW_TOOL_ID
     name: "Tool Name"
     description: "What it does"
     category: productivity|devops|client|monitoring|etc
     risk_level: low|medium|high
     auto_allowed_levels: [1, 2, 3]  # Which autonomy levels can use
     target:
       type: webhook
       url: "https://n8n.automatt.ai/webhook/tool-endpoint"
       method: POST
     payload_schema: "schemas/payloads/new_tool.schema.json"
   ```

2. **Create payload schema** (`schemas/payloads/new_tool.schema.json`):
   ```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "type": "object",
     "properties": {
       "param1": {"type": "string"},
       "param2": {"type": "number"}
     },
     "required": ["param1"]
   }
   ```

3. **Create n8n workflow** (name: `<num>_new_tool.json`)
   - Webhook trigger
   - Validation logic
   - External API calls
   - Response formatting
   - SystemJournal logging

4. **Update Proxy Master** to route the new tool

5. **Test thoroughly**:
   - Schema validation
   - Workflow execution
   - Error handling
   - Logging

6. **Document** in relevant specification docs

### 3. Modifying Configuration

#### Autonomy Level Changes

**File**: `config/autonomy.yml`

```yaml
# Change current level (0-3)
prolex_current_autonomy_level: 2

# Modify permissions for a level
autonomy_levels:
  2:
    allowed_actions:
      - TASK_CREATE
      - NEW_TOOL_ID  # Add new tool
```

**Impact**: Affects which tools Prolex can auto-execute

#### System Configuration Changes

**File**: `config/system.yml`

Common modifications:
- Change environment (`development` → `staging` → `production`)
- Adjust cost limits
- Modify API rate limits
- Update monitoring settings
- Change Kimmy mode (`safe` vs `quick_actions`)

### 4. Git Workflow

#### Branch Naming Convention

- `main` - Production-ready code
- `feature/**` - New features
- `claude/**` - Claude-generated branches (auto-created)
- `fix/**` - Bug fixes
- `docs/**` - Documentation updates

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Examples**:
```
feat(n8n): add client onboarding workflow

docs(architecture): update v4 specification

fix(mcp): resolve n8n connection timeout issue
```

#### Pull Request Process

1. **Create branch** from `main`
2. **Make changes** following conventions
3. **Test locally** (see Testing section)
4. **Commit** with descriptive messages
5. **Push** to GitHub
6. **Create PR** with:
   - Clear title and description
   - Reference to issues if applicable
   - Test results
   - Screenshots if UI changes
7. **CI validation** must pass:
   - JSON schema validation
   - YAML validation
   - Markdown linting
   - Reference checking
   - Workflow JSON validation
8. **Merge** after review

---

## 🎨 Key Conventions

### 1. Naming Conventions

#### Files

- **Workflows**: `<num>_<descriptive-kebab-case>.json`
  - Example: `010_sync-github-to-n8n.json`
- **Documentation**: `SCREAMING_SNAKE_CASE.md` for important docs
  - Example: `SPEC_PROLEX_V4.md`, `INDEX_PROLEX.md`
- **Config files**: `lowercase_snake_case.yml`
  - Example: `autonomy.yml`, `system.yml`
- **Schemas**: `lowercase_snake_case.schema.json`
  - Example: `kimmy_payload.schema.json`

#### Tools

- **Tool IDs**: `SCREAMING_SNAKE_CASE`
  - Example: `TASK_CREATE`, `N8N_WORKFLOW_DESIGN`
- **Categories**: `lowercase` single word
  - Example: `productivity`, `devops`, `monitoring`

#### Variables

- **YAML config**: `snake_case`
  - Example: `prolex_current_autonomy_level`
- **JSON schema**: `camelCase`
  - Example: `requestId`, `userId`

### 2. Documentation Conventions

#### Markdown Structure

```markdown
# Title (H1 - only one per document)

## Section (H2)

### Subsection (H3)

#### Detail (H4)
```

#### Links

- **Internal**: Use relative paths
  - `[Link](./docs/file.md)` or `[Link](docs/file.md)`
- **External**: Use full URLs
  - `[Link](https://example.com)`

#### Code Blocks

Always specify language:
```yaml
# config.yml
key: value
```

```json
{
  "key": "value"
}
```

```typescript
const example = "value";
```

### 3. Schema Conventions

- **JSON Schema version**: Draft 07
- **Required fields**: Always specify
- **Descriptions**: Mandatory for all properties
- **Examples**: Include where helpful
- **Validation**: Use `pattern`, `enum`, `minimum`, etc.

Example:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TaskCreate",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title",
      "minLength": 1,
      "maxLength": 200
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Task priority level"
    }
  },
  "required": ["title"]
}
```

### 4. Workflow Conventions

#### n8n Workflow Structure

1. **Webhook trigger** (always first node)
2. **Validation** (validate payload against schema)
3. **Business logic** (main workflow operations)
4. **Error handling** (catch and log errors)
5. **Response formatting** (standardized response)
6. **SystemJournal logging** (always log execution)

#### Workflow Metadata

Include in workflow JSON:
- `name`: Descriptive name
- `tags`: Category tags (e.g., `["productivity", "tasks"]`)
- `active`: Boolean (true/false)
- `settings`: Execution settings

### 5. Error Handling

#### Standard Error Response Format

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "timestamp": "2025-11-22T10:00:00Z"
  }
}
```

#### Error Codes

- `VALIDATION_ERROR`: Schema/input validation failed
- `PERMISSION_ERROR`: Insufficient autonomy level
- `EXECUTION_ERROR`: Workflow execution failed
- `EXTERNAL_API_ERROR`: External service error
- `TIMEOUT_ERROR`: Operation timed out

---

## 📁 File Organization Principles

### 1. Configuration Files

**Location**: `config/`

- ✅ **DO**: Keep environment-specific configs separate
- ✅ **DO**: Use YAML for human-editable configs
- ✅ **DO**: Include comments explaining each setting
- ❌ **DON'T**: Commit secrets or API keys
- ❌ **DON'T**: Use hard-coded values that should be configurable

### 2. Documentation

**Location**: `docs/`

- ✅ **DO**: Organize by type (architecture, specifications, guides)
- ✅ **DO**: Include a clear hierarchy
- ✅ **DO**: Cross-reference related documents
- ❌ **DON'T**: Duplicate content (link instead)
- ❌ **DON'T**: Let docs get stale (update with code changes)

### 3. Schemas

**Location**: `schemas/`

- ✅ **DO**: Validate all schemas in CI
- ✅ **DO**: Version schemas when making breaking changes
- ✅ **DO**: Include examples in schema docs
- ❌ **DON'T**: Make breaking changes without migration plan
- ❌ **DON'T**: Skip required field documentation

### 4. Workflows

**Location**: `n8n-workflows/`

- ✅ **DO**: Export from n8n with clean formatting
- ✅ **DO**: Follow numeric naming convention
- ✅ **DO**: Include README explaining sync process
- ❌ **DON'T**: Manually edit complex node structures
- ❌ **DON'T**: Commit without testing in n8n first

---

## ✅ Common Tasks

### Task 1: Add a New Tool to Prolex

```bash
# 1. Define tool in catalog
vim rag/tools/tools.yml
# Add tool definition with ID, category, risk_level, etc.

# 2. Create payload schema
vim schemas/payloads/my_new_tool.schema.json
# Define JSON Schema for tool input

# 3. Create n8n workflow
# - Design in n8n UI
# - Export as JSON
# - Save to n8n-workflows/XXX_my_new_tool.json

# 4. Update workflow catalog
vim config/opex_workflows.yml
# Add workflow metadata

# 5. Test and validate
npm install -g ajv-cli
ajv compile -s schemas/payloads/my_new_tool.schema.json

# 6. Commit changes
git add .
git commit -m "feat(tools): add MY_NEW_TOOL for <purpose>"
git push
```

### Task 2: Change Prolex Autonomy Level

```bash
# 1. Edit autonomy configuration
vim config/autonomy.yml

# Change line:
# prolex_current_autonomy_level: 2  # Change to desired level (0-3)

# 2. Review what changes this enables
# Check allowed_actions for the new level

# 3. Commit the change
git add config/autonomy.yml
git commit -m "config(autonomy): change level to <X> for <reason>"
git push

# 4. Verify in Prolex behavior
# Test that tools are properly allowed/blocked
```

### Task 3: Create a New n8n Workflow

```bash
# 1. Design workflow in n8n UI (http://localhost:5678)

# 2. Test workflow execution

# 3. Export workflow as JSON from n8n

# 4. Determine workflow number
ls n8n-workflows/*.json | tail -5
# Find next available number in appropriate range

# 5. Save workflow
mv ~/Downloads/My_Workflow.json n8n-workflows/350_my_workflow.json

# 6. Update workflow catalog
vim config/opex_workflows.yml
# Add workflow entry with metadata

# 7. Commit and push
git add n8n-workflows/350_my_workflow.json config/opex_workflows.yml
git commit -m "feat(n8n): add workflow for <purpose>"
git push

# 8. Verify auto-sync
# Check n8n instance to confirm workflow appears
```

### Task 4: Update Documentation

```bash
# 1. Identify document to update
# Check INDEX_PROLEX.md for document location

# 2. Read current version
cat docs/specifications/SPEC_PROLEX_V4.md

# 3. Make changes
vim docs/specifications/SPEC_PROLEX_V4.md

# 4. Validate markdown
npm install -g markdownlint-cli
markdownlint docs/specifications/SPEC_PROLEX_V4.md

# 5. Update index if needed
vim INDEX_PROLEX.md

# 6. Commit changes
git add docs/specifications/SPEC_PROLEX_V4.md
git commit -m "docs(spec): update Prolex specification for <change>"
git push
```

### Task 5: Debug a Workflow Issue

```bash
# 1. Check SystemJournal logs
# Open: https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
# Tab: SystemJournal
# Filter by workflow_id or request_id

# 2. Check workflow definition
cat n8n-workflows/<workflow_file>.json | jq .

# 3. Test workflow in n8n UI
# Manual execution with test payload

# 4. Check n8n execution logs
# n8n UI → Executions → Find failed execution

# 5. Fix issue (in n8n UI or JSON)

# 6. Re-export and update if needed
# Follow "Create a New n8n Workflow" steps above

# 7. Re-test and verify
```

### Task 6: Add a New MCP Server

```bash
# 1. Create MCP server directory
mkdir -p mcp/my-new-server/src

# 2. Initialize Node.js project
cd mcp/my-new-server
npm init -y

# 3. Install MCP SDK
npm install @modelcontextprotocol/sdk

# 4. Create server implementation
# See mcp/n8n-server/src/index.ts as reference

# 5. Add TypeScript config
cp ../n8n-server/tsconfig.json .

# 6. Build and test
npm run build
node dist/index.js

# 7. Update main README
vim ../../README.md
# Add new MCP server section

# 8. Commit
git add mcp/my-new-server
git commit -m "feat(mcp): add my-new-server for <integration>"
git push
```

---

## 📚 Important Files Reference

### Must-Read Documents (Priority Order)

1. **[INDEX_PROLEX.md](INDEX_PROLEX.md)** - Central navigation, start here
2. **[README.md](README.md)** - Project overview
3. **[docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md](docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)** - Master architecture document (824 lines)
4. **[CLAUDE.md](CLAUDE.md)** - This file (AI assistant guide)

### Specifications (Detail Level)

1. **[docs/specifications/SPEC_KIMMY_V4.md](docs/specifications/SPEC_KIMMY_V4.md)** - Kimmy component spec
2. **[docs/specifications/SPEC_PROLEX_V4.md](docs/specifications/SPEC_PROLEX_V4.md)** - Prolex component spec
3. **[docs/specifications/SPEC_OPEX_V4.md](docs/specifications/SPEC_OPEX_V4.md)** - Opex component spec

### Configuration (Runtime Behavior)

1. **[config/autonomy.yml](config/autonomy.yml)** - Autonomy levels and permissions
2. **[config/system.yml](config/system.yml)** - Global system configuration
3. **[config/opex_workflows.yml](config/opex_workflows.yml)** - Workflow catalog
4. **[rag/tools/tools.yml](rag/tools/tools.yml)** - Complete tool catalog

### Schemas (Data Structures)

1. **[schemas/kimmy_payload.schema.json](schemas/kimmy_payload.schema.json)** - Kimmy → Prolex
2. **[schemas/prolex_output.schema.json](schemas/prolex_output.schema.json)** - Prolex → Opex
3. **[schemas/system_journal.schema.json](schemas/system_journal.schema.json)** - Logging format
4. **[schemas/tools/tool_definition.schema.json](schemas/tools/tool_definition.schema.json)** - Tool schema

### Workflows (Key Examples)

1. **[n8n-workflows/010_sync-github-to-n8n.json](n8n-workflows/010_sync-github-to-n8n.json)** - GitHub sync
2. **[n8n-workflows/020_example-hello-world.json](n8n-workflows/020_example-hello-world.json)** - Simple example
3. **[n8n-workflows/050_daily_full_maintenance_prolex_v4.json](n8n-workflows/050_daily_full_maintenance_prolex_v4.json)** - Maintenance

### Quick Reference Tables

#### When to Read What

| Task | Read These Files |
|------|------------------|
| Understanding the project | INDEX_PROLEX.md, README.md, ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md |
| Adding a tool | rag/tools/tools.yml, SPEC_OPEX_V4.md, tool schema examples |
| Creating workflow | n8n-workflows/README.md, SPEC_OPEX_V4.md, example workflows |
| Changing autonomy | config/autonomy.yml, SPEC_PROLEX_V4.md |
| Debugging | SystemJournal (Google Sheets), relevant workflow JSON, system.yml |
| Understanding data flow | All three SPEC_*.md files, schema files |

#### File Modification Frequency

| Files | Modification Frequency | Version Control |
|-------|------------------------|-----------------|
| `config/*.yml` | Medium | Track changes carefully |
| `rag/tools/tools.yml` | Medium | Update when adding tools |
| `n8n-workflows/*.json` | High | Auto-sync from n8n |
| `docs/*.md` | Low-Medium | Keep in sync with code |
| `schemas/*.json` | Low | Version breaking changes |

---

## 🔒 Safety & Security

### Critical Safety Rules

1. **NEVER commit secrets**
   - ❌ API keys
   - ❌ Passwords
   - ❌ Tokens
   - ❌ Credentials
   - ✅ Use environment variables
   - ✅ Use `.env` files (gitignored)

2. **ALWAYS validate inputs**
   - Every webhook must validate against schema
   - Use JSON Schema validation
   - Sanitize user inputs
   - Check autonomy levels before execution

3. **NEVER bypass Proxy Master**
   - All tool executions go through Proxy Master
   - No direct n8n workflow triggers from external sources
   - Proxy validates autonomy levels and permissions

4. **ALWAYS log to SystemJournal**
   - Every action must be logged
   - Include: timestamp, agent, action, result, cost
   - Log errors with full context

5. **🚨 NEVER touch CASH workflows 🚨**
   - ❌ FORBIDDEN to create, modify, delete, trigger, repair, or analyze
   - ❌ Workflows: `200_`, `250_`, `300_`, `400_`, `450_`, `999_master_*`
   - ❌ Keywords: `leadgen`, `proposal`, `invoice`, `stripe`, `relance`, `cash`
   - ✅ Technical lock automatically blocks these operations
   - ✅ Violation triggers immediate alert to Matthieu
   - 📖 See: [CASH_WORKFLOWS_LOCK.md](CASH_WORKFLOWS_LOCK.md) for complete details

### Cash Workflow Protection (CRITICAL)

**⚠️ ZONE INTERDITE — Date de verrouillage: 2025-11-22**

Prolex is **ABSOLUTELY FORBIDDEN** from:
- Creating workflows with forbidden patterns
- Modifying existing cash workflows
- Triggering cash workflows manually
- Analyzing or proposing improvements to cash workflows

**Protected workflows:**
- `200_leadgen_li_mail.json` - Lead generation
- `250_proposal_auto.json` - **CRITICAL** - Commercial proposals
- `300_content_machine.json` - Content automation
- `400_invoice_stripe_auto.json` - **CRITICAL** - Invoicing & Stripe
- `450_relances_impayes.json` - **CRITICAL** - Payment reminders
- `999_master_tracker.json` - **CRITICAL** - Cash metrics tracking

**Technical enforcement:**
- Location: `mcp/n8n-server/src/security/cashWorkflowGuard.ts`
- Applied in: `createWorkflow()`, `updateWorkflow()`, `triggerWorkflow()`
- Violation: Immediate error + Telegram alert to Matthieu + SystemJournal log

**If you detect a cash workflow:**
1. **STOP** immediately ✋
2. **REFUSE** the operation with error message
3. **ALERT** Matthieu via Telegram 📱
4. **LOG** incident to SystemJournal (severity: CRITICAL)
5. **MOVE ON** to other tasks ➡️

**Complete documentation:** [CASH_WORKFLOWS_LOCK.md](CASH_WORKFLOWS_LOCK.md)

### Prolex Sandbox - Safe Testing Environment

**⚙️ SERVICE COMPLÉMENTAIRE - Disponible depuis: 2025-11-23**

Le **Prolex Sandbox** est un service complémentaire aux garde-fous existants qui permet :
- ✅ **Expérimentation sécurisée** : Tester workflows et appels MCP sans toucher à la production
- ✅ **Apprentissage** : Analyser et détecter les patterns à risque avant exécution
- ✅ **Validation préventive** : Identifier les problèmes en amont des garde-fous critiques

**Caractéristiques** :
- **Simulation complète** : Analyse workflows n8n, appels MCP, séquences mixtes
- **Détection de risques** : Identifie actions critiques (DELETE, DROP TABLE, etc.)
- **2 modes** :
  - `strict` : Bloque les actions à risque élevé/critique
  - `relaxed` : Simule tout mais génère des alertes détaillées
- **Aucune exécution réelle** : N'appelle JAMAIS les API de production

**Utilisation** :
```bash
# Démarrer le service
cd services/prolex-sandbox
npm install && npm run dev

# Créer un scénario depuis un workflow
npm run creer-scenario-workflow -- ../../n8n-workflows/020_example-hello-world.json

# Lancer une simulation
curl -X POST http://localhost:3001/api/run \
  -H "Content-Type: application/json" \
  -d '{"scenarioId": "<ID>"}'
```

**Relation avec les garde-fous** :
- Le Sandbox **complète** (ne remplace pas) les garde-fous de passage humain
- Permet de détecter les risques **avant** d'atteindre les protections critiques
- Offre un environnement d'apprentissage **sans danger** pour Prolex

**Documentation complète** : [services/prolex-sandbox/README.md](services/prolex-sandbox/README.md)

### Autonomy Level Safety

| Level | Safety Measures |
|-------|----------------|
| **0** | Read-only, no actions possible |
| **1** | Logging only, no external modifications |
| **2** | Personal/low-risk only, cost limits enforced |
| **3** | Advanced, sandbox-only for n8n workflows |

### High-Risk Operations

**Always require manual confirmation** (even at level 3):
- `N8N_WORKFLOW_PROMOTE` (sandbox → production)
- `RESTORE_BACKUP` (data restoration)
- `GIT_OPERATIONS_ON_MAIN_BRANCH` (production code)

### Data Sensitivity

**Sensitivity Levels** (defined in tool definitions):
- `low`: Public information, logs
- `medium`: Internal data, non-PII
- `high`: Client data, PII, credentials

**Rules**:
- `high` sensitivity → Always escalate to human
- Log `low` and `medium` only
- NEVER log sensitive credentials

### Environment Restrictions

| Environment | Allowed Operations |
|-------------|-------------------|
| `development` | All, including experimental |
| `staging` | Validated workflows only |
| `production` | Approved workflows, high-risk requires confirmation |

### Security Checklist for New Code

- [ ] No hard-coded credentials
- [ ] Input validation present
- [ ] Schema validation implemented
- [ ] Error handling robust
- [ ] Logging to SystemJournal
- [ ] Autonomy level checks
- [ ] Rate limiting considered
- [ ] Timeout handling
- [ ] Sanitized user inputs
- [ ] No SQL injection vectors
- [ ] No command injection vectors
- [ ] API keys in environment variables

---

## 🧪 Testing & Validation

### Automated Testing (CI/CD)

**GitHub Actions** (`.github/workflows/`):

1. **ci.yml** - Main CI pipeline
   - JSON schema validation
   - YAML validation (yamllint)
   - Markdown linting (markdownlint)
   - Reference checking (broken links)
   - Workflow JSON validation

2. **pr-validation.yml** - Pull request validation
   - Schema compliance
   - Naming conventions
   - Documentation updates

3. **security.yml** - Security scanning
   - Dependency vulnerabilities
   - Secret detection

4. **yamllint.yml** - YAML-specific validation

### Manual Testing Workflows

#### Test a New Tool

```bash
# 1. Validate schema
ajv compile -s schemas/payloads/my_tool.schema.json

# 2. Test workflow in n8n UI
# - Use test payload
# - Check execution logs
# - Verify response format

# 3. Test via MCP (if applicable)
# - Use Claude Desktop
# - Trigger tool
# - Verify results

# 4. Check SystemJournal
# - Confirm log entry created
# - Verify all fields populated

# 5. Test error cases
# - Invalid payload
# - Missing required fields
# - External API failures
```

#### Test Autonomy Level Changes

```bash
# 1. Change level in config/autonomy.yml
prolex_current_autonomy_level: 1

# 2. Test allowed actions
# Try tool that should work at level 1

# 3. Test forbidden actions
# Try tool that requires level 2+
# Should receive permission error

# 4. Verify logging
# Check that permission errors logged to SystemJournal
```

#### Test Workflow Sync

```bash
# 1. Create/modify workflow in n8n-workflows/
echo '{"name": "test"}' > n8n-workflows/999_test.json

# 2. Commit and push
git add n8n-workflows/999_test.json
git commit -m "test: workflow sync"
git push

# 3. Check GitHub webhook delivery
# GitHub → Settings → Webhooks → Recent Deliveries

# 4. Check n8n execution
# n8n UI → Workflow "GitHub to n8n Sync" → Executions

# 5. Verify in n8n
# n8n UI → Workflows → Find "test"

# 6. Check SystemJournal logs
# Google Sheets → events tab

# 7. Cleanup
git revert HEAD
git push
```

### Validation Commands

```bash
# Validate all JSON schemas
for schema in schemas/**/*.schema.json; do
  ajv compile -s "$schema" --strict=false
done

# Validate YAML files
yamllint config/
yamllint schemas/

# Lint markdown
markdownlint docs/**/*.md --config .markdownlint.json

# Validate JSON files (workflows)
for workflow in n8n-workflows/*.json; do
  jq empty "$workflow" || echo "Invalid: $workflow"
done

# Check for broken references
grep -r "schemas/" docs/ | grep -oP 'schemas/[a-zA-Z0-9_/\.]+' | while read ref; do
  [ ! -f "$ref" ] && echo "Broken: $ref"
done
```

### Test Coverage Expectations

| Component | Test Coverage |
|-----------|---------------|
| Schemas | 100% - All schemas must be valid |
| Workflows | Manual - Test in n8n UI |
| Tools | Manual - Test each tool endpoint |
| Documentation | Lint - No broken links |
| Configuration | Validation - YAML syntax |

---

## 💡 Tips for Effective Work

### For Claude Code Assistants

1. **Always start with context**
   - Read INDEX_PROLEX.md first
   - Check current autonomy level in config/autonomy.yml
   - Review relevant specification docs

2. **Follow the architecture**
   - Don't bypass the 3-tier pipeline (Kimmy → Prolex → Opex)
   - Don't skip Proxy Master validation
   - Respect autonomy level restrictions

3. **Maintain consistency**
   - Follow naming conventions exactly
   - Use existing patterns from similar files
   - Match coding style in existing code

4. **Document everything**
   - Update relevant docs when changing code
   - Add comments for complex logic
   - Include examples in schemas

5. **Think about safety**
   - Validate all inputs
   - Handle errors gracefully
   - Log all significant actions
   - Never hard-code secrets

6. **Test before committing**
   - Run validation commands
   - Test in local n8n instance
   - Verify schema compliance
   - Check CI will pass

### Common Pitfalls to Avoid

❌ **Don't**:
- Modify workflows directly in n8n without exporting to Git
- Skip schema validation
- Hard-code configuration values
- Create tools without proper risk assessment
- Bypass autonomy level checks
- Ignore error handling
- Forget to log to SystemJournal
- Make breaking changes to schemas without migration
- Commit secrets or API keys
- Use inconsistent naming conventions

✅ **Do**:
- Export workflows from n8n after testing
- Validate schemas in CI
- Use config files for all settings
- Assess risk level for new tools
- Enforce autonomy levels via Proxy Master
- Implement robust error handling
- Log all actions to SystemJournal
- Version schemas and provide migration paths
- Use environment variables for secrets
- Follow established naming conventions

### Debugging Strategy

1. **Check SystemJournal first**
   - Google Sheets: Automatt_Logs
   - Filter by `request_id` or `workflow_id`
   - Look for error messages

2. **Review workflow execution in n8n**
   - n8n UI → Executions
   - Find failed execution
   - Inspect node outputs

3. **Validate data structures**
   - Check payload against schema
   - Verify all required fields present
   - Ensure types match

4. **Check autonomy permissions**
   - Verify current level in config/autonomy.yml
   - Check if tool is allowed at current level
   - Review Proxy Master logs

5. **Test incrementally**
   - Isolate the failing component
   - Test with minimal payload
   - Add complexity gradually

### Performance Considerations

1. **Cost Optimization**
   - Use Haiku for simple Kimmy tasks
   - Cache frequent RAG queries
   - Limit web search requests
   - Monitor daily cost limits

2. **Latency Optimization**
   - Minimize workflow steps
   - Use async where possible
   - Cache external API responses
   - Optimize n8n node configurations

3. **Rate Limiting**
   - Respect external API limits
   - Implement backoff strategies
   - Monitor rate limit headers
   - Log rate limit errors

### Best Practices Summary

| Area | Best Practice |
|------|---------------|
| **Code** | Follow existing patterns, validate inputs, handle errors |
| **Configuration** | Use YAML, include comments, version control |
| **Documentation** | Keep in sync with code, cross-reference, include examples |
| **Workflows** | Test in UI, export to Git, log executions |
| **Security** | Validate inputs, check permissions, log actions, no secrets |
| **Testing** | Validate schemas, test workflows, check logs, verify CI |
| **Git** | Descriptive commits, test before push, follow conventions |

---

## 📝 Additional Resources

### External Documentation

- **n8n**: https://docs.n8n.io/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **JSON Schema**: https://json-schema.org/
- **AnythingLLM**: https://docs.anythingllm.com/

### Internal Resources

- **SystemJournal**: https://docs.google.com/spreadsheets/d/1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk
- **n8n Instance**: https://n8n.automatt.ai (production)
- **n8n Local**: http://localhost:5678 (development)

### Support Contacts

- **Maintainer**: Matthieu (Automatt.ai)
- **Email**: matthieu@automatt.ai
- **GitHub**: https://github.com/ProlexAi/Prolex

---

## 🔄 Changelog

### v4.0 (2025-11-22)
- ✨ Initial creation of CLAUDE.md
- 📚 Comprehensive guide for AI assistants
- 🏗️ Documented complete v4 architecture
- 📋 Added development workflows and conventions
- 🔒 Included safety and security guidelines
- ✅ Documented testing and validation procedures

---

**Document Maintained By**: AI Assistants + Matthieu
**Last Updated**: 2025-11-22
**Version**: 4.0
**Status**: Living Document (update as architecture evolves)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK REFERENCE - PROLEX v4                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ START HERE: INDEX_PROLEX.md                                 │
│                                                              │
│ ARCHITECTURE:                                               │
│   Kimmy (Filter) → Prolex (Brain) → Opex (Execution)       │
│                                                              │
│ KEY FILES:                                                  │
│   • config/autonomy.yml    - Autonomy levels                │
│   • config/system.yml      - System config                  │
│   • rag/tools/tools.yml    - Tool catalog                   │
│                                                              │
│ WORKFLOWS:                                                  │
│   • Design in n8n UI                                        │
│   • Export JSON                                             │
│   • Add to n8n-workflows/                                   │
│   • Commit → Auto-sync                                      │
│                                                              │
│ TESTING:                                                    │
│   ajv compile -s schemas/*.schema.json                      │
│   yamllint config/                                          │
│   markdownlint docs/**/*.md                                 │
│                                                              │
│ DEBUGGING:                                                  │
│   1. Check SystemJournal (Google Sheets)                    │
│   2. Check n8n executions                                   │
│   3. Validate schemas                                       │
│   4. Check autonomy permissions                             │
│                                                              │
│ AUTONOMY LEVELS:                                            │
│   0 = Read-only                                             │
│   1 = Read + Logs                                           │
│   2 = Low-risk actions (current)                            │
│   3 = Advanced actions                                      │
│                                                              │
│ SAFETY RULES:                                               │
│   ✓ Validate all inputs                                     │
│   ✓ Log to SystemJournal                                    │
│   ✓ Respect autonomy levels                                 │
│   ✗ Never commit secrets                                    │
│   ✗ Never bypass Proxy Master                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
