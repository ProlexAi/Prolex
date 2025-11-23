/**
 * MCP Tools: Google Tasks
 */

import { z } from 'zod';
import * as tasksClient from '../../clients/tasksClient.js';
import type { MCPToolResponse } from '../../types/index.js';

export const TasksListSchema = z.object({
  taskListId: z.string().optional().default('@default').describe('ID de la liste de tâches'),
  showCompleted: z.boolean().optional().default(false).describe('Afficher les tâches complétées?'),
  maxResults: z.number().optional().default(100).describe('Nombre max de résultats'),
});

export const TasksCreateSchema = z.object({
  title: z.string().describe('Titre de la tâche'),
  notes: z.string().optional().describe('Notes/description'),
  due: z.string().optional().describe('Date d\'échéance (RFC 3339)'),
  taskListId: z.string().optional().default('@default'),
});

export const TasksCompleteSchema = z.object({
  taskId: z.string().describe('ID de la tâche'),
  taskListId: z.string().optional().default('@default'),
});

export async function tasksList(args: z.infer<typeof TasksListSchema>): Promise<MCPToolResponse> {
  try {
    const tasks = await tasksClient.listTasks(args.taskListId, args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            taskCount: tasks.length,
            tasks: tasks.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              due: t.due,
              notes: t.notes,
            })),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Tasks list: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function tasksCreate(args: z.infer<typeof TasksCreateSchema>): Promise<MCPToolResponse> {
  try {
    const taskId = await tasksClient.createTask(args, args.taskListId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Tâche "${args.title}" créée`,
            taskId,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Tasks create: ${(error as Error).message}` }],
      isError: true,
    };
  }
}

export async function tasksComplete(args: z.infer<typeof TasksCompleteSchema>): Promise<MCPToolResponse> {
  try {
    await tasksClient.completeTask(args.taskId, args.taskListId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ Tâche ${args.taskId} complétée`,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Erreur Tasks complete: ${(error as Error).message}` }],
      isError: true,
    };
  }
}
