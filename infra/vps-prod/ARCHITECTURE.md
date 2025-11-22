# 🏗️ Architecture VPS Production - Prolex

## 📂 Arborescence du projet

```
/opt/prolex/                          # Racine de la stack Docker sur le VPS
│
├── docker-compose.yml                # Orchestration de tous les services
├── .env                              # Variables d'environnement (NON versionné, créé à partir de .env.example)
├── .env.example                      # Template des variables d'environnement
│
├── traefik/                          # Configuration du reverse proxy
│   ├── traefik.yml                   # Configuration statique de Traefik
│   └── acme.json                     # Certificats SSL Let's Encrypt (créé automatiquement, chmod 600)
│
├── n8n/                              # Données de n8n
│   └── data/                         # Workflows, credentials, settings (persistant)
│
├── anythingllm/                      # Données AnythingLLM
│   └── data/                         # Documents, embeddings, configurations (persistant)
│
├── mcp/                              # Serveurs MCP (Model Context Protocol)
│   └── n8n-server/                   # Code du serveur MCP pour n8n
│       ├── Dockerfile                # Image Docker du serveur MCP
│       ├── package.json              # Dépendances NodeJS
│       ├── src/                      # Code source TypeScript/JavaScript
│       └── ...                       # Autres fichiers du projet MCP
│
├── postgres/                         # Données PostgreSQL (créé automatiquement)
│   └── data/                         # Base de données n8n (persistant)
│
├── redis/                            # Données Redis (créé automatiquement)
│   └── data/                         # Cache et queues (persistant)
│
├── logs/                             # Logs centralisés
│   ├── traefik/                      # Logs du reverse proxy
│   ├── n8n/                          # Logs de n8n
│   └── anythingllm/                  # Logs d'AnythingLLM
│
└── backup/                           # Sauvegardes manuelles ou automatiques
    ├── postgres/                     # Dumps SQL de la base
    ├── n8n/                          # Backup des données n8n
    └── anythingllm/                  # Backup des données AnythingLLM
```

---

## 🎯 Rôle de chaque service

### 1. **Traefik** (Reverse Proxy + SSL)
- **Rôle** : Point d'entrée unique pour toutes les requêtes HTTP/HTTPS
- **Fonctionnalités** :
  - Reverse proxy automatique (détecte les conteneurs Docker)
  - Génération automatique des certificats SSL via Let's Encrypt
  - Redirection HTTP → HTTPS
  - Load balancing si besoin
- **Ports** :
  - `80` (HTTP) → redirige vers HTTPS
  - `443` (HTTPS) → proxy vers les services
- **Domaines exposés** :
  - `n8n.iaproject.cloud` → service n8n
  - `llm.iaproject.cloud` → service AnythingLLM

---

### 2. **n8n** (Workflow Automation)
- **Rôle** : Orchestrateur de workflows (automatisations, intégrations API)
- **Base de données** : PostgreSQL (recommandé pour la production)
- **Volume persistant** : `./n8n/data` → `/home/node/.n8n`
- **Variables importantes** :
  - `N8N_ENCRYPTION_KEY` : Clé pour chiffrer les credentials
  - `N8N_HOST` : Domaine public (n8n.iaproject.cloud)
  - `N8N_PROTOCOL` : https
  - `DB_TYPE`, `DB_POSTGRESDB_*` : Configuration PostgreSQL

---

### 3. **AnythingLLM** (Plateforme d'agents IA)
- **Rôle** : Interface pour gérer des agents IA, documents, embeddings
- **Volume persistant** : `./anythingllm/data` → `/app/server/storage`
- **Variables importantes** :
  - `OPENAI_API_KEY` : Clé API pour les modèles OpenAI
  - `LLM_PROVIDER` : Provider LLM (openai, anthropic, etc.)

---

### 4. **MCP n8n Server** (Model Context Protocol)
- **Rôle** : Serveur MCP qui permet à n8n de communiquer avec des modèles IA via MCP
- **Build** : Image construite à partir du code dans `./mcp/n8n-server/`
- **Réseau** : Connecté à `prolex-net` pour communiquer avec n8n
- **Variables importantes** :
  - `N8N_API_BASE_URL` : URL de n8n (https://n8n.iaproject.cloud)
  - `N8N_API_KEY` : Clé API pour appeler n8n

---

### 5. **PostgreSQL** (Base de données)
- **Rôle** : Base de données relationnelle pour n8n
- **Avantages vs SQLite** :
  - ✅ Plus robuste en production
  - ✅ Meilleure gestion de la concurrence
  - ✅ Backups plus faciles (`pg_dump`)
  - ✅ Scalabilité future
- **Volume persistant** : `./postgres/data` → `/var/lib/postgresql/data`
- **Variables importantes** :
  - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

---

### 6. **Redis** (Cache & Queues) - OPTIONNEL
- **Rôle** :
  - Cache pour améliorer les performances
  - Gestion des queues pour les workflows n8n
- **Quand l'activer ?** :
  - Si tu as beaucoup de workflows simultanés
  - Si tu veux un système de queue robuste
  - Pour améliorer les temps de réponse
- **Volume persistant** : `./redis/data` → `/data`

**💡 Redis est commenté par défaut, tu peux l'activer plus tard si nécessaire.**

---

## 🔒 Sécurité

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (Traefik)
sudo ufw allow 443/tcp     # HTTPS (Traefik)
sudo ufw enable
```

### Fail2ban (Protection SSH)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Secrets
- ⚠️ **TOUS les secrets sont dans `.env`** (NON versionné)
- Le fichier `.env.example` contient des placeholders
- **Génération de secrets sécurisés** :
  ```bash
  # Pour N8N_ENCRYPTION_KEY (32 caractères)
  openssl rand -base64 32

  # Pour POSTGRES_PASSWORD
  openssl rand -base64 24
  ```

---

## 🚀 Déploiement

1. **Connexion SSH** : `ssh root@72.61.107.144`
2. **Création utilisateur** : `automatt`
3. **Installation Docker** + Docker Compose
4. **Copie des fichiers** dans `/opt/prolex/`
5. **Configuration** : Créer `.env` à partir de `.env.example`
6. **Lancement** : `docker compose up -d`

📖 Voir `DEPLOY.md` pour le guide complet étape par étape.

---

## 📊 Monitoring

### Vérifier les services
```bash
cd /opt/prolex
docker compose ps              # État des conteneurs
docker compose logs -f         # Logs en temps réel
docker compose logs traefik    # Logs Traefik
docker compose logs n8n        # Logs n8n
```

### Vérifier les certificats SSL
```bash
# Les certificats sont dans traefik/acme.json
docker compose logs traefik | grep -i "certificate"
```

### Tester les domaines
```bash
curl -I https://n8n.iaproject.cloud
curl -I https://llm.iaproject.cloud
```

---

## 💾 Sauvegardes

### Backup PostgreSQL
```bash
# Backup manuel
docker compose exec postgres pg_dump -U prolex prolex_db > backup/postgres/backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
docker compose exec -T postgres psql -U prolex prolex_db < backup/postgres/backup_XXXXXXXX.sql
```

### Backup n8n
```bash
# Copier le dossier data
tar -czf backup/n8n/n8n_data_$(date +%Y%m%d_%H%M%S).tar.gz n8n/data/
```

### Backup AnythingLLM
```bash
tar -czf backup/anythingllm/llm_data_$(date +%Y%m%d_%H%M%S).tar.gz anythingllm/data/
```

---

## 🔄 Mises à jour

### Mettre à jour un service
```bash
cd /opt/prolex
docker compose pull n8n              # Télécharger la nouvelle image
docker compose up -d n8n             # Recréer le conteneur
docker compose logs -f n8n           # Vérifier les logs
```

### Mettre à jour tous les services
```bash
docker compose pull
docker compose up -d
```

---

## 🆘 Dépannage

### Les conteneurs ne démarrent pas
```bash
docker compose logs        # Voir les erreurs
docker compose ps -a       # Voir tous les conteneurs (même arrêtés)
```

### Problème de certificats SSL
1. Vérifier que `acme.json` existe et a les droits `600`
2. Vérifier que le domaine pointe bien vers l'IP du VPS
3. Vérifier les logs Traefik : `docker compose logs traefik`

### n8n ne se connecte pas à Postgres
1. Vérifier que Postgres est démarré : `docker compose ps postgres`
2. Vérifier les credentials dans `.env`
3. Vérifier les logs : `docker compose logs postgres`

---

## 📚 Ressources

- **Traefik** : https://doc.traefik.io/traefik/
- **n8n** : https://docs.n8n.io/
- **AnythingLLM** : https://docs.anythingllm.com/
- **Docker Compose** : https://docs.docker.com/compose/
- **Let's Encrypt** : https://letsencrypt.org/
