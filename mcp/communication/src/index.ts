#!/usr/bin/env node
/**
 * Point d'entrée du serveur MCP Communication
 * Gestion multi-canal : Email, SMS, WhatsApp, Slack, Telegram
 */

import { CommunicationMCPServer } from './server.js';
import { journal } from './logging/systemJournal.js';

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('📱 [MCP COMMUNICATION] Démarrage du serveur...\n');
    console.log('🔒 [SÉCURITÉ] Mode de protection maximale activé\n');

    const server = new CommunicationMCPServer();
    await server.start();

    // Gestion de l'arrêt gracieux
    const shutdown = async () => {
      console.log('\n\n🛑 Arrêt du serveur MCP Communication...');
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
