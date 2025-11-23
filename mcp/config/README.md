# MCP Config

## Description

Dossier contenant les **fichiers de configuration** pour les serveurs MCP.

## Contenu

- Configurations JSON/YAML
- Variables d'environnement (exemples)
- Settings spécifiques aux MCPs

## Naming Convention

Les fichiers dans ce dossier suivent ces patterns :
- `config_<server-name>.json` - Config JSON
- `settings_<server-name>.yml` - Settings YAML
- `.env.example` - Template variables d'environnement
- `<server-name>.config.json` - Config spécifique

## Exemples

```
config_mcp_n8n.json
settings_google_workspace.yml
config_communication.json
.env.n8n.example
```

## Structure Recommandée

### Fichier de config type

```json
{
  "server": {
    "name": "n8n-mcp-server",
    "version": "1.0.0",
    "port": 3000
  },
  "n8n": {
    "baseUrl": "https://n8n.automatt.ai",
    "apiKeyEnvVar": "N8N_API_KEY"
  },
  "logging": {
    "level": "info",
    "logPath": "logs/tech/mcp_n8n.log"
  }
}
```

### Variables d'environnement

```env
# .env.example
N8N_API_KEY=your_api_key_here
N8N_BASE_URL=https://n8n.automatt.ai
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
```

## Important

✅ **Versionner** :
- `.example` et `.sample` → **Git**
- Exemples de configuration → **Git**
- Documentation des paramètres → **Git**

⚠️ **NE JAMAIS versionner** :
- `.env` (avec vraies valeurs) → **Git Ignore**
- Fichiers avec API keys → **Git Ignore**
- Secrets et credentials → **Git Ignore**

## Bonnes Pratiques

1. **Templates** : Toujours fournir un `.example`
2. **Documentation** : Commenter chaque paramètre
3. **Validation** : Valider la config au démarrage du serveur
4. **Secrets** : Utiliser des variables d'environnement

## Workflow

1. **Setup** : Copier `.env.example` → `.env`
2. **Configuration** : Remplir les valeurs réelles
3. **Validation** : Tester le démarrage du MCP
4. **Déploiement** : Répliquer sur VPS (sans commiter les secrets)

## Voir Aussi

- `/mcp/<server>/README.md` - Doc du serveur spécifique
- `/.gitignore` - Vérifier que `.env` est ignoré
- `/config/` - Configurations système globales
