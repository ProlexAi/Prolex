import { Router, Request, Response } from 'express';
import { CollectionsRepository } from '../repositories/collectionsRepo';
import { DocumentsRepository } from '../repositories/documentsRepo';
import { EmbeddingProvider } from '../embeddings';
import { SearchRequestSchema, ErrorCode, ApiError } from '../types';
import { ZodError } from 'zod';

const router = Router();
const collectionsRepo = new CollectionsRepository();
const documentsRepo = new DocumentsRepository();

// Le provider d'embeddings sera injecté via le contexte
let embeddingProvider: EmbeddingProvider;

export function setEmbeddingProvider(provider: EmbeddingProvider) {
  embeddingProvider = provider;
}

/**
 * POST /search
 * Recherche sémantique dans une collection
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validation du body
    const validated = SearchRequestSchema.parse(req.body);

    // Vérifie que la collection existe
    const collection = await collectionsRepo.findByName(validated.collection);
    if (!collection) {
      const apiError: ApiError = {
        error_code: ErrorCode.COLLECTION_NOT_FOUND,
        message: `Collection '${validated.collection}' not found`,
      };
      return res.status(404).json(apiError);
    }

    // Génère l'embedding de la requête
    let queryEmbedding: number[];
    try {
      queryEmbedding = await embeddingProvider.getEmbedding(validated.query);
    } catch (error: any) {
      const apiError: ApiError = {
        error_code: ErrorCode.EMBEDDING_ERROR,
        message: 'Failed to generate query embedding',
        details: { error: error.message },
      };
      return res.status(500).json(apiError);
    }

    // Recherche les documents similaires
    const results = await documentsRepo.searchSimilar(
      collection.id,
      queryEmbedding,
      validated.topK || 5,
      validated.filter
    );

    res.json({
      collection: validated.collection,
      query: validated.query,
      filter: validated.filter,
      results_count: results.length,
      results: results.map((r) => ({
        id: r.id,
        content: r.content,
        metadata: r.metadata,
        score: Math.round(r.score * 1000) / 1000, // Arrondit à 3 décimales
      })),
    });
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
      message: 'Search failed',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

export default router;
