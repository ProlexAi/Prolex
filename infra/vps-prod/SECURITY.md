# 🔒 Guide de sécurité VPS - Prolex Production

Ce guide couvre les bonnes pratiques de sécurité pour ton VPS de production.

---

## 📋 Table des matières

1. [Firewall UFW](#1--firewall-ufw)
2. [Fail2ban - Protection contre les attaques brute-force](#2--fail2ban)
3. [Authentification SSH par clé](#3--authentification-ssh-par-clé)
4. [Mise à jour automatique des paquets](#4--mises-à-jour-automatiques)
5. [Surveillance et monitoring](#5--surveillance-et-monitoring)
6. [Sauvegardes](#6--sauvegardes)
7. [Bonnes pratiques générales](#7--bonnes-pratiques-générales)

---

## 1. 🔥 Firewall UFW

UFW (Uncomplicated Firewall) est un firewall simple pour Linux.

### 1.1 - Installation et configuration de base

```bash
# Installer UFW (normalement déjà installé sur Ubuntu)
sudo apt install ufw -y

# Politique par défaut : bloquer tout le trafic entrant
sudo ufw default deny incoming

# Politique par défaut : autoriser tout le trafic sortant
sudo ufw default allow outgoing

# Autoriser SSH (IMPORTANT : à faire AVANT d'activer UFW !)
sudo ufw allow 22/tcp comment 'SSH'

# Autoriser HTTP (pour Traefik / Let's Encrypt)
sudo ufw allow 80/tcp comment 'HTTP'

# Autoriser HTTPS (pour Traefik)
sudo ufw allow 443/tcp comment 'HTTPS'

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status verbose
```

**Résultat attendu :**
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere                   # SSH
80/tcp                     ALLOW IN    Anywhere                   # HTTP
443/tcp                    ALLOW IN    Anywhere                   # HTTPS
```

### 1.2 - Commandes utiles UFW

```bash
# Voir l'état du firewall
sudo ufw status

# Voir les règles numérotées
sudo ufw status numbered

# Supprimer une règle par numéro
sudo ufw delete <numéro>

# Supprimer une règle par nom
sudo ufw delete allow 80/tcp

# Désactiver le firewall (attention !)
sudo ufw disable

# Réactiver le firewall
sudo ufw enable

# Réinitialiser toutes les règles
sudo ufw reset
```

### 1.3 - Règles avancées (optionnel)

#### Limiter le taux de connexion SSH (rate limiting)

```bash
# Limiter les tentatives de connexion SSH (max 6 tentatives en 30s)
sudo ufw limit 22/tcp comment 'SSH rate limit'
```

#### Autoriser uniquement certaines IP pour SSH

Si tu as une IP fixe, tu peux restreindre l'accès SSH :

```bash
# Supprimer la règle SSH actuelle
sudo ufw delete allow 22/tcp

# Autoriser SSH uniquement depuis ton IP
sudo ufw allow from <TON_IP> to any port 22 proto tcp comment 'SSH from home'

# Exemple :
# sudo ufw allow from 123.45.67.89 to any port 22 proto tcp
```

> ⚠️ **ATTENTION** : Si ton IP change, tu seras bloqué ! Utilise cette option uniquement si tu as une IP fixe.

---

## 2. 🛡️ Fail2ban - Protection contre les attaques brute-force

Fail2ban surveille les logs et bannit automatiquement les IP qui tentent trop de connexions échouées.

### 2.1 - Installation

```bash
# Installer fail2ban
sudo apt install fail2ban -y

# Démarrer le service
sudo systemctl start fail2ban

# Activer au démarrage
sudo systemctl enable fail2ban

# Vérifier le statut
sudo systemctl status fail2ban
```

### 2.2 - Configuration pour SSH

Créer un fichier de configuration local (ne pas modifier le fichier par défaut) :

```bash
sudo nano /etc/fail2ban/jail.local
```

Ajouter ce contenu :

```ini
[DEFAULT]
# Durée du bannissement (en secondes)
# 1 heure = 3600s, 1 jour = 86400s
bantime  = 3600

# Temps pendant lequel on surveille les échecs
findtime  = 600

# Nombre maximum de tentatives avant bannissement
maxretry = 5

# Action à effectuer lors d'un bannissement
# %(action_mw)s = bannir + envoyer un email avec whois
# %(action_)s = bannir seulement (pas d'email)
action = %(action_)s

[sshd]
# Activer la protection SSH
enabled = true

# Port SSH (modifier si tu as changé le port par défaut)
port    = 22

# Fichier de log à surveiller
logpath = /var/log/auth.log

# Nombre de tentatives avant bannissement
maxretry = 3
```

**Sauvegarder** : `Ctrl+O` → `Enter` → `Ctrl+X`

### 2.3 - Redémarrer fail2ban

```bash
# Redémarrer pour appliquer la config
sudo systemctl restart fail2ban

# Vérifier que tout fonctionne
sudo fail2ban-client status
```

**Résultat attendu :**
```
Status
|- Number of jail:      1
`- Jail list:   sshd
```

### 2.4 - Commandes utiles fail2ban

```bash
# Voir le statut de la jail SSH
sudo fail2ban-client status sshd

# Voir les IP bannies
sudo fail2ban-client get sshd banip

# Débannir une IP manuellement
sudo fail2ban-client set sshd unbanip <IP>

# Bannir une IP manuellement
sudo fail2ban-client set sshd banip <IP>

# Recharger la configuration
sudo fail2ban-client reload

# Voir les logs fail2ban
sudo tail -f /var/log/fail2ban.log
```

### 2.5 - Ajouter une protection pour Traefik (optionnel)

Si tu veux protéger les services derrière Traefik :

```bash
sudo nano /etc/fail2ban/filter.d/traefik-auth.conf
```

Contenu :

```ini
[Definition]
failregex = ^<HOST> - - \[.*\] ".*" 401 .*$
ignoreregex =
```

Puis dans `/etc/fail2ban/jail.local` :

```ini
[traefik-auth]
enabled = true
port = http,https
filter = traefik-auth
logpath = /opt/prolex/logs/traefik/access.log
maxretry = 3
bantime = 3600
```

---

## 3. 🔑 Authentification SSH par clé (recommandé)

L'authentification par clé SSH est beaucoup plus sécurisée que par mot de passe.

### 3.1 - Générer une paire de clés SSH (sur ton PC Windows)

Ouvre un terminal (PowerShell ou Git Bash) :

```powershell
# Générer une nouvelle clé SSH
ssh-keygen -t ed25519 -C "ton-email@gmail.com"

# Suivre les instructions :
# - Fichier : appuyer sur Enter (par défaut : ~/.ssh/id_ed25519)
# - Passphrase : choisir un mot de passe fort (optionnel mais recommandé)
```

### 3.2 - Copier la clé publique sur le VPS

```powershell
# Depuis ton PC Windows
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh automatt@72.61.107.144 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Ou manuellement :**

1. Sur ton PC, copie le contenu de `~/.ssh/id_ed25519.pub`
2. Sur le VPS :
   ```bash
   mkdir -p ~/.ssh
   nano ~/.ssh/authorized_keys
   # Coller la clé publique
   # Sauvegarder : Ctrl+O, Enter, Ctrl+X
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

### 3.3 - Tester la connexion par clé

Depuis ton PC :

```powershell
ssh automatt@72.61.107.144
```

> ✅ Tu devrais te connecter sans entrer de mot de passe (ou juste la passphrase de la clé).

### 3.4 - Désactiver l'authentification par mot de passe (optionnel)

⚠️ **ATTENTION** : Ne faire cela QUE si l'authentification par clé fonctionne !

```bash
# Sur le VPS
sudo nano /etc/ssh/sshd_config
```

Modifier les lignes suivantes :

```
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no
```

Redémarrer SSH :

```bash
sudo systemctl restart sshd
```

---

## 4. 🔄 Mises à jour automatiques

### 4.1 - Installer les mises à jour automatiques

```bash
sudo apt install unattended-upgrades -y
```

### 4.2 - Configurer

```bash
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Décommenter et modifier :

```
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
Unattended-Upgrade::Mail "ton-email@gmail.com";
```

Activer :

```bash
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 5. 👀 Surveillance et monitoring

### 5.1 - Surveiller l'espace disque

```bash
# Voir l'espace disque utilisé
df -h

# Voir les dossiers qui prennent le plus de place
du -sh /opt/prolex/*

# Surveiller en temps réel
watch -n 5 df -h
```

### 5.2 - Surveiller la RAM et le CPU

```bash
# Installer htop (déjà fait normalement)
sudo apt install htop -y

# Lancer htop
htop
```

### 5.3 - Surveiller les connexions actives

```bash
# Voir les connexions SSH actives
who

# Voir toutes les connexions
ss -tunap

# Voir les tentatives de connexion SSH
sudo tail -f /var/log/auth.log
```

### 5.4 - Alertes par email (optionnel)

Installer `mailutils` pour recevoir des emails :

```bash
sudo apt install mailutils -y
```

Tester l'envoi d'email :

```bash
echo "Test depuis le VPS" | mail -s "Test" ton-email@gmail.com
```

---

## 6. 💾 Sauvegardes

### 6.1 - Script de sauvegarde automatique PostgreSQL

Créer un script de backup :

```bash
nano /opt/prolex/scripts/backup-postgres.sh
```

Contenu :

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/opt/prolex/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Créer le backup
docker compose -f /opt/prolex/docker-compose.yml exec -T postgres \
  pg_dump -U prolex prolex_db > "$BACKUP_FILE"

# Compresser
gzip "$BACKUP_FILE"

# Garder uniquement les 7 derniers backups
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup créé : $BACKUP_FILE.gz"
```

Rendre exécutable :

```bash
chmod +x /opt/prolex/scripts/backup-postgres.sh
```

### 6.2 - Cron pour backup automatique quotidien

```bash
# Éditer la crontab
crontab -e

# Ajouter cette ligne (backup tous les jours à 2h du matin)
0 2 * * * /opt/prolex/scripts/backup-postgres.sh >> /var/log/prolex-backup.log 2>&1
```

### 6.3 - Backup des données n8n et AnythingLLM

```bash
# Script de backup complet
nano /opt/prolex/scripts/backup-all.sh
```

Contenu :

```bash
#!/bin/bash

BACKUP_DIR="/opt/prolex/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker compose -f /opt/prolex/docker-compose.yml exec -T postgres \
  pg_dump -U prolex prolex_db | gzip > "$BACKUP_DIR/postgres/backup_$DATE.sql.gz"

# Backup n8n data
tar -czf "$BACKUP_DIR/n8n/n8n_data_$DATE.tar.gz" -C /opt/prolex n8n/data

# Backup AnythingLLM data
tar -czf "$BACKUP_DIR/anythingllm/llm_data_$DATE.tar.gz" -C /opt/prolex anythingllm/data

# Nettoyer les anciens backups (garder 7 jours)
find "$BACKUP_DIR/postgres" -name "*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR/n8n" -name "*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR/anythingllm" -name "*.tar.gz" -mtime +7 -delete

echo "Backup complet créé : $DATE"
```

---

## 7. ✅ Bonnes pratiques générales

### 7.1 - Checklist de sécurité

- ✅ Firewall UFW activé (ports 22, 80, 443 uniquement)
- ✅ Fail2ban installé et configuré
- ✅ Authentification SSH par clé (et désactivation du mot de passe)
- ✅ Utilisateur non-root pour le travail quotidien
- ✅ Fichier `.env` avec permissions 600 (non lisible par les autres)
- ✅ Mises à jour automatiques activées
- ✅ Sauvegardes automatiques configurées
- ✅ Traefik avec HTTPS activé (Let's Encrypt)
- ✅ Pas de secrets dans les fichiers versionnés (Git)

### 7.2 - Commandes de vérification rapide

```bash
# Vérifier le firewall
sudo ufw status

# Vérifier fail2ban
sudo fail2ban-client status

# Vérifier les services Docker
cd /opt/prolex && docker compose ps

# Vérifier l'espace disque
df -h

# Vérifier les connexions actives
who

# Vérifier les logs Docker
docker compose logs --tail=50

# Vérifier les tentatives de connexion SSH
sudo tail -f /var/log/auth.log
```

### 7.3 - Que faire en cas d'intrusion suspectée ?

1. **Vérifier les connexions actives** :
   ```bash
   who
   ss -tunap
   ```

2. **Vérifier les logs d'authentification** :
   ```bash
   sudo tail -100 /var/log/auth.log
   ```

3. **Vérifier les IP bannies par fail2ban** :
   ```bash
   sudo fail2ban-client status sshd
   ```

4. **Changer tous les mots de passe** :
   ```bash
   passwd automatt
   sudo passwd root
   nano /opt/prolex/.env  # Changer tous les secrets
   ```

5. **Redémarrer tous les services** :
   ```bash
   cd /opt/prolex
   docker compose down
   docker compose up -d
   ```

6. **Vérifier les processus suspects** :
   ```bash
   htop
   ps aux | grep -v "root\|system"
   ```

---

## 🆘 Ressources complémentaires

- **UFW** : https://doc.ubuntu-fr.org/ufw
- **Fail2ban** : https://www.fail2ban.org/
- **SSH Hardening** : https://www.ssh.com/academy/ssh/hardening
- **Docker Security** : https://docs.docker.com/engine/security/

---

**Reste vigilant et surveille ton serveur régulièrement ! 🛡️**
