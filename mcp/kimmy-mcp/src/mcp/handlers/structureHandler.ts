/**
 * Handler pour l'outil structure_output
 *
 * Cet outil structure la sortie de Kimmy en extrayant :
 * - Un résumé
 * - L'intention détectée
 * - Les entités clés
 * - Les actions proposées
 * - Les contraintes identifiées
 */

import {
  StructureOutputInput,
  StructureOutputOutput,
  KimmyToolError,
} from '../../types/toolTypes.js';
import { config } from '../../config/paths.js';

/**
 * Exécute la structuration de la sortie Kimmy
 *
 * @param input - Paramètres de l'outil (text_from_kimmy)
 * @returns Résultat structuré avec summary, intent, entities, etc.
 * @throws KimmyToolError si le texte est vide ou invalide
 */
export async function handleStructureOutput(
  input: StructureOutputInput
): Promise<StructureOutputOutput> {
  console.log('🔧 [structure_output] Démarrage de la structuration...');
  console.log(`   - Longueur texte: ${input.text_from_kimmy.length} caractères`);

  // Validation du texte
  validateTextInput(input.text_from_kimmy);

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
      'structure_output',
      'INVALID_TEXT',
      { providedType: typeof text }
    );
  }

  if (text.trim().length === 0) {
    throw new KimmyToolError(
      'Le texte fourni est vide (après suppression des espaces)',
      'structure_output',
      'EMPTY_TEXT',
      { originalLength: text.length }
    );
  }
}

/**
 * Mode STUB : retourne des données simulées
 */
function handleStubMode(input: StructureOutputInput): StructureOutputOutput {
  console.log('   ⚠️  MODE STUB : Génération de résultats simulés');

  // Analyse basique pour simulation
  const text = input.text_from_kimmy;
  const lowerText = text.toLowerCase();

  // Détecter intention basique
  let intent = 'information';
  if (lowerText.includes('?')) intent = 'question';
  else if (
    lowerText.includes('peux-tu') ||
    lowerText.includes('pourrais-tu') ||
    lowerText.includes('fais') ||
    lowerText.includes('crée')
  )
    intent = 'commande';
  else if (
    lowerText.includes('merci') ||
    lowerText.includes('ok') ||
    lowerText.includes('compris')
  )
    intent = 'confirmation';

  // Extraire quelques mots comme "entités" (stub naïf)
  const words = text
    .split(/\s+/)
    .filter((w) => w.length > 5)
    .slice(0, 5);

  // Générer un résumé (stub : prendre les 100 premiers caractères)
  const summary =
    text.length > 100
      ? text.substring(0, 97).trim() + '...'
      : text.trim();

  const stubResult: StructureOutputOutput = {
    summary,
    intent,
    key_entities: words.length > 0 ? words : ['aucune'],
    actions_proposees: [
      intent === 'question'
        ? 'Fournir une réponse à la question'
        : 'Traiter la demande',
    ],
    constraints: lowerText.includes('urgent')
      ? ['urgence']
      : ['aucune contrainte détectée'],
    raw_text: text,
  };

  console.log('   ✅ Structuration simulée terminée avec succès');
  console.log(`   - Intent détecté: ${intent}`);
  console.log(`   - Entités: ${stubResult.key_entities.join(', ')}`);

  return stubResult;
}

/**
 * Mode REAL : appelle le vrai outil depuis kimmy-tools-pack
 */
async function handleRealMode(
  input: StructureOutputInput
): Promise<StructureOutputOutput> {
  console.log('   🔧 MODE REAL : Chargement de kimmy-tools-pack...');

  try {
    // Charger dynamiquement le package kimmy-tools-pack
    const toolsPackPath = config.kimmyToolsPath;
    console.log(`   - Chemin tools: ${toolsPackPath}`);

    // Import dynamique
    const { structureOutput } = await import(toolsPackPath + '/structureOutput.js');

    if (typeof structureOutput !== 'function') {
      throw new Error(
        `La fonction structureOutput n'est pas exportée correctement depuis ${toolsPackPath}`
      );
    }

    // Appeler la vraie fonction
    console.log('   - Appel de structureOutput()...');
    const result = await structureOutput({
      text_from_kimmy: input.text_from_kimmy,
    });

    console.log('   ✅ Structuration réelle terminée avec succès');
    console.log(`   - Intent détecté: ${result.intent}`);
    console.log(`   - Entités: ${result.key_entities.join(', ')}`);
    console.log(`   - Actions: ${result.actions_proposees.length}`);

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
        'structure_output',
        'TOOLS_PACK_NOT_FOUND',
        { kimmyToolsPath: config.kimmyToolsPath, originalError: error.message }
      );
    }

    // Autres erreurs
    throw new KimmyToolError(
      `Erreur lors de la structuration: ${error instanceof Error ? error.message : String(error)}`,
      'structure_output',
      'STRUCTURE_ERROR',
      error
    );
  }
}
