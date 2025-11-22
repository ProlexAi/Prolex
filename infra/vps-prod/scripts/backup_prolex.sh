#!/bin/bash

################################################################################
# Script: backup_prolex.sh
# Description: Sauvegarde complète des données critiques de Prolex
#              (n8n, AnythingLLM, Traefik, configurations)
# Auteur: Architecte DevOps Prolex
# Usage: ./backup_prolex.sh
################################################################################

set -e  # Arrêter le script en cas d'erreur

################################################################################
# VARIABLES DE CONFIGURATION
################################################################################

# Chemin racine du projet
PROJECT_ROOT="/opt/prolex"

# Répertoire où stocker les backups locaux
BACKUP_DIR="${PROJECT_ROOT}/infra/vps-prod/backup"

# Inclure le fichier .env dans la sauvegarde ? (true/false)
# ⚠️  ATTENTION: Le .env contient des secrets sensibles !
INCLUDE_ENV=true

# Nombre de backups locaux à conserver (les plus anciens seront supprimés)
KEEP_BACKUPS=7

# Configuration Rclone (optionnel - pour backup distant)
# Décommentez et configurez si vous utilisez Rclone
# RCLONE_REMOTE="prolex-backup:"  # Nom du remote rclone
# RCLONE_PATH="backups/"          # Chemin dans le remote

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

# Fonction pour afficher la taille d'un fichier de manière lisible
human_size() {
    local size=$1
    if [ ${size} -gt 1073741824 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", ${size}/1073741824}") GB"
    elif [ ${size} -gt 1048576 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", ${size}/1048576}") MB"
    elif [ ${size} -gt 1024 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", ${size}/1024}") KB"
    else
        echo "${size} B"
    fi
}

################################################################################
# DÉBUT DU SCRIPT
################################################################################

echo "════════════════════════════════════════════════════════════════"
echo "  💾 BACKUP PROLEX - Sauvegarde des données"
echo "════════════════════════════════════════════════════════════════"
echo ""

START_TIME=$(date +%s)

################################################################################
# ÉTAPE 1: Préparation
################################################################################

log_step "ÉTAPE 1/6 : Préparation..."

# Créer le répertoire de backup s'il n'existe pas
if [ ! -d "${BACKUP_DIR}" ]; then
    mkdir -p "${BACKUP_DIR}"
    log_info "Répertoire de backup créé: ${BACKUP_DIR}"
else
    log_info "Répertoire de backup: ${BACKUP_DIR}"
fi

# Vérifier que le projet existe
if [ ! -d "${PROJECT_ROOT}" ]; then
    log_error "Le répertoire ${PROJECT_ROOT} n'existe pas !"
    exit 1
fi

# Générer le nom du fichier de backup avec timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILENAME="prolex_backup_${TIMESTAMP}.zip"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

log_info "Nom du backup: ${BACKUP_FILENAME}"

################################################################################
# ÉTAPE 2: Création d'un répertoire temporaire
################################################################################

log_step "ÉTAPE 2/6 : Création du répertoire temporaire..."

TEMP_DIR=$(mktemp -d)
log_info "Répertoire temporaire: ${TEMP_DIR}"

# Fonction de nettoyage en cas d'erreur
cleanup() {
    log_warning "Nettoyage du répertoire temporaire..."
    rm -rf "${TEMP_DIR}"
}
trap cleanup EXIT

################################################################################
# ÉTAPE 3: Copie des données critiques
################################################################################

log_step "ÉTAPE 3/6 : Copie des données critiques..."

# Créer la structure dans le temp
mkdir -p "${TEMP_DIR}/backup"

# Liste des éléments à sauvegarder
declare -a BACKUP_ITEMS=(
    "n8n/data:n8n_data"
    "anythingllm/data:anythingllm_data"
    "infra/vps-prod/traefik/acme.json:acme.json"
)

# Ajouter .env si demandé
if [ "${INCLUDE_ENV}" = true ]; then
    BACKUP_ITEMS+=("infra/vps-prod/.env:env_file")
    log_warning "Le fichier .env sera inclus dans la sauvegarde (contient des secrets)"
fi

# Parcourir les éléments à sauvegarder
BACKUP_COUNT=0
for item in "${BACKUP_ITEMS[@]}"; do
    # Séparer le chemin source et le nom de destination
    SOURCE_PATH=$(echo "${item}" | cut -d':' -f1)
    DEST_NAME=$(echo "${item}" | cut -d':' -f2)

    FULL_SOURCE_PATH="${PROJECT_ROOT}/${SOURCE_PATH}"

    if [ -e "${FULL_SOURCE_PATH}" ]; then
        log_info "Sauvegarde: ${SOURCE_PATH}"

        # Créer le répertoire parent si nécessaire
        DEST_DIR=$(dirname "${TEMP_DIR}/backup/${DEST_NAME}")
        mkdir -p "${DEST_DIR}"

        # Copier le fichier ou dossier
        if [ -d "${FULL_SOURCE_PATH}" ]; then
            cp -r "${FULL_SOURCE_PATH}" "${TEMP_DIR}/backup/${DEST_NAME}"
        else
            cp "${FULL_SOURCE_PATH}" "${TEMP_DIR}/backup/${DEST_NAME}"
        fi

        BACKUP_COUNT=$((BACKUP_COUNT + 1))
    else
        log_warning "Élément introuvable (ignoré): ${SOURCE_PATH}"
    fi
done

if [ ${BACKUP_COUNT} -eq 0 ]; then
    log_error "Aucune donnée à sauvegarder !"
    exit 1
fi

log_success "${BACKUP_COUNT} élément(s) copié(s)"

################################################################################
# ÉTAPE 4: Création de l'archive ZIP
################################################################################

log_step "ÉTAPE 4/6 : Création de l'archive ZIP..."

# Créer un fichier de métadonnées
cat > "${TEMP_DIR}/backup/metadata.txt" << EOF
Backup Prolex
=============
Date: $(date '+%Y-%m-%d %H:%M:%S')
Hostname: $(hostname)
Version Git: $(cd ${PROJECT_ROOT} && git describe --always --dirty 2>/dev/null || echo "N/A")
Commit: $(cd ${PROJECT_ROOT} && git log -1 --oneline 2>/dev/null || echo "N/A")
.env inclus: ${INCLUDE_ENV}
EOF

log_info "Compression en cours..."

# Créer l'archive ZIP
cd "${TEMP_DIR}"
if ! zip -r -q "${BACKUP_PATH}" backup/; then
    log_error "Échec de la création de l'archive"
    exit 1
fi

# Calculer la taille du backup
BACKUP_SIZE=$(stat -f%z "${BACKUP_PATH}" 2>/dev/null || stat -c%s "${BACKUP_PATH}" 2>/dev/null)
BACKUP_SIZE_HUMAN=$(human_size ${BACKUP_SIZE})

log_success "Archive créée: ${BACKUP_FILENAME} (${BACKUP_SIZE_HUMAN})"

################################################################################
# ÉTAPE 5: Upload vers stockage distant (optionnel)
################################################################################

log_step "ÉTAPE 5/6 : Upload vers stockage distant..."

# Vérifier si Rclone est configuré
if [ -n "${RCLONE_REMOTE:-}" ]; then
    if command -v rclone &> /dev/null; then
        log_info "Upload vers ${RCLONE_REMOTE}${RCLONE_PATH:-}..."

        if rclone copy "${BACKUP_PATH}" "${RCLONE_REMOTE}${RCLONE_PATH:-}" --progress; then
            log_success "Backup uploadé vers le stockage distant"
        else
            log_warning "Échec de l'upload vers le stockage distant"
            log_warning "Le backup local reste disponible: ${BACKUP_PATH}"
        fi
    else
        log_warning "Rclone n'est pas installé, skip de l'upload distant"
    fi
else
    log_info "Aucun stockage distant configuré (variable RCLONE_REMOTE)"
fi

################################################################################
# ÉTAPE 6: Nettoyage des anciens backups
################################################################################

log_step "ÉTAPE 6/6 : Nettoyage des anciens backups..."

# Compter le nombre de backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "prolex_backup_*.zip" | wc -l)
log_info "Nombre de backups locaux: ${BACKUP_COUNT}"

if [ ${BACKUP_COUNT} -gt ${KEEP_BACKUPS} ]; then
    # Supprimer les backups les plus anciens
    BACKUPS_TO_DELETE=$((BACKUP_COUNT - KEEP_BACKUPS))
    log_warning "Suppression de ${BACKUPS_TO_DELETE} ancien(s) backup(s)..."

    find "${BACKUP_DIR}" -name "prolex_backup_*.zip" -type f | \
        sort | \
        head -n ${BACKUPS_TO_DELETE} | \
        while read old_backup; do
            log_info "Suppression: $(basename ${old_backup})"
            rm -f "${old_backup}"
        done

    log_success "Anciens backups nettoyés (conservation: ${KEEP_BACKUPS})"
else
    log_info "Pas de nettoyage nécessaire (conservation: ${KEEP_BACKUPS})"
fi

################################################################################
# RÉSUMÉ FINAL
################################################################################

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ BACKUP TERMINÉ AVEC SUCCÈS !${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Résumé:"
echo "  📦 Fichier: ${BACKUP_FILENAME}"
echo "  📏 Taille: ${BACKUP_SIZE_HUMAN}"
echo "  📂 Chemin: ${BACKUP_PATH}"
echo "  ⏱️  Durée: ${DURATION}s"
echo "  🗂️  Backups conservés: ${KEEP_BACKUPS}"
echo ""

if [ -n "${RCLONE_REMOTE:-}" ] && command -v rclone &> /dev/null; then
    echo "  ☁️  Stockage distant: ${RCLONE_REMOTE}${RCLONE_PATH:-}"
fi

echo ""
log_info "Pour restaurer ce backup:"
echo "  ./restore_prolex.sh ${BACKUP_FILENAME}"
echo ""
log_info "Pour lister tous les backups:"
echo "  ./restore_prolex.sh"
echo ""
echo "════════════════════════════════════════════════════════════════"
