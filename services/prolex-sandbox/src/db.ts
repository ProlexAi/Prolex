/**
 * Gestion de la base de données pour Prolex Sandbox
 * Support SQLite et PostgreSQL
 */

import { config } from './config';
import { Scenario, SandboxRun, CreateScenarioInput, RunScenarioInput } from './types';
import { v4 as uuidv4 } from 'uuid';

// Import conditionnel selon le type de DB
let db: any;

/**
 * Initialise la connexion à la base de données
 */
export async function initDatabase(): Promise<void> {
  console.log(`🔌 Initialisation de la base de données (${config.dbType})...`);

  if (config.dbType === 'sqlite') {
    const Database = require('better-sqlite3');
    db = new Database(config.dbPath);
    await createTablesSqlite();
  } else if (config.dbType === 'postgres') {
    const { Pool } = require('pg');
    db = new Pool({
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      password: config.dbPassword,
    });
    await createTablesPostgres();
  }

  console.log('✅ Base de données initialisée');
}

/**
 * Crée les tables pour SQLite
 */
async function createTablesSqlite(): Promise<void> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sandbox_scenarios (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sandbox_runs (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      resultat TEXT NOT NULL,
      resume TEXT NOT NULL,
      details TEXT NOT NULL,
      FOREIGN KEY (scenario_id) REFERENCES sandbox_scenarios(id)
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_runs_scenario_id ON sandbox_runs(scenario_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_runs_timestamp ON sandbox_runs(timestamp);
  `);
}

/**
 * Crée les tables pour PostgreSQL
 */
async function createTablesPostgres(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS sandbox_scenarios (
      id UUID PRIMARY KEY,
      nom TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sandbox_runs (
      id UUID PRIMARY KEY,
      scenario_id UUID NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resultat TEXT NOT NULL,
      resume TEXT NOT NULL,
      details JSONB NOT NULL,
      FOREIGN KEY (scenario_id) REFERENCES sandbox_scenarios(id)
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_runs_scenario_id ON sandbox_runs(scenario_id);
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_runs_timestamp ON sandbox_runs(timestamp);
  `);
}

/**
 * Ferme la connexion à la base de données
 */
export async function closeDatabase(): Promise<void> {
  if (config.dbType === 'sqlite') {
    db.close();
  } else if (config.dbType === 'postgres') {
    await db.end();
  }
  console.log('🔌 Base de données fermée');
}

// ============================================================================
// CRUD - Scénarios
// ============================================================================

/**
 * Crée un nouveau scénario
 */
export async function createScenario(input: CreateScenarioInput): Promise<Scenario> {
  const id = uuidv4();
  const now = new Date();

  const scenario: Scenario = {
    id,
    nom: input.nom,
    description: input.description || '',
    type: input.type,
    payload: input.payload,
    createdAt: now,
    updatedAt: now,
  };

  if (config.dbType === 'sqlite') {
    const stmt = db.prepare(`
      INSERT INTO sandbox_scenarios (id, nom, description, type, payload, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      scenario.nom,
      scenario.description,
      scenario.type,
      JSON.stringify(scenario.payload),
      now.toISOString(),
      now.toISOString()
    );
  } else {
    await db.query(
      `INSERT INTO sandbox_scenarios (id, nom, description, type, payload, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, scenario.nom, scenario.description, scenario.type, scenario.payload, now, now]
    );
  }

  return scenario;
}

/**
 * Récupère tous les scénarios
 */
export async function getAllScenarios(): Promise<Scenario[]> {
  if (config.dbType === 'sqlite') {
    const rows = db.prepare('SELECT * FROM sandbox_scenarios ORDER BY created_at DESC').all();
    return rows.map((row: any) => ({
      id: row.id,
      nom: row.nom,
      description: row.description,
      type: row.type,
      payload: JSON.parse(row.payload),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } else {
    const result = await db.query('SELECT * FROM sandbox_scenarios ORDER BY created_at DESC');
    return result.rows.map((row: any) => ({
      id: row.id,
      nom: row.nom,
      description: row.description,
      type: row.type,
      payload: row.payload,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
}

/**
 * Récupère un scénario par ID
 */
export async function getScenarioById(id: string): Promise<Scenario | null> {
  if (config.dbType === 'sqlite') {
    const row = db.prepare('SELECT * FROM sandbox_scenarios WHERE id = ?').get(id);
    if (!row) return null;
    return {
      id: row.id,
      nom: row.nom,
      description: row.description,
      type: row.type,
      payload: JSON.parse(row.payload),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } else {
    const result = await db.query('SELECT * FROM sandbox_scenarios WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      nom: row.nom,
      description: row.description,
      type: row.type,
      payload: row.payload,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ============================================================================
// CRUD - Runs
// ============================================================================

/**
 * Crée une nouvelle exécution
 */
export async function createRun(run: SandboxRun): Promise<void> {
  if (config.dbType === 'sqlite') {
    const stmt = db.prepare(`
      INSERT INTO sandbox_runs (id, scenario_id, timestamp, resultat, resume, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      run.id,
      run.scenarioId,
      run.timestamp.toISOString(),
      run.statut,
      run.resume,
      JSON.stringify({ alertes: run.alertes, ...run.details })
    );
  } else {
    await db.query(
      `INSERT INTO sandbox_runs (id, scenario_id, timestamp, resultat, resume, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        run.id,
        run.scenarioId,
        run.timestamp,
        run.statut,
        run.resume,
        { alertes: run.alertes, ...run.details },
      ]
    );
  }
}

/**
 * Récupère une exécution par ID
 */
export async function getRunById(id: string): Promise<SandboxRun | null> {
  if (config.dbType === 'sqlite') {
    const row = db.prepare('SELECT * FROM sandbox_runs WHERE id = ?').get(id);
    if (!row) return null;
    const details = JSON.parse(row.details);
    const { alertes, ...otherDetails } = details;
    return {
      id: row.id,
      scenarioId: row.scenario_id,
      timestamp: new Date(row.timestamp),
      statut: row.resultat,
      resume: row.resume,
      alertes: alertes || [],
      details: otherDetails,
    };
  } else {
    const result = await db.query('SELECT * FROM sandbox_runs WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const { alertes, ...otherDetails } = row.details;
    return {
      id: row.id,
      scenarioId: row.scenario_id,
      timestamp: row.timestamp,
      statut: row.resultat,
      resume: row.resume,
      alertes: alertes || [],
      details: otherDetails,
    };
  }
}

/**
 * Récupère toutes les exécutions pour un scénario
 */
export async function getRunsByScenarioId(scenarioId: string): Promise<SandboxRun[]> {
  if (config.dbType === 'sqlite') {
    const rows = db
      .prepare('SELECT * FROM sandbox_runs WHERE scenario_id = ? ORDER BY timestamp DESC')
      .all(scenarioId);
    return rows.map((row: any) => {
      const details = JSON.parse(row.details);
      const { alertes, ...otherDetails } = details;
      return {
        id: row.id,
        scenarioId: row.scenario_id,
        timestamp: new Date(row.timestamp),
        statut: row.resultat,
        resume: row.resume,
        alertes: alertes || [],
        details: otherDetails,
      };
    });
  } else {
    const result = await db.query(
      'SELECT * FROM sandbox_runs WHERE scenario_id = $1 ORDER BY timestamp DESC',
      [scenarioId]
    );
    return result.rows.map((row: any) => {
      const { alertes, ...otherDetails } = row.details;
      return {
        id: row.id,
        scenarioId: row.scenario_id,
        timestamp: row.timestamp,
        statut: row.resultat,
        resume: row.resume,
        alertes: alertes || [],
        details: otherDetails,
      };
    });
  }
}
