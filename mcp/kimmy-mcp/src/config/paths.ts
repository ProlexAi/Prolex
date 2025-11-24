/**
 * Configuration des chemins et environnement
 *
 * Ce module centralise la lecture de la configuration depuis les variables
 * d'environnement et fournit des valeurs par défaut saines.
 */

import dotenv from 'dotenv';
import { KimmyMcpConfig } from '../types/toolTypes.js';

// Charger les variables d'environnement depuis .env
dotenv.config();

/**
 * Charge et valide la configuration du serveur MCP
 *
 * @returns Configuration complète validée
 * @throws Error si une variable requise est manquante ou invalide
 */
export function loadConfig(): KimmyMcpConfig {
  const kimmyToolsPath = process.env['KIMMY_TOOLS_PATH'] || '../kimmy-tools-pack/dist';
  const whisperApiKey = process.env['WHISPER_API_KEY'];
  const defaultLanguage = process.env['DEFAULT_LANGUAGE'] || 'fr';
  const mode = (process.env['MODE'] || 'stub') as 'stub' | 'real';

  // Validation du mode
  if (mode !== 'stub' && mode !== 'real') {
    throw new Error(`MODE invalide: ${mode}. Valeurs acceptées: stub, real`);
  }

  // Warning si mode real mais pas de chemin tools
  if (mode === 'real' && !kimmyToolsPath) {
    console.warn('⚠️  MODE=real mais KIMMY_TOOLS_PATH non défini. Utilisation du chemin par défaut.');
  }

  const config: KimmyMcpConfig = {
    kimmyToolsPath,
    whisperApiKey,
    defaultLanguage,
    mode,
  };

  // Log de la configuration (sans secrets)
  console.log('📋 Configuration chargée:');
  console.log(`   - Mode: ${config.mode}`);
  console.log(`   - Chemin tools: ${config.kimmyToolsPath}`);
  console.log(`   - Langue par défaut: ${config.defaultLanguage}`);
  console.log(`   - Whisper API: ${config.whisperApiKey ? '✅ Configurée' : '❌ Non configurée'}`);

  return config;
}

/**
 * Instance singleton de la configuration
 */
export const config: KimmyMcpConfig = loadConfig();
