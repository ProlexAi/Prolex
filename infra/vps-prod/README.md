<<<<<< claude/setup-devops-infrastructure-011L1XNFBgxcqdLGbXCim1bi
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
=======
# 🚀 Infrastructure VPS Production - Prolex

Architecture Docker complète pour le déploiement de la stack Prolex sur VPS.

---

## 📂 Structure du projet

```
infra/vps-prod/
├── README.md                    # Ce fichier
├── ARCHITECTURE.md              # Documentation de l'architecture
├── DEPLOY.md                    # Guide de déploiement complet
├── SECURITY.md                  # Guide de sécurité (UFW, fail2ban, etc.)
│
├── docker-compose.yml           # Orchestration de tous les services
├── .env.example                 # Template des variables d'environnement
│
├── traefik/                     # Configuration Traefik (reverse proxy)
│   └── traefik.yml              # Configuration statique
│
├── mcp/                         # Serveurs MCP
│   └── n8n-server/              # Serveur MCP pour n8n
│       └── Dockerfile.template  # Template Dockerfile pour le MCP
│
└── scripts/                     # Scripts utilitaires
    └── backup-all.sh.template   # Template de script de backup
```

---

## 🎯 Services inclus

| Service | Rôle | URL | Port |
|---------|------|-----|------|
| **Traefik** | Reverse proxy + SSL | - | 80, 443 |
| **n8n** | Workflow automation | https://n8n.iaproject.cloud | 5678 |
| **AnythingLLM** | Agents IA | https://llm.iaproject.cloud | 3001 |
| **MCP n8n Server** | Serveur MCP pour n8n | (interne) | 3100 |
| **PostgreSQL** | Base de données | (interne) | 5432 |
| **Redis** | Cache & queues (optionnel) | (interne) | 6379 |

---

## 🚀 Déploiement rapide

### 1️⃣ Prérequis

- VPS Ubuntu (Hostinger)
- Domaine DNS configuré (`iaproject.cloud`)
- Accès SSH au VPS

### 2️⃣ Installation

Consulte le guide complet : **[DEPLOY.md](./DEPLOY.md)**

**Résumé des étapes :**

```bash
# Sur le VPS
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo mkdir -p /opt/prolex
cd /opt/prolex

# Copier les fichiers (depuis ton PC)
scp -r * automatt@72.61.107.144:/opt/prolex/

# Configuration
cp .env.example .env
nano .env  # Remplir les variables

# Lancer la stack
docker compose up -d
```

### 3️⃣ Vérification

```bash
docker compose ps
docker compose logs -f
curl -I https://n8n.iaproject.cloud
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Architecture complète, rôle de chaque service, arborescence |
| **[DEPLOY.md](./DEPLOY.md)** | Guide de déploiement étape par étape pour débutants |
| **[SECURITY.md](./SECURITY.md)** | Configuration UFW, fail2ban, SSH, sauvegardes |

---

## 🔐 Sécurité

**Checklist de sécurité :**

- ✅ Firewall UFW activé (ports 22, 80, 443)
- ✅ Fail2ban pour protéger SSH
- ✅ Authentification SSH par clé (recommandé)
- ✅ Fichier `.env` non versionné (permissions 600)
- ✅ HTTPS activé via Let's Encrypt
- ✅ Sauvegardes automatiques

Consulte **[SECURITY.md](./SECURITY.md)** pour plus de détails.

---

## 🔧 Commandes utiles

### Gestion des services

```bash
cd /opt/prolex

# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Logs
docker compose logs -f

# Redémarrer un service
docker compose restart n8n

# Mettre à jour
docker compose pull
docker compose up -d
```

### Maintenance

```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U prolex prolex_db > backup.sql

# Espace disque
docker system df

# Nettoyer
docker system prune -a
```

---

## 🆘 Support

### Problèmes courants

**Les certificats SSL ne se génèrent pas :**
- Vérifier que les DNS pointent vers le VPS : `nslookup n8n.iaproject.cloud`
- Vérifier les logs Traefik : `docker compose logs traefik`
- Vérifier les permissions de `acme.json` : `ls -la traefik/acme.json` (doit être 600)

**n8n ne démarre pas :**
- Vérifier que PostgreSQL tourne : `docker compose ps postgres`
- Vérifier les logs : `docker compose logs n8n`
- Vérifier le fichier `.env`

**Un conteneur redémarre en boucle :**
- Voir les logs : `docker compose logs <service>`
- Vérifier la config dans `docker-compose.yml`

---

## 📦 Variables d'environnement requises

Toutes les variables sont définies dans `.env` (à créer depuis `.env.example`).

**Variables essentielles :**

- `TRAEFIK_ACME_EMAIL` : Email pour Let's Encrypt
- `N8N_ENCRYPTION_KEY` : Clé de chiffrement n8n (générer avec `openssl rand -base64 32`)
- `POSTGRES_PASSWORD` : Mot de passe PostgreSQL
- `OPENAI_API_KEY` : Clé API OpenAI (pour AnythingLLM)

Voir **[.env.example](./.env.example)** pour la liste complète.

---

## 🌐 Architecture réseau

```
                      Internet
                         │
                         ▼
                 ┌───────────────┐
                 │   Traefik     │  :80, :443
                 │  (SSL/HTTPS)  │
                 └───────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐     ┌──────────┐   ┌──────────┐
    │  n8n   │     │AnythingLLM│  │   MCP    │
    │ :5678  │     │  :3001    │  │  :3100   │
    └────┬───┘     └──────────┘   └─────┬────┘
         │                               │
         ▼                               │
    ┌──────────┐                         │
    │PostgreSQL│ ◄───────────────────────┘
    │  :5432   │
    └──────────┘

Réseau Docker: prolex-network (bridge)
```

---

## 📝 Notes importantes

### À faire après le déploiement

1. **Configurer n8n** : Créer le compte admin, générer l'API key
2. **Configurer AnythingLLM** : Ajouter les clés API dans l'interface
3. **Tester les workflows** : Vérifier que tout fonctionne
4. **Configurer les sauvegardes** : Mettre en place les backups automatiques
5. **Activer fail2ban** : Protéger SSH contre les attaques brute-force

### À ne PAS faire

- ❌ Ne jamais versionner le fichier `.env`
- ❌ Ne jamais exposer les ports des services (sauf Traefik)
- ❌ Ne jamais utiliser `latest` en prod (utiliser des tags de version spécifiques)
- ❌ Ne jamais stocker de secrets en clair dans les fichiers versionnés

---

## 🔄 Mises à jour

### Mettre à jour un service

```bash
cd /opt/prolex

# Arrêter le service
docker compose stop n8n

# Mettre à jour l'image
docker compose pull n8n

# Redémarrer
docker compose up -d n8n

# Vérifier
docker compose logs -f n8n
```

### Mettre à jour tous les services

```bash
docker compose pull
docker compose up -d
```

---

## 📞 Contact

- **Projet** : Prolex / Automatt
- **GitHub** : https://github.com/ProlexAi/Prolex
- **Maintainer** : Matthieu

---

**Bon déploiement ! 🚀**
>>>>>> main
