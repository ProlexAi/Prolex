# Shell Command Execution Tool - Setup

## Installation Ultra-Rapide

### Étape 1 : Vérifier le script
```bash
# Le script est déjà créé et exécutable
ls -la claude_runner.py
```

### Étape 2 : Tester manuellement
```bash
# Test basique
echo '{"cmd":"echo Hello World"}' | python3 claude_runner.py

# Test avec timeout
echo '{"cmd":"sleep 2 && echo Done", "timeout_seconds":5}' | python3 claude_runner.py

# Sur Windows PowerShell
echo '{"cmd":"Get-Date"}' | python claude_runner.py
```

### Étape 3 : Configuration dans Claude Desktop / MCP

**Option A : Claude Desktop (config file)**

Editer `~/.config/claude/claude_desktop_config.json` (Linux/macOS) ou `%APPDATA%\Claude\claude_desktop_config.json` (Windows) :

```json
{
  "tools": {
    "run_shell": {
      "command": "python3",
      "args": ["/home/user/prolex-core/claude_runner.py"],
      "description": "Execute shell commands on the local system",
      "input_schema": {
        "type": "object",
        "properties": {
          "cmd": {
            "type": "string",
            "description": "The shell command to execute"
          },
          "timeout_seconds": {
            "type": "integer",
            "description": "Maximum execution time in seconds (default: 30)",
            "default": 30
          }
        },
        "required": ["cmd"]
      }
    }
  }
}
```

**Sur Windows, utiliser le chemin complet** :
```json
"args": ["C:\\Users\\YourName\\prolex-core\\claude_runner.py"]
```

**Option B : MCP Server personnalisé**

Créer un fichier `mcp_config.json` :

```json
{
  "mcpServers": {
    "shell-executor": {
      "command": "python3",
      "args": ["/home/user/prolex-core/claude_runner.py"]
    }
  }
}
```

**Option C : Intégration dans Prolex via n8n**

Créer un workflow n8n qui :
1. Reçoit un webhook avec `{"cmd": "...", "timeout_seconds": 30}`
2. Exécute `claude_runner.py` via Execute Command node
3. Parse la réponse JSON
4. Log dans SystemJournal

## Exemples d'utilisation via Claude

Une fois configuré, tu peux demander à Claude :

```
"Liste les fichiers du répertoire courant"
→ Claude utilise run_shell avec cmd: "ls -la" (Unix) ou "dir" (Windows)

"Vérifie l'espace disque disponible"
→ Claude utilise run_shell avec cmd: "df -h" (Unix) ou "Get-PSDrive" (Windows)

"Crée un dossier test et ajoute un fichier dedans"
→ Claude utilise run_shell avec cmd: "mkdir test && echo 'Hello' > test/file.txt"

"Montre-moi les processus qui consomment le plus de CPU"
→ Claude utilise run_shell avec cmd: "ps aux --sort=-%cpu | head -10" (Unix)
```

## Format de réponse

Le script retourne toujours un JSON avec :
```json
{
  "stdout": "sortie standard de la commande",
  "stderr": "erreurs éventuelles",
  "exit_code": 0,
  "execution_time_seconds": 0.15,
  "timed_out": false
}
```

## Debug

Les commandes exécutées sont affichées sur stderr :
```
[EXEC] bash -c ls -la
```

## Sécurité

⚠️ **Ce tool donne un accès shell COMPLET à ton système**

- Utilise-le uniquement sur tes propres machines
- Ne l'expose JAMAIS via une API publique
- Configure des timeouts raisonnables (défaut: 30s)
- Vérifie les logs stderr pour auditer les commandes

## Intégration Prolex

Pour ajouter ce tool au catalogue Prolex :

1. Ajouter dans `rag/tools/tools.yml` :
```yaml
- id: SHELL_EXECUTE
  name: "Shell Command Execution"
  description: "Execute shell commands on local system"
  category: devops
  risk_level: critical
  auto_allowed_levels: []  # Jamais en auto, toujours validation humaine
  target:
    type: executable
    path: "/home/user/prolex-core/claude_runner.py"
  payload_schema: "schemas/payloads/shell_execute.schema.json"
```

2. Créer le schema `schemas/payloads/shell_execute.schema.json`

3. Créer un workflow n8n `800_shell_execute.json` qui wrappe l'exécution

4. **IMPORTANT** : Ajouter une validation Proxy Master avec confirmation obligatoire
