/**
 * Write File Tool (Safe)
 * Writes files with safety checks, confirmations, and rollback
 */

import { z } from 'zod';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import type { MCPToolResponse } from '../types/index.js';
import { actionValidator } from '../security/actionValidator.js';
import { confirmationManager } from '../security/confirmationManager.js';
import { rollbackManager } from '../security/rollbackManager.js';
import { confidenceScoring } from '../security/confidenceScoring.js';
import { journal } from '../logging/systemJournal.js';

export const WriteFileSchema = z.object({
  path: z.string().describe('Path to the file to write (relative or absolute)'),
  content: z.string().describe('Content to write to the file'),
  encoding: z
    .enum(['utf-8', 'base64', 'hex'])
    .optional()
    .default('utf-8')
    .describe('File encoding'),
  createDirs: z
    .boolean()
    .optional()
    .default(false)
    .describe('Create parent directories if they do not exist'),
  backup: z
    .boolean()
    .optional()
    .default(true)
    .describe('Create a rollback point before writing'),
});

export async function writeFile(
  args: z.infer<typeof WriteFileSchema>
): Promise<MCPToolResponse> {
  const correlationId = journal.generateCorrelationId();

  journal.info('write_file_request', {
    path: args.path,
    contentLength: args.content.length,
    encoding: args.encoding,
    correlationId,
  });

  try {
    // Step 1: Validate action
    const validation = await actionValidator.validate({
      action: 'write_file',
      autonomyLevel: 0, // Will be filled by validator
      targetResource: args.path,
      metadata: {
        contentLength: args.content.length,
        encoding: args.encoding,
      },
    });

    if (!validation.allowed) {
      journal.error('write_file_not_allowed', new Error(validation.reason), {
        path: args.path,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text: `❌ Write file not allowed: ${validation.reason}`,
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
    if (!filePath.startsWith(projectRoot) && !filePath.startsWith('/tmp')) {
      journal.error(
        'write_file_path_traversal_attempt',
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
              `Only files within the project directory or /tmp are allowed.`,
          },
        ],
        isError: true,
      };
    }

    // Step 3: Check if path is forbidden
    if (!actionValidator.isResourceSafe(filePath)) {
      journal.error('write_file_forbidden_path', new Error('Forbidden path'), {
        path: filePath,
        correlationId,
      });

      return {
        content: [
          {
            type: 'text',
            text:
              `🚫 FORBIDDEN PATH\n\n` +
              `Cannot write to: ${filePath}\n\n` +
              `This path is protected and cannot be modified.\n` +
              `Forbidden paths include:\n` +
              `- docker-compose.yml\n` +
              `- .env files\n` +
              `- System directories (/etc, /var, /usr)`,
          },
        ],
        isError: true,
      };
    }

    // Step 4: Request confirmation if needed
    const confidence = confidenceScoring.calculateScore('write_file', {
      targetResource: filePath,
      metadata: {
        contentLength: args.content.length,
        fileExists: existsSync(filePath),
      },
    });

    if (validation.requiresConfirmation) {
      await confirmationManager.requestConfirmation({
        action: 'write_file',
        description:
          `Write ${args.content.length} bytes to file: ${filePath}\n` +
          `File exists: ${existsSync(filePath) ? 'Yes (will overwrite)' : 'No (will create)'}`,
        riskLevel: validation.riskLevel,
        confidenceScore: confidence,
        metadata: {
          path: filePath,
          contentLength: args.content.length,
          encoding: args.encoding,
        },
      });
    }

    // Step 5: Create rollback point (if file exists and backup enabled)
    let rollbackPointId: string | undefined;

    if (args.backup && existsSync(filePath)) {
      const originalContent = readFileSync(filePath, args.encoding as BufferEncoding);

      rollbackPointId = rollbackManager.createRollbackPoint(
        'write_file',
        filePath,
        originalContent,
        {
          encoding: args.encoding,
          timestamp: new Date().toISOString(),
        }
      );

      journal.info('write_file_rollback_created', {
        path: filePath,
        rollbackPointId,
        correlationId,
      });
    }

    // Step 6: Create parent directories if needed
    if (args.createDirs) {
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        journal.info('write_file_dirs_created', {
          dir,
          correlationId,
        });
      }
    }

    // Step 7: Write file
    writeFileSync(filePath, args.content, args.encoding as BufferEncoding);

    journal.info('write_file_success', {
      path: filePath,
      size: args.content.length,
      encoding: args.encoding,
      rollbackPointId,
      correlationId,
    });

    // Record success
    confidenceScoring.recordActionResult('write_file', true);

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ File written successfully\n\n` +
            `Path: ${filePath}\n` +
            `Size: ${args.content.length} bytes\n` +
            `Encoding: ${args.encoding}\n` +
            (rollbackPointId ? `Rollback ID: ${rollbackPointId}\n` : '') +
            `\n` +
            `The file has been written successfully.` +
            (rollbackPointId
              ? ` A rollback point was created in case you need to revert.`
              : ''),
        },
      ],
    };
  } catch (error) {
    journal.error('write_file_error', error as Error, {
      path: args.path,
      correlationId,
    });

    // Record failure
    confidenceScoring.recordActionResult('write_file', false);

    return {
      content: [
        {
          type: 'text',
          text: `❌ Write file error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}
