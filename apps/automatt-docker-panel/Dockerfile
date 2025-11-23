# ===========================================
# Dockerfile - Dashboard Docker Automatt
# ===========================================
#
# Ce Dockerfile construit une image Docker pour l'application
# Dashboard Docker Automatt.
#
# MULTI-STAGE BUILD :
# - Stage 1 (builder) : Compile le code TypeScript
# - Stage 2 (production) : Image finale légère avec seulement le code compilé
#
# SÉCURITÉ :
# - Utilise une image Node.js officielle Alpine (légère et sécurisée)
# - Utilise un utilisateur non-root pour exécuter l'application
# - N'inclut que les dépendances de production
#

# ===========================================
# STAGE 1 : BUILD
# ===========================================
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer TOUTES les dépendances (y compris devDependencies pour compiler TypeScript)
RUN npm ci

# Copier le code source
COPY tsconfig.json ./
COPY src ./src

# Compiler TypeScript → JavaScript dans dist/
RUN npm run build

# ===========================================
# STAGE 2 : PRODUCTION
# ===========================================
FROM node:20-alpine

# Métadonnées de l'image
LABEL maintainer="Automatt.ai"
LABEL description="Dashboard Docker Automatt - Interface web pour gérer vos conteneurs Docker"
LABEL version="1.0.0"

# Définir le répertoire de travail
WORKDIR /app

# Créer un utilisateur non-root pour exécuter l'application
# (meilleures pratiques de sécurité)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer SEULEMENT les dépendances de production
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code compilé depuis le stage builder
COPY --from=builder /app/dist ./dist

# Copier les vues EJS et fichiers statiques
COPY src/views ./dist/views
COPY public ./public

# Changer le propriétaire des fichiers
RUN chown -R nodejs:nodejs /app

# Basculer vers l'utilisateur non-root
USER nodejs

# Exposer le port de l'application
# Par défaut : 8080 (configurable via PORT env var)
EXPOSE 8080

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Health check
# Vérifie que l'application répond sur /health toutes les 30 secondes
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande de démarrage
CMD ["node", "dist/server.js"]
