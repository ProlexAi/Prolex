import { EmbeddingProvider } from './EmbeddingProvider';
import { MockEmbeddingProvider } from './MockEmbeddingProvider';
import { ClaudeEmbeddingProvider } from './ClaudeEmbeddingProvider';
import { EmbeddingConfig } from '../types';

/**
 * Factory pour créer le bon provider d'embeddings selon la config
 */
export function createEmbeddingProvider(config: EmbeddingConfig): EmbeddingProvider {
  switch (config.model) {
    case 'mock':
      return new MockEmbeddingProvider();

    case 'claude':
      if (!config.apiKey) {
        throw new Error('API key required for Claude embedding provider');
      }
      return new ClaudeEmbeddingProvider(config.apiKey);

    case 'openai':
      // TODO: Implémenter OpenAIEmbeddingProvider si besoin
      throw new Error('OpenAI embedding provider not yet implemented');

    default:
      throw new Error(`Unknown embedding model: ${config.model}`);
  }
}

export { EmbeddingProvider, MockEmbeddingProvider, ClaudeEmbeddingProvider };
