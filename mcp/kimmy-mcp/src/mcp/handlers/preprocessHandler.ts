/**
 * Handler pour l'outil preprocess_text
 *
 * Cet outil prétraite un texte brut : nettoyage, segmentation en phrases,
 * détection de langue, et extraction de métadonnées.
 */

import {
  PreprocessTextInput,
  PreprocessTextOutput,
  KimmyToolError,
} from '../../types/toolTypes.js';
import { config } from '../../config/paths.js';

/**
 * Exécute le prétraitement du texte
 *
 * @param input - Paramètres de l'outil (text)
 * @returns Résultat du prétraitement avec métadonnées
 * @throws KimmyToolError si le texte est vide ou invalide
 */
export async function handlePreprocessText(
  input: PreprocessTextInput
): Promise<PreprocessTextOutput> {
  console.log('📝 [preprocess_text] Démarrage du prétraitement...');
  console.log(`   - Longueur texte: ${input.text.length} caractères`);

  // Validation du texte
  validateTextInput(input.text);

  // Mode STUB : simulation pour démonstration
  if (config.mode === 'stub') {
    return handleStubMode(input);
  }

  // Mode REAL : appel au vrai kimmy-tools-pack
  return handleRealMode(input);
}

/**
 * Valide que le texte d'entrée est valide
 */
function validateTextInput(text: string): void {
  if (!text || typeof text !== 'string') {
    throw new KimmyToolError(
      'Le texte fourni est invalide ou vide',
      'preprocess_text',
      'INVALID_TEXT',
      { providedType: typeof text }
    );
  }

  if (text.trim().length === 0) {
    throw new KimmyToolError(
      'Le texte fourni est vide (après suppression des espaces)',
      'preprocess_text',
      'EMPTY_TEXT',
      { originalLength: text.length }
    );
  }

  // Limite de sécurité (10MB)
  if (text.length > 10_000_000) {
    throw new KimmyToolError(
      `Le texte est trop long: ${text.length} caractères. Maximum: 10 000 000 caractères`,
      'preprocess_text',
      'TEXT_TOO_LONG',
      { length: text.length, maxLength: 10_000_000 }
    );
  }
}

/**
 * Mode STUB : retourne des données simulées
 */
function handleStubMode(input: PreprocessTextInput): PreprocessTextOutput {
  console.log('   ⚠️  MODE STUB : Génération de résultats simulés');

  // Nettoyage basique en mode stub
  const cleanText = input.text
    .trim()
    .replace(/\s+/g, ' ') // Normaliser espaces multiples
    .replace(/[^\w\s.,!?;:()\-'"àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ]/g, ''); // Garder ponctuation de base

  // Segmentation naïve en phrases
  const sentences = cleanText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Détection de langue basique (stub)
  const languageDetected = detectLanguageStub(cleanText);

  const stubResult: PreprocessTextOutput = {
    clean_text: cleanText,
    sentences,
    metadata: {
      length_chars: cleanText.length,
      language_detected: languageDetected,
    },
  };

  console.log('   ✅ Prétraitement simulé terminé avec succès');
  console.log(`   - Phrases détectées: ${sentences.length}`);
  console.log(`   - Langue détectée: ${languageDetected}`);

  return stubResult;
}

/**
 * Détection de langue simplifiée (stub)
 */
function detectLanguageStub(text: string): string {
  // Mots français communs
  const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'avec', 'pour'];
  // Mots anglais communs
  const englishWords = ['the', 'is', 'are', 'with', 'for', 'and', 'this', 'that'];

  const lowerText = text.toLowerCase();

  const frenchCount = frenchWords.filter((word) =>
    lowerText.includes(` ${word} `)
  ).length;
  const englishCount = englishWords.filter((word) =>
    lowerText.includes(` ${word} `)
  ).length;

  if (frenchCount > englishCount) return 'fr';
  if (englishCount > frenchCount) return 'en';
  return config.defaultLanguage; // Par défaut
}

/**
 * Mode REAL : appelle le vrai outil depuis kimmy-tools-pack
 */
async function handleRealMode(
  input: PreprocessTextInput
): Promise<PreprocessTextOutput> {
  console.log('   🔧 MODE REAL : Chargement de kimmy-tools-pack...');

  try {
    // Charger dynamiquement le package kimmy-tools-pack
    const toolsPackPath = config.kimmyToolsPath;
    console.log(`   - Chemin tools: ${toolsPackPath}`);

    // Import dynamique
    const { preprocessText } = await import(toolsPackPath + '/preprocessText.js');

    if (typeof preprocessText !== 'function') {
      throw new Error(
        `La fonction preprocessText n'est pas exportée correctement depuis ${toolsPackPath}`
      );
    }

    // Appeler la vraie fonction
    console.log('   - Appel de preprocessText()...');
    const result = await preprocessText({
      text: input.text,
    });

    console.log('   ✅ Prétraitement réel terminé avec succès');
    console.log(`   - Phrases détectées: ${result.sentences.length}`);
    console.log(`   - Langue détectée: ${result.metadata.language_detected}`);

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
        'preprocess_text',
        'TOOLS_PACK_NOT_FOUND',
        { kimmyToolsPath: config.kimmyToolsPath, originalError: error.message }
      );
    }

    // Autres erreurs
    throw new KimmyToolError(
      `Erreur lors du prétraitement: ${error instanceof Error ? error.message : String(error)}`,
      'preprocess_text',
      'PREPROCESSING_ERROR',
      error
    );
  }
}
