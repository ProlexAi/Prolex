/**
 * Routes API pour les scénarios
 */

import { Router, Request, Response } from 'express';
import { createScenario, getAllScenarios, getScenarioById } from '../db';
import { CreateScenarioInput, ErrorResponse, SuccessResponse } from '../types';

const router = Router();

/**
 * POST /api/scenarios
 * Crée un nouveau scénario
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const input: CreateScenarioInput = req.body;

    // Validation basique
    if (!input.nom || !input.type || !input.payload) {
      const error: ErrorResponse = {
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Les champs "nom", "type" et "payload" sont requis',
          timestamp: new Date().toISOString(),
        },
      };
      return res.status(400).json(error);
    }

    // Valider le type
    const typesValides = ['workflow_n8n', 'appel_mcp', 'sequence_mixte'];
    if (!typesValides.includes(input.type)) {
      const error: ErrorResponse = {
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: `Type invalide. Types acceptés: ${typesValides.join(', ')}`,
          timestamp: new Date().toISOString(),
        },
      };
      return res.status(400).json(error);
    }

    const scenario = await createScenario(input);

    console.log(`✅ Scénario créé: ${scenario.id} - ${scenario.nom}`);

    const response: SuccessResponse = {
      status: 'success',
      data: scenario,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('❌ Erreur lors de la création du scénario:', error);

    const errorResponse: ErrorResponse = {
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la création du scénario',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/scenarios
 * Liste tous les scénarios
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const scenarios = await getAllScenarios();

    const response: SuccessResponse = {
      status: 'success',
      data: scenarios,
    };

    res.json(response);
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des scénarios:', error);

    const errorResponse: ErrorResponse = {
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des scénarios',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /api/scenarios/:id
 * Récupère un scénario par ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const scenario = await getScenarioById(id);

    if (!scenario) {
      const error: ErrorResponse = {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Scénario avec l'ID ${id} non trouvé`,
          timestamp: new Date().toISOString(),
        },
      };
      return res.status(404).json(error);
    }

    const response: SuccessResponse = {
      status: 'success',
      data: scenario,
    };

    res.json(response);
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération du scénario:', error);

    const errorResponse: ErrorResponse = {
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération du scénario',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json(errorResponse);
  }
});

export default router;
