/**
 * Utilitaire pour écrire des logs au format JSONL (JSON Lines)
 */

import * as fs from "fs";
import * as path from "path";

/**
 * S'assure que le répertoire parent du fichier existe
 */
function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Écrit une ligne JSON dans un fichier JSONL
 * Chaque entrée est sur une nouvelle ligne, au format JSON compact
 *
 * @param filePath Chemin du fichier JSONL
 * @param data Objet à logger
 */
export function appendJsonLine(filePath: string, data: any): void {
  try {
    // S'assurer que le dossier existe
    ensureDirectoryExists(filePath);

    // Convertir l'objet en JSON compact (sans indentation)
    const jsonLine = JSON.stringify(data) + "\n";

    // Ajouter la ligne au fichier (créer si inexistant)
    fs.appendFileSync(filePath, jsonLine, "utf-8");
  } catch (error) {
    console.error(`[FileLogger] Erreur lors de l'écriture dans ${filePath}:`, error);
    throw error;
  }
}

/**
 * Lit toutes les lignes d'un fichier JSONL
 *
 * @param filePath Chemin du fichier JSONL
 * @returns Tableau d'objets parsés
 */
export function readJsonLines(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content
      .split("\n")
      .filter((line) => line.trim().length > 0);

    return lines.map((line) => JSON.parse(line));
  } catch (error) {
    console.error(`[FileLogger] Erreur lors de la lecture de ${filePath}:`, error);
    throw error;
  }
}

/**
 * Tronque une chaîne JSON pour créer un preview
 *
 * @param obj Objet à convertir en preview
 * @param maxChars Nombre maximum de caractères
 * @returns Chaîne JSON tronquée
 */
export function createPreview(obj: any, maxChars: number): string {
  try {
    const jsonStr = JSON.stringify(obj);

    if (jsonStr.length <= maxChars) {
      return jsonStr;
    }

    return jsonStr.substring(0, maxChars) + "... [tronqué]";
  } catch (error) {
    return `[Erreur de sérialisation: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

/**
 * Calcule la taille approximative d'un objet en caractères JSON
 *
 * @param obj Objet à mesurer
 * @returns Taille en caractères
 */
export function calculateSize(obj: any): number {
  try {
    return JSON.stringify(obj).length;
  } catch {
    return 0;
  }
}
