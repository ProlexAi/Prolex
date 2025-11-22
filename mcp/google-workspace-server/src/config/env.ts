/**
 * Environment Configuration with Zod Validation
 * SECURITY: Validates all environment variables before app starts
 */

import { z } from 'zod';
import 'dotenv/config';

/**
 * Environment variable schema with strict validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Google OAuth2 credentials (mutually exclusive with service account)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // Google Service Account (recommended for server-to-server)
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_KEY_PATH: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),

  // Google API scopes
  GOOGLE_SCOPES: z
    .string()
    .default(
      'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive'
    ),

  // SystemJournal settings
  SYSTEM_JOURNAL_SPREADSHEET_ID: z.string().optional(),
  PROLEX_DRIVE_FOLDER_ID: z.string().optional(),

  // Cache & rate limiting
  CACHE_TTL: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  SYSTEM_JOURNAL_LOG_PATH: z.string().default('./logs/system-journal.jsonl'),
  LOG_PRETTY: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),

  // Healthcheck
  HEALTHCHECK_PORT: z.coerce.number().int().positive().default(3001),

  // Retry configuration
  RETRY_MAX_ATTEMPTS: z.coerce.number().int().positive().default(3),
  RETRY_DELAY_MS: z.coerce.number().int().positive().default(1000),

  // MCP server
  MCP_SERVER_NAME: z.string().default('google-workspace-mcp-server'),
  MCP_SERVER_VERSION: z.string().default('1.0.0'),

  // Security
  ENABLE_REQUEST_VALIDATION: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(10485760), // 10MB
});

/**
 * Parse and validate environment variables
 */
function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Environment validation failed');
  }

  // SECURITY: Check that at least one auth method is configured
  const hasOAuth =
    parsed.data.GOOGLE_CLIENT_ID &&
    parsed.data.GOOGLE_CLIENT_SECRET &&
    parsed.data.GOOGLE_REDIRECT_URI;

  const hasServiceAccount =
    parsed.data.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    (parsed.data.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || parsed.data.GOOGLE_SERVICE_ACCOUNT_JSON);

  if (!hasOAuth && !hasServiceAccount) {
    throw new Error(
      '🚨 SECURITY ERROR: No Google authentication method configured. ' +
        'Please provide either OAuth2 credentials or Service Account credentials in .env file.'
    );
  }

  return parsed.data;
}

/**
 * Validated environment configuration
 */
export const config = validateEnv();

/**
 * Get Google scopes as array
 */
export function getGoogleScopes(): string[] {
  return config.GOOGLE_SCOPES.split(' ').filter((s) => s.length > 0);
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return config.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return config.NODE_ENV === 'development';
}

/**
 * Get authentication method being used
 */
export function getAuthMethod(): 'oauth2' | 'service_account' {
  if (
    config.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    (config.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || config.GOOGLE_SERVICE_ACCOUNT_JSON)
  ) {
    return 'service_account';
  }
  return 'oauth2';
}
