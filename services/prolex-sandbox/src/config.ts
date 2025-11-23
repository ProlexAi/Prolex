/**
 * Configuration du service Prolex Sandbox
 * Charge les variables d'environnement et expose une configuration typée
 */

import dotenv from 'dotenv';
import { SandboxConfig, ModeSandbox, DatabaseType } from './types';

// Charger les variables d'environnement
dotenv.config();

/**
 * Récupère une variable d'environnement avec une valeur par défaut
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Récupère une variable d'environnement booléenne
 */
function getBoolEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Récupère une variable d'environnement numérique
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Configuration complète du service
 */
export const config: SandboxConfig = {
  // URLs n8n
  urlN8nTest: getEnv('URL_N8N_TEST', 'http://localhost:5678'),
  urlN8nProd: getEnv('URL_N8N_PROD', 'https://n8n.automatt.ai'),

  // Mode Sandbox
  modeSandbox: getEnv('MODE_SANDBOX', 'strict') as ModeSandbox,

  // Garde-fous
  gardesFousActifs: getBoolEnv('GARDES_FOUS_ACTIFS', true),
  maxActionsParTest: getNumberEnv('MAX_ACTIONS_PAR_TEST', 50),

  // Backup (placeholder pour v2)
  backupObligatoire: getBoolEnv('BACKUP_OBLIGATOIRE', false),

  // Fichiers
  fichierScenarios: getEnv('FICHIER_SCENARIOS', './sandbox/scenarios.json'),

  // Base de données
  dbType: getEnv('DB_TYPE', 'sqlite') as DatabaseType,
  dbPath: getEnv('DB_PATH', './sandbox/sandbox.db'),
  dbHost: process.env.DB_HOST,
  dbPort: getNumberEnv('DB_PORT', 5432),
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,

  // Serveur
  port: getNumberEnv('PORT', 3001),
  host: getEnv('HOST', 'localhost'),

  // Logging
  logLevel: getEnv('LOG_LEVEL', 'info'),
};

/**
 * Valide la configuration
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Valider le mode sandbox
  if (!['strict', 'relaxed'].includes(config.modeSandbox)) {
    errors.push(`MODE_SANDBOX invalide: ${config.modeSandbox}. Utilisez "strict" ou "relaxed".`);
  }

  // Valider le type de DB
  if (!['sqlite', 'postgres'].includes(config.dbType)) {
    errors.push(`DB_TYPE invalide: ${config.dbType}. Utilisez "sqlite" ou "postgres".`);
  }

  // Valider la config Postgres si nécessaire
  if (config.dbType === 'postgres') {
    if (!config.dbHost) errors.push('DB_HOST requis pour postgres');
    if (!config.dbName) errors.push('DB_NAME requis pour postgres');
    if (!config.dbUser) errors.push('DB_USER requis pour postgres');
  }

  // Valider les limites
  if (config.maxActionsParTest < 1) {
    errors.push('MAX_ACTIONS_PAR_TEST doit être au moins 1');
  }

  if (errors.length > 0) {
    console.error('❌ Erreurs de configuration:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('✅ Configuration validée avec succès');
}

/**
 * Affiche la configuration actuelle (sans les secrets)
 */
export function printConfig(): void {
  console.log('📋 Configuration Prolex Sandbox:');
  console.log(`  Mode: ${config.modeSandbox}`);
  console.log(`  Base de données: ${config.dbType}`);
  console.log(`  Garde-fous actifs: ${config.gardesFousActifs ? 'Oui' : 'Non'}`);
  console.log(`  Max actions par test: ${config.maxActionsParTest}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Log level: ${config.logLevel}`);
}
