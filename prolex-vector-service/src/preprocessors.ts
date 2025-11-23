import { InferredMetadata, PreprocessInput } from './types';

/**
 * Nettoie le texte brut pour la vectorisation
 * - Supprime le HTML basique
 * - Normalise les sauts de ligne
 * - Supprime les espaces multiples
 * - Trim le texte
 */
export function cleanText(raw: string): string {
  let cleaned = raw;

  // Supprime les balises HTML basiques
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // Décode les entités HTML courantes
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'");

  // Normalise les sauts de ligne (CRLF -> LF, multiples -> double)
  cleaned = cleaned.replace(/\r\n/g, '\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Supprime les espaces multiples
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  // Supprime les espaces en début/fin de lignes
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  // Trim général
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Infère automatiquement des métadonnées à partir du contenu
 * Suggère domain, type, et tags en fonction des mots-clés détectés
 */
export function inferInitialMetadata(input: PreprocessInput): InferredMetadata {
  const { rawContent, source } = input;
  const content = rawContent.toLowerCase();
  const metadata: InferredMetadata = {};

  // Détection du domaine
  if (
    content.includes('n8n') ||
    content.includes('workflow') ||
    content.includes('node')
  ) {
    metadata.domain = 'n8n';
  } else if (
    content.includes('typescript') ||
    content.includes('javascript') ||
    content.includes('code') ||
    content.includes('api')
  ) {
    metadata.domain = 'tech';
  } else if (
    content.includes('procédure') ||
    content.includes('process') ||
    content.includes('documentation')
  ) {
    metadata.domain = 'docs';
  } else if (
    content.includes('client') ||
    content.includes('audit') ||
    content.includes('mission') ||
    content.includes('cahier des charges')
  ) {
    metadata.domain = 'business';
  }

  // Détection du type
  if (metadata.domain === 'n8n') {
    if (content.includes('error') || content.includes('erreur')) {
      metadata.type = 'error_guide';
    } else if (content.includes('pattern') || content.includes('best practice')) {
      metadata.type = 'workflow_pattern';
    } else if (content.includes('node')) {
      metadata.type = 'node_doc';
    }
  } else if (metadata.domain === 'docs') {
    if (content.includes('procédure') || content.includes('process')) {
      metadata.type = 'procedure';
    } else if (content.includes('template')) {
      metadata.type = 'template';
    }
  } else if (metadata.domain === 'business') {
    if (content.includes('audit')) {
      metadata.type = 'client_audit';
    } else if (content.includes('cahier des charges')) {
      metadata.type = 'client_spec';
    } else {
      metadata.type = 'client_file';
    }
  } else if (metadata.domain === 'tech') {
    if (content.includes('error') || content.includes('erreur')) {
      metadata.type = 'error_guide';
    }
  }

  // Détection des tags
  const tags: string[] = [];

  // Tags techniques
  if (content.includes('timeout')) tags.push('timeout');
  if (content.includes('retry') || content.includes('retries')) tags.push('retry');
  if (content.includes('http') || content.includes('https')) tags.push('http');
  if (content.includes('webhook')) tags.push('webhook');
  if (content.includes('api')) tags.push('api');
  if (content.includes('database') || content.includes('db')) tags.push('database');
  if (content.includes('authentication') || content.includes('auth'))
    tags.push('auth');

  // Tags n8n
  if (content.includes('n8n')) {
    if (content.includes('credential')) tags.push('credentials');
    if (content.includes('expression')) tags.push('expressions');
    if (content.includes('trigger')) tags.push('trigger');
    if (content.includes('schedule')) tags.push('schedule');
  }

  // Tags erreurs
  if (content.includes('error') || content.includes('erreur')) {
    tags.push('error');
    if (content.includes('connection')) tags.push('connection_error');
    if (content.includes('permission')) tags.push('permission_error');
    if (content.includes('validation')) tags.push('validation_error');
  }

  // Tags business
  if (content.includes('client')) tags.push('client');
  if (content.includes('urgent')) tags.push('urgent');
  if (content.includes('important')) tags.push('important');

  // Ajoute le source comme tag si fourni
  if (source) {
    tags.push(`source:${source}`);
  }

  if (tags.length > 0) {
    metadata.tags = [...new Set(tags)]; // Déduplique
  }

  return metadata;
}

/**
 * Fusionne les métadonnées inférées avec les métadonnées fournies
 * Les métadonnées fournies ont la priorité
 */
export function mergeMetadata(
  inferred: InferredMetadata,
  provided: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...provided };

  // Ajoute domain si non fourni
  if (!merged.domain && inferred.domain) {
    merged.domain = inferred.domain;
  }

  // Ajoute type si non fourni
  if (!merged.type && inferred.type) {
    merged.type = inferred.type;
  }

  // Fusionne les tags (union)
  const providedTags = Array.isArray(merged.tags) ? merged.tags : [];
  const inferredTags = inferred.tags || [];
  const allTags = [...new Set([...providedTags, ...inferredTags])];

  if (allTags.length > 0) {
    merged.tags = allTags;
  }

  return merged;
}
