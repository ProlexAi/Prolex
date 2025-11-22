#!/bin/bash

################################################################################
# Script: restore_prolex.sh
# Description: Restauration des données Prolex à partir d'un backup
#              ⚠️  ATTENTION: Écrase les données existantes !
# Auteur: Architecte DevOps Prolex
# Usage: ./restore_prolex.sh [nom_du_backup.zip]
#        ./restore_prolex.sh                    # Liste les backups disponibles
################################################################################

set -e  # Arrêter le script en cas d'erreur

################################################################################
# VARIABLES DE CONFIGURATION
################################################################################

# Chemin racine du projet
PROJECT_ROOT="/opt/prolex"

# Répertoire où sont stockés les backups
BACKUP_DIR="${PROJECT_ROOT}/infra/vps-prod/backup"

# Répertoire de la stack Docker
STACK_DIR="${PROJECT_ROOT}/infra/vps-prod"

################################################################################
# COULEURS POUR L'AFFICHAGE
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
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

log_danger() {
    echo -e "${MAGENTA}[DANGER]${NC} $1"
}

# Fonction pour lister les backups disponibles
list_backups() {
    echo "════════════════════════════════════════════════════════════════"
    echo "  📋 BACKUPS DISPONIBLES"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    if [ ! -d "${BACKUP_DIR}" ]; then
        log_error "Le répertoire de backup n'existe pas: ${BACKUP_DIR}"
        exit 1
    fi

    local backups=$(find "${BACKUP_DIR}" -name "prolex_backup_*.zip" -type f | sort -r)

    if [ -z "${backups}" ]; then
        log_warning "Aucun backup trouvé dans ${BACKUP_DIR}"
        echo ""
        log_info "Pour créer un backup, utilisez:"
        echo "  ./backup_prolex.sh"
        exit 0
    fi

    local count=0
    echo "Liste des backups (du plus récent au plus ancien):"
    echo ""
    printf "%-5s %-35s %-15s %-20s\n" "N°" "FICHIER" "TAILLE" "DATE"
    echo "────────────────────────────────────────────────────────────────────────"

    while IFS= read -r backup; do
        count=$((count + 1))
        local filename=$(basename "${backup}")
        local size=$(stat -f%z "${backup}" 2>/dev/null || stat -c%s "${backup}" 2>/dev/null)
        local date=$(stat -f%Sm -t "%Y-%m-%d %H:%M" "${backup}" 2>/dev/null || stat -c%y "${backup}" 2>/dev/null | cut -d'.' -f1)

        # Conversion de la taille
        if [ ${size} -gt 1073741824 ]; then
            size_human="$(awk "BEGIN {printf \"%.2f\", ${size}/1073741824}") GB"
        elif [ ${size} -gt 1048576 ]; then
            size_human="$(awk "BEGIN {printf \"%.2f\", ${size}/1048576}") MB"
        else
            size_human="$(awk "BEGIN {printf \"%.2f\", ${size}/1024}") KB"
        fi

        printf "%-5s %-35s %-15s %-20s\n" "${count}" "${filename}" "${size_human}" "${date}"
    done <<< "${backups}"

    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    log_info "Pour restaurer un backup, utilisez:"
    echo "  ./restore_prolex.sh <nom_du_fichier.zip>"
    echo ""
    log_info "Exemple:"
    echo "  ./restore_prolex.sh prolex_backup_20250122_143022.zip"
    echo ""
}

# Fonction pour vérifier que Docker est installé
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

# Fonction pour demander confirmation
confirm() {
    local message=$1
    echo ""
    log_danger "${message}"
    read -p "Tapez 'OUI' en majuscules pour confirmer: " confirmation
    if [ "${confirmation}" != "OUI" ]; then
        log_warning "Restauration annulée par l'utilisateur"
        exit 0
    fi
}

################################################################################
# DÉBUT DU SCRIPT
################################################################################

echo "════════════════════════════════════════════════════════════════"
echo "  ♻️  RESTORE PROLEX - Restauration des données"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Vérifier si un nom de fichier est fourni
if [ $# -eq 0 ]; then
    # Aucun argument: lister les backups
    list_backups
    exit 0
fi

BACKUP_FILENAME="$1"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

# Vérifier que Docker est disponible
check_docker

################################################################################
# ÉTAPE 1: Vérifications
################################################################################

log_step "ÉTAPE 1/6 : Vérifications..."

# Vérifier que le fichier de backup existe
if [ ! -f "${BACKUP_PATH}" ]; then
    log_error "Le fichier de backup n'existe pas: ${BACKUP_PATH}"
    echo ""
    log_info "Fichiers de backup disponibles:"
    list_backups
    exit 1
fi

log_success "Backup trouvé: ${BACKUP_FILENAME}"

# Vérifier que le fichier est un ZIP valide
if ! unzip -t "${BACKUP_PATH}" &>/dev/null; then
    log_error "Le fichier n'est pas un ZIP valide ou est corrompu"
    exit 1
fi

log_success "Archive ZIP valide"

# Afficher les métadonnées si disponibles
log_info "Informations du backup:"
if unzip -p "${BACKUP_PATH}" backup/metadata.txt 2>/dev/null; then
    echo ""
fi

################################################################################
# CONFIRMATION DE L'UTILISATEUR
################################################################################

confirm "⚠️  Cette opération va ÉCRASER toutes les données existantes ! ⚠️"

################################################################################
# ÉTAPE 2: Arrêt de la stack Docker
################################################################################

log_step "ÉTAPE 2/6 : Arrêt de la stack Docker..."

if [ -d "${STACK_DIR}" ]; then
    cd "${STACK_DIR}"

    if [ -f "docker-compose.yml" ]; then
        log_info "Arrêt des conteneurs..."
        docker compose down || log_warning "Échec de l'arrêt (les conteneurs n'étaient peut-être pas lancés)"
        log_success "Stack Docker arrêtée"
    else
        log_warning "Aucun docker-compose.yml trouvé, skip de l'arrêt"
    fi
else
    log_warning "Répertoire de stack introuvable: ${STACK_DIR}"
fi

################################################################################
# ÉTAPE 3: Création d'un répertoire temporaire
################################################################################

log_step "ÉTAPE 3/6 : Extraction du backup..."

TEMP_DIR=$(mktemp -d)
log_info "Répertoire temporaire: ${TEMP_DIR}"

# Fonction de nettoyage
cleanup() {
    log_info "Nettoyage du répertoire temporaire..."
    rm -rf "${TEMP_DIR}"
}
trap cleanup EXIT

# Extraire l'archive
log_info "Extraction en cours..."
if ! unzip -q "${BACKUP_PATH}" -d "${TEMP_DIR}"; then
    log_error "Échec de l'extraction"
    exit 1
fi

log_success "Archive extraite"

################################################################################
# ÉTAPE 4: Vérification du contenu
################################################################################

log_step "ÉTAPE 4/6 : Vérification du contenu..."

if [ ! -d "${TEMP_DIR}/backup" ]; then
    log_error "Structure du backup invalide (dossier 'backup' manquant)"
    exit 1
fi

# Lister les éléments à restaurer
log_info "Contenu du backup:"
ls -lh "${TEMP_DIR}/backup" | tail -n +2 | awk '{print "  - " $9}'
echo ""

################################################################################
# ÉTAPE 5: Restauration des données
################################################################################

log_step "ÉTAPE 5/6 : Restauration des données..."

# Mapping des éléments à restaurer
declare -A RESTORE_MAP=(
    ["n8n_data"]="n8n/data"
    ["anythingllm_data"]="anythingllm/data"
    ["acme.json"]="infra/vps-prod/traefik/acme.json"
    ["env_file"]="infra/vps-prod/.env"
)

RESTORE_COUNT=0

for backup_item in "${!RESTORE_MAP[@]}"; do
    SOURCE="${TEMP_DIR}/backup/${backup_item}"
    DEST_RELATIVE="${RESTORE_MAP[$backup_item]}"
    DEST="${PROJECT_ROOT}/${DEST_RELATIVE}"

    if [ -e "${SOURCE}" ]; then
        log_info "Restauration: ${DEST_RELATIVE}"

        # Créer le répertoire parent si nécessaire
        DEST_DIR=$(dirname "${DEST}")
        mkdir -p "${DEST_DIR}"

        # Supprimer l'ancienne version (fichier ou dossier)
        if [ -e "${DEST}" ]; then
            rm -rf "${DEST}"
        fi

        # Copier la nouvelle version
        if [ -d "${SOURCE}" ]; then
            cp -r "${SOURCE}" "${DEST}"
        else
            cp "${SOURCE}" "${DEST}"
        fi

        RESTORE_COUNT=$((RESTORE_COUNT + 1))
        log_success "✓ ${DEST_RELATIVE}"
    else
        log_warning "Élément non trouvé dans le backup: ${backup_item}"
    fi
done

if [ ${RESTORE_COUNT} -eq 0 ]; then
    log_error "Aucune donnée n'a été restaurée !"
    exit 1
fi

log_success "${RESTORE_COUNT} élément(s) restauré(s)"

################################################################################
# ÉTAPE 6: Redémarrage de la stack Docker
################################################################################

log_step "ÉTAPE 6/6 : Redémarrage de la stack Docker..."

if [ -d "${STACK_DIR}" ] && [ -f "${STACK_DIR}/docker-compose.yml" ]; then
    cd "${STACK_DIR}"

    log_info "Démarrage des conteneurs..."
    if docker compose up -d; then
        # Attendre quelques secondes
        sleep 5

        log_success "Stack Docker redémarrée"
        echo ""
        docker compose ps
    else
        log_error "Échec du démarrage de la stack"
        log_warning "Vérifiez les logs avec: docker compose logs"
        exit 1
    fi
else
    log_warning "Impossible de redémarrer la stack (fichiers de config manquants)"
    log_info "Démarrez manuellement la stack avec:"
    echo "  cd ${STACK_DIR}"
    echo "  docker compose up -d"
fi

################################################################################
# RÉSUMÉ FINAL
################################################################################

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ RESTAURATION TERMINÉE AVEC SUCCÈS !${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Résumé:"
echo "  📦 Backup restauré: ${BACKUP_FILENAME}"
echo "  📂 Éléments restaurés: ${RESTORE_COUNT}"
echo "  🔄 Stack Docker: Redémarrée"
echo ""
log_warning "Points d'attention:"
echo "  - Vérifiez que tous les services fonctionnent correctement"
echo "  - Consultez les logs en cas de problème: docker compose logs -f"
echo "  - Testez vos workflows et configurations"
echo ""
log_info "Pour vérifier l'état des services:"
echo "  cd ${STACK_DIR}"
echo "  docker compose ps"
echo "  docker compose logs -f"
echo ""
echo "════════════════════════════════════════════════════════════════"
