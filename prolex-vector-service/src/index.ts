import dotenv from 'dotenv';
import { createServer, startServer } from './server';
import { initDatabase, checkPgVectorExtension, closeDatabase } from './db';
import { createEmbeddingProvider } from './embeddings';
import { DatabaseConfig, EmbeddingConfig } from './types';

// Charge les variables d'environnement
dotenv.config();

/**
 * Point d'entrée principal de l'application
 */
async function main() {
  try {
    console.log('🔧 Initializing Prolex Vector Service...\n');

    // Configuration de la base de données
    const dbConfig: DatabaseConfig = {
      connectionString: process.env.DATABASE_URL || '',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    };

    if (!dbConfig.connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Configuration des embeddings
    const embeddingConfig: EmbeddingConfig = {
      model: (process.env.EMBEDDING_MODEL as 'mock' | 'claude' | 'openai') || 'mock',
      apiKey: process.env.ANTHROPIC_API_KEY,
    };

    // Configuration du serveur
    const serverPort = parseInt(process.env.PORT || '3000', 10);
    const corsOrigin = process.env.CORS_ORIGIN;

    // Initialise la base de données
    console.log('[1/4] 🗄️  Connecting to PostgreSQL...');
    initDatabase(dbConfig);

    // Vérifie que pgvector est installé
    console.log('[2/4] 🔍 Checking pgvector extension...');
    await checkPgVectorExtension();

    // Crée le provider d'embeddings
    console.log('[3/4] 🧠 Initializing embedding provider...');
    const embeddingProvider = createEmbeddingProvider(embeddingConfig);
    console.log(`      Model: ${embeddingProvider.getModelName()}`);
    console.log(`      Dimension: ${embeddingProvider.getDimension()}\n`);

    // Crée et démarre le serveur
    console.log('[4/4] 🌐 Starting HTTP server...\n');
    const app = createServer({
      port: serverPort,
      corsOrigin,
      embeddingProvider,
    });

    startServer(app, serverPort);

    // Gestion du shutdown graceful
    process.on('SIGTERM', async () => {
      console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('\n⚠️  SIGINT received, shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Démarre l'application
main();
