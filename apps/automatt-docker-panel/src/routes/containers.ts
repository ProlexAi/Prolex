/**
 * containers.ts
 *
 * Définit toutes les routes liées à la gestion des conteneurs Docker.
 *
 * ROUTES DISPONIBLES :
 * - GET  /containers          : Liste tous les conteneurs
 * - GET  /containers/:id      : Détails d'un conteneur
 * - GET  /containers/:id/logs : Logs d'un conteneur
 * - POST /containers/:id/start   : Démarrer un conteneur
 * - POST /containers/:id/stop    : Arrêter un conteneur
 * - POST /containers/:id/restart : Redémarrer un conteneur
 * - POST /containers/:id/exec    : Exécuter une commande (BONUS)
 *
 * STRUCTURE :
 * - Chaque route utilise async/await pour gérer les opérations Docker
 * - Les erreurs sont catchées et retournées proprement au client
 * - Tous les appels Docker passent par le client dockerode
 */

import { Router, Request, Response } from 'express';
import docker from '../dockerClient';
import type { ContainerInfo, ContainerDetails, ExecResult } from '../dockerClient';

/**
 * Création du router Express
 * Ce router sera monté sur /api dans le serveur principal
 */
const router = Router();

/**
 * Variable d'environnement pour désactiver la fonctionnalité exec
 *
 * SÉCURITÉ : Si DISABLE_EXEC=1, les commandes exec sont bloquées
 */
const EXEC_DISABLED = process.env.DISABLE_EXEC === '1';

if (EXEC_DISABLED) {
  console.log('🔒 Container exec functionality is DISABLED');
} else {
  console.log('⚠️  Container exec functionality is ENABLED - use with caution!');
}

// ============================================
// ROUTE 1 : LISTE DES CONTENEURS
// ============================================

/**
 * GET /api/containers
 *
 * Retourne la liste de tous les conteneurs Docker (running + stopped)
 *
 * Réponse : Array de ContainerInfo
 */
router.get('/containers', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching all containers...');

    // Appel Docker : listContainers avec option all:true pour voir TOUS les conteneurs
    const containers = await docker.listContainers({ all: true });

    // Formatage des données pour une réponse plus claire
    const formatted: ContainerInfo[] = containers.map((container: any) => ({
      id: container.Id,
      name: container.Names[0].replace(/^\//, ''), // Enlever le / au début du nom
      image: container.Image,
      state: container.State,
      status: container.Status,
      ports: container.Ports,
      created: container.Created
    }));

    console.log(`✅ Found ${formatted.length} containers`);

    res.json(formatted);

  } catch (error) {
    console.error('❌ Error fetching containers:', error);
    res.status(500).json({
      error: 'Failed to fetch containers',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// ROUTE 2 : DÉTAILS D'UN CONTENEUR
// ============================================

/**
 * GET /api/containers/:id
 *
 * Retourne les détails complets d'un conteneur spécifique
 *
 * Paramètre : id (ID ou nom du conteneur)
 * Réponse : ContainerDetails
 */
router.get('/containers/:id', async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;
    console.log(`🔍 Fetching details for container: ${containerId}`);

    // Récupérer le conteneur via son ID
    const container = docker.getContainer(containerId);

    // Inspecter le conteneur pour obtenir toutes les infos
    const info = await container.inspect();

    // Formatage des données
    const details: ContainerDetails = {
      id: info.Id,
      name: info.Name.replace(/^\//, ''),
      image: info.Config.Image,
      state: info.State,
      created: info.Created,
      config: info.Config,
      hostConfig: info.HostConfig,
      networkSettings: info.NetworkSettings,
      mounts: info.Mounts
    };

    console.log(`✅ Container details retrieved: ${details.name}`);

    res.json(details);

  } catch (error) {
    console.error('❌ Error fetching container details:', error);
    res.status(500).json({
      error: 'Failed to fetch container details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// ROUTE 3 : LOGS D'UN CONTENEUR
// ============================================

/**
 * GET /api/containers/:id/logs
 *
 * Retourne les logs d'un conteneur
 *
 * Paramètre : id (ID ou nom du conteneur)
 * Query param : tail (nombre de lignes, défaut: 100)
 * Réponse : { logs: string }
 */
router.get('/containers/:id/logs', async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;
    const tail = parseInt(req.query.tail as string) || 100;

    console.log(`📜 Fetching logs for container: ${containerId} (tail: ${tail})`);

    // Récupérer le conteneur
    const container = docker.getContainer(containerId);

    // Récupérer les logs
    const logs = await container.logs({
      stdout: true,  // Logs stdout
      stderr: true,  // Logs stderr
      tail: tail,    // Nombre de lignes
      timestamps: true  // Avec timestamps
    });

    // Convertir le buffer en string
    const logsString = logs.toString('utf8');

    console.log(`✅ Logs retrieved (${logsString.split('\n').length} lines)`);

    res.json({ logs: logsString });

  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({
      error: 'Failed to fetch container logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// ROUTE 4 : DÉMARRER UN CONTENEUR
// ============================================

/**
 * POST /api/containers/:id/start
 *
 * Démarre un conteneur arrêté
 *
 * Paramètre : id (ID ou nom du conteneur)
 * Réponse : { success: true, message: string }
 */
router.post('/containers/:id/start', async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;
    console.log(`▶️  Starting container: ${containerId}`);

    const container = docker.getContainer(containerId);
    await container.start();

    console.log(`✅ Container started successfully`);

    res.json({
      success: true,
      message: 'Container started successfully'
    });

  } catch (error) {
    console.error('❌ Error starting container:', error);
    res.status(500).json({
      error: 'Failed to start container',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// ROUTE 5 : ARRÊTER UN CONTENEUR
// ============================================

/**
 * POST /api/containers/:id/stop
 *
 * Arrête un conteneur en cours d'exécution
 *
 * Paramètre : id (ID ou nom du conteneur)
 * Réponse : { success: true, message: string }
 */
router.post('/containers/:id/stop', async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;
    console.log(`⏹️  Stopping container: ${containerId}`);

    const container = docker.getContainer(containerId);
    await container.stop();

    console.log(`✅ Container stopped successfully`);

    res.json({
      success: true,
      message: 'Container stopped successfully'
    });

  } catch (error) {
    console.error('❌ Error stopping container:', error);
    res.status(500).json({
      error: 'Failed to stop container',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// ROUTE 6 : REDÉMARRER UN CONTENEUR
// ============================================

/**
 * POST /api/containers/:id/restart
 *
 * Redémarre un conteneur
 *
 * Paramètre : id (ID ou nom du conteneur)
 * Réponse : { success: true, message: string }
 */
router.post('/containers/:id/restart', async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;
    console.log(`🔄 Restarting container: ${containerId}`);

    const container = docker.getContainer(containerId);
    await container.restart();

    console.log(`✅ Container restarted successfully`);

    res.json({
      success: true,
      message: 'Container restarted successfully'
    });

  } catch (error) {
    console.error('❌ Error restarting container:', error);
    res.status(500).json({
      error: 'Failed to restart container',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// ROUTE 7 : EXÉCUTER UNE COMMANDE (BONUS)
// ============================================

/**
 * POST /api/containers/:id/exec
 *
 * Exécute une commande shell dans un conteneur
 *
 * SÉCURITÉ :
 * - Cette route est DANGEREUSE car elle permet d'exécuter du code arbitraire
 * - Elle peut être désactivée avec DISABLE_EXEC=1
 * - À utiliser UNIQUEMENT dans un environnement contrôlé !
 *
 * Body JSON : { command: string }
 * Exemple : { "command": "ls -la /app" }
 *
 * Réponse : { stdout: string, stderr: string, exitCode: number }
 */
router.post('/containers/:id/exec', async (req: Request, res: Response) => {
  // Vérifier si la fonctionnalité est désactivée
  if (EXEC_DISABLED) {
    res.status(403).json({
      error: 'Exec functionality disabled',
      message: 'Container exec is disabled by configuration (DISABLE_EXEC=1)'
    });
    return;
  }

  try {
    const containerId = req.params.id;
    const { command } = req.body;

    // Validation du body
    if (!command || typeof command !== 'string') {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Body must contain a "command" string'
      });
      return;
    }

    console.log(`⚡ Executing command in container ${containerId}: ${command}`);

    const container = docker.getContainer(containerId);

    // Vérifier que le conteneur est running
    const info = await container.inspect();
    if (!info.State.Running) {
      res.status(400).json({
        error: 'Container not running',
        message: 'Cannot execute command in a stopped container'
      });
      return;
    }

    // Créer l'exec
    const exec = await container.exec({
      Cmd: ['sh', '-c', command],  // Exécuter via sh -c
      AttachStdout: true,
      AttachStderr: true
    });

    // Démarrer l'exec
    const stream = await exec.start({ Detach: false });

    // Collecter stdout et stderr
    let stdout = '';
    let stderr = '';

    // Dockerode retourne un stream multiplexé (stdout et stderr mélangés)
    stream.on('data', (chunk: Buffer) => {
      // Le premier octet indique le type (1=stdout, 2=stderr)
      const header = chunk[0];
      const data = chunk.slice(8).toString('utf8'); // Skip les 8 premiers octets (header Docker)

      if (header === 1) {
        stdout += data;
      } else if (header === 2) {
        stderr += data;
      }
    });

    // Attendre la fin de l'exécution
    await new Promise<void>((resolve) => {
      stream.on('end', resolve);
    });

    // Récupérer le code de sortie
    const execInfo = await exec.inspect();
    const exitCode = execInfo.ExitCode || 0;

    console.log(`✅ Command executed (exit code: ${exitCode})`);

    const result: ExecResult = {
      stdout,
      stderr,
      exitCode
    };

    res.json(result);

  } catch (error) {
    console.error('❌ Error executing command:', error);
    res.status(500).json({
      error: 'Failed to execute command',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Export du router pour utilisation dans server.ts
 */
export default router;
