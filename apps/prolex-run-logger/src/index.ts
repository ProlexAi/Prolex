/**
 * Module prolex-run-logger
 *
 * Logging standardisé pour les exécutions d'agents et workflows Prolex
 */

// Export de la fonction principale
export { runWithProlexLogger } from "./runWithProlexLogger";

// Export des types
export type {
  ProlexRunContext,
  ProlexRunResult,
  RunWithProlexLoggerOptions,
  LogEntree,
  LogSortie,
  LogErreur,
  LoggerConfig,
} from "./types";

// Export de la configuration
export { loadConfig } from "./config";

// Export des utilitaires (optionnel, pour usage avancé)
export {
  appendJsonLine,
  readJsonLines,
  createPreview,
  calculateSize,
} from "./utils/fileLogger";
