import { EmbeddingProvider } from './EmbeddingProvider';

/**
 * Provider d'embeddings via Anthropic Claude
 *
 * TODO: Implémenter l'intégration avec l'API Anthropic
 *
 * Notes d'implémentation:
 * - Anthropic ne propose pas encore d'API d'embeddings native
 * - Options possibles:
 *   1. Utiliser Voyage AI (recommandé par Anthropic)
 *   2. Utiliser OpenAI text-embedding-3-small/large
 *   3. Utiliser un modèle open-source (e.g., sentence-transformers)
 *   4. Attendre une API officielle Anthropic
 *
 * Pour Voyage AI:
 * - API: https://docs.voyageai.com/
 * - Modèle recommandé: voyage-2 ou voyage-large-2
 * - Dimension: 1024 (voyage-2) ou 1536 (voyage-large-2)
 *
 * Pour OpenAI:
 * - API: https://platform.openai.com/docs/guides/embeddings
 * - Modèle: text-embedding-3-small (1536 dim) ou text-embedding-3-large (3072 dim)
 */
export class ClaudeEmbeddingProvider implements EmbeddingProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _apiKey: string;
  private dimension: number = 1536;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required for ClaudeEmbeddingProvider');
    }
    this._apiKey = apiKey;
  }

  async getEmbedding(_text: string): Promise<number[]> {
    // TODO: Implémenter l'appel à l'API d'embeddings
    // Exemple avec Voyage AI:
    // const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this._apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     input: text,
    //     model: 'voyage-large-2',
    //   }),
    // });
    // const data = await response.json();
    // return data.data[0].embedding;

    throw new Error('ClaudeEmbeddingProvider not yet implemented. Use MockEmbeddingProvider for now.');
  }

  async getEmbeddings(_texts: string[]): Promise<number[][]> {
    // TODO: Implémenter l'appel batch à l'API d'embeddings
    // La plupart des APIs supportent le batch processing
    throw new Error('ClaudeEmbeddingProvider not yet implemented. Use MockEmbeddingProvider for now.');
  }

  getDimension(): number {
    return this.dimension;
  }

  getModelName(): string {
    return 'claude-embeddings-v1'; // TODO: mettre à jour avec le vrai nom du modèle
  }
}
