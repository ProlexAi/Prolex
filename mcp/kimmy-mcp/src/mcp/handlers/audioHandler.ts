/**
 * Handler pour l'outil audio_to_text
 *
 * Cet outil transcrit un fichier audio en texte en utilisant Whisper.
 * En mode stub, il retourne des données simulées pour démonstration.
 */

import { existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import {
  AudioToTextInput,
  AudioToTextOutput,
  KimmyToolError,
} from '../../types/toolTypes.js';
import { config } from '../../config/paths.js';

/**
 * Exécute la transcription audio → texte
 *
 * @param input - Paramètres de l'outil (audioPath, targetLanguage)
 * @returns Résultat de la transcription avec métadonnées
 * @throws KimmyToolError si le fichier n'existe pas ou format invalide
 */
export async function handleAudioToText(
  input: AudioToTextInput
): Promise<AudioToTextOutput> {
  console.log('🎤 [audio_to_text] Démarrage de la transcription...');
  console.log(`   - Fichier: ${input.audioPath}`);
  console.log(`   - Langue cible: ${input.targetLanguage || config.defaultLanguage}`);

  // Validation du fichier audio
  validateAudioFile(input.audioPath);

  // Mode STUB : simulation pour démonstration
  if (config.mode === 'stub') {
    return handleStubMode(input);
  }

  // Mode REAL : appel au vrai kimmy-tools-pack
  return handleRealMode(input);
}

/**
 * Valide que le fichier audio existe et a un format supporté
 */
function validateAudioFile(audioPath: string): void {
  // Vérifier existence
  if (!existsSync(audioPath)) {
    throw new KimmyToolError(
      `Fichier audio introuvable: ${audioPath}`,
      'audio_to_text',
      'FILE_NOT_FOUND',
      { audioPath }
    );
  }

  // Vérifier que c'est un fichier (pas un dossier)
  const stats = statSync(audioPath);
  if (!stats.isFile()) {
    throw new KimmyToolError(
      `Le chemin ne pointe pas vers un fichier: ${audioPath}`,
      'audio_to_text',
      'INVALID_PATH',
      { audioPath }
    );
  }

  // Vérifier extension
  const ext = extname(audioPath).toLowerCase();
  const supportedFormats = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac'];
  if (!supportedFormats.includes(ext)) {
    throw new KimmyToolError(
      `Format audio non supporté: ${ext}. Formats acceptés: ${supportedFormats.join(', ')}`,
      'audio_to_text',
      'UNSUPPORTED_FORMAT',
      { audioPath, extension: ext, supportedFormats }
    );
  }
}

/**
 * Mode STUB : retourne des données simulées
 */
function handleStubMode(input: AudioToTextInput): AudioToTextOutput {
  console.log('   ⚠️  MODE STUB : Génération de résultats simulés');

  const targetLanguage = input.targetLanguage || config.defaultLanguage;

  // Simuler une durée basée sur la taille du fichier
  const stats = statSync(input.audioPath);
  const estimatedDuration = Math.round(stats.size / 32000); // ~32KB/seconde pour du MP3

  const stubResult: AudioToTextOutput = {
    raw_transcript:
      "bonjour ceci est une transcription de test générée en mode stub l'audio n'a pas été réellement transcrit",
    cleaned_transcript:
      "Bonjour, ceci est une transcription de test générée en mode stub. L'audio n'a pas été réellement transcrit.",
    language_detected: targetLanguage,
    duration_seconds: estimatedDuration > 0 ? estimatedDuration : 10,
  };

  console.log('   ✅ Transcription simulée générée avec succès');
  return stubResult;
}

/**
 * Mode REAL : appelle le vrai outil depuis kimmy-tools-pack
 */
async function handleRealMode(input: AudioToTextInput): Promise<AudioToTextOutput> {
  console.log('   🔧 MODE REAL : Chargement de kimmy-tools-pack...');

  try {
    // Charger dynamiquement le package kimmy-tools-pack
    const toolsPackPath = config.kimmyToolsPath;
    console.log(`   - Chemin tools: ${toolsPackPath}`);

    // Import dynamique
    const { audioToText } = await import(toolsPackPath + '/audioToText.js');

    if (typeof audioToText !== 'function') {
      throw new Error(
        `La fonction audioToText n'est pas exportée correctement depuis ${toolsPackPath}`
      );
    }

    // Appeler la vraie fonction
    console.log('   - Appel de audioToText()...');
    const result = await audioToText({
      audioPath: input.audioPath,
      targetLanguage: input.targetLanguage || config.defaultLanguage,
      whisperApiKey: config.whisperApiKey,
    });

    console.log('   ✅ Transcription réelle terminée avec succès');
    return result;
  } catch (error) {
    // Si le package n'est pas trouvé, donner un message clair
    if (
      error instanceof Error &&
      (error.message.includes('Cannot find module') ||
        error.message.includes('MODULE_NOT_FOUND'))
    ) {
      throw new KimmyToolError(
        `Impossible de charger kimmy-tools-pack depuis ${config.kimmyToolsPath}. ` +
          `Vérifiez que le package est installé et compilé. ` +
          `Utilisez MODE=stub pour tester sans le package.`,
        'audio_to_text',
        'TOOLS_PACK_NOT_FOUND',
        { kimmyToolsPath: config.kimmyToolsPath, originalError: error.message }
      );
    }

    // Autres erreurs
    throw new KimmyToolError(
      `Erreur lors de la transcription: ${error instanceof Error ? error.message : String(error)}`,
      'audio_to_text',
      'TRANSCRIPTION_ERROR',
      error
    );
  }
}
