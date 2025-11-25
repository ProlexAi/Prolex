# MCP Shell Server - Intégration Prolex

## Vue d'ensemble

Ce MCP server expose l'exécution de commandes shell via le Model Context Protocol.

**Status** : ⚡ Ready to use (basé sur `claude_runner.py`)

## Architecture

```
Claude / LLM
    ↓ (MCP Protocol)
Shell MCP Server
    ↓ (stdin/stdout JSON)
claude_runner.py
    ↓ (subprocess)
bash / PowerShell
```

## Utilisation Standalone

### Option 1 : Via claude_runner.py directement

```bash
# Test manuel
echo '{"cmd":"ls -la"}' | python3 ../../claude_runner.py
```

### Option 2 : Via configuration MCP

Créer `~/.config/claude/mcp_config.json` :

```json
{
  "mcpServers": {
    "shell": {
      "command": "python3",
      "args": ["/home/user/prolex-core/claude_runner.py"]
    }
  }
}
```

## Intégration Prolex

### 1. Ajouter au catalogue d'outils

**Fichier** : `rag/tools/tools.yml`

```yaml
- id: SHELL_EXECUTE
  name: "Shell Command Execution"
  description: "Execute shell commands with timeout on local system or VPS"
  category: devops
  risk_level: critical
  auto_allowed_levels: []  # Jamais en automatique
  manual_approval_required: true
  target:
    type: executable
    path: "/home/user/prolex-core/claude_runner.py"
    method: stdin
  payload_schema: "schemas/payloads/shell_execute.schema.json"
  response_format:
    stdout: "string"
    stderr: "string"
    exit_code: "integer"
    execution_time_seconds: "number"
    timed_out: "boolean"
  examples:
    - description: "List directory contents"
      input: {"cmd": "ls -la /var/log"}
    - description: "Check disk space"
      input: {"cmd": "df -h"}
    - description: "Monitor processes"
      input: {"cmd": "ps aux --sort=-%cpu | head -10"}
```

### 2. Créer le workflow n8n

**Fichier** : `n8n-workflows/800_shell_execute.json`

**Workflow steps** :
1. **Webhook Trigger** : Reçoit `{"cmd": "...", "timeout_seconds": 30}`
2. **Validation** : Vérifie le schema JSON
3. **Human Approval** : Demande confirmation via Telegram
4. **Execute Command** : Lance `claude_runner.py` via Execute Command node
5. **Parse Response** : Parse le JSON de sortie
6. **Log to SystemJournal** : Enregistre l'exécution
7. **Return Response** : Retourne le résultat

### 3. Sécurité et Garde-fous

**Configuration recommandée** :

```yaml
# config/autonomy.yml
shell_execute_config:
  enabled: true
  require_human_approval: true
  allowed_autonomy_levels: []  # Aucun niveau en auto
  max_timeout_seconds: 120
  forbidden_patterns:
    - "rm -rf /*"
    - "dd if="
    - "mkfs"
    - "> /dev/sda"
    - "DROP DATABASE"
    - ":(){ :|:& };:"  # Fork bomb
  allowed_directories:
    - "/home/user/prolex-core"
    - "/tmp"
    - "/var/log"
  log_all_commands: true
  notify_on_execution: true
```

### 4. Usage dans Prolex

Quand Prolex reçoit une demande nécessitant une commande shell :

1. **KimmyPayload** contient : `{"intent": "system_command", "tools_proposed": ["SHELL_EXECUTE"]}`
2. **Prolex** génère : `{"tool": "SHELL_EXECUTE", "payload": {"cmd": "df -h"}}`
3. **Proxy Master** détecte `risk_level: critical` → demande confirmation humaine
4. **Matthieu** valide via Telegram : "✅ Autorise" ou "❌ Refuse"
5. **Opex** exécute via workflow `800_shell_execute.json`
6. **SystemJournal** enregistre : agent, commande, résultat, coût

## Exemples d'usage

### DevOps automation
```json
{
  "cmd": "systemctl status n8n",
  "timeout_seconds": 10
}
```

### Log analysis
```json
{
  "cmd": "tail -100 /var/log/n8n/n8n.log | grep ERROR",
  "timeout_seconds": 5
}
```

### Deployment
```json
{
  "cmd": "cd /home/user/prolex-core && git pull && npm install",
  "timeout_seconds": 120
}
```

### Monitoring
```json
{
  "cmd": "docker ps -a --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'",
  "timeout_seconds": 10
}
```

## Limitations actuelles

- ❌ Pas de support du working directory (TODO: amélioration)
- ❌ Pas de support des variables d'environnement personnalisées
- ✅ Timeout configurables
- ✅ Cross-platform (Windows/Linux/macOS)
- ✅ Capture stdout/stderr séparément

## Roadmap

- [ ] Ajouter support du `working_directory` dans le schema
- [ ] Ajouter support des env vars custom
- [ ] Implémenter une whitelist de commandes sûres
- [ ] Créer un mode "dry-run" qui explique ce que ferait la commande
- [ ] Intégrer avec le Prolex Sandbox pour tester avant exécution réelle

## Référence

- **Script principal** : `/home/user/prolex-core/claude_runner.py`
- **Schema** : `/home/user/prolex-core/schemas/payloads/shell_execute.schema.json`
- **Tests** : `/home/user/prolex-core/test_shell_runner.sh`
- **Setup guide** : `/home/user/prolex-core/SHELL_TOOL_SETUP.md`
