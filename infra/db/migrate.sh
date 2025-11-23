#!/usr/bin/env bash

# ═══════════════════════════════════════════════════════════════════
# 🚀 PROLEX - Script de migration PostgreSQL
# ═══════════════════════════════════════════════════════════════════
#
# Ce script applique toutes les migrations SQL dans l'ordre.
#
# Usage:
#   ./migrate.sh                    # Utilise DATABASE_URL de .env
#   ./migrate.sh <DATABASE_URL>     # Utilise l'URL fournie
#
# Prérequis:
#   - psql installé
#   - DATABASE_URL définie dans .env OU fournie en argument
#   - Base PostgreSQL accessible
#
# ═══════════════════════════════════════════════════════════════════

set -e  # Arrêter en cas d'erreur

# ───────────────────────────────────────────────────────────────────
# Configuration
# ───────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${SCRIPT_DIR}/migrations"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ───────────────────────────────────────────────────────────────────
# Fonctions utilitaires
# ───────────────────────────────────────────────────────────────────

log_info() {
  echo -e "${BLUE}ℹ️  ${NC}$1"
}

log_success() {
  echo -e "${GREEN}✅ ${NC}$1"
}

log_warning() {
  echo -e "${YELLOW}⚠️  ${NC}$1"
}

log_error() {
  echo -e "${RED}❌ ${NC}$1"
}

# ───────────────────────────────────────────────────────────────────
# Vérification des prérequis
# ───────────────────────────────────────────────────────────────────

# Vérifier que psql est installé
if ! command -v psql &> /dev/null; then
  log_error "psql n'est pas installé"
  echo ""
  echo "Installation:"
  echo "  - Ubuntu/Debian: sudo apt-get install postgresql-client"
  echo "  - macOS: brew install postgresql"
  echo "  - Alpine: apk add postgresql-client"
  exit 1
fi

# ───────────────────────────────────────────────────────────────────
# Détermination de DATABASE_URL
# ───────────────────────────────────────────────────────────────────

# Option 1: Argument fourni
if [ -n "$1" ]; then
  DATABASE_URL="$1"
  log_info "Utilisation de DATABASE_URL fournie en argument"

# Option 2: Variable d'environnement
elif [ -n "$DATABASE_URL" ]; then
  log_info "Utilisation de DATABASE_URL depuis l'environnement"

# Option 3: Charger depuis .env
elif [ -f "${SCRIPT_DIR}/../vps-prod/.env" ]; then
  log_info "Chargement de DATABASE_URL depuis .env"
  set -a
  source "${SCRIPT_DIR}/../vps-prod/.env"
  set +a

# Erreur: aucune DATABASE_URL trouvée
else
  log_error "DATABASE_URL non trouvée"
  echo ""
  echo "Solutions:"
  echo "  1. Passer DATABASE_URL en argument:"
  echo "     ./migrate.sh postgres://user:pass@host:port/db"
  echo ""
  echo "  2. Définir DATABASE_URL dans l'environnement:"
  echo "     export DATABASE_URL=postgres://user:pass@host:port/db"
  echo "     ./migrate.sh"
  echo ""
  echo "  3. Créer un fichier .env dans infra/vps-prod/"
  echo "     cp .env.example .env"
  echo "     # Puis remplir DATABASE_URL"
  exit 1
fi

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
  log_error "DATABASE_URL est vide"
  exit 1
fi

# Masquer le mot de passe dans les logs
DATABASE_URL_SAFE=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
log_info "Connexion: ${DATABASE_URL_SAFE}"

# ───────────────────────────────────────────────────────────────────
# Vérification de la connexion à la base
# ───────────────────────────────────────────────────────────────────

log_info "Test de connexion à PostgreSQL..."

if ! psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
  log_error "Impossible de se connecter à PostgreSQL"
  echo ""
  echo "Vérifications:"
  echo "  - Le conteneur PostgreSQL est-il démarré? docker ps | grep postgres"
  echo "  - DATABASE_URL est-elle correcte?"
  echo "  - Les credentials sont-ils valides?"
  exit 1
fi

log_success "Connexion réussie"

# ───────────────────────────────────────────────────────────────────
# Application des migrations
# ───────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🚀 Application des migrations SQL"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Vérifier que le dossier migrations existe
if [ ! -d "$MIGRATIONS_DIR" ]; then
  log_error "Dossier migrations introuvable: $MIGRATIONS_DIR"
  exit 1
fi

# Compter les migrations
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)

if [ "$MIGRATION_COUNT" -eq 0 ]; then
  log_warning "Aucune migration trouvée dans $MIGRATIONS_DIR"
  exit 0
fi

log_info "Migrations trouvées: $MIGRATION_COUNT"
echo ""

# Appliquer chaque migration dans l'ordre
for migration in "$MIGRATIONS_DIR"/*.sql; do
  migration_name=$(basename "$migration")

  log_info "Application de $migration_name..."

  if psql "$DATABASE_URL" -f "$migration" > /dev/null 2>&1; then
    log_success "$migration_name appliquée"
  else
    log_error "Échec de l'application de $migration_name"
    echo ""
    echo "Détails de l'erreur:"
    psql "$DATABASE_URL" -f "$migration"
    exit 1
  fi

  echo ""
done

# ───────────────────────────────────────────────────────────────────
# Vérification post-migration
# ───────────────────────────────────────────────────────────────────

log_info "Vérification de la table app_logs..."

if psql "$DATABASE_URL" -c "\d app_logs" > /dev/null 2>&1; then
  log_success "Table app_logs créée avec succès"

  # Afficher la structure de la table
  echo ""
  echo "Structure de la table app_logs:"
  echo "────────────────────────────────────────────────────────────────"
  psql "$DATABASE_URL" -c "\d app_logs"
else
  log_warning "Table app_logs non trouvée (vérifier les migrations)"
fi

# ───────────────────────────────────────────────────────────────────
# Message final
# ───────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════════════════"
log_success "Migrations terminées avec succès"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Prochaines étapes:"
echo "  1. Tester un INSERT dans app_logs:"
echo "     psql \$DATABASE_URL -c \"INSERT INTO app_logs (source, level, message) VALUES ('test', 'info', 'Test migration');\""
echo ""
echo "  2. Vérifier les logs:"
echo "     psql \$DATABASE_URL -c \"SELECT * FROM app_logs ORDER BY created_at DESC LIMIT 5;\""
echo ""
echo "  3. Utiliser l'outil MCP log_event pour logger depuis les agents"
echo ""
