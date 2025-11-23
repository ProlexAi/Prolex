/**
 * Service principal Prolex Sandbox
 * Orchestre les simulations de scénarios
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Scenario,
  SandboxRun,
  RunResponse,
  RunStatus,
  RunDetails,
  Alerte,
  SequenceMixte,
} from '../types';
import { config } from '../config';
import { evaluerRisqueScenario, doitBloquerEnModeStrict } from './gardeFousSandbox';
import { simulerWorkflow, genererResumeSimulation } from './n8nSimulator';
import { simulerAppelMcp, genererResumeSimulationMcp } from './mcpSimulator';

/**
 * Exécute un scénario en mode simulation
 */
export async function executerScenario(scenario: Scenario): Promise<RunResponse> {
  console.log(`\n🚀 Exécution du scénario: ${scenario.nom} (${scenario.type})`);

  // Évaluer les risques
  const evaluation = evaluerRisqueScenario(scenario);
  console.log(`📊 Évaluation des risques: ${evaluation.niveauRisque} (${Math.round(evaluation.probabiliteDanger * 100)}%)`);

  const alertes: Alerte[] = [...evaluation.alertes];

  // Vérifier si on doit bloquer en mode strict
  if (doitBloquerEnModeStrict(evaluation)) {
    console.log(`🛑 Scénario bloqué en mode strict (risque ${evaluation.niveauRisque})`);

    const runId = uuidv4();
    const response: RunResponse = {
      scenarioId: scenario.id,
      runId,
      statut: 'partiel',
      resume: `Scénario bloqué en mode strict: risque ${evaluation.niveauRisque}. Passez en mode "relaxed" pour simuler malgré tout.`,
      alertes,
      details: {
        bloque: true,
        raison: 'mode_strict',
        evaluation,
      },
    };

    return response;
  }

  // Exécuter selon le type de scénario
  let statut: RunStatus = 'ok';
  let resume = '';
  let details: RunDetails = {};

  try {
    switch (scenario.type) {
      case 'workflow_n8n':
        const resultWorkflow = await simulerScenarioWorkflow(scenario);
        resume = resultWorkflow.resume;
        details = resultWorkflow.details;
        statut = resultWorkflow.statut;
        alertes.push(...resultWorkflow.alertes);
        break;

      case 'appel_mcp':
        const resultMcp = await simulerScenarioMcp(scenario);
        resume = resultMcp.resume;
        details = resultMcp.details;
        statut = resultMcp.statut;
        alertes.push(...resultMcp.alertes);
        break;

      case 'sequence_mixte':
        const resultSequence = await simulerScenarioSequence(scenario);
        resume = resultSequence.resume;
        details = resultSequence.details;
        statut = resultSequence.statut;
        alertes.push(...resultSequence.alertes);
        break;

      default:
        throw new Error(`Type de scénario non supporté: ${scenario.type}`);
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors de la simulation:`, error.message);
    statut = 'erreur';
    resume = `Erreur lors de la simulation: ${error.message}`;
    details = { error: error.message, stack: error.stack };
  }

  const runId = uuidv4();

  console.log(`✅ Simulation terminée: ${statut}`);

  const response: RunResponse = {
    scenarioId: scenario.id,
    runId,
    statut,
    resume,
    alertes,
    details,
  };

  return response;
}

/**
 * Simule un scénario de type workflow n8n
 */
async function simulerScenarioWorkflow(scenario: Scenario): Promise<{
  statut: RunStatus;
  resume: string;
  details: RunDetails;
  alertes: Alerte[];
}> {
  console.log(`📋 Simulation d'un workflow n8n...`);

  const workflow = scenario.payload;
  const simulationDetails = simulerWorkflow(workflow);
  const resume = genererResumeSimulation(simulationDetails);

  // Extraire les alertes des nœuds analysés
  const alertes: Alerte[] = [];
  simulationDetails.nodesAnalysees.forEach((node: any) => {
    if (node.risques && node.risques.length > 0) {
      node.risques.forEach((risque: any) => {
        alertes.push({
          type: 'risque_noeud',
          description: `Nœud "${node.name}": ${risque.description}`,
          niveauRisque: risque.niveau,
          details: { nodeId: node.id, nodeName: node.name },
        });
      });
    }
  });

  return {
    statut: 'ok',
    resume,
    details: simulationDetails,
    alertes,
  };
}

/**
 * Simule un scénario de type appel MCP
 */
async function simulerScenarioMcp(scenario: Scenario): Promise<{
  statut: RunStatus;
  resume: string;
  details: RunDetails;
  alertes: Alerte[];
}> {
  console.log(`🔌 Simulation d'un appel MCP...`);

  const action = scenario.payload;
  const simulationDetails = simulerAppelMcp(action);
  const resume = genererResumeSimulationMcp(simulationDetails);

  return {
    statut: 'ok',
    resume,
    details: simulationDetails,
    alertes: [],
  };
}

/**
 * Simule un scénario de type séquence mixte
 */
async function simulerScenarioSequence(scenario: Scenario): Promise<{
  statut: RunStatus;
  resume: string;
  details: RunDetails;
  alertes: Alerte[];
}> {
  console.log(`🔄 Simulation d'une séquence mixte...`);

  const sequence: SequenceMixte = scenario.payload;
  const etapes = sequence.etapes || [];

  if (etapes.length === 0) {
    return {
      statut: 'erreur',
      resume: 'La séquence ne contient aucune étape',
      details: {},
      alertes: [],
    };
  }

  const resultatsEtapes: any[] = [];
  const alertes: Alerte[] = [];
  let statut: RunStatus = 'ok';

  for (let i = 0; i < etapes.length; i++) {
    const etape = etapes[i];
    console.log(`  Étape ${i + 1}/${etapes.length}: ${etape.nom} (${etape.type})`);

    try {
      let resultatEtape: any;

      if (etape.type === 'workflow_n8n') {
        const workflow = etape.payload;
        const simulationDetails = simulerWorkflow(workflow);
        resultatEtape = {
          etape: i + 1,
          nom: etape.nom,
          type: etape.type,
          statut: 'ok',
          details: simulationDetails,
        };

        // Extraire les alertes
        simulationDetails.nodesAnalysees.forEach((node: any) => {
          if (node.risques && node.risques.length > 0) {
            node.risques.forEach((risque: any) => {
              alertes.push({
                type: 'risque_etape',
                description: `[Étape ${i + 1}] Nœud "${node.name}": ${risque.description}`,
                niveauRisque: risque.niveau,
                details: { etape: i + 1, nodeId: node.id },
              });
            });
          }
        });
      } else if (etape.type === 'appel_mcp') {
        const action = etape.payload;
        const simulationDetails = simulerAppelMcp(action);
        resultatEtape = {
          etape: i + 1,
          nom: etape.nom,
          type: etape.type,
          statut: 'ok',
          details: simulationDetails,
        };
      } else {
        throw new Error(`Type d'étape non supporté: ${etape.type}`);
      }

      resultatsEtapes.push(resultatEtape);
    } catch (error: any) {
      console.error(`  ❌ Erreur à l'étape ${i + 1}:`, error.message);
      resultatsEtapes.push({
        etape: i + 1,
        nom: etape.nom,
        type: etape.type,
        statut: 'erreur',
        erreur: error.message,
      });
      statut = 'partiel';

      alertes.push({
        type: 'erreur_etape',
        description: `Erreur à l'étape ${i + 1}: ${error.message}`,
        niveauRisque: 'moyen',
        details: { etape: i + 1 },
      });
    }
  }

  const etapesReussies = resultatsEtapes.filter(r => r.statut === 'ok').length;
  const resume = `Séquence de ${etapes.length} étapes simulée. ${etapesReussies}/${etapes.length} étapes réussies.`;

  return {
    statut,
    resume,
    details: {
      nbEtapes: etapes.length,
      etapesReussies,
      resultatsEtapes,
    },
    alertes,
  };
}

/**
 * Crée un rapport JSON complet d'une exécution
 */
export function creerRapportExecution(response: RunResponse, scenario: Scenario): string {
  const rapport = {
    scenario: {
      id: scenario.id,
      nom: scenario.nom,
      type: scenario.type,
      description: scenario.description,
    },
    execution: {
      runId: response.runId,
      timestamp: new Date().toISOString(),
      statut: response.statut,
      resume: response.resume,
    },
    evaluation: {
      nbAlertes: response.alertes.length,
      alertes: response.alertes,
    },
    details: response.details,
    configuration: {
      modeSandbox: config.modeSandbox,
      gardesFousActifs: config.gardesFousActifs,
    },
  };

  return JSON.stringify(rapport, null, 2);
}
