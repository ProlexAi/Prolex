/**
 * Storage module for saving snapshots to disk
 */

import fs from 'fs/promises';
import path from 'path';
import { Snapshot } from './types';
import { extractDomain, sanitizeFilename } from './utils';

/**
 * Get snapshots directory from environment or use default
 */
function getSnapshotsDir(): string {
  return process.env.SNAPSHOTS_DIR || path.join(process.cwd(), 'snapshots');
}

/**
 * Generate safe filename from URL and timestamp
 * @param url - URL to create filename from
 * @returns Safe filename without extension
 */
export function safeFilename(url: string): string {
  const timestamp = Date.now();
  const urlPart = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 100);

  return `${timestamp}_${urlPart}`;
}

/**
 * Ensure directory exists, create if not
 * @param dirPath - Directory path to ensure
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Save snapshot to disk
 * @param snapshot - Snapshot data to save
 * @param domain - Domain name (optional, will be extracted from URL if not provided)
 * @returns Path to saved file
 */
export async function saveSnapshot(
  snapshot: Snapshot,
  domain?: string
): Promise<string> {
  try {
    const snapshotsDir = getSnapshotsDir();
    const targetDomain = domain || extractDomain(snapshot.url);

    // Create domain-specific directory
    const domainDir = path.join(snapshotsDir, sanitizeFilename(targetDomain));
    await ensureDir(domainDir);

    // Generate filename
    const filename = `${safeFilename(snapshot.url)}.json`;
    const filePath = path.join(domainDir, filename);

    // Save snapshot
    await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log(`✓ Snapshot saved: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Failed to save snapshot:', error);
    throw new Error(`Storage error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save multiple snapshots
 * @param snapshots - Array of snapshots to save
 * @param domain - Domain name (optional)
 * @returns Array of saved file paths
 */
export async function saveSnapshots(
  snapshots: Snapshot[],
  domain?: string
): Promise<string[]> {
  const paths: string[] = [];

  for (const snapshot of snapshots) {
    try {
      const filePath = await saveSnapshot(snapshot, domain);
      paths.push(filePath);
    } catch (error) {
      console.error(`Failed to save snapshot for ${snapshot.url}:`, error);
    }
  }

  return paths;
}

/**
 * Load snapshot from disk
 * @param filePath - Path to snapshot file
 * @returns Snapshot data
 */
export async function loadSnapshot(filePath: string): Promise<Snapshot> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Snapshot;
  } catch (error) {
    console.error(`Failed to load snapshot from ${filePath}:`, error);
    throw new Error(`Load error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all snapshots for a domain
 * @param domain - Domain name
 * @returns Array of snapshot file paths
 */
export async function listSnapshots(domain: string): Promise<string[]> {
  try {
    const snapshotsDir = getSnapshotsDir();
    const domainDir = path.join(snapshotsDir, sanitizeFilename(domain));

    await ensureDir(domainDir);

    const files = await fs.readdir(domainDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(domainDir, file));
  } catch (error) {
    console.error(`Failed to list snapshots for ${domain}:`, error);
    return [];
  }
}

/**
 * Delete snapshot file
 * @param filePath - Path to snapshot file
 */
export async function deleteSnapshot(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log(`✓ Snapshot deleted: ${filePath}`);
  } catch (error) {
    console.error(`Failed to delete snapshot ${filePath}:`, error);
    throw new Error(`Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get total size of snapshots directory
 * @param domain - Optional domain to check specific directory
 * @returns Size in bytes
 */
export async function getStorageSize(domain?: string): Promise<number> {
  try {
    const snapshotsDir = getSnapshotsDir();
    const targetDir = domain
      ? path.join(snapshotsDir, sanitizeFilename(domain))
      : snapshotsDir;

    await ensureDir(targetDir);

    const files = await fs.readdir(targetDir, { recursive: true });
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(targetDir, file.toString());
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      } catch {
        // Skip files that can't be accessed
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to calculate storage size:', error);
    return 0;
  }
}

/**
 * Clean old snapshots older than specified days
 * @param days - Number of days to keep
 * @param domain - Optional domain to clean specific directory
 * @returns Number of deleted files
 */
export async function cleanOldSnapshots(days: number, domain?: string): Promise<number> {
  try {
    const snapshotsDir = getSnapshotsDir();
    const targetDir = domain
      ? path.join(snapshotsDir, sanitizeFilename(domain))
      : snapshotsDir;

    await ensureDir(targetDir);

    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const files = await fs.readdir(targetDir, { recursive: true });
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(targetDir, file.toString());
      try {
        const stats = await fs.stat(filePath);
        if (stats.isFile() && stats.mtimeMs < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      } catch {
        // Skip files that can't be accessed
      }
    }

    console.log(`✓ Cleaned ${deletedCount} old snapshots (older than ${days} days)`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to clean old snapshots:', error);
    return 0;
  }
}
