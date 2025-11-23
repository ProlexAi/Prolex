/**
 * Client Google Tasks
 */

import { google, type tasks_v1 } from 'googleapis';
import { getAuthClient } from './authClient.js';
import type { GoogleTask, TaskListOptions } from '../types/index.js';

let tasksClient: tasks_v1.Tasks | null = null;

export function getTasksClient(): tasks_v1.Tasks {
  if (!tasksClient) {
    tasksClient = google.tasks({ version: 'v1' });
  }
  return tasksClient;
}

export async function listTasks(
  taskListId: string = '@default',
  options: TaskListOptions = {}
): Promise<GoogleTask[]> {
  const auth = await getAuthClient();
  const tasks = getTasksClient();

  const response = await tasks.tasks.list({
    auth,
    tasklist: taskListId,
    maxResults: options.maxResults || 100,
    showCompleted: options.showCompleted,
    showHidden: options.showHidden,
    dueMin: options.dueMin,
    dueMax: options.dueMax,
  });

  return response.data.items?.map((task) => ({
    id: task.id,
    title: task.title!,
    notes: task.notes,
    status: task.status as 'needsAction' | 'completed',
    due: task.due,
    completed: task.completed,
    parent: task.parent,
    position: task.position,
    links: task.links as any,
  })) || [];
}

export async function createTask(
  task: GoogleTask,
  taskListId: string = '@default'
): Promise<string> {
  const auth = await getAuthClient();
  const tasks = getTasksClient();

  const response = await tasks.tasks.insert({
    auth,
    tasklist: taskListId,
    requestBody: task as any,
  });

  return response.data.id!;
}

export async function updateTask(
  taskId: string,
  task: Partial<GoogleTask>,
  taskListId: string = '@default'
): Promise<void> {
  const auth = await getAuthClient();
  const tasks = getTasksClient();

  await tasks.tasks.patch({
    auth,
    tasklist: taskListId,
    task: taskId,
    requestBody: task as any,
  });
}

export async function deleteTask(
  taskId: string,
  taskListId: string = '@default'
): Promise<void> {
  const auth = await getAuthClient();
  const tasks = getTasksClient();

  await tasks.tasks.delete({
    auth,
    tasklist: taskListId,
    task: taskId,
  });
}

export async function completeTask(
  taskId: string,
  taskListId: string = '@default'
): Promise<void> {
  await updateTask(taskId, {
    status: 'completed',
    completed: new Date().toISOString(),
  }, taskListId);
}

export async function listTaskLists(): Promise<Array<{ id: string; title: string }>> {
  const auth = await getAuthClient();
  const tasks = getTasksClient();

  const response = await tasks.tasklists.list({
    auth,
    maxResults: 100,
  });

  return response.data.items?.map((list) => ({
    id: list.id!,
    title: list.title!,
  })) || [];
}
