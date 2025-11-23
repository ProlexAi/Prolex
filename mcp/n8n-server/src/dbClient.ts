/**
 * Client PostgreSQL pour logs centralisés Prolex
 *
 * Permet aux MCP servers et n8n d'écrire dans la table app_logs
 * de manière asynchrone et sécurisée.
 *
 * @module dbClient
 */

import { Pool, PoolClient } from 'pg';

// ============================================================
// TYPES
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEventInput {
  source: string;                     // "n8n", "mcp_n8n", "mcp_google", etc.
  level: LogLevel;
  message: string;
  details?: Record<string, unknown>;  // JSON libre pour contexte additionnel
}

// ============================================================
// POOL POSTGRESQL
// ============================================================

let pool: Pool | null = null;

/**
 * Initialise le pool de connexions PostgreSQL
 * Lit DATABASE_URL depuis les variables d'environnement
 */
function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.warn('⚠️  DATABASE_URL non configurée - Logs PostgreSQL désactivés');
      console.warn('   Configurez DATABASE_URL dans .env pour activer les logs DB');
      // Retourner un pool "factice" qui ne fera rien
      // Cela évite de crash le processus si PostgreSQL n'est pas disponible
      pool = new Pool({
        max: 0, // Aucune connexion
      });
      return pool;
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,                    // Maximum 10 connexions simultanées
      idleTimeoutMillis: 30000,   // Fermer les connexions inactives après 30s
      connectionTimeoutMillis: 5000, // Timeout de connexion: 5s
    });

    // Gestion des erreurs du pool
    pool.on('error', (err) => {
      console.error('❌ Erreur PostgreSQL Pool:', err);
    });

    console.log('✅ Pool PostgreSQL initialisé pour logs centralisés');
  }

  return pool;
}

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

/**
 * Enregistre un événement dans la table app_logs
 *
 * @param input - Données du log (source, level, message, details)
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await logEvent({
 *   source: 'mcp_n8n',
 *   level: 'info',
 *   message: 'Workflow exécuté avec succès',
 *   details: { workflow_id: 'abc123', duration_ms: 250 }
 * });
 * ```
 */
export async function logEvent(input: LogEventInput): Promise<void> {
  const { source, level, message, details = {} } = input;

  // Validation rapide
  if (!source || !level || !message) {
    console.error('❌ logEvent: source, level et message sont requis');
    return; // Ne pas crash le processus, juste ignorer
  }

  const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  if (!validLevels.includes(level)) {
    console.error(`❌ logEvent: level invalide "${level}". Attendu: ${validLevels.join(', ')}`);
    return;
  }

  try {
    const p = getPool();

    // Si le pool est "factice" (max: 0), ne rien faire
    if (p.options.max === 0) {
      return; // Logs PostgreSQL désactivés
    }

    const query = `
      INSERT INTO app_logs (source, level, message, details)
      VALUES ($1, $2, $3, $4)
    `;

    const values = [source, level, message, JSON.stringify(details)];

    await p.query(query, values);

    // Log en console uniquement pour les erreurs/warnings (éviter le spam)
    if (level === 'error' || level === 'warn') {
      console.log(`📊 [DB LOG] [${level.toUpperCase()}] ${source}: ${message}`);
    }
  } catch (error) {
    // En cas d'erreur d'écriture dans PostgreSQL, ne pas crash le processus
    // Juste logger en console
    console.error('❌ Erreur lors de l\'écriture dans app_logs:', error);
    console.error('   Source:', source, '| Level:', level, '| Message:', message);
  }
}

/**
 * Enregistre une erreur dans les logs (helper pour logEvent)
 *
 * @param source - Source du log (ex: "mcp_n8n")
 * @param error - Erreur capturée (Error object ou unknown)
 * @param details - Contexte additionnel (optionnel)
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   await logError('mcp_n8n', error, { operation: 'riskyOperation', user_id: '123' });
 * }
 * ```
 */
export async function logError(
  source: string,
  error: unknown,
  details?: Record<string, unknown>
): Promise<void> {
  let message = 'Erreur inconnue';
  let errorDetails: Record<string, unknown> = { ...(details || {}) };

  // Extraire le message d'erreur
  if (error instanceof Error) {
    message = error.message;
    errorDetails.error_name = error.name;
    errorDetails.error_stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = String(error);
  }

  await logEvent({
    source,
    level: 'error',
    message,
    details: errorDetails,
  });
}

/**
 * Ferme proprement le pool de connexions
 * À appeler lors du shutdown du processus
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('✅ Pool PostgreSQL fermé');
    pool = null;
  }
}

// ============================================================
// GESTION DU SHUTDOWN PROPRE
// ============================================================

// Fermer le pool lors de l'arrêt du processus
process.on('SIGINT', async () => {
  console.log('\n🛑 Signal SIGINT reçu, fermeture du pool PostgreSQL...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Signal SIGTERM reçu, fermeture du pool PostgreSQL...');
  await closePool();
  process.exit(0);
});
