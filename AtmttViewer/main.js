const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
let config;
const configPath = path.join(__dirname, 'config.json');

// Extensions supportées
const SUPPORTED_EXTENSIONS = ['.md', '.txt', '.json', '.yaml', '.yml', '.log'];

/**
 * Charge la configuration depuis config.json
 */
async function loadConfig() {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    config = JSON.parse(data);
    console.log('Configuration chargée:', config);
  } catch (error) {
    console.error('Erreur lors du chargement de la config:', error);
    // Config par défaut
    config = {
      rootDir: path.join(require('os').homedir(), 'Documents', 'Docs')
    };
  }
}

/**
 * Sauvegarde la configuration dans config.json
 */
async function saveConfig() {
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('Configuration sauvegardée:', config);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la config:', error);
  }
}

/**
 * Crée la fenêtre principale
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'build/icon.ico')
  });

  mainWindow.loadFile('src/renderer.html');

  // Ouvre les DevTools en mode dev
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * Liste les fichiers récursivement dans un dossier
 */
async function listFilesRecursive(dir, fileList = []) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Récursion dans les sous-dossiers
        await listFilesRecursive(fullPath, fileList);
      } else {
        const ext = path.extname(file.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          fileList.push({
            name: file.name,
            path: fullPath,
            ext: ext,
            relativePath: path.relative(config.rootDir, fullPath)
          });
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du dossier:', error);
  }

  return fileList;
}

// ===== IPC HANDLERS =====

/**
 * Récupère la configuration actuelle
 */
ipcMain.handle('get-config', async () => {
  return config;
});

/**
 * Liste tous les fichiers dans le rootDir
 */
ipcMain.handle('list-files', async () => {
  try {
    const files = await listFilesRecursive(config.rootDir);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Lit le contenu d'un fichier
 */
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Écrit le contenu dans un fichier
 */
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Ouvre un dialogue pour choisir un dossier
 */
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    config.rootDir = result.filePaths[0];
    await saveConfig();
    return { success: true, rootDir: config.rootDir };
  }

  return { success: false };
});

// ===== APPLICATION LIFECYCLE =====

app.whenReady().then(async () => {
  await loadConfig();
  createWindow();

  // Si un fichier est passé en argument
  const args = process.argv.slice(1);
  const fileArg = args.find(arg => !arg.startsWith('-') && arg !== '.');

  if (fileArg && mainWindow) {
    // Envoie le chemin du fichier au renderer quand il est prêt
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('open-file-arg', fileArg);
    });
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Gestion de l'ouverture de fichier depuis l'explorateur (Windows)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('open-file-arg', filePath);
  }
});
