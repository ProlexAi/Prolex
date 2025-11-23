import { Router, Request, Response } from 'express';
import { CollectionsRepository } from '../repositories/collectionsRepo';
import { DocumentsRepository } from '../repositories/documentsRepo';
import { EmbeddingProvider } from '../embeddings';
import {
  CreateDocumentsSchema,
  ErrorCode,
  ApiError,
} from '../types';
import { cleanText, inferInitialMetadata, mergeMetadata } from '../preprocessors';
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
 * POST /documents
 * Ajoute des documents à une collection
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validation du body
    const validated = CreateDocumentsSchema.parse(req.body);

    // Vérifie que la collection existe
    const collection = await collectionsRepo.findByName(validated.collection);
    if (!collection) {
      const apiError: ApiError = {
        error_code: ErrorCode.COLLECTION_NOT_FOUND,
        message: `Collection '${validated.collection}' not found`,
      };
      return res.status(404).json(apiError);
    }

    // Traite chaque document
    const results = [];

    for (const docInput of validated.documents) {
      // 1. Nettoie le texte
      const cleanedContent = cleanText(docInput.content);

      // 2. Infère les métadonnées automatiquement
      const inferredMeta = inferInitialMetadata({
        rawContent: cleanedContent,
        source: docInput.metadata?.source as string | undefined,
      });

      // 3. Fusionne avec les métadonnées fournies
      const finalMetadata = mergeMetadata(inferredMeta, docInput.metadata || {});

      // 4. Génère l'embedding
      let embedding: number[];
      try {
        embedding = await embeddingProvider.getEmbedding(cleanedContent);
      } catch (error: any) {
        const apiError: ApiError = {
          error_code: ErrorCode.EMBEDDING_ERROR,
          message: 'Failed to generate embedding',
          details: { error: error.message },
        };
        return res.status(500).json(apiError);
      }

      // 5. Insère en base
      const document = await documentsRepo.create(
        collection.id,
        cleanedContent,
        finalMetadata,
        embedding
      );

      results.push({
        id: document.id,
        content_preview: cleanedContent.substring(0, 100) + '...',
        metadata: finalMetadata,
      });
    }

    res.status(201).json({
      collection: validated.collection,
      documents_created: results.length,
      documents: results,
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
      message: 'Failed to create documents',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

/**
 * DELETE /documents/:id
 * Supprime un document par son ID
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const document = await documentsRepo.findById(req.params.id);

    if (!document) {
      const apiError: ApiError = {
        error_code: ErrorCode.DOCUMENT_NOT_FOUND,
        message: `Document '${req.params.id}' not found`,
      };
      return res.status(404).json(apiError);
    }

    await documentsRepo.delete(req.params.id);

    res.status(204).send();
  } catch (error: any) {
    const apiError: ApiError = {
      error_code: ErrorCode.DATABASE_ERROR,
      message: 'Failed to delete document',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

/**
 * GET /documents/:id
 * Récupère un document par son ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const document = await documentsRepo.findById(req.params.id);

    if (!document) {
      const apiError: ApiError = {
        error_code: ErrorCode.DOCUMENT_NOT_FOUND,
        message: `Document '${req.params.id}' not found`,
      };
      return res.status(404).json(apiError);
    }

    res.json(document);
  } catch (error: any) {
    const apiError: ApiError = {
      error_code: ErrorCode.DATABASE_ERROR,
      message: 'Failed to fetch document',
      details: { error: error.message },
    };
    res.status(500).json(apiError);
  }
});

export default router;
