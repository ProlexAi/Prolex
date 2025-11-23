/**
 * Environment Configuration
 * Adapter pour utiliser la configuration centralisée de Prolex
 *
 * Ce fichier fait le pont entre le config-loader central et le code existant
 * du MCP n8n pour maintenir la compatibilité.
 */

import { config as centralConfig } from '../../../config/dist/config-loader';

/**
 * Interface de configuration pour le MCP n8n
 * Compatible avec l'ancienne interface EnvConfig
 */
export interface EnvConfig {
  // n8n Configuration
  N8N_BASE_URL: string;
  N8N_API_KEY: string;
  N8N_TIMEOUT: number;

  // Server Configuration
  NODE_ENV: 'development' | 'production' | 'test';
  HEALTHCHECK_PORT: number;
  LOG_PATH: string;

  // Cache Configuration
  CACHE_TTL: number;
  CACHE_CHECK_PERIOD: number;

  // Rate Limit Configuration
  RATE_LIMIT_PER_SECOND: number;
  RATE_LIMIT_MAX_CONCURRENT: number;
  RATE_LIMIT_QUEUE_SIZE: number;

  // Retry Configuration
  RETRY_MAX_ATTEMPTS: number;
  RETRY_INITIAL_DELAY: number;
  RETRY_MAX_DELAY: number;
  RETRY_BACKOFF_MULTIPLIER: number;
  RETRY_FALLBACK_WORKFLOW_ID?: string;

  // Streaming Configuration
  STREAMING_ENABLED: boolean;
  STREAMING_POLL_INTERVAL: number;
}

/**
 * Configuration du MCP n8n mappée depuis la config centrale
 */
export const config: EnvConfig = {
  // n8n Configuration
  N8N_BASE_URL: centralConfig.n8n.baseUrl,
  N8N_API_KEY: centralConfig.n8n.apiKey,
  N8N_TIMEOUT: centralConfig.n8n.timeout,

  // Server Configuration
  NODE_ENV: centralConfig.nodeEnv as 'development' | 'production' | 'test',
  HEALTHCHECK_PORT: centralConfig.mcp.healthcheckPort,
  LOG_PATH: centralConfig.logging.path,

  // Cache Configuration
  CACHE_TTL: centralConfig.cache.ttl,
  CACHE_CHECK_PERIOD: centralConfig.cache.checkPeriod || 60,

  // Rate Limit Configuration
  RATE_LIMIT_PER_SECOND: centralConfig.security.rateLimitPerSecond || 10,
  RATE_LIMIT_MAX_CONCURRENT: centralConfig.security.rateLimitMaxConcurrent || 5,
  RATE_LIMIT_QUEUE_SIZE: centralConfig.security.rateLimitQueueSize || 100,

  // Retry Configuration
  RETRY_MAX_ATTEMPTS: centralConfig.retry.maxAttempts,
  RETRY_INITIAL_DELAY: centralConfig.retry.initialDelay,
  RETRY_MAX_DELAY: centralConfig.retry.maxDelay,
  RETRY_BACKOFF_MULTIPLIER: centralConfig.retry.backoffMultiplier,
  RETRY_FALLBACK_WORKFLOW_ID: centralConfig.retry.fallbackWorkflowId,

  // Streaming Configuration
  STREAMING_ENABLED: centralConfig.streaming.enabled,
  STREAMING_POLL_INTERVAL: centralConfig.streaming.pollInterval,
};

// Log de confirmation
console.log('✅ MCP n8n : configuration chargée depuis config-loader central');
