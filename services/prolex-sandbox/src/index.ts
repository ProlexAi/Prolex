/**
 * Point d'entrée du service Prolex Sandbox
 */

import { config, validateConfig, printConfig } from './config';
import { initDatabase, closeDatabase } from './db';
import { createServer } from './server';

/**
 * Fonction principale
 */
async function main(): Promise<void> {
  console.log('\n🚀 Démarrage de Prolex Sandbox...\n');

  // Valider la configuration
  validateConfig();
  printConfig();

  // Initialiser la base de données
  await initDatabase();

  // Créer le serveur
  const app = createServer();

  // Démarrer le serveur
  const server = app.listen(config.port, config.host, () => {
    console.log(`\n✅ Serveur Prolex Sandbox démarré`);
    console.log(`📍 URL: http://${config.host}:${config.port}`);
    console.log(`🏥 Health check: http://${config.host}:${config.port}/health`);
    console.log(`\n📋 Endpoints disponibles:`);
    console.log(`   POST   /api/scenarios           - Créer un scénario`);
    console.log(`   GET    /api/scenarios           - Liste des scénarios`);
    console.log(`   GET    /api/scenarios/:id       - Détails d'un scénario`);
    console.log(`   POST   /api/run                 - Lancer une simulation`);
    console.log(`   GET    /api/runs/:runId         - Détails d'une exécution`);
    console.log(`\n💡 Mode: ${config.modeSandbox} | Garde-fous: ${config.gardesFousActifs ? 'Actifs' : 'Inactifs'}`);
    console.log(`\nAppuyez sur Ctrl+C pour arrêter\n`);
  });

  // Gestion de l'arrêt propre
  const shutdown = async (signal: string) => {
    console.log(`\n\n🛑 Signal ${signal} reçu, arrêt en cours...`);

    server.close(async () => {
      console.log('🔌 Serveur HTTP fermé');

      await closeDatabase();

      console.log('✅ Arrêt propre terminé\n');
      process.exit(0);
    });

    // Forcer l'arrêt après 10 secondes
    setTimeout(() => {
      console.error('⚠️  Timeout d\'arrêt, forçage...');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Gestion des erreurs non capturées
  process.on('uncaughtException', (error) => {
    console.error('❌ Exception non capturée:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
    shutdown('unhandledRejection');
  });
}

// Lancer l'application
main().catch((error) => {
  console.error('❌ Erreur fatale lors du démarrage:', error);
  process.exit(1);
});
