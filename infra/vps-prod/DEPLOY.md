# 🚀 Guide de déploiement VPS - Prolex Production

## 📋 Prérequis

Avant de commencer, assure-toi d'avoir :

- ✅ Accès SSH au VPS Hostinger (IP : `72.61.107.144`)
- ✅ Un terminal SSH (Windows Terminal, PuTTY, ou Git Bash)
- ✅ Les domaines DNS configurés :
  - `n8n.iaproject.cloud` → `72.61.107.144`
  - `llm.iaproject.cloud` → `72.61.107.144`
- ✅ Les clés API nécessaires (OpenAI, Anthropic, etc.)
- ✅ Ce dossier `infra/vps-prod/` avec tous les fichiers

---

## 🎯 Vue d'ensemble des étapes

1. [Connexion au VPS](#étape-1--connexion-au-vps)
2. [Mise à jour du système](#étape-2--mise-à-jour-du-système)
3. [Création d'un utilisateur non-root](#étape-3--création-dun-utilisateur-non-root)
4. [Installation de Docker](#étape-4--installation-de-docker)
5. [Configuration du firewall](#étape-5--configuration-du-firewall)
6. [Création de l'arborescence](#étape-6--création-de-larborescence)
7. [Transfert des fichiers](#étape-7--transfert-des-fichiers)
8. [Configuration des variables d'environnement](#étape-8--configuration-des-variables-denvironnement)
9. [Préparation de Traefik](#étape-9--préparation-de-traefik)
10. [Lancement de la stack Docker](#étape-10--lancement-de-la-stack-docker)
11. [Vérification du déploiement](#étape-11--vérification-du-déploiement)
12. [Configuration post-déploiement](#étape-12--configuration-post-déploiement)

---

## Étape 1 : Connexion au VPS

### Depuis Windows

**Option A : Windows Terminal / PowerShell**
```powershell
ssh root@72.61.107.144
```

**Option B : Git Bash**
```bash
ssh root@72.61.107.144
```

**Option C : PuTTY**
- Host Name : `72.61.107.144`
- Port : `22`
- Connection Type : `SSH`
- Cliquer sur "Open"

> 💡 **Note** : Entre le mot de passe root fourni par Hostinger.

---

## Étape 2 : Mise à jour du système

Une fois connecté, mettre à jour tous les paquets :

```bash
# Mettre à jour la liste des paquets
sudo apt update

# Installer les mises à jour
sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl wget git htop nano vim ufw
```

> ⏱️ **Temps estimé** : 2-5 minutes

---

## Étape 3 : Création d'un utilisateur non-root

**Pourquoi ?** Travailler en root est dangereux. On crée un utilisateur dédié.

```bash
# Créer l'utilisateur 'automatt'
adduser automatt

# Suivre les instructions :
# - Entrer un mot de passe (IMPORTANT : bien le noter !)
# - Les autres champs sont optionnels (appuyer sur Entrée)

# Ajouter l'utilisateur au groupe sudo
usermod -aG sudo automatt

# Ajouter l'utilisateur au groupe docker (on installera Docker après)
usermod -aG docker automatt
```

### Tester la connexion avec le nouvel utilisateur

```bash
# Changer d'utilisateur pour tester
su - automatt

# Vérifier que sudo fonctionne
sudo whoami
# Doit afficher : root

# Revenir à root
exit
```

> 💡 **Note** : À partir de maintenant, on va travailler avec l'utilisateur `automatt`.

```bash
# Se connecter en tant que automatt
su - automatt
```

---

## Étape 4 : Installation de Docker

Docker permet de faire tourner tous nos services dans des conteneurs isolés.

### 4.1 - Désinstaller les anciennes versions (si présentes)

```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

### 4.2 - Installer Docker via le script officiel

```bash
# Télécharger et exécuter le script d'installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Nettoyer
rm get-docker.sh
```

### 4.3 - Ajouter l'utilisateur au groupe docker

```bash
# Si tu es connecté en tant que automatt
sudo usermod -aG docker $USER

# Appliquer les changements (se déconnecter/reconnecter ou exécuter)
newgrp docker
```

### 4.4 - Vérifier l'installation

```bash
# Vérifier Docker
docker --version
# Doit afficher : Docker version 24.x.x

# Vérifier Docker Compose
docker compose version
# Doit afficher : Docker Compose version v2.x.x

# Tester Docker
docker run hello-world
```

> ✅ Si tu vois "Hello from Docker!", l'installation est réussie !

---

## Étape 5 : Configuration du firewall

On configure UFW (Uncomplicated Firewall) pour sécuriser le serveur.

```bash
# Autoriser SSH (IMPORTANT : à faire AVANT d'activer le firewall !)
sudo ufw allow 22/tcp

# Autoriser HTTP (pour Traefik)
sudo ufw allow 80/tcp

# Autoriser HTTPS (pour Traefik)
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

**Résultat attendu :**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## Étape 6 : Création de l'arborescence

On crée le dossier principal `/opt/prolex` qui va contenir toute la stack.

```bash
# Créer le dossier principal
sudo mkdir -p /opt/prolex

# Donner les droits à l'utilisateur automatt
sudo chown -R automatt:automatt /opt/prolex

# Se placer dans le dossier
cd /opt/prolex

# Créer l'arborescence complète
mkdir -p traefik
mkdir -p n8n/data
mkdir -p anythingllm/data
mkdir -p mcp/n8n-server
mkdir -p postgres/data
mkdir -p redis/data
mkdir -p logs/{traefik,n8n,anythingllm,mcp}
mkdir -p backup/{postgres,n8n,anythingllm}

# Vérifier la structure
tree -L 2
# (Si tree n'est pas installé : sudo apt install tree)
```

---

## Étape 7 : Transfert des fichiers

On va copier les fichiers de configuration depuis ton PC vers le VPS.

### Option A : Depuis Windows avec SCP (recommandé)

Ouvre un **nouveau terminal sur ton PC Windows** (ne pas fermer la connexion SSH).

```powershell
# Se placer dans le dossier du projet Prolex sur ton PC
cd C:\Users\Matthieu\chemin\vers\Prolex\infra\vps-prod

# Copier tous les fichiers vers le VPS
scp -r * automatt@72.61.107.144:/opt/prolex/
```

> 💡 **Note** : Remplace le chemin par le chemin réel sur ton PC.

### Option B : Avec WinSCP (interface graphique)

1. Télécharger WinSCP : https://winscp.net/
2. Se connecter au VPS :
   - Host : `72.61.107.144`
   - User : `automatt`
   - Password : (ton mot de passe)
3. Naviguer vers `/opt/prolex`
4. Glisser-déposer les fichiers depuis `infra/vps-prod/` vers `/opt/prolex/`

### Option C : Copier-coller manuel (pour petits fichiers)

Sur le VPS :

```bash
cd /opt/prolex

# Créer et éditer le fichier
nano docker-compose.yml
# Copier-coller le contenu depuis ton PC
# Sauvegarder : Ctrl+O, Enter, Ctrl+X

# Répéter pour chaque fichier
```

### Vérifier que tous les fichiers sont présents

```bash
cd /opt/prolex
ls -la
```

**Fichiers attendus :**
- `docker-compose.yml`
- `.env.example`
- `traefik/traefik.yml`

---

## Étape 8 : Configuration des variables d'environnement

On crée le fichier `.env` avec toutes les variables nécessaires.

### 8.1 - Copier le template

```bash
cd /opt/prolex
cp .env.example .env
```

### 8.2 - Générer les secrets

Générer des secrets sécurisés pour les variables sensibles :

```bash
# Pour N8N_ENCRYPTION_KEY (32 caractères)
openssl rand -base64 32

# Pour POSTGRES_PASSWORD
openssl rand -base64 24

# Pour ANYTHINGLLM_AUTH_TOKEN
openssl rand -base64 24
```

> 💡 **Note** : Copie ces valeurs dans un fichier temporaire, tu vas les utiliser juste après.

### 8.3 - Éditer le fichier .env

```bash
nano .env
```

**Remplacer TOUS les `__A_REMPLIR__` par les vraies valeurs :**

```env
# Email pour Let's Encrypt
TRAEFIK_ACME_EMAIL=ton-email@gmail.com

# n8n
N8N_ENCRYPTION_KEY=<coller la valeur générée avec openssl>
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<un mot de passe fort>
N8N_API_KEY=<à générer plus tard depuis l'interface n8n>

# AnythingLLM
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
ANYTHINGLLM_AUTH_TOKEN=<coller la valeur générée>

# PostgreSQL
POSTGRES_PASSWORD=<coller la valeur générée>
```

> ⚠️ **IMPORTANT** : NE PAS OUBLIER de remplacer toutes les valeurs !

**Sauvegarder :** `Ctrl+O` → `Enter` → `Ctrl+X`

### 8.4 - Vérifier qu'il ne reste pas de placeholders

```bash
grep -r "__A_REMPLIR__" .env
```

> ✅ Si cette commande ne retourne rien, c'est bon !

### 8.5 - Sécuriser le fichier .env

```bash
chmod 600 .env
```

---

## Étape 9 : Préparation de Traefik

Traefik a besoin d'un fichier `acme.json` pour stocker les certificats SSL.

### 9.1 - Créer le fichier acme.json

```bash
cd /opt/prolex
touch traefik/acme.json
chmod 600 traefik/acme.json
```

> ⚠️ **IMPORTANT** : Les permissions `600` sont obligatoires, sinon Traefik refusera de démarrer.

### 9.2 - Vérifier les permissions

```bash
ls -la traefik/acme.json
```

**Résultat attendu :**
```
-rw------- 1 automatt automatt 0 Nov 22 10:00 traefik/acme.json
```

### 9.3 - Mettre l'email dans traefik.yml

Éditer le fichier `traefik/traefik.yml` :

```bash
nano traefik/traefik.yml
```

Trouver la ligne :

```yaml
email: "mon-email@exemple.com"
```

Remplacer par ton vrai email (le même que dans `.env`) :

```yaml
email: "ton-email@gmail.com"
```

**Sauvegarder :** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## Étape 10 : Lancement de la stack Docker

On est prêt à lancer tous les services !

### 10.1 - Vérifier la configuration Docker Compose

```bash
cd /opt/prolex

# Valider la syntaxe du fichier docker-compose.yml
docker compose config
```

> ✅ Si pas d'erreur, c'est bon !

### 10.2 - Télécharger les images Docker

```bash
# Télécharger toutes les images
docker compose pull
```

> ⏱️ **Temps estimé** : 2-5 minutes (dépend de la connexion)

### 10.3 - Lancer la stack

```bash
# Lancer tous les services en arrière-plan
docker compose up -d
```

> 💡 **Note** : `-d` signifie "detached mode" (mode détaché, en arrière-plan)

### 10.4 - Voir les logs en temps réel

```bash
# Logs de tous les services
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f traefik
docker compose logs -f n8n
docker compose logs -f postgres
```

> **Raccourci clavier** : `Ctrl+C` pour quitter les logs

---

## Étape 11 : Vérification du déploiement

### 11.1 - Vérifier que tous les conteneurs tournent

```bash
docker compose ps
```

**Résultat attendu :** Tous les services doivent être `Up` (en cours d'exécution).

```
NAME                  STATUS
prolex-traefik        Up 2 minutes (healthy)
prolex-n8n            Up 2 minutes (healthy)
prolex-anythingllm    Up 2 minutes (healthy)
prolex-postgres       Up 2 minutes (healthy)
prolex-mcp-n8n        Up 2 minutes (healthy)
```

> ⚠️ Si un service est `Exited` ou `Restarting`, voir les logs : `docker compose logs <nom-service>`

### 11.2 - Vérifier les certificats SSL

```bash
# Attendre 1-2 minutes que Traefik génère les certificats
sleep 60

# Vérifier les logs de Traefik
docker compose logs traefik | grep -i "certificate"
```

**Résultat attendu :**
```
traefik  | time="..." level=info msg="Certificate obtained for domains [n8n.iaproject.cloud]"
traefik  | time="..." level=info msg="Certificate obtained for domains [llm.iaproject.cloud]"
```

### 11.3 - Tester les domaines depuis le VPS

```bash
# Tester n8n
curl -I https://n8n.iaproject.cloud

# Tester AnythingLLM
curl -I https://llm.iaproject.cloud
```

**Résultat attendu :** `HTTP/2 200` ou `HTTP/2 302` (sans erreur SSL)

### 11.4 - Tester depuis ton navigateur

Ouvre ton navigateur et va sur :

- **n8n** : https://n8n.iaproject.cloud
- **AnythingLLM** : https://llm.iaproject.cloud

> ✅ Tu devrais voir les interfaces de connexion, avec un cadenas vert (SSL actif) !

---

## Étape 12 : Configuration post-déploiement

### 12.1 - Configuration initiale de n8n

1. Ouvre https://n8n.iaproject.cloud
2. Crée ton compte admin (premier utilisateur)
3. Va dans **Settings** → **API**
4. Clique sur **Generate API Key**
5. Copie la clé API

### 12.2 - Ajouter la clé API n8n dans .env

```bash
# Sur le VPS
cd /opt/prolex
nano .env
```

Trouver la ligne :

```env
N8N_API_KEY=__A_REMPLIR__
```

Remplacer par la clé API copiée :

```env
N8N_API_KEY=n8n_api_xxxxxxxxxxxxx
```

**Sauvegarder et redémarrer le service MCP :**

```bash
docker compose restart mcp-n8n-server
```

### 12.3 - Configuration initiale d'AnythingLLM

1. Ouvre https://llm.iaproject.cloud
2. Configure ton premier workspace
3. Ajoute les clés API OpenAI / Anthropic dans l'interface

---

## ✅ Déploiement terminé !

**Félicitations Matthieu ! 🎉**

Ton VPS de production est maintenant opérationnel avec :

- ✅ Traefik (reverse proxy + SSL automatique)
- ✅ n8n (workflows)
- ✅ AnythingLLM (agents IA)
- ✅ PostgreSQL (base de données)
- ✅ Serveur MCP pour n8n

---

## 🔧 Commandes utiles

### Gérer les services

```bash
cd /opt/prolex

# Démarrer tous les services
docker compose up -d

# Arrêter tous les services
docker compose down

# Redémarrer un service spécifique
docker compose restart n8n

# Voir les logs
docker compose logs -f

# Voir les conteneurs en cours
docker compose ps

# Mettre à jour les images
docker compose pull
docker compose up -d
```

### Maintenance

```bash
# Espace disque utilisé par Docker
docker system df

# Nettoyer les images inutilisées
docker system prune -a

# Backup de la base de données
docker compose exec postgres pg_dump -U prolex prolex_db > backup/postgres/backup_$(date +%Y%m%d).sql
```

---

## 🆘 En cas de problème

### Les conteneurs ne démarrent pas

```bash
# Voir les logs détaillés
docker compose logs

# Redémarrer la stack complète
docker compose down
docker compose up -d
```

### Problème de certificats SSL

1. Vérifier que les DNS pointent bien vers le VPS :
   ```bash
   nslookup n8n.iaproject.cloud
   nslookup llm.iaproject.cloud
   ```

2. Vérifier les logs Traefik :
   ```bash
   docker compose logs traefik
   ```

3. Vérifier les permissions de `acme.json` :
   ```bash
   ls -la traefik/acme.json
   # Doit être : -rw------- (600)
   ```

### n8n ne se connecte pas à PostgreSQL

```bash
# Vérifier que Postgres tourne
docker compose ps postgres

# Vérifier les logs Postgres
docker compose logs postgres

# Vérifier les credentials dans .env
cat .env | grep POSTGRES
```

---

## 📚 Documentation supplémentaire

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée du projet
- [SECURITY.md](./SECURITY.md) - Guide de sécurité et fail2ban
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [n8n Documentation](https://docs.n8n.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Bon déploiement ! 🚀**
