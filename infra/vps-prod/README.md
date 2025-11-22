# Infrastructure VPS Production - Prolex

Infrastructure complète pour déployer et gérer la stack Prolex sur un VPS Ubuntu.

## 🏗️ Stack Technique

- **Reverse Proxy** : Traefik v3 (avec SSL Let's Encrypt automatique)
- **Automation** : n8n (workflows et automatisations)
- **LLM Management** : AnythingLLM (gestion des modèles et documents)
- **MCP Server** : Model Context Protocol (optionnel)

## 📁 Structure du répertoire

```
infra/vps-prod/
├── docker-compose.yml      # Configuration de la stack Docker
├── .env.example            # Template des variables d'environnement
├── README.md               # Ce fichier
├── scripts/                # Scripts de gestion du VPS
│   ├── bootstrap_vps.sh    # Installation complète VPS vierge
│   ├── deploy_stack.sh     # Déploiement/mise à jour
│   ├── backup_prolex.sh    # Sauvegarde des données
│   └── restore_prolex.sh   # Restauration depuis backup
├── traefik/                # Configuration Traefik
│   ├── traefik.yml         # Config statique Traefik
│   └── acme.example.json   # Template pour certificats SSL
├── backup/                 # Répertoire des sauvegardes (créé automatiquement)
└── docs/                   # Documentation
    └── SCRIPTS_VPS_GUIDE.md  # Guide complet d'utilisation
```

## 🚀 Démarrage rapide

### 1️⃣ Première installation (VPS vierge)

```bash
# Sur votre VPS Ubuntu
wget https://raw.githubusercontent.com/ProlexAi/Prolex/main/infra/vps-prod/scripts/bootstrap_vps.sh
chmod +x bootstrap_vps.sh
sudo ./bootstrap_vps.sh
```

### 2️⃣ Configuration

```bash
# Créer le fichier .env depuis le template
cd /opt/prolex/infra/vps-prod
cp .env.example .env
nano .env  # Remplissez vos secrets et domaines

# Créer le fichier acme.json pour Traefik
cp traefik/acme.example.json traefik/acme.json
chmod 600 traefik/acme.json
```

### 3️⃣ Lancement

```bash
# Démarrer la stack
docker compose up -d

# Vérifier l'état
docker compose ps
docker compose logs -f
```

## 📚 Documentation

**Guide complet** : [docs/SCRIPTS_VPS_GUIDE.md](./docs/SCRIPTS_VPS_GUIDE.md)

Ce guide contient :
- Explications détaillées de chaque script
- Scénarios d'utilisation pratiques
- Dépannage et résolution de problèmes
- Bonnes pratiques de sécurité

## 🔧 Scripts de gestion

| Script | Description | Usage |
|--------|-------------|-------|
| `bootstrap_vps.sh` | Installation complète sur VPS vierge | `sudo ./scripts/bootstrap_vps.sh` |
| `deploy_stack.sh` | Mise à jour et redéploiement | `./scripts/deploy_stack.sh` |
| `backup_prolex.sh` | Sauvegarde des données | `./scripts/backup_prolex.sh` |
| `restore_prolex.sh` | Restauration depuis backup | `./scripts/restore_prolex.sh [backup.zip]` |

## 🔐 Sécurité

### Variables sensibles à configurer dans `.env`

- `N8N_ENCRYPTION_KEY` : Clé de chiffrement n8n (générer avec `openssl rand -hex 32`)
- `ANYTHINGLLM_JWT_SECRET` : Secret JWT AnythingLLM (générer avec `openssl rand -hex 32`)
- `N8N_BASIC_AUTH_PASSWORD` : Mot de passe admin n8n
- `OPENAI_API_KEY` : Clé API OpenAI (ou autre provider LLM)
- `LETSENCRYPT_EMAIL` : Email pour Let's Encrypt

### ⚠️ Important

- **NE JAMAIS** commiter le fichier `.env` dans Git
- Changez **TOUS** les mots de passe par défaut
- Configurez vos DNS **AVANT** de lancer la stack (pour SSL)
- Sauvegardez le `.env` dans un gestionnaire de mots de passe

## 🌐 Accès aux services

Après configuration DNS et démarrage :

- **n8n** : https://n8n.votredomaine.com
- **AnythingLLM** : https://llm.votredomaine.com
- **Traefik Dashboard** : Désactivé par défaut (voir `docker-compose.yml` pour activer)

## 💾 Backups

### Backup manuel

```bash
cd /opt/prolex/infra/vps-prod
./scripts/backup_prolex.sh
```

### Backup automatique (cron)

```bash
# Ajouter au crontab (backup quotidien à 3h)
crontab -e

# Ajouter cette ligne :
0 3 * * * /opt/prolex/infra/vps-prod/scripts/backup_prolex.sh >> /var/log/prolex-backup.log 2>&1
```

## 🛠️ Commandes utiles

```bash
# Voir l'état des conteneurs
docker compose ps

# Voir les logs
docker compose logs -f

# Redémarrer un service
docker compose restart <service>

# Arrêter la stack
docker compose down

# Mise à jour de la stack
./scripts/deploy_stack.sh
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas
```bash
docker compose logs
```

### Certificats SSL non générés
```bash
# Vérifier les logs Traefik
docker compose logs traefik

# Vérifier que DNS pointe bien vers le VPS
nslookup n8n.votredomaine.com
```

### Problème de permissions
```bash
# Vérifier le propriétaire des fichiers
ls -la /opt/prolex/

# Corriger si nécessaire
sudo chown -R automatt:automatt /opt/prolex/
```

## 📞 Support

- **Documentation complète** : [docs/SCRIPTS_VPS_GUIDE.md](./docs/SCRIPTS_VPS_GUIDE.md)
- **Issues GitHub** : https://github.com/ProlexAi/Prolex/issues

---

**Version** : 1.0
**Date** : Janvier 2025
**Architecte DevOps** : Prolex Team
