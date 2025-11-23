/**
 * Gestion de la configuration du logger
 */

import * as fs from "fs";
import * as path from "path";
import { LoggerConfig } from "./types";

const DEFAULT_CONFIG: LoggerConfig = {
  runsLogFile: "./logs/prolex_runs.jsonl",
  errorsLogFile: "./logs/prolex_errors.jsonl",
  maxPreviewChars: 2000,
};

/**
 * Charge la configuration depuis :
 * 1. Variables d'environnement (priorité)
 * 2. Fichier config/logger.config.json
 * 3. Valeurs par défaut
 *
 * @returns Configuration du logger
 */
export function loadConfig(): LoggerConfig {
  const config: LoggerConfig = { ...DEFAULT_CONFIG };

  // 1. Essayer de charger depuis le fichier JSON
  const configFilePath = path.join(__dirname, "../config/logger.config.json");

  if (fs.existsSync(configFilePath)) {
    try {
      const fileContent = fs.readFileSync(configFilePath, "utf-8");
      const fileConfig = JSON.parse(fileContent);

      if (fileConfig.runsLogFile) {
        config.runsLogFile = fileConfig.runsLogFile;
      }
      if (fileConfig.errorsLogFile) {
        config.errorsLogFile = fileConfig.errorsLogFile;
      }
      if (fileConfig.maxPreviewChars) {
        config.maxPreviewChars = fileConfig.maxPreviewChars;
      }
    } catch (error) {
      console.warn(
        "[Config] Impossible de charger le fichier de configuration:",
        error
      );
    }
  }

  // 2. Surcharger avec les variables d'environnement (si définies)
  if (process.env.PROLEX_RUNS_LOG_FILE) {
    config.runsLogFile = process.env.PROLEX_RUNS_LOG_FILE;
  }

  if (process.env.PROLEX_ERRORS_LOG_FILE) {
    config.errorsLogFile = process.env.PROLEX_ERRORS_LOG_FILE;
  }

  if (process.env.MAX_PREVIEW_CHARS) {
    const maxChars = parseInt(process.env.MAX_PREVIEW_CHARS, 10);
    if (!isNaN(maxChars)) {
      config.maxPreviewChars = maxChars;
    }
  }

  return config;
}
