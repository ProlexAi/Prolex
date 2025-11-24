# 🏗️ Prolex Infrastructure

> **Infrastructure as Code - VPS, Docker, Kubernetes, CI/CD**
> **Repository**: `ProlexAi/prolex-infra`
> **Visibilité**: 🔒 PRIVÉ
> **Technologies**: Terraform, Docker, Ansible, Traefik

---

## 🎯 Vue d'ensemble

**Prolex Infra** gère toute l'infrastructure:
- Infrastructure as Code (Terraform)
- Docker Compose pour tous services
- Scripts de déploiement et maintenance
- Monitoring (Prometheus + Grafana)
- Backups automatiques
- Configuration serveurs (Ansible)

**Environnements**:
- **Development**: Local (Docker Compose)
- **Staging**: VPS staging
- **Production**: VPS production (Automatt.ai)

---

## 🎭 Rôle et responsabilités

### Responsabilités principales

1. **Infrastructure as Code**: Terraform pour provisionning
2. **Containerization**: Docker + Docker Compose
3. **Reverse Proxy**: Traefik (SSL, routing)
4. **Déploiement**: Scripts automatisés + CI/CD
5. **Monitoring**: Prometheus, Grafana, AlertManager
6. **Backups**: Quotidiens (DB, volumes, configs)
7. **Security**: Firewall, SSL, secrets management

---

## 🧠 Pour les IA développeurs

### Quoi coder ici

- [x] **Terraform** (`terraform/`)
  - VPS provisioning
  - Network configuration
  - DNS records
  - Monitoring setup

- [x] **Docker** (`docker/`)
  - `docker-compose.production.yml`
  - `docker-compose.staging.yml`
  - `docker-compose.development.yml`
  - Dockerfiles pour chaque service

- [x] **Scripts** (`scripts/`)
  - `bootstrap-vps.sh` - Setup VPS from scratch
  - `deploy-prolex.sh` - Deploy stack complet
  - `backup-all.sh` - Backup complet
  - `restore-from-backup.sh` - Restore backup
  - `update-ssl.sh` - Renouvellement SSL
  - `monitoring-setup.sh` - Setup monitoring

- [x] **Ansible** (`ansible/`)
  - Playbooks configuration serveurs
  - Roles (nginx, docker, monitoring, etc.)
  - Inventory (dev, staging, prod)

- [x] **Monitoring** (`monitoring/`)
  - Prometheus config
  - Grafana dashboards
  - AlertManager rules

### Où coder

```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── modules/
│   ├── vps/
│   ├── network/
│   └── monitoring/
└── environments/
    ├── production/
    ├── staging/
    └── development/

docker/
├── docker-compose.production.yml
├── docker-compose.staging.yml
├── docker-compose.development.yml
├── services/
│   ├── prolex-core/
│   │   └── Dockerfile
│   ├── prolex-kimmy/
│   │   └── Dockerfile
│   ├── prolex-rag/
│   │   └── Dockerfile
│   ├── n8n/
│   │   └── Dockerfile
│   ├── postgres/
│   ├── redis/
│   ├── chromadb/
│   └── traefik/
│       └── traefik.yml
└── volumes/

scripts/
├── bootstrap-vps.sh
├── deploy-prolex.sh
├── backup-all.sh
├── restore-from-backup.sh
├── update-ssl.sh
└── monitoring-setup.sh

ansible/
├── playbooks/
│   ├── setup-vps.yml
│   ├── deploy-app.yml
│   ├── security-hardening.yml
│   └── backup-setup.yml
├── roles/
│   ├── common/
│   ├── docker/
│   ├── nginx/
│   └── monitoring/
└── inventory/
    ├── development
    ├── staging
    └── production

monitoring/
├── prometheus/
│   ├── prometheus.yml
│   └── rules/
├── grafana/
│   ├── dashboards/
│   │   ├── prolex-overview.json
│   │   ├── n8n-monitoring.json
│   │   └── system-metrics.json
│   └── provisioning/
└── alertmanager/
    └── alerts.yml
```

### Comment coder

**Infrastructure as Code**:
```hcl
# terraform/environments/production/main.tf
module "vps" {
  source = "../../modules/vps"

  provider_name = "hetzner"
  server_type   = "cx21"
  location      = "nbg1"
  image         = "ubuntu-22.04"

  tags = {
    environment = "production"
    project     = "prolex"
  }
}
```

**Docker Compose**:
```yaml
# docker/docker-compose.production.yml
version: '3.8'

services:
  prolex-core:
    image: registry.automatt.ai/prolex-core:latest
    env_file: .env.production
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prolex.rule=Host(`prolex.automatt.ai`)"
```

---

## 🏗️ Architecture Production

```
┌──────────────────────────────────────────────────┐
│             Internet                             │
└─────────────────┬────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────┐
│             Traefik (Reverse Proxy)              │
│     - SSL termination (Let's Encrypt)            │
│     - Routing (domains → services)               │
│     - Load balancing                             │
└──────┬──────────┬──────────┬──────────┬──────────┘
       │          │          │          │
   ┌───▼──┐   ┌──▼───┐  ┌───▼────┐  ┌──▼─────┐
   │Prolex│   │Kimmy │  │  n8n   │  │  RAG   │
   │ Core │   │      │  │        │  │        │
   └───┬──┘   └──┬───┘  └───┬────┘  └──┬─────┘
       │         │          │           │
   ┌───▼─────────▼──────────▼───────────▼──────┐
   │            PostgreSQL                       │
   └─────────────────────────────────────────────┘
   ┌─────────────────────────────────────────────┐
   │            Redis (Cache)                     │
   └─────────────────────────────────────────────┘
   ┌─────────────────────────────────────────────┐
   │            ChromaDB (Vector Store)           │
   └─────────────────────────────────────────────┘
```

### Services déployés

| Service | Port | Domain | Container |
|---------|------|--------|-----------|
| Prolex Core | 3000 | prolex.automatt.ai | prolex-core |
| Kimmy | 3001 | kimmy.automatt.ai | prolex-kimmy |
| n8n | 5678 | n8n.automatt.ai | n8n |
| RAG API | 3003 | rag.automatt.ai | prolex-rag |
| PostgreSQL | 5432 | - | postgres |
| Redis | 6379 | - | redis |
| ChromaDB | 8000 | - | chromadb |
| Traefik | 80/443 | - | traefik |
| Prometheus | 9090 | metrics.automatt.ai | prometheus |
| Grafana | 3001 | grafana.automatt.ai | grafana |

---

## 🚀 Déploiement

### Initial setup (VPS from scratch)

```bash
# 1. Provision VPS avec Terraform
cd terraform/environments/production
terraform init
terraform plan
terraform apply

# 2. Bootstrap VPS (Docker, configs, firewall)
cd ../../../scripts
./bootstrap-vps.sh production

# 3. Deploy Prolex stack
./deploy-prolex.sh production

# 4. Setup monitoring
./monitoring-setup.sh

# 5. Setup backups
./backup-setup.sh
```

---

### Deploy update (code change)

```bash
# Option 1: CI/CD automatique (GitHub Actions)
# Push sur main → build images → deploy production

# Option 2: Manuel
cd scripts
./deploy-prolex.sh production --service prolex-core
```

---

### Rollback

```bash
# Rollback to previous version
./deploy-prolex.sh production --rollback
```

---

## 🔧 Scripts principaux

### `bootstrap-vps.sh`

**Description**: Setup VPS from scratch

**Actions**:
1. Update system packages
2. Install Docker + Docker Compose
3. Setup firewall (ufw)
4. Configure SSH (disable password, key only)
5. Install monitoring agent
6. Create users and permissions
7. Setup swap

**Usage**:
```bash
./bootstrap-vps.sh production
```

---

### `deploy-prolex.sh`

**Description**: Deploy/update Prolex stack

**Actions**:
1. Pull latest images from registry
2. Stop old containers
3. Start new containers
4. Run migrations
5. Health checks
6. Cleanup old images

**Usage**:
```bash
# Deploy all
./deploy-prolex.sh production

# Deploy specific service
./deploy-prolex.sh production --service prolex-core

# Dry-run
./deploy-prolex.sh production --dry-run
```

---

### `backup-all.sh`

**Description**: Backup complet système

**Actions**:
1. Backup PostgreSQL (pg_dump)
2. Backup volumes Docker
3. Backup configs (/etc/prolex/)
4. Backup n8n workflows
5. Upload to S3/Google Cloud Storage
6. Rotation (keep 7 daily, 4 weekly, 12 monthly)

**Usage**:
```bash
# Backup now
./backup-all.sh

# Cron (daily 3 AM)
0 3 * * * /opt/prolex/scripts/backup-all.sh >> /var/log/prolex-backup.log 2>&1
```

---

### `restore-from-backup.sh`

**Description**: Restore from backup

**Usage**:
```bash
# List backups
./restore-from-backup.sh --list

# Restore latest
./restore-from-backup.sh --latest

# Restore specific date
./restore-from-backup.sh --date 2025-11-24
```

---

## 📊 Monitoring

### Prometheus

**Metrics collectées**:
- System metrics (CPU, RAM, disk, network)
- Docker metrics (containers, images)
- Application metrics (requests, latency, errors)
- n8n metrics (workflow executions, success rate)

**Config**: `monitoring/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prolex-core'
    static_configs:
      - targets: ['prolex-core:3000']

  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

---

### Grafana Dashboards

**Dashboards disponibles**:

1. **Prolex Overview**
   - Total requests
   - Success rate
   - Average latency
   - Costs (USD)
   - Autonomy level usage

2. **n8n Monitoring**
   - Workflow executions
   - Success/failure rate
   - Execution time
   - Queue depth

3. **System Metrics**
   - CPU usage
   - RAM usage
   - Disk I/O
   - Network traffic

**Access**: https://grafana.automatt.ai

---

### Alerts (AlertManager)

**Alertes configurées**:

```yaml
# monitoring/alertmanager/alerts.yml
groups:
  - name: prolex
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="5xx"}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate on Prolex"
          description: "Error rate > 5% for 5 minutes"

      - alert: HighCPU
        expr: node_cpu_usage > 80
        for: 10m
        annotations:
          summary: "High CPU usage"

      - alert: DiskSpaceLow
        expr: node_disk_free_percent < 20
        annotations:
          summary: "Disk space < 20%"
```

**Notifications**:
- Telegram
- Email
- Slack (optionnel)

---

## 🔒 Sécurité

### Firewall (ufw)

```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### SSL/TLS

**Let's Encrypt** via Traefik (renouvellement automatique)

```yaml
# traefik.yml
certificatesResolvers:
  letsencrypt:
    acme:
      email: matthieu@automatt.ai
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

### Secrets Management

**Option 1**: `.env` files (gitignored)
**Option 2**: HashiCorp Vault (future)
**Option 3**: Docker secrets

```bash
# Create secret
echo "my-secret-value" | docker secret create db_password -

# Use in docker-compose
services:
  postgres:
    secrets:
      - db_password
```

---

## 🔄 CI/CD (GitHub Actions)

### `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker build -t registry.automatt.ai/prolex-core:latest \
            -f docker/services/prolex-core/Dockerfile .

      - name: Push to registry
        run: docker push registry.automatt.ai/prolex-core:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/prolex
            ./scripts/deploy-prolex.sh production
```

---

## 📚 Documentation

- [VPS Setup Guide](docs/VPS_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Backup & Restore](docs/BACKUP_RESTORE.md)
- [Monitoring Guide](docs/MONITORING.md)
- [Security Hardening](docs/SECURITY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

---

## 📄 License

Propriétaire - Automatt.ai © 2025
