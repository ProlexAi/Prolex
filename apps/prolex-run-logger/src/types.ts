/**
 * Types et interfaces pour le module prolex-run-logger
 */

/**
 * Contexte d'exécution pour un run Prolex
 */
export interface ProlexRunContext {
  /** Nom de l'agent (ex: "prolex_principal", "kimmy_n8n") */
  nomAgent: string;

  /** Type de cible exécutée */
  typeCible: "workflow_n8n" | "agent";

  /** ID du workflow n8n si applicable */
  flowId?: string;

  /** Métadonnées additionnelles (clientId, scenario, etc.) */
  meta?: Record<string, any>;
}

/**
 * Résultat d'une exécution avec le logger Prolex
 */
export interface ProlexRunResult {
  /** Sortie de l'exécution (peut être undefined si erreur) */
  output: any;

  /** Erreur si l'exécution a échoué */
  error?: any;

  /** ID unique du run (UUID) */
  runId: string;

  /** Durée de l'exécution en millisecondes */
  dureeMs: number;
}

/**
 * Options pour la fonction runWithProlexLogger
 */
export interface RunWithProlexLoggerOptions<TInput, TOutput> {
  /** Contexte de l'exécution */
  context: ProlexRunContext;

  /** Données d'entrée */
  input: TInput;

  /** Fonction à exécuter */
  execute: (input: TInput) => Promise<TOutput>;
}

/**
 * Log d'entrée avant exécution
 */
export interface LogEntree {
  type: "entree";
  runId: string;
  timestamp: string;
  context: ProlexRunContext;
  inputPreview: string;
  tailleInput: number;
}

/**
 * Log de sortie après exécution
 */
export interface LogSortie {
  type: "sortie";
  runId: string;
  timestamp: string;
  context: ProlexRunContext;
  dureeMs: number;
  outputPreview: string;
  tailleOutput: number;
  hasError: boolean;
}

/**
 * Log d'erreur détaillé
 */
export interface LogErreur {
  runId: string;
  timestamp: string;
  nomAgent: string;
  typeCible: "workflow_n8n" | "agent";
  flowId?: string;
  meta?: Record<string, any>;
  inputPreview: string;
  outputPreview: string;
  errorMessage: string;
  errorStack?: string;
  errorType?: string;
  dureeMs: number;
}

/**
 * Configuration du logger
 */
export interface LoggerConfig {
  /** Fichier de log pour tous les runs */
  runsLogFile: string;

  /** Fichier de log pour les erreurs uniquement */
  errorsLogFile: string;

  /** Nombre maximum de caractères pour les previews */
  maxPreviewChars: number;
}
