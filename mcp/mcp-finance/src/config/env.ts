/**
 * Configuration Environnement pour MCP Finance
 * Utilise la configuration centralisée de Prolex
 */

import { config as centralConfig } from '../../../config/dist/config-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration complète du MCP Finance
 * Mappée depuis la config centrale
 */
export const config = {
  // Environnement
  env: centralConfig.nodeEnv,
  isDevelopment: centralConfig.nodeEnv === 'development',
  isProduction: centralConfig.nodeEnv === 'production',

  // Stripe (Paiements)
  stripe: {
    secretKey: centralConfig.stripe.secretKey || '',
    publishableKey: centralConfig.stripe.publishableKey || '',
    webhookSecret: centralConfig.stripe.webhookSecret || '',
    enabled: !!centralConfig.stripe.secretKey,
  },

  // PayPal (Paiements alternatifs)
  paypal: {
    clientId: centralConfig.paypal.clientId || '',
    clientSecret: centralConfig.paypal.clientSecret || '',
    mode: (centralConfig.paypal.mode || 'sandbox') as 'sandbox' | 'live',
    enabled: !!centralConfig.paypal.clientId,
  },

  // Plaid (Connexion bancaire)
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID || '', // Pas encore dans config central, utiliser process.env temporairement
    secret: process.env.PLAID_SECRET || '',
    env: (process.env.PLAID_ENV || 'sandbox') as 'sandbox' | 'development' | 'production',
    enabled: !!process.env.PLAID_CLIENT_ID,
  },

  // Google Sheets (Stockage comptabilité)
  googleSheets: {
    credentialsPath: centralConfig.google.credentialsPath || join(__dirname, '../../credentials/google-sheets-key.json'),
    comptabiliteSpreadsheetId: centralConfig.google.comptabiliteSpreadsheetId || '',
    enabled: !!centralConfig.google.comptabiliteSpreadsheetId,
  },

  // CoinGecko (Crypto)
  coingecko: {
    apiKey: process.env.COINGECKO_API_KEY || '', // Pas encore dans config central
    baseUrl: 'https://api.coingecko.com/api/v3',
    enabled: true, // API gratuite, pas besoin de clé
  },

  // Binance (Crypto trading)
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '', // Pas encore dans config central
    apiSecret: process.env.BINANCE_API_SECRET || '',
    baseUrl: 'https://api.binance.com',
    enabled: !!process.env.BINANCE_API_KEY,
  },

  // SystemJournal (Logging)
  systemJournal: {
    enabled: centralConfig.google.systemJournalEnabled,
    spreadsheetId: centralConfig.google.systemJournalSpreadsheetId,
  },

  // Cache
  cache: {
    enabled: centralConfig.cache.enabled,
    ttl: centralConfig.cache.ttl,
  },

  // Sécurité
  security: {
    enableRequestValidation: centralConfig.security.enableRequestValidation,
    maxInvoiceAmount: centralConfig.security.maxInvoiceAmount || 50000,
    requireConfirmationAbove: centralConfig.security.requireConfirmationAbove || 10000,
  },

  // Taux de change
  exchangeRate: {
    apiKey: process.env.EXCHANGE_RATE_API_KEY || '', // Pas encore dans config central
    baseUrl: 'https://api.exchangerate-api.com/v4/latest',
  },

  // Webhooks
  webhooks: {
    secret: process.env.WEBHOOK_SECRET || '', // Pas encore dans config central
  },

  // Defaults
  defaults: {
    devise: 'EUR',
    tauxTVA: 20,
    delaiPaiement: 30, // jours
    langue: 'fr',
  },
};

/**
 * Validation de la configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifications critiques
  if (config.isProduction) {
    if (!config.stripe.secretKey && !config.paypal.clientId) {
      errors.push('Au moins un système de paiement (Stripe ou PayPal) doit être configuré en production');
    }

    if (!config.googleSheets.comptabiliteSpreadsheetId && config.googleSheets.enabled) {
      errors.push('COMPTABILITE_SPREADSHEET_ID est requis pour le stockage comptable');
    }
  }

  // Warnings (non bloquants)
  if (!config.systemJournal.enabled) {
    console.warn('[CONFIG] ⚠️  SystemJournal désactivé - Les logs ne seront pas persistés');
  }

  if (!config.cache.enabled) {
    console.warn('[CONFIG] ⚠️  Cache désactivé - Performances réduites');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Affiche la configuration au démarrage
 */
export function logConfig(): void {
  console.log('\n📊 [MCP FINANCE] Configuration:');
  console.log(`   Environnement: ${config.env}`);
  console.log(`   Stripe: ${config.stripe.enabled ? '✅' : '❌'}`);
  console.log(`   PayPal: ${config.paypal.enabled ? '✅' : '❌'}`);
  console.log(`   Plaid (Banque): ${config.plaid.enabled ? '✅' : '❌'}`);
  console.log(`   Google Sheets: ${config.googleSheets.enabled ? '✅' : '❌'}`);
  console.log(`   CoinGecko (Crypto): ${config.coingecko.enabled ? '✅' : '❌'}`);
  console.log(`   SystemJournal: ${config.systemJournal.enabled ? '✅' : '❌'}`);
  console.log(`   Cache: ${config.cache.enabled ? '✅' : '❌'}`);
  console.log('');
}
