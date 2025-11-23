import { Router, Request, Response } from 'express';
import { CollectionsRepository } from '../repositories/collectionsRepo';
import { CreateCollectionSchema, ErrorCode, ApiError } from '../types';
import { ZodError } from 'zod';

const router = Router();
const collectionsRepo = new CollectionsRepository();

/**
 * POST /collections
 * Crée une nouvelle collection
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validation du body
    const validated = CreateCollectionSchema.parse(req.body);

    // Création
    const collection = await collectionsRepo.create(validated);

    res.status(201).json(collection);
  } catch (error: any) {
    if (error instanceof ZodError) {
      const apiError: ApiError = {
        error_code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request body',
        details: { errors: error.errors },
      };
      return res.status(400).json(apiError);
    }

    if (error.error_code) {
      return res.status(400).json(error as ApiError);
    }

    const apiError: ApiError = {
      error_code: ErrorCode.INTERNAL_ERROR,
      message: 'Failed to create collection',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

/**
 * GET /collections
 * Récupère toutes les collections
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const collections = await collectionsRepo.findAll();
    res.json(collections);
  } catch (error: any) {
    const apiError: ApiError = {
      error_code: ErrorCode.DATABASE_ERROR,
      message: 'Failed to fetch collections',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

/**
 * GET /collections/:name
 * Récupère une collection par son nom
 */
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const collection = await collectionsRepo.findByName(req.params.name);

    if (!collection) {
      const apiError: ApiError = {
        error_code: ErrorCode.COLLECTION_NOT_FOUND,
        message: `Collection '${req.params.name}' not found`,
      };
      return res.status(404).json(apiError);
    }

    res.json(collection);
  } catch (error: any) {
    const apiError: ApiError = {
      error_code: ErrorCode.DATABASE_ERROR,
      message: 'Failed to fetch collection',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

/**
 * DELETE /collections/:name
 * Supprime une collection et tous ses documents
 */
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    // Vérifie que la collection existe
    const collection = await collectionsRepo.findByName(req.params.name);

    if (!collection) {
      const apiError: ApiError = {
        error_code: ErrorCode.COLLECTION_NOT_FOUND,
        message: `Collection '${req.params.name}' not found`,
      };
      return res.status(404).json(apiError);
    }

    await collectionsRepo.delete(req.params.name);

    res.status(204).send();
  } catch (error: any) {
    const apiError: ApiError = {
      error_code: ErrorCode.DATABASE_ERROR,
      message: 'Failed to delete collection',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

export default router;
