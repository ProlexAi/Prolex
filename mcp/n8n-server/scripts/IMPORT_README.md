# Import Workflow Script

## Description

Ce script importe le workflow de maintenance quotidienne `050_daily_full_maintenance_prolex_v4` dans n8n.

## Prérequis

1. Avoir un serveur n8n en cours d'exécution
2. Avoir une clé API n8n valide
3. Configurer le fichier `.env` avec les bonnes valeurs

## Configuration

Éditez le fichier `/home/user/Prolex/mcp/n8n-server/.env` et mettez à jour ces variables :

```bash
N8N_BASE_URL=http://localhost:5678  # ou votre URL n8n de production
N8N_API_KEY=your-api-key-here       # votre clé API n8n
```

### Comment obtenir votre clé API n8n

1. Connectez-vous à votre instance n8n
2. Allez dans **Settings** → **API**
3. Créez une nouvelle clé API ou copiez-en une existante

## Utilisation

```bash
cd /home/user/Prolex/mcp/n8n-server
tsx scripts/import-workflow-direct.ts
```

## Ce que fait le script

1. Lit le workflow JSON depuis `n8n-workflows/050_daily_full_maintenance_prolex_v4.json`
2. Vérifie si le workflow existe déjà dans n8n
3. Si oui : met à jour le workflow existant
4. Si non : crée un nouveau workflow
5. Active automatiquement le workflow pour qu'il s'exécute tous les jours à 4h00

## Workflow de maintenance

Le workflow effectue les opérations suivantes **tous les jours à 4h00** :

1. `git fetch --all && git reset --hard origin/main` - Synchronisation git
2. `npm ci --only=production` - Installation des dépendances
3. `npm run build` - Build du projet
4. `pm2 restart mcp-n8n-server --update-env` - Redémarrage PM2
5. `pm2 save` - Sauvegarde de la configuration PM2
6. `curl -f http://localhost:5678/health` - Vérification de santé
7. Écriture du log de maintenance dans `DAILY_MAINTENANCE_LOG.txt`

## Vérification

Après l'import, vérifiez dans n8n que :
- Le workflow est visible dans la liste
- Le workflow est **ACTIF**
- Le trigger est configuré pour 4h00 du matin (cron: `0 4 * * *`)
