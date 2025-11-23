import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from './types';

let pool: Pool | null = null;

/**
 * Initialise la connexion à PostgreSQL
 */
export function initDatabase(config: DatabaseConfig): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: config.connectionString,
    max: config.maxConnections || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Gestion des erreurs de connexion
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  console.log('[DB] PostgreSQL connection pool initialized');

  return pool;
}

/**
 * Retourne le pool de connexions
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

/**
 * Exécute une requête SQL
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
}

/**
 * Exécute une requête SQL et retourne une seule ligne
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

/**
 * Obtient un client pour une transaction
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Ferme toutes les connexions (pour les tests ou shutdown)
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] PostgreSQL connection pool closed');
  }
}

/**
 * Vérifie que pgvector est installé
 */
export async function checkPgVectorExtension(): Promise<void> {
  try {
    await query('SELECT 1 FROM pg_extension WHERE extname = $1', ['vector']);
    console.log('[DB] pgvector extension verified');
  } catch (error) {
    throw new Error(
      'pgvector extension not found. Run migrations/001_init.sql first.'
    );
  }
}
