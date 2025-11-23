#!/usr/bin/env ts-node
/**
 * Script utilitaire pour créer un scénario Sandbox à partir d'un fichier workflow n8n
 *
 * Usage: npm run creer-scenario-workflow -- ./workflows/mon_workflow.json
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Charger la config
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = process.env.API_URL || `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3001}`;

/**
 * Fonction principale
 */
async function main() {
  console.log('\n📋 Création de scénario Sandbox à partir d\'un workflow n8n\n');

  // Récupérer le chemin du fichier depuis les arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Erreur: Aucun fichier spécifié\n');
    console.log('Usage: npm run creer-scenario-workflow -- <chemin-vers-workflow.json>\n');
    console.log('Exemple: npm run creer-scenario-workflow -- ./workflows/mon_workflow.json\n');
    process.exit(1);
  }

  const filePath = args[0];

  // Vérifier que le fichier existe
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Erreur: Le fichier "${filePath}" n'existe pas\n`);
    process.exit(1);
  }

  console.log(`📁 Lecture du fichier: ${filePath}`);

  // Lire le fichier
  let workflowJson: any;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    workflowJson = JSON.parse(fileContent);
  } catch (error: any) {
    console.error(`❌ Erreur lors de la lecture du fichier: ${error.message}\n`);
    process.exit(1);
  }

  // Extraire le nom du workflow
  const workflowName = workflowJson.name || path.basename(filePath, '.json');

  console.log(`✅ Workflow chargé: ${workflowName}`);
  console.log(`   Nœuds: ${workflowJson.nodes?.length || 0}`);

  // Préparer le payload pour créer un scénario
  const scenarioPayload = {
    nom: `Test: ${workflowName}`,
    description: `Scénario de test créé automatiquement à partir du workflow ${workflowName}`,
    type: 'workflow_n8n',
    payload: workflowJson,
  };

  console.log(`\n🚀 Création du scénario via l'API...`);
  console.log(`   URL: ${API_URL}/api/scenarios`);

  // Appeler l'API pour créer le scénario
  try {
    const response = await fetch(`${API_URL}/api/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenarioPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Erreur de l'API (${response.status}):`, errorData);
      process.exit(1);
    }

    const result = await response.json();

    if (result.status === 'success') {
      const scenario = result.data;

      console.log(`\n✅ Scénario créé avec succès!\n`);
      console.log(`   ID: ${scenario.id}`);
      console.log(`   Nom: ${scenario.nom}`);
      console.log(`   Type: ${scenario.type}`);
      console.log(`   Créé le: ${new Date(scenario.createdAt).toLocaleString('fr-FR')}\n`);

      console.log(`💡 Pour lancer la simulation, utilisez:`);
      console.log(`   curl -X POST ${API_URL}/api/run \\`);
      console.log(`        -H "Content-Type: application/json" \\`);
      console.log(`        -d '{"scenarioId": "${scenario.id}"}'\n`);
    } else {
      console.error(`❌ Erreur lors de la création du scénario:`, result);
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors de l'appel à l'API: ${error.message}\n`);
    console.error(`   Assurez-vous que le serveur Sandbox est démarré (npm run dev)\n`);
    process.exit(1);
  }
}

// Lancer le script
main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
