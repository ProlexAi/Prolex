/**
 * Simulateur de workflows n8n
 * Analyse et simule l'exécution de workflows sans les exécuter réellement
 */

import { N8nWorkflow, N8nNode, WorkflowSimulationDetails } from '../types';

/**
 * Simule l'exécution d'un workflow n8n
 */
export function simulerWorkflow(workflow: N8nWorkflow): WorkflowSimulationDetails {
  const logEtapes: string[] = [];
  const nodesAnalysees: any[] = [];
  const flowsSimules: any[] = [];

  logEtapes.push(`🔄 Début de la simulation du workflow: ${workflow.name}`);

  // Vérifier la structure
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    logEtapes.push('❌ Erreur: Le workflow ne contient pas de nœuds valides');
    return { nodesAnalysees: [], flowsSimules: [], logEtapes };
  }

  // Analyser chaque nœud
  workflow.nodes.forEach((node, index) => {
    logEtapes.push(`\n📍 Nœud ${index + 1}/${workflow.nodes.length}: ${node.name} (${node.type})`);

    const analyseNode = analyserNoeud(node);
    nodesAnalysees.push(analyseNode);

    analyseNode.logs.forEach((log: string) => {
      logEtapes.push(`  ${log}`);
    });
  });

  // Simuler les connexions entre nœuds
  const connections = workflow.connections || {};
  Object.keys(connections).forEach(sourceNode => {
    const sourceConnections = connections[sourceNode];
    Object.keys(sourceConnections).forEach(outputIndex => {
      const outputs = sourceConnections[outputIndex];
      if (Array.isArray(outputs)) {
        outputs.forEach(output => {
          const flow = {
            from: sourceNode,
            to: output.node,
            outputIndex: parseInt(outputIndex),
            inputIndex: output.index || 0,
          };
          flowsSimules.push(flow);
          logEtapes.push(`\n🔗 Connexion: ${sourceNode} → ${output.node}`);
        });
      }
    });
  });

  logEtapes.push(`\n✅ Simulation terminée`);
  logEtapes.push(`   - ${nodesAnalysees.length} nœuds analysés`);
  logEtapes.push(`   - ${flowsSimules.length} connexions simulées`);

  return {
    nodesAnalysees,
    flowsSimules,
    logEtapes,
  };
}

/**
 * Analyse un nœud individuel
 */
function analyserNoeud(node: N8nNode): any {
  const analyse: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    logs: [],
    risques: [],
    parametres: {},
  };

  // Analyser selon le type de nœud
  switch (node.type) {
    case 'n8n-nodes-base.start':
      analyse.logs.push('✓ Nœud de démarrage du workflow');
      break;

    case 'n8n-nodes-base.httpRequest':
      analyserHttpRequest(node, analyse);
      break;

    case 'n8n-nodes-base.webhook':
      analyserWebhook(node, analyse);
      break;

    case 'n8n-nodes-base.set':
      analyserSet(node, analyse);
      break;

    case 'n8n-nodes-base.if':
      analyserIf(node, analyse);
      break;

    case 'n8n-nodes-base.function':
    case 'n8n-nodes-base.code':
      analyserCode(node, analyse);
      break;

    case 'n8n-nodes-base.postgres':
    case 'n8n-nodes-base.mysql':
    case 'n8n-nodes-base.mongodb':
      analyserDatabase(node, analyse);
      break;

    default:
      analyse.logs.push(`ℹ️  Nœud de type: ${node.type}`);
      if (node.parameters) {
        analyse.logs.push(`   Paramètres: ${Object.keys(node.parameters).length} champs`);
      }
  }

  return analyse;
}

/**
 * Analyse un nœud HTTP Request
 */
function analyserHttpRequest(node: N8nNode, analyse: any): void {
  const params = node.parameters || {};
  const method = params.requestMethod || params.method || 'GET';
  const url = params.url || '(URL non définie)';

  analyse.parametres = { method, url };
  analyse.logs.push(`🌐 Requête HTTP ${method} vers: ${url}`);

  // Détection de méthodes critiques
  const methodesCritiques = ['DELETE', 'PURGE', 'RESET'];
  if (methodesCritiques.includes(method.toUpperCase())) {
    analyse.risques.push({
      niveau: 'élevé',
      description: `Utilisation de la méthode ${method}`,
    });
    analyse.logs.push(`   ⚠️  ATTENTION: Méthode ${method} détectée`);
  }

  // Vérifier les headers
  if (params.headerParameters) {
    analyse.logs.push(`   Headers: ${params.headerParameters.parameters?.length || 0} définis`);
  }

  // Vérifier le body
  if (params.body || params.bodyParametersJson) {
    analyse.logs.push(`   Body: présent`);
  }
}

/**
 * Analyse un nœud Webhook
 */
function analyserWebhook(node: N8nNode, analyse: any): void {
  const params = node.parameters || {};
  const path = params.path || '(non défini)';
  const method = params.httpMethod || 'GET';

  analyse.parametres = { path, method };
  analyse.logs.push(`📥 Webhook ${method} sur le chemin: ${path}`);

  if (params.authentication) {
    analyse.logs.push(`   🔒 Authentication activée: ${params.authentication}`);
  }
}

/**
 * Analyse un nœud Set
 */
function analyserSet(node: N8nNode, analyse: any): void {
  const params = node.parameters || {};
  const values = params.values || {};

  analyse.logs.push(`📝 Nœud Set - Définition de valeurs`);

  if (values.string) {
    analyse.logs.push(`   Strings: ${values.string.length || 0}`);
  }
  if (values.number) {
    analyse.logs.push(`   Numbers: ${values.number.length || 0}`);
  }
  if (values.boolean) {
    analyse.logs.push(`   Booleans: ${values.boolean.length || 0}`);
  }
}

/**
 * Analyse un nœud If (condition)
 */
function analyserIf(node: N8nNode, analyse: any): void {
  const params = node.parameters || {};
  const conditions = params.conditions || {};

  analyse.logs.push(`🔀 Nœud conditionnel (IF)`);

  if (conditions.boolean) {
    analyse.logs.push(`   Conditions booléennes: ${conditions.boolean.length || 0}`);
  }
  if (conditions.number) {
    analyse.logs.push(`   Conditions numériques: ${conditions.number.length || 0}`);
  }
  if (conditions.string) {
    analyse.logs.push(`   Conditions textuelles: ${conditions.string.length || 0}`);
  }
}

/**
 * Analyse un nœud de code (Function/Code)
 */
function analyserCode(node: N8nNode, analyse: any): void {
  const params = node.parameters || {};
  const code = params.functionCode || params.jsCode || '';

  analyse.logs.push(`💻 Nœud de code JavaScript`);
  analyse.logs.push(`   Longueur du code: ${code.length} caractères`);

  // Détecter des patterns dangereux dans le code
  const patternsDangereux = [
    { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/i, description: 'Utilisation de child_process' },
    { pattern: /require\s*\(\s*['"]fs['"]\s*\)/i, description: 'Accès au système de fichiers' },
    { pattern: /eval\s*\(/i, description: 'Utilisation de eval()' },
    { pattern: /exec\s*\(/i, description: 'Exécution de commandes' },
  ];

  patternsDangereux.forEach(({ pattern, description }) => {
    if (pattern.test(code)) {
      analyse.risques.push({
        niveau: 'élevé',
        description,
      });
      analyse.logs.push(`   ⚠️  ATTENTION: ${description}`);
    }
  });
}

/**
 * Analyse un nœud de base de données
 */
function analyserDatabase(node: N8nNode, analyse: any): void {
  const params = node.parameters || {};
  const operation = params.operation || '(non défini)';

  analyse.logs.push(`🗄️  Nœud de base de données (${node.type})`);
  analyse.logs.push(`   Opération: ${operation}`);

  const operationsCritiques = ['delete', 'truncate', 'drop', 'update', 'executeQuery'];
  if (operationsCritiques.includes(operation.toLowerCase())) {
    analyse.risques.push({
      niveau: operation === 'delete' || operation === 'truncate' ? 'critique' : 'élevé',
      description: `Opération de base de données: ${operation}`,
    });
    analyse.logs.push(`   ⚠️  ATTENTION: Opération ${operation} détectée`);
  }

  if (params.query) {
    const query = params.query.toLowerCase();
    if (query.includes('drop table') || query.includes('truncate')) {
      analyse.risques.push({
        niveau: 'critique',
        description: 'Requête SQL destructive détectée',
      });
      analyse.logs.push(`   🚨 CRITIQUE: Requête destructive détectée`);
    }
  }
}

/**
 * Génère un résumé de la simulation
 */
export function genererResumeSimulation(details: WorkflowSimulationDetails): string {
  const nbNodes = details.nodesAnalysees.length;
  const nbConnections = details.flowsSimules.length;

  const risquesEleves = details.nodesAnalysees.filter(
    (node: any) => node.risques.some((r: any) => r.niveau === 'élevé' || r.niveau === 'critique')
  );

  let resume = `Simulation de workflow n8n: ${nbNodes} nœuds analysés, ${nbConnections} connexions.`;

  if (risquesEleves.length > 0) {
    resume += ` ⚠️ ${risquesEleves.length} nœud(s) à risque détecté(s).`;
  } else {
    resume += ` Aucun risque majeur détecté.`;
  }

  return resume;
}
