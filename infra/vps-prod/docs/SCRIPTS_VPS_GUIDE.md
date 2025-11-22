# Guide d'utilisation des scripts VPS Prolex

Ce guide explique comment utiliser les 4 scripts de gestion du VPS de production Prolex.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Scripts disponibles](#scripts-disponibles)
  - [1. bootstrap_vps.sh](#1-bootstrap_vpssh)
  - [2. deploy_stack.sh](#2-deploy_stacksh)
  - [3. backup_prolex.sh](#3-backup_prolexsh)
  - [4. restore_prolex.sh](#4-restore_prolexsh)
- [Scénarios d'utilisation](#scénarios-dutilisation)
- [Avertissements et bonnes pratiques](#avertissements-et-bonnes-pratiques)
- [Dépannage](#dépannage)

---

## Vue d'ensemble

Les scripts de gestion Prolex vous permettent de :

- **Installer** complètement un VPS Ubuntu vierge
- **Déployer** et mettre à jour la stack applicative
- **Sauvegarder** vos données critiques
- **Restaurer** vos données en cas de problème

Tous les scripts sont situés dans : `infra/vps-prod/scripts/`

---

## Prérequis

### Pour bootstrap_vps.sh
- Un VPS Ubuntu (20.04 LTS ou 22.04 LTS recommandé)
- Accès root (SSH)
- Connexion Internet stable

### Pour les autres scripts
- VPS déjà bootstrapé
- Docker et Docker Compose installés
- Accès utilisateur avec droits sudo

### Configuration DNS
Avant de démarrer, configurez vos enregistrements DNS :

```
n8n.votredomaine.com    → A → IP_VPS
llm.votredomaine.com    → A → IP_VPS
```

---

## Scripts disponibles

### 1. bootstrap_vps.sh

**Rôle** : Installation complète d'un VPS Ubuntu vierge

**Ce qu'il fait** :
- ✅ Met à jour le système
- ✅ Crée un utilisateur non-root (`automatt` par défaut)
- ✅ Installe Docker Engine + Docker Compose
- ✅ Configure le pare-feu UFW (SSH, HTTP, HTTPS)
- ✅ Configure Fail2ban pour protéger SSH
- ✅ Clone le dépôt Git Prolex
- ✅ Lance la stack Docker

**Usage** :

```bash
# Se connecter au VPS en SSH en tant que root
ssh root@IP_VPS

# Télécharger le script (si pas encore cloné)
wget https://raw.githubusercontent.com/ProlexAi/Prolex/main/infra/vps-prod/scripts/bootstrap_vps.sh
chmod +x bootstrap_vps.sh

# Éditer les variables si besoin (utilisateur, domaine, etc.)
nano bootstrap_vps.sh

# Exécuter le script
sudo ./bootstrap_vps.sh
```

**Variables configurables** :

```bash
NEW_USER="automatt"                                    # Nom de l'utilisateur
PROJECT_ROOT="/opt/prolex"                            # Chemin du projet
GIT_REPO_URL="https://github.com/ProlexAi/Prolex.git" # URL du repo
BRANCH="main"                                         # Branche Git
```

**Durée estimée** : 5-10 minutes

**Après l'exécution** :
1. Configurez le fichier `.env` : `/opt/prolex/infra/vps-prod/.env`
2. Redémarrez la stack si nécessaire : `cd /opt/prolex/infra/vps-prod && docker compose restart`

---

### 2. deploy_stack.sh

**Rôle** : Mise à jour et redéploiement de la stack applicative

**Ce qu'il fait** :
- ✅ Met à jour le code depuis Git
- ✅ Rebuild les services custom (si nécessaire)
- ✅ Télécharge les nouvelles images Docker
- ✅ Redémarre la stack Docker
- ✅ Vérifie que tous les services sont opérationnels

**Usage** :

```bash
# Se connecter en tant qu'utilisateur automatt
ssh automatt@IP_VPS

# Aller dans le répertoire du projet
cd /opt/prolex/infra/vps-prod

# Rendre le script exécutable (première fois uniquement)
chmod +x scripts/deploy_stack.sh

# Exécuter le script
./scripts/deploy_stack.sh
```

**Variables configurables** :

```bash
PROJECT_ROOT="/opt/prolex"    # Chemin du projet
BRANCH="main"                 # Branche Git à déployer
SERVICES_TO_BUILD=""          # Services à rebuilder (ex: "mcp")
```

**Durée estimée** : 2-5 minutes

**Cas d'usage** :
- Après un push sur GitHub
- Pour mettre à jour les images Docker
- Après modification du `docker-compose.yml`

---

### 3. backup_prolex.sh

**Rôle** : Sauvegarde complète des données critiques

**Ce qu'il fait** :
- ✅ Sauvegarde les données n8n
- ✅ Sauvegarde les données AnythingLLM
- ✅ Sauvegarde les certificats Traefik (acme.json)
- ✅ Sauvegarde le fichier .env (optionnel)
- ✅ Crée une archive ZIP avec timestamp
- ✅ Upload vers stockage distant (si rclone configuré)
- ✅ Nettoie les anciens backups

**Usage** :

```bash
# Backup manuel
cd /opt/prolex/infra/vps-prod
./scripts/backup_prolex.sh
```

**Variables configurables** :

```bash
PROJECT_ROOT="/opt/prolex"
BACKUP_DIR="${PROJECT_ROOT}/infra/vps-prod/backup"
INCLUDE_ENV=true              # Inclure le .env dans le backup
KEEP_BACKUPS=7                # Nombre de backups à conserver
# RCLONE_REMOTE="prolex-backup:"  # Remote rclone (optionnel)
```

**Automatisation avec cron** :

```bash
# Éditer le crontab
crontab -e

# Ajouter une ligne pour un backup quotidien à 3h du matin
0 3 * * * /opt/prolex/infra/vps-prod/scripts/backup_prolex.sh >> /var/log/prolex-backup.log 2>&1
```

**Durée estimée** : 1-3 minutes (selon la taille des données)

**Localisation des backups** :
```
/opt/prolex/infra/vps-prod/backup/prolex_backup_YYYYMMDD_HHMMSS.zip
```

---

### 4. restore_prolex.sh

**Rôle** : Restauration des données à partir d'un backup

**⚠️ ATTENTION** : Ce script **écrase** les données existantes !

**Ce qu'il fait** :
- ✅ Liste les backups disponibles (si aucun argument)
- ✅ Vérifie l'intégrité du backup
- ✅ Demande confirmation avant de restaurer
- ✅ Arrête la stack Docker
- ✅ Restaure les données
- ✅ Redémarre la stack Docker

**Usage** :

```bash
# Lister les backups disponibles
cd /opt/prolex/infra/vps-prod
./scripts/restore_prolex.sh

# Restaurer un backup spécifique
./scripts/restore_prolex.sh prolex_backup_20250122_143022.zip
```

**Variables configurables** :

```bash
PROJECT_ROOT="/opt/prolex"
BACKUP_DIR="${PROJECT_ROOT}/infra/vps-prod/backup"
```

**Processus de confirmation** :

Le script vous demandera de taper `OUI` en majuscules pour confirmer.

**Durée estimée** : 2-5 minutes

---

## Scénarios d'utilisation

### 🆕 Première installation sur un VPS vierge

```bash
# 1. Se connecter au VPS en root
ssh root@IP_VPS

# 2. Télécharger et exécuter le bootstrap
wget https://raw.githubusercontent.com/ProlexAi/Prolex/main/infra/vps-prod/scripts/bootstrap_vps.sh
chmod +x bootstrap_vps.sh
sudo ./bootstrap_vps.sh

# 3. Configurer le .env
su - automatt
cd /opt/prolex/infra/vps-prod
cp .env.example .env
nano .env  # Remplir vos secrets

# 4. Créer le fichier acme.json pour Traefik
cp traefik/acme.example.json traefik/acme.json
chmod 600 traefik/acme.json

# 5. Relancer la stack
docker compose down
docker compose up -d

# 6. Vérifier que tout fonctionne
docker compose ps
docker compose logs -f
```

### 🔄 Mise à jour après modification du code

```bash
# 1. Se connecter au VPS
ssh automatt@IP_VPS

# 2. Déployer la nouvelle version
cd /opt/prolex/infra/vps-prod
./scripts/deploy_stack.sh

# 3. Vérifier les logs
docker compose logs -f
```

### 💾 Sauvegarde manuelle avant une opération risquée

```bash
# 1. Créer un backup
cd /opt/prolex/infra/vps-prod
./scripts/backup_prolex.sh

# 2. Noter le nom du fichier créé
# Exemple: prolex_backup_20250122_143022.zip

# 3. Effectuer votre opération risquée

# 4. Si problème, restaurer :
./scripts/restore_prolex.sh prolex_backup_20250122_143022.zip
```

### 🔧 Restauration après un problème

```bash
# 1. Lister les backups disponibles
cd /opt/prolex/infra/vps-prod
./scripts/restore_prolex.sh

# 2. Choisir le backup le plus récent (ou celui d'avant le problème)

# 3. Restaurer
./scripts/restore_prolex.sh prolex_backup_20250122_143022.zip

# 4. Taper OUI pour confirmer

# 5. Vérifier que tout est revenu à la normale
docker compose ps
docker compose logs -f
```

### 📅 Configuration d'un backup automatique quotidien

```bash
# 1. Éditer le crontab de l'utilisateur
crontab -e

# 2. Ajouter la ligne suivante (backup à 3h du matin)
0 3 * * * /opt/prolex/infra/vps-prod/scripts/backup_prolex.sh >> /var/log/prolex-backup.log 2>&1

# 3. Créer le fichier de log
sudo touch /var/log/prolex-backup.log
sudo chown automatt:automatt /var/log/prolex-backup.log
```

---

## Avertissements et bonnes pratiques

### ⚠️ Sécurité

- **NE JAMAIS** commiter le fichier `.env` dans Git
- **Changez TOUS** les mots de passe par défaut
- **Générez** des clés de chiffrement uniques et sécurisées
- **Sauvegardez** le fichier `.env` dans un gestionnaire de mots de passe
- **Limitez** l'accès SSH (clés SSH, désactivez le login root)

### 💾 Backups

- **Testez régulièrement** vos restaurations
- **Stockez** les backups hors du VPS (rclone recommandé)
- **Vérifiez** que les backups sont bien créés (cron log)
- **Conservez** plusieurs versions de backups (pas seulement le dernier)

### 🧪 Tests

- **Testez** d'abord sur un VPS de développement/staging
- **NE PAS** exécuter ces scripts en production sans les avoir testés
- **Créez** un backup avant toute modification majeure

### 🔍 Monitoring

- **Surveillez** les logs Docker : `docker compose logs -f`
- **Vérifiez** l'état des conteneurs : `docker compose ps`
- **Consultez** les métriques système : `htop`, `df -h`

---

## Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker compose logs

# Vérifier le fichier .env
cat .env

# Vérifier les ports
sudo netstat -tulpn | grep -E ':(80|443|5678|3001)'
```

### Certificats SSL non générés

```bash
# Vérifier les logs Traefik
docker compose logs traefik

# Vérifier les permissions du fichier acme.json
ls -la traefik/acme.json
# Doit être : -rw------- (600)

# Recréer le fichier si nécessaire
rm traefik/acme.json
cp traefik/acme.example.json traefik/acme.json
chmod 600 traefik/acme.json
docker compose restart traefik
```

### Erreur "Permission denied" lors de l'exécution d'un script

```bash
# Rendre le script exécutable
chmod +x scripts/nom_du_script.sh
```

### Le backup échoue

```bash
# Vérifier l'espace disque disponible
df -h

# Vérifier les permissions
ls -la /opt/prolex/infra/vps-prod/backup

# Exécuter le script en mode verbose
bash -x scripts/backup_prolex.sh
```

### Docker ne répond plus

```bash
# Redémarrer le service Docker
sudo systemctl restart docker

# Vérifier l'état
sudo systemctl status docker

# Vérifier les logs système
sudo journalctl -u docker -n 100
```

---

## 📞 Support

Pour toute question ou problème :

- **Issues GitHub** : https://github.com/ProlexAi/Prolex/issues
- **Documentation Traefik** : https://doc.traefik.io/traefik/
- **Documentation n8n** : https://docs.n8n.io/
- **Documentation Docker** : https://docs.docker.com/

---

**Version** : 1.0
**Date** : Janvier 2025
**Auteur** : Équipe DevOps Prolex
