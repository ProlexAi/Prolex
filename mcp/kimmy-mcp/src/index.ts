#!/usr/bin/env node
/**
 * Point d'entrée du serveur MCP Kimmy
 *
 * Ce serveur expose 3 outils via le protocole MCP :
 * - audio_to_text : Transcription audio → texte (Whisper)
 * - preprocess_text : Prétraitement de texte (nettoyage, segmentation, langue)
 * - structure_output : Structuration de sortie Kimmy (résumé, intent, entités, actions)
 *
 * Version: 1.0.0
 * Author: Automatt.ai
 */

import 'dotenv/config';
import { KimmyMcpServer } from './mcp/server.js';
import { config } from './config/paths.js';

/**
 * Fonction principale
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║         🎤 KIMMY MCP SERVER v1.0.0                   ║');
  console.log('║         Model Context Protocol for Kimmy Tools       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Afficher la configuration au démarrage
    console.log('📋 Configuration:');
    console.log(`   - Mode: ${config.mode}`);
    console.log(`   - Langue par défaut: ${config.defaultLanguage}`);
    console.log(
      `   - Whisper API: ${config.whisperApiKey ? '✅ Configurée' : '⚠️  Non configurée'}`
    );
    console.log(`   - Chemin tools: ${config.kimmyToolsPath}`);
    console.log('');

    if (config.mode === 'stub') {
      console.log('⚠️  MODE STUB ACTIVÉ');
      console.log('   Les outils retourneront des données simulées.');
      console.log('   Pour utiliser les vrais outils, configurez MODE=real dans .env');
      console.log('');
    }

    // Créer et démarrer le serveur MCP
    const mcpServer = new KimmyMcpServer();
    await mcpServer.start();

    // Gestion du shutdown gracieux
    const shutdown = async (signal: string) => {
      console.log('');
      console.log(`📡 Signal ${signal} reçu`);
      await mcpServer.stop();
      process.exit(0);
    };

    // Écouter les signaux de terminaison
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Gestion des erreurs non catchées
    process.on('uncaughtException', (error: Error) => {
      console.error('❌ Erreur non catchée:', error);
      console.error(error.stack);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('❌ Promesse rejetée non gérée:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Erreur fatale lors du démarrage:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Exécuter le serveur
main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
