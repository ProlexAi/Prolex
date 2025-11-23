/**
 * Read File Tool (Safe)
 * Reads files with safety checks
 */

import { z } from 'zod';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import type { MCPToolResponse } from '../types/index.js';
import { actionValidator } from '../security/actionValidator.js';
import { journal } from '../logging/systemJournal.js';

export const ReadFileSchema = z.object({
  path: z.string().describe('Path to the file to read (relative or absolute)'),
  encoding: z
    .enum(['utf-8', 'base64', 'hex'])
    .optional()
    .default('utf-8')
    .describe('File encoding'),
  maxSize: z
    .number()
    .optional()
    .default(1024 * 1024)
    .describe('Maximum file size in bytes (default: 1MB)'),
});

export async function readFile(
  args: z.infer<typeof ReadFileSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  journal.info('read_file_request', {
    path: args.path,
    encoding: args.encoding,
    correlationId,
  });

  try {
    // Step 1: Validate action
    const validation = await actionValidator.validate({
      action: 'read_file',
      autonomyLevel: 0, // Will be filled by validator
      targetResource: args.path,
    });

    if (!validation.allowed) {
      journal.error('read_file_not_allowed', new Error(validation.reason), {
        path: args.path,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text: `❌ Read file not allowed: ${validation.reason}`,
          },
        ],
        isError: true,
      };
    }

    // Step 2: Resolve path (prevent directory traversal)
    const basePath = process.cwd();
    let filePath = args.path;

    // If path is relative, resolve it from the project root (2 levels up from mcp/n8n-server)
    if (!args.path.startsWith('/')) {
      const projectRoot = resolve(basePath, '..', '..');
      filePath = resolve(projectRoot, args.path);
    } else {
      filePath = resolve(args.path);
    }

    // Safety check: Ensure the resolved path is within allowed directories
    const projectRoot = resolve(basePath, '..', '..');
    if (!filePath.startsWith(projectRoot) && !filePath.startsWith('/home')) {
      journal.error(
        'read_file_path_traversal_attempt',
        new Error('Path traversal detected'),
        {
          requestedPath: args.path,
          resolvedPath: filePath,
          projectRoot,
          correlationId,
        }
      );

      return {
        content: [
          {
            type: 'text',
            text:
              `🚫 Path traversal detected\n\n` +
              `Requested: ${args.path}\n` +
              `Resolved: ${filePath}\n` +
              `Allowed root: ${projectRoot}\n\n` +
              `Only files within the project directory are allowed.`,
          },
        ],
        isError: true,
      };
    }

    // Step 3: Check if file exists
    if (!existsSync(filePath)) {
      journal.warn('read_file_not_found', {
        path: filePath,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text: `❌ File not found: ${filePath}`,
          },
        ],
        isError: true,
      };
    }

    // Step 4: Check file size
    const stats = statSync(filePath);

    if (stats.size > args.maxSize!) {
      journal.warn('read_file_too_large', {
        path: filePath,
        size: stats.size,
        maxSize: args.maxSize,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text:
              `❌ File too large: ${stats.size} bytes (max: ${args.maxSize} bytes)\n\n` +
              `Path: ${filePath}\n\n` +
              `Consider reading a smaller file or increasing maxSize parameter.`,
          },
        ],
        isError: true,
      };
    }

    // Step 5: Read file
    const content = readFileSync(filePath, args.encoding as BufferEncoding);

    journal.info('read_file_success', {
      path: filePath,
      size: stats.size,
      encoding: args.encoding,
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text:
            `📄 File: ${filePath}\n` +
            `Size: ${stats.size} bytes\n` +
            `Encoding: ${args.encoding}\n` +
            `${'='.repeat(50)}\n\n` +
            `${content}\n\n` +
            `${'='.repeat(50)}`,
        },
      ],
    };
  } catch (error) {
    journal.error('read_file_error', error as Error, {
      path: args.path,
      correlationId,
    });

    return {
      content: [
        {
          type: 'text',
          text: `❌ Read file error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
