# Configuration / config

Ce répertoire contient :
1. **Configuration comportementale** : Fichiers YAML pour Kimmy et Prolex
2. **Configuration centralisée des variables d'environnement** : Module TypeScript pour toutes les clés API et secrets

---

## 🔐 Configuration Centralisée des Variables d'Environnement

### Vue d'ensemble

Depuis la version 1.0, **toutes** les variables d'environnement et clés API sont centralisées à la racine du projet dans des fichiers `.env` :

- **`.env.example`** (racine) : Template avec toutes les variables (versionné)
- **`.env.local`** (racine) : Pour développement local (NON versionné)
- **`.env.vps`** (racine) : Pour serveur VPS (NON versionné)
- **`.env.test`** (racine) : Pour tests (NON versionné)

### Module `config-loader`

Le module `@prolex/config` (`config/src/config-loader.ts`) :
- Charge automatiquement le bon fichier `.env` selon l'environnement
- Valide la présence des variables critiques
- Expose une interface TypeScript complète et typée
- Utilisé par **tous** les MCP servers, services, apps et outils

### Installation et Build

```bash
cd config
npm install
npm run build
```

Cela génère le module compilé dans `config/dist/`.

### Utilisation

#### Dans un MCP server ou service TypeScript

```typescript
// Importer la configuration centrale
import { config } from '../../config/dist/config-loader';

// Utiliser les variables typées
const n8nClient = new N8nClient({
  baseUrl: config.n8n.baseUrl,
  apiKey: config.n8n.apiKey,
  timeout: config.n8n.timeout
});

const db = new DatabaseClient({
  url: config.database.url
});

// Vérifier l'environnement
if (config.env === 'local') {
  console.log('Mode développement local');
}
```

#### Variables disponibles

Le module expose une interface `ProlexConfig` complète avec :

- **Environnement** : `env`, `nodeEnv`, `domainRoot`
- **n8n** : `baseUrl`, `apiKey`, `timeout`, `encryptionKey`, etc.
- **LLMs** : `openaiApiKey`, `anthropicApiKey`, `provider`
- **Database** : `url`, `user`, `password`, etc.
- **Redis** : `url`, `password`
- **Google** : `credentialsPath`, `systemJournalSpreadsheetId`, etc.
- **Paiements** : Stripe, PayPal, Plaid, Binance, CoinGecko
- **Communication** : Email (Gmail/SMTP), Twilio, Slack, Telegram
- **Sécurité** : Whitelists, rate limiting, validations
- **Services internes** : Sandbox, Vector Service, MCP servers
- **Logging & Streaming**
- **Admin & Traefik**

Voir `config/src/config-loader.ts` pour la liste complète.

### Ajouter une nouvelle variable

1. **Ajouter dans `.env.example`** (racine) :
   ```bash
   # Ma nouvelle variable
   MA_NOUVELLE_VAR=valeur_par_defaut
   ```

2. **Ajouter dans l'interface TypeScript** (`config/src/config-loader.ts`) :
   ```typescript
   export interface ProlexConfig {
     // ... autres champs
     maNouvelleVar: string;
   }
   ```

3. **Ajouter dans `buildConfig()`** (`config/src/config-loader.ts`) :
   ```typescript
   return {
     // ... autres champs
     maNouvelleVar: env.MA_NOUVELLE_VAR || 'default_value',
   };
   ```

4. **Rebuild le module** :
   ```bash
   cd config && npm run build
   ```

5. **Utiliser dans votre code** :
   ```typescript
   import { config } from '../../config/dist/config-loader';
   console.log(config.maNouvelleVar);
   ```

### Configuration selon l'environnement

Le module charge automatiquement le bon fichier `.env` selon la variable `PROLEX_ENV` :

| `PROLEX_ENV` | Fichier chargé | Usage |
|--------------|----------------|-------|
| `local` (défaut) | `.env.local` | Développement local |
| `vps` | `.env.vps` | Serveur de production |
| `test` | `.env.test` | Tests automatisés |

Pour spécifier l'environnement :
```bash
# Avant de lancer votre service
export PROLEX_ENV=vps
npm run dev
```

### Sécurité

- ❌ **JAMAIS** committer `.env.local`, `.env.vps` ou `.env.test`
- ✅ Toujours utiliser `.env.example` comme template
- ✅ Générer des secrets sécurisés : `openssl rand -base64 32`
- ✅ Vérifier les permissions : `chmod 600 .env.local`
- ✅ Valider qu'aucune variable critique n'est vide avant de lancer

### Migration depuis anciens `.env`

Si vous avez des fichiers `.env` dans des sous-dossiers (MCP, services, etc.) :

1. **Copier les valeurs** dans `.env.local` (racine)
2. **Renommer l'ancien** en `.env.old` (pour backup)
3. **Mettre à jour le code** pour importer `config-loader`
4. **Tester** que tout fonctionne
5. **Supprimer** les anciens `.env.old`

---

## 📋 Configuration Comportementale (YAML)

### Fichiers

### kimmy_config.yml

Configuration de **Kimmy**, le filtre d'entrée intelligent.

**Rôle** : Analyser les demandes utilisateur, classifier les intentions, extraire les paramètres et décider de l'escalade vers Prolex.

**Paramètres clés** :
- Mode d'opération (safe / quick_actions)
- Liste des intents reconnus
- Seuils de confiance pour les décisions
- Mots-clés sensibles déclenchant l'escalade
- Configuration des quick actions

### prolex_config.yml

Configuration de **Prolex**, le cerveau orchestrateur.

**Rôle** : Planifier les actions, choisir les outils appropriés, orchestrer l'exécution via n8n et garantir la sécurité.

**Paramètres clés** :
- Niveau d'autonomie (0 à 3)
- Outils autorisés par niveau
- Outils sensibles nécessitant confirmation
- Processus d'infrastructure (N8N_SYNC_GITHUB_WORKFLOWS)
- Limites de planification

## Documentation

Pour plus de détails sur l'architecture v4 et l'utilisation de ces configurations, consulter :
- [docs/00_INTEGRATION_V4_KIMMY_PROLEX.md](../docs/00_INTEGRATION_V4_KIMMY_PROLEX.md)

## Modification

Ces fichiers YAML peuvent être édités directement pour ajuster le comportement des agents sans modifier le code.

**Attention** : Toute modification doit être testée et validée avant déploiement en production.
