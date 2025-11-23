/**
 * Routes API pour les exécutions (runs)
 */

import { Router, Request, Response } from 'express';
import { getScenarioById, createRun, getRunById, getRunsByScenarioId } from '../db';
import { RunScenarioInput, ErrorResponse, SuccessResponse, SandboxRun } from '../types';
import { executerScenario } from '../services/sandboxService';

const router = Router();

/**
 * POST /api/run
 * Lance l'exécution d'un scénario
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const input: RunScenarioInput = req.body;

    // Validation
    if (!input.scenarioId) {
      const error: ErrorResponse = {
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le champ "scenarioId" est requis',
          timestamp: new Date().toISOString(),
        },
      };
      return res.status(400).json(error);
    }

    // Récupérer le scénario
    const scenario = await getScenarioById(input.scenarioId);

    if (!scenario) {
      const error: ErrorResponse = {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Scénario avec l'ID ${input.scenarioId} non trouvé`,
          timestamp: new Date().toISOString(),
        },
      };
      return res.status(404).json(error);
    }

    // Exécuter le scénario
    const runResponse = await executerScenario(scenario);

    // Enregistrer le run en DB
    const run: SandboxRun = {
      id: runResponse.runId,
      scenarioId: scenario.id,
      timestamp: new Date(),
      statut: runResponse.statut,
      resume: runResponse.resume,
      alertes: runResponse.alertes,
      details: runResponse.details,
    };

    await createRun(run);

    console.log(`✅ Run enregistré: ${run.id} - Statut: ${run.statut}`);

    const response: SuccessResponse = {
      status: 'success',
      data: runResponse,
    };

    res.json(response);
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'exécution du scénario:', error);

    const errorResponse: ErrorResponse = {
      status: 'error',
      error: {
        code: 'EXECUTION_ERROR',
        message: 'Erreur lors de l\'exécution du scénario',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/runs/:runId
 * Récupère les détails d'une exécution
 */
router.get('/:runId', async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;

    const run = await getRunById(runId);

    if (!run) {
      const error: ErrorResponse = {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Exécution avec l'ID ${runId} non trouvée`,
          timestamp: new Date().toISOString(),
        },
      };
      return res.status(404).json(error);
    }

    const response: SuccessResponse = {
      status: 'success',
      data: run,
    };

    res.json(response);
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération du run:', error);

    const errorResponse: ErrorResponse = {
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération du run',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/scenarios/:scenarioId/runs
 * Récupère toutes les exécutions d'un scénario
 */
router.get('/scenarios/:scenarioId/runs', async (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.params;

    // Vérifier que le scénario existe
    const scenario = await getScenarioById(scenarioId);
    if (!scenario) {
      const error: ErrorResponse = {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Scénario avec l'ID ${scenarioId} non trouvé`,
          timestamp: new Date().toISOString(),
        },
      };
      return res.status(404).json(error);
    }

    const runs = await getRunsByScenarioId(scenarioId);

    const response: SuccessResponse = {
      status: 'success',
      data: runs,
    };

    res.json(response);
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des runs:', error);

    const errorResponse: ErrorResponse = {
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des runs',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json(errorResponse);
  }
});

export default router;
