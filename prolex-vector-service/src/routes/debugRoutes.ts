import { Router, Request, Response } from 'express';
import { CollectionsRepository } from '../repositories/collectionsRepo';
import { DocumentsRepository } from '../repositories/documentsRepo';
import { ErrorCode, ApiError } from '../types';

const router = Router();
const collectionsRepo = new CollectionsRepository();
const documentsRepo = new DocumentsRepository();

/**
 * GET /debug/:collection
 * Retourne des statistiques de diagnostic pour une collection
 */
router.get('/:collection', async (req: Request, res: Response) => {
  try {
    const collectionName = req.params.collection;

    // Vérifie que la collection existe
    const collection = await collectionsRepo.findByName(collectionName);
    if (!collection) {
      const apiError: ApiError = {
        error_code: ErrorCode.COLLECTION_NOT_FOUND,
        message: `Collection '${collectionName}' not found`,
      };
      return res.status(404).json(apiError);
    }

    // Récupère les statistiques
    const stats = await documentsRepo.getCollectionStats(collectionName);

    if (!stats) {
      const apiError: ApiError = {
        error_code: ErrorCode.DATABASE_ERROR,
        message: 'Failed to retrieve collection stats',
      };
      return res.status(500).json(apiError);
    }

    res.json(stats);
  } catch (error: any) {
    const apiError: ApiError = {
      error_code: ErrorCode.DATABASE_ERROR,
      message: 'Failed to retrieve debug stats',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

/**
 * GET /debug/:collection/documents
 * Retourne les documents d'une collection (pour debug)
 */
router.get('/:collection/documents', async (req: Request, res: Response) => {
  try {
    const collectionName = req.params.collection;
    const limit = parseInt(req.query.limit as string) || 10;

    // Vérifie que la collection existe
    const collection = await collectionsRepo.findByName(collectionName);
    if (!collection) {
      const apiError: ApiError = {
        error_code: ErrorCode.COLLECTION_NOT_FOUND,
        message: `Collection '${collectionName}' not found`,
      };
      return res.status(404).json(apiError);
    }

    // Récupère les documents (sans les embeddings pour économiser la bande passante)
    const documents = await documentsRepo.findByCollection(collection.id, limit);

    res.json({
      collection: collectionName,
      total: documents.length,
      documents: documents.map((doc) => ({
        id: doc.id,
        content_preview: doc.content.substring(0, 200) + '...',
        metadata: doc.metadata,
        created_at: doc.created_at,
      })),
    });
  } catch (error: any) {
    const apiError: ApiError = {
      error_code: ErrorCode.DATABASE_ERROR,
      message: 'Failed to retrieve documents',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

export default router;
