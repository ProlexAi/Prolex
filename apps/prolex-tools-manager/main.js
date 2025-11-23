const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'build', 'icon.ico')
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Open DevTools in development mode
  if (process.argv.includes('--dev') || process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// Get list of all tools
ipcMain.handle('get-tools', async () => {
  const appsDir = path.join(__dirname, '..');
  const toolsDir = path.join(__dirname, '..', '..', 'tools');

  const tools = [
    {
      id: 'atmtt-viewer',
      name: 'AtmttViewer',
      category: 'app',
      description: 'Visualiseur et éditeur de fichiers texte et Markdown',
      path: path.join(appsDir, 'atmtt-viewer'),
      icon: '📝',
      hasNodeModules: false,
      commands: {
        install: 'npm install',
        start: 'npm start',
        build: 'npm run build'
      }
    },
    {
      id: 'automatt-docker-panel',
      name: 'Docker Panel',
      category: 'app',
      description: 'Panneau de contrôle Docker pour Automatt',
      path: path.join(appsDir, 'automatt-docker-panel'),
      icon: '🐳',
      hasNodeModules: false,
      commands: {
        install: 'npm install',
        start: 'npm start',
        build: 'npm run build'
      }
    },
    {
      id: 'prolex-run-logger',
      name: 'Prolex Run Logger',
      category: 'app',
      description: 'Logger centralisé pour Prolex',
      path: path.join(appsDir, 'prolex-run-logger'),
      icon: '📊',
      hasNodeModules: false,
      commands: {
        install: 'npm install',
        start: 'npm start',
        dev: 'npm run dev'
      }
    },
    {
      id: 'prolex-web-scraper',
      name: 'Web Scraper',
      category: 'app',
      description: 'Outil de scraping web pour Prolex',
      path: path.join(appsDir, 'prolex-web-scraper'),
      icon: '🕷️',
      hasNodeModules: false,
      commands: {
        install: 'npm install',
        start: 'npm start',
        dev: 'npm run dev'
      }
    },
    {
      id: 'windows-registry',
      name: 'Windows Registry Tools',
      category: 'tool',
      description: 'Outils pour masquer/restaurer les dossiers par défaut de Windows',
      path: path.join(toolsDir, 'windows-registry'),
      icon: '🪟',
      hasNodeModules: false,
      commands: {
        hide: 'hide-default-folders.reg',
        restore: 'restore-default-folders.reg',
        docs: 'README.md'
      }
    },
    {
      id: 'filter-workflows',
      name: 'Filter Workflows',
      category: 'tool',
      description: 'Script Python pour filtrer les workflows n8n',
      path: toolsDir,
      icon: '🔧',
      hasNodeModules: false,
      commands: {
        run: 'python filter_workflows.py'
      }
    }
  ];

  // Check if node_modules exists for each tool
  for (const tool of tools) {
    if (tool.commands.install) {
      try {
        await fs.access(path.join(tool.path, 'node_modules'));
        tool.hasNodeModules = true;
      } catch {
        tool.hasNodeModules = false;
      }
    }
  }

  return tools;
});

// Install a tool
ipcMain.handle('install-tool', async (event, toolId, toolPath) => {
  try {
    const { stdout, stderr } = await execPromise('npm install', {
      cwd: toolPath,
      shell: true
    });
    return { success: true, output: stdout + stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Start a tool
ipcMain.handle('start-tool', async (event, toolId, toolPath, command) => {
  try {
    // For Node.js apps, spawn without waiting
    exec(command, {
      cwd: toolPath,
      shell: true,
      detached: true
    });
    return { success: true, message: `${toolId} lancé` };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open tool directory
ipcMain.handle('open-directory', async (event, dirPath) => {
  try {
    await shell.openPath(dirPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open file
ipcMain.handle('open-file', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Execute registry file
ipcMain.handle('execute-registry', async (event, regFilePath) => {
  try {
    // On Windows, .reg files can be executed directly
    await shell.openPath(regFilePath);
    return { success: true, message: 'Fichier .reg ouvert. Cliquez sur "Oui" pour appliquer les modifications.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get tool status
ipcMain.handle('get-tool-status', async (event, toolPath) => {
  try {
    const packageJsonPath = path.join(toolPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    const hasNodeModules = await fs.access(path.join(toolPath, 'node_modules'))
      .then(() => true)
      .catch(() => false);

    return {
      success: true,
      version: packageJson.version,
      hasNodeModules,
      scripts: packageJson.scripts || {}
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
