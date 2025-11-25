# Shell Runner - Quickstart (3 lignes)

## Installation immédiate

```bash
# 1. Tester le script
echo '{"cmd":"echo Works!"}' | python3 claude_runner.py

# 2. (Optionnel) Lancer la suite de tests
./test_shell_runner.sh

# 3. Configurer dans Claude Desktop : éditer ~/.config/claude/claude_desktop_config.json
```

## Configuration Claude Desktop (copier-coller)

**Linux/macOS** : `~/.config/claude/claude_desktop_config.json`
**Windows** : `%APPDATA%\Claude\claude_desktop_config.json`

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
          "cmd": {"type": "string", "description": "Shell command to execute"},
          "timeout_seconds": {"type": "integer", "default": 30}
        },
        "required": ["cmd"]
      }
    }
  }
}
```

**Sur Windows**, remplace le chemin par :
```json
"args": ["C:\\Users\\VotreNom\\prolex-core\\claude_runner.py"]
```

## C'est tout !

Redémarre Claude Desktop, puis demande-lui :
- "Liste les fichiers de mon répertoire"
- "Montre-moi l'espace disque"
- "Crée un dossier test"

Claude utilisera automatiquement le tool `run_shell`.

---

**Fichiers créés** :
- ✅ `claude_runner.py` - Script principal
- ✅ `test_shell_runner.sh` - Tests automatiques
- 📖 `SHELL_TOOL_SETUP.md` - Documentation complète
- 📖 `SHELL_RUNNER_QUICKSTART.md` - Ce fichier
