/**
 * server.ts
 *
 * Point d'entrée principal de l'application Dashboard Docker Automatt.
 *
 * Ce serveur Express :
 * - Sert les pages web avec le moteur de template EJS
 * - Expose une API REST pour gérer les conteneurs Docker
 * - Protège l'accès avec un système d'authentification optionnel
 * - Sert les fichiers statiques (CSS, images, etc.)
 *
 * ARCHITECTURE :
 * - Express : Framework web Node.js
 * - EJS : Moteur de templates pour générer du HTML dynamique
 * - Dockerode : Client Docker pour communiquer avec le daemon Docker
 * - TypeScript : Pour la sécurité des types et une meilleure DX
 *
 * DÉMARRAGE :
 * - Dev : npm run dev (avec nodemon + ts-node)
 * - Prod : npm run build && npm start
 */

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import docker from './dockerClient';
import { authMiddleware } from './middlewares/auth';
import containersRouter from './routes/containers';

/**
 * Configuration du serveur
 */
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Création de l'application Express
 */
const app = express();

// ============================================
// CONFIGURATION DES MIDDLEWARES
// ============================================

/**
 * Body Parser : Pour parser le JSON dans les requêtes POST
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Configuration du moteur de templates EJS
 *
 * EJS permet de générer du HTML dynamique côté serveur.
 * Les fichiers .ejs sont dans le dossier src/views/
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Servir les fichiers statiques (CSS, images, JS client-side)
 *
 * Les fichiers dans public/ seront accessibles directement
 * Exemple : public/css/style.css → http://localhost:8080/css/style.css
 */
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Logger simple : affiche chaque requête dans la console
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/**
 * Middleware d'authentification global
 *
 * Appliqué à TOUTES les routes (web + API)
 * Si DASHBOARD_BASIC_AUTH_TOKEN est défini, vérifie le token
 * Sinon, laisse passer (mode dev)
 */
app.use(authMiddleware);

// ============================================
// ROUTES WEB (PAGES HTML)
// ============================================

/**
 * Route : GET /
 *
 * Page d'accueil : liste tous les conteneurs Docker
 *
 * Rendu : views/index.ejs
 */
app.get('/', async (req: Request, res: Response) => {
  try {
    // Récupérer tous les conteneurs
    const containers = await docker.listContainers({ all: true });

    // Formater les données pour l'affichage
    const formatted = containers.map((container: any) => ({
      id: container.Id,
      shortId: container.Id.substring(0, 12),
      name: container.Names[0].replace(/^\//, ''),
      image: container.Image,
      state: container.State,
      status: container.Status,
      ports: container.Ports,
      created: new Date(container.Created * 1000).toLocaleString('fr-FR')
    }));

    // Render la vue index.ejs avec les données
    res.render('index', {
      title: 'Dashboard Docker Automatt',
      containers: formatted
    });

  } catch (error) {
    console.error('Error loading containers:', error);
    res.status(500).render('error', {
      title: 'Erreur',
      error: 'Impossible de récupérer les conteneurs Docker',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * Route : GET /container/:id
 *
 * Page de détail d'un conteneur spécifique
 *
 * Paramètre : id (ID ou nom du conteneur)
 * Rendu : views/container.ejs
 */
app.get('/container/:id', async (req: Request, res: Response) => {
  try {
    const containerId = req.params.id;

    // Récupérer le conteneur
    const container = docker.getContainer(containerId);
    const info = await container.inspect();

    // Récupérer les logs (100 dernières lignes)
    const logsBuffer = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      timestamps: true
    });

    const logs = logsBuffer.toString('utf8');

    // Formater les données
    const data = {
      id: info.Id,
      shortId: info.Id.substring(0, 12),
      name: info.Name.replace(/^\//, ''),
      image: info.Config.Image,
      state: info.State,
      created: new Date(info.Created).toLocaleString('fr-FR'),
      config: info.Config,
      hostConfig: info.HostConfig,
      networkSettings: info.NetworkSettings,
      mounts: info.Mounts,
      logs: logs,
      execDisabled: process.env.DISABLE_EXEC === '1'
    };

    // Render la vue container.ejs
    res.render('container', {
      title: `Conteneur: ${data.name}`,
      container: data
    });

  } catch (error) {
    console.error('Error loading container:', error);
    res.status(500).render('error', {
      title: 'Erreur',
      error: 'Impossible de récupérer les détails du conteneur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ============================================
// ROUTES API (JSON)
// ============================================

/**
 * Montage du router API containers
 *
 * Toutes les routes définies dans routes/containers.ts
 * seront accessibles sous /api
 *
 * Exemples :
 * - GET  /api/containers
 * - POST /api/containers/:id/start
 * - etc.
 */
app.use('/api', containersRouter);

// ============================================
// ROUTE DE SANTÉ (HEALTH CHECK)
// ============================================

/**
 * Route : GET /health
 *
 * Endpoint de santé pour vérifier que l'API est en ligne
 * Utile pour les orchestrateurs (Kubernetes, Docker Swarm, etc.)
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Vérifier que Docker est accessible
    await docker.ping();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      docker: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      docker: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================
// GESTION DES ERREURS 404
// ============================================

/**
 * Route catch-all pour les 404
 */
app.use((req: Request, res: Response) => {
  res.status(404).render('error', {
    title: 'Page non trouvée',
    error: '404 - Page non trouvée',
    message: `La page ${req.url} n'existe pas`
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

/**
 * Lancement du serveur Express
 */
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Dashboard Docker Automatt');
  console.log('='.repeat(60));
  console.log(`📍 Server running on: http://${HOST}:${PORT}`);
  console.log(`🌐 Access the dashboard at: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🐳 Docker socket: ${process.env.DOCKER_SOCKET || '/var/run/docker.sock'}`);

  if (process.env.DASHBOARD_BASIC_AUTH_TOKEN) {
    console.log(`🔐 Authentication: ENABLED`);
  } else {
    console.log(`⚠️  Authentication: DISABLED (dev mode)`);
  }

  if (process.env.DISABLE_EXEC === '1') {
    console.log(`🔒 Container exec: DISABLED`);
  } else {
    console.log(`⚠️  Container exec: ENABLED (use with caution!)`);
  }

  console.log('='.repeat(60) + '\n');
});

/**
 * Gestion des erreurs non catchées
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
