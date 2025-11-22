#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Import du workflow de maintenance quotidienne"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Fichier .env introuvable${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$N8N_BASE_URL" ] || [ "$N8N_API_KEY" = "your-api-key-here" ]; then
    echo -e "${RED}❌ Configuration n8n manquante dans .env${NC}"
    echo ""
    echo "Veuillez éditer le fichier .env et configurer :"
    echo "  - N8N_BASE_URL (ex: http://localhost:5678)"
    echo "  - N8N_API_KEY (votre clé API n8n)"
    echo ""
    echo "Pour obtenir votre clé API n8n :"
    echo "  1. Connectez-vous à n8n"
    echo "  2. Allez dans Settings → API"
    echo "  3. Créez ou copiez une clé API"
    exit 1
fi

echo -e "${GREEN}✅ Configuration chargée${NC}"
echo "   URL n8n: $N8N_BASE_URL"
echo ""

# Check if n8n is reachable
echo "🔍 Vérification de la connexion à n8n..."
if ! curl -s -f -m 5 "$N8N_BASE_URL/healthz" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Impossible de joindre n8n à $N8N_BASE_URL${NC}"
    echo "   Vérifiez que n8n est démarré"
fi

# Run the TypeScript import script
echo ""
echo "📦 Exécution du script d'import..."
echo ""

cd "$(dirname "$0")"
npx tsx scripts/import-workflow-direct.ts

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Import terminé !"
echo "==========================================${NC}"
echo ""
echo "Le workflow '050_daily_full_maintenance_prolex_v4' est maintenant :"
echo "  - Importé dans n8n"
echo "  - ACTIF (s'exécute tous les jours à 4h00)"
echo ""
echo "🔍 Pour vérifier :"
echo "  1. Ouvrez n8n : $N8N_BASE_URL"
echo "  2. Allez dans 'Workflows'"
echo "  3. Cherchez '050_daily_full_maintenance_prolex_v4'"
echo ""
echo "📝 Log de maintenance : /opt/Prolex/mcp/n8n-server/DAILY_MAINTENANCE_LOG.txt"
