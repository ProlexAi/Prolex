/**
 * Module de garde-fous pour Prolex Sandbox
 * Évalue les risques des scénarios et détecte les actions dangereuses
 */

import { Scenario, EvaluationRisque, NiveauRisque, Alerte, N8nWorkflow, N8nNode } from '../types';
import { config } from '../config';

/**
 * Actions HTTP considérées comme à risque
 */
const ACTIONS_CRITIQUES_HTTP = ['DELETE', 'PURGE', 'RESET', 'TRUNCATE'];

/**
 * Types de nœuds n8n considérés comme critiques
 */
const NOEUDS_CRITIQUES = [
  'n8n-nodes-base.httpRequest',
  'n8n-nodes-base.postgres',
  'n8n-nodes-base.mysql',
  'n8n-nodes-base.mongodb',
];

/**
 * Endpoints sensibles (patterns regex)
 */
const ENDPOINTS_SENSIBLES = [
  /\/api\/.*\/delete/i,
  /\/api\/.*\/remove/i,
  /\/api\/.*\/purge/i,
  /\/api\/.*\/reset/i,
  /\/workflows\/.*\/delete/i,
  /\/users\/.*\/delete/i,
  /\/database\//i,
];

/**
 * Mots-clés critiques dans les payloads
 */
const MOTS_CLES_CRITIQUES = [
  'drop table',
  'truncate',
  'delete from',
  'remove all',
  'clear database',
  'reset system',
];

/**
 * Évalue le risque d'un scénario
 */
export function evaluerRisqueScenario(scenario: Scenario): EvaluationRisque {
  const alertes: Alerte[] = [];
  let niveauRisque: NiveauRisque = 'faible';
  let probabiliteDanger = 0;

  // Évaluer selon le type de scénario
  switch (scenario.type) {
    case 'workflow_n8n':
      const evalWorkflow = evaluerRisqueWorkflow(scenario.payload);
      alertes.push(...evalWorkflow.alertes);
      probabiliteDanger = evalWorkflow.probabiliteDanger;
      niveauRisque = evalWorkflow.niveauRisque;
      break;

    case 'appel_mcp':
      const evalMcp = evaluerRisqueMcp(scenario.payload);
      alertes.push(...evalMcp.alertes);
      probabiliteDanger = evalMcp.probabiliteDanger;
      niveauRisque = evalMcp.niveauRisque;
      break;

    case 'sequence_mixte':
      const evalSequence = evaluerRisqueSequence(scenario.payload);
      alertes.push(...evalSequence.alertes);
      probabiliteDanger = evalSequence.probabiliteDanger;
      niveauRisque = evalSequence.niveauRisque;
      break;
  }

  // Alerte si le nombre d'actions dépasse la limite
  const nbActions = compterActions(scenario);
  if (nbActions > config.maxActionsParTest) {
    alertes.push({
      type: 'limite_depassee',
      description: `Ce scénario contient ${nbActions} actions, ce qui dépasse la limite de ${config.maxActionsParTest}.`,
      niveauRisque: 'moyen',
      details: { nbActions, limite: config.maxActionsParTest },
    });
    probabiliteDanger = Math.max(probabiliteDanger, 0.4);
    if (niveauRisque === 'faible') niveauRisque = 'moyen';
  }

  return {
    niveauRisque,
    probabiliteDanger,
    alertes,
  };
}

/**
 * Évalue le risque d'un workflow n8n
 */
function evaluerRisqueWorkflow(workflow: N8nWorkflow): EvaluationRisque {
  const alertes: Alerte[] = [];
  let probabiliteDanger = 0;
  let niveauRisque: NiveauRisque = 'faible';

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    alertes.push({
      type: 'structure_invalide',
      description: 'Le workflow n\'a pas de nœuds ou la structure est invalide.',
      niveauRisque: 'moyen',
    });
    return { niveauRisque: 'moyen', probabiliteDanger: 0.3, alertes };
  }

  // Analyser chaque nœud
  workflow.nodes.forEach((node: N8nNode) => {
    // Détecter les nœuds critiques
    if (NOEUDS_CRITIQUES.includes(node.type)) {
      const evalNode = evaluerNoeudCritique(node);
      alertes.push(...evalNode.alertes);
      probabiliteDanger = Math.max(probabiliteDanger, evalNode.probabiliteDanger);
      if (evalNode.niveauRisque === 'critique' || evalNode.niveauRisque === 'élevé') {
        niveauRisque = evalNode.niveauRisque;
      }
    }

    // Détecter les requêtes HTTP avec méthodes dangereuses
    if (node.type === 'n8n-nodes-base.httpRequest') {
      const method = node.parameters?.requestMethod || node.parameters?.method || 'GET';
      if (ACTIONS_CRITIQUES_HTTP.includes(method.toUpperCase())) {
        alertes.push({
          type: 'action_critique',
          description: `Le nœud "${node.name}" utilise une méthode HTTP dangereuse: ${method}`,
          niveauRisque: 'élevé',
          details: { node: node.name, method },
        });
        probabiliteDanger = Math.max(probabiliteDanger, 0.7);
        niveauRisque = 'élevé';
      }

      // Vérifier l'URL
      const url = node.parameters?.url || '';
      ENDPOINTS_SENSIBLES.forEach(pattern => {
        if (pattern.test(url)) {
          alertes.push({
            type: 'endpoint_sensible',
            description: `Le nœud "${node.name}" cible un endpoint sensible: ${url}`,
            niveauRisque: 'élevé',
            details: { node: node.name, url },
          });
          probabiliteDanger = Math.max(probabiliteDanger, 0.6);
          if (niveauRisque === 'faible' || niveauRisque === 'moyen') {
            niveauRisque = 'élevé';
          }
        }
      });
    }
  });

  return { niveauRisque, probabiliteDanger, alertes };
}

/**
 * Évalue un nœud critique (DB, etc.)
 */
function evaluerNoeudCritique(node: N8nNode): EvaluationRisque {
  const alertes: Alerte[] = [];
  let probabiliteDanger = 0.5;
  let niveauRisque: NiveauRisque = 'moyen';

  // Chercher des mots-clés dangereux dans les paramètres
  const paramsStr = JSON.stringify(node.parameters || {}).toLowerCase();

  MOTS_CLES_CRITIQUES.forEach(motCle => {
    if (paramsStr.includes(motCle.toLowerCase())) {
      alertes.push({
        type: 'mot_cle_critique',
        description: `Le nœud "${node.name}" contient une opération critique: "${motCle}"`,
        niveauRisque: 'critique',
        details: { node: node.name, motCle },
      });
      probabiliteDanger = 0.9;
      niveauRisque = 'critique';
    }
  });

  if (alertes.length === 0) {
    alertes.push({
      type: 'noeud_sensible',
      description: `Le nœud "${node.name}" (type: ${node.type}) manipule des ressources sensibles.`,
      niveauRisque: 'moyen',
      details: { node: node.name, type: node.type },
    });
  }

  return { niveauRisque, probabiliteDanger, alertes };
}

/**
 * Évalue le risque d'un appel MCP
 */
function evaluerRisqueMcp(payload: any): EvaluationRisque {
  const alertes: Alerte[] = [];
  let probabiliteDanger = 0;
  let niveauRisque: NiveauRisque = 'faible';

  const endpoint = payload.endpoint || '';
  const method = (payload.method || 'GET').toUpperCase();

  // Vérifier la méthode
  if (ACTIONS_CRITIQUES_HTTP.includes(method)) {
    alertes.push({
      type: 'methode_critique',
      description: `Appel MCP avec méthode dangereuse: ${method}`,
      niveauRisque: 'élevé',
      details: { endpoint, method },
    });
    probabiliteDanger = 0.7;
    niveauRisque = 'élevé';
  }

  // Vérifier l'endpoint
  ENDPOINTS_SENSIBLES.forEach(pattern => {
    if (pattern.test(endpoint)) {
      alertes.push({
        type: 'endpoint_sensible',
        description: `Appel MCP vers un endpoint sensible: ${endpoint}`,
        niveauRisque: 'élevé',
        details: { endpoint, method },
      });
      probabiliteDanger = Math.max(probabiliteDanger, 0.6);
      if (niveauRisque === 'faible' || niveauRisque === 'moyen') {
        niveauRisque = 'élevé';
      }
    }
  });

  if (alertes.length === 0) {
    alertes.push({
      type: 'appel_mcp',
      description: `Appel MCP à ${endpoint} (${method})`,
      niveauRisque: 'faible',
      details: { endpoint, method },
    });
  }

  return { niveauRisque, probabiliteDanger, alertes };
}

/**
 * Évalue le risque d'une séquence mixte
 */
function evaluerRisqueSequence(payload: any): EvaluationRisque {
  const alertes: Alerte[] = [];
  let probabiliteDanger = 0;
  let niveauRisque: NiveauRisque = 'faible';

  const etapes = payload.etapes || [];

  etapes.forEach((etape: any, index: number) => {
    let evalEtape: EvaluationRisque;

    if (etape.type === 'workflow_n8n') {
      evalEtape = evaluerRisqueWorkflow(etape.payload);
    } else if (etape.type === 'appel_mcp') {
      evalEtape = evaluerRisqueMcp(etape.payload);
    } else {
      return;
    }

    // Préfixer les alertes avec le numéro d'étape
    evalEtape.alertes.forEach(alerte => {
      alertes.push({
        ...alerte,
        description: `[Étape ${index + 1}] ${alerte.description}`,
      });
    });

    probabiliteDanger = Math.max(probabiliteDanger, evalEtape.probabiliteDanger);

    if (evalEtape.niveauRisque === 'critique') {
      niveauRisque = 'critique';
    } else if (evalEtape.niveauRisque === 'élevé' && niveauRisque !== 'critique') {
      niveauRisque = 'élevé';
    } else if (evalEtape.niveauRisque === 'moyen' && niveauRisque === 'faible') {
      niveauRisque = 'moyen';
    }
  });

  return { niveauRisque, probabiliteDanger, alertes };
}

/**
 * Compte le nombre d'actions dans un scénario
 */
function compterActions(scenario: Scenario): number {
  switch (scenario.type) {
    case 'workflow_n8n':
      return scenario.payload.nodes?.length || 0;
    case 'appel_mcp':
      return 1;
    case 'sequence_mixte':
      return scenario.payload.etapes?.length || 0;
    default:
      return 0;
  }
}

/**
 * Détermine si un scénario doit être bloqué en mode strict
 */
export function doitBloquerEnModeStrict(evaluation: EvaluationRisque): boolean {
  if (!config.gardesFousActifs) return false;
  if (config.modeSandbox !== 'strict') return false;

  return evaluation.niveauRisque === 'critique' || evaluation.niveauRisque === 'élevé';
}
