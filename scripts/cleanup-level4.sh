#!/bin/bash
# ============================================================================
# cleanup-level4.sh — Nettoyage massif Prolex niveau 4
# ============================================================================
#
# Ce script nettoie tous les anciens workflows et nœuds contenant des
# validations manuelles ou demandes humaines obsolètes pour le niveau 4.
#
# Date : 22 novembre 2025
# Version : 1.0
# Auteur : Matthieu (Automatt.ai)
#
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "🧹 Nettoyage Prolex niveau 4 en cours..."
echo ""

# ============================================================================
# Configuration
# ============================================================================

N8N_API_URL="${N8N_API_URL:-http://localhost:5678/api/v1}"
N8N_API_KEY="${N8N_API_KEY}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKFLOWS_DIR="$REPO_ROOT/n8n-workflows"

echo "📁 Répertoire du repo : $REPO_ROOT"
echo "📂 Répertoire workflows : $WORKFLOWS_DIR"
echo ""

# ============================================================================
# Étape 1 : Désactiver workflows avec "manuel" ou "approval" dans le nom
# ============================================================================

echo "🔍 Étape 1/4 : Recherche des workflows avec 'manuel' ou 'approval'..."

# Chercher dans les fichiers JSON
MANUAL_WORKFLOWS=$(find "$WORKFLOWS_DIR" -type f -name "*.json" | xargs grep -l -i -E "(manuel|approval|wait.*for.*matthieu|human.*validation)" | wc -l)

if [ "$MANUAL_WORKFLOWS" -gt 0 ]; then
    echo "⚠️  Trouvé $MANUAL_WORKFLOWS workflow(s) avec validations manuelles"

    # Lister les fichiers
    find "$WORKFLOWS_DIR" -type f -name "*.json" | xargs grep -l -i -E "(manuel|approval|wait.*for.*matthieu|human.*validation)" | while read -r file; do
        filename=$(basename "$file")
        echo "   - $filename"
    done
    echo ""
else
    echo "✅ Aucun workflow manuel trouvé"
    echo ""
fi

# ============================================================================
# Étape 2 : Supprimer les nœuds obsolètes dans les JSON du repo
# ============================================================================

echo "🗑️  Étape 2/4 : Suppression des nœuds obsolètes..."

# Patterns à supprimer
PATTERNS=(
    "human_approval"
    "Wait for Matthieu"
    "manual_validation"
    "askHuman"
    "request_confirmation"
    "human_in_the_loop"
)

TOTAL_CLEANED=0

for pattern in "${PATTERNS[@]}"; do
    echo "   🔍 Recherche de '$pattern'..."

    FOUND=$(grep -rl "$pattern" "$WORKFLOWS_DIR" 2>/dev/null | wc -l)

    if [ "$FOUND" -gt 0 ]; then
        echo "      ⚠️  Trouvé dans $FOUND fichier(s)"

        # Supprimer les lignes contenant le pattern
        grep -rl "$pattern" "$WORKFLOWS_DIR" 2>/dev/null | while read -r file; do
            # Backup avant modification
            cp "$file" "$file.backup"

            # Supprimer les lignes
            sed -i "/$pattern/d" "$file"

            echo "      ✅ Nettoyé: $(basename "$file")"
            TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
        done
    else
        echo "      ✅ Aucune occurrence"
    fi
done

echo ""
echo "📊 Total de fichiers nettoyés : $TOTAL_CLEANED"
echo ""

# ============================================================================
# Étape 3 : Vérifier la validité JSON des fichiers modifiés
# ============================================================================

echo "✅ Étape 3/4 : Vérification de la validité JSON..."

INVALID_COUNT=0

find "$WORKFLOWS_DIR" -type f -name "*.json" ! -name "*.backup" | while read -r file; do
    if ! jq empty "$file" 2>/dev/null; then
        echo "   ❌ INVALIDE : $(basename "$file")"

        # Restaurer le backup si JSON invalide
        if [ -f "$file.backup" ]; then
            echo "      🔄 Restauration du backup..."
            mv "$file.backup" "$file"
        fi

        INVALID_COUNT=$((INVALID_COUNT + 1))
    else
        # Supprimer le backup si tout est OK
        rm -f "$file.backup"
    fi
done

if [ "$INVALID_COUNT" -eq 0 ]; then
    echo "✅ Tous les fichiers JSON sont valides"
else
    echo "⚠️  $INVALID_COUNT fichier(s) ont été restaurés depuis backup"
fi

echo ""

# ============================================================================
# Étape 4 : Nettoyer les backups restants
# ============================================================================

echo "🗑️  Étape 4/4 : Nettoyage des fichiers backup..."

BACKUP_COUNT=$(find "$WORKFLOWS_DIR" -type f -name "*.backup" | wc -l)

if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "   🔍 Trouvé $BACKUP_COUNT fichier(s) backup"
    find "$WORKFLOWS_DIR" -type f -name "*.backup" -delete
    echo "   ✅ Supprimés"
else
    echo "   ✅ Aucun fichier backup à nettoyer"
fi

echo ""

# ============================================================================
# Résumé final
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Nettoyage terminé - Prolex est propre et niveau 4 ready"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Résumé :"
echo "   - Workflows manuels détectés : $MANUAL_WORKFLOWS"
echo "   - Fichiers nettoyés : $TOTAL_CLEANED"
echo "   - JSON invalides restaurés : $INVALID_COUNT"
echo ""
echo "🔄 Prochaines étapes :"
echo "   1. Vérifier les modifications : git status"
echo "   2. Commit et push : git add . && git commit -m 'cleanup: remove manual validations for level 4' && git push"
echo "   3. Vérifier la synchro auto dans n8n"
echo ""
echo "⚠️  Note : Les fichiers modifiés doivent être pushés sur GitHub"
echo "          pour que le workflow 010_sync-github-to-n8n les importe"
echo ""
