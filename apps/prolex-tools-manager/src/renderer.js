const { ipcRenderer } = require('electron');

let allTools = [];
let currentCategory = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadTools();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', async () => {
        await loadTools();
        updateStatus('Liste des outils actualisée', 'success');
    });

    // Install all button
    document.getElementById('install-all-btn').addEventListener('click', async () => {
        await installAllTools();
    });

    // Category tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter tools
            currentCategory = tab.dataset.category;
            filterTools(currentCategory);
        });
    });
}

// Load tools from main process
async function loadTools() {
    try {
        updateStatus('Chargement des outils...', 'info');
        allTools = await ipcRenderer.invoke('get-tools');
        renderTools();
        updateStats();
        updateStatus('Prêt', 'success');
    } catch (error) {
        console.error('Error loading tools:', error);
        updateStatus(`Erreur: ${error.message}`, 'error');
    }
}

// Render tools in the grid
function renderTools() {
    const grid = document.getElementById('tools-grid');
    grid.innerHTML = '';

    allTools.forEach(tool => {
        const card = createToolCard(tool);
        grid.appendChild(card);
    });

    filterTools(currentCategory);
}

// Create tool card element
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.category = tool.category;
    card.dataset.id = tool.id;

    const statusClass = tool.hasNodeModules ? 'installed' : 'not-installed';
    const statusText = tool.hasNodeModules ? 'Installé' : 'Non installé';

    card.innerHTML = `
        <div class="tool-header">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-info">
                <div class="tool-name">${tool.name}</div>
                <span class="tool-category">${tool.category}</span>
            </div>
        </div>
        <div class="tool-description">${tool.description}</div>
        ${tool.commands.install ? `
            <div class="tool-status">
                <span class="status-dot ${statusClass}"></span>
                <span>${statusText}</span>
            </div>
        ` : ''}
        <div class="tool-actions">
            ${createActionButtons(tool)}
        </div>
    `;

    return card;
}

// Create action buttons for a tool
function createActionButtons(tool) {
    let buttons = '';

    // Install button (for Node.js apps)
    if (tool.commands.install && !tool.hasNodeModules) {
        buttons += `
            <button class="btn btn-primary btn-small" onclick="installTool('${tool.id}', '${tool.path}')">
                <span>📦</span> Installer
            </button>
        `;
    }

    // Start button
    if (tool.commands.start) {
        const disabled = !tool.hasNodeModules ? 'disabled' : '';
        buttons += `
            <button class="btn btn-success btn-small" onclick="startTool('${tool.id}', '${tool.path}', '${tool.commands.start}')" ${disabled}>
                <span>▶️</span> Démarrer
            </button>
        `;
    }

    // Dev button
    if (tool.commands.dev) {
        const disabled = !tool.hasNodeModules ? 'disabled' : '';
        buttons += `
            <button class="btn btn-warning btn-small" onclick="startTool('${tool.id}', '${tool.path}', '${tool.commands.dev}')" ${disabled}>
                <span>🔧</span> Dev
            </button>
        `;
    }

    // Build button
    if (tool.commands.build) {
        const disabled = !tool.hasNodeModules ? 'disabled' : '';
        buttons += `
            <button class="btn btn-secondary btn-small" onclick="startTool('${tool.id}', '${tool.path}', '${tool.commands.build}')" ${disabled}>
                <span>🏗️</span> Build
            </button>
        `;
    }

    // Registry tools buttons
    if (tool.commands.hide) {
        buttons += `
            <button class="btn btn-warning btn-small" onclick="executeRegistry('${tool.path}', '${tool.commands.hide}')">
                <span>🙈</span> Masquer dossiers
            </button>
        `;
    }

    if (tool.commands.restore) {
        buttons += `
            <button class="btn btn-success btn-small" onclick="executeRegistry('${tool.path}', '${tool.commands.restore}')">
                <span>👁️</span> Restaurer dossiers
            </button>
        `;
    }

    // Python run button
    if (tool.commands.run) {
        buttons += `
            <button class="btn btn-primary btn-small" onclick="startTool('${tool.id}', '${tool.path}', '${tool.commands.run}')">
                <span>▶️</span> Exécuter
            </button>
        `;
    }

    // Open directory button
    buttons += `
        <button class="btn btn-secondary btn-small" onclick="openDirectory('${tool.path}')">
            <span>📁</span> Ouvrir
        </button>
    `;

    // Docs button
    if (tool.commands.docs) {
        buttons += `
            <button class="btn btn-secondary btn-small" onclick="openFile('${tool.path}', '${tool.commands.docs}')">
                <span>📖</span> Docs
            </button>
        `;
    }

    return buttons;
}

// Filter tools by category
function filterTools(category) {
    document.querySelectorAll('.tool-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Update statistics
function updateStats() {
    const apps = allTools.filter(t => t.category === 'app').length;
    const tools = allTools.filter(t => t.category === 'tool').length;
    const installed = allTools.filter(t => t.hasNodeModules).length;

    document.getElementById('stats-apps').textContent = `Apps: ${apps}`;
    document.getElementById('stats-tools').textContent = `Outils: ${tools}`;
    document.getElementById('stats-installed').textContent = `Installés: ${installed}`;
}

// Update status message
function updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;

    statusEl.classList.remove('text-success', 'text-warning', 'text-error');
    if (type === 'success') statusEl.classList.add('text-success');
    else if (type === 'error') statusEl.classList.add('text-error');
    else if (type === 'warning') statusEl.classList.add('text-warning');
}

// Install a tool
window.installTool = async (toolId, toolPath) => {
    try {
        updateStatus(`Installation de ${toolId}...`, 'info');
        const result = await ipcRenderer.invoke('install-tool', toolId, toolPath);

        if (result.success) {
            updateStatus(`${toolId} installé avec succès`, 'success');
            await loadTools(); // Reload to update status
        } else {
            updateStatus(`Erreur lors de l'installation: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Erreur: ${error.message}`, 'error');
    }
};

// Install all tools
async function installAllTools() {
    const toolsToInstall = allTools.filter(t => t.commands.install && !t.hasNodeModules);

    if (toolsToInstall.length === 0) {
        updateStatus('Tous les outils sont déjà installés', 'success');
        return;
    }

    updateStatus(`Installation de ${toolsToInstall.length} outils...`, 'info');

    for (const tool of toolsToInstall) {
        await installTool(tool.id, tool.path);
    }

    updateStatus('Installation terminée', 'success');
}

// Start a tool
window.startTool = async (toolId, toolPath, command) => {
    try {
        updateStatus(`Démarrage de ${toolId}...`, 'info');
        const result = await ipcRenderer.invoke('start-tool', toolId, toolPath, command);

        if (result.success) {
            updateStatus(result.message, 'success');
        } else {
            updateStatus(`Erreur: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Erreur: ${error.message}`, 'error');
    }
};

// Open directory
window.openDirectory = async (dirPath) => {
    try {
        const result = await ipcRenderer.invoke('open-directory', dirPath);
        if (!result.success) {
            updateStatus(`Erreur: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Erreur: ${error.message}`, 'error');
    }
};

// Open file
window.openFile = async (dirPath, fileName) => {
    try {
        const path = require('path');
        const filePath = path.join(dirPath, fileName);
        const result = await ipcRenderer.invoke('open-file', filePath);
        if (!result.success) {
            updateStatus(`Erreur: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Erreur: ${error.message}`, 'error');
    }
};

// Execute registry file
window.executeRegistry = async (dirPath, fileName) => {
    try {
        const path = require('path');
        const filePath = path.join(dirPath, fileName);
        updateStatus(`Ouverture de ${fileName}...`, 'info');
        const result = await ipcRenderer.invoke('execute-registry', filePath);

        if (result.success) {
            updateStatus(result.message, 'success');
        } else {
            updateStatus(`Erreur: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Erreur: ${error.message}`, 'error');
    }
};
