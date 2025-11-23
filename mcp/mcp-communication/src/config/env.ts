/**
 * Configuration Environnement pour MCP Communication
 * ⚠️ SÉCURITÉ RENFORCÉE
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse une liste séparée par virgules
 */
function parseList(envVar: string | undefined, defaultValue: string[] = []): string[] {
  if (!envVar) return defaultValue;
  return envVar.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Configuration complète du MCP Communication
 */
export const config = {
  // Environnement
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // ============================================================
  // EMAIL - Gmail API ou SMTP
  // ============================================================
  email: {
    // Gmail API (recommandé)
    gmail: {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      refreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
      userEmail: process.env.GMAIL_USER_EMAIL || '',
      enabled: !!process.env.GMAIL_CLIENT_ID,
    },

    // SMTP (alternatif)
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      enabled: !!process.env.SMTP_USER,
    },

    from: process.env.EMAIL_FROM || 'Prolex AI <noreply@automatt.ai>',
  },

  // ============================================================
  // SMS & WhatsApp - Twilio
  // ============================================================
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
    enabled: !!process.env.TWILIO_ACCOUNT_SID,
  },

  // ============================================================
  // Slack
  // ============================================================
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN || '',
    appToken: process.env.SLACK_APP_TOKEN || '',
    signingSecret: process.env.SLACK_SIGNING_SECRET || '',
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || '#general',
    enabled: !!process.env.SLACK_BOT_TOKEN,
  },

  // ============================================================
  // Telegram
  // ============================================================
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    defaultChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID || '',
    enabled: !!process.env.TELEGRAM_BOT_TOKEN,
  },

  // ============================================================
  // SÉCURITÉ - Configuration Critique
  // ============================================================
  security: {
    // Whitelist
    whitelist: {
      emails: parseList(process.env.ALLOWED_EMAIL_RECIPIENTS),
      telephones: parseList(process.env.ALLOWED_PHONE_NUMBERS),
      domainesEmail: parseList(process.env.ALLOWED_EMAIL_DOMAINS),
      slackUsers: parseList(process.env.ALLOWED_SLACK_USERS),
      telegramChats: parseList(process.env.ALLOWED_TELEGRAM_CHATS),
    },

    // Blacklist
    blacklist: {
      contacts: parseList(process.env.BLOCKED_RECIPIENTS),
    },

    // Rate Limits (par heure)
    rateLimits: {
      email: parseInt(process.env.RATE_LIMIT_EMAIL_PER_HOUR || '50', 10),
      sms: parseInt(process.env.RATE_LIMIT_SMS_PER_HOUR || '20', 10),
      whatsapp: parseInt(process.env.RATE_LIMIT_WHATSAPP_PER_HOUR || '30', 10),
      slack: parseInt(process.env.RATE_LIMIT_SLACK_PER_HOUR || '100', 10),
      telegram: parseInt(process.env.RATE_LIMIT_TELEGRAM_PER_HOUR || '100', 10),
      global: parseInt(process.env.RATE_LIMIT_GLOBAL_PER_HOUR || '200', 10),
    },

    // Pièces jointes
    maxAttachmentSizeMB: parseInt(process.env.MAX_ATTACHMENT_SIZE_MB || '10', 10),

    // Confirmation
    confirmation: {
      seuilEnvoiMasse: parseInt(process.env.REQUIRE_CONFIRMATION_BULK_THRESHOLD || '10', 10),
      requiseHorsWhitelist: process.env.REQUIRE_CONFIRMATION_NON_WHITELISTED !== 'false',
    },

    // Détection de menaces
    detection: {
      activee: process.env.ENABLE_THREAT_DETECTION !== 'false',
      bloquerLiensSuspects: process.env.BLOCK_SUSPICIOUS_LINKS !== 'false',
      scannerPiecesJointes: process.env.SCAN_ATTACHMENTS === 'true',
      virusTotalApiKey: process.env.VIRUSTOTAL_API_KEY || '',
    },
  },

  // ============================================================
  // LOGGING & AUDIT
  // ============================================================
  logging: {
    systemJournal: {
      enabled: process.env.SYSTEM_JOURNAL_ENABLED === 'true',
      spreadsheetId: process.env.SYSTEM_JOURNAL_SPREADSHEET_ID || '',
    },

    securityLog: {
      enabled: process.env.SECURITY_LOG_ENABLED === 'true',
      path: process.env.SECURITY_LOG_PATH || './logs/security.log',
    },

    logAllMessages: process.env.LOG_ALL_MESSAGES !== 'false',
  },

  // ============================================================
  // ALERTES
  // ============================================================
  alertes: {
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminTelegramChatId: process.env.ADMIN_TELEGRAM_CHAT_ID || '',
    alerterActiviteSuspecte: process.env.ALERT_ON_SUSPICIOUS_ACTIVITY !== 'false',
  },

  // Cache
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  },
};

/**
 * Validation de la configuration
 */
export function validateConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifications critiques (PRODUCTION)
  if (config.isProduction) {
    // Au moins un canal doit être configuré
    const canalsActifs = [
      config.email.gmail.enabled || config.email.smtp.enabled,
      config.twilio.enabled,
      config.slack.enabled,
      config.telegram.enabled,
    ].filter(Boolean);

    if (canalsActifs.length === 0) {
      errors.push('Aucun canal de communication configuré en production');
    }

    // Whitelist obligatoire en production
    if (config.security.whitelist.emails.length === 0 &&
        config.security.whitelist.domainesEmail.length === 0) {
      warnings.push('⚠️  Aucune whitelist email configurée - RISQUE DE SPAM');
    }

    if (config.twilio.enabled && config.security.whitelist.telephones.length === 0) {
      warnings.push('⚠️  Aucune whitelist téléphone - RISQUE D\'ABUS SMS');
    }

    // Logging obligatoire
    if (!config.logging.systemJournal.enabled && !config.logging.securityLog.enabled) {
      warnings.push('⚠️  Aucun système de logging activé - Pas de traçabilité');
    }

    // Alertes admin
    if (!config.alertes.adminEmail && !config.alertes.adminTelegramChatId) {
      warnings.push('⚠️  Aucune alerte admin configurée');
    }
  }

  // Warnings (non bloquants)
  if (!config.security.detection.activee) {
    warnings.push('⚠️  Détection de menaces désactivée');
  }

  if (config.security.rateLimits.global > 500) {
    warnings.push('⚠️  Rate limit global très élevé (> 500/heure)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Affiche la configuration au démarrage
 */
export function logConfig(): void {
  console.log('\n📱 [MCP COMMUNICATION] Configuration:');
  console.log(`   Environnement: ${config.env}`);
  console.log('\n   Canaux:');
  console.log(`   Email (Gmail): ${config.email.gmail.enabled ? '✅' : '❌'}`);
  console.log(`   Email (SMTP): ${config.email.smtp.enabled ? '✅' : '❌'}`);
  console.log(`   SMS/WhatsApp (Twilio): ${config.twilio.enabled ? '✅' : '❌'}`);
  console.log(`   Slack: ${config.slack.enabled ? '✅' : '❌'}`);
  console.log(`   Telegram: ${config.telegram.enabled ? '✅' : '❌'}`);

  console.log('\n   🔒 Sécurité:');
  console.log(`   Whitelist emails: ${config.security.whitelist.emails.length} contacts`);
  console.log(`   Whitelist domaines: ${config.security.whitelist.domainesEmail.length} domaines`);
  console.log(`   Whitelist téléphones: ${config.security.whitelist.telephones.length} numéros`);
  console.log(`   Blacklist: ${config.security.blacklist.contacts.length} bloqués`);
  console.log(`   Rate limit global: ${config.security.rateLimits.global}/heure`);
  console.log(`   Détection menaces: ${config.security.detection.activee ? '✅' : '❌'}`);
  console.log(`   Confirmation envoi masse: > ${config.security.confirmation.seuilEnvoiMasse}`);

  console.log('\n   📊 Logging:');
  console.log(`   SystemJournal: ${config.logging.systemJournal.enabled ? '✅' : '❌'}`);
  console.log(`   Security Log: ${config.logging.securityLog.enabled ? '✅' : '❌'}`);
  console.log(`   Log tous messages: ${config.logging.logAllMessages ? '✅' : '❌'}`);

  console.log('');
}

/**
 * Masquer les secrets dans les logs
 */
export function maskSecrets(value: string): string {
  if (!value || value.length < 8) return '***';
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}
