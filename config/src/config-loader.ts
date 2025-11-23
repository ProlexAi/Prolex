/**
 * @fileoverview Configuration Loader - Module central de configuration pour Prolex
 *
 * Ce module charge et valide toutes les variables d'environnement pour l'ensemble
 * du projet Prolex (MCP servers, services, outils).
 *
 * @module config-loader
 * @version 1.0.0
 * @author Automatt.ai
 *
 * @example
 * ```typescript
 * import { config } from '@prolex/config';
 *
 * const n8nClient = new N8nClient({
 *   baseUrl: config.n8n.baseUrl,
 *   apiKey: config.n8n.apiKey
 * });
 * ```
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// ═══════════════════════════════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════════════════════════════

/**
 * Type d'environnement Prolex
 */
export type ProlexEnv = 'local' | 'vps' | 'test';

/**
 * Type d'environnement Node.js
 */
export type NodeEnv = 'development' | 'staging' | 'production';

/**
 * Configuration n8n
 */
export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  host?: string;
  port?: number;
  protocol?: string;
  encryptionKey?: string;
  basicAuth?: {
    active: boolean;
    user?: string;
    password?: string;
  };
}

/**
 * Configuration des LLMs (OpenAI, Anthropic, etc.)
 */
export interface LLMConfig {
  provider: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}

/**
 * Configuration PostgreSQL
 */
export interface DatabaseConfig {
  url: string;
  user?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
}

/**
 * Configuration Redis
 */
export interface RedisConfig {
  url?: string;
  password?: string;
}

/**
 * Configuration Google Services
 */
export interface GoogleConfig {
  credentialsPath?: string;
  systemJournalSpreadsheetId: string;
  systemJournalEnabled: boolean;
  comptabiliteSpreadsheetId?: string;
}

/**
 * Configuration Stripe
 */
export interface StripeConfig {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
}

/**
 * Configuration PayPal
 */
export interface PayPalConfig {
  clientId?: string;
  clientSecret?: string;
  mode?: string;
}

/**
 * Configuration Email (Gmail ou SMTP)
 */
export interface EmailConfig {
  from: string;
  gmail?: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    userEmail?: string;
  };
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    password?: string;
  };
}

/**
 * Configuration Twilio (SMS/WhatsApp)
 */
export interface TwilioConfig {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
}

/**
 * Configuration Slack
 */
export interface SlackConfig {
  botToken?: string;
  appToken?: string;
  signingSecret?: string;
  defaultChannel?: string;
}

/**
 * Configuration Telegram
 */
export interface TelegramConfig {
  botToken?: string;
  defaultChatId?: string;
}

/**
 * Configuration de sécurité (whitelists, rate limiting, etc.)
 */
export interface SecurityConfig {
  // Whitelists
  allowedEmailRecipients?: string[];
  allowedPhoneNumbers?: string[];
  allowedSlackUsers?: string[];
  allowedTelegramChats?: string[];
  allowedEmailDomains?: string[];
  blockedRecipients?: string[];

  // Confirmations
  requireConfirmationNonWhitelisted: boolean;
  requireConfirmationBulkThreshold: number;
  requireConfirmationAbove?: number;

  // Rate limiting - Communication
  rateLimitEmailPerHour?: number;
  rateLimitSmsPerHour?: number;
  rateLimitWhatsappPerHour?: number;
  rateLimitSlackPerHour?: number;
  rateLimitTelegramPerHour?: number;
  rateLimitGlobalPerHour?: number;

  // Rate limiting - n8n
  rateLimitPerSecond?: number;
  rateLimitMaxConcurrent?: number;
  rateLimitQueueSize?: number;

  // Validations
  enableRequestValidation: boolean;
  maxInvoiceAmount?: number;
  maxAttachmentSizeMb?: number;

  // Threat detection
  enableThreatDetection?: boolean;
  blockSuspiciousLinks?: boolean;
  alertOnSuspiciousActivity?: boolean;
  virusTotalApiKey?: string;
  scanAttachments?: boolean;
}

/**
 * Configuration du cache
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  checkPeriod?: number;
}

/**
 * Configuration de retry/resilience
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  fallbackWorkflowId?: string;
}

/**
 * Configuration du Prolex Sandbox
 */
export interface SandboxConfig {
  urlN8nTest: string;
  urlN8nProd: string;
  mode: 'strict' | 'relaxed';
  gardesFousActifs: boolean;
  maxActionsParTest: number;
  backupObligatoire: boolean;
  dbType: 'sqlite' | 'postgres';
  dbPath?: string;
  port: number;
  host: string;
  fichierScenarios: string;
}

/**
 * Configuration du Vector Service
 */
export interface VectorServiceConfig {
  port: number;
  embeddingModel: string;
  corsOrigin?: string;
}

/**
 * Configuration MCP Servers
 */
export interface McpConfig {
  port: number;
  debug: boolean;
  healthcheckPort: number;
}

/**
 * Configuration Logging
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  path: string;
  logAllMessages: boolean;
  securityLogEnabled: boolean;
  securityLogPath: string;
}

/**
 * Configuration Streaming (n8n)
 */
export interface StreamingConfig {
  enabled: boolean;
  pollInterval: number;
}

/**
 * Configuration Admin (alertes)
 */
export interface AdminConfig {
  email: string;
  telegramChatId?: string;
}

/**
 * Configuration Traefik (VPS uniquement)
 */
export interface TraefikConfig {
  acmeEmail?: string;
  allowedIps?: string[];
}

/**
 * Interface principale de configuration Prolex
 */
export interface ProlexConfig {
  // Environnement
  env: ProlexEnv;
  nodeEnv: NodeEnv;
  domainRoot?: string;

  // Services principaux
  n8n: N8nConfig;
  llm: LLMConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  google: GoogleConfig;

  // Paiements (MCP Finance)
  stripe: StripeConfig;
  paypal: PayPalConfig;

  // Communication (MCP Communication)
  email: EmailConfig;
  twilio: TwilioConfig;
  slack: SlackConfig;
  telegram: TelegramConfig;

  // Sécurité & Rate Limiting
  security: SecurityConfig;

  // Cache & Resilience
  cache: CacheConfig;
  retry: RetryConfig;

  // Services internes
  sandbox: SandboxConfig;
  vectorService: VectorServiceConfig;
  mcp: McpConfig;

  // Logging & Streaming
  logging: LoggingConfig;
  streaming: StreamingConfig;

  // Admin
  admin: AdminConfig;

  // Traefik (VPS)
  traefik: TraefikConfig;
}

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

/**
 * Parse une valeur d'environnement en entier
 */
function parseIntEnv(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse une valeur d'environnement en booléen
 */
function parseBoolEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse une liste séparée par virgules
 */
function parseListEnv(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Valide la présence des variables critiques
 */
function validateCriticalVars(env: NodeJS.ProcessEnv): void {
  const critical: string[] = [
    'N8N_BASE_URL',
    'DATABASE_URL',
    'SYSTEM_JOURNAL_SPREADSHEET_ID',
  ];

  const missing = critical.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Variables d'environnement critiques manquantes:\n` +
      missing.map(key => `   - ${key}`).join('\n') +
      `\n\n📖 Vérifiez votre fichier .env.local ou .env.vps`
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// Chargement de la configuration
// ═══════════════════════════════════════════════════════════════════

/**
 * Charge le fichier .env approprié selon l'environnement
 */
function loadEnvFile(): void {
  // Déterminer le répertoire racine du projet
  const projectRoot = path.resolve(__dirname, '../..');

  // Déterminer l'environnement
  const prolexEnv = (process.env.PROLEX_ENV || 'local') as ProlexEnv;

  // Déterminer le fichier .env à charger
  let envFile: string;
  switch (prolexEnv) {
    case 'vps':
      envFile = path.join(projectRoot, '.env.vps');
      break;
    case 'test':
      envFile = path.join(projectRoot, '.env.test');
      break;
    case 'local':
    default:
      envFile = path.join(projectRoot, '.env.local');
      break;
  }

  // Charger le fichier .env s'il existe
  if (fs.existsSync(envFile)) {
    console.log(`✅ Chargement de la configuration : ${envFile}`);
    dotenv.config({ path: envFile });
  } else {
    console.warn(`⚠️  Fichier ${envFile} non trouvé. Utilisation des variables d'environnement système.`);
  }
}

/**
 * Construit l'objet de configuration à partir des variables d'environnement
 */
function buildConfig(): ProlexConfig {
  const env = process.env;

  return {
    // Environnement
    env: (env.PROLEX_ENV || 'local') as ProlexEnv,
    nodeEnv: (env.NODE_ENV || 'development') as NodeEnv,
    domainRoot: env.DOMAIN_ROOT,

    // n8n
    n8n: {
      baseUrl: env.N8N_BASE_URL!,
      apiKey: env.N8N_API_KEY || '',
      timeout: parseIntEnv(env.N8N_TIMEOUT, 30000),
      host: env.N8N_HOST,
      port: parseIntEnv(env.N8N_PORT, 5678),
      protocol: env.N8N_PROTOCOL,
      encryptionKey: env.N8N_ENCRYPTION_KEY,
      basicAuth: {
        active: parseBoolEnv(env.N8N_BASIC_AUTH_ACTIVE, false),
        user: env.N8N_BASIC_AUTH_USER,
        password: env.N8N_BASIC_AUTH_PASSWORD,
      },
    },

    // LLM
    llm: {
      provider: env.LLM_PROVIDER || 'anthropic',
      openaiApiKey: env.OPENAI_API_KEY,
      anthropicApiKey: env.ANTHROPIC_API_KEY,
    },

    // Database
    database: {
      url: env.DATABASE_URL!,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      database: env.POSTGRES_DB,
      host: env.POSTGRES_HOST,
      port: parseIntEnv(env.POSTGRES_PORT, 5432),
    },

    // Redis
    redis: {
      url: env.REDIS_URL,
      password: env.REDIS_PASSWORD,
    },

    // Google
    google: {
      credentialsPath: env.GOOGLE_SHEETS_CREDENTIALS_PATH,
      systemJournalSpreadsheetId: env.SYSTEM_JOURNAL_SPREADSHEET_ID!,
      systemJournalEnabled: parseBoolEnv(env.SYSTEM_JOURNAL_ENABLED, true),
      comptabiliteSpreadsheetId: env.COMPTABILITE_SPREADSHEET_ID,
    },

    // Stripe
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },

    // PayPal
    paypal: {
      clientId: env.PAYPAL_CLIENT_ID,
      clientSecret: env.PAYPAL_CLIENT_SECRET,
      mode: env.PAYPAL_MODE,
    },

    // Email
    email: {
      from: env.EMAIL_FROM || 'Prolex AI <noreply@automatt.ai>',
      gmail: {
        clientId: env.GMAIL_CLIENT_ID,
        clientSecret: env.GMAIL_CLIENT_SECRET,
        refreshToken: env.GMAIL_REFRESH_TOKEN,
        userEmail: env.GMAIL_USER_EMAIL,
      },
      smtp: {
        host: env.SMTP_HOST,
        port: parseIntEnv(env.SMTP_PORT, 587),
        secure: parseBoolEnv(env.SMTP_SECURE, false),
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
      },
    },

    // Twilio
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_PHONE_NUMBER,
      whatsappNumber: env.TWILIO_WHATSAPP_NUMBER,
    },

    // Slack
    slack: {
      botToken: env.SLACK_BOT_TOKEN,
      appToken: env.SLACK_APP_TOKEN,
      signingSecret: env.SLACK_SIGNING_SECRET,
      defaultChannel: env.SLACK_DEFAULT_CHANNEL,
    },

    // Telegram
    telegram: {
      botToken: env.TELEGRAM_BOT_TOKEN,
      defaultChatId: env.TELEGRAM_DEFAULT_CHAT_ID,
    },

    // Security
    security: {
      allowedEmailRecipients: parseListEnv(env.ALLOWED_EMAIL_RECIPIENTS),
      allowedPhoneNumbers: parseListEnv(env.ALLOWED_PHONE_NUMBERS),
      allowedSlackUsers: parseListEnv(env.ALLOWED_SLACK_USERS),
      allowedTelegramChats: parseListEnv(env.ALLOWED_TELEGRAM_CHATS),
      allowedEmailDomains: parseListEnv(env.ALLOWED_EMAIL_DOMAINS),
      blockedRecipients: parseListEnv(env.BLOCKED_RECIPIENTS),
      requireConfirmationNonWhitelisted: parseBoolEnv(env.REQUIRE_CONFIRMATION_NON_WHITELISTED, true),
      requireConfirmationBulkThreshold: parseIntEnv(env.REQUIRE_CONFIRMATION_BULK_THRESHOLD, 10),
      requireConfirmationAbove: parseIntEnv(env.REQUIRE_CONFIRMATION_ABOVE, 10000),
      rateLimitEmailPerHour: parseIntEnv(env.RATE_LIMIT_EMAIL_PER_HOUR, 50),
      rateLimitSmsPerHour: parseIntEnv(env.RATE_LIMIT_SMS_PER_HOUR, 20),
      rateLimitWhatsappPerHour: parseIntEnv(env.RATE_LIMIT_WHATSAPP_PER_HOUR, 30),
      rateLimitSlackPerHour: parseIntEnv(env.RATE_LIMIT_SLACK_PER_HOUR, 100),
      rateLimitTelegramPerHour: parseIntEnv(env.RATE_LIMIT_TELEGRAM_PER_HOUR, 100),
      rateLimitGlobalPerHour: parseIntEnv(env.RATE_LIMIT_GLOBAL_PER_HOUR, 200),
      rateLimitPerSecond: parseIntEnv(env.RATE_LIMIT_PER_SECOND, 10),
      rateLimitMaxConcurrent: parseIntEnv(env.RATE_LIMIT_MAX_CONCURRENT, 5),
      rateLimitQueueSize: parseIntEnv(env.RATE_LIMIT_QUEUE_SIZE, 100),
      enableRequestValidation: parseBoolEnv(env.ENABLE_REQUEST_VALIDATION, true),
      maxInvoiceAmount: parseIntEnv(env.MAX_INVOICE_AMOUNT, 50000),
      maxAttachmentSizeMb: parseIntEnv(env.MAX_ATTACHMENT_SIZE_MB, 10),
      enableThreatDetection: parseBoolEnv(env.ENABLE_THREAT_DETECTION, true),
      blockSuspiciousLinks: parseBoolEnv(env.BLOCK_SUSPICIOUS_LINKS, true),
      alertOnSuspiciousActivity: parseBoolEnv(env.ALERT_ON_SUSPICIOUS_ACTIVITY, true),
      virusTotalApiKey: env.VIRUSTOTAL_API_KEY,
      scanAttachments: parseBoolEnv(env.SCAN_ATTACHMENTS, false),
    },

    // Cache
    cache: {
      enabled: parseBoolEnv(env.CACHE_ENABLED, true),
      ttl: parseIntEnv(env.CACHE_TTL || env.CACHE_TTL_SECONDS, 300),
      checkPeriod: parseIntEnv(env.CACHE_CHECK_PERIOD, 60),
    },

    // Retry
    retry: {
      maxAttempts: parseIntEnv(env.RETRY_MAX_ATTEMPTS, 3),
      initialDelay: parseIntEnv(env.RETRY_INITIAL_DELAY, 1000),
      maxDelay: parseIntEnv(env.RETRY_MAX_DELAY, 10000),
      backoffMultiplier: parseIntEnv(env.RETRY_BACKOFF_MULTIPLIER, 2),
      fallbackWorkflowId: env.RETRY_FALLBACK_WORKFLOW_ID,
    },

    // Sandbox
    sandbox: {
      urlN8nTest: env.URL_N8N_TEST || 'http://localhost:5678',
      urlN8nProd: env.URL_N8N_PROD || 'https://n8n.automatt.ai',
      mode: (env.MODE_SANDBOX || 'strict') as 'strict' | 'relaxed',
      gardesFousActifs: parseBoolEnv(env.GARDES_FOUS_ACTIFS, true),
      maxActionsParTest: parseIntEnv(env.MAX_ACTIONS_PAR_TEST, 50),
      backupObligatoire: parseBoolEnv(env.BACKUP_OBLIGATOIRE, false),
      dbType: (env.DB_TYPE || 'sqlite') as 'sqlite' | 'postgres',
      dbPath: env.DB_PATH,
      port: parseIntEnv(env.SANDBOX_PORT, 3001),
      host: env.SANDBOX_HOST || 'localhost',
      fichierScenarios: env.FICHIER_SCENARIOS || './sandbox/scenarios.json',
    },

    // Vector Service
    vectorService: {
      port: parseIntEnv(env.VECTOR_SERVICE_PORT, 3000),
      embeddingModel: env.EMBEDDING_MODEL || 'mock',
      corsOrigin: env.CORS_ORIGIN,
    },

    // MCP
    mcp: {
      port: parseIntEnv(env.MCP_SERVER_PORT, 3100),
      debug: parseBoolEnv(env.MCP_DEBUG, false),
      healthcheckPort: parseIntEnv(env.HEALTHCHECK_PORT, 3000),
    },

    // Logging
    logging: {
      level: (env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',
      path: env.LOG_PATH || './logs',
      logAllMessages: parseBoolEnv(env.LOG_ALL_MESSAGES, true),
      securityLogEnabled: parseBoolEnv(env.SECURITY_LOG_ENABLED, true),
      securityLogPath: env.SECURITY_LOG_PATH || './logs/security.log',
    },

    // Streaming
    streaming: {
      enabled: parseBoolEnv(env.STREAMING_ENABLED, true),
      pollInterval: parseIntEnv(env.STREAMING_POLL_INTERVAL, 1000),
    },

    // Admin
    admin: {
      email: env.ADMIN_EMAIL || 'matthieu@automatt.ai',
      telegramChatId: env.ADMIN_TELEGRAM_CHAT_ID,
    },

    // Traefik
    traefik: {
      acmeEmail: env.TRAEFIK_ACME_EMAIL,
      allowedIps: parseListEnv(env.ALLOWED_IPS),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Initialisation
// ═══════════════════════════════════════════════════════════════════

// Charger le fichier .env
loadEnvFile();

// Valider les variables critiques
validateCriticalVars(process.env);

// Construire et exporter la configuration
export const config: ProlexConfig = buildConfig();

// Export de l'environnement pour faciliter les tests conditionnels
export const isLocal = config.env === 'local';
export const isVps = config.env === 'vps';
export const isTest = config.env === 'test';
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';

// Log de confirmation
console.log(`🚀 Configuration Prolex chargée avec succès`);
console.log(`   - Environnement: ${config.env}`);
console.log(`   - Node Env: ${config.nodeEnv}`);
console.log(`   - n8n: ${config.n8n.baseUrl}`);
console.log(`   - Database: ${config.database.url.replace(/:[^:@]+@/, ':****@')}`); // Masquer le password
console.log(`   - SystemJournal: ${config.google.systemJournalEnabled ? 'Activé' : 'Désactivé'}`);
