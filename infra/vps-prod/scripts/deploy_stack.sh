#!/bin/bash

################################################################################
# Script: deploy_stack.sh
# Description: Déploiement et mise à jour de la stack Prolex en production
#              Met à jour le code depuis Git et redémarre les services Docker
# Auteur: Architecte DevOps Prolex
# Usage: ./deploy_stack.sh
################################################################################

set -e  # Arrêter le script en cas d'erreur

################################################################################
# VARIABLES DE CONFIGURATION
################################################################################

# Chemin racine du projet
PROJECT_ROOT="/opt/prolex"

# Branche Git à déployer
BRANCH="main"

# Services à rebuilder (avec Dockerfile custom)
# Laissez vide si aucun service ne nécessite de build
SERVICES_TO_BUILD=""  # Exemple: "mcp custom-service"

# Timeout pour les opérations docker compose (en secondes)
COMPOSE_TIMEOUT=300

################################################################################
# COULEURS POUR L'AFFICHAGE
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

# Fonction pour vérifier si un répertoire est un dépôt Git
check_git_repo() {
    if [ ! -d ".git" ]; then
        log_error "Le répertoire actuel n'est pas un dépôt Git"
        return 1
    fi
    return 0
}

# Fonction pour vérifier la présence de docker compose
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé !"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose plugin n'est pas installé !"
        exit 1
    fi
}

################################################################################
# DÉBUT DU SCRIPT
################################################################################

echo "════════════════════════════════════════════════════════════════"
echo "  🚀 DÉPLOIEMENT STACK PROLEX"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérifier que Docker est disponible
check_docker

# Se déplacer dans le répertoire du projet
log_step "Navigation vers le répertoire du projet..."
if [ ! -d "${PROJECT_ROOT}" ]; then
    log_error "Le répertoire ${PROJECT_ROOT} n'existe pas !"
    log_info "Exécutez d'abord le script bootstrap_vps.sh"
    exit 1
fi

cd "${PROJECT_ROOT}"
log_info "Répertoire de travail: $(pwd)"

# Vérifier qu'on est dans un dépôt Git
if ! check_git_repo; then
    exit 1
fi

# Afficher les informations du dépôt
log_info "Dépôt Git: $(git config --get remote.origin.url)"
log_info "Branche actuelle: $(git branch --show-current)"
log_info "Dernier commit: $(git log -1 --oneline)"
echo ""

################################################################################
# ÉTAPE 1: Mise à jour du code depuis Git
################################################################################

log_step "ÉTAPE 1/5 : Mise à jour du code depuis Git..."

# Sauvegarder les modifications locales (si il y en a)
if ! git diff-index --quiet HEAD --; then
    log_warning "Modifications locales détectées, création d'un stash..."
    git stash push -m "Auto-stash avant déploiement $(date +%Y%m%d_%H%M%S)"
fi

# Récupérer les dernières modifications
log_info "Récupération des modifications (git fetch)..."
git fetch origin

# Changer de branche si nécessaire
CURRENT_BRANCH=$(git branch --show-current)
if [ "${CURRENT_BRANCH}" != "${BRANCH}" ]; then
    log_warning "Changement de branche: ${CURRENT_BRANCH} → ${BRANCH}"
    git checkout "${BRANCH}"
fi

# Mettre à jour la branche
log_info "Mise à jour de la branche ${BRANCH}..."
git pull origin "${BRANCH}"

# Afficher le nouveau commit
NEW_COMMIT=$(git log -1 --oneline)
log_success "Code mis à jour: ${NEW_COMMIT}"

################################################################################
# ÉTAPE 2: Vérification de la configuration
################################################################################

log_step "ÉTAPE 2/5 : Vérification de la configuration..."

# Se déplacer dans le répertoire de la stack
STACK_DIR="${PROJECT_ROOT}/infra/vps-prod"
if [ ! -d "${STACK_DIR}" ]; then
    log_error "Le répertoire ${STACK_DIR} n'existe pas !"
    exit 1
fi

cd "${STACK_DIR}"
log_info "Répertoire de la stack: $(pwd)"

# Vérifier la présence du docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    log_error "Le fichier docker-compose.yml est introuvable !"
    exit 1
fi
log_success "Fichier docker-compose.yml trouvé"

# Vérifier la présence du .env
if [ ! -f ".env" ]; then
    log_error "Le fichier .env est introuvable !"
    log_warning "Créez un fichier .env à partir de .env.example"
    exit 1
fi
log_success "Fichier .env trouvé"

################################################################################
# ÉTAPE 3: Build des services custom (si nécessaire)
################################################################################

log_step "ÉTAPE 3/5 : Build des services custom..."

if [ -n "${SERVICES_TO_BUILD}" ]; then
    log_info "Services à rebuilder: ${SERVICES_TO_BUILD}"

    for service in ${SERVICES_TO_BUILD}; do
        log_info "Building ${service}..."
        if ! docker compose build "${service}"; then
            log_error "Échec du build pour ${service}"
            exit 1
        fi
        log_success "Service ${service} buildé"
    done
else
    log_info "Aucun service custom à rebuilder"
fi

################################################################################
# ÉTAPE 4: Téléchargement des images Docker
################################################################################

log_step "ÉTAPE 4/5 : Téléchargement des dernières images Docker..."

if ! docker compose pull; then
    log_error "Échec du téléchargement des images"
    exit 1
fi
log_success "Images téléchargées"

################################################################################
# ÉTAPE 5: Démarrage/Redémarrage de la stack
################################################################################

log_step "ÉTAPE 5/5 : Démarrage de la stack Docker..."

# Options pour docker compose up:
# -d : mode détaché (background)
# --remove-orphans : supprimer les conteneurs orphelins
# --force-recreate : force la recréation des conteneurs (optionnel, à commenter si non désiré)

log_info "Démarrage des services..."
if ! docker compose up -d --remove-orphans; then
    log_error "Échec du démarrage de la stack"
    exit 1
fi

# Attendre quelques secondes pour que les conteneurs démarrent
log_info "Attente du démarrage des conteneurs..."
sleep 5

log_success "Stack démarrée"

################################################################################
# AFFICHAGE DU STATUT FINAL
################################################################################

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

log_info "État des conteneurs:"
echo ""

# Affichage avec formatage personnalisé
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
log_info "Pour voir les logs en temps réel:"
echo "  docker compose logs -f"
echo ""
log_info "Pour voir les logs d'un service spécifique:"
echo "  docker compose logs -f <nom_du_service>"
echo ""

# Vérifier si des conteneurs sont en erreur
UNHEALTHY=$(docker compose ps --filter "status=exited" --filter "status=dead" -q | wc -l)
if [ "${UNHEALTHY}" -gt 0 ]; then
    log_warning "⚠️  ${UNHEALTHY} conteneur(s) ne semble(nt) pas démarré(s) correctement"
    log_info "Vérifiez les logs avec: docker compose logs"
    exit 1
fi

log_success "Tous les services sont opérationnels !"
echo "════════════════════════════════════════════════════════════════"
