/**
 * Simulateur d'appels MCP
 * Simule des appels aux serveurs MCP sans les exécuter réellement
 */

import { McpAction, McpSimulationDetails } from '../types';

/**
 * Simule un appel MCP
 */
export function simulerAppelMcp(action: McpAction): McpSimulationDetails {
  const { endpoint, method, payload, headers } = action;

  // Générer une réponse simulée basée sur l'endpoint
  const reponseSimulee = genererReponseMock(endpoint, method, payload);

  return {
    endpoint,
    methode: method,
    payloadSimule: payload,
    reponseSimulee,
  };
}

/**
 * Génère une réponse mock basée sur l'endpoint
 */
function genererReponseMock(endpoint: string, method: string, payload: any): any {
  // Déterminer le type d'endpoint
  if (endpoint.includes('/workflows')) {
    return genererMockWorkflow(endpoint, method, payload);
  }

  if (endpoint.includes('/executions')) {
    return genererMockExecution(endpoint, method, payload);
  }

  if (endpoint.includes('/credentials')) {
    return genererMockCredentials(endpoint, method, payload);
  }

  // Mock générique
  return {
    status: 'success',
    message: `Simulation d'appel ${method} vers ${endpoint}`,
    data: {
      simulated: true,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Mock pour les endpoints de workflows
 */
function genererMockWorkflow(endpoint: string, method: string, payload: any): any {
  switch (method.toUpperCase()) {
    case 'GET':
      if (endpoint.endsWith('/workflows')) {
        // Liste de workflows
        return {
          data: [
            {
              id: 'mock-1',
              name: 'Workflow Mock 1',
              active: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'mock-2',
              name: 'Workflow Mock 2',
              active: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        };
      } else {
        // Workflow individuel
        return {
          data: {
            id: 'mock-1',
            name: 'Workflow Mock',
            active: true,
            nodes: [
              { id: '1', name: 'Start', type: 'n8n-nodes-base.start' },
              { id: '2', name: 'HTTP Request', type: 'n8n-nodes-base.httpRequest' },
            ],
            connections: {},
            settings: {},
          },
        };
      }

    case 'POST':
      return {
        data: {
          id: 'mock-new-' + Date.now(),
          name: payload.name || 'Nouveau workflow',
          active: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          message: '✅ Workflow créé (simulation)',
        },
      };

    case 'PUT':
    case 'PATCH':
      return {
        data: {
          id: 'mock-1',
          ...payload,
          updatedAt: new Date().toISOString(),
          message: '✅ Workflow mis à jour (simulation)',
        },
      };

    case 'DELETE':
      return {
        data: {
          success: true,
          message: '⚠️ Workflow supprimé (simulation)',
        },
      };

    default:
      return { error: 'Méthode non supportée' };
  }
}

/**
 * Mock pour les endpoints d'exécutions
 */
function genererMockExecution(endpoint: string, method: string, payload: any): any {
  switch (method.toUpperCase()) {
    case 'GET':
      return {
        data: [
          {
            id: 'exec-mock-1',
            workflowId: 'workflow-mock-1',
            finished: true,
            mode: 'manual',
            startedAt: new Date(Date.now() - 60000).toISOString(),
            stoppedAt: new Date().toISOString(),
            status: 'success',
          },
        ],
      };

    case 'POST':
      return {
        data: {
          id: 'exec-mock-' + Date.now(),
          workflowId: payload.workflowId || 'unknown',
          finished: true,
          mode: 'manual',
          startedAt: new Date().toISOString(),
          stoppedAt: new Date(Date.now() + 1000).toISOString(),
          status: 'success',
          data: {
            resultData: {
              runData: {},
            },
          },
          message: '✅ Exécution simulée avec succès',
        },
      };

    default:
      return { error: 'Méthode non supportée' };
  }
}

/**
 * Mock pour les endpoints de credentials
 */
function genererMockCredentials(endpoint: string, method: string, payload: any): any {
  switch (method.toUpperCase()) {
    case 'GET':
      return {
        data: [
          {
            id: 'cred-mock-1',
            name: 'API Credentials Mock',
            type: 'httpBasicAuth',
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case 'POST':
      return {
        data: {
          id: 'cred-mock-' + Date.now(),
          name: payload.name || 'Nouvelles credentials',
          type: payload.type || 'unknown',
          createdAt: new Date().toISOString(),
          message: '✅ Credentials créées (simulation)',
        },
      };

    default:
      return { error: 'Méthode non supportée' };
  }
}

/**
 * Génère un résumé de la simulation MCP
 */
export function genererResumeSimulationMcp(details: McpSimulationDetails): string {
  const { methode, endpoint, reponseSimulee } = details;

  let resume = `Simulation d'appel MCP ${methode} vers ${endpoint}.`;

  if (reponseSimulee.error) {
    resume += ` ❌ Erreur simulée: ${reponseSimulee.error}`;
  } else if (reponseSimulee.data) {
    if (reponseSimulee.data.message) {
      resume += ` ${reponseSimulee.data.message}`;
    } else {
      resume += ` ✅ Succès simulé.`;
    }
  }

  return resume;
}

/**
 * Détecte si un appel MCP est en lecture seule
 */
export function estAppelLectureSeule(action: McpAction): boolean {
  return action.method.toUpperCase() === 'GET';
}

/**
 * Détecte si un appel MCP est destructif
 */
export function estAppelDestructif(action: McpAction): boolean {
  const methodesDestructives = ['DELETE', 'PURGE'];
  return methodesDestructives.includes(action.method.toUpperCase());
}
