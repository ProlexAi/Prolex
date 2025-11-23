/**
 * Types TypeScript pour le service Prolex Sandbox
 */

/**
 * Types de scénarios supportés
 */
export type ScenarioType = 'workflow_n8n' | 'appel_mcp' | 'sequence_mixte';

/**
 * Statut d'une exécution
 */
export type RunStatus = 'ok' | 'erreur' | 'partiel';

/**
 * Niveau de risque
 */
export type NiveauRisque = 'faible' | 'moyen' | 'élevé' | 'critique';

/**
 * Mode du sandbox
 */
export type ModeSandbox = 'strict' | 'relaxed';

/**
 * Type de base de données
 */
export type DatabaseType = 'sqlite' | 'postgres';

/**
 * Configuration du service
 */
export interface SandboxConfig {
  urlN8nTest: string;
  urlN8nProd: string;
  modeSandbox: ModeSandbox;
  gardesFousActifs: boolean;
  maxActionsParTest: number;
  backupObligatoire: boolean;
  fichierScenarios: string;
  dbType: DatabaseType;
  dbPath?: string;
  dbHost?: string;
  dbPort?: number;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  port: number;
  host: string;
  logLevel: string;
}

/**
 * Scénario de test
 */
export interface Scenario {
  id: string;
  nom: string;
  description?: string;
  type: ScenarioType;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input pour créer un scénario
 */
export interface CreateScenarioInput {
  nom: string;
  description?: string;
  type: ScenarioType;
  payload: any;
}

/**
 * Alerte de garde-fou
 */
export interface Alerte {
  type: string;
  description: string;
  niveauRisque: NiveauRisque;
  details?: any;
}

/**
 * Évaluation de risque
 */
export interface EvaluationRisque {
  niveauRisque: NiveauRisque;
  probabiliteDanger: number;
  alertes: Alerte[];
}

/**
 * Détails d'une simulation de workflow n8n
 */
export interface WorkflowSimulationDetails {
  nodesAnalysees: any[];
  flowsSimules: any[];
  logEtapes: string[];
}

/**
 * Détails d'une simulation MCP
 */
export interface McpSimulationDetails {
  endpoint: string;
  methode: string;
  payloadSimule: any;
  reponseSimulee: any;
}

/**
 * Détails d'une exécution
 */
export interface RunDetails {
  nodesAnalysees?: any[];
  flowsSimules?: any[];
  logEtapes?: string[];
  [key: string]: any;
}

/**
 * Résultat d'une exécution
 */
export interface SandboxRun {
  id: string;
  scenarioId: string;
  timestamp: Date;
  statut: RunStatus;
  resume: string;
  alertes: Alerte[];
  details: RunDetails;
}

/**
 * Input pour lancer une exécution
 */
export interface RunScenarioInput {
  scenarioId: string;
}

/**
 * Réponse API pour une exécution
 */
export interface RunResponse {
  scenarioId: string;
  runId: string;
  statut: RunStatus;
  resume: string;
  alertes: Alerte[];
  details: RunDetails;
}

/**
 * Nœud n8n (simplifié)
 */
export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: any;
}

/**
 * Workflow n8n (simplifié)
 */
export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: any;
  active?: boolean;
  settings?: any;
  tags?: string[];
}

/**
 * Action MCP
 */
export interface McpAction {
  endpoint: string;
  method: string;
  payload: any;
  headers?: Record<string, string>;
}

/**
 * Séquence d'actions mixtes
 */
export interface SequenceMixte {
  etapes: Array<{
    type: 'workflow_n8n' | 'appel_mcp';
    nom: string;
    payload: any;
  }>;
}

/**
 * Réponse d'erreur API
 */
export interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

/**
 * Réponse de succès API
 */
export interface SuccessResponse<T = any> {
  status: 'success';
  data: T;
}
