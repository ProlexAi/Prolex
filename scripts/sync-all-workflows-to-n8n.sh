#!/bin/bash
# ============================================================================
# sync-all-workflows-to-n8n.sh — Import/Update TOUS les workflows dans n8n
# ============================================================================
#
# Ce script importe ou met à jour tous les workflows du dossier
# n8n-workflows/ dans l'instance n8n locale ou distante.
#
# Date : 22 novembre 2025
# Version : 1.0
# Auteur : Matthieu (Automatt.ai)
#
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "🔄 Synchronisation de tous les workflows vers n8n..."
echo ""

# ============================================================================
# Configuration
# ============================================================================

N8N_API_URL="${N8N_API_URL:-http://localhost:5678/api/v1}"
N8N_API_KEY="${N8N_API_KEY}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKFLOWS_DIR="$REPO_ROOT/n8n-workflows"

if [ -z "$N8N_API_KEY" ]; then
    echo "❌ Erreur : N8N_API_KEY n'est pas défini"
    echo "   Export : export N8N_API_KEY='votre_cle_api'"
    exit 1
fi

echo "📁 Répertoire workflows : $WORKFLOWS_DIR"
echo "🔗 API n8n : $N8N_API_URL"
echo ""

# Vérifier connectivité n8n
echo "🔍 Vérification connexion n8n..."
if ! curl -f -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_API_URL/workflows" > /dev/null 2>&1; then
    echo "❌ Impossible de se connecter à n8n API"
    echo "   Vérifier que n8n est démarré et que la clé API est correcte"
    exit 1
fi
echo "✅ Connexion n8n OK"
echo ""

# ============================================================================
# Récupérer la liste des workflows existants dans n8n
# ============================================================================

echo "📋 Récupération des workflows existants dans n8n..."

EXISTING_WORKFLOWS=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_API_URL/workflows" | jq -r '.data[] | "\(.id)|\(.name)"')

echo "   Trouvé $(echo "$EXISTING_WORKFLOWS" | wc -l) workflow(s) existant(s)"
echo ""

# ============================================================================
# Fonction : Obtenir ID workflow par nom
# ============================================================================

get_workflow_id_by_name() {
    local workflow_name="$1"
    echo "$EXISTING_WORKFLOWS" | grep -F "$workflow_name" | cut -d'|' -f1 || echo ""
}

# ============================================================================
# Traiter chaque fichier JSON
# ============================================================================

echo "🔄 Traitement des workflows..."
echo ""

CREATED_COUNT=0
UPDATED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

for workflow_file in "$WORKFLOWS_DIR"/*.json; do
    if [ ! -f "$workflow_file" ]; then
        continue
    fi

    filename=$(basename "$workflow_file")
    echo "📄 Traitement : $filename"

    # Extraire le nom du workflow depuis le JSON
    workflow_name=$(jq -r '.name' "$workflow_file" 2>/dev/null)

    if [ -z "$workflow_name" ] || [ "$workflow_name" = "null" ]; then
        echo "   ⚠️  Impossible d'extraire le nom du workflow, skip"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        echo ""
        continue
    fi

    echo "   📛 Nom : $workflow_name"

    # Vérifier si le workflow existe déjà
    existing_id=$(get_workflow_id_by_name "$workflow_name")

    if [ -z "$existing_id" ]; then
        # Workflow n'existe pas → CREATE
        echo "   ➕ Création du workflow..."

        response=$(curl -s -X POST "$N8N_API_URL/workflows" \
            -H "X-N8N-API-KEY: $N8N_API_KEY" \
            -H "Content-Type: application/json" \
            -d @"$workflow_file")

        new_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ -n "$new_id" ] && [ "$new_id" != "null" ]; then
            echo "   ✅ Créé avec ID : $new_id"
            CREATED_COUNT=$((CREATED_COUNT + 1))
        else
            echo "   ❌ Erreur création : $(echo "$response" | jq -r '.message // "Unknown error"')"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    else
        # Workflow existe déjà → UPDATE
        echo "   🔄 Mise à jour du workflow (ID: $existing_id)..."

        response=$(curl -s -X PATCH "$N8N_API_URL/workflows/$existing_id" \
            -H "X-N8N-API-KEY: $N8N_API_KEY" \
            -H "Content-Type: application/json" \
            -d @"$workflow_file")

        updated_id=$(echo "$response" | jq -r '.id' 2>/dev/null)

        if [ "$updated_id" = "$existing_id" ]; then
            echo "   ✅ Mis à jour"
            UPDATED_COUNT=$((UPDATED_COUNT + 1))
        else
            echo "   ❌ Erreur mise à jour : $(echo "$response" | jq -r '.message // "Unknown error"')"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    fi

    echo ""
done

# ============================================================================
# Résumé final
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Synchronisation terminée"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Résumé :"
echo "   - Workflows créés : $CREATED_COUNT"
echo "   - Workflows mis à jour : $UPDATED_COUNT"
echo "   - Workflows ignorés : $SKIPPED_COUNT"
echo "   - Erreurs : $ERROR_COUNT"
echo ""

if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "⚠️  Attention : $ERROR_COUNT erreur(s) détectée(s)"
    echo "   Vérifier les logs ci-dessus pour plus de détails"
    exit 1
else
    echo "🎉 Tous les workflows sont synchronisés avec succès !"
fi

echo ""
echo "🔄 Prochaines étapes :"
echo "   1. Ouvrir n8n : http://localhost:5678"
echo "   2. Vérifier que tous les workflows sont présents"
echo "   3. Activer les workflows nécessaires (ex: 005, 010, 050)"
echo "   4. Configurer les credentials si nécessaire (Telegram, Google Sheets, etc.)"
echo ""
