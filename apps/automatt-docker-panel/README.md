# 🐳 Dashboard Docker Automatt

**Interface web simple et élégante pour gérer vos conteneurs Docker**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-20.x-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 Table des matières

- [Description](#-description)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
  - [Installation locale (sans Docker)](#installation-locale-sans-docker)
  - [Installation avec Docker Compose](#installation-avec-docker-compose)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Sécurité](#-sécurité)
- [API Documentation](#-api-documentation)
- [Développement](#-développement)
- [Limitations et évolutions](#-limitations-et-évolutions-futures)
- [Troubleshooting](#-troubleshooting)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 Description

**Dashboard Docker Automatt** est une application web pédagogique qui vous permet de visualiser et gérer vos conteneurs Docker directement depuis votre navigateur.

Cette application est conçue pour être :
- ✨ **Simple** : Interface claire et intuitive
- 🎓 **Pédagogique** : Code abondamment commenté pour faciliter l'apprentissage
- 🔒 **Sécurisée** : Authentification optionnelle et contrôles d'accès
- 🚀 **Rapide** : TypeScript + Express pour des performances optimales
- 📦 **Portable** : Fonctionne en local et sur VPS grâce à Docker

---

## ✨ Fonctionnalités

### 🔍 Visualisation

- **Liste des conteneurs** : Vue d'ensemble de tous vos conteneurs (actifs, arrêtés, en pause)
- **Détails complets** : Informations détaillées sur chaque conteneur (ID, image, réseau, ports, etc.)
- **Logs en temps réel** : Consultation des logs stdout/stderr
- **Statistiques** : Nombre total de conteneurs, conteneurs actifs, arrêtés, etc.

### ⚙️ Gestion

- **Démarrer** un conteneur arrêté
- **Arrêter** un conteneur en cours d'exécution
- **Redémarrer** un conteneur
- **Supprimer** un conteneur (avec confirmation)

### 🎁 BONUS : Exécution de commandes

- **Exécuter des commandes shell** dans un conteneur depuis l'interface web
- Affichage de stdout et stderr
- **Désactivable** via variable d'environnement pour plus de sécurité

---

## 🧱 Stack technique

### Backend

- **Node.js 20** : Runtime JavaScript
- **Express** : Framework web minimaliste
- **TypeScript** : Pour la sécurité des types et une meilleure DX
- **Dockerode** : Client Docker pour Node.js (communication via socket Docker)

### Frontend

- **EJS** : Moteur de templates pour générer du HTML dynamique côté serveur
- **Bootstrap 5** : Framework CSS responsive (chargé via CDN)
- **Bootstrap Icons** : Icônes modernes
- **JavaScript vanilla** : Pour les interactions client-side (fetch API)

### DevOps

- **Docker** : Containerisation de l'application
- **Docker Compose** : Orchestration simplifiée
- **Multi-stage builds** : Optimisation de la taille de l'image

---

## 📦 Prérequis

### Pour utilisation locale (sans Docker)

- **Node.js 20+** ([télécharger](https://nodejs.org/))
- **npm** ou **yarn**
- **Docker** installé et en cours d'exécution ([Docker Desktop](https://www.docker.com/products/docker-desktop) pour Windows/Mac)
- Accès au socket Docker (`/var/run/docker.sock` sur Linux/WSL)

### Pour utilisation avec Docker

- **Docker 20+** ([installer](https://docs.docker.com/get-docker/))
- **Docker Compose** (inclus dans Docker Desktop)

---

## 🚀 Installation

### Installation locale (sans Docker)

Cette méthode est recommandée pour le développement.

```bash
# 1. Cloner le repository
git clone https://github.com/ProlexAi/Prolex.git
cd Prolex/apps/automatt-docker-panel

# 2. Installer les dépendances
npm install

# 3. (Optionnel) Configurer les variables d'environnement
# Copier le fichier d'exemple et l'éditer
cp .env.example .env
# Éditer .env avec votre éditeur préféré

# 4. En développement (avec hot-reload)
npm run dev

# OU

# 4. En production (compiler puis lancer)
npm run build
npm start
```

L'application sera accessible sur **http://localhost:8080**

### Installation avec Docker Compose

Cette méthode est recommandée pour la production ou un déploiement sur VPS.

```bash
# 1. Cloner le repository
git clone https://github.com/ProlexAi/Prolex.git
cd Prolex/apps/automatt-docker-panel

# 2. Créer votre fichier docker-compose.yml depuis l'exemple
cp docker-compose.example.yml docker-compose.yml

# 3. IMPORTANT : Éditer docker-compose.yml
# - Changer DASHBOARD_BASIC_AUTH_TOKEN avec un token fort
# - Ajuster les autres variables si nécessaire
nano docker-compose.yml  # ou vim, code, etc.

# 4. Construire et lancer l'application
docker-compose up -d

# 5. Voir les logs
docker-compose logs -f automatt-docker-panel

# 6. Vérifier le statut
docker-compose ps
```

L'application sera accessible sur **http://localhost:8080** (ou le port que vous avez configuré)

---

## ⚙️ Configuration

### Variables d'environnement

Toutes les variables peuvent être configurées via un fichier `.env` ou directement dans `docker-compose.yml`.

| Variable | Description | Défaut | Obligatoire |
|----------|-------------|--------|-------------|
| `PORT` | Port d'écoute du serveur | `8080` | Non |
| `HOST` | Host d'écoute | `0.0.0.0` | Non |
| `NODE_ENV` | Environnement (development/production) | `development` | Non |
| `DASHBOARD_BASIC_AUTH_TOKEN` | Token d'authentification Bearer | `undefined` | **OUI (production)** |
| `DISABLE_EXEC` | Désactiver l'exécution de commandes (1=oui, 0=non) | `0` | **OUI (production)** |
| `DOCKER_SOCKET` | Chemin vers le socket Docker | `/var/run/docker.sock` | Non |

### Exemple de fichier .env

```bash
# Configuration de base
PORT=8080
HOST=0.0.0.0
NODE_ENV=production

# Sécurité - Authentification
# ⚠️ IMPORTANT : Changer ce token !
DASHBOARD_BASIC_AUTH_TOKEN=mon_token_super_secret_123456789

# Sécurité - Désactiver exec en production
DISABLE_EXEC=1

# Docker socket (généralement pas besoin de changer)
DOCKER_SOCKET=/var/run/docker.sock
```

---

## 🎮 Utilisation

### Interface web

1. **Page d'accueil** (`/`) : Liste de tous les conteneurs
   - Cliquez sur "Détails" pour voir un conteneur spécifique

2. **Page de détail** (`/container/:id`) : Détails d'un conteneur
   - Voir toutes les informations (ID, image, réseau, ports, etc.)
   - Consulter les logs
   - Effectuer des actions (démarrer, arrêter, redémarrer)
   - Exécuter des commandes (si activé)

3. **Health check** (`/health`) : Vérifier que l'API est en ligne

### API REST

#### Authentification

Si `DASHBOARD_BASIC_AUTH_TOKEN` est défini, toutes les requêtes doivent inclure le header :

```bash
Authorization: Bearer <votre_token>
```

Exemple avec curl :

```bash
curl -H "Authorization: Bearer mon_token_super_secret_123456789" \
     http://localhost:8080/api/containers
```

#### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/containers` | Liste tous les conteneurs |
| `GET` | `/api/containers/:id` | Détails d'un conteneur |
| `GET` | `/api/containers/:id/logs?tail=100` | Logs d'un conteneur |
| `POST` | `/api/containers/:id/start` | Démarrer un conteneur |
| `POST` | `/api/containers/:id/stop` | Arrêter un conteneur |
| `POST` | `/api/containers/:id/restart` | Redémarrer un conteneur |
| `POST` | `/api/containers/:id/exec` | Exécuter une commande (si DISABLE_EXEC=0) |
| `GET` | `/health` | Health check |

#### Exemples de requêtes

**Lister tous les conteneurs :**

```bash
curl http://localhost:8080/api/containers
```

**Démarrer un conteneur :**

```bash
curl -X POST http://localhost:8080/api/containers/my_container/start
```

**Exécuter une commande :**

```bash
curl -X POST http://localhost:8080/api/containers/my_container/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la /app"}'
```

---

## 🔒 Sécurité

### ⚠️ ATTENTION : Montage du socket Docker

Le montage de `/var/run/docker.sock` donne un **contrôle COMPLET** sur Docker. Cela signifie que toute personne ayant accès à cette application peut :

- Créer, modifier, supprimer des conteneurs
- Accéder aux logs et fichiers des conteneurs
- Potentiellement escalader des privilèges sur l'hôte

### 🛡️ Bonnes pratiques de sécurité

#### En développement (local)

✅ **Acceptable** :
- Pas d'authentification (`DASHBOARD_BASIC_AUTH_TOKEN` non défini)
- `DISABLE_EXEC=0` (fonctionnalité exec activée)
- Accès uniquement depuis localhost

#### En production (VPS / serveur)

✅ **OBLIGATOIRE** :
- ✅ Définir `DASHBOARD_BASIC_AUTH_TOKEN` avec un token fort (min 32 caractères aléatoires)
- ✅ Définir `DISABLE_EXEC=1`
- ✅ Utiliser un reverse proxy avec HTTPS (Traefik, Nginx, Caddy)
- ✅ Restreindre l'accès réseau (firewall, IP whitelisting)
- ✅ Monitorer les logs de l'application
- ✅ Garder Docker et l'application à jour

❌ **À NE JAMAIS FAIRE** :
- ❌ Exposer directement sur Internet sans authentification
- ❌ Utiliser HTTP en production (toujours HTTPS)
- ❌ Partager le token d'authentification
- ❌ Laisser `DISABLE_EXEC=0` en production

### Exemple de configuration Traefik

Ajoutez ces labels dans votre `docker-compose.yml` :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.docker-dashboard.rule=Host(`docker.example.com`)"
  - "traefik.http.routers.docker-dashboard.entrypoints=websecure"
  - "traefik.http.routers.docker-dashboard.tls=true"
  - "traefik.http.routers.docker-dashboard.tls.certresolver=letsencrypt"
  - "traefik.http.services.docker-dashboard.loadbalancer.server.port=8080"
```

---

## 📚 API Documentation

### Format des réponses

Toutes les réponses API sont au format JSON.

#### Succès

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Erreur

```json
{
  "error": "Error type",
  "message": "Descriptive error message"
}
```

### Codes de statut HTTP

- `200` : Succès
- `400` : Requête invalide (mauvais paramètres)
- `401` : Non authentifié (token manquant)
- `403` : Non autorisé (token invalide ou fonctionnalité désactivée)
- `404` : Ressource non trouvée
- `500` : Erreur serveur

---

## 🛠️ Développement

### Structure du projet

```
automatt-docker-panel/
├── src/
│   ├── server.ts              # Point d'entrée principal
│   ├── dockerClient.ts        # Client Docker (dockerode)
│   ├── routes/
│   │   └── containers.ts      # Routes API pour les conteneurs
│   ├── middlewares/
│   │   └── auth.ts            # Middleware d'authentification
│   └── views/
│       ├── layout.ejs         # Template de base
│       ├── index.ejs          # Page d'accueil
│       ├── container.ejs      # Page de détail d'un conteneur
│       └── error.ejs          # Page d'erreur
├── public/
│   └── css/                   # CSS personnalisé (si nécessaire)
├── dist/                      # Code compilé (généré par tsc)
├── package.json               # Dépendances et scripts npm
├── tsconfig.json              # Configuration TypeScript
├── Dockerfile                 # Image Docker
├── docker-compose.example.yml # Exemple Docker Compose
└── README.md                  # Ce fichier
```

### Scripts npm disponibles

```bash
# Développement avec hot-reload
npm run dev

# Compiler TypeScript → JavaScript
npm run build

# Lancer en production (après build)
npm start

# Nettoyer le dossier dist/
npm run clean
```

### Modifier le code

1. **Backend** : Modifier les fichiers dans `src/`
2. **Frontend** : Modifier les vues EJS dans `src/views/`
3. **Styles** : Modifier le CSS inline dans les vues (ou créer des fichiers dans `public/css/`)

Avec `npm run dev`, les changements sont détectés automatiquement grâce à **nodemon**.

---

## 🔮 Limitations et évolutions futures

### Limitations actuelles

- ❌ Pas de terminal interactif (seulement exécution de commandes simples)
- ❌ Pas de gestion des images Docker
- ❌ Pas de gestion des volumes
- ❌ Pas de gestion des réseaux
- ❌ Pas de multi-utilisateurs
- ❌ Pas de filtres/recherche avancée

### Évolutions possibles

- ✨ **Terminal web interactif** avec [xterm.js](https://xtermjs.org/) + WebSocket
- ✨ **Gestion des images** : pull, build, push, supprimer
- ✨ **Gestion des volumes** : créer, supprimer, inspecter
- ✨ **Gestion des réseaux** : créer, supprimer, connecter des conteneurs
- ✨ **Filtres et recherche** : par nom, image, statut
- ✨ **Statistiques temps réel** : CPU, RAM, réseau par conteneur
- ✨ **Multi-utilisateurs** : Authentification avec base de données
- ✨ **Intégration Docker Compose** : Gérer des stacks complètes
- ✨ **Notifications** : Alertes en cas d'erreur ou arrêt de conteneur
- ✨ **Dark mode** 🌙

### Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request

---

## 🐛 Troubleshooting

### Erreur : "Cannot connect to Docker daemon"

**Cause** : Le socket Docker n'est pas accessible.

**Solutions** :
```bash
# Vérifier que Docker est en cours d'exécution
docker ps

# Sur Linux : vérifier les permissions du socket
ls -l /var/run/docker.sock

# Si nécessaire, ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
# Puis redémarrer votre session
```

### Erreur : "Port already in use"

**Cause** : Le port 8080 est déjà utilisé.

**Solutions** :
```bash
# Changer le port dans .env
PORT=3000

# OU dans docker-compose.yml
ports:
  - "3000:8080"  # Port hôte:Port conteneur
```

### L'authentification ne fonctionne pas

**Cause** : Token mal configuré ou header incorrect.

**Solutions** :
```bash
# Vérifier que DASHBOARD_BASIC_AUTH_TOKEN est défini
echo $DASHBOARD_BASIC_AUTH_TOKEN

# Vérifier le format du header
# CORRECT :
Authorization: Bearer mon_token_secret

# INCORRECT :
Authorization: mon_token_secret
```

### Les logs ne s'affichent pas

**Cause** : Le conteneur n'a pas de logs ou ils sont trop anciens.

**Solutions** :
- Vérifier que le conteneur a bien des logs : `docker logs <container_id>`
- Augmenter le nombre de lignes affichées (paramètre `tail`)

### Permission denied sur /var/run/docker.sock

**Cause** : Permissions insuffisantes.

**Solutions** :
```bash
# Sur Linux : ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer Docker
sudo systemctl restart docker

# Dans docker-compose.yml : changer le mode de montage
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:rw  # au lieu de :ro
```

---

## 📄 Licence

Ce projet est sous licence **MIT**.

Vous êtes libre de :
- ✅ Utiliser ce code pour des projets personnels ou commerciaux
- ✅ Modifier le code
- ✅ Distribuer le code
- ✅ Vendre des versions modifiées

Conditions :
- 📝 Inclure la licence originale et les copyrights

---

## 👤 Auteur

**Automatt.ai**
- GitHub: [@ProlexAi](https://github.com/ProlexAi)

---

## 🙏 Remerciements

- [Dockerode](https://github.com/apocas/dockerode) pour l'excellente librairie Docker
- [Express](https://expressjs.com/) pour le framework web
- [Bootstrap](https://getbootstrap.com/) pour le framework CSS
- La communauté Docker pour la documentation

---

## 📞 Support

Si vous rencontrez des problèmes ou avez des questions :

1. Consultez la section [Troubleshooting](#-troubleshooting)
2. Ouvrez une [issue sur GitHub](https://github.com/ProlexAi/Prolex/issues)
3. Consultez la [documentation Docker](https://docs.docker.com/)

---

**Happy Dockering! 🐳**
