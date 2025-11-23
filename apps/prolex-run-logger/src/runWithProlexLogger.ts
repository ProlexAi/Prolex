/**
 * Fonction principale pour exécuter un agent/workflow avec logging standardisé
 */

import { v4 as uuidv4 } from "uuid";
import {
  ProlexRunContext,
  ProlexRunResult,
  RunWithProlexLoggerOptions,
  LogEntree,
  LogSortie,
  LogErreur,
  LoggerConfig,
} from "./types";
import {
  appendJsonLine,
  createPreview,
  calculateSize,
} from "./utils/fileLogger";
import { loadConfig } from "./config";

/**
 * Exécute une fonction avec logging complet des entrées, sorties et erreurs
 *
 * Logs générés :
 * - Avant exécution : log d'entrée dans prolex_runs.jsonl
 * - Après exécution : log de sortie dans prolex_runs.jsonl
 * - En cas d'erreur : log détaillé dans prolex_errors.jsonl
 *
 * @param options Options d'exécution (context, input, execute)
 * @returns Résultat avec output, error, runId, dureeMs
 */
export async function runWithProlexLogger<TInput, TOutput>(
  options: RunWithProlexLoggerOptions<TInput, TOutput>
): Promise<ProlexRunResult> {
  const { context, input, execute } = options;

  // Charger la configuration
  const config: LoggerConfig = loadConfig();

  // Générer un ID unique pour ce run
  const runId = uuidv4();

  // Capturer le timestamp de début
  const timestampDebut = new Date().toISOString();
  const tempsDebut = Date.now();

  // Créer le preview de l'input
  const inputPreview = createPreview(input, config.maxPreviewChars);
  const tailleInput = calculateSize(input);

  // 1. LOG D'ENTRÉE
  const logEntree: LogEntree = {
    type: "entree",
    runId,
    timestamp: timestampDebut,
    context,
    inputPreview,
    tailleInput,
  };

  try {
    appendJsonLine(config.runsLogFile, logEntree);
  } catch (error) {
    console.error("[ProlexLogger] Erreur lors du log d'entrée:", error);
  }

  // Variables pour stocker le résultat
  let output: TOutput | undefined;
  let error: any | undefined;

  // 2. EXÉCUTION
  try {
    output = await execute(input);
  } catch (err) {
    error = err;
  }

  // Calculer la durée
  const tempsFin = Date.now();
  const dureeMs = tempsFin - tempsDebut;
  const timestampFin = new Date().toISOString();

  // Créer le preview de l'output
  const outputPreview = createPreview(
    error ? { error: String(error) } : output,
    config.maxPreviewChars
  );
  const tailleOutput = calculateSize(error ? error : output);

  // 3. LOG DE SORTIE
  const logSortie: LogSortie = {
    type: "sortie",
    runId,
    timestamp: timestampFin,
    context,
    dureeMs,
    outputPreview,
    tailleOutput,
    hasError: !!error,
  };

  try {
    appendJsonLine(config.runsLogFile, logSortie);
  } catch (logError) {
    console.error("[ProlexLogger] Erreur lors du log de sortie:", logError);
  }

  // 4. LOG D'ERREUR (si applicable)
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorType = error instanceof Error ? error.constructor.name : typeof error;

    const logErreur: LogErreur = {
      runId,
      timestamp: timestampFin,
      nomAgent: context.nomAgent,
      typeCible: context.typeCible,
      flowId: context.flowId,
      meta: context.meta,
      inputPreview,
      outputPreview,
      errorMessage,
      errorStack,
      errorType,
      dureeMs,
    };

    try {
      appendJsonLine(config.errorsLogFile, logErreur);
      console.error(
        `[ProlexLogger] ❌ Erreur capturée pour ${context.nomAgent} (runId: ${runId}):`,
        errorMessage
      );
    } catch (logError) {
      console.error("[ProlexLogger] Erreur lors du log d'erreur:", logError);
    }
  } else {
    console.log(
      `[ProlexLogger] ✅ Exécution réussie pour ${context.nomAgent} (runId: ${runId}, durée: ${dureeMs}ms)`
    );
  }

  // 5. RETOURNER LE RÉSULTAT
  return {
    output,
    error,
    runId,
    dureeMs,
  };
}
