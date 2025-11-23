# n8n MCP Server v5.0.0

## 🚀 Enhanced with Security, Autonomy Management, and Self-Healing

**Model Context Protocol** server for **n8n** workflow automation with **Claude Code**.

---

## 📋 Table of Contents

1. [What's New in v5](#whats-new-in-v5)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Tools Reference](#tools-reference)
7. [Autonomy Levels](#autonomy-levels)
8. [Security](#security)
9. [Self-Healing System](#self-healing-system)
10. [Examples](#examples)
11. [Troubleshooting](#troubleshooting)

---

## 🎉 What's New in v5

### Major Enhancements

- ✨ **Autonomy Management**: 4-level autonomy system (0-3) with granular permissions
- 🔒 **Security Layer**: Action validation, confirmation management, confidence scoring
- 🩺 **Self-Healing**: Automatic workflow diagnostics and fixes
- 📄 **File Operations**: Safe read/write with rollback support
- 🤖 **Dynamic Autonomy**: Change autonomy levels at runtime
- 📊 **System Status**: Comprehensive health monitoring

### Security Features

- **Action Validation**: Every action validated before execution
- **Confirmation Management**: Human confirmations for critical operations (autonomy < 3)
- **Confidence Scoring**: AI-powered confidence scores (0-100) for all actions
- **Rollback Points**: Automatic snapshots before modifications
- **Forbidden Paths**: Blacklist for sensitive files
- **Rate Limiting**: Self-heal rate-limited to max 3 attempts/hour/workflow

---

## 🌟 Features

### Core Features (v4 - still available)

- ✅ **6 n8n workflow tools**: list, trigger, get, stop, create, update
- ✅ **Automatic retry**: Exponential backoff (x3) for failed API calls
- ✅ **Local cache**: Hash-based change detection
- ✅ **Real-time streaming**: Execution log streaming
- ✅ **Rate limiting**: Queue-based rate limiter
- ✅ **SystemJournal logging**: Structured JSONL logs
- ✅ **HTTP healthcheck**: Status endpoints
- ✅ **Full Docker support**: Production-ready containers

### New v5 Features

- ✨ **`read_file`**: Read files with safety checks
- ✨ **`write_file`**: Write files with confirmations and rollback
- ✨ **`self_heal_workflow`**: Auto-diagnose and fix workflows
- ✨ **`set_autonomy`**: Change autonomy level dynamically
- ✨ **`get_system_status`**: System health monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP v5 Architecture                      │
└─────────────────────────────────────────────────────────────┘

                        Claude Code
                             │
                             ↓
                    ┌────────────────┐
                    │  MCP v5 Server │
                    │   (stdio)      │
                    └────────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ↓                    ↓                    ↓
┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│   Security    │    │  Self-Heal   │    │   n8n API    │
│   Layer       │    │   Engine     │    │   Client     │
├───────────────┤    ├──────────────┤    ├──────────────┤
│ • Autonomy    │    │ • Diagnostics│    │ • Workflows  │
│ • Validation  │    │ • Fixer      │    │ • Executions │
│ • Confidence  │    │ • Tester     │    │ • Retry      │
│ • Rollback    │    │ • Rate-Limit │    │ • Cache      │
└───────────────┘    └──────────────┘    └──────────────┘
```

### Module Structure

```
src/
├── security/              # Security layer
│   ├── autonomyManager.ts     # Autonomy level management
│   ├── confirmationManager.ts # Human confirmations
│   ├── confidenceScoring.ts   # AI confidence scoring
│   ├── actionValidator.ts     # Action validation
│   └── rollbackManager.ts     # Rollback points
├── selfheal/              # Self-healing engine
│   ├── diagnostics.ts         # Workflow diagnostics
│   ├── fixer.ts               # Fix proposals & application
│   ├── tester.ts              # Workflow testing
│   ├── rateLimiter.ts         # Rate limiting
│   └── blacklist.ts           # Dangerous node blacklist
├── tools/                 # MCP tools
│   ├── selfHealWorkflow.ts
│   ├── setAutonomy.ts
│   ├── getSystemStatus.ts
│   ├── readFile.ts
│   └── writeFile.ts
└── types/                 # TypeScript types
    ├── security.ts
    └── selfheal.ts
```

---

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- n8n instance (local or remote)
- n8n API key

### Quick Start

```bash
# 1. Navigate to MCP server directory
cd mcp/n8n-server

# 2. Install dependencies (including new yaml dependency)
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your n8n credentials

# 4. Build
npm run build

# 5. Start server
npm run start

# Or use development mode with auto-reload
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# n8n API Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_TIMEOUT=30000

# MCP Server
NODE_ENV=development          # development | staging | production
LOG_PATH=./logs              # SystemJournal logs directory
```

### Autonomy Configuration

**File**: `../../config/autonomy.yml`

The MCP server reads autonomy level from the Prolex configuration file.

**MCP uses levels 0-3 only** (not level 4 - that's for Prolex brain only).

```yaml
# MCP will read this value and cap it at 3
prolex_current_autonomy_level: 2

autonomy_config:
  current: 2
  mode: low-risk
  human_in_the_loop: true
```

---

## 🔧 Tools Reference

### Legacy Workflow Tools (v4)

#### `list_workflows`

List all n8n workflows.

```typescript
{
  forceRefresh?: boolean  // Bypass cache (default: false)
}
```

#### `trigger_workflow`

Trigger a workflow execution.

```typescript
{
  workflowId: string
  payload?: Record<string, unknown>
  enableStreaming?: boolean  // Real-time logs (default: true)
}
```

#### `get_execution`

Get execution details.

```typescript
{
  executionId: string
}
```

#### `stop_execution`

Stop a running execution.

```typescript
{
  executionId: string
}
```

#### `create_workflow`

Create a new workflow.

```typescript
{
  name: string
  nodes?: array
  connections?: object
  active?: boolean
  settings?: object
}
```

#### `update_workflow`

Update an existing workflow.

```typescript
{
  workflowId: string
  name?: string
  nodes?: array
  connections?: object
  active?: boolean
  settings?: object
}
```

---

### New v5 Tools

#### 📄 `read_file`

**Autonomy Required**: Level 0+

Read file contents with safety checks.

```typescript
{
  path: string               // Relative or absolute path
  encoding?: 'utf-8' | 'base64' | 'hex'
  maxSize?: number           // Max size in bytes (default: 1MB)
}
```

**Safety Features**:
- Path traversal prevention
- File size limits
- Encoding validation

---

#### ✍️ `write_file`

**Autonomy Required**: Level 1+ (confirmation required < Level 3)

Write file contents with safety checks, confirmations, and rollback.

```typescript
{
  path: string               // Relative or absolute path
  content: string
  encoding?: 'utf-8' | 'base64' | 'hex'
  createDirs?: boolean       // Create parent directories
  backup?: boolean           // Create rollback point (default: true)
}
```

**Safety Features**:
- Path traversal prevention
- Forbidden path blocking
- Automatic rollback points
- Confirmation required (autonomy < 3)
- Confidence scoring

**Forbidden Paths** (never writable):
- `infra/vps-prod/docker-compose.yml`
- `.env` files
- System directories (`/etc`, `/var`, `/usr`)

---

#### 🩺 `self_heal_workflow`

**Autonomy Required**: Level 3 only

Automatically diagnose and fix workflow issues.

```typescript
{
  workflowId: string
  force?: boolean             // Skip confirmation (dangerous!)
  dryRun?: boolean            // Only simulate
  maxFixes?: number           // Max fixes to apply (default: 5)
  skipRateLimitCheck?: boolean  // Admin only
}
```

**Rate Limiting**:
- Max 3 attempts per hour per workflow
- Block after 2 consecutive failures

**Blacklisted Nodes** (never auto-fixed):
- `n8n-nodes-base.code` (JavaScript)
- `n8n-nodes-base.executeCommand` (Shell commands)
- `n8n-nodes-base.ssh` (SSH)
- `n8n-nodes-base.function` (Function nodes)

**Workflow**:
1. Diagnose workflow issues
2. Propose fixes
3. Request confirmation (unless autonomy=3)
4. Create rollback point
5. Apply fixes
6. Test workflow
7. Rollback if test fails

---

#### 🤖 `set_autonomy`

**Autonomy Required**: All levels (always requires confirmation)

Change autonomy level dynamically.

```typescript
{
  level: 0 | 1 | 2 | 3
  reason?: string             // Reason for change
  sandboxOnly?: boolean       // Level 3 only in sandbox (default: true)
}
```

**Safety Features**:
- Level 3 blocked in production (unless `sandboxOnly=false`)
- Always requires confirmation
- Persists to `config/autonomy.yml`

---

#### 📊 `get_system_status`

**Autonomy Required**: Level 0+

Get comprehensive system status.

```typescript
{
  includeRollbackPoints?: boolean
  includeRateLimits?: boolean
}
```

**Returns**:
- MCP server status (version, uptime, memory)
- n8n connection status
- Autonomy configuration
- Security status (rollback points)
- Self-heal status (rate limits)

---

## 🔐 Autonomy Levels

MCP v5 implements a **4-level autonomy system** (0-3).

| Level | Name | Capabilities | Confirmation Required |
|-------|------|--------------|----------------------|
| **0** | Read-only | • `read_file` only<br>• No writes<br>• No workflows | All actions |
| **1** | Read-write | • Level 0<br>• `read_file`<br>• `write_file` | Medium+ risk |
| **2** | Low-risk | • Level 1<br>• `trigger_workflow`<br>• `create_workflow` | High+ risk |
| **3** | Advanced | • Level 2<br>• `update_workflow`<br>• `self_heal_workflow` | None (auto) |

### Changing Autonomy Levels

```typescript
// Example: Set to level 3 for self-healing
await tools.set_autonomy({
  level: 3,
  reason: "Enable self-healing for development",
  sandboxOnly: true  // Required for level 3
});
```

### Risk Levels

| Action | Risk Level | Confirmation Required |
|--------|-----------|----------------------|
| `read_file` | Low | Level 0 |
| `write_file` | Medium | Level 1 |
| `trigger_workflow` | Medium | Level 1 |
| `create_workflow` | High | Level 2 |
| `update_workflow` | High | Level 2 |
| `delete_workflow` | Critical | Always |
| `self_heal_workflow` | High | Level 3 only |
| `set_autonomy` | Critical | Always |

---

## 🔒 Security

### Action Validation

Every action is validated before execution:

1. **Permission Check**: Is action allowed at current autonomy level?
2. **Resource Safety**: Is target resource safe to modify?
3. **Confidence Scoring**: Calculate confidence score (0-100)
4. **Confirmation**: Request human confirmation if needed

### Confidence Scoring

Each action receives a confidence score (0-100) based on:

- **Autonomy Level** (30%): Higher level = higher confidence
- **Action Risk** (25%): Lower risk = higher confidence
- **Historical Success** (25%): Past success rate
- **Contextual Relevance** (20%): How appropriate is the action?

Example:
```
Confidence: 78/100
- Autonomy Level: 70/100 (weight 30%)
- Action Risk: 70/100 (weight 25%)
- Historical Success: 85/100 (weight 25%)
- Contextual Relevance: 90/100 (weight 20%)
```

### Rollback System

Before destructive operations, MCP creates **rollback points**:

```typescript
// Automatic rollback point before write_file
const rollbackId = "uuid-here";

// If operation fails, rollback:
await rollbackManager.rollback(rollbackId);
```

**Rollback Support**:
- `write_file`: Restore previous file content
- `update_workflow`: Restore previous workflow state
- `create_workflow`: Delete created workflow

---

## 🩺 Self-Healing System

### How It Works

1. **Diagnostics**: Analyze workflow for issues
   - Disabled nodes
   - Missing credentials
   - Broken connections
   - Timeout configurations
   - Recent execution errors

2. **Fix Proposals**: Generate fixes for safe issues
   - Enable disabled nodes
   - Add timeout configurations
   - (More complex fixes planned for future)

3. **Validation**: Check if fixes are safe
   - Node type not blacklisted
   - Confidence score >= threshold

4. **Application**: Apply fixes
   - Create rollback point
   - Update workflow
   - Test execution

5. **Rollback**: If test fails
   - Revert to rollback point
   - Record failure

### Diagnostic Issues

| Issue Type | Severity | Auto-Fixable | Auto-Fix Safe |
|-----------|----------|--------------|---------------|
| Disabled node | Warning | Yes | Yes |
| Missing credential | Error | No | No |
| Broken connection | Warning | Yes | No (risky) |
| Timeout config | Warning | Yes | Yes |
| Invalid parameter | Error | No | No |
| Unknown error | Error | Maybe | Depends |

### Rate Limiting

To prevent infinite loops:

- **Max 3 attempts per hour per workflow**
- **Block after 2 consecutive failures**
- **Reset after 24 hours of inactivity**

Check rate limit:
```typescript
const check = selfHealRateLimiter.checkRateLimit(workflowId);
// { allowed: true, remainingAttempts: 2, consecutiveFailures: 0 }
```

---

## 📝 Examples

### Example 1: Read a Configuration File

```typescript
const result = await tools.read_file({
  path: 'config/autonomy.yml',
  encoding: 'utf-8'
});

// Result:
// "📄 File: /path/to/config/autonomy.yml\n
//  Size: 5432 bytes\n
//  Encoding: utf-8\n
//  ===================================\n
//  [file contents here]"
```

### Example 2: Write a File with Rollback

```typescript
const result = await tools.write_file({
  path: 'rag/logs/self_heal.json',
  content: JSON.stringify({ fixes: 3 }, null, 2),
  createDirs: true,
  backup: true  // Creates rollback point
});

// Result:
// "✅ File written successfully
//  Path: /path/to/rag/logs/self_heal.json
//  Size: 42 bytes
//  Rollback ID: uuid-here"
```

### Example 3: Self-Heal a Workflow

```typescript
const result = await tools.self_heal_workflow({
  workflowId: '12345',
  dryRun: false,
  maxFixes: 3
});

// Workflow:
// 1. Diagnose (finds 2 issues)
// 2. Propose fixes (2 fixes)
// 3. Request confirmation (if autonomy < 3)
// 4. Apply fixes
// 5. Test workflow
// 6. Success or rollback
```

### Example 4: Change Autonomy Level

```typescript
const result = await tools.set_autonomy({
  level: 3,
  reason: "Enable advanced features for development",
  sandboxOnly: true
});

// Always requires confirmation!
// Result:
// "✅ Autonomy level changed successfully
//  Previous level: 2
//  New level: 3
//  Mode: advanced
//  Human in the loop: false"
```

### Example 5: Get System Status

```typescript
const result = await tools.get_system_status({
  includeRollbackPoints: true,
  includeRateLimits: true
});

// Result:
// "📊 SYSTEM STATUS REPORT
//  =================================================
//
//  🖥️  MCP Server:
//     Version: 5.0.0
//     Environment: development
//     Uptime: 1234s
//     Memory: 45MB / 120MB
//
//  🔗 n8n Connection:
//     Connected: ✅
//     Base URL: http://localhost:5678
//     Workflows: 15
//
//  🤖 Autonomy System:
//     Current Level: 2 (low-risk)
//     Human in Loop: Yes
//     Allowed Actions: 6
//
//  🔒 Security:
//     Rollback Points: 3
//
//  🩺 Self-Heal System:
//     Rate Limiter: Active
//     Max Attempts/Hour: 3"
```

---

## 🐛 Troubleshooting

### Issue: "Action not allowed at current autonomy level"

**Solution**: Increase autonomy level or request confirmation.

```typescript
// Option 1: Increase autonomy
await tools.set_autonomy({ level: 2, reason: "Need write access" });

// Option 2: Ask user for permission
// The MCP will throw an error with confirmation details
```

### Issue: "Rate limit exceeded for self-heal"

**Solution**: Wait for rate limit reset or manually reset.

```typescript
// Check rate limit
const check = selfHealRateLimiter.checkRateLimit(workflowId);
console.log(`Reset at: ${check.resetAt}`);

// Or manually reset (admin only)
selfHealRateLimiter.reset(workflowId);
```

### Issue: "Forbidden path write attempt"

**Solution**: The path is protected. Use a different location.

**Protected paths**:
- `docker-compose.yml`
- `.env` files
- System directories

### Issue: "Self-heal test failed, rolling back"

**Solution**: The self-heal applied fixes but the workflow still failed testing.

- Check SystemJournal logs for details
- Review the rollback point to see what changed
- Manually fix the workflow

---

## 📊 SystemJournal Logs

All MCP operations are logged to `logs/n8n-mcp-server.jsonl` in JSONL format.

Example log entry:
```json
{
  "timestamp": "2025-11-22T10:00:00.000Z",
  "level": "info",
  "correlation_id": "uuid-here",
  "service": "n8n-mcp-server",
  "action": "self_heal_workflow_success",
  "details": {
    "workflowId": "12345",
    "fixesApplied": 2,
    "testStatus": "success"
  }
}
```

---

## 🚀 Building and Running

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev  # Auto-reload on changes
```

### Production Mode

```bash
npm run start
```

### Docker

```bash
# Build Docker image
npm run docker:build

# Run with docker-compose
npm run docker:run

# Stop
npm run docker:stop
```

---

## 📚 References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [n8n API Documentation](https://docs.n8n.io/api/)
- [Prolex v4 Architecture](../../docs/architecture/ARCHITECTURE_SYSTEME_V4_PLUS_AUTONOMIE.md)
- [Autonomy Configuration](../../config/autonomy.yml)

---

## 🤝 Contributing

MCP v5 is part of the Prolex project. See main project README for contribution guidelines.

---

## 📜 License

MIT License - see LICENSE file for details.

---

## ✨ Summary

**MCP v5** is a **production-ready, secure, and autonomous** n8n workflow automation server with:

✅ **Security-first design** - Action validation, confirmations, confidence scoring
✅ **Autonomy management** - 4 levels (0-3) with granular permissions
✅ **Self-healing** - Automatic workflow diagnostics and fixes
✅ **Rollback support** - Snapshots before all modifications
✅ **Rate limiting** - Prevent infinite self-heal loops
✅ **Comprehensive logging** - Full audit trail in SystemJournal

**Ready for Prolex v5 autonomy level 3!** 🚀

---

**Version**: 5.0.0
**Last Updated**: 2025-11-22
**Maintainer**: ProlexAi
