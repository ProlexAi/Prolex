# prolexctl - Prolex Control CLI

> **Command-line interface for managing Prolex AI orchestrator**

Like `kubectl` for Kubernetes, `prolexctl` is your control center for Prolex.

---

## 📋 Features

- ✅ System status monitoring (PostgreSQL, n8n, MCP servers)
- ✅ PostgreSQL logs query & real-time tail
- ✅ n8n workflows management (list, trigger, inspect)
- ✅ Autonomy level management
- ✅ Colorized output with tables
- ✅ JSON output for scripting

---

## 🚀 Installation

```bash
# From the CLI directory
cd cli/prolexctl

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally (optional)
npm link

# Now you can use 'prolexctl' from anywhere
prolexctl --help
```

**Without global link**:
```bash
# Run from project root
node cli/prolexctl/dist/index.js <command>
```

---

## 📚 Commands

### `prolexctl status`

Show overall system status.

```bash
prolexctl status

# Output as JSON
prolexctl status --json
```

**Example output**:
```
🚀 Prolex System Status

✓ PostgreSQL: Healthy (12ms)
✓ n8n: Healthy (45ms)

⏰ Timestamp: 2025-11-23T15:30:00.000Z
```

---

### `prolexctl logs`

Manage PostgreSQL logs.

#### `prolexctl logs tail`

Follow logs in real-time (default: last 50).

```bash
# Tail last 50 logs
prolexctl logs tail

# Tail last 100 logs
prolexctl logs tail -n 100

# Filter by source
prolexctl logs tail --source mcp_n8n

# Filter by level
prolexctl logs tail --level error

# Combine filters
prolexctl logs tail --source prolex_agent --level info -n 200
```

#### `prolexctl logs query`

Query logs with advanced filters.

```bash
# Query last 100 logs
prolexctl logs query

# Logs from last hour
prolexctl logs query --since 1h

# Logs from last 24 hours
prolexctl logs query --since 24h

# Filter by source and level
prolexctl logs query --source mcp_n8n --level error

# Limit results
prolexctl logs query --limit 500

# Output as JSON
prolexctl logs query --json
```

**Time formats**: `1h`, `24h`, `7d`, `1w`, `1m`

#### `prolexctl logs stats`

Show log statistics grouped by source and level.

```bash
# Stats for last 24 hours (default)
prolexctl logs stats

# Stats for last hour
prolexctl logs stats --since 1h

# Stats for last 7 days
prolexctl logs stats --since 7d
```

**Example output**:
```
📊 Log Statistics (last 24h)

┌─────────────────────────┬───────┬────────┬──────────┬───────┬────────┐
│ Source                  │ Total │ Errors │ Warnings │ Infos │ Debugs │
├─────────────────────────┼───────┼────────┼──────────┼───────┼────────┤
│ mcp_n8n                 │  1245 │      3 │       12 │  1200 │     30 │
│ prolex_agent            │   450 │      1 │        5 │   440 │      4 │
│ n8n_workflow_415        │    12 │      0 │        0 │    12 │      0 │
└─────────────────────────┴───────┴────────┴──────────┴───────┴────────┘
```

---

### `prolexctl workflows` (alias: `wf`)

Manage n8n workflows.

#### `prolexctl workflows list`

List all workflows.

```bash
# List all workflows
prolexctl workflows list

# Only active workflows
prolexctl workflows list --active

# Output as JSON
prolexctl workflows list --json
```

**Example output**:
```
┌────┬──────────────────────────────────────────┬────────┬──────────────────────────────┐
│ ID │ Name                                     │ Active │ Updated                      │
├────┼──────────────────────────────────────────┼────────┼──────────────────────────────┤
│ 10 │ GitHub to n8n Sync                       │   ✓    │ 2025-11-23T12:00:00.000Z     │
│ 12 │ Prolex Git Pull                          │   ✓    │ 2025-11-22T08:30:00.000Z     │
│ 415│ PostgreSQL Logs Cleanup                  │   ✓    │ 2025-11-23T14:00:00.000Z     │
└────┴──────────────────────────────────────────┴────────┴──────────────────────────────┘

Total: 25 workflows
```

#### `prolexctl workflows trigger <id>`

Trigger a workflow execution.

```bash
# Trigger workflow by ID
prolexctl workflows trigger 415

# With JSON payload
prolexctl workflows trigger 100 --payload '{"key":"value"}'
```

**Example output**:
```
Triggering workflow 415...
✓ Workflow triggered successfully
Execution ID: exec_abc123def456
Status: running
```

#### `prolexctl workflows get <id>`

Get detailed workflow information.

```bash
# Get workflow details
prolexctl workflows get 415

# Output as JSON
prolexctl workflows get 415 --json
```

**Example output**:
```
📋 Workflow: PostgreSQL Logs Cleanup

ID: 415
Active: Yes
Nodes: 11
Created: 2025-11-23T10:00:00.000Z
Updated: 2025-11-23T14:00:00.000Z
Tags: monitoring, postgres, maintenance
```

---

### `prolexctl autonomy`

Manage Prolex autonomy level (0-3).

#### `prolexctl autonomy get`

Show current autonomy level.

```bash
prolexctl autonomy get
```

**Example output**:
```
🤖 Prolex Autonomy Level

Current Level: 2 (Low-risk actions)

Levels:
  0: Read-only (no actions)
  1: Read + Logs (logging only)
  2: Low-risk actions (daily use)
  3: Advanced actions (sandbox + high-risk)
```

#### `prolexctl autonomy set <level>`

Change autonomy level (0-3).

```bash
# Set with confirmation prompt
prolexctl autonomy set 3

# Skip confirmation (dangerous!)
prolexctl autonomy set 3 --force
```

**Example interaction**:
```
⚠️  You are about to change autonomy level to: 3
   (Advanced actions (sandbox + high-risk))

? Are you sure you want to proceed? (y/N)
```

---

## 📖 Examples

### Daily monitoring workflow

```bash
# Check system health
prolexctl status

# Check for recent errors
prolexctl logs query --level error --since 1h

# See log statistics
prolexctl logs stats
```

### Debugging a workflow

```bash
# List all workflows
prolexctl wf list

# Get workflow details
prolexctl wf get 415

# Check workflow logs
prolexctl logs query --source n8n_workflow_415 --since 1h

# Trigger test execution
prolexctl wf trigger 415
```

### Security audit

```bash
# Check current autonomy level
prolexctl autonomy get

# Query recent high-privilege actions
prolexctl logs query --level warn --since 24h

# List all active workflows
prolexctl wf list --active
```

---

## ⚙️ Configuration

prolexctl reads configuration from environment variables and `.env` files.

### Required environment variables

Create `.env` in `infra/vps-prod/`:

```bash
# PostgreSQL connection
DATABASE_URL=postgres://user:password@localhost:5432/prolex_db

# n8n connection
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here
```

---

## 🎨 Output Formats

All list/query commands support `--json` flag for machine-readable output:

```bash
# Human-readable (default)
prolexctl logs query

# JSON output (for scripts)
prolexctl logs query --json | jq '.[] | select(.level == "error")'
```

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode (auto-rebuild)
npm run dev

# Clean build artifacts
npm run clean

# Rebuild from scratch
npm run rebuild
```

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not set"

**Solution**: Create `.env` file in `infra/vps-prod/` with `DATABASE_URL`.

### Error: "N8N_API_KEY is required"

**Solution**: Generate API key in n8n (Settings → API) and add to `.env`.

### Error: "command not found: prolexctl"

**Solution**: Either:
1. Run `npm link` from `cli/prolexctl/`
2. Use full path: `node cli/prolexctl/dist/index.js`

---

## 📚 See Also

- [Prolex Documentation](../../docs/)
- [PostgreSQL Logs Documentation](../../docs/LOGS_POSTGRES.md)
- [n8n Workflows](../../n8n-workflows/)

---

**Maintenu par**: Backend Team Prolex
**Version**: 1.0.0
**Date**: 2025-11-23
**Status**: ✅ Production Ready
