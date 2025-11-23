/**
 * Client Google Drive
 */

import { google, type drive_v3 } from 'googleapis';
import { getAuthClient } from './authClient.js';
import type { DriveFile, DriveUploadOptions, DriveSearchOptions } from '../types/index.js';

let driveClient: drive_v3.Drive | null = null;

export function getDriveClient(): drive_v3.Drive {
  if (!driveClient) {
    driveClient = google.drive({ version: 'v3' });
  }
  return driveClient;
}

export async function listFiles(options: DriveSearchOptions = {}): Promise<DriveFile[]> {
  const auth = await getAuthClient();
  const drive = getDriveClient();

  let query = options.query || '';
  if (options.mimeType) {
    query += ` mimeType='${options.mimeType}'`;
  }
  if (options.folderId) {
    query += ` '${options.folderId}' in parents`;
  }

  const response = await drive.files.list({
    auth,
    q: query || undefined,
    pageSize: options.maxResults || 100,
    orderBy: options.orderBy,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents)',
  });

  return response.data.files?.map((file) => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    size: file.size ? parseInt(file.size) : undefined,
    createdTime: file.createdTime || undefined,
    modifiedTime: file.modifiedTime || undefined,
    webViewLink: file.webViewLink || undefined,
    parents: file.parents,
  })) || [];
}

export async function uploadFile(
  filename: string,
  content: Buffer | string,
  options: DriveUploadOptions = {}
): Promise<DriveFile> {
  const auth = await getAuthClient();
  const drive = getDriveClient();

  const requestBody: drive_v3.Schema$File = {
    name: filename,
    mimeType: options.mimeType,
    description: options.description,
    parents: options.folderId ? [options.folderId] : undefined,
  };

  const media = {
    mimeType: options.mimeType || 'application/octet-stream',
    body: content,
  };

  const response = await drive.files.create({
    auth,
    requestBody,
    media,
    fields: 'id, name, mimeType, size, webViewLink',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    size: response.data.size ? parseInt(response.data.size) : undefined,
    webViewLink: response.data.webViewLink || undefined,
  };
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const auth = await getAuthClient();
  const drive = getDriveClient();

  const response = await drive.files.get(
    {
      auth,
      fileId,
      alt: 'media',
    },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

export async function deleteFile(fileId: string): Promise<void> {
  const auth = await getAuthClient();
  const drive = getDriveClient();

  await drive.files.delete({
    auth,
    fileId,
  });
}

export async function createFolder(name: string, parentFolderId?: string): Promise<string> {
  const auth = await getAuthClient();
  const drive = getDriveClient();

  const response = await drive.files.create({
    auth,
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined,
    },
    fields: 'id',
  });

  return response.data.id!;
}
