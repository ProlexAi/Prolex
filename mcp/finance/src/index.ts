#!/usr/bin/env node
/**
 * Point d'entrée du serveur MCP Finance
 * Gestion des paiements, comptabilité, banque, crypto
 */

import { FinanceMCPServer } from './server.js';
import { journal } from './logging/systemJournal.js';

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('💰 [MCP FINANCE] Démarrage du serveur...\n');

    const server = new FinanceMCPServer();
    await server.start();

    // Gestion de l'arrêt gracieux
    const shutdown = async () => {
      console.log('\n\n🛑 Arrêt du serveur MCP Finance...');
      await server.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Keep alive
    process.stdin.resume();
  } catch (error) {
    journal.error('server_startup_error', error as Error);
    console.error('❌ Erreur fatale lors du démarrage:', (error as Error).message);
    process.exit(1);
  }
}

// Lancer le serveur
main();
