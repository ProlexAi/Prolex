#!/bin/bash

################################################################################
# Script: bootstrap_vps.sh
# Description: Installation complète et automatisée d'un VPS Ubuntu vierge
#              pour héberger la stack Prolex (n8n, AnythingLLM, MCP, Traefik)
# Auteur: Architecte DevOps Prolex
# Usage: sudo ./bootstrap_vps.sh
################################################################################

set -e  # Arrêter le script en cas d'erreur

################################################################################
# VARIABLES DE CONFIGURATION
# Modifiez ces variables selon vos besoins avant d'exécuter le script
################################################################################

# Nom de l'utilisateur non-root à créer
NEW_USER="automatt"

# Chemin racine du projet sur le VPS
PROJECT_ROOT="/opt/prolex"

# URL du dépôt Git
GIT_REPO_URL="https://github.com/ProlexAi/Prolex.git"

# Branche à cloner
BRANCH="main"

# Domaine principal (utilisé pour les configs)
DOMAIN="${DOMAIN:-example.com}"

################################################################################
# COULEURS POUR L'AFFICHAGE
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# FONCTIONS UTILITAIRES
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Ce script doit être exécuté en tant que root (sudo)"
        exit 1
    fi
}

################################################################################
# DÉBUT DU SCRIPT
################################################################################

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 BOOTSTRAP VPS PROLEX - Installation automatisée"
echo "════════════════════════════════════════════════════════════════"
echo ""

check_root

log_info "Configuration:"
echo "  - Utilisateur: ${NEW_USER}"
echo "  - Projet: ${PROJECT_ROOT}"
echo "  - Dépôt: ${GIT_REPO_URL}"
echo "  - Branche: ${BRANCH}"
echo ""

read -p "Voulez-vous continuer avec cette configuration ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Installation annulée par l'utilisateur"
    exit 0
fi

################################################################################
# ÉTAPE 1: Mise à jour du système
################################################################################

log_info "ÉTAPE 1/9 : Mise à jour du système..."
apt update -qq
apt upgrade -y -qq
log_success "Système mis à jour"

################################################################################
# ÉTAPE 2: Installation des paquets de base
################################################################################

log_info "ÉTAPE 2/9 : Installation des paquets de base..."
apt install -y -qq \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    vim \
    zip \
    unzip
log_success "Paquets de base installés"

################################################################################
# ÉTAPE 3: Création de l'utilisateur non-root
################################################################################

log_info "ÉTAPE 3/9 : Création de l'utilisateur ${NEW_USER}..."

# Vérifier si l'utilisateur existe déjà
if id "${NEW_USER}" &>/dev/null; then
    log_warning "L'utilisateur ${NEW_USER} existe déjà"
else
    # Créer l'utilisateur avec un répertoire home
    useradd -m -s /bin/bash "${NEW_USER}"

    # Ajouter l'utilisateur au groupe sudo
    usermod -aG sudo "${NEW_USER}"

    # Permettre sudo sans mot de passe (optionnel, à commenter si non désiré)
    echo "${NEW_USER} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${NEW_USER}"
    chmod 0440 "/etc/sudoers.d/${NEW_USER}"

    log_success "Utilisateur ${NEW_USER} créé et ajouté au groupe sudo"
fi

################################################################################
# ÉTAPE 4: Installation de Docker Engine
################################################################################

log_info "ÉTAPE 4/9 : Installation de Docker Engine..."

# Vérifier si Docker est déjà installé
if command -v docker &> /dev/null; then
    log_warning "Docker est déjà installé ($(docker --version))"
else
    # Ajouter la clé GPG officielle de Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    # Ajouter le dépôt Docker aux sources APT
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Mettre à jour et installer Docker
    apt update -qq
    apt install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    log_success "Docker Engine installé ($(docker --version))"
fi

# Ajouter l'utilisateur au groupe docker
usermod -aG docker "${NEW_USER}"
log_success "Utilisateur ${NEW_USER} ajouté au groupe docker"

################################################################################
# ÉTAPE 5: Configuration du pare-feu UFW
################################################################################

log_info "ÉTAPE 5/9 : Configuration du pare-feu UFW..."

# Réinitialiser UFW (si déjà configuré)
ufw --force reset

# Règles par défaut
ufw default deny incoming
ufw default allow outgoing

# Autoriser SSH (port 22)
ufw allow 22/tcp comment 'SSH'

# Autoriser HTTP (port 80)
ufw allow 80/tcp comment 'HTTP'

# Autoriser HTTPS (port 443)
ufw allow 443/tcp comment 'HTTPS'

# Activer UFW sans prompt
ufw --force enable

log_success "Pare-feu UFW configuré et activé"
ufw status numbered

################################################################################
# ÉTAPE 6: Configuration de Fail2ban
################################################################################

log_info "ÉTAPE 6/9 : Configuration de Fail2ban pour SSH..."

# Créer un fichier de configuration local pour Fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Bannir une IP pour 1 heure (3600 secondes)
bantime = 3600

# Fenêtre de temps pour compter les tentatives (10 minutes)
findtime = 600

# Nombre maximum de tentatives avant bannissement
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

# Redémarrer Fail2ban
systemctl restart fail2ban
systemctl enable fail2ban

log_success "Fail2ban configuré et activé"

################################################################################
# ÉTAPE 7: Création du répertoire projet
################################################################################

log_info "ÉTAPE 7/9 : Création du répertoire projet ${PROJECT_ROOT}..."

# Créer le répertoire s'il n'existe pas
if [ ! -d "${PROJECT_ROOT}" ]; then
    mkdir -p "${PROJECT_ROOT}"
    log_success "Répertoire ${PROJECT_ROOT} créé"
else
    log_warning "Le répertoire ${PROJECT_ROOT} existe déjà"
fi

# Changer le propriétaire
chown -R "${NEW_USER}:${NEW_USER}" "${PROJECT_ROOT}"
log_success "Propriétaire défini: ${NEW_USER}:${NEW_USER}"

################################################################################
# ÉTAPE 8: Clonage du dépôt Git
################################################################################

log_info "ÉTAPE 8/9 : Clonage du dépôt Git..."

# Se placer dans le répertoire parent
cd "$(dirname ${PROJECT_ROOT})"

# Vérifier si le repo est déjà cloné
if [ -d "${PROJECT_ROOT}/.git" ]; then
    log_warning "Le dépôt existe déjà, mise à jour..."
    cd "${PROJECT_ROOT}"
    sudo -u "${NEW_USER}" git fetch origin
    sudo -u "${NEW_USER}" git checkout "${BRANCH}"
    sudo -u "${NEW_USER}" git pull origin "${BRANCH}"
    log_success "Dépôt mis à jour (branche: ${BRANCH})"
else
    # Cloner le dépôt
    sudo -u "${NEW_USER}" git clone -b "${BRANCH}" "${GIT_REPO_URL}" "${PROJECT_ROOT}"
    log_success "Dépôt cloné (branche: ${BRANCH})"
fi

# Vérifier la présence du docker-compose.yml
COMPOSE_FILE="${PROJECT_ROOT}/infra/vps-prod/docker-compose.yml"
if [ ! -f "${COMPOSE_FILE}" ]; then
    log_error "Le fichier docker-compose.yml n'existe pas: ${COMPOSE_FILE}"
    log_warning "Vérifiez la structure du dépôt avant de continuer"
    exit 1
fi
log_success "Fichier docker-compose.yml trouvé"

################################################################################
# ÉTAPE 9: Lancement de la stack Docker
################################################################################

log_info "ÉTAPE 9/9 : Préparation au lancement de la stack Docker..."

cd "${PROJECT_ROOT}/infra/vps-prod"

# Vérifier la présence du fichier .env
if [ ! -f ".env" ]; then
    log_warning "Le fichier .env n'existe pas !"
    if [ -f ".env.example" ]; then
        log_info "Copie de .env.example vers .env..."
        sudo -u "${NEW_USER}" cp .env.example .env
        log_warning "⚠️  IMPORTANT: Éditez le fichier .env et configurez vos secrets !"
        log_warning "   Chemin: ${PROJECT_ROOT}/infra/vps-prod/.env"
        echo ""
        read -p "Voulez-vous éditer le .env maintenant ? (y/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo -u "${NEW_USER}" ${EDITOR:-nano} .env
        else
            log_warning "N'oubliez pas de configurer .env avant de démarrer la stack !"
            log_info "Pour démarrer la stack plus tard, exécutez:"
            echo "  cd ${PROJECT_ROOT}/infra/vps-prod"
            echo "  docker compose pull"
            echo "  docker compose up -d"
            exit 0
        fi
    else
        log_error "Aucun fichier .env.example trouvé !"
        log_warning "Créez un fichier .env manuellement avant de démarrer"
        exit 1
    fi
fi

# Récupérer les images
log_info "Téléchargement des images Docker..."
sudo -u "${NEW_USER}" docker compose pull

# Démarrer la stack
log_info "Démarrage de la stack Docker..."
sudo -u "${NEW_USER}" docker compose up -d

# Attendre quelques secondes pour que les conteneurs démarrent
sleep 5

# Afficher le statut
log_success "Stack Docker démarrée !"
echo ""
docker compose ps

################################################################################
# FIN DU SCRIPT - RÉSUMÉ
################################################################################

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ BOOTSTRAP TERMINÉ AVEC SUCCÈS !${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Résumé de l'installation:"
echo "  ✓ Système mis à jour"
echo "  ✓ Utilisateur ${NEW_USER} créé"
echo "  ✓ Docker Engine installé"
echo "  ✓ Pare-feu UFW configuré (SSH, HTTP, HTTPS)"
echo "  ✓ Fail2ban activé"
echo "  ✓ Projet cloné dans ${PROJECT_ROOT}"
echo "  ✓ Stack Docker démarrée"
echo ""
log_warning "PROCHAINES ÉTAPES:"
echo "  1. Vérifiez/éditez le fichier .env: ${PROJECT_ROOT}/infra/vps-prod/.env"
echo "  2. Configurez vos DNS pour pointer vers ce VPS"
echo "  3. Surveillez les logs: docker compose logs -f"
echo "  4. Accédez aux services via votre nom de domaine"
echo ""
log_info "Pour vous connecter en tant que ${NEW_USER}:"
echo "  su - ${NEW_USER}"
echo ""
log_info "Pour gérer la stack:"
echo "  cd ${PROJECT_ROOT}/infra/vps-prod"
echo "  docker compose ps      # Voir les conteneurs"
echo "  docker compose logs -f # Voir les logs"
echo "  docker compose restart # Redémarrer"
echo ""
echo "════════════════════════════════════════════════════════════════"
