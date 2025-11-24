#!/bin/bash
#
# Script pour créer le projet kimmy-mcp complet
# Usage: bash scripts/create-kimmy-mcp.sh
#

set -e

PROJECT_ROOT="/home/user/Prolex"
KIMMY_MCP_DIR="$PROJECT_ROOT/mcp/kimmy-mcp"

echo "🚀 Création du projet kimmy-mcp..."

# Créer la structure de répertoires
mkdir -p "$KIMMY_MCP_DIR/src/mcp/handlers"
mkdir -p "$KIMMY_MCP_DIR/src/config"
mkdir -p "$KIMMY_MCP_DIR/src/types"

# ============================================
# 1. package.json
# ============================================
cat > "$KIMMY_MCP_DIR/package.json" <<'EOF'
{
  "name": "kimmy-mcp",
  "version": "1.0.0",
  "description": "Serveur MCP exposant les outils Kimmy (audio_to_text, preprocess_text, structure_output)",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "keywords": [
    "mcp",
    "kimmy",
    "ai",
    "tools",
    "transcription",
    "nlp"
  ],
  "author": "Automatt.ai",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# ============================================
# 2. tsconfig.json
# ============================================
cat > "$KIMMY_MCP_DIR/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# ============================================
# 3. .gitignore
# ============================================
cat > "$KIMMY_MCP_DIR/.gitignore" <<'EOF'
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# TypeScript
*.tsbuildinfo

# Testing
coverage/
.nyc_output/
EOF

# ============================================
# 4. .env.example
# ============================================
cat > "$KIMMY_MCP_DIR/.env.example" <<'EOF'
# Chemin vers le package kimmy-tools-pack compilé
# Exemple: ../kimmy-tools-pack/dist ou ./node_modules/kimmy-tools-pack/dist
KIMMY_TOOLS_PATH=../kimmy-tools-pack/dist

# Clé API pour Whisper (si utilisée pour audio_to_text)
WHISPER_API_KEY=

# Langue par défaut pour la transcription
DEFAULT_LANGUAGE=fr

# Mode de fonctionnement (stub ou real)
# stub: utilise des fonctions simulées pour démonstration
# real: charge les vrais outils depuis kimmy-tools-pack
MODE=stub
EOF

echo "✅ Fichiers de configuration créés"
echo "📦 Structure complète du projet kimmy-mcp créée dans: $KIMMY_MCP_DIR"
echo ""
echo "Prochaines étapes :"
echo "  1. cd mcp/kimmy-mcp"
echo "  2. npm install"
echo "  3. Les fichiers TypeScript seront ajoutés séparément"
