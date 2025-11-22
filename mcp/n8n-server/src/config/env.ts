/**
 * Environment Configuration
 * Validates and exports configuration from environment variables
 */

import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  // n8n Configuration
  N8N_BASE_URL: z.string().url(),
  N8N_API_KEY: z.string().min(1),
  N8N_TIMEOUT: z.coerce.number().optional().default(30000),

  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  HEALTHCHECK_PORT: z.coerce.number().optional().default(3000),
  LOG_PATH: z.string().optional().default('./logs'),

  // Cache Configuration
  CACHE_TTL: z.coerce.number().optional().default(300), // 5 minutes
  CACHE_CHECK_PERIOD: z.coerce.number().optional().default(60), // 1 minute

  // Rate Limit Configuration
  RATE_LIMIT_PER_SECOND: z.coerce.number().optional().default(10),
  RATE_LIMIT_MAX_CONCURRENT: z.coerce.number().optional().default(5),
  RATE_LIMIT_QUEUE_SIZE: z.coerce.number().optional().default(100),

  // Retry Configuration
  RETRY_MAX_ATTEMPTS: z.coerce.number().optional().default(3),
  RETRY_INITIAL_DELAY: z.coerce.number().optional().default(1000),
  RETRY_MAX_DELAY: z.coerce.number().optional().default(10000),
  RETRY_BACKOFF_MULTIPLIER: z.coerce.number().optional().default(2),
  RETRY_FALLBACK_WORKFLOW_ID: z.string().optional(),

  // Streaming Configuration
  STREAMING_ENABLED: z.coerce.boolean().optional().default(true),
  STREAMING_POLL_INTERVAL: z.coerce.number().optional().default(1000),
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment configuration:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export { config };
