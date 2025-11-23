/**
 * Configuration Environnement pour MCP Finance
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration complète du MCP Finance
 */
export const config = {
  // Environnement
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Stripe (Paiements)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    enabled: !!process.env.STRIPE_SECRET_KEY,
  },

  // PayPal (Paiements alternatifs)
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: (process.env.PAYPAL_MODE || 'sandbox') as 'sandbox' | 'live',
    enabled: !!process.env.PAYPAL_CLIENT_ID,
  },

  // Plaid (Connexion bancaire)
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID || '',
    secret: process.env.PLAID_SECRET || '',
    env: (process.env.PLAID_ENV || 'sandbox') as 'sandbox' | 'development' | 'production',
    enabled: !!process.env.PLAID_CLIENT_ID,
  },

  // Google Sheets (Stockage comptabilité)
  googleSheets: {
    credentialsPath: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || join(__dirname, '../../credentials/google-sheets-key.json'),
    comptabiliteSpreadsheetId: process.env.COMPTABILITE_SPREADSHEET_ID || '',
    enabled: !!process.env.COMPTABILITE_SPREADSHEET_ID,
  },

  // CoinGecko (Crypto)
  coingecko: {
    apiKey: process.env.COINGECKO_API_KEY || '',
    baseUrl: 'https://api.coingecko.com/api/v3',
    enabled: true, // API gratuite, pas besoin de clé
  },

  // Binance (Crypto trading)
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    apiSecret: process.env.BINANCE_API_SECRET || '',
    baseUrl: 'https://api.binance.com',
    enabled: !!process.env.BINANCE_API_KEY,
  },

  // SystemJournal (Logging)
  systemJournal: {
    enabled: process.env.SYSTEM_JOURNAL_ENABLED === 'true',
    spreadsheetId: process.env.SYSTEM_JOURNAL_SPREADSHEET_ID || '',
  },

  // Cache
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  },

  // Sécurité
  security: {
    enableRequestValidation: process.env.ENABLE_REQUEST_VALIDATION !== 'false',
    maxInvoiceAmount: parseFloat(process.env.MAX_INVOICE_AMOUNT || '50000'),
    requireConfirmationAbove: parseFloat(process.env.REQUIRE_CONFIRMATION_ABOVE || '10000'),
  },

  // Taux de change
  exchangeRate: {
    apiKey: process.env.EXCHANGE_RATE_API_KEY || '',
    baseUrl: 'https://api.exchangerate-api.com/v4/latest',
  },

  // Webhooks
  webhooks: {
    secret: process.env.WEBHOOK_SECRET || '',
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
