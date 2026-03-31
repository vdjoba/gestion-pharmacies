const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const devServerUrl = process.env.VITE_DEV_SERVER_URL;
let mainWindow = null;

function sendUpdateStatus(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', message);
  }
}

function configureAutoUpdates() {
  if (!app.isPackaged) {
    sendUpdateStatus('Mode developpement: mises a jour automatiques desactivees.');
    return;
  }

  autoUpdater.autoDownload = false;

  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus('Verification des mises a jour...');
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus(`Mise a jour disponible: ${info.version}`);
  });

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus('Application a jour.');
  });

  autoUpdater.on('error', (error) => {
    sendUpdateStatus(`Mise a jour indisponible: ${error == null ? 'erreur inconnue' : error.message}`);
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus(`Telechargement mise a jour: ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on('update-downloaded', () => {
    sendUpdateStatus('Mise a jour telechargee. Redemarrage requis.');
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#f8fafc',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (devServerUrl) {
    mainWindow.loadURL(`${devServerUrl}#/admin/login`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[electron] renderer loaded');
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[electron] did-fail-load', { errorCode, errorDescription, validatedURL });
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log('[renderer console]', { level, message, line, sourceId });
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[electron] render-process-gone', details);
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    hash: '/admin/login',
  });

  mainWindow.webContents.openDevTools({ mode: 'detach' });
}

ipcMain.handle('check-for-updates', async () => {
  if (!app.isPackaged) {
    sendUpdateStatus('Mode developpement: aucune verification distante.');
    return { skipped: true };
  }

  const result = await autoUpdater.checkForUpdates();
  return {
    version: result?.updateInfo?.version ?? null,
  };
});

ipcMain.handle('install-downloaded-update', () => {
  if (app.isPackaged) {
    autoUpdater.quitAndInstall();
  }
});

app.whenReady().then(() => {
  createWindow();
  configureAutoUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
