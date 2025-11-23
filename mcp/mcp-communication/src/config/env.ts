/**
 * Configuration Environnement pour MCP Communication
 * ⚠️ SÉCURITÉ RENFORCÉE
 * Utilise la configuration centralisée de Prolex
 */

import { config as centralConfig } from '../../../config/dist/config-loader';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration complète du MCP Communication
 * Mappée depuis la config centrale
 */
export const config = {
  // Environnement
  env: centralConfig.nodeEnv,
  isDevelopment: centralConfig.nodeEnv === 'development',
  isProduction: centralConfig.nodeEnv === 'production',

  // ============================================================
  // EMAIL - Gmail API ou SMTP
  // ============================================================
  email: {
    // Gmail API (recommandé)
    gmail: {
      clientId: centralConfig.email.gmail?.clientId || '',
      clientSecret: centralConfig.email.gmail?.clientSecret || '',
      refreshToken: centralConfig.email.gmail?.refreshToken || '',
      userEmail: centralConfig.email.gmail?.userEmail || '',
      enabled: !!centralConfig.email.gmail?.clientId,
    },

    // SMTP (alternatif)
    smtp: {
      host: centralConfig.email.smtp?.host || 'smtp.gmail.com',
      port: centralConfig.email.smtp?.port || 587,
      secure: centralConfig.email.smtp?.secure || false,
      user: centralConfig.email.smtp?.user || '',
      password: centralConfig.email.smtp?.password || '',
      enabled: !!centralConfig.email.smtp?.user,
    },

    from: centralConfig.email.from,
  },

  // ============================================================
  // SMS & WhatsApp - Twilio
  // ============================================================
  twilio: {
    accountSid: centralConfig.twilio.accountSid || '',
    authToken: centralConfig.twilio.authToken || '',
    phoneNumber: centralConfig.twilio.phoneNumber || '',
    whatsappNumber: centralConfig.twilio.whatsappNumber || '',
    enabled: !!centralConfig.twilio.accountSid,
  },

  // ============================================================
  // Slack
  // ============================================================
  slack: {
    botToken: centralConfig.slack.botToken || '',
    appToken: centralConfig.slack.appToken || '',
    signingSecret: centralConfig.slack.signingSecret || '',
    defaultChannel: centralConfig.slack.defaultChannel || '#general',
    enabled: !!centralConfig.slack.botToken,
  },

  // ============================================================
  // Telegram
  // ============================================================
  telegram: {
    botToken: centralConfig.telegram.botToken || '',
    defaultChatId: centralConfig.telegram.defaultChatId || '',
    enabled: !!centralConfig.telegram.botToken,
  },

  // ============================================================
  // SÉCURITÉ - Configuration Critique
  // ============================================================
  security: {
    // Whitelist
    whitelist: {
      emails: centralConfig.security.allowedEmailRecipients || [],
      telephones: centralConfig.security.allowedPhoneNumbers || [],
      domainesEmail: centralConfig.security.allowedEmailDomains || [],
      slackUsers: centralConfig.security.allowedSlackUsers || [],
      telegramChats: centralConfig.security.allowedTelegramChats || [],
    },

    // Blacklist
    blacklist: {
      contacts: centralConfig.security.blockedRecipients || [],
    },

    // Rate Limits (par heure)
    rateLimits: {
      email: centralConfig.security.rateLimitEmailPerHour || 50,
      sms: centralConfig.security.rateLimitSmsPerHour || 20,
      whatsapp: centralConfig.security.rateLimitWhatsappPerHour || 30,
      slack: centralConfig.security.rateLimitSlackPerHour || 100,
      telegram: centralConfig.security.rateLimitTelegramPerHour || 100,
      global: centralConfig.security.rateLimitGlobalPerHour || 200,
    },

    // Pièces jointes
    maxAttachmentSizeMB: centralConfig.security.maxAttachmentSizeMb || 10,

    // Confirmation
    confirmation: {
      seuilEnvoiMasse: centralConfig.security.requireConfirmationBulkThreshold,
      requiseHorsWhitelist: centralConfig.security.requireConfirmationNonWhitelisted,
    },

    // Détection de menaces
    detection: {
      activee: centralConfig.security.enableThreatDetection || false,
      bloquerLiensSuspects: centralConfig.security.blockSuspiciousLinks || false,
      scannerPiecesJointes: centralConfig.security.scanAttachments || false,
      virusTotalApiKey: centralConfig.security.virusTotalApiKey || '',
    },
  },

  // ============================================================
  // LOGGING & AUDIT
  // ============================================================
  logging: {
    systemJournal: {
      enabled: centralConfig.google.systemJournalEnabled,
      spreadsheetId: centralConfig.google.systemJournalSpreadsheetId,
    },

    securityLog: {
      enabled: centralConfig.logging.securityLogEnabled,
      path: centralConfig.logging.securityLogPath,
    },

    logAllMessages: centralConfig.logging.logAllMessages,
  },

  // ============================================================
  // ALERTES
  // ============================================================
  alertes: {
    adminEmail: centralConfig.admin.email,
    adminTelegramChatId: centralConfig.admin.telegramChatId || '',
    alerterActiviteSuspecte: centralConfig.security.alertOnSuspiciousActivity || false,
  },

  // Cache
  cache: {
    enabled: centralConfig.cache.enabled,
    ttl: centralConfig.cache.ttl,
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

console.log('✅ MCP Communication : configuration chargée depuis config-loader central');
